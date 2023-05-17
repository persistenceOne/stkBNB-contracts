// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import {ITokenHub} from "./../../contracts/interfaces/ITokenHub.sol";

contract TokenHubMock is ITokenHub {
    uint256 public constant TEN_DECIMALS = 1e10;

    uint256 public miniRelayFee;
    uint256 public timeout;

    constructor(uint256 miniRelayfee_, uint256 timeout_) {
        miniRelayFee = miniRelayfee_;
        timeout = timeout_;
    }

    function transferOut(
        address /* contractAddr */,
        address /* recipient */,
        uint256 /* amount */,
        uint64 expireTime
    ) external payable override returns (bool) {
        require(expireTime >= block.timestamp + timeout, "expireTime must be two minutes later");
        require(
            msg.value % TEN_DECIMALS == 0,
            "invalid received BNB amount: precision loss in amount conversion"
        );
        return true;
    }

    function getMiniRelayFee() external view override returns (uint256) {
        return miniRelayFee;
    }

    function getBoundContract(string memory bep2Symbol) external view override returns (address) {}

    function getBoundBep2Symbol(
        address contractAddr
    ) external view override returns (string memory) {}
}