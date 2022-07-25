// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC777/IERC777RecipientUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC1820RegistryUpgradeable.sol";
import "./embedded-libs/BasisFee.sol";
import "./embedded-libs/Config.sol";
import "./embedded-libs/ExchangeRate.sol";
import "./interfaces/IAddressStore.sol";
import "./interfaces/IStakedBNBToken.sol";
import "./interfaces/ITokenHub.sol";
import "./interfaces/IUndelegationHolder.sol";

// TODO:
// * Tests
// * Optimize Storage layout (both contract size and gas wise)
//      * Changing something from public to private optimizes contract size, even after adding a public view.
//      * Changing the location of _paused affects the contract size as well. If kept before addressStore, it increases.
contract StakePool is
    Initializable,
    IERC777RecipientUpgradeable,
    AccessControlEnumerableUpgradeable
{
    /*********************
     * LIB USAGES
     ********************/

    using Config for Config.Data;
    using ExchangeRate for ExchangeRate.Data;
    using BasisFee for uint256;

    /*********************
     * STRUCTS
     ********************/

    struct ClaimRequest {
        uint256 weiToReturn; // amount of wei that should be returned to user on claim
        uint256 createdAt; // block timestamp when this request was created
    }

    /*********************
     * RBAC ROLES
     ********************/

    bytes32 public constant BOT_ROLE = keccak256("BOT_ROLE"); // Bots can be added/removed through AccessControl

    /*********************
     * CONSTANTS
     ********************/

    IERC1820RegistryUpgradeable private constant _ERC1820_REGISTRY =
        IERC1820RegistryUpgradeable(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);

    address private constant _ZERO_ADDR = 0x0000000000000000000000000000000000000000;
    ITokenHub private constant _TOKEN_HUB = ITokenHub(0x0000000000000000000000000000000000001004);

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

    /*********************
     * STATE VARIABLES
     ********************/

    IAddressStore public addressStore;
    Config.Data public config;

    bool private _paused; // indicates whether this contract is paused or not
    uint256 private _status; // used for reentrancy protection

    /**
     * @dev The amount that needs to be unbonded in the next unstaking epoch.
     * This is queried by the bot in order to initiate unbonding.
     * It is int256, not uint256 because bnbUnbonding can be more than it and is subtracted from it.
     * So, if it is <= 0, means we don't need to unbond anything.
     * Call frequency: Weekly
     */
    int256 public bnbToUnbond;

    /**
     * @dev The amount of BNB that is unbonding in the current unstaking epoch.
     */
    uint256 public bnbUnbonding;

    /**
     * @dev A portion of the contract balance that is reserved in order to satisfy the claim
     * requests from users after the cooldown period. This will never be sent to the BC chain
     * for staking.
     */
    uint256 public claimReserve;

    /**
     * @dev The current exchange rate for converting BNB to stkBNB and vice-versa.
     */
    ExchangeRate.Data public exchangeRate;

    /**
     * @dev maps userAddress -> a list of claim requests for that user
     */
    mapping(address => ClaimRequest[]) public claimReqs;

    /*********************
     * EVENTS
     ********************/
    event ConfigUpdated(); // emitted when config is updated
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
    event Claim(address indexed user, ClaimRequest req, uint256 timestamp);
    event DelegationInitiated(uint256 stakableBNB); // emitted on initiateDelegation
    event EpochUpdate(uint256 bnbRewards, uint256 feeTokens); // emitted on epochUpdate
    event UnbondingInitiated(uint256 bnbUnbonding); // emitted on unbondingInitiated
    event UnbondingFinished(uint256 unbondedAmount); // emitted on unbondingFinished
    event Paused(address account); // emitted when the pause is triggered by `account`.
    event Unpaused(address account); // emitted when the pause is lifted by `account`.

    /*********************
     * ERRORS
     ********************/

    error UnknownSender();
    error LessThanMinimum(string tag, uint256 expected, uint256 got);
    error DustNotAllowed(uint256 dust);
    error TokenMintingToSelfNotAllowed();
    error TokenTransferToSelfNotAllowed();
    error UnexpectedlyReceivedTokensForSomeoneElse(address to);
    error CantClaimBeforeDeadline();
    error InsufficientFundsToSatisfyClaim();
    error IndexOutOfBounds(uint256 index);
    error ToIndexMustBeGreaterThanFromIndex(uint256 from, uint256 to);
    error PausablePaused();
    error PausableNotPaused();
    error ReentrancyGuardReentrantCall();

    /*********************
     * MODIFIERS
     ********************/

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

    /*********************
     * MODIFIERS FUNCTIONS
     ********************/

    /**
     * @dev A modifier is replaced by all the code in its definition. This leads to increase in compiled contract size.
     * Creating functions for the code inside a modifier, helps reduce the contract size as now the modifier will be
     * replaced by just the function call, instead of all the lines in these functions.
     */

    function _checkMinAndDust(
        string memory tag,
        uint256 minVal,
        uint256 gotVal
    ) private pure {
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
        // On the first call to nonReentrant, _notEntered will be true
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

    /*********************
     * INIT FUNCTIONS
     ********************/

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(IAddressStore addressStore_, Config.Data calldata config_)
        public
        initializer
    {
        __StakePool_init(addressStore_, config_);
    }

    function __StakePool_init(IAddressStore addressStore_, Config.Data calldata config_)
        internal
        onlyInitializing
    {
        // Need to call initializers for each parent without calling anything twice.
        // So, we need to individually see each parent's initializer and not call the initializer's that have already been called.
        //      1. __AccessControlEnumerable_init => This is empty in the current openzeppelin v0.4.6

        // Finally, initialize this contract.
        __StakePool_init_unchained(addressStore_, config_);
    }

    function __StakePool_init_unchained(IAddressStore addressStore_, Config.Data calldata config_)
        internal
        onlyInitializing
    {
        // set contract state variables
        addressStore = addressStore_;
        config._init(config_);
        _paused = true;
        _status = _NOT_ENTERED;
        // to ensure that nothing happens until the whole system is setup
        bnbToUnbond = 0;
        bnbUnbonding = 0;
        claimReserve = 0;
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

    /*********************
     * ADMIN FUNCTIONS
     ********************/

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

    /*********************
     * USER FUNCTIONS
     ********************/

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
        whenNotPaused
        nonReentrant
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
        IStakedBNBToken stkBNB = IStakedBNBToken(addressStore.getStkBNB());
        /*stkBNB.mint(msg.sender, poolTokensUser, "", "");
        if (poolTokensDepositFee > 0) {
            stkBNB.mint(addressStore.getFeeVault(), poolTokensDepositFee, "", "");
        }*/

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
        nonReentrant
        checkMinAndDust("Withdrawal", config.minTokenWithdrawal, amount)
    {
        // checks
        if (msg.sender != addressStore.getStkBNB()) {
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
    function claimAll() external whenNotPaused nonReentrant {
        uint256 claimRequestCount = claimReqs[msg.sender].length;
        uint256 i = 0;

        while (i < claimRequestCount) {
            if (_claim(i)) {
                claimRequestCount--;
                continue;
            }
            i++;
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
    function claim(uint256 index) external whenNotPaused nonReentrant {
        if (!_claim(index)) {
            revert CantClaimBeforeDeadline();
        }
    }

    /*********************
     * BOT FUNCTIONS
     ********************/

    /**
     * @dev This is called by the bot in order to transfer the stakable BNB from contract to the
     * staking address on BC.
     * Call frequency: Daily
     *
     * @return The amount of stakable BNB that were transferred to the staking address on BC.
     */
    function initiateDelegation() external whenNotPaused onlyRole(BOT_ROLE) returns (uint256) {
        uint256 miniRelayFee = _TOKEN_HUB.getMiniRelayFee(); // usually 0.01 BNB
        uint256 stakableBNB = getStakableBNB();

        if (stakableBNB > 0) {
            // TODO: should we charge the relay fee from the bot?
            _TOKEN_HUB.transferOut{ value: stakableBNB + miniRelayFee }(
                _ZERO_ADDR,
                config.bcStakingWallet,
                stakableBNB,
                uint64(block.timestamp + 3600)
            );
        }

        emit DelegationInitiated(stakableBNB);

        return stakableBNB;
    }

    /**
     * @dev Called by the bot to update the exchange rate in contract based on the rewards
     * obtained in the BC staking address and accordingly mint fee tokens.
     * Call frequency: Daily
     *
     * @param bnbRewards: The amount of BNB which were received as staking rewards.
     */
    function epochUpdate(uint256 bnbRewards) external whenNotPaused onlyRole(BOT_ROLE) {
        // calculate fee
        uint256 feeWei = config.fee.reward._apply(bnbRewards);
        uint256 feeTokens = (feeWei * exchangeRate.poolTokenSupply) /
            (exchangeRate.totalWei + bnbRewards - feeWei);

        // update exchange rate
        exchangeRate._update(ExchangeRate.Data(bnbRewards, feeTokens), ExchangeRate.UpdateOp.Add);

        // mint the fee tokens to FeeVault
        /*IStakedBNBToken(addressStore.getStkBNB()).mint(
            addressStore.getFeeVault(),
            feeTokens,
            "",
            ""
        );*/

        // emit the ack event
        emit EpochUpdate(bnbRewards, feeTokens);
    }

    /**
     * @dev This is called by the bot after it has executed the unbond transaction on BC.
     * Call frequency: Weekly
     *
     * @param _bnbUnbonding: The amount of BNB for which unbonding was initiated on BC.
     *                       It can be more than bnbToUnbond, but within a factor of min undelegation amount.
     */
    function unbondingInitiated(uint256 _bnbUnbonding) external whenNotPaused onlyRole(BOT_ROLE) {
        bnbToUnbond -= int256(_bnbUnbonding);
        bnbUnbonding += _bnbUnbonding;

        emit UnbondingInitiated(_bnbUnbonding);
    }

    /**
     * @dev Called by the bot after the unbonded amount for claim fulfilment is received in BC
     * and has been transferred to the UndelegationHolder contract on BSC.
     * It calls UndelegationHolder.withdrawUnbondedBNB() to fetch the unbonded BNB to itself and
     * update `bnbUnbonding` and `claimReserve`.
     * Call frequency: Weekly
     */
    function unbondingFinished() external whenNotPaused onlyRole(BOT_ROLE) {
        uint256 unbondedAmount = IUndelegationHolder(payable(addressStore.getUndelegationHolder()))
            .withdrawUnbondedBNB();
        bnbUnbonding -= unbondedAmount;
        claimReserve += unbondedAmount;

        emit UnbondingFinished(unbondedAmount);
    }

    /*********************
     * VIEWS
     ********************/

    /**
     * @dev paused: Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view returns (bool) {
        return _paused;
    }

    /**
     * @return The amount of BNB that can be staked. This would be same as the amount that would
     * reach BC, if initiateDelegation() were called.
     * This view is used by the bot.
     */
    function getStakableBNB() public view returns (uint256) {
        uint256 miniRelayFee = _TOKEN_HUB.getMiniRelayFee();

        // if we have enough balance to send to BC, return that as the stakable amount.
        // TODO: should we put a MIN check as well? send only if the diff is greater than a min + claim + relayFee
        if (address(this).balance > claimReserve + miniRelayFee) {
            return address(this).balance - claimReserve - miniRelayFee;
        }

        // we don't have enough balance to send to BC
        return 0;
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
        for (uint256 i = 0; i < to - from; i++) {
            paginatedClaimRequests[i] = claimReqs[user][from + i];
        }

        return paginatedClaimRequests;
    }

    /*********************
     * INTERNAL FUNCTIONS
     ********************/

    function _withdraw(address from, uint256 amount) internal {
        uint256 poolTokensFee = config.fee.withdraw._apply(amount);
        uint256 poolTokensToBurn = amount - poolTokensFee;

        // calculate the BNB needed to be sent to the user
        uint256 weiToReturn = exchangeRate._calcWeiWithdrawAmount(poolTokensToBurn);

        // create a claim request for this withdrawal
        claimReqs[from].push(ClaimRequest(weiToReturn, block.timestamp));

        // update the bnbToUnbond
        bnbToUnbond += int256(weiToReturn);

        // update the exchange rate to reflect the balance changes
        exchangeRate._update(
            ExchangeRate.Data(weiToReturn, poolTokensToBurn),
            ExchangeRate.UpdateOp.Subtract
        );

        IStakedBNBToken stkBNB = IStakedBNBToken(addressStore.getStkBNB());
        // burn the non-fee tokens
        stkBNB.burn(poolTokensToBurn, "");
        if (poolTokensFee > 0) {
            // transfer the fee to FeeVault, if any
            stkBNB.send(addressStore.getFeeVault(), poolTokensFee, "");
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
        if (address(this).balance < req.weiToReturn) {
            revert InsufficientFundsToSatisfyClaim();
        }

        // update claimReserve
        claimReserve -= req.weiToReturn;

        // delete the req, as it has been fulfilled (swap deletion for O(1) compute)
        claimReqs[msg.sender][index] = claimReqs[msg.sender][claimReqs[msg.sender].length - 1];
        claimReqs[msg.sender].pop();

        // return BNB back to user
        payable(msg.sender).transfer(req.weiToReturn);
        emit Claim(msg.sender, req, block.timestamp);
        return true;
    }

    /**
     * @dev _canBeClaimed: Helper function to check whether a ClaimRequest can be claimed or not.
     *                      It is allowed to claim only after the cooldown period has finished.
     *
     * @param req: The request which needs to be checked.
     * @return true if the request can be claimed.
     */
    function _canBeClaimed(ClaimRequest memory req) public view returns (bool) {
        return block.timestamp > (req.createdAt + config.cooldownPeriod);
    }
}
