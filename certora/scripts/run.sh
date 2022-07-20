if [[ "$1" ]]
then
    RULE="--rule $1"
fi

certoraRun  certora/harness/StakePoolHarness.sol \
            contracts/StakedBNBToken.sol \
            contracts/AddressStore.sol \
            contracts/FeeVault.sol \
            contracts/embedded-libs/Config.sol \
            contracts/UndelegationHolder.sol \
--link StakePoolHarness:addressStore=AddressStore \
--verify StakePoolHarness:certora/specs/StakePool.spec \
--packages @openzeppelin=node_modules/@openzeppelin \
--path . \
--solc solc8.7 \
--staging \
--optimistic_loop --loop_iter 2 \
--settings -optimisticFallback=true \
$RULE  \
--msg "Endpoint -$RULE"