import {
    BlockEvent,
    Finding,
    HandleBlock,
    HandleTransaction,
    TransactionEvent,
    FindingSeverity,
    FindingType,
} from 'forta-agent';
import config from '../agent-config.json';

export const BOT_INITIATE_DELEGATION_EVENT = 'event InitiateDelegation_Success()';
export const BOT_EPOCH_UPDATE_EVENT = 'event EpochUpdate(uint256 bnbRewards, uint256 feeTokens)';
export const BOT_UNBONDING_FINISHED_EVENT = 'event UnbondingFinished(uint256 unbondedAmount)';
export const BOT_UNBONDING_INITIATED_EVENT = 'event UnbondingInitiated(uint256 bnbUnbonding)';

export const STAKEPOOL_ADDRESS = config.STAKEPOOL_ADDRESS;

var InitiateDelegationAlertCount = 0;
var EpochUpdateAlertCount = 0;
var UnbondingInitiatedAlertCount = 0;
var UnbondingFinishedAlertCount = 0;

var InitiateDelegationEventFlag = false;
var EpochUpdateEventFlag = false;
var UnbondingInitiatedEventFlag = false;
var UnbondingFinishedEventFlag = false;

const InitiateDelegation_start_hour = config.InitiateDelegation_start_hour; // should happen 10 mins before UTC 00:00
const InitiateDelegation_start_min = config.InitiateDelegation_start_min;
const InitiateDelegation_end_hour = config.UnbondingInitiated_end_hour;
const InitiateDelegation_end_min = config.InitiateDelegation_end_min; // 23:48 - 23:59  UTC

const EpochUpdate_start_hour = config.EpochUpdate_start_hour; // should happen 10 mins after UTC 00:00
const EpochUpdate_start_min = config.EpochUpdate_start_min;
const EpochUpdate_end_hour = config.EpochUpdate_end_hour;
const EpochUpdate_end_min = config.EpochUpdate_end_min; // 00:08 - 00:20  UTC

const UnbondingInitiated_start_hour = config.UnbondingInitiated_start_hour; // should happen 9 mins before UTC 00:00  WEEKLY (DAILY ON TESTNET)
const UnbondingInitiated_start_min = config.UnbondingInitiated_start_min;
const UnbondingInitiated_end_hour = config.UnbondingInitiated_end_hour;
const UnbondingInitiated_end_min = config.UnbondingInitiated_end_min; // 23:48 - 23:59
const UnbondingInitiated_day_of_week = config.UnbondingInitiated_day_of_week;

const UnbondingFinished_start_hour = config.UnbondingFinished_start_hour; // should happen 11 mins after utc 00:00 WEEKLY (DAILY ON TESTNET)
const UnbondingFinished_start_min = config.UnbondingFinished_start_min;
const UnbondingFinished_end_hour = config.UnbondingFinished_end_hour;
const UnbondingFinished_end_min = config.UnbondingFinished_end_min; // 00:08 - 00:20  UTC
const UnbondingFinished_day_of_week = config.UnbondingInitiated_day_of_week;

const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];

    var currentdate = new Date();
    const currenthours = currentdate.getUTCHours();
    const currentmins = currentdate.getUTCMinutes();
    const currentday = currentdate.getDay(); // 0:Sunday 1: Monday 2:Tuesday 3:Wednesday

    ////////////////////////////////////////INITIATE DELEGATION/////////////////////////////////////////////////////////////////////////////////////

    if (
        currenthours == InitiateDelegation_start_hour &&
        currentmins > InitiateDelegation_start_min &&
        currentmins < InitiateDelegation_end_min
    ) {
        // if the currenttime is between the time thresholds of when the bot should fire
        // look for the target events in every txn
        const initiateDelegationEvent = txEvent.filterLog(
            BOT_INITIATE_DELEGATION_EVENT,
            STAKEPOOL_ADDRESS,
        );

        initiateDelegationEvent.forEach(delegateEvent => {
            const { transferOutAmount } = delegateEvent.args;
            // if any event is found set flag to true
            InitiateDelegationEventFlag = true;
        });

        if (
            InitiateDelegationEventFlag == false &&
            currentmins >= InitiateDelegation_end_min - 1 &&
            currentmins < InitiateDelegation_end_min
        ) {
            // if the event flag is still false and time for bot to fire is about to end
            if (InitiateDelegationAlertCount == 0) {
                // and if no alerts have been emmited, emit 1 alert
                InitiateDelegationAlertCount++;
                findings.push(
                    Finding.fromObject({
                        protocol: 'pStake stkBNB',
                        name: 'Missed BOT operation Initiate Delegation',
                        description: `Delegation did not happen on time`,
                        alertId: 'Initiate_Delegation_Missed',
                        severity: FindingSeverity.Critical,
                        type: FindingType.Degraded,
                        metadata: {},
                    }),
                );
            }
        }
    }
    // else if the currenttime is NOT  between the time thresholds of when the bot should fire
    // so set flag back to false and reset alert counter
    else {
        InitiateDelegationEventFlag = false;
        InitiateDelegationAlertCount = 0; //Set flag to false as soon as we go outside where we expect bot to fire
    }

    /////////////////////////////////////////EPOCH UPDATE//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (
        currenthours == EpochUpdate_start_hour &&
        currentmins > EpochUpdate_start_min &&
        currentmins < EpochUpdate_end_min
    ) {
        const epochUpdateEvent = txEvent.filterLog(BOT_EPOCH_UPDATE_EVENT, STAKEPOOL_ADDRESS);

        epochUpdateEvent.forEach(epochupdateEvent => {
            const { bnbRewards } = epochupdateEvent.args;
            EpochUpdateEventFlag = true;
        });
        if (
            EpochUpdateEventFlag == false &&
            currentmins >= EpochUpdate_end_min - 1 &&
            currentmins < EpochUpdate_end_min
        ) {
            if (EpochUpdateAlertCount == 0) {
                EpochUpdateAlertCount++;
                findings.push(
                    Finding.fromObject({
                        protocol: 'pStake stkBNB',
                        name: 'Missed BOT operation Epoch Update',
                        description: `Epoch Update did not happen on time`,
                        alertId: 'Epoch_Update_Missed',
                        severity: FindingSeverity.Critical,
                        type: FindingType.Degraded,
                        metadata: {},
                    }),
                );
            }
        }
    } else {
        EpochUpdateEventFlag = false;
        EpochUpdateAlertCount = 0; //Set flag to false as soon as we go outside where we expect bot to fire
    }

    /////////////////////////////////////////UNBONDING INITIATED///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (
        currentday == UnbondingInitiated_day_of_week &&
        currenthours == UnbondingInitiated_start_hour &&
        currentmins > UnbondingInitiated_start_min &&
        currentmins < UnbondingInitiated_end_min
    ) {
        const unbondingInitiatedEvent = txEvent.filterLog(
            BOT_UNBONDING_INITIATED_EVENT,
            STAKEPOOL_ADDRESS,
        );

        unbondingInitiatedEvent.forEach(unbondinginitiatedEvent => {
            const { unbondedAmount } = unbondinginitiatedEvent.args;
            UnbondingInitiatedEventFlag = true;
        });
        if (
            UnbondingInitiatedEventFlag == false &&
            currentmins >= UnbondingInitiated_end_min - 1 &&
            currentmins < UnbondingInitiated_end_min
        ) {
            if (UnbondingInitiatedAlertCount == 0) {
                UnbondingInitiatedAlertCount++;
                findings.push(
                    Finding.fromObject({
                        protocol: 'pStake stkBNB',
                        name: 'Missed BOT operation Unbonding Initiated',
                        description: `Unbonding Initiation did not happen on time`,
                        alertId: 'Unbonding Initiated Missed',
                        severity: FindingSeverity.Critical,
                        type: FindingType.Degraded,
                        metadata: {},
                    }),
                );
            }
        }
    } else {
        UnbondingInitiatedEventFlag = false;
        UnbondingInitiatedAlertCount = 0; //Set flag to false as soon as we go outside where we expect bot to fire
    }

    /////////////////////////////////////////UNBONDING FINISHED/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (
        currentday == UnbondingFinished_day_of_week &&
        currenthours == UnbondingFinished_start_hour &&
        currentmins > UnbondingFinished_start_min &&
        currentmins < UnbondingFinished_end_min
    ) {
        const initiateDelegationEvent = txEvent.filterLog(
            BOT_UNBONDING_FINISHED_EVENT,
            STAKEPOOL_ADDRESS,
        );

        initiateDelegationEvent.forEach(unbondingfinishedEvent => {
            const { bnbUnbonding } = unbondingfinishedEvent.args;
            UnbondingFinishedEventFlag = true;
        });
        if (
            UnbondingFinishedEventFlag == false &&
            currentmins >= UnbondingFinished_end_min - 1 &&
            currentmins < UnbondingFinished_end_min
        ) {
            if (UnbondingFinishedAlertCount == 0) {
                UnbondingFinishedAlertCount++;
                findings.push(
                    Finding.fromObject({
                        protocol: 'pStake stkBNB',
                        name: 'Missed BOT operation Unbonding Finished',
                        description: `Unbonding Finished did not happen on time`,
                        alertId: 'Unbonding_Finished_Missed',
                        severity: FindingSeverity.Critical,
                        type: FindingType.Degraded,
                        metadata: {},
                    }),
                );
            }
        }
    } else {
        UnbondingFinishedEventFlag = false;
        UnbondingFinishedAlertCount = 0;
    }

    return findings;
};

export default {
    handleTransaction,
    // handleBlock
};
