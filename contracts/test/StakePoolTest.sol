// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "../StakePool.sol";

/**
 * This is not production code. It is used for testing the main contract.
 */
contract StakePoolTest is StakePool {
    function fillClaims(uint256 num) public {
        for (uint256 i = 0; i < num; i++) {
            claimReqs[msg.sender].push(ClaimRequest(0, block.timestamp - config.cooldownPeriod));
        }
    }
}
