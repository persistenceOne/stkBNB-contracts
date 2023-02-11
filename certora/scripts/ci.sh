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
--staging master \
--rule_sanity \
--settings -assumeUnwindCond,-enableStorageAnalysis=true,-ciMode=true,-optimisticFallback=true \
--msg "pstake"

certoraRun  certora/harness/StakedBNBTokenHarness.sol \
            contracts/AddressStore.sol \
            contracts/FeeVault.sol \
            contracts/StakePool.sol \
            contracts/TimelockedAdmin.sol \
            contracts/UndelegationHolder.sol  --link  StakedBNBTokenHarness:_addressStore=AddressStore \
--verify StakedBNBTokenHarness:certora/specs/StkBNB.spec \
--packages @openzeppelin=node_modules/@openzeppelin \
--path . \
--loop_iter 3 \
--staging master \
--rule_sanity \
--settings -assumeUnwindCond,-enableStorageAnalysis=true,-ciMode=true,-optimisticFallback=true \
--msg "stkBNB"

