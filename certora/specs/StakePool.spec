using StakedBNBToken as stkBNB
using FeeVault as feeVault
using StakePoolHarness as stakePoolContract
using UndelegationHolder as delegationHolder


methods {
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
    // this summarization applies only to calls from ERC777:_callTokensReceived 
    //however calls directly to StakePool:tokensReceived are not summarized 
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
    

    getStakePool() returns (address) => ghostGetStakePool();

    withdrawUnbondedBNB() returns (uint256) => DISPATCHER(true);
  
    // summarizing the interface implementer as arbitrary address by using a ghost function
    getInterfaceImplementer(
            address account,
            bytes32 _interfaceHash
    ) => NONDET

    setInterfaceImplementer(
        address account,
        bytes32 _interfaceHash,
        address implementer
    ) => NONDET

    //ERC777 summarizing

    transfer(address recipient, uint256 amount) returns (bool) => DISPATCHER(true);

    transferOut(
        address contractAddr,
        address recipient,
        uint256 amount,
        uint64 expireTime
    ) returns (bool) => DISPATCHER(true);

    send(address,uint256,bytes) => DISPATCHER(true);

    /**********************
     *    IERC777Sender   *
     **********************/
    tokensToSend(address, address, address, uint256, bytes, bytes) => NONDET
}

/**************************************************
 *                GHOSTS AND HOOKS                *
 **************************************************/

/* a ghost to summarize the total claims per user */
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




invariant weiZeroTokensZero()
    getTotalWei() == 0 =>  getPoolTokenSupply() == 0
    {
        preserved epochUpdate(uint256 bnbRewards) with (env e){
            require getTotalWei() > 0;
        } 
    }


//Token total supply should be the same as stakePool exchangeRate poolTokenSupply.
invariant totalTokenSupply()
    getPoolTokenSupply() == stkBNB.totalSupply()
    filtered { f -> !f.isView && !f.isFallback && f.selector != initialize(address,(address,uint256,uint256,uint256,uint256,uint256,(uint256,uint256,uint256))).selector }



/**************************************************
 *               STATE TRANSITIONS                *
 **************************************************/




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
    uint256 rewardFee;
    uint256 depositFee;
    uint256 withdrawFee;
    rewardFee, depositFee, withdrawFee = getFee();
    // assumptions 
    require rewardFee < 100000000000 && depositFee < 100000000000 && withdrawFee < 100000000000;

    uint256 totalSupplyBefore = getTotalWei();
    uint256 poolTokenBefore = getPoolTokenSupply();
    // 100 always more than 50 - , 51 - 100
    // 1:1 to 1:1.999
    // 
    uint256 userStkBNBBalanceBefore = stkBNB.balanceOf(user);
    require totalSupplyBefore + amount <= 2000000000000000000000000;
    require getMinBNBDeposit() >= 1000000000000;
    require 2 * poolTokenBefore > totalSupplyBefore && poolTokenBefore <= totalSupplyBefore;
    deposit(e);

    uint256 totalSupplyAfter = getTotalWei();
    uint256 poolTokenAfter = getPoolTokenSupply();
    uint256 userStkBNBBalanceAfter = stkBNB.balanceOf(user);

    assert amount != 0  => totalSupplyAfter > totalSupplyBefore;
    assert amount != 0  => poolTokenAfter > poolTokenBefore;
    assert amount != 0  => userStkBNBBalanceAfter > userStkBNBBalanceBefore;
    // vacutity check 
}


// rule ifTotalStkTokensIncreaseThenTotalWeiMustIncrease (method f){
rule correlationPoolTokenSupplyVsTotalWei (method f){
    env e;
    uint256 weiBefore = getTotalWei();
    uint256 stkBefore = getPoolTokenSupply();
    calldataarg args;
    f(e,args);
    uint256 weiAfter = getTotalWei();
    uint256 stkAfter = getPoolTokenSupply();
    assert (stkBefore < stkAfter) => (weiBefore < weiAfter);
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
rule totalAssetOfUserPreserved(method f, address user) {
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
        require eSend.msg.sender == user;
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
    
    // values after
    uint256 userBNBBalanceAfter = bnbBalanceOf(user);
    uint256 userStkBNBBalanceAfter = stkBNB.balanceOf(user);
     mathint sumClaimsPerUserAfter = sumClaimsPerUser[user];

    mathint totalAfter = userBNBBalanceAfter + userStkBNBBalanceAfter + sumClaimsPerUserAfter;

    assert totalBefore == totalAfter;
}


//User should deposit at least minBNBDeposit tokens.
rule depositAtLeastMinBNB(env e){
    uint256 minDeposit = getMinBNBDeposit();
    deposit@withrevert(e);
    assert e.msg.value < minDeposit => lastReverted;
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
}

 rule initAllowedOnlyOnce(method f){
    env e; env e1;
    calldataarg args; calldataarg args1;
    initialize(e,args);
    initialize@withrevert(e1,args1);
    bool reverted = lastReverted;
    assert reverted;
 }


/*************** NEED MORE WORK *******/

/*** Rules that might not be accurate - they have violations ***/

rule bnbToUnbondAndBnbUnboundingCorrelation(method f, address user)filtered {f-> f.selector != initialize(address,(address,uint256,uint256,uint256,uint256,uint256,(uint256,uint256,uint256))).selector }
{
    env e;
    require user == e.msg.sender && user != currentContract;
    uint256 rewardFee;
    uint256 depositFee;
    uint256 withdrawFee;
    rewardFee, depositFee, withdrawFee = getFee();
    // assumptions 
    require rewardFee == 0 && depositFee < 100000000000 && withdrawFee == 0;

    uint256 totalSupplyBefore = getTotalWei();
    uint256 poolTokenBefore = getPoolTokenSupply();
    // 100 always more than 50 - , 51 - 100
    // 1:1 to 1:1.999
    // 
    uint256 userStkBNBBalanceBefore = stkBNB.balanceOf(user);
    require totalSupplyBefore <= 2000000000000000000000000;
    require getMinBNBDeposit() >= 1000000000000;
    require 2 * poolTokenBefore > totalSupplyBefore && poolTokenBefore <= totalSupplyBefore;

    int256 bnbToUnbondBefore = bnbToUnbond();
    uint256 bnbUnbondingBefore = bnbUnbonding();

    calldataarg args;
    f(e, args);

    int256 bnbToUnbondAfter = bnbToUnbond();
    uint bnbUnbondingAfter = bnbUnbonding();

    assert bnbToUnbondBefore == bnbToUnbondAfter && f.selector != unbondingFinished().selector => bnbUnbondingBefore == bnbUnbondingAfter;
    assert bnbToUnbondBefore > bnbToUnbondAfter && f.selector != initiateDelegation().selector => bnbUnbondingBefore < bnbUnbondingAfter;
    assert bnbToUnbondBefore > bnbToUnbondAfter && f.selector == initiateDelegation().selector => bnbUnbondingBefore == bnbUnbondingAfter;
    assert bnbUnbondingBefore < bnbUnbondingAfter && f.selector == unbondingFinished().selector=> bnbToUnbondBefore == bnbToUnbondAfter;
    // Issue in claimAll() causing indexOutOfBound exception
    assert false;
}


// Need to strength these invariants and prove that the sum of all weiToReturn or similar to totalAssetOfUserPreserved

// Also we totalWei is zero probably many other variables are also empty\zero - can be improved



// invariant singleUserSolvency(address user, uint256 index)
//     getWeiToReturn(user, index) <= bnbToUnbound() + bnbUnbonding() + claimReserve()
//     filtered { f -> !f.isView && !f.isFallback && f.selector != initialize(address,(address,uint256,uint256,uint256,uint256,(uint256,uint256,uint256))).selector }

invariant zeroWeiZeroSTK(method f, address user)
    getTotalWei() == 0 => stkBNB.balanceOf(user) == 0
    filtered { f -> !f.isView && !f.isFallback && f.selector != initialize(address,(address,uint256,uint256,uint256,uint256,uint256,(uint256,uint256,uint256))).selector }

invariant zeroWeiZeroClaims(env e, address user)
    getTotalWei() == 0 => getClaimRequestLength(e,user) == 0
    filtered { f -> !f.isView && !f.isFallback && f.selector != initialize(address,(address,uint256,uint256,uint256,uint256,uint256,(uint256,uint256,uint256))).selector }


// Not sure that this is correct 

invariant integrityOfBoundingValues()
    bnbToUnbond() > 0 => (to_uint256(bnbToUnbond()) <= bnbUnbonding())
    filtered { f -> !f.isView && !f.isFallback && f.selector != initialize(address,(address,uint256,uint256,uint256,uint256,uint256,(uint256,uint256,uint256))).selector }



/****  rules for info and checking the ghost and tool - expecting to fail ****/
/* 
 rule sanity(method f){
     env e;
     calldataarg args;
     f(e,args);
     assert false;
 }

rule whoChangedClaimRequests(method f) {
    env e;
    calldataarg args;
    address user;
    mathint before = sumClaimsPerUser[user];
    f(e,args);
    mathint after = sumClaimsPerUser[user];
    
    assert before == after; 
}
*/


rule unbondingFinished(){
    env e;
    require e.msg.sender == stakePoolContract;
    uint256 bnbUnbondingBefore = bnbUnbonding();
    uint256 claimReserveBefore = claimReserve();
    uint256 undelegationHolderBalanceBefore = bnbBalanceOf(delegationHolder);

    unbondingFinished(e);

    uint256 bnbUnbondingAfter = bnbUnbonding();
    uint256 claimReserveAfter = claimReserve();
    uint256 undelegationHolderBalanceAfter = bnbBalanceOf(delegationHolder);

    assert bnbUnbondingBefore > bnbUnbondingAfter => claimReserveAfter > claimReserveBefore && bnbUnbondingBefore - bnbUnbondingAfter == claimReserveAfter - claimReserveBefore && undelegationHolderBalanceBefore - undelegationHolderBalanceAfter == claimReserveAfter - claimReserveBefore;
}   