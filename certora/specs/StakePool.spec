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
    bnbUnbonding() returns (int256) envfree
    claimReserve() returns (int256) envfree

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
        bytes , /*userData*/
        bytes  /*operatorData*/
    ) => NONDET 
}


/**************************************************
 *                GHOSTS AND HOOKS                *
 **************************************************/

ghost sumAllWei() returns uint256 {
    init_state axiom sumAllWei() == 0;
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
    getWeiToReturn(user, index) <= bnbToUnbond() + bnbUnbonding() + claimReserve()

/**************************************************
 *               STATE TRANSITIONS                *
 **************************************************/

rule bnbToUnbondAndBnbUnboundingCorrelation(method f, address user) {
    env e;
    require user == e.msg.sender && user != currentContract;

    mathint bnbToUnbondBefore = bnbToUnbond();
    mathint bnbUnbondingBefore = bnbUnbonding();

    calldataarg args;
    f(e, args);

    mathint bnbToUnbondAfter = bnbToUnbond();
    mathint bnbUnbondingAfter = bnbUnbonding();

    assert bnbToUnbondBefore <= bnbToUnbondAfter => bnbUnbondingBefore = bnbUnbondingAfter;
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


rule sanity(method f){
	env e;
	calldataarg args;
	f(e,args);
	assert false;
}