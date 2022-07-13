certoraRun  certora/harness/StakePoolHarness.sol contracts/StakedBNBToken.sol contracts/AddressStore.sol \
--link StakePoolHarness:addressStore=AddressStore  \
--verify StakePoolHarness:certora/specs/StakePool.spec \
--solc solc8.7 --staging \
--msg "StakePoolHarness integrityOfDeposit"  \
--packages @openzeppelin=node_modules/@openzeppelin --path . --rule "integrityOfDeposit"
