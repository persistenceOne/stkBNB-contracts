if [[ "$1" ]]
then
    RULE="--rule $1"
fi

certoraRun  certora/harness/StakePoolHarness.sol \
            contracts/AddressStore.sol \
            contracts/FeeVault.sol \
            contracts/StakedBNBToken.sol \
            contracts/UndelegationHolder.sol \
            contracts/embedded-libs/BasisFee.sol \
            contracts/embedded-libs/Config.sol \
            contracts/embedded-libs/ExchangeRate.sol \
            contracts/embedded-libs/FeeDistribution.sol \
--link  StakePoolHarness:addressStore=AddressStore \
--verify StakePoolHarness:certora/specs/StakePool.spec \
--packages @openzeppelin=node_modules/@openzeppelin \
--path . \
--solc solc8.7 \
--staging \
--loop_iter 3 \
--settings -optimisticFallback=true \
$RULE  \
--msg "pstake -$RULE"

#        StakePoolHarness:config=Config \
#        StakePoolHarness:exchangeRate=ExchangeRate \
#        StakePoolHarness:BasisFee=BasisFee \
#--optimistic_loop 