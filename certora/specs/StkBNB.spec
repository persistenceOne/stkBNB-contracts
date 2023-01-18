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
    // send and operatorSend

}

rule onlyMinterCanMint(method f)filtered {f-> f.selector == mint(address,uint256, bytes, bytes).selector} {
    env e;
    calldataarg args;
    f(e, args);
    assert(e.msg.sender == getStakePoolAddress());
    // total supply should be increases 
}

rule onlyBurnerCanBurn(method f)filtered {f-> f.selector == burn(uint256, bytes).selector || f.selector == operatorBurn(address,uint256, bytes, bytes).selector} {
    env e;
    calldataarg args;
    f(e, args);
    assert(e.msg.sender == getStakePoolAddress());
}

rule ownerCanChangeOwnership(address user){
    env e;
    require e.msg.sender != user;
    transferOwnership(e,user);
    assert user == getOwner(e);
}

rule onlyOwnerCanPause(){
    env e;
    pause(e);
    assert e.msg.sender == getOwner(e) <=> paused(e) == true;
}

rule onlyOwnerCanUnpause(){
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

// Users should transfer balance if and only if amount > 0 and amount <=total balance of user. (low)
rule TransferCorrelation(address to, uint256 amount) {
    env e;
    uint256 balanceBefore = balanceOf(e, e.msg.sender);
    // e.msg.sender ---> amount ---> user
    transfer(e, to, amount); 
    assert amount > 0 => amount <= balanceBefore;
}

rule transferAndMintAdditivity{
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

// rule shouldRevertMintAndBurnOnPause(){

// }

/**
    Self destruct can only be called by ownership 
**/
rule onlyOwnerCanDestruct(){
    env e;
    selfDestruct(e);
    assert e.msg.sender == getTimelockedAdminAddress(e) => paused(e) == true;
}

ghost ghostGetStakePool() returns address {
    axiom ghostGetStakePool() == stakePoolContract;
}

ghost ghostGetTimelockedAdmin() returns address {
    axiom ghostGetTimelockedAdmin() == timelockedAdminContract;
}

// rule ChangingAllowance(method f, address from, address spender) {
//     uint256 allowanceBefore = allowance(from, spender);
//     env e;
//     if (f.selector == approve(address, uint256).selector) {
//         address spender_;
//         uint256 amount;
//         approve(e, spender_, amount);
//         if (from == e.msg.sender && spender == spender_) {
//             assert allowance(from, spender) == amount;
//         } else {
//             assert allowance(from, spender) == allowanceBefore;
//         }
//     } else if (f.selector == transferFrom(address,address,uint256).selector) {
//         address from_;
//         address to;
//         address amount;
//         transferFrom(e, from_, to, amount);
//         uint256 allowanceAfter = allowance(from, spender);
//         if (from == from_ && spender == e.msg.sender) {
//             assert from == to || allowanceBefore == max_uint256 || allowanceAfter == allowanceBefore - amount;
//         } else {
//             assert allowance(from, spender) == allowanceBefore;
//         }
//     } else if (f.selector == decreaseAllowance(address, uint256).selector) {
//         address spender_;
//         uint256 amount;
//         require amount <= allowanceBefore;
//         decreaseAllowance(e, spender_, amount);
//         if (from == e.msg.sender && spender == spender_) {
//             assert allowance(from, spender) == allowanceBefore - amount;
//         } else {
//             assert allowance(from, spender) == allowanceBefore;
//         }
//     } else if (f.selector == increaseAllowance(address, uint256).selector) {
//         address spender_;
//         uint256 amount;
//         require amount + allowanceBefore < max_uint256;
//         increaseAllowance(e, spender_, amount);
//         if (from == e.msg.sender && spender == spender_) {
//             assert allowance(from, spender) == allowanceBefore + amount;
//         } else {
//             assert allowance(from, spender) == allowanceBefore;
//         }
//     } else
//     {
//         calldataarg args;
//         f(e, args);
//         assert allowance(from, spender) == allowanceBefore;
//     }
// }

rule TransferFromSumOfFromAndToBalancesStaySame(address from, address to, uint256 amount) {
    env e;
    mathint sum = balanceOf(e, from) + balanceOf(e, to);
    uint256 spenderBalanceBefore = balanceOf(e, from);
    require sum < max_uint256;
    transferFrom(e, from, to, amount); 

    uint256 spenderBalanceAfter = balanceOf(e, from);
    assert balanceOf(e, from) + balanceOf(e, to) == sum;
    assert spenderBalanceBefore == spenderBalanceAfter;
}

rule transferFromCorrect(address from, address to, uint256 amount) {
    env e;
    // require e.msg.value == 0;
    uint256 fromBalanceBefore = balanceOf(e, from);
    uint256 toBalanceBefore = balanceOf(e, to);
    uint256 allowanceBefore = allowance(e, from, e.msg.sender);
    require fromBalanceBefore + toBalanceBefore <= max_uint256;

    transferFrom(e, from, to, amount);

    assert from != to =>
        balanceOf(e, from) == fromBalanceBefore - amount &&
        balanceOf(e, to) == toBalanceBefore + amount &&
        allowance(e, from, e.msg.sender) == allowanceBefore - amount;
}

rule transferFromReverts(address from, address to, uint256 amount) {
    env e;
    uint256 allowanceBefore = allowance(e, from, e.msg.sender);
    uint256 fromBalanceBefore = balanceOf(e, from);
    require from != 0 && e.msg.sender != 0;
    require e.msg.value == 0;
    require fromBalanceBefore + balanceOf(e, to) <= max_uint256;

    transferFrom@withrevert(e, from, to, amount);

    assert lastReverted <=> (allowanceBefore < amount || amount > fromBalanceBefore || to == 0);
}

rule isMintPrivileged(address privileged, address recipient, uint256 amount) {
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

    // either non privileged mint reverted or it didn't influence total supply
	assert  !secondSucceeded || (totalSupplyBefore == totalSupplyAfter2);
}

rule noFeeOnTransfer(address bob, uint256 amount) {
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

rule noFeeOnTransferFrom(address alice, address bob, uint256 amount) {
    env e;
    calldataarg args;
    require alice != bob;
    require allowance(e, alice, e.msg.sender) >= amount;
    uint256 balanceBefore = balanceOf(e, bob);

    transferFrom(e, alice, bob, amount);

    uint256 balanceAfter = balanceOf(e, bob);
    assert balanceAfter == balanceBefore + amount;
}

rule revertOnPause(){
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
//     // pause@withrevert(e) at initialStorage;
//     // assert !lastreverted;
//     // burn@withrevert(e, amount, bytesVal) at initialStorage;
//     // assert !lastreverted;
//     // operatorBurn@withrevert(e, from ,amount, bytesVal, bytesVal) at initialStorage;
//     // assert !lastreverted;
//     // transferFrom@withrevert(e, from, to, amount) at initialStorage;
//     // assert !lastreverted;
 }