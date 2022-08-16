// SPDX-License-Identifier: MIT
// Copied from: OpenZeppelin Contracts v4.6.0 (proxy/transparent/ProxyAdmin.sol)

pragma solidity ^0.8.7;

import "./IOwnable.sol";

/**
 * @dev This is an auxiliary contract meant to be assigned as the admin of a {TransparentUpgradeableProxy}. For an
 * explanation of why you would want to use this see the documentation for {TransparentUpgradeableProxy}.
 */
interface IProxyAdmin is IOwnable{
    /**
     * @dev Returns the current implementation of `proxy`.
     *
     * Requirements:
     *
     * - This contract must be the admin of `proxy`.
     */
    function getProxyImplementation(address proxy) external view returns (address);

    /**
     * @dev Returns the current admin of `proxy`.
     *
     * Requirements:
     *
     * - This contract must be the admin of `proxy`.
     */
    function getProxyAdmin(address proxy) external view returns (address);
}