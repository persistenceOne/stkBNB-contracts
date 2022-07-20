certoraRun  certora/harness/StakePoolHarness.sol \
            contracts/StakedBNBToken.sol \
            contracts/AddressStore.sol \
            contracts/FeeVault.sol \
            contracts/embedded-libs/Config.sol \
--link StakePoolHarness:addressStore=AddressStore \
--verify StakePoolHarness:certora/specs/StakePool.spec \
--solc solc8.7 --staging \
--msg "claimCanNotBeFulFilledBeforeCoolDownPeriod"  \
--optimistic_loop --loop_iter 3 \
--packages @openzeppelin=node_modules/@openzeppelin --path . \
--settings -optimisticFallback=true 
#--rule "claimCanNotBeFulFilledBeforeCoolDownPeriod"
#--rule "userDoesNotChangeOtherUserBalance"
#--rule "doubleClaim"
#--rule_sanity
#--rule "claimAllvsClaim" \
#--rule "claimAllCorrectness"