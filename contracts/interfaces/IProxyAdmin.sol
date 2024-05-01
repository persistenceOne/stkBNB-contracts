// SPDX-License-Identifier: MIT
// Copied from: OpenZeppelin Contracts v4.6.0 (proxy/transparent/ProxyAdmin.sol)

pragma solidity ^0.8.7;

import "./IOwnable.sol";
// import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
/**
 * @dev This is an auxiliary contract meant to be assigned as the admin of a {TransparentUpgradeableProxy}. For an
 * explanation of why you would want to use this see the documentation for {TransparentUpgradeableProxy}.
 */

interface IProxyAdmin is IOwnable {
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

    /**
     * @dev Upgrades `proxy` to `implementation`
     * See {TransparentUpgradeableProxy-_dispatchUpgradeToAndCall}.
     *
     * Requirements:
     *
     * - This contract must be the admin of `proxy`.
     */
    function upgrade(address proxy, address implementation) external;

    /**
     * @dev Upgrades `proxy` to `implementation` and calls a function on the new implementation.
     * See {TransparentUpgradeableProxy-_dispatchUpgradeToAndCall}.
     *
     * Requirements:
     *
     * - This contract must be the admin of `proxy`.
     * - If `data` is empty, `msg.value` must be zero.
     */
    function upgradeAndCall(
        address proxy,
        address implementation,
        bytes memory data
    ) external payable;
}
