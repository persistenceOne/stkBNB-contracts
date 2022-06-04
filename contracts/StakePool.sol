
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC777/IERC777RecipientUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC1820RegistryUpgradeable.sol";
import "./interfaces/ITokenHub.sol"; 
import "./interfaces/StakePoolBot.sol"; 
import "./interfaces/IUndelegationHolder.sol"; 
import "./interfaces/Istkbnb.sol"; 
import "./interfaces/IAddressStore.sol"; 
import "./embedded-libs/Config.sol";
import "./embedded-libs/ExchangeRate.sol";
import "./embedded-libs/BasisFee.sol";



contract StakePool is StakePoolBot, Initializable {
   
    /*********************
     * LIB USAGES
    ********************/
    using ExchangeRate for ExchangeRate.Data;
    using Config for Config.Data;
    using BasisFee for uint256;


    /*********************
     * STRUCTS
     ********************/
    struct BCConfig {
        address undelegationHolder;
        address bcStakingAddress;
    }


    /*********************
     * RBAC ROLES
     ********************/



    /*********************
     * CONSTANTS
     ********************/



    /*********************
     * STATE VARIABLES
     ********************/

    ExchangeRate.Data public exchangeRate;
    IAddressStore public addressStore;
    Config.Data public config;
    BCConfig public bcconfig;

    /*********************
     * EVENTS
     ********************/
    event Deposit(
        address indexed user,
        uint256 bnbAmount,
        uint256 poolTokenAmount,
        uint256 timestamp
    );


    /*********************
     * ERRORS
     ********************/
     
    error LessThanMinimum(string tag, uint256 expected, uint256 got);

    address constant public ZERO_ADDR = 0x0000000000000000000000000000000000000000;
    address constant public TOKENHUB_ADDR = 0x0000000000000000000000000000000000001004;



    uint256 constant public MIN_BNB_DEPOSIT= 1 * 1e18; // 1:BNB
    uint256 constant public MINIMUM_UNSTAKE_AMOUNT = 8 * 1e17; // 0.8:BNB
    uint256 constant public EXCHANGE_RATE_PRECISION = 1e9;
   


    address public bcStakingAddress;

    address public admin;
    

    bool private _paused;

    address private _owner;
    


    modifier whenNotPaused() {
        _whenNotPaused();
        _;
    }
    modifier checkMin(
        string memory tag,
        uint256 minVal,
        uint256 gotVal
    ) {
        _checkMin(tag, minVal, gotVal);
        _;
    }
    function _checkMin(
        string memory tag,
        uint256 minVal,
        uint256 gotVal
    ) private pure {
        if (gotVal < minVal) {
            revert LessThanMinimum(tag, minVal, gotVal);
        }
    }

    function _whenNotPaused() private view {
        require(!_paused, "Pausable: paused");
    }


    

    event ReceivedRewards(uint256 value);
    event State(uint256 balance, uint256 bnbUnbonding, uint256 claimReserve);


    constructor(BCConfig memory _config) {
        _owner = msg.sender;
        bcconfig = _config;
    }

     function deposit()
        external
        payable
        whenNotPaused
        checkMin("Deposit", MIN_BNB_DEPOSIT, msg.value)
    {
        uint256 userWei = msg.value;
        uint256 poolTokensToReturn = exchangeRate._calcPoolTokensForDeposit(userWei);
        uint256 poolTokensDepositFee = config.fee.deposit._apply(poolTokensToReturn);
        uint256 poolTokensUser = poolTokensToReturn - poolTokensDepositFee;

        // update the exchange rate using only the remaining wei amount for which tokens will be minted
        exchangeRate._update(
            ExchangeRate.Data(userWei, poolTokensToReturn),
            ExchangeRate.UpdateOp.Add
        );

        // mint the tokens for appropriate accounts
        IStakedBNBToken(addressStore.getStkBNB()).mint(msg.sender, poolTokensUser, "", "");
        if (poolTokensDepositFee > 0) {
            IStakedBNBToken(addressStore.getStkBNB()).mint(
                addressStore.getFeeVault(),
                poolTokensDepositFee,
                "",
                ""
            );
        }

        emit Deposit(msg.sender, msg.value, poolTokensUser, block.timestamp);
    }



    function getStakableBNB() external override view returns (uint256){

    }



    function initiateDelegation() external override returns (uint256) {
        uint256 miniRelayFee = ITokenHub(TOKENHUB_ADDR).getMiniRelayFee();
        uint256 stakeAmount = address(this).balance-claimReserve-miniRelayFee;

        ITokenHub(TOKENHUB_ADDR).transferOut{value:miniRelayFee+stakeAmount}(ZERO_ADDR, bcconfig.bcStakingAddress, stakeAmount, uint64(block.timestamp + 3600));
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

        uint256 unbondedAmount = IUndelegationHolder(payable (bcconfig.undelegationHolder)).withdrawUnbondedBNB();
        bnbUnbonding -= unbondedAmount;
        claimReserve += unbondedAmount;

        emit State(address(this).balance, bnbUnbonding, claimReserve);
    }

    // function setConfig(Config calldata _config) external {
    //     require(msg.sender == _owner, "unknown sender");
    //     config = _config;
    // }

    function selfDestruct() external {
        require(msg.sender == _owner, "unknown sender");
        selfdestruct(payable (_owner));
    }

    
}






