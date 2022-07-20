certoraRun  certora/harness/StakePoolHarness.sol \
            contracts/StakedBNBToken.sol \
            contracts/AddressStore.sol \
            contracts/FeeVault.sol \
            contracts/embedded-libs/Config.sol \
--link StakePoolHarness:addressStore=AddressStore \
--verify StakePoolHarness:certora/specs/StakePool.spec \
--packages @openzeppelin=node_modules/@openzeppelin \
--path . \
--solc solc8.7 \
--staging \
--optimistic_loop --loop_iter 1 \
--msg "cannotWithdrawMoreThanDeposited"  \
--rule "cannotWithdrawMoreThanDeposited"
#--rule "cannotWithdrawMoreThanDeposited"
#--rule "cannotWithdrawMoreThanDeposited"
#--rule "claimCanNotBeFulFilledBeforeCoolDownPeriod"
#--rule "userDoesNotChangeOtherUserBalance"
#--rule "doubleClaim"
#--rule_sanity
#--rule "claimAllvsClaim" \
#--rule "claimAllCorrectness"