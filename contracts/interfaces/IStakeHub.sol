// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IStakeHub {
    struct Description {
        string moniker;
        string identity;
        string website;
        string details;
    }

    struct Commission {
        uint64 rate;
        uint64 maxRate;
        uint64 maxChangeRate;
    }

    /**
     *
     * DELEGATOR FUNCTIONS
     *
     */
    function delegate(address operatorAddress, bool delegateVotePower) external payable;
    function undelegate(address operatorAddress, uint256 shares) external;
    function redelegate(address srcValidator, address dstValidator, uint256 shares, bool delegateVotePower) external;
    function claim(address operatorAddress, uint256 requestNumber) external;
    function claimBatch(address[] calldata operatorAddresses, uint256[] calldata requestNumbers) external;

    /**
     *
     * VIEWS
     *
     */
    function getValidatorCreditContract(address operatorAddress) external view returns (address creditContract);
    function getValidatorDescription(address operatorAddress) external view returns (Description memory);
    function getValidatorCommission(address operatorAddress) external view returns (Commission memory);

    function unbondPeriod() external view returns (uint256);
    function transferGasLimit() external view returns (uint256);
}
