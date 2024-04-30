// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC777/IERC777RecipientUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC1820RegistryUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeCastUpgradeable.sol";
import "./embedded-libs/BasisFee.sol";
import "./embedded-libs/Config.sol";
import "./embedded-libs/ExchangeRate.sol";
import "./embedded-libs/ValidatorSet.sol";
import "./interfaces/IAddressStore.sol";
import "./interfaces/IStakedBNBToken.sol";
import "./interfaces/IStakePoolBot.sol";
import "./interfaces/IStakeHub.sol";
import "./interfaces/IStakeCredit.sol";
import "./interfaces/IDelegationManager.sol";

contract StakePool is
    IStakePoolBot,
    IERC777RecipientUpgradeable,
    Initializable,
    AccessControlEnumerableUpgradeable
{
    /**
     *
     * LIB USAGES
     *
     */
    using Config for Config.Data;
    using ValidatorSet for ValidatorSet.Info;
    using ExchangeRate for ExchangeRate.Data;
    using BasisFee for uint256;
    using SafeCastUpgradeable for uint256;

    /**
     *
     * STRUCTS
     *
     */
    struct ClaimRequest {
        uint256 weiToReturn; // amount of wei that should be returned to user on claim
        uint256 createdAt; // block timestamp when this request was created
    }

    /**
     *
     * RBAC ROLES
     *
     */
    bytes32 public constant BOT_ROLE = keccak256("BOT_ROLE"); // Bots can be added/removed through AccessControl

    /**
     *
     * CONSTANTS
     *
     */
    IERC1820RegistryUpgradeable private constant _ERC1820_REGISTRY =
        IERC1820RegistryUpgradeable(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);

    address private constant _ZERO_ADDR = 0x0000000000000000000000000000000000000000;
    address private constant _STAKE_HUB = 0x0000000000000000000000000000000000002002;

    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    /**
     *
     * STATE VARIABLES
     *
     */
    IAddressStore internal _addressStore; // Used to fetch addresses of the other contracts in the system.
    Config.Data public config; // the contract configuration

    bool private _paused; // indicates whether this contract is paused or not
    uint256 private _status; // used for reentrancy protection

    /**
     * @dev The amount that needs to be unbonded in the next unstaking epoch.
     * It increases on every user unstake operation, and decreases when the bot initiates unbonding.
     * This is queried by the bot in order to initiate unbonding.
     * It is int256, not uint256 because bnbUnbonding can be more than it and is subtracted from it.
     * So, if it is < 0, means we have already initiated unbonding for that much amount and eventually
     * that amount would be part of claimReserve. So, we don't need to unbond anything new on the BBC
     * side as long as this value is negative.
     *
     * Increase frequency: anytime
     * Decrease frequency & Bot query frequency:
     *      Mainnet: Weekly
     *      Testnet: Daily
     */
    int256 private _bnbToUnbond;

    /**
     * @dev The amount of BNB that is unbonding in the current unstaking epoch.
     * It increases when the bot initiates unbonding, and decreases when the unbonding is finished.
     * It is queried by the bot before calling unbondingFinished(), to figure out the amount that
     * needs to be moved from BBC to BSC.
     *
     * Increase, Decrease & Bot query frequency:
     *      Mainnet: Weekly
     *      Testnet: Daily
     */
    uint256 private _bnbUnbonding;

    /**
     * @dev A portion of the contract balance that is reserved in order to satisfy the claims
     * for which the cooldown period has finished. This will never be sent to BBC for staking.
     * It increases when the unbonding is finished, and decreases when any user actually claims
     * their BNB.
     *
     * Increase frequency:
     *      Mainnet: Weekly
     *      Testnet: Daily
     * Decrease frequency: anytime
     */
    uint256 private _claimReserve;

    /**
     * @dev The current exchange rate for converting BNB to stkBNB and vice-versa.
     */
    ExchangeRate.Data public exchangeRate;

    /**
     * @dev maps userAddress -> a list of claim requests for that user
     */
    mapping(address => ClaimRequest[]) public claimReqs;

    // The below state variables are part of V2 Implementation of this contract
    // They are kept in the bottom slots to avoid storage conflicts after upgrades

    /**
     * @dev maps operator address -> a struct of Validator
     * and has an array to Keep Track of Validators Operator
     * Address in a dynamic array
     */
    ValidatorSet.Store private _validatorStore;

    /**
     *
     * EVENTS
     *
     */
    event ConfigUpdated(); // emitted when config is updated
    event ValidatorCreated(address indexed operator, uint256 indexed position); // emitted when validator added/updated is updated
    event Deposit(
        address indexed user,
        uint256 indexed bnbAmount,
        uint256 indexed poolTokenAmount,
        uint256 timestamp
    );
    event Withdraw(
        address indexed user,
        uint256 indexed poolTokenAmount,
        uint256 indexed bnbAmount,
        uint256 timestamp
    );
    event Claim(address indexed user, ClaimRequest indexed req, uint256 indexed timestamp);
    event InitiateDelegation_Transfered(uint256 indexed transferAmount); // emitted during initiateDelegation
    event InitiateDelegation_ShortCircuit(uint256 indexed shortCircuitAmount); // emitted during initiateDelegation
    event InitiateDelegation_Success(); // emitted during initiateDelegation
    event Redelegation_Success(
        address indexed srcValidator,
        address indexed dstValidator,
        uint256 indexed restakes
    ); // emitted after a successfull redelegation
    event EpochUpdate(string indexed tag, uint256 indexed bnbEarnings, uint256 indexed feeTokens); // emitted on epochUpdate
    event UnbondingInitiated(uint256 indexed bnbUnbonding); // emitted on unbondingInitiated
    event UnbondingFinished(uint256 indexed unbondedAmount); // emitted on unbondingFinished
    event Rebalancing_Success(uint256 indexed rebalancedAmount); // emitted when rebalancing
    event Paused(address indexed account); // emitted when the pause is triggered by `account`.
    event Unpaused(address indexed account); // emitted when the pause is lifted by `account`.

    /**
     *
     * ERRORS
     *
     */
    error ZeroAddress();
    error NoRewardsAccured(string tag);
    error InvalidRestakeAmount(uint256 restakes);
    error UnknownSender();
    error LessThanMinimum(string tag, uint256 expected, uint256 got);
    error DustNotAllowed(uint256 dust);
    error TokenMintingToSelfNotAllowed();
    error TokenTransferToSelfNotAllowed();
    error UnexpectedlyReceivedTokensForSomeoneElse(address to);
    error CantClaimBeforeDeadline();
    error InsufficientFundsToSatisfyClaim();
    error InsufficientClaimReserve();
    error BNBTransferToUserFailed();
    error IndexOutOfBounds(uint256 index);
    error ToIndexMustBeGreaterThanFromIndex(uint256 from, uint256 to);
    error PausablePaused();
    error PausableNotPaused();
    error ReentrancyGuardReentrantCall();
    error DepositsDelegationFailed(uint256 amount);
    error ArgumentsLengthMismatch();
    error ValidatorAlreadyExists(address validator);
    error ValidatorDoesNotExist();
    error ValidatorCreationFailed();
    error rateSyncNotAllowed();

    /**
     *
     * MODIFIERS
     *
     */

    /**
     * @dev Checks that gotVal is at least minVal. Otherwise, reverts with the given tag.
     * Also ensures that the gotVal doesn't have token dust based on minVal.
     */
    modifier checkMinAndDust(
        string memory tag,
        uint256 minVal,
        uint256 gotVal
    ) {
        _checkMinAndDust(tag, minVal, gotVal);
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _whenNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _whenPaused();
        _;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantPre();
        _;
        _nonReentrantPost();
    }

    /**
     *
     * MODIFIERS FUNCTIONS
     *
     */

    /**
     * @dev A modifier is replaced by all the code in its definition. This leads to increase in compiled contract size.
     * Creating functions for the code inside a modifier, helps reduce the contract size as now the modifier will be
     * replaced by just the function call, instead of all the lines in these functions.
     */
    function _checkMinAndDust(string memory tag, uint256 minVal, uint256 gotVal) private pure {
        if (gotVal < minVal) {
            revert LessThanMinimum(tag, minVal, gotVal);
        }
        uint256 dust = gotVal % minVal;
        if (dust != 0) {
            revert DustNotAllowed(dust);
        }
    }

    function _whenNotPaused() private view {
        if (_paused) {
            revert PausablePaused();
        }
    }

    function _whenPaused() private view {
        if (!_paused) {
            revert PausableNotPaused();
        }
    }

    function _nonReentrantPre() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED (1)
        if (_status == _ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantPost() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    /**
     *
     * INIT FUNCTIONS
     *
     */

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IAddressStore addressStore_,
        Config.Data calldata config_
    ) public initializer {
        __StakePool_init(addressStore_, config_);
    }

    function __StakePool_init(
        IAddressStore addressStore_,
        Config.Data calldata config_
    ) internal onlyInitializing {
        // Need to call initializers for each parent without calling anything twice.
        // So, we need to individually see each parent's initializer and not call the initializer's that have already been called.
        __AccessControlEnumerable_init();

        // Finally, initialize this contract.
        __StakePool_init_unchained(addressStore_, config_);
    }

    function __StakePool_init_unchained(
        IAddressStore addressStore_,
        Config.Data calldata config_
    ) internal onlyInitializing {
        // set contract state variables
        _addressStore = addressStore_;
        config._init(config_);
        _paused = true; // to ensure that nothing happens until the whole system is setup
        _status = _NOT_ENTERED;
        _bnbToUnbond = 0;
        _bnbUnbonding = 0;
        _claimReserve = 0;
        exchangeRate._init();

        // register interfaces
        _ERC1820_REGISTRY.setInterfaceImplementer(
            address(this),
            keccak256("ERC777TokensRecipient"),
            address(this)
        );

        // Make the deployer the default admin, deployer will later transfer this role to a multi-sig.
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     *
     * ADMIN FUNCTIONS
     *
     */

    /**
     * @dev pause: Used by admin to pause the contract.
     *             Supposed to be used in case of a prod disaster.
     *
     * Requirements:
     *
     * - The caller must have the DEFAULT_ADMIN_ROLE.
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev unpause: Used by admin to resume the contract.
     *               Supposed to be used after the prod disaster has been mitigated successfully.
     *
     * Requirements:
     *
     * - The caller must have the DEFAULT_ADMIN_ROLE.
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }

    /**
     * @dev updateConfig: Used by admin to set/update the contract configuration.
     *                    It is allowed to update config even when the contract is paused.
     *
     * Requirements:
     *
     * - The caller must have the DEFAULT_ADMIN_ROLE.
     */
    function updateConfig(Config.Data calldata config_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        config._init(config_);
        emit ConfigUpdated();
    }

    /**
     *
     * USER FUNCTIONS
     *
     */

    /**
     * @dev deposit: Called by a user to deposit BNB to the contract in exchange for stkBNB.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function deposit()
        external
        payable
        nonReentrant
        whenNotPaused
        checkMinAndDust("Deposit", config.minBNBDeposit, msg.value)
    {
        uint256 userWei = msg.value;
        uint256 poolTokensToReturn = exchangeRate._calcPoolTokensForDeposit(userWei);
        uint256 poolTokensDepositFee = config.fee.deposit._apply(poolTokensToReturn);
        uint256 poolTokensUser = poolTokensToReturn - poolTokensDepositFee;

        // update the exchange rate using the wei amount for which tokens will be minted
        exchangeRate._update(
            ExchangeRate.Data(userWei, poolTokensToReturn),
            ExchangeRate.UpdateOp.Add
        );

        // mint the tokens for appropriate accounts
        IStakedBNBToken stkBNB = IStakedBNBToken(_addressStore.getStkBNB());
        stkBNB.mint(msg.sender, poolTokensUser, "", "");
        if (poolTokensDepositFee > 0) {
            stkBNB.mint(_addressStore.getFeeVault(), poolTokensDepositFee, "", "");
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
     * 4. `amount` should always be at least config.minTokenWithdrawal.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function tokensReceived(
        address /*operator*/,
        address from,
        address to,
        uint256 amount,
        bytes calldata /*userData*/,
        bytes calldata /*operatorData*/
    )
        external
        override
        nonReentrant
        whenNotPaused
        checkMinAndDust("Withdrawal", config.minTokenWithdrawal, amount)
    {
        // checks
        if (msg.sender != _addressStore.getStkBNB()) {
            revert UnknownSender();
        }
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

    /**
     * @dev claimAll: Called by a user to claim all the BNB they had previously unstaked.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function claimAll() external nonReentrant whenNotPaused {
        uint256 claimRequestCount = claimReqs[msg.sender].length;
        uint256 i = 0;

        while (i < claimRequestCount) {
            if (_claim(i)) {
                --claimRequestCount;
                continue;
            }
            ++i;
        }
    }

    /**
     * @dev claim: Called by a user to claim the BNB they had previously unstaked.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     *
     * @param index: The index of the ClaimRequest which is to be claimed.
     */
    function claim(uint256 index) external nonReentrant whenNotPaused {
        if (!_claim(index)) {
            revert CantClaimBeforeDeadline();
        }
    }

    /**
     * @dev epochUpdate: Accessible to any user and can be invoked once daily to adjust the exchange rate.
     * The adjustment is based on the total rewards accumulated by all validators, ensuring that
     * the rate reflects the latest reward dynamics and accordingly mint fee tokens.
     *
     * Requirements:
     *
     * - Can only be called once per day
     *
     * Call frequency:
     *      Mainnet: Daily
     *      Testnet: Daily
     */
    function epochUpdate() external override nonReentrant whenNotPaused {
        int256 cumulativeEarnings = _getUpdatedEarnings();

        if (cumulativeEarnings == 0) {
            revert NoRewardsAccured("Cannot perform rateSync with 0 BNB as Rewards");
        } else if (cumulativeEarnings > 0) {
            uint256 rewardAmount = uint256(cumulativeEarnings);
            // calculate fee
            uint256 feeWei = config.fee.reward._apply(rewardAmount);
            uint256 feeTokens = (feeWei * exchangeRate.poolTokenSupply) /
                (exchangeRate.totalWei + rewardAmount - feeWei);

            // update exchange rate
            exchangeRate._update(
                ExchangeRate.Data(rewardAmount, feeTokens),
                ExchangeRate.UpdateOp.Add
            );

            // mint the fee tokens to FeeVault
            IStakedBNBToken(_addressStore.getStkBNB()).mint(
                _addressStore.getFeeVault(),
                feeTokens,
                "",
                ""
            );

            // emit the ack event
            emit EpochUpdate("Rewarded", rewardAmount, feeTokens);
        } else {
            uint256 slashAmount = uint256(-cumulativeEarnings);
            // update exchange rate
            exchangeRate._update(ExchangeRate.Data(slashAmount, 0), ExchangeRate.UpdateOp.Subtract);

            // emit the ack event
            emit EpochUpdate("Slashed", slashAmount, 0);
        }
    }

    /**
     *
     * BOT FUNCTIONS
     *
     */

    /**
     * @dev createValidator: Called by the Bot to add a new validator to the validator set.
     * It is allowed to create validator even when the contract is paused.
     *
     * Requirements:
     *
     * - The caller must have the BOT_ROLE.
     */
    function createValidator(address operator_) external override onlyRole(BOT_ROLE) {
        if (!_createValidator(operator_)) revert ValidatorCreationFailed();
        emit ValidatorCreated(operator_, getTotalValidators());
    }

    /**
     * @dev _createValidator: handles validator creation logic
     */
    function _createValidator(address operator_) private returns (bool) {
        address stCred_ = IStakeHub(_STAKE_HUB).getValidatorCreditContract(operator_);
        if (operator_ == _ZERO_ADDR || stCred_ == _ZERO_ADDR) revert ZeroAddress();

        ValidatorSet.Info memory validator = getValidator(operator_);
        IStakeCredit validatorCredit = IStakeCredit(stCred_);

        if (validator._exists()) {
            revert ValidatorAlreadyExists(operator_);
        } else {
            // Creates new Validator
            uint256 prevStake = validatorCredit.getPooledBNB(_getDelegationManager());

            ValidatorSet.Info memory newValidator;
            newValidator.operator = operator_;
            newValidator.stCred = stCred_;
            newValidator.status = ValidatorSet.Status.Active;
            newValidator.delegation.stakes = prevStake > 0 ? prevStake : 0;

            _validatorStore.validators[operator_]._create(newValidator);
            _validatorStore.operatorsList.push(operator_);
        }

        return true;
    }

    /**
     * @dev enableValidator: Called by the Bot to reactivate the disabled Validator.
     * It is allowed to activate validator even when the contract is paused.
     *
     * Requirements:
     *
     * - The caller must have the BOT_ROLE.
     */
    function enableValidator(address operator_) external override onlyRole(BOT_ROLE) {
        ValidatorSet.Info storage validator = _validatorStore.validators[operator_];
        validator._activate();
    }

    /**
     * @dev disableValidator: Called by the Bot to deactivate the Validator.
     * It is allowed to deactivate validator even when the contract is paused.
     *
     * Requirements:
     *
     * - The caller must have the BOT_ROLE.
     */
    function disableValidator(
        address operator_,
        ValidatorSet.Status status_
    ) external override onlyRole(BOT_ROLE) {
        ValidatorSet.Info storage validator = _validatorStore.validators[operator_];
        validator._deactivate(status_);
    }

    /**
     * @dev This is called by the bot in order to transfer the stakable BNB from contract to the
     * stakehub contract on BSC Native Staking Module.
     *
     * Call frequency:
     *      Mainnet: Daily
     *      Testnet: Daily
     *
     * @param operators_  : A list of Validator Operators to delegate to.
     * @param bnbAmounts_ : A list of bnb delegation amounts given by the bot
     *
     */
    function initiateDelegation(
        address[] calldata operators_,
        uint256[] calldata bnbAmounts_
    ) external override whenNotPaused onlyRole(BOT_ROLE) {
        if (operators_.length != bnbAmounts_.length) {
            revert ArgumentsLengthMismatch();
        }
        // contract will always have at least the _claimReserve, so this should never overflow.
        uint256 excessBNB = getDeposits();

        // Initiate a delegate only if deposited BNB > 1.1 BNB
        if (excessBNB > config.minDelegationAmount) {
            // Note that the probability of a black swan event is very low. On top of that, as time passes, we will be
            // accumulating some stkBNB as rewards in FeeVault. This implies that our share of BNB in the pool will
            // keep increasing over time. As long as this share is more than the total fee spent till that time, we need
            // not worry about paying back the fee losses. Also, for us to be economically successful, we must set
            // protocol fee rates in a way so that the rewards we earn via FeeVault are significantly more than the fee
            // we are paying for the protocol operations.
            bool delegated = IDelegationManager(payable(_getDelegationManager()))
                .delegateDepositedBNB{ value: excessBNB }(operators_, bnbAmounts_);

            if (!delegated) {
                revert DepositsDelegationFailed(excessBNB);
            }

            for (uint256 i = 0; i < operators_.length; ++i) {
                ValidatorSet.Info storage validator = _validatorStore.validators[operators_[i]];

                uint256 newStake = IStakeCredit(validator.stCred).getPooledBNB(
                    _getDelegationManager()
                );

                validator._delegate(newStake);
            }

            emit InitiateDelegation_Transfered(excessBNB);
        } else if (excessBNB > 0 && _bnbToUnbond > 0) {
            // if the excess amount is so small that it can't be moved to BBC and there is _bnbToUnbond, short-circuit
            // the bot process and directly update the _claimReserve. This way, we will still be able to satisfy claims
            // even if the total deposit throughout the unstaking epoch is less than the minimum cross-chain transfer.

            // The reason we don't do this short-circuit process more generally is because the short-circuited amount
            // doesn't earn any rewards. While, if it would have gone through the normal transferOut process, it would
            // have earned significant staking rewards because we undelegate only once in 7 days on mainnet. So, we do
            // this short-circuit process only to handle the edge case when the deposits throughout the unstaking epoch
            // are less than the minimum cross-chain transfer and users initiated withdrawals, so that we are
            // successfully able to satisfy the claim requests.

            uint256 shortCircuitAmount;
            if (_bnbToUnbond > excessBNB.toInt256()) {
                // all the excessBNB we have in the contract will be used up to satisfy claims. The remaining
                // _bnbToUnbond will be made available to the contract by the bot via the unstaking operations.
                shortCircuitAmount = excessBNB;
            } else {
                // the amount we need to unbond to satisfy claims is already present in the contract. So, only that much
                // needs to be moved to _claimReserve.
                shortCircuitAmount = uint256(_bnbToUnbond);
            }
            _bnbToUnbond -= shortCircuitAmount.toInt256();
            _claimReserve += shortCircuitAmount;

            emit InitiateDelegation_ShortCircuit(shortCircuitAmount);
        }
        // else there is no excess amount or very small excess amount and no _bnbToUnbond. In these cases, the excess
        // amount will remain in the contract, and will be delegated the next day.

        // emitted to make the life of off-chain dependencies easy
        emit InitiateDelegation_Success();
    }

    /**
     * @dev This is called by the bot in order to redelegate BNB from one Validator
     * to another Validator provided that the new validator exists
     *
     * Requirements:
     *
     * - The caller must be bot.
     *
     * @param srcOperator_  : Source Validator Operator to undelegate from
     * @param dstOperator_  : Destination Validator Operator to delegate to
     * @param srcRestakes_  : Total stakes of Source Validator to redelegate
     *
     */
    function initiateRedelegation(
        address srcOperator_,
        address dstOperator_,
        uint256 srcRestakes_
    ) external override whenNotPaused onlyRole(BOT_ROLE) {
        if (!getValidator(srcOperator_)._isActiveValidator()) {
            revert ValidatorDoesNotExist();
        }

        if (!getValidator(dstOperator_)._isActiveValidator()) {
            _createValidator(dstOperator_);
        }

        ValidatorSet.Info storage srcValidator = _validatorStore.validators[srcOperator_];
        ValidatorSet.Info storage dstValidator = _validatorStore.validators[dstOperator_];

        if (srcRestakes_ == 0 || srcRestakes_ > srcValidator.delegation.stakes) {
            revert InvalidRestakeAmount(srcRestakes_);
        } else {
            uint256 srcRestakeShares = _getValidatorShares(srcOperator_, srcRestakes_);

            // 0.02 % of redelegated BNB would be rewarded to dstValidator Pool.
            uint256 redelegationFeeWei = _calculateFee(srcRestakes_);
            // update exchange rate
            exchangeRate._update(
                ExchangeRate.Data(redelegationFeeWei, 0),
                ExchangeRate.UpdateOp.Subtract
            );

            IDelegationManager(payable(_getDelegationManager())).redelegateBnbShares(
                srcOperator_,
                dstOperator_,
                srcRestakeShares,
                false
            );

            uint256 dstStakes = IStakeCredit(dstValidator.stCred).getPooledBNB(
                _getDelegationManager()
            );

            // update stakes in ValidatorStore
            dstValidator._redelegate(srcValidator, dstStakes, srcRestakes_);
        }

        emit Redelegation_Success(srcOperator_, dstOperator_, srcRestakes_);
    }

    /**
     * @dev This is called by the bot to undelegate 'bnbToUnbond' funds from the BSC Native Staking Module.
     *
     * Requirements:
     *
     * - The caller must be bot.
     *
     * Call frequency:
     *      Mainnet: Weekly
     *      Testnet: Daily
     *
     * @param operators_       : The list of validators to undelegate from.
     * @param bnbUnbondValues_ : The list contains bnb unbonding amounts from the respective validators.
     *                           It will be calculated by the bot.
     *                           It can be more than bnbToUnbond in total, but within a factor of minUndelegation amount (1 BNB).
     */
    function unbondingInitiated(
        address[] calldata operators_,
        uint256[] calldata bnbUnbondValues_
    ) external override whenNotPaused onlyRole(BOT_ROLE) {
        if (operators_.length != bnbUnbondValues_.length) {
            revert ArgumentsLengthMismatch();
        }

        uint256[] memory sharesToUnbond = new uint256[](bnbUnbondValues_.length);
        for (uint256 i = 0; i < operators_.length; ++i) {
            sharesToUnbond[i] = _getValidatorShares(operators_[i], bnbUnbondValues_[i]);

            ValidatorSet.Info storage validator = _validatorStore.validators[operators_[i]];
            validator._undelegate(bnbUnbondValues_[i]);
        }

        uint256 totalBNBUnbonding = IDelegationManager(payable(_getDelegationManager()))
            .undelegateBNBtoUnbond(operators_, sharesToUnbond, bnbUnbondValues_);

        _bnbToUnbond -= totalBNBUnbonding.toInt256();
        _bnbUnbonding += totalBNBUnbonding;

        emit UnbondingInitiated(totalBNBUnbonding);
    }

    /**
     * @dev Called by the bot after the unbonded amount for claim fulfilment is received in Validator Credit Contract
     * It calls StakeHub.claimBatch() to fetch the unbonded BNB to itself from the above contract and
     * update `bnbUnbonding` and `claimReserve`.
     *
     * Requirements:
     *
     * - The caller must be bot.
     *
     * Call frequency:
     *      Mainnet: Weekly
     *      Testnet: Daily
     *
     */
    function unbondingFinished() external override whenNotPaused onlyRole(BOT_ROLE) {
        ValidatorSet.Info[] memory allValidators = getValidators();

        for (uint256 i = 0; i < getTotalValidators(); ++i) {
            IStakeCredit validatorCredit = IStakeCredit(allValidators[i].stCred);
            uint256 claimRequests = validatorCredit.claimableUnbondRequest(_getDelegationManager());

            if (claimRequests > 0) {
                // the sum of claimes can never be more than _bnbUnbonding. DelegationManager takes care of that.
                // So, no need to worry about arithmetic overflows.
                IDelegationManager(payable(_getDelegationManager())).claimUnbondedBNB(
                    allValidators[i].operator
                );
            }
        }

        uint256 claimedAmount = IDelegationManager(payable(_getDelegationManager()))
            .withdrawClaimedBNB();

        _bnbUnbonding -= claimedAmount;
        _claimReserve += claimedAmount;

        emit UnbondingFinished(claimedAmount);
    }

    /**
     * @dev It is called by the DelegationManager as part of claimUnbondedBNB() during the unbondingFinished() call.
     */
    receive() external payable whenNotPaused {
        if (msg.sender != _getDelegationManager()) {
            revert UnknownSender();
        }

        // When called by DelegationManager
        // Any necessary events for recording the balance change are emitted in unbondingFinished().
    }

    /**
     *
     * VIEWS
     *
     */

    /**
     * @return the address store
     */
    function addressStore() external view returns (IAddressStore) {
        return _addressStore;
    }

    /**
     * @return true if the contract is paused, false otherwise.
     */
    function paused() external view returns (bool) {
        return _paused;
    }

    /**
     * @return _bnbToUnbond
     */
    function bnbToUnbond() external view override returns (int256) {
        return _bnbToUnbond;
    }

    /**
     * @return _bnbUnbonding
     */
    function bnbUnbonding() external view override returns (uint256) {
        return _bnbUnbonding;
    }

    /**
     * @return _claimReserve
     */
    function claimReserve() external view override returns (uint256) {
        return _claimReserve;
    }

    /**
     * @dev Returns the Available BNB for Deposit in this Contract
     * @return excessBNB
     */
    function getDeposits() public view override returns (uint256) {
        uint256 excessBNB = address(this).balance - _claimReserve;
        return excessBNB;
    }

    /**
     * @dev Returns a list of all Validators
     */
    function getValidators() public view override returns (ValidatorSet.Info[] memory) {
        uint256 totalValidatorCount = getTotalValidators();
        ValidatorSet.Info[] memory allValidators = new ValidatorSet.Info[](totalValidatorCount);

        for (uint256 i = 0; i < totalValidatorCount; ++i) {
            address operator = _validatorStore.operatorsList[i];
            allValidators[i] = getValidator(operator);
        }

        return allValidators;
    }

    /**
     * @dev Returns a specific Validator
     */
    function getValidator(
        address operator
    ) public view override returns (ValidatorSet.Info memory) {
        ValidatorSet.Info memory validator = _validatorStore.validators[operator];
        return validator;
    }

    /**
     * @dev Returns the total number of validators
     */
    function getTotalValidators() public view override returns (uint256) {
        return _validatorStore.operatorsList.length;
    }

    /**
     * @dev getClaimRequestCount: Get the number of active claim requests by user
     * @param user: Address of the user for which to query.
     */
    function getClaimRequestCount(address user) external view returns (uint256) {
        return claimReqs[user].length;
    }

    /**
     * @dev getPaginatedClaimRequests: Get a paginated view of a user's claim requests in the range [from, to).
     *                                 The returned claims are not sorted in any order.
     * @param user: Address of the user whose claims need to be queried.
     * @param from: List start index (inclusive).
     * @param to: List end index (exclusive).
     */
    function getPaginatedClaimRequests(
        address user,
        uint256 from,
        uint256 to
    ) external view returns (ClaimRequest[] memory) {
        if (from >= claimReqs[user].length) {
            revert IndexOutOfBounds(from);
        }
        if (from >= to) {
            revert ToIndexMustBeGreaterThanFromIndex(from, to);
        }

        if (to > claimReqs[user].length) {
            to = claimReqs[user].length;
        }

        ClaimRequest[] memory paginatedClaimRequests = new ClaimRequest[](to - from);
        for (uint256 i = 0; i < to - from; ++i) {
            paginatedClaimRequests[i] = claimReqs[user][from + i];
        }

        return paginatedClaimRequests;
    }

    /**
     *
     * INTERNAL FUNCTIONS
     *
     */
    function _withdraw(address from, uint256 amount) internal {
        uint256 poolTokensFee = config.fee.withdraw._apply(amount);
        uint256 poolTokensToBurn = amount - poolTokensFee;

        // calculate the BNB needed to be sent to the user
        uint256 weiToReturn = exchangeRate._calcWeiWithdrawAmount(poolTokensToBurn);

        // create a claim request for this withdrawal
        claimReqs[from].push(ClaimRequest(weiToReturn, block.timestamp));

        // update the _bnbToUnbond
        _bnbToUnbond += weiToReturn.toInt256();

        // update the exchange rate to reflect the balance changes
        exchangeRate._update(
            ExchangeRate.Data(weiToReturn, poolTokensToBurn),
            ExchangeRate.UpdateOp.Subtract
        );

        IStakedBNBToken stkBNB = IStakedBNBToken(_addressStore.getStkBNB());
        // burn the non-fee tokens
        stkBNB.burn(poolTokensToBurn, "");
        if (poolTokensFee > 0) {
            // transfer the fee to FeeVault, if any
            stkBNB.send(_addressStore.getFeeVault(), poolTokensFee, "");
        }

        emit Withdraw(from, amount, weiToReturn, block.timestamp);
    }

    /**
     * @dev _claim: Claim BNB after cooldown has finished.
     *
     * @param index: The index of the ClaimRequest which is to be claimed.
     *
     * @return true if the request can be claimed, false otherwise.
     */
    function _claim(uint256 index) internal returns (bool) {
        if (index >= claimReqs[msg.sender].length) {
            revert IndexOutOfBounds(index);
        }

        // find the requested claim
        ClaimRequest memory req = claimReqs[msg.sender][index];

        if (!_canBeClaimed(req)) {
            return false;
        }
        // the contract should have at least as much balance as needed to fulfil the request
        if (address(this).balance < req.weiToReturn) {
            revert InsufficientFundsToSatisfyClaim();
        }
        // the _claimReserve should also be at least as much as needed to fulfil the request
        if (_claimReserve < req.weiToReturn) {
            revert InsufficientClaimReserve();
        }

        // update _claimReserve
        _claimReserve -= req.weiToReturn;

        // delete the req, as it has been fulfilled (swap deletion for O(1) compute)
        claimReqs[msg.sender][index] = claimReqs[msg.sender][claimReqs[msg.sender].length - 1];
        claimReqs[msg.sender].pop();

        // return BNB back to user (which can be anyone: EOA or a contract)
        (bool sent /*memory data*/, ) = msg.sender.call{ value: req.weiToReturn }("");
        if (!sent) {
            revert BNBTransferToUserFailed();
        }
        emit Claim(msg.sender, req, block.timestamp);
        return true;
    }

    /**
     * @dev _getUpdatedEarnings: Helper function to get the daily rewards earned.
     * It aslo updates the Validator stakes with it's rewards in the Validator Store.
     *
     * @return cumulativeEarnings Returns the extra rewards/slash accured.
     */
    function _getUpdatedEarnings() internal returns (int256) {
        int256 cumulativeEarnings;
        for (uint256 i = 0; i < getTotalValidators(); ++i) {
            ValidatorSet.Info storage validator = _validatorStore.validators[
                _validatorStore.operatorsList[i]
            ];
            IStakeCredit validatorCred = IStakeCredit(validator.stCred);

            uint256 currStakes = validatorCred.getPooledBNB(_getDelegationManager());

            // Rewards/Slashes accured by a validator on a specific day
            int256 validatorEarnings = int256(currStakes) - int256(validator.delegation.stakes);

            cumulativeEarnings += validatorEarnings;
            unchecked {
                validator.delegation.stakes += uint256(validatorEarnings);
            }
        }

        return cumulativeEarnings;
    }

    /**
     * @dev _canBeClaimed: Helper function to check whether a ClaimRequest can be claimed or not.
     *                      It is allowed to claim only after the cooldown period has finished.
     *
     * @param req: The request which needs to be checked.
     * @return true if the request can be claimed.
     */
    function _canBeClaimed(ClaimRequest memory req) internal view returns (bool) {
        return block.timestamp > (req.createdAt + config.cooldownPeriod);
    }

    /**
     * @dev _getValidatorShares: Helper Function for Retrieving stCred Token
     * holdings with Validation for Specified BNB Amount
     *
     * @return shares Returns the shares with the specified Validator
     */
    function _getValidatorShares(
        address _operator,
        uint256 _bnbAmount
    ) internal view returns (uint256) {
        ValidatorSet.Info memory validator = getValidator(_operator);

        if (!validator._isActiveValidator()) revert ValidatorDoesNotExist();
        uint256 shares = IStakeCredit(validator.stCred).getSharesByPooledBNB(_bnbAmount);

        return shares;
    }

    /**
     * @dev _getDelegationManager: Helper Function for Accessing DelegationManager's Address
     * Since the AddressStore is a non-upgradeable contract, we must set the
     * UndelegationHolder's Address to the DelegationManager's Address following the
     * deployment of the V2 contracts.
     *
     * @return Returns the address of the DelegationManager's Proxy Contract
     */
    function _getDelegationManager() internal view returns (address) {
        return _addressStore.getUndelegationHolder();
    }

    /**
     * @dev _calculateFee: Helper Function for Calculating Fraction of a Value
     *
     * @return Returns the redelegation fees from the stakeHub
     */
    function _calculateFee(uint256 _value) internal view returns (uint256) {
        IStakeHub stakeHub = IStakeHub(_STAKE_HUB);
        uint256 feeWei = (_value * stakeHub.redelegateFeeRate()) /
            stakeHub.REDELEGATE_FEE_RATE_BASE();

        return feeWei;
    }
}
