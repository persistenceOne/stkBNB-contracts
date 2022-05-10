
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Permissions interface
/// @author Vedant Dalvi
interface IPermissions {

    // ----------- Governor only state changing functions -----------

    function createRole(bytes32 role, bytes32 adminRole) external;

    function grantGovernor(address governor) external;

    function grantMinter(address minter) external;

    function grantBurner(address burner) external;

    function revokeGovernor(address governor) external;

    function revokeMinter(address minter) external;

    function revokeBurner(address burner) external;


    // ----------- Getters -----------

    function isMinter(address _address) external view returns (bool);

    function isGovernor(address _address) external view returns (bool);

    function isBurner(address _address) external view returns (bool);

}
