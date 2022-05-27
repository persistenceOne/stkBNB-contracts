// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

interface IAddressStore {
    function setAddr(string memory key, address value) external;

    function setStkBNB(address addr) external;

    function setStakePool(address addr) external;

    function getAddr(string calldata key) external view returns (address);

    function getStkBNB() external view returns (address);

    function getStakePool() external view returns (address);
}
