// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "./interfaces/IDelegationManager.sol";
import "./interfaces/IAddressStore.sol";
import "./interfaces/IStakePoolBot.sol";
import "./interfaces/IStakeHub.sol";
import "./interfaces/IStakeCredit.sol";

contract DelegationManager is IDelegationManager, Initializable, ContextUpgradeable {
    /**
     *
     * ERRORS
     *
     */
    error Rebalancing_Failed();

    /**
     *
     * EVENTS
     *
     */
    event Rebalancing_Success(address to, uint256 amount);

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
    error StakeAmountMismatch(uint256 value, uint256 stakes);
    error InsufficientDelegationAmount(uint256 delegationAmount);
    error UndelegationFailed(address validator, uint256 shares);
    error ClaimFailed();

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
        if (_msgSender() != _addressStore.getStakePool()) {
            revert UnauthorizedSender();
        }
    }

    /**
     *
     * INIT FUNCTIONS
     *
     */

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(IAddressStore addressStore_) public initializer {
        __DelegationManager_init(addressStore_);
    }

    function __DelegationManager_init(IAddressStore addressStore_) internal onlyInitializing {
        // Need to call initializers for each parent without calling anything twice.
        __Context_init();
        // Finally, initialize this contract.
        __DelegationManager_init_unchained(addressStore_);
    }

    function __DelegationManager_init_unchained(
        IAddressStore addressStore_
    ) internal onlyInitializing {
        // Finally, initialize this contract.
        _addressStore = addressStore_;
    }

    /**
     * @dev Called by the Validator credit contract when undelegated funds are claimed by
     * bot by calling unbondingFinished() on StakePool. At the same time, can also be used by
     * anyone to send any amount to this contract, which can be both a use as well as a misuse.
     * So, should be handled properly.
     */
    receive() external payable override {
        emit Received(_msgSender(), msg.value);
    }

    /**
     *
     * DELEGATE FUNCTIONS
     *
     */

    /**
     * @dev Called by the StakePool contract to delegate BNB deposits to BSC Native Staking Module.
     * Sends deposits to StakeHub Contract
     *
     * Requirements:
     * - The caller must be the StakePool contract.
     *
     * @return The current deposits, all of which it will be sending to the StakeHub.
     */
    function delegateDepositedBNB(
        address[] calldata operators,
        uint256[] calldata bnbAmounts
    ) external payable override onlyStakePool returns (bool) {
        uint256 excessBNB = msg.value;
        uint256 totalStake = _calculateTotal(bnbAmounts);

        // sum(bnbAmounts) from the bot should equal excessBNB
        if (totalStake != excessBNB) {
            revert StakeAmountMismatch(excessBNB, totalStake);
        }

        for (uint256 i = 0; i < operators.length; i++) {
            address operator = operators[i];
            uint256 bnbAmount = bnbAmounts[i];

            (bool delegated /* bytes memory data */, ) = _STAKE_HUB.call{ value: bnbAmount }(
                abi.encodeWithSelector(IStakeHub.delegate.selector, operator, false)
            );
            if (!delegated) {
                revert TransferToStakeHubFailed();
            }
        }

        return true;
    }

    /**
     * @dev Called by the StakePool contract to redelegate BNB from one validator to
     * another validator. StakeHub.redelegate() has some fee associated with it.
     * 0.002 % of redelegation amount to discourage frequent relegation between
     * delegators to chase the highest rewards.
     *
     * Redelegation happens instantly, there is no waiting period
     *
     * Requirements:
     * - The caller must be the StakePool contract.
     */
    function redelegateBnbShares(
        address srcValidator,
        address dstValidator,
        uint256 shares,
        bool delegateVotePower
    ) external payable override onlyStakePool {
        uint256 srcShares = _getShares(srcValidator);
        if (shares == 0 || shares > srcShares) {
            revert InvalidSharesAmount();
        }

        // Calls StakeHub.redelegate() on BSC Native Staking Module
        (bool redelegated /* bytes memory data */, ) = _STAKE_HUB.call(
            abi.encodeWithSelector(
                IStakeHub.redelegate.selector,
                srcValidator,
                dstValidator,
                shares,
                delegateVotePower
            )
        );

        if (!redelegated) {
            revert RedelegationFailed(srcValidator, dstValidator, shares);
        }
    }

    /**
     * @dev Called by the StakePool contract to undelegate "bnbToUnbond" BNB from the BSC Native Staking Module
     * Burns Staking Credit and Governance Tokens on the StakeHub Contract Side and requests initial delegations
     * and rewards earned
     *
     * Requirements:
     * - The caller must be the StakePool contract.
     *
     * @return The undelegation requests will be sent to the StakeHub Contract
     */
    function undelegateBNBtoUnbond(
        address[] calldata operators,
        uint256[] calldata shares,
        uint256[] calldata bnbUnbonds
    ) external override onlyStakePool returns (uint256) {
        uint256 totalBNBUnbonding = 0;
        for (uint256 i = 0; i < operators.length; i++) {
            address operator = operators[i];
            uint256 share = shares[i];
            uint256 bnbUnbond = bnbUnbonds[i];

            (bool undelegated /* bytes memory data */, ) = _STAKE_HUB.call(
                abi.encodeWithSelector(IStakeHub.undelegate.selector, operator, share)
            );

            if (!undelegated) {
                revert UndelegationFailed(operator, share);
            } else {
                totalBNBUnbonding += bnbUnbond;
            }
        }

        return totalBNBUnbonding;
    }

    /**
     * @dev Called by the StakePool contract to withdraw the undelegated funds. It sends at max
     * the bnbUnbonding to StakePool. Funds will be available to claim only after 7 days waiting period
     *
     * Requirements:
     * - The caller must be the StakePool contract.
     */
    function claimUnbondedBNB(address operator) external override onlyStakePool {
        // Calls StakeHub.claimBatch() on BSC Native Staking Module
        (bool claimed /* bytes memory data */, ) = _STAKE_HUB.call(
            //  the request number of the undelegation. 0 means claim all
            abi.encodeWithSelector(IStakeHub.claim.selector, operator, 0)
        );

        if (!claimed) {
            revert ClaimFailed();
        }
    }

    function withdrawClaimedBNB() external override onlyStakePool returns (uint256) {
        // the current balance can be more than what the StakePool contract needs based on bnbUnbonding. It might happen
        // if someone makes an unexpected donation to this contract. The person making the donation could be us, trying
        // to payout the fee losses to the protocol (a legit use-case). It could also be a malicious actor trying to
        // play with the protocol (a misuse-case). In any case, we will only send the needed amount to the StakePool
        // contract instead of forwarding all the current balance. This way, we can pay fee losses to the protocol in
        // advance, without hampering protocol's security, and at the same time, be free of worries about claims failing
        // even in the rarest of the rare scenarios.
        uint256 amountToSend = address(this).balance;
        uint256 bnbUnbonding = IStakePoolBot(_msgSender()).bnbUnbonding();
        if (amountToSend > bnbUnbonding) {
            amountToSend = bnbUnbonding;
        }
        // can't use address.transfer() here as it limits the gas to 2300, resulting in failure due to gas exhaustion.
        (bool sent /*memory data*/, ) = _msgSender().call{ value: amountToSend }("");
        if (!sent) {
            revert TransferToStakePoolFailed();
        }

        return amountToSend;
    }

    /**
     * @notice Transfers all BNB from DelegationManager to StakePool
     * @dev This function is called by StakePool's triggerRebalance() to recover locked BNB.
     * The function transfers the entire balance of this contract to StakePool.
     *
     * @dev Emits a {Rebalancing_Success} event with:
     * - to: address of the StakePool contract
     * - amount: total BNB transferred
     *
     * Requirements:
     * - The caller must be the StakePool contract (enforced by onlyStakePool modifier)
     * - The BNB transfer must succeed
     *
     * @return lockedBNB The amount of BNB transferred to StakePool
     */
    function rebalanceBNB() external override onlyStakePool returns (uint256) {
        uint256 lockedBNB = address(this).balance;

        (bool success, ) = _msgSender().call{ value: lockedBNB }("");

        if (!success) revert Rebalancing_Failed();

        emit Rebalancing_Success(_msgSender(), lockedBNB);

        return lockedBNB;
    }

    /**
     *
     * INTERNAL FUNCTIONS
     *
     */

    /**
     * @return shares The Shares of a Validator
     */
    function _getShares(address _operator) internal view returns (uint256 shares) {
        address validatorCredit = IStakeHub(_STAKE_HUB).getValidatorCreditContract(_operator);
        shares = IStakeCredit(validatorCredit).balanceOf(address(this));
    }

    /**
     * @return sum The Sum of the uint256 Array
     */
    function _calculateTotal(uint256[] calldata values) internal pure returns (uint256) {
        uint256 totalSum;
        for (uint256 i = 0; i < values.length; ++i) {
            totalSum += values[i];
        }

        return totalSum;
    }
}
