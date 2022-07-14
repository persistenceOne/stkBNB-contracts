// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./interfaces/IUndelegationHolder.sol";
import "./interfaces/IAddressStore.sol";
import "./interfaces/IStakePoolBot.sol";

contract UndelegationHolder is IUndelegationHolder {
    /*********************
     * STATE VARIABLES
     ********************/

    /**
     * @dev addressStore: The Address Store. Used to fetch addresses of the other contracts in the system.
     */
    IAddressStore public addressStore;

    /*********************
     * ERRORS
     ********************/
    error UnauthorizedSender();
    error TransferToStakePoolFailed();

    /*********************
     * CONTRACT LOGIC
     ********************/

    constructor(IAddressStore _addressStore) {
        addressStore = _addressStore;
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
     * @dev Called by the StakePool contract to withdraw the undelegated funds. It sends at max
     * the bnbUnbonding to StakePool.
     *
     * Requirements:
     * - The caller must be the StakePool contract.
     *
     * @return The amount it sent to the StakePool.
     */
    function withdrawUnbondedBNB() external override returns (uint256) {
        address stakePool = addressStore.getStakePool();
        if (msg.sender != stakePool) {
            revert UnauthorizedSender();
        }

        // the current balance can be more than what the StakePool contract needs based on bnbUnbonding. It might happen
        // if someone makes an unexpected donation to this contract. The person making the donation could be us, trying
        // to payout the fee losses to the protocol (a legit use-case). It could also be a malicious actor trying to
        // play with the protocol (a misuse-case). In any case, we will only send the needed amount to the StakePool
        // contract instead of forwarding all the current balance. This way, we can pay fee losses to the protocol in
        // advance, without hampering protocol's security, and at the same time, be free of worries about claims failing
        // even in the rarest of the rare scenarios.
        uint256 amountToSend = address(this).balance;
        if (amountToSend > IStakePoolBot(stakePool).bnbUnbonding()) {
            amountToSend = IStakePoolBot(stakePool).bnbUnbonding();
        }
        // can't use address.transfer() here as it limits the gas to 2300, resulting in failure due to gas exhaustion.
        (
            bool sent, /*memory data*/

        ) = stakePool.call{ value: amountToSend }("");
        if (!sent) {
            revert TransferToStakePoolFailed();
        }

        return amountToSend;
    }
}
