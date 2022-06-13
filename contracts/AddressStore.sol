// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAddressStore.sol";

contract AddressStore is IAddressStore, Ownable {
    // Keys for standard contracts in the system
    string public constant STK_BNB = "stkBNB";
    string public constant FEE_VAULT = "FeeVault";
    string public constant STAKE_POOL = "StakePool";
    string public constant UNDELEGATION_HOLDER = "UndelegationHolder";

    // the address store
    mapping(string => address) private _store;

    // emitted when an address is set
    event SetAddress(string indexed key, address value);

    constructor() {} // solhint-disable-line no-empty-blocks

    function setAddr(string memory key, address value) public override onlyOwner {
        _store[key] = value;

        emit SetAddress(key, value);
    }

    function setStkBNB(address addr) external override {
        setAddr(STK_BNB, addr);
    }

    function setFeeVault(address addr) external override {
        setAddr(FEE_VAULT, addr);
    }

    function setStakePool(address addr) external override {
        setAddr(STAKE_POOL, addr);
    }

    function setUndelegationHolder(address addr) external override {
        setAddr(UNDELEGATION_HOLDER, addr);
    }

    function getAddr(string memory key) public view override returns (address) {
        return _store[key];
    }

    function getStkBNB() external view override returns (address) {
        return getAddr(STK_BNB);
    }

    function getFeeVault() external view override returns (address) {
        return getAddr(FEE_VAULT);
    }

    function getStakePool() external view override returns (address) {
        return getAddr(STAKE_POOL);
    }

    function getUndelegationHolder() external view override returns (address) {
        return getAddr(UNDELEGATION_HOLDER);
    }
}
