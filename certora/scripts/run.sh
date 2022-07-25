if [[ "$1" ]]
then
    RULE="--rule $1"
fi

if [[ "$2" ]]
then
    MSG=": $2"
fi

certoraRun  certora/harness/StakePoolHarness.sol \
            contracts/AddressStore.sol \
            contracts/FeeVault.sol \
            contracts/StakedBNBToken.sol \
            contracts/UndelegationHolder.sol \
--link  StakePoolHarness:addressStore=AddressStore \
--verify StakePoolHarness:certora/specs/StakePool.spec \
--packages @openzeppelin=node_modules/@openzeppelin \
--path . \
--solc solc8.7 \
--staging \
--loop_iter 3 \
--settings -optimisticFallback=true --optimistic_loop \
$RULE  \
--msg "pstake -$RULE $MSG"

#        StakePoolHarness:config=Config \
#        StakePoolHarness:exchangeRate=ExchangeRate \
#        StakePoolHarness:BasisFee=BasisFee \
#--optimistic_loop
#--settings -optimisticFallback=true \