using StakedBNBToken as stkBNB
using FeeVault as feeVault


methods {
    deposit()

    // Harness methods:
    getWeiToReturn(address user, uint256 index) returns (uint256) envfree
    getPoolTokenSupply() returns (uint256) envfree
    getTotalWei() returns (uint256) envfree
    getSTKBNB() returns (address) envfree

    // Getters:
    bnbToUnbond() returns (int256) envfree
    bnbUnbonding() returns (uint256) envfree
    claimReserve() returns (uint256) envfree

    // stkBNB methods:
    stkBNB.balanceOf(address) returns (uint256) envfree
	burn(uint256 amount, bytes data) => DISPATCHER(true);
	mint(address account, uint256 amount, bytes userData, bytes operatorData) => DISPATCHER(true);
    send(address recipient,uint256 amount,bytes data) => DISPATCHER(true);

	// summarize AddressStore
	getStkBNB() => getStkBNBContract()
    getFeeVault() => getFeeVaultContract()

	//receiver - we might want to have an implementation of this 
	tokensReceived(
        address, /*operator*/
        address from,
        address to,
        uint256 amount,
        bytes , /*userData*/
        bytes  /*operatorData*/
    ) => NONDET

    // summarizing the interface implementer as arbitrary address by using a ghost function
    getInterfaceImplementer(
            address account,
            bytes32 _interfaceHash
    ) => ghostGetInterfaceImplementer()


    /**********************
     *    IERC777Sender   *
     **********************/
    tokensToSend(address, address, address, uint256, bytes, bytes) => NONDET
}

function doNothing() returns bool {
    return true;
}

/**************************************************
 *                GHOSTS AND HOOKS                *
 **************************************************/

ghost sumAllWei() returns uint256 {
    init_state axiom sumAllWei() == 0;
}

ghost ghostGetInterfaceImplementer() returns address {
    axiom ghostGetInterfaceImplementer() == 0xce4604a000000000000000000ce4604a;
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
//  TODO: Not finished!
invariant weiInClaimReqAtMostBnbToUnboungPlusBnbUnbonding(address user, uint256 index)
    getWeiToReturn(user, index) <= bnbUnbonding() + claimReserve()

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
    assert bnbToUnbondBefore > bnbToUnbondAfter => bnbUnbondingBefore < bnbUnbondingAfter;
}


/**************************************************
 *                METHOD INTEGRITY                *
 **************************************************/

// when depositing amount x, the user balance should decrease by x and the contracts total supply should increase.
// user stkBNB should increase by x.
rule integrityOfDeposit(address user, uint256 amount){
    env e;
    // e.msg.value = amount to deposit
    require e.msg.value == amount;
	require e.msg.sender == user; 

    uint256 totalSupplyBefore = getTotalWei();
    require totalSupplyBefore < amount;
    uint256 userStkBNBBalanceBefore = stkBNB.balanceOf(user);

    deposit(e);

    uint256 totalSupplyAfter = getTotalWei();
    uint256 userStkBNBBalanceAfter = stkBNB.balanceOf(user);

    assert amount != 0  => totalSupplyAfter > totalSupplyBefore;
    assert totalSupplyAfter == totalSupplyBefore + amount;
    assert amount != 0  => userStkBNBBalanceAfter > userStkBNBBalanceBefore;
}

// rule cantRequestZeroOrMoreThanDeposited(address user,uint256 amount) {
//     env e;
//     // e.msg.value = amount to deposit
//     require e.msg.value == amount;
//     require e.msg.sender == user; 

// }
rule totalWeiIncreases (method f){
    env e;
    uint256 weiBefore = getTotalWei();
    uint256 stkBefore = getPoolTokenSupply();
    calldataarg args;
    f(e,args);
    uint256 weiAfter = getTotalWei();
    uint256 stkAfter = getPoolTokenSupply();
    assert (weiBefore < weiAfter) => (stkBefore < stkAfter);
}

rule claimAllCorrectness(){
 //after claimAll(), length of claimRqst shouls be 0 
    env e;
    claimAll(e);
    assert (getClaimRequestLength(e,e.msg.sender) == 0);
}
/*
rule claimAllvsClaim(){
	env e;
    // we want to verify same amount is paid on both scenarios, example; with 3 claimRqst existing:
    //1st scenario: claimAll()
    //2nd scnario: claim(0), clain(1), claim(2)
    storage init  = lastStorage;

    require (getClaimRequestLength(e,e.msg.sender) == 3);
    claim(e,2);
    claim(e,1);
    claim(e,0);
    uint256 L1 = getClaimRequestLength(e,e.msg.sender);
    uint256 SumReserved1 = claimReserve();

    claimAll(e) at init;
    uint256 L2 = getClaimRequestLength(e,e.msg.sender);
    uint256 SumReserved2 = claimReserve();

    assert (L1 == L2);
    assert (SumReserved1 == SumReserved2);
}*/

//rule withdrawlAlwaysAppearAsClaimRequest(){

 //    env e;
    
 //    assert ();
//}
rule ClaimAll(){
    env e;
    claimAll@withrevert(e);
    assert (getClaimRequestLength(e,e.msg.sender)>1 => lastReverted);
}

rule doubleClaim(){
    env e;
    claimAll(e);
    claimAll@withrevert(e);
    assert (lastReverted);
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
    assert e.block.timestamp < getClaimRequestTimestamp(e,e.msg.sender, index) + getCooldownPeriod(e) => lastReverted;
}

rule cannotWithdrawMoreThanDeposited(){
    env e;
    uint256 userBNBBalanceBefore = bnbBalanceOf(e, e.msg.sender);
    require stkBNB.balanceOf(e.msg.sender) == 0;
    deposit(e);  // user deposits BNB and gets stkBNB
    env e3;
    bytes myData;
    stkBNB.send(e3, stkBNB, stkBNB.balanceOf(e.msg.sender), myData);  //user immediatedly sends all his stkBNB for withdraw

    env e2;  // user has to wait at least two weeks
    require e2.block.timestamp > e.block.timestamp + getCooldownPeriod(e);
    require e2.msg.sender == e.msg.sender;
    require getClaimRequestLength(e2,e2.msg.sender) == 1;
    claim(e2,0);
    //claimAll(e2);  //check if claim(e2,o) returns same value
    uint256 userBNBBalanceAfter = bnbBalanceOf(e2, e2.msg.sender);

    assert userBNBBalanceBefore >= userBNBBalanceAfter; //added = in case fee is zero (possible use case)
}


rule sanity(method f){
    env e;
    calldataarg args;
    f(e,args);
    assert false;
}

invariant claimVsClaimRequest(env e, address user)
    getClaimRequestLength(e,user) > 0 => getPoolTokenSupply() > 0

invariant claimVsClaimReserve(env e, address user)
    getClaimRequestLength(e,user) > 0 => claimReserve() > 0

invariant zeroSupplyZeroClaim()
    getPoolTokenSupply() == 0 => claimReserve() == 0

invariant bnbUnbounding()
    bnbToUnbond() <= to_int256(bnbUnbonding())