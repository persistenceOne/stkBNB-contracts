// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

abstract contract TokenManager {
    uint256 public mirrorFee;
    uint256 public syncFee;

    function mirror(address bep20Addr, uint64 expireTime) payable virtual public returns (bool);
    function sync(address bep20Addr, uint64 expireTime) payable virtual public returns (bool);
}
