certoraRun  certora/harness/StakePoolHarness.sol contracts/StakedBNBToken.sol contracts/AddressStore.sol \
--link StakePoolHarness:addressStore=AddressStore StakePoolHarness:stkBNB=StakedBNBToken \
--verify StakePoolHarness:certora/specs/StakePool.spec \
--solc solc8.7 \
--msg "StakePoolHarness integrityOfDeposit"  \
--packages @openzeppelin=node_modules/@openzeppelin --rule "integrityOfDeposit"
