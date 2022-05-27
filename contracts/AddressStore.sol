// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAddressStore.sol";

contract AddressStore is IAddressStore, Ownable {
    // Keys for standard contracts in the system
    string public constant STK_BNB = "stkBNB";
    string public constant STAKE_POOL = "StakePool";

    // the address store
    mapping(string => address) private _store;

    event SetAddress(string indexed key, address value); // emitted when an address is set

    constructor() {} // solhint-disable-line no-empty-blocks

    function setAddr(string memory key, address value) public override onlyOwner {
        _store[key] = value;

        emit SetAddress(key, value);
    }

    function setStkBNB(address addr) external override {
        setAddr(STK_BNB, addr);
    }


    function setStakePool(address addr) external override {
        setAddr(STAKE_POOL, addr);
    }

    function getAddr(string calldata key) external view override returns (address) {
        return _store[key];
    }

    function getStkBNB() external view override returns (address) {
        return _store[STK_BNB];
    }


    function getStakePool() external view override returns (address) {
        return _store[STAKE_POOL];
    }
}
