// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./interfaces/IUndelegationHolder.sol";
import "./interfaces/IAddressStore.sol";

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

    /*********************
     * CONTRACT LOGIC
     ********************/

    constructor(IAddressStore _addressStore) {
        addressStore = _addressStore;
    }

    /**
     * @dev Called by the TokenHub contract when undelegated funds are transferred cross-chain by
     * bot from BC staking address to this contract on BSC.
     */
    receive() external payable override {
        emit Received(msg.sender, msg.value);
    }

    /**
     * @dev Called by the StakePool contract to withdraw the undelegated funds. It sends all its
     * funds to StakePool.
     *
     * Requirements:
     * - The caller must be the StakePool contract.
     *
     * @return The current balance, all of which it will be sending to the StakePool.
     */
    function withdrawUnbondedBNB() external override returns (uint256) {
        address stakePool = addressStore.getStakePool();
        if (msg.sender != stakePool) {
            revert UnauthorizedSender();
        }

        uint256 balance = address(this).balance;
        payable(stakePool).transfer(balance);

        return balance;
    }
}
