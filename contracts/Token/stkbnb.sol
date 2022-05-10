//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;



import "../Interfaces/Istkbnb.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

/**
 * @dev {ERC777} token, including:
 *
 *  - a minter role that allows for token minting (creation)
 *  - a burner role that allows for token burning (destruction)
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the minter and burner
 * roles, as well as the default admin role, which will let it grant minter and
 * burner roles to other accounts.
 *
 * TODO:
 * - Maybe make it pausable using ERC20Pausable. Will be helpful in case of prod disaster.
 * - Check if we really need AccessControlEnumerable or we can do away with AccessControl.
 * - Update `@custom:security-contact`
 */
/// @custom:security-contact support@xtake.finance
contract StakedAVAXToken is ERC777, AccessControlEnumerable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant GOVERN_ROLE = keccak256("GOVERN_ROLE");

    constructor() ERC777("Staked BNB", "stkBNB", new address[](0)) {
        // Grant the appropriate roles
        _grantRole(GOVERN_ROLE, msg.sender);
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
    function burn(uint256 amount, bytes memory data) public override onlyRole(BURNER_ROLE) {
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
    ) public override onlyRole(BURNER_ROLE) {
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
    ) public onlyRole(MINTER_ROLE) {
        ERC777._mint(account, amount, userData, operatorData);
    }
}