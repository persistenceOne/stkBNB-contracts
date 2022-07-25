using StakedBNBToken as stkBNB
using FeeVault as feeVault
using StakePoolHarness as stakePoolContract


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

    // Getters:
    bnbToUnbond() returns (int256) envfree
    bnbUnbonding() returns (uint256) envfree
    claimReserve() returns (uint256) envfree
    getCooldownPeriod() returns (uint256) envfree

    // stkBNB methods:
    stkBNB.balanceOf(address) returns (uint256) envfree
    burn(uint256 amount, bytes data) => DISPATCHER(true);
    mint(address account, uint256 amount, bytes userData, bytes operatorData) => DISPATCHER(true);

    // summarize AddressStore
    getStkBNB() => getStkBNBContract()
    getFeeVault() => getFeeVaultContract()

    //receiver - we might want to have an implementation of this 
    tokensReceived(
        address, /*operator*/
        address from,
        address to,
        uint256 amount,
        bytes calldata, /*userData*/
        bytes  calldata/*operatorData*/
    //) => NONDET
    ) => DISPATCHER(true);

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

ghost ghostGetInterfaceImplementer() returns address {
    axiom ghostGetInterfaceImplementer() == 0xce4604a000000000000000000ce4604a;
}

ghost ghostGetStakePool() returns address {
    axiom ghostGetStakePool() == currentContract;
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

//invariant claimVsClaimRequest(env e, address user)
 //   getClaimRequestLength(e,user) > 0 => getPoolTokenSupply() > 0
 //   getClaimRequestLength(e,user) > 0 => bnbBalanceOf(e, e.msg.this) > 0


invariant bnbUnbounding()
    bnbToUnbond() <= to_int256(bnbUnbonding())

invariant claimReqIndexOrder(env e, uint256 i, uint256 j)
    (i<j) => getClaimRequestTimestamp(e,e.msg.sender, i) < getClaimRequestTimestamp(e,e.msg.sender, j) 
    //TBD -  call resolution tokensReceived fix.

invariant exchangeRate()
    getTotalWei() == getPoolTokenSupply()
//invariant exchangeRate()

//Token total supply should be the same as stakePool exchangeRate poolTokenSupply.
//TBD
invariant totalTokenSupply()
    getPoolTokenSupply() >= stkBNB.balanceOf(stkBNB) //stkBNB == getStkBnbAddress() ?
    //getPoolTokenSupply() == stkBNB.balanceOf(stkBNB)
    //tbd - check how balance of works, if it matters from where to pull
  //stkBNB.balanceOf(getBcStakingWallet())==  getStakePoolAddress().balanceOf(getBcStakingWallet())

/**************************************************
 *               STATE TRANSITIONS                *
 **************************************************/

rule bnbToUnbondAndBnbUnboundingCorrelation(method f, address user) {
    env e;
    require user == e.msg.sender && user != currentContract;

    int256 bnbToUnbondBefore = bnbToUnbond();
    uint256 bnbUnbondingBefore = bnbUnbonding();

    calldataarg args;
    f(e, args);

    int256 bnbToUnbondAfter = bnbToUnbond();
    uint bnbUnbondingAfter = bnbUnbonding();

    assert bnbToUnbondBefore <= bnbToUnbondAfter => bnbUnbondingBefore == bnbUnbondingAfter;
    assert bnbToUnbondBefore >= bnbToUnbondAfter => bnbUnbondingBefore <= bnbUnbondingAfter;
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
    assert false;
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
    assert (false);
}

rule claimAllCorrectness(){ 
    env e; env e2;
    uint256 index;
    bool notAllCanBeClaimed  = index < getClaimRequestLength(e,e.msg.sender) && !canBeClaimed(e, index);
    claimAll(e);
    assert notAllCanBeClaimed => getClaimRequestLength(e2,e.msg.sender) > 0;
}
rule claimAllCorrectness2(){   
    env e;
    uint256 index;
    claimAll(e);
    assert !canBeClaimed(e, index);
}
rule claimOnEmpty(){    
    env e;
    uint256 index;
    require (getClaimRequestLength(e,e.msg.sender)==0);
    claim@withrevert(e,index);
    assert (lastReverted);
}

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



rule userDoesNotChangeOtherUserBalance(method f){
    env e;
    address user;
    calldataarg args;
  
    uint256 userStkBNBBalanceUserBefore = stkBNB.balanceOf(user);
    f(e,args);
    uint256 userStkBNBBalanceUserAfter = stkBNB.balanceOf(user);
    assert (user != e.msg.sender => userStkBNBBalanceUserBefore == userStkBNBBalanceUserAfter);
}

rule claimCanNotBeFulFilledBeforeCoolDownPeriod(){
    env e;
    uint256 index;
    claim@withrevert(e, index);
    bool reverted = lastReverted;
    assert e.block.timestamp < getClaimRequestTimestamp(e,e.msg.sender, index) + getCooldownPeriod() => reverted;
}

rule cannotWithdrawMoreThanDeposited(){
    env e;
    //uint256 userBNBBalanceBefore = bnbBalanceOf(e, e.msg.sender);
    //require stkBNB.balanceOf(e.msg.sender) == 0;
    deposit(e);  // user deposits BNB and gets stkBNB
    //env e3;
    //bytes myData;
    //stkBNB.send(e3, currentContract , stkBNB.balanceOf(e.msg.sender), myData);  //user immediatedly sends all his stkBNB for withdraw

    //env e2;  // user has to wait at least two weeks
    //require e2.block.timestamp > e.block.timestamp + getCooldownPeriod();
    //require e2.msg.sender == e.msg.sender;
    //require getClaimRequestLength(e2,e2.msg.sender) == 1;
    //claim(e2,0);
    //claimAll(e2);  //check if claim(e2,o) returns same value
    //uint256 userBNBBalanceAfter = bnbBalanceOf(e2, e2.msg.sender);

    //assert userBNBBalanceBefore >= userBNBBalanceAfter; //added = in case fee is zero (possible use case)
    assert false;
}

rule testDeposit(){
    env e;
    deposit(e);
    assert false;
}

//User should deposit at least minBNBDeposit tokens.
rule depositAtLeastMinBNB(env e){
    uint256 minDeposit = getMinBNBDeposit();
    deposit@withrevert(e);
    assert e.msg.value < minDeposit => lastReverted;
}

//User should make withdrawal of at least minTokenWithdrawal tokens.
rule WithdrawalAtLeastMinToken(env e){
    uint256 minWithdrawl = getMinTokenWithdrawal();
    address stkBnbAddr;
    address generalOperator;
    address from;
    address to;
    uint256 amount;
    bytes   data;

    tokensReceived@withrevert(e, generalOperator, from, to, amount, data,data);
    assert amount < minWithdrawl => lastReverted;
}

// rule sanity(method f){
//     env e;
//     calldataarg args;
//     f(e,args);
//     assert false;
// }

