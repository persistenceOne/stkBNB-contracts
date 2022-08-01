//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./abstract/BEP20.sol";
import "./interfaces/IStakedBNBToken.sol";

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
contract StakedBNBToken is IStakedBNBToken, ERC777, BEP20, AccessControlEnumerable, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor() ERC777("Staked BNB", "stkBNB", new address[](0)) BEP20(msg.sender) {
        // Make the deployer the DEFAULT_ADMIN and BEP20 owner, deployer will later transfer these roles to a multi-sig.
        // Once we are sure the system is stable and there are no issues, the multi-sig can choose to renounce the
        // DEFAULT_ADMIN_ROLE, but not the BEP20 owner.
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev See {IERC777-totalSupply}.
     */
    function totalSupply() public view override(IERC777, ERC777) returns (uint256) {
        return ERC777.totalSupply();
    }

    /**
     * @dev Returns the amount of tokens owned by an account (`tokenHolder`).
     */
    function balanceOf(address tokenHolder)
        public
        view
        override(IERC777, ERC777)
        returns (uint256)
    {
        return ERC777.balanceOf(tokenHolder);
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
        override(IERC777, ERC777)
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
    ) public override(IERC777, ERC777) onlyRole(BURNER_ROLE) whenNotPaused {
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
    ) external override onlyRole(MINTER_ROLE) whenNotPaused {
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
    function pause() external override onlyRole(DEFAULT_ADMIN_ROLE) {
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
    function unpause() external override onlyRole(DEFAULT_ADMIN_ROLE) {
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
    function selfDestruct(address addr) external override onlyRole(DEFAULT_ADMIN_ROLE) whenPaused {
        selfdestruct(payable(addr));
    }
}
