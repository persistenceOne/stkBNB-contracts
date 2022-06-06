
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC777/IERC777RecipientUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC1820RegistryUpgradeable.sol";
import "./interfaces/ITokenHub.sol"; 
import "./interfaces/StakePoolBot.sol"; 
import "./interfaces/IUndelegationHolder.sol"; 
import "./interfaces/IStakedBNBToken.sol"; 
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
    struct ClaimRequest {
        uint256 weiToReturn; // amount of wei that should be returned to user on claim
        uint256 createdAt; // block timestamp when this request was created
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
    mapping(address => ClaimRequest[]) public claimReqs; // maps userAddress -> a list of claim requests for that user
    uint256 public activeClaimAmount;

    /*********************
     * EVENTS
     ********************/
    event Deposit(
        address indexed user,
        uint256 bnbAmount,
        uint256 poolTokenAmount,
        uint256 timestamp
    );
    event Withdraw(
        address indexed user,
        uint256 poolTokenAmount,
        uint256 bnbAmount,
        uint256 timestamp
    );


    /*********************
     * ERRORS
     ********************/
    error UnknownSender(); 
    error LessThanMinimum(string tag, uint256 expected, uint256 got);
    error TokenMintingToSelfNotAllowed();
    error TokenTransferToSelfNotAllowed();
    error UnexpectedlyReceivedTokensForSomeoneElse(address to);

    address constant public ZERO_ADDR = 0x0000000000000000000000000000000000000000;
    address constant public TOKENHUB_ADDR = 0x0000000000000000000000000000000000001004;



    uint256 constant public MIN_BNB_DEPOSIT= 0.1 * 1e18; // 1:BNB
    uint256 constant public MINIMUM_UNSTAKE_AMOUNT = 8 * 1e17; // 0.8:BNB
    uint256 constant public EXCHANGE_RATE_PRECISION = 1e9;
    uint256 constant public MIN_TOKEN_WITHDRAWAL = 0.1 * 1e18;
   


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

     /**
     * @dev Checks that the msg sender is the expected sender address.
     */

    modifier onlySender(address expectedSender) {
        _onlySender(expectedSender);
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

    function _onlySender(address expectedSender) private view {
        if (msg.sender != expectedSender) {
            revert UnknownSender();
        }
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

    /**
     * @dev Called by an {IERC777} token contract whenever tokens are being
     * moved or created into a registered account (`to`). The type of operation
     * is conveyed by `from` being the zero address or not.
     *
     * This call occurs _after_ the token contract's state is updated, so
     * {IERC777-balanceOf}, etc., can be used to query the post-operation state.
     *
     * This function may revert to prevent the operation from being executed.
     *
     * We use this to receive stkBNB tokens from users for the purpose of withdrawal.
     * So:
     * 1. `msg.sender` must be the address of pool token. Only the token contract should be the caller for this.
     * 2. `from` should be the address of some user. It should never be the zero address or the address of this contract.
     * 3. `to` should always be the address of this contract.
     * 4. `amount` should always be at least _MIN_TOKEN_WITHDRAWAL.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function tokensReceived(
        address, /*operator*/
        address from,
        address to,
        uint256 amount,
        bytes calldata, /*userData*/
        bytes calldata /*operatorData*/
    )
        external
        override
        whenNotPaused
        onlySender(addressStore.getStkBNB())
        checkMin("Withdrawal", MIN_TOKEN_WITHDRAWAL, amount)
    {
        // checks
        if (from == address(0)) {
            revert TokenMintingToSelfNotAllowed();
        }
        if (from == address(this)) {
            revert TokenTransferToSelfNotAllowed();
        }
        if (to != address(this)) {
            revert UnexpectedlyReceivedTokensForSomeoneElse(to);
        }

        _withdraw(from, amount);
    }
        function _withdraw(address from, uint256 amount) internal {
        uint256 poolTokensFee = config.fee.delayedUnstake._apply(amount);
        uint256 poolTokensToBurn = amount - poolTokensFee;

        // calculate the bnb needed to be sent to the user
        uint256 weiToReturn = exchangeRate._calcWeiWithdrawAmount(poolTokensToBurn);

        // create a claim request for this withdrawal
        claimReqs[from].push(ClaimRequest(weiToReturn, block.timestamp));

        // update the total claim amount
        activeClaimAmount += weiToReturn;

        // update the exchange rate to reflect the balance changes
        exchangeRate._update(
            ExchangeRate.Data(weiToReturn, poolTokensToBurn),
            ExchangeRate.UpdateOp.Subtract
        );

        // burn the non-fee tokens
        IStakedBNBToken(addressStore.getStkBNB()).burn(poolTokensToBurn, "");
        // transfer the fee to FeeVault
        IStakedBNBToken(addressStore.getStkBNB()).send(
            addressStore.getFeeVault(),
            poolTokensFee,
            ""
        );

        emit Withdraw(from, amount, weiToReturn, block.timestamp);
    }






    /*********************
     * BOT FUNCTIONS
     ********************/

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






