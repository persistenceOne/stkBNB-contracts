// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./interfaces/IDelegationManager.sol";
import "./interfaces/IAddressStore.sol";
import "./interfaces/IStakePoolBot.sol";
import "./interfaces/IStakeHub.sol";
import "./interfaces/IStakeCredit.sol";

contract DelegationManager is IDelegationManager {
    /**
     *
     * CONSTANTS
     *
     */
    address private constant _STAKE_HUB = 0x0000000000000000000000000000000000002002;

    /**
     *
     * STATE VARIABLES
     *
     */

    /**
     * @dev _addressStore: The Address Store. Used to fetch addresses of the other contracts in the system.
     */
    IAddressStore private _addressStore;

    /**
     *
     * ERRORS
     *
     */
    error UnauthorizedSender();
    error TransferToStakePoolFailed();
    error TransferToStakeHubFailed();
    error InvalidSharesAmount();
    error RedelegationFailed(address srcValidator, address dstValidator, uint256 shares);
    error InsufficientDelegationAmount(uint256 delegationAmount);
    error UndelegationFailed(address validator, uint256 shares);
    error ClaimBatchFailed();

    /**
     *
     * MODIFIERS
     *
     */
    modifier onlyStakePool() {
        _isStakePool();
        _;
    }

    /**
     *
     * MODIFIERS FUNCTIONS
     *
     */
    function _isStakePool() private view {
        address stakePool = getStakePool();
        if (msg.sender != stakePool) {
            revert UnauthorizedSender();
        }
    }

    /**
     *
     * CONTRACT LOGIC
     *
     */
    constructor(IAddressStore addressStore_) {
        _addressStore = addressStore_;
    }

    /**
     * @dev Called by the TokenHub contract when undelegated funds are transferred cross-chain by
     * bot from BBC staking address to this contract on BSC. At the same time, can also be used by
     * anyone to send any amount to this contract, which can be both a use as well as a misuse.
     * So, should be handled properly.
     */
    receive() external payable override {
        emit Received(msg.sender, msg.value);
    }

    /**
     * @dev Called by the StakePool contract to delegate BNB deposits to BSC Native Staking Module.
     * Sends deposits to StakeHub Contract
     *
     * Requirements:
     * - The caller must be the StakePool contract.
     *
     * @return The current deposits, all of which it will be sending to the StakeHub.
     */
    function delegateDepositedBNB(address[] calldata operators, uint256[] calldata bnbAmounts)
        external
        payable
        override
        onlyStakePool
        returns (bool)
    {
        address stakePool = getStakePool();

        // Checks if the BNB Deposits is received in this contract
        if (msg.value >= IStakePoolBot(stakePool).getDeposits()) {
            for (uint256 i = 0; i < operators.length; i++) {
                address operator = operators[i];
                uint256 bnbAmount = bnbAmounts[i];

                // Delegation Amount must be atleast 1 BNB
                if (bnbAmount < 1 ether) {
                    revert InsufficientDelegationAmount(bnbAmount);
                } else {
                    (bool delegated, /* bytes memory data */ ) = _STAKE_HUB.call{value: bnbAmount}(
                        abi.encodeWithSelector(IStakeHub.delegate.selector, operator, false)
                    );
                    if (!delegated) {
                        revert TransferToStakeHubFailed();
                    }
                }
            }

            return true;
        }

        return false;
    }

    /**
     * @dev Called by the StakePool contract to redelegate BNB from one validator to
     * another validator. StakeHub.redelegate() has some fee associated with it.
     * 0.02 % of redelegation amount to discourage frequent relegation between
     * delegators to chase the highest rewards.
     *
     * Redelegation happens instantly, there is no waiting period
     *
     * Requirements:
     * - The caller must be the StakePool contract.
     *
     */
    function redelegateBnbShares(address srcValidator, address dstValidator, uint256 shares, bool delegateVotePower)
        external
        payable
        override
        onlyStakePool
    {
        uint256 delegatorShares = _getDelegatorShares(srcValidator);
        if (shares == 0 || shares > delegatorShares) {
            revert InvalidSharesAmount();
        }

        // Calls StakeHub.redelegate() on BSC Native Staking Module
        (bool redelegated, /* bytes memory data */ ) = _STAKE_HUB.call(
            abi.encodeWithSelector(IStakeHub.redelegate.selector, srcValidator, dstValidator, shares, delegateVotePower)
        );

        if (!redelegated) {
            revert RedelegationFailed(srcValidator, dstValidator, shares);
        }
    }

    /**
     * @dev Called by the StakePool contract to undelegate "bnbToUnbond" BNB from the BSC Native Staking Module
     * Burns Staking Credit and Governance Tokens on the StakeHub Contract Side
     *
     * Requirements:
     * - The caller must be the StakePool contract.
     *
     * @return The undelegation requests will be sent to the StakeHub Contract
     */
    function undelegateBNBtoUnbond(
        address[] calldata operators,
        uint256[] calldata shares,
        uint256[] calldata bnbAmounts
    ) external override onlyStakePool returns (uint256) {
        uint256 totalBNBUnbonding = 0;
        for (uint256 i = 0; i < operators.length; i++) {
            address operator = operators[i];
            uint256 share = shares[i];
            uint256 bnbAmount = bnbAmounts[i];

            (bool undelegated, /* bytes memory data */ ) =
                _STAKE_HUB.call(abi.encodeWithSelector(IStakeHub.undelegate.selector, operator, share));

            if (!undelegated) {
                revert UndelegationFailed(operator, share);
            } else {
                totalBNBUnbonding += bnbAmount;
            }
        }

        return totalBNBUnbonding;
    }

    /**
     * @dev Called by the StakePool contract to withdraw the undelegated funds. It sends at max
     * the bnbUnbonding to StakePool.
     *
     * Requirements:
     * - The caller must be the StakePool contract.
     *
     * @return The amount it sent to the StakePool.
     */
    function claimUnbondedBNB(address[] calldata operators, uint256[] calldata requestNumbers)
        external
        override
        onlyStakePool
        returns (uint256)
    {
        address stakePool = getStakePool();

        // Calls StakeHub.claimBatch() on BSC Native Staking Module
        (bool claimed, /* bytes memory data */ ) =
            _STAKE_HUB.call(abi.encodeWithSelector(IStakeHub.claimBatch.selector, operators, requestNumbers));

        if (!claimed) {
            revert ClaimBatchFailed();
        }

        // the current balance can be more than what the StakePool contract needs based on bnbUnbonding. It might happen
        // if someone makes an unexpected donation to this contract. The person making the donation could be us, trying
        // to payout the fee losses to the protocol (a legit use-case). It could also be a malicious actor trying to
        // play with the protocol (a misuse-case). In any case, we will only send the needed amount to the StakePool
        // contract instead of forwarding all the current balance. This way, we can pay fee losses to the protocol in
        // advance, without hampering protocol's security, and at the same time, be free of worries about claims failing
        // even in the rarest of the rare scenarios.
        uint256 amountToSend = address(this).balance;
        uint256 bnbUnbonding = IStakePoolBot(stakePool).bnbUnbonding();
        if (amountToSend > bnbUnbonding) {
            amountToSend = bnbUnbonding;
        }
        // can't use address.transfer() here as it limits the gas to 2300, resulting in failure due to gas exhaustion.
        (bool sent, /*memory data*/ ) = stakePool.call{value: amountToSend}("");
        if (!sent) {
            revert TransferToStakePoolFailed();
        }

        return amountToSend;
    }

    /**
     * @return the StakePool Address
     */
    function getStakePool() public view returns (address) {
        return _addressStore.getStakePool();
    }

    /**
     * @return the address store
     */
    function addressStore() external view returns (IAddressStore) {
        return _addressStore;
    }

    /**
     * @return delegatorShares The delegators Shares
     */
    function _getDelegatorShares(address _operator) internal view returns (uint256 delegatorShares) {
        address validatorCredit = IStakeHub(_STAKE_HUB).getValidatorCreditContract(_operator);
        delegatorShares = IStakeCredit(validatorCredit).balanceOf(address(this));
    }
}
