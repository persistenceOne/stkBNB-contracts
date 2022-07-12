using StakedBNBToken as stkBNB


methods {
    deposit()

    // Harness methods:
    getPoolTokenSupply() returns (uint256) envfree
    getTotalWei() returns (uint256) envfree
    getSTKBNB() returns (address) envfree

    // Getters:
    bnbToUnbond() returns (int256) envfree

    // stkBNB methods:
    stkBNB.balanceOf(address) returns (uint256) envfree
}

// when depositing amount x, the user balance should decrease by x and the contracts total supply should increase.
// user stkBNB should increase by x.
rule integrityOfDeposit(address user, uint256 amount){
    env e;
    // e.msg.value = amount to deposit
    require e.msg.value == amount;

    require getSTKBNB() == stkBNB;

    uint256 totalSupplyBefore = getTotalWei();
    uint256 userStkBNBBalanceBefore = stkBNB.balanceOf(user);

    deposit(e);

    uint256 totalSupplyAfter = getTotalWei();
    uint256 userStkBNBBalanceAfter = stkBNB.balanceOf(user);

    assert amount != 0  => totalSupplyAfter > totalSupplyBefore;
    assert totalSupplyAfter == totalSupplyBefore + amount;
    assert amount != 0  => userStkBNBBalanceAfter > userStkBNBBalanceBefore;
    assert false;
}


rule sanity(method f){
	env e;
	calldataarg args;
	f(e,args);
	assert false;
}