# The goal of this script is the help run the tool
# without having to enter manually all the required
# parameters every time a test is executed
#
# The script should be executed from the terminal,
# with the project folder as the working folder
#
#
# The script can be run either with:
#
# 1) no parameters --> all the rules in the .spec file are tested
#    example:
#
#    ./certora/scripts/run.sh
# 
#
# 2) with one parameter only --> the parameter states the rule name
#    example, when the rule name is "integrityOfDeposit":
#
#    ./certora/scripts/run.sh integrityOfDeposit
#
#
# 3) with two parameters:
#     - the first parameter is the rule name, as in 2)
#     - the second parameter is an optional message to help distinguish the rule
#       the second parameter should be encircled "with quotes"
#    example:
#
#    ./certora/scripts/run.sh integrityOfDeposit "user should get stkBNB for any deposit"



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
--link  StakePoolHarness:_addressStore=AddressStore \
--verify StakePoolHarness:certora/specs/StakePool.spec \
--packages @openzeppelin=node_modules/@openzeppelin \
--path . \
--loop_iter 3 \
--settings -optimisticFallback=true --optimistic_loop \
--staging master \
--rule_sanity \
$RULE  \
--msg "pstake -$RULE $MSG"


# additional parameters that might be helpful:
#--optimistic_loop
#--settings -optimisticFallback=true \
#--staging \