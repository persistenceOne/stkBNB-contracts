//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @dev {ERC777} token, including:
 *
 *  - a minter role that allows for token minting (creation)
 *  - a burner role that allows for token burning (destruction)
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the default admin role,
 * which will let it grant the minter and burner roles to the StakePool contract.
 *
/**/

/// @custom:security-contact support@persistence.one
contract StakedBNBToken is ERC777, AccessControlEnumerable, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor() ERC777("Staked BNB", "stkBNB", new address[](0)) {
        // Make the deployer the default admin, deployer will later transfer this role to a multi-sig.
        // Once we are sure the system is stable and there are no issues, the multi-sig can choose to renounce this role.
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC777-_burn}.
     *
     * Requirements:
     *
     * - the caller must have the `BURNER_ROLE`.
     */
    function burn(uint256 amount, bytes memory data)
        public
        override
        onlyRole(BURNER_ROLE)
        whenNotPaused
    {
        ERC777.burn(amount, data);
    }

    /**
     * @dev See {IERC777-operatorBurn}.
     *
     * Emits {Burned} and {IERC20-Transfer} events.
     * Overridden to ensure that only the address with the BURNER_ROLE can call this.
     *
     * Requirements:
     *
     * - the caller must have the `BURNER_ROLE`.
     */
    function operatorBurn(
        address account,
        uint256 amount,
        bytes memory data,
        bytes memory operatorData
    ) public override onlyRole(BURNER_ROLE) whenNotPaused {
        ERC777.operatorBurn(account, amount, data, operatorData);
    }

    /**
     * @dev Creates `amount` new tokens for `account`.
     *
     * See {ERC777-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the `MINTER_ROLE`.
     */
    function mint(
        address account,
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        ERC777._mint(account, amount, userData, operatorData);
    }

    /**
     * @dev pause: Used by admin to pause the contract.
     *             Supposed to be used in case of a prod disaster.
     *
     * Requirements:
     *
     * - The caller must have the DEFAULT_ADMIN_ROLE.
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev unpause: Used by admin to resume the contract.
     *               Supposed to be used after the prod disaster has been mitigated successfully.
     *
     * Requirements:
     *
     * - The caller must have the DEFAULT_ADMIN_ROLE.
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev selfDestruct
     *
     * The contract will be destroyed and BNB (if any) will be sent to the provided address.
     *
     * Requirements:
     *
     * - the caller must have the `DEFAULT_ADMIN_ROLE`.
     *
     */
    function selfDestruct(address addr) external onlyRole(DEFAULT_ADMIN_ROLE) whenPaused {
        selfdestruct(payable(addr));
    }
}
