
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC777/IERC777RecipientUpgradeable.sol";
import "./interfaces/ITokenHub.sol"; 

contract StakePool is StakePoolBot, Initializable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address constant public ZERO_ADDR = 0x0000000000000000000000000000000000000000;
    address constant public TOKENHUB_ADDR = 0x0000000000000000000000000000000000001004;



    uint256 constant public MINIMUM_STAKE_AMOUNT = 1 * 1e18; // 1:BNB
    uint256 constant public MINIMUM_UNSTAKE_AMOUNT = 8 * 1e17; // 0.8:BNB
    uint256 constant public EXCHANGE_RATE_PRECISION = 1e9;
   


    address public bcStakingAddress;

    address public admin;
    

    bool private _paused;

    address private _owner;
    Config public config;
    
    struct Config {
        address undelegationHolder;
        address bcStakingAddress;
    }

    event ReceivedRewards(uint256 value);
    event State(uint256 balance, uint256 bnbUnbonding, uint256 claimReserve);

    constructor(Config memory _config) {
        _owner = msg.sender;
        config = _config;
    }

    function initiateDelegation() external override returns (uint256) {
        uint256 miniRelayFee = ITokenHub(TOKENHUB_ADDR).getMiniRelayFee();
        uint256 stakeAmount = address(this).balance-claimReserve-miniRelayFee;

        ITokenHub(TOKENHUB_ADDR).transferOut{value:miniRelayFee+stakeAmount}(ZERO_ADDR, config.bcStakingAddress, stakeAmount, uint64(block.timestamp + 3600));
        return stakeAmount;
    }

    /**
     * @dev Called by the bot to update the exchange rate in contract based on the rewards
     * obtained in the BC staking address and accordingly mint fee tokens.
     * Call frequency: Daily
     *
     * @param bnbRewards: The amount of BNB which were received as staking rewards.
     */
    function notifyRewards(uint256 bnbRewards) external override {
        emit ReceivedRewards(bnbRewards);
    }

    /**
     * @dev This is called by the bot after it has executed the unbond transaction on BC.
     * Call frequency: Weekly
     *
     * @param _bnbUnbonding: The amount of BNB for which unbonding was initiated on BC.
     */
    function unbondingInitiated(uint256 _bnbUnbonding) external override {
        // TODO: subtract from bnbToUnbond
        bnbUnbonding += _bnbUnbonding;
    }

    /**
     * @dev Called by the bot after the unbonded amount for claim fulfilment is received in BC
     * and has been transferred to the UndelegationHolder contract on BSC.
     * It calls UndelegationHolder.withdrawUnbondedBNB() to fetch the unbonded BNB to itself and
     * update `bnbUnbonding` and `claimReserve`.
     * Call frequency: Weekly
     */
    function unbondingFinished() external override {
        emit State(address(this).balance, bnbUnbonding, claimReserve);

        uint256 unbondedAmount = IUndelegationHolder(payable (config.undelegationHolder)).withdrawUnbondedBNB();
        bnbUnbonding -= unbondedAmount;
        claimReserve += unbondedAmount;

        emit State(address(this).balance, bnbUnbonding, claimReserve);
    }

    function setConfig(Config calldata _config) external {
        require(msg.sender == _owner, "unknown sender");
        config = _config;
    }

    function selfDestruct() external {
        require(msg.sender == _owner, "unknown sender");
        selfdestruct(payable (_owner));
    }
}






