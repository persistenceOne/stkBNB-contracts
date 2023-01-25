using FeeVault as feeVault
using StakedBNBTokenHarness as stakedBNBContract
using UndelegationHolder as delegationHolder
using StakePool as stakePoolContract
using TimelockedAdmin as timelockedAdminContract

methods {
    // Harness methods:
    getStakePoolAddress() returns (address) envfree
    mint(address,uint256, bytes, bytes) => DISPATCHER(true)
    burn(uint256, bytes) => DISPATCHER(true)
    getStakePool() returns (address) => ghostGetStakePool();
    getTimelockedAdmin() returns (address) => ghostGetTimelockedAdmin();
    transferOwnership(address) => DISPATCHER(true);
    getOwner() => DISPATCHER(true);
    paused() => DISPATCHER(true);
    pause() => DISPATCHER(true);
    unpause() => DISPATCHER(true);
    balanceOf(address) returns (uint256)=> DISPATCHER(true);
    allowanace(address, address) returns (uint256)=> DISPATCHER(true);
    transfer(address, uint256) returns (bool) => DISPATCHER(true);
    transferFrom(address, address, uint256) returns (bool) => DISPATCHER(true);
    send(address, bytes) => DISPATCHER(true);
    operatorSend(address, address, bytes, bytes) => DISPATCHER(true);
}

/**************************************************
 *                GHOSTS AND HOOKS                *
 **************************************************/

ghost ghostGetStakePool() returns address {
    axiom ghostGetStakePool() == stakePoolContract;
}

ghost ghostGetTimelockedAdmin() returns address {
    axiom ghostGetTimelockedAdmin() == timelockedAdminContract;
}

rule OnlyMinterCanMint(method f)filtered {f-> f.selector == mint(address,uint256, bytes, bytes).selector} {
    env e;
    calldataarg args;
    f(e, args);
    assert(e.msg.sender == getStakePoolAddress());
}

rule OnlyBurnerCanBurn(method f)filtered {f-> f.selector == burn(uint256, bytes).selector || f.selector == operatorBurn(address,uint256, bytes, bytes).selector} {
    env e;
    calldataarg args;
    f(e, args);
    assert(e.msg.sender == getStakePoolAddress());
}

rule OwnerCanChangeOwnership(address user){
    env e;
    require e.msg.sender != user;
    transferOwnership(e,user);
    assert user == getOwner(e);
}

rule OnlyOwnerCanPause(){
    env e;
    pause(e);
    assert e.msg.sender == getOwner(e) <=> paused(e) == true;
}

rule OnlyOwnerCanUnpause(){
    env e;
    unpause(e);
    assert e.msg.sender == getOwner(e) <=> paused(e) == false;
}

rule TransferSumOfFromAndToBalancesStaySame(address to, uint256 amount) {
    env e;
    mathint sum = stakedBNBContract.balanceOf(e,e.msg.sender) + stakedBNBContract.balanceOf(e,to);
    require sum < max_uint256;

    uint256 totalSupplyBefore = totalSupply(e);
    transfer(e, to, amount); 
    uint256 totalSupplyAfter = totalSupply(e);
    // make use of send method too here
    assert stakedBNBContract.balanceOf(e,e.msg.sender) + balanceOf(e,to) == sum;
    assert totalSupplyBefore == totalSupplyAfter;
}

rule TransferDoesntChangeOtherBalance(address to, uint256 amount, address other) {
    env e;
    require other != e.msg.sender;
    require other != to && other != currentContract;
    uint256 balanceBefore = balanceOf(e, other);
    transfer(e, to, amount);
    uint256 balanceAfter = balanceOf(e, other);
    assert balanceBefore == balanceAfter;
}


rule TransferCorrelation(address to, uint256 amount) {
    env e;
    uint256 balanceBefore = balanceOf(e, e.msg.sender);
    transfer(e, to, amount); 
    assert amount > 0 => amount <= balanceBefore;
}

rule TransferAndMintAdditivity{
    uint amountA;
    uint amountB;
    address user;
    bytes userData;
    bytes operatorData;
    env e;

    storage init = lastStorage;
    transfer(e, user, amountA); 
    transfer(e, user, amountB); 

    uint seperate_balance = balanceOf(e, user);

    transfer(e, user, amountA+amountB) at init;
    uint together_balance =  balanceOf(e, user);

    mint(e,user, amountA, userData, operatorData) at init;
    mint(e,user, amountB, userData, operatorData);
    uint seperate_mint_balance = balanceOf(e, user);
    mint(e,user, amountA+amountB, userData, operatorData) at init;
    uint together_mint_balance =  balanceOf(e, user);

    assert seperate_mint_balance == together_mint_balance;
    assert seperate_balance == together_balance;
}

rule OnlyOwnerCanDestruct(){
    env e;
    selfDestruct(e);
    assert e.msg.sender == getTimelockedAdminAddress(e) && paused(e) == true;
}

rule TransferFromSumOfFromAndToBalancesStaySame(address from, address to, uint256 amount) {
    env e;
    require e.msg.sender != from && e.msg.sender != to;
    mathint sum = balanceOf(e, from) + balanceOf(e, to);
    uint256 spenderBalanceBefore = balanceOf(e, e.msg.sender);
    require sum < max_uint256;
    
    transferFrom(e, from, to, amount); 

    uint256 spenderBalanceAfter = balanceOf(e, e.msg.sender);
    assert balanceOf(e, from) + balanceOf(e, to) == sum;
    assert spenderBalanceBefore == spenderBalanceAfter;
}

rule TransferFromCorrect(address from, address to, uint256 amount) {
    env e;
    uint256 fromBalanceBefore = balanceOf(e, from);
    uint256 toBalanceBefore = balanceOf(e, to);
    uint256 allowanceBefore = allowance(e, from, e.msg.sender);
    require allowanceBefore < max_uint256;
    require fromBalanceBefore + toBalanceBefore <= max_uint256;

    transferFrom(e, from, to, amount);

    assert from != to =>
        balanceOf(e, from) == fromBalanceBefore - amount &&
        balanceOf(e, to) == toBalanceBefore + amount &&
        allowanceBefore >= amount &&
        fromBalanceBefore >= amount &&
        from != 0 &&
        to != 0 &&
        allowance(e, from, e.msg.sender) == allowanceBefore - amount;
}

rule IsMintPrivileged(address privileged, address recipient, uint256 amount) {
    env e1;
	require e1.msg.sender == privileged;
    bytes userData;
    bytes operatorData;
	storage initialStorage = lastStorage;
    uint256 totalSupplyBefore = totalSupply(e1);
	mint(e1, recipient, amount, userData, operatorData); // no revert
	uint256 totalSupplyAfter1 = totalSupply(e1);

    require(totalSupplyAfter1 > totalSupplyBefore);

	env e2;
	require e2.msg.sender != privileged;

	mint@withrevert(e2, recipient, amount, userData, operatorData) at initialStorage;
	bool secondSucceeded = !lastReverted;
    uint256 totalSupplyAfter2 = totalSupply(e2);

	assert  !secondSucceeded || (totalSupplyBefore == totalSupplyAfter2);
}

rule NoFeeOnTransfer(address bob, uint256 amount) {
    env e;
    calldataarg args;
    require bob != e.msg.sender;

    uint256 balanceSenderBefore = balanceOf(e, e.msg.sender);
    uint256 balanceBefore = balanceOf(e, bob);
    transfer(e, bob, amount);

    uint256 balanceAfter = balanceOf(e, bob);
    uint256 balanceSenderAfter = balanceOf(e, e.msg.sender);
    assert balanceAfter == balanceBefore + amount;
}

rule NoFeeOnTransferFrom(address alice, address bob, uint256 amount) {
    env e;
    calldataarg args;
    require alice != bob;
    require allowance(e, alice, e.msg.sender) >= amount;

    uint256 balanceBefore = balanceOf(e, bob);
    transferFrom(e, alice, bob, amount);

    uint256 balanceAfter = balanceOf(e, bob);
    assert balanceAfter == balanceBefore + amount;
}

rule RevertOnPause(){
    env e;
    require paused(e) == true;
    storage initialStorage = lastStorage;
    address recipient;
    uint256 amount;
    bytes bytesVal;
    bytes userData;
    bytes operatorData;
    address from;
    address to;

    mint@withrevert(e, recipient, amount, userData, operatorData);
    assert lastReverted;
    pause@withrevert(e) at initialStorage;
    assert lastReverted;
    burn@withrevert(e, amount, bytesVal) at initialStorage;
    assert lastReverted;
    operatorBurn@withrevert(e, from ,amount, bytesVal, bytesVal) at initialStorage;
    assert lastReverted;
 }

 rule SendSumOfFromAndToBalancesStaySame(address to, uint256 amount, bytes data) {
    env e;
    mathint sum = stakedBNBContract.balanceOf(e,e.msg.sender) + stakedBNBContract.balanceOf(e,to);
    require sum < max_uint256;

    uint256 totalSupplyBefore = totalSupply(e);
    send(e, to, amount, data); 
    uint256 totalSupplyAfter = totalSupply(e);

    assert stakedBNBContract.balanceOf(e,e.msg.sender) + balanceOf(e,to) == sum;
    assert totalSupplyBefore == totalSupplyAfter;
}

rule SendDoesntChangeOtherBalance(address to, uint256 amount, address other, bytes data) {
    env e;
    require other != e.msg.sender;
    require other != to && other != currentContract;
    uint256 balanceBefore = balanceOf(e, other);
    send(e, to, amount, data); 
    uint256 balanceAfter = balanceOf(e, other);
    assert balanceBefore == balanceAfter;
}

rule SendCorrelation(address to, uint256 amount, bytes data) {
    env e;
    uint256 balanceBefore = balanceOf(e, e.msg.sender);

    send(e, to, amount, data); 
    assert amount > 0 => amount <= balanceBefore;
}

rule SendAndMintAdditivity{
    uint amountA;
    uint amountB;
    address user;
    bytes userData;
    bytes operatorData;
    bytes data;
    env e;

    storage init = lastStorage;
    send(e, user, amountA, data); 
    send(e, user, amountB, data); 

    uint seperate_balance = balanceOf(e, user);

    send(e, user, amountA+amountB, data) at init;
    uint together_balance =  balanceOf(e, user);

    mint(e,user, amountA, userData, operatorData) at init;
    mint(e,user, amountB, userData, operatorData);
    uint seperate_mint_balance = balanceOf(e, user);
    mint(e,user, amountA+amountB, userData, operatorData) at init;
    uint together_mint_balance =  balanceOf(e, user);

    assert seperate_mint_balance == together_mint_balance;
    assert seperate_balance == together_balance;
}

rule OperatorSendSumOfFromAndToBalancesStaySame(address from, address to, uint256 amount, bytes data, bytes operatorData) {
    env e;
    require e.msg.sender != from && e.msg.sender != to;
    mathint sum = balanceOf(e, from) + balanceOf(e, to);
    uint256 spenderBalanceBefore = balanceOf(e, e.msg.sender);
    require sum < max_uint256;
    
    operatorSend(e, from, to, amount, data, operatorData); 
    uint256 spenderBalanceAfter = balanceOf(e, e.msg.sender);

    assert balanceOf(e, from) + balanceOf(e, to) == sum;
    assert spenderBalanceBefore == spenderBalanceAfter;
}

rule AuthorizeOperatorCorrectness(address tokenHolder, address to, bytes data, bytes operatorData, uint256 amount) {
    env e;
    require e.msg.sender != tokenHolder;
    require isOperatorFor(e, e.msg.sender, tokenHolder) == false;
    storage initialStorage = lastStorage;
    operatorSend@withrevert(e, tokenHolder, to, amount, data, operatorData);
    assert lastReverted;

    env e2;
    require e2.msg.sender == tokenHolder; 
    authorizeOperator(e2, e.msg.sender) at initialStorage;
    assert isOperatorFor(e, e.msg.sender, tokenHolder) == true;
}
