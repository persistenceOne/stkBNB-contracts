// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC1820RegistryUpgradeable.sol";

/*
 * Docs for Axelar gateway sendToken method: https://docs.axelar.dev/dev/send-tokens/overview
 * Users that wish to send stkBNB tokens to Persistence chain will only have to send tokens to this contract.
 * The `tokensReceived` method will handle calling the `approve` method of ERC20, which is necessary for the AxelarGateway.
 * When invoking `send` method of stkBNB contract, the users will only have to encode the parameters necessary for
 * the `sendToken` method of AxelarGateway contract, which are `chainName`, `destinationAddress` and the `tokenSymbol`.
 * The encoding is to be done off-chain in our current use-case.
 */
contract AxelarGatewaySender is IERC777Recipient {
    IAxelarGateway public immutable gateway;
    IERC20 public immutable token;

    IERC1820RegistryUpgradeable private constant _ERC1820_REGISTRY =
        IERC1820RegistryUpgradeable(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);

    constructor(address gateway_, address token_) {
        gateway = IAxelarGateway(gateway_);
        token = IERC20(token_);

        _ERC1820_REGISTRY.setInterfaceImplementer(
            address(this),
            keccak256("ERC777TokensRecipient"),
            address(this)
        );
    }

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external override {
        string memory chainName;
        string memory destinationAddress;
        string memory tokenSymbol;

        token.approve(address(gateway), amount);

        (chainName, destinationAddress, tokenSymbol) = abi.decode(userData, (string, string, string));

        gateway.sendToken(
            chainName,
            destinationAddress,
            tokenSymbol,
            amount
        );
    }
}