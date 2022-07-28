using StakedBNBToken as stkBNB
using FeeVault as feeVault
using StakePoolHarness as stakePoolContract
using UndelegationHolder as delegationHolder


methods {
    //deposit()
    unpause()

    // Harness methods:
    getWeiToReturn(address user, uint256 index) returns (uint256) envfree
    getPoolTokenSupply() returns (uint256) envfree
    getTotalWei() returns (uint256) envfree
    getStkBnbAddress() returns (address) envfree
    getStakePoolAddress() returns (address) envfree
    getMinBNBDeposit() returns (uint256) envfree
    getMinTokenWithdrawal() returns (uint256) envfree
    bnbBalanceOf(address) returns (uint256) envfree
    getFee() returns ( uint256, uint256, uint256) envfree

    // Getters:
    bnbToUnbond() returns (int256) envfree
    bnbUnbonding() returns (uint256) envfree
    claimReserve() returns (uint256) envfree
    getCooldownPeriod() returns (uint256) envfree

    // stkBNB methods:
    stkBNB.balanceOf(address) returns (uint256) envfree
    stkBNB.totalSupply() returns (uint256) envfree
    burn(uint256 amount, bytes data) => DISPATCHER(true);
    mint(address account, uint256 amount, bytes userData, bytes operatorData) => DISPATCHER(true);

    // summarize AddressStore
    getStkBNB() => getStkBNBContract()
    getFeeVault() => getFeeVaultContract()

    //receiver - we might want to have an implementation of this. for now we assume an empty implementation 
    tokensReceived(
        address, /*operator*/
        address from,
        address to,
        uint256 amount,
        bytes calldata, /*userData*/
        bytes calldata/*operatorData*/
    ) => NONDET

    _callTokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes userData,
        bytes operatorData,
        bool requireReceptionAck
    )  => NONDET
    // ) => DISPATCHER(true);

    // deposit() => DISPATCHER(true);
    // epochUpdate(uint256) =>  DISPATCHER(true);
    
    getStakePool() returns (address) => ghostGetStakePool();

    withdrawUnbondedBNB() returns (uint256) => DISPATCHER(true);
  
    // summarizing the interface implementer as arbitrary address by using a ghost function
    getInterfaceImplementer(
            address account,
            bytes32 _interfaceHash
    //) => ghostGetInterfaceImplementer()
    ) => NONDET
    //) => ALWAYS(0xce4604a000000000000000000ce4604a);

    setInterfaceImplementer(
        address account,
        bytes32 _interfaceHash,
        address implementer
    ) => NONDET

    transfer(address recipient, uint256 amount) returns (bool) => DISPATCHER(true);

    transferOut(
        address contractAddr,
        address recipient,
        uint256 amount,
        uint64 expireTime
    ) returns (bool) => DISPATCHER(true);

    //ERC777 summarizing
    send(address,uint256,bytes) => DISPATCHER(true);

    /**********************
     *    IERC777Sender   *
     **********************/
    tokensToSend(address, address, address, uint256, bytes, bytes) => NONDET
}

/**************************************************
 *                GHOSTS AND HOOKS                *
 **************************************************/
/*ghost sumAllWei() returns uint256 {
    init_state axiom sumAllWei() == 0;
}*/

/*
ghost ghostGetInterfaceImplementer() returns address {
    axiom ghostGetInterfaceImplementer() == 0xce4604a000000000000000000ce4604a;
}
*/

ghost mapping(address => mathint) sumClaimsPerUser {
    init_state axiom forall address u. sumClaimsPerUser[u] == 0;
}

ghost ghostGetStakePool() returns address {
    axiom ghostGetStakePool() == currentContract;
}

/*
on update to 
    claimReqs[user][i].weiToReturn = amount
when before
    claimReqs[user][i].weiToReturn == old_amount

then update 
    sumClaimsPerUser[user] := sumClaimsPerUser[user] + amount - old_amount 
*/

hook Sstore claimReqs[KEY address user][INDEX uint256 i].weiToReturn uint256 amount
    (uint256 old_amount) STORAGE {
        sumClaimsPerUser[user] = sumClaimsPerUser[user] + 
            to_mathint(amount) - to_mathint(old_amount);
    }

rule whoChangedGhost(method f) {
    env e;
    calldataarg args;
    address user;
    mathint before = sumClaimsPerUser[user];
    f(e,args);
    mathint after = sumClaimsPerUser[user];
    
    assert before == after; 
}

/**************************************************
 *               CVL FUNCS & DEFS                 *
 **************************************************/

function getStkBNBContract() returns address {
    return stkBNB;
}

function getFeeVaultContract() returns address {
    return feeVault;
}


/**************************************************
 *                 VALID STATES                   *
 **************************************************/
invariant weiInClaimReqAtMostBnbToUnboungPlusBnbUnbonding(address user, uint256 index)
    getWeiToReturn(user, index) <= bnbUnbonding() + claimReserve()
    filtered { f -> !f.isView && !f.isFallback && f.selector != initialize(address,(address,uint256,uint256,uint256,(uint256,uint256,uint256))).selector }
    {
        preserved with (env e){
            require e.msg.sender != stkBNB;
        }
    }

//invariant claimVsClaimRequest(env e, address user)
 //   getClaimRequestLength(e,user) > 0 => getPoolTokenSupply() > 0
 //   getClaimRequestLength(e,user) > 0 => bnbBalanceOf(e, e.msg.this) > 0


invariant bnbUnbounding()
    bnbToUnbond() <= to_int256(bnbUnbonding())
    filtered { f -> !f.isView && !f.isFallback && f.selector != initialize(address,(address,uint256,uint256,uint256,(uint256,uint256,uint256))).selector }
    {
        preserved with (env e){
            require e.msg.sender != stkBNB;
        }
    }

invariant exchangeRate()
    getTotalWei() == 0 =>  getPoolTokenSupply() == 0
//invariant exchangeRate()

//Token total supply should be the same as stakePool exchangeRate poolTokenSupply.
//TBD
invariant totalTokenSupply()
    getPoolTokenSupply() == stkBNB.totalSupply()
    filtered { f -> !f.isView && !f.isFallback && f.selector != initialize(address,(address,uint256,uint256,uint256,(uint256,uint256,uint256))).selector }

invariant zeroWeiZeroSTK(method f, address user)
    getTotalWei() == 0 => stkBNB.balanceOf(user) == 0
    filtered { f -> !f.isView && !f.isFallback && f.selector != initialize(address,(address,uint256,uint256,uint256,(uint256,uint256,uint256))).selector }
    {
        preserved with (env e){
            require e.msg.sender != stkBNB;
        }
    }

invariant zeroWeiZeroClaims(env e, address user)
    getTotalWei() == 0 => getClaimRequestLength(e,user) == 0
    filtered { f -> !f.isView && !f.isFallback && f.selector != initialize(address,(address,uint256,uint256,uint256,(uint256,uint256,uint256))).selector }
    {
        preserved with (env e1){
            require e1.msg.sender != stkBNB;
        }
    }

// what can we say about bnbBalanceOf(currentContract) //stkBNB == getStkBnbAddress() ?
    //getPoolTokenSupply() == stkBNB.balanceOf(stkBNB)
    //tbd - check how balance of works, if it matters from where to pull
  //stkBNB.balanceOf(getBcStakingWallet())==  getStakePoolAddress().balanceOf(getBcStakingWallet())

/**************************************************
 *               STATE TRANSITIONS                *
 **************************************************/

rule bnbToUnbondAndBnbUnboundingCorrelation(method f, address user) filtered {f-> f.selector != initialize(address,(address,uint256,uint256,uint256,(uint256,uint256,uint256))).selector }
{
    env e;
    require user == e.msg.sender && user != currentContract;
    
    int256 bnbToUnbondBefore = bnbToUnbond();
    uint256 bnbUnbondingBefore = bnbUnbonding();

    calldataarg args;
    f(e, args);

    int256 bnbToUnbondAfter = bnbToUnbond();
    uint bnbUnbondingAfter = bnbUnbonding();

    assert bnbToUnbondBefore <= bnbToUnbondAfter => bnbUnbondingBefore == bnbUnbondingAfter;
    assert bnbToUnbondBefore > bnbToUnbondAfter => bnbUnbondingBefore < bnbUnbondingAfter;
}


rule userDoesNotChangeOtherUserBalance(method f){
    env e;
    address user;
    calldataarg args;
    // stkBNB contract is allowed to mint and burn, so we do not include it
    // therefore function tokensReceived is not checked 
    require e.msg.sender != stkBNB;
    // feeVault contract collects the fees, so we do not include it in the test
    require user != feeVault;
    uint256 userStkBNBBalanceUserBefore = stkBNB.balanceOf(user);
    f(e,args);
    uint256 userStkBNBBalanceUserAfter = stkBNB.balanceOf(user);
    assert ((user != e.msg.sender) => userStkBNBBalanceUserBefore == userStkBNBBalanceUserAfter);
}


/**************************************************
 *                METHOD INTEGRITY                *
 **************************************************/

// when depositing amount x, the user balance should decrease by x and the contracts total supply should increase.
// user stkBNB should increase by x.
rule integrityOfDeposit(address user, uint256 amount){
    env e;

    require e.msg.value == amount;
    require e.msg.sender == user; 

    uint256 totalSupplyBefore = getTotalWei();
    uint256 userStkBNBBalanceBefore = stkBNB.balanceOf(user);

    deposit(e);

    uint256 totalSupplyAfter = getTotalWei();
    uint256 userStkBNBBalanceAfter = stkBNB.balanceOf(user);

    assert amount != 0  => totalSupplyAfter > totalSupplyBefore;
    assert amount != 0  => userStkBNBBalanceAfter > userStkBNBBalanceBefore;
    // assert false;
}

// rule cantRequestZeroOrMoreThanDeposited(address user,uint256 amount) {
//     env e;
//     // e.msg.value = amount to deposit
//     require e.msg.value == amount;
//     require e.msg.sender == user; 

// }
rule ifTotalStkTokensIncreaseThenTotalWeiMustIncrease (method f){
    env e;
    uint256 weiBefore = getTotalWei();
    uint256 stkBefore = getPoolTokenSupply();
    calldataarg args;
    f(e,args);
    uint256 weiAfter = getTotalWei();
    uint256 stkAfter = getPoolTokenSupply();
    assert (stkBefore < stkAfter) => (weiBefore < weiAfter);
    // assert (false);
}

// if there is a claim that can NOT be claimed => after claimAll(), there are claims left
// claimAll() does not delete unclaimable claims
rule claimAllCorrectness(){ 
    env e; //env e2;
    uint256 index;
    bool notAllCanBeClaimed  = index < getClaimRequestLength(e,e.msg.sender) && !canBeClaimed(e, index);
    claimAll(e);
    assert notAllCanBeClaimed => getClaimRequestLength(e,e.msg.sender) > 0;
}

// if a user did claimAll() => all the claims that are left are not claimable
rule claimAllCorrectness2(){   
    env e;
    uint256 index;
    claimAll(e);
    assert !canBeClaimed(e, index);
}

// if user has no claims => claim() will revert
rule claimOnEmpty(){    
    env e;
    uint256 index;
    require (getClaimRequestLength(e,e.msg.sender)==0);
    claim@withrevert(e,index);
    assert (lastReverted);
}

/* (only true in case all 3 claims are claimable)
//Claim All will work only if all claims are available. else- it would do revert. 
//if ClaimAll is designed to claim all available this function is expected to fail.
rule claimAllvsClaim(){
    env e;
    // we want to verify same amount is paid on both scenarios, example; with 3 claimRqst existing:
    //1st scenario: claimAll()
    //2nd scnario: claim(0), clain(0), claim(0)
    storage init  = lastStorage;
    // uint256 SumReservedBefore = claimReserve();
    
    require (getClaimRequestLength(e,e.msg.sender) == 3);
    claim(e,0);
    claim(e,0);
    claim(e,0);
    uint256 L1 = getClaimRequestLength(e,e.msg.sender);
    uint256 SumReserved1 = claimReserve();

    claimAll(e) at init;
    uint256 L2 = getClaimRequestLength(e,e.msg.sender);
    uint256 SumReserved2 = claimReserve();

    assert (L1 == L2);
    assert (SumReserved1 == SumReserved2);
}
*/


rule claimCanNotBeFulFilledBeforeCoolDownPeriod(){
    env e;
    uint256 index;
    uint256 claimRequestTimestamp = getClaimRequestTimestamp(e, e.msg.sender, index);
    claim@withrevert(e, index);
    bool reverted = lastReverted;
    assert e.block.timestamp < claimRequestTimestamp + getCooldownPeriod() => reverted;
    // assert false;
}


/** verifying that one can not gain or lose **/
/** checking this on a 1 exchange rate and no fee- can be adjusted to more cases **/
totalAssetOfUserPreserved(method f, address user) {
    uint256 rewardFee;
    uint256 depositFee;
    uint256 withdrawFee;
    rewardFee, depositFee, withdrawFee = getFee();
    // assumptions 
    require rewardFee == 0 && depositFee == 0 && withdrawFee == 0;
    require getTotalWei() == getPoolTokenSupply();
    // safe assumption - as rule breaks on this cases 
    require user != currentContract && user != delegationHolder; 
    // values before
    uint256 userBNBBalanceBefore = bnbBalanceOf(user);
    uint256 userStkBNBBalanceBefore = stkBNB.balanceOf(user);
    mathint sumClaimsPerUserBefore = sumClaimsPerUser[user];

    mathint totalBefore = userBNBBalanceBefore + userStkBNBBalanceBefore + sumClaimsPerUserBefore; 

    /* for tokensReceived - first call send of stkBNB and then since the send function will not call tokensReceived (nondet)- we can call it */
   if (f.selector ==  (tokensReceived(address, address, address, uint256, bytes, bytes)).selector) {
        env eSend;
        uint256 amount;
        bytes data; 
        //require (eSend == user); // env vs address - TBD
        stkBNB.send(eSend, currentContract, amount, data);
        //we have a nondet summarization 
        env eRec;
        tokensReceived(eRec, _, user, user, amount, _, _ );
    }
    else {   
        env e;
        calldataarg args;
        f(e,args);
    }
    
    // values before
    uint256 userBNBBalanceAfter = bnbBalanceOf(user);
    uint256 userStkBNBBalanceAfter = stkBNB.balanceOf(user);
     mathint sumClaimsPerUserAfter = sumClaimsPerUser[user];

    mathint totalAfter = userBNBBalanceAfter + userStkBNBBalanceAfter + sumClaimsPerUserAfter;

    assert totalBefore == totalAfter;
}

/*
rule testDeposit(){
    env e;
    deposit(e);
    assert false;
}
*/

//User should deposit at least minBNBDeposit tokens.
rule depositAtLeastMinBNB(env e){
    uint256 minDeposit = getMinBNBDeposit();
    deposit@withrevert(e);
    assert e.msg.value < minDeposit => lastReverted;
    // assert false;
}

//User should make withdrawal of at least minTokenWithdrawal tokens.
rule withdrawalAtLeastMinToken(env e){
    uint256 minWithdrawal = getMinTokenWithdrawal();
    //address stkBnbAddr;
    address generalOperator;
    address from;
    address to;
    uint256 amount;
    bytes   data;

    tokensReceived@withrevert(e, generalOperator, from, to, amount, data, data);
    assert amount < minWithdrawal => lastReverted;
    // assert false;
}

 rule sanity(method f){
     env e;
     calldataarg args;
     f(e,args);
     assert false;
 }

