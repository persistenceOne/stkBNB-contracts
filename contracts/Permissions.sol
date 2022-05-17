//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";


abstract contract Permissions is AccessControl {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");


    constructor(){
        

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);


    }

    modifier onlyAdmin() {
        require(
            isAdmin(msg.sender),
            "Permissions: Caller is not an Admin"
        );
        _;
    }

    modifier onlyMinter() {
        require(isMinter(msg.sender), "Permissions: Caller is not a minter");
        _;
    }

    modifier onlyBurner() {
        require(isBurner(msg.sender), "Permissions: Caller is not a burner");
        _;
    }



    /// @notice creates a new role to be maintained
    /// @param role the new role id
    /// @param adminRole the admin role id for `role`
    /// @dev can also be used to update admin of existing role
    function createRole(bytes32 role, bytes32 adminRole)
        public
        onlyAdmin
    {
        _setRoleAdmin(role, adminRole);
    }

    /// @notice grants minter role to address
    /// @param minter new minter
    function grantMinter(address minter) public onlyAdmin {
        grantRole(MINTER_ROLE, minter);
    }

    /// @notice grants burner role to address
    /// @param burner new burner
    function grantBurner(address burner) public onlyAdmin {
        grantRole(BURNER_ROLE, burner);
    }




    /// @notice grants governor role to address
    /// @param governor new governor
    // function grantGovernor(address governor) public override onlyGovernor {
    //     grantRole(GOVERN_ROLE, governor);
    // }

    /// @notice revokes minter role from address
    /// @param minter ex minter
    function revokeMinter(address minter) public onlyAdmin {
        revokeRole(MINTER_ROLE, minter);
    }

    /// @notice revokes burner role from address
    /// @param burner ex burner
    function revokeBurner(address burner) public onlyAdmin {
        revokeRole(BURNER_ROLE, burner);
    }

 


    /// @notice revokes governor role from address
    /// @param governor ex governor
    // function revokeGovernor(address governor) public override onlyGovernor {
    //     revokeRole(GOVERN_ROLE, governor);
    // }

    /// @notice checks if address is a minter
    /// @param _address address to check
    /// @return true _address is a minter
    function isMinter(address _address) public view returns (bool) {
        return hasRole(MINTER_ROLE, _address);
    }

    /// @notice checks if address is a burner
    /// @param _address address to check
    /// @return true _address is a burner
    function isBurner(address _address) public view returns (bool) {
        return hasRole(BURNER_ROLE, _address);
    }

    /// @notice checks if address is a Admin
    /// @param _address address to check
    /// @return true _address is a Admin
    // // only virtual for testing mock override
    function isAdmin(address _address)
        public
        view
        virtual
        returns (bool)
    {
        return hasRole(DEFAULT_ADMIN_ROLE, _address);
    }

    // function _setupGovernor(address governor) internal {
    //     _setupRole(GOVERN_ROLE, governor);
    // }

}

