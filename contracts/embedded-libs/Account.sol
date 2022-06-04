// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

library Account {
    using Account for Data;

    struct Data {
        string pubkey;
        address addr;
    }

    function _checkValid(Data calldata self) internal pure {
        require(bytes(self.pubkey).length != 0, "account: pubkey is required");
        require(self.addr != address(0), "account: addr is required");
    }

    function _set(Data storage self, Data calldata obj) internal {
        self.addr = obj.addr;
        self.pubkey = obj.pubkey;
    }
}
