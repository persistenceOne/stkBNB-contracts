certoraRun  certora/harness/StakePoolHarness.sol \
            contracts/AddressStore.sol \
            contracts/FeeVault.sol \
            contracts/StakedBNBToken.sol \
            contracts/UndelegationHolder.sol \
--link  StakePoolHarness:_addressStore=AddressStore \
--verify StakePoolHarness:certora/specs/StakePool.spec \
--packages @openzeppelin=node_modules/@openzeppelin \
--path . \
--loop_iter 3 \
--settings -assumeUnwindCond,-enableStorageAnalysis=true,-ciMode=true,-optimisticFallback=true \
--msg "pstake" \