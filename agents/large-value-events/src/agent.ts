import { BigNumber } from 'ethers';
import {
    BlockEvent,
    Finding,
    HandleBlock,
    HandleTransaction,
    TransactionEvent,
    FindingSeverity,
    FindingType,
    ethers,
} from 'forta-agent';

import config from '../agent-config.json';

function normalizeValue(value: BigNumber) {
    return value.div(ethers.constants.WeiPerEther);
}

// StakePool contract events
export const STAKE_POOL_DEPOSIT_EVENT =
    'event Deposit(address indexed user,uint256 bnbAmount,uint256 poolTokenAmount,uint256 timestamp)';
export const STAKE_POOL_WITHDRAW_EVENT =
    'event Withdraw(address indexed user,uint256 poolTokenAmount,uint256 bnbAmount,uint256 timestamp)';

// StkBNBToken contract events
export const STKBNB_MINT_EVENT =
    'event Minted(address indexed operator, address indexed to, uint256 amount, bytes data, bytes operatorData)';
export const STKBNB_BURN_EVENT =
    'event Burned(address indexed operator, address indexed from, uint256 amount, bytes data, bytes operatorData)';

// Contract Addresses
export const STAKEPOOL_ADDRESS = config.STAKEPOOL_ADDRESS;
export const STAKEDBNBTOKEN_ADDRESS = config.STAKEDBNBTOKEN_ADDRESS;

// Thresholds
export const HighThreshold = config.HighThreshold; // 1 Million
export const MediumThreshold = config.MediumThreshold; // 500k
export const LowThreshold = config.LowThreshold; // 100k

const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];

    // limiting this agent to emit only 5 findings so that the alert feed is not spammed

    // filter the transaction logs for Tether transfer events
    const stkbnbMintedEvents = txEvent.filterLog(STKBNB_MINT_EVENT, STAKEDBNBTOKEN_ADDRESS);

    stkbnbMintedEvents.forEach(mintEvent => {
        // extract mint event arguments
        const { amount } = mintEvent.args;

        // Normalised value bought down from 18 decimals
        var normalizedValue = normalizeValue(amount);

        //TODO Create a finding object at that time with the severity as per the variable
        // if more than 1Million stkBNB were minted, report it
        if (normalizedValue.gte(HighThreshold)) {
            findings.push(
                Finding.fromObject({
                    protocol: 'pStake stkBNB',
                    name: 'Large stkBNB Mint',
                    description: `Minted: ${ethers.utils.formatEther(amount)} stkBNB`,
                    alertId: 'LARGE_stkBNB_MINT',
                    severity: FindingSeverity.High,
                    type: FindingType.Info,
                    metadata: {
                        amount,
                    },
                }),
            );
        }
        // else if more than 500,000 stkBNB but less than 1 Million stkBNB were minted, report it
        else if (normalizedValue.gte(MediumThreshold)) {
            findings.push(
                Finding.fromObject({
                    protocol: 'pStake stkBNB',
                    name: 'Large stkBNB Mint',
                    description: `Minted: ${ethers.utils.formatEther(amount)} stkBNB`,
                    alertId: 'LARGE_stkBNB_MINT',
                    severity: FindingSeverity.Medium,
                    type: FindingType.Info,
                    metadata: {
                        amount,
                    },
                }),
            );
        }
        // else if more than 100,000 stkBNB but less than 500,000 stkBNB were minted, report it
        else if (normalizedValue.gte(LowThreshold)) {
            findings.push(
                Finding.fromObject({
                    protocol: 'pStake stkBNB',
                    name: 'Large stkBNB Mint',
                    description: `Minted: ${ethers.utils.formatEther(amount)} stkBNB`,
                    alertId: 'LARGE_stkBNB_MINT',
                    severity: FindingSeverity.Low,
                    type: FindingType.Info,
                    metadata: {
                        amount,
                    },
                }),
            );
        }
    });

    /////////////////////////////////////////BURNED///////////////////////////////////////////////////////////
    const stkbnbBurnedEvents = txEvent.filterLog(STKBNB_BURN_EVENT, STAKEDBNBTOKEN_ADDRESS);

    stkbnbBurnedEvents.forEach(burnEvent => {
        // extract burn event arguments
        const { amount } = burnEvent.args;

        var normalizedValue = normalizeValue(amount);

        // if equal or more than 1 Million stkBNB were burnt, report it
        if (normalizedValue.gte(HighThreshold)) {
            findings.push(
                Finding.fromObject({
                    protocol: 'pStake stkBNB',
                    name: 'Large stkBNB Burn',
                    description: `Burned: ${ethers.utils.formatEther(amount)} stkBNB`,
                    alertId: 'LARGE_stkBNB_BURN',
                    severity: FindingSeverity.High,
                    type: FindingType.Info,
                    metadata: {
                        amount,
                    },
                }),
            );
        }
        // else if euqal or more than 500,000 stkBNB but less than 1Million stkBNB were burnt, report it
        else if (normalizedValue.gte(MediumThreshold)) {
            findings.push(
                Finding.fromObject({
                    protocol: 'pStake stkBNB',
                    name: 'Large stkBNB Burn',
                    description: `Burned: ${ethers.utils.formatEther(amount)} stkBNB`,
                    alertId: 'LARGE_stkBNB_BURN',
                    severity: FindingSeverity.Medium,
                    type: FindingType.Info,
                    metadata: {
                        amount,
                    },
                }),
            );
        }
        // else if equal or more than 100,000 stkBNB but less than 500,000 stkBNB were burnt, report it
        else if (normalizedValue.gte(LowThreshold)) {
            findings.push(
                Finding.fromObject({
                    protocol: 'pStake stkBNB',
                    name: 'Large stkBNB Burn',
                    description: `Burned: ${ethers.utils.formatEther(amount)} stkBNB`,
                    alertId: 'LARGE_stkBNB_BURN',
                    severity: FindingSeverity.Low,
                    type: FindingType.Info,
                    metadata: {
                        amount,
                    },
                }),
            );
        }
    });

    //////////////////////////////////////////DEPOSITS////////////////////////////////////////////

    // filter the transaction logs for stkbnb Deposit events
    const bnbDepositEvents = txEvent.filterLog(STAKE_POOL_DEPOSIT_EVENT, STAKEPOOL_ADDRESS);

    bnbDepositEvents.forEach(depositEvent => {
        // extract deposit event arguments
        const { timestamp, bnbAmount } = depositEvent.args;

        var normalizedValue = normalizeValue(bnbAmount);

        // if equal or more than 1 Million stkBNB were deposited, report it
        if (normalizedValue.gte(HighThreshold)) {
            findings.push(
                Finding.fromObject({
                    protocol: 'pStake stkBNB',
                    name: 'Large BNB Deposit',
                    description: `Deposited: ${ethers.utils.formatEther(bnbAmount)} BNB`,
                    alertId: 'LARGE_stkBNB_DEPOSIT',
                    severity: FindingSeverity.High,
                    type: FindingType.Info,
                    metadata: {
                        bnbAmount,
                        timestamp,
                    },
                }),
            );
        }
        // else if equal or more than 500,000 stkBNB but less than 1 Million stkBNB were deposited, report it
        else if (normalizedValue.gte(MediumThreshold)) {
            findings.push(
                Finding.fromObject({
                    protocol: 'pStake stkBNB',
                    name: 'Large BNB Deposit',
                    description: `Deposited: ${ethers.utils.formatEther(bnbAmount)} BNB`,
                    alertId: 'LARGE_stkBNB_DEPOSIT',
                    severity: FindingSeverity.Medium,
                    type: FindingType.Info,
                    metadata: {
                        bnbAmount,
                        timestamp,
                    },
                }),
            );
        }
        // else if equal or more than 100,000 stkBNB but less than 500,000 stkBNB were deposited, report it
        else if (normalizedValue.gte(LowThreshold)) {
            findings.push(
                Finding.fromObject({
                    protocol: 'pStake stkBNB',
                    name: 'Large BNB Deposit',
                    description: `Deposited: ${ethers.utils.formatEther(bnbAmount)} BNB`,
                    alertId: 'LARGE_stkBNB_DEPOSIT',
                    severity: FindingSeverity.Low,
                    type: FindingType.Info,
                    metadata: {
                        bnbAmount,
                        timestamp,
                    },
                }),
            );
        }
    });
    ////////////////////////////////WITHDRWALS////////////////////////////////////////////////////////////////

    const stkbnbWithdrawEvents = txEvent.filterLog(STAKE_POOL_WITHDRAW_EVENT, STAKEPOOL_ADDRESS);

    stkbnbWithdrawEvents.forEach(depositEvent => {
        // extract withdraw event arguments
        const { timestamp, bnbAmount } = depositEvent.args;
        // convert 18 decimal places to normal value

        var normalizedValue = normalizeValue(bnbAmount);

        // if equal or more than 1 Million stkBNB were withdrawn, report it
        if (normalizedValue.gte(HighThreshold)) {
            findings.push(
                Finding.fromObject({
                    protocol: 'pStake stkBNB',
                    name: 'Large stkBNB Withdrawal',
                    description: `Withdrawn: ${ethers.utils.formatEther(bnbAmount)} stkBNB`,
                    alertId: 'LARGE_stkBNB_WITHDRAWAL',
                    severity: FindingSeverity.High,
                    type: FindingType.Info,
                    metadata: {
                        bnbAmount,
                        timestamp,
                    },
                }),
            );
        }
        // else if equal or more than 500,000 stkBNB but less than 1 Million stkBNB were withdrawn, report it
        else if (normalizedValue.gte(MediumThreshold)) {
            findings.push(
                Finding.fromObject({
                    protocol: 'pStake stkBNB',
                    name: 'Large stkBNB Withdrawal',
                    description: `Withdrawn: ${ethers.utils.formatEther(bnbAmount)} stkBNB`,
                    alertId: 'LARGE_stkBNB_WITHDRAWAL',
                    severity: FindingSeverity.Medium,
                    type: FindingType.Info,
                    metadata: {
                        bnbAmount,
                        timestamp,
                    },
                }),
            );
        }
        // else if equal or more than 100,000 stkBNB but less than 500,000 stkBNB were withdrawn, report it
        else if (normalizedValue.gte(LowThreshold)) {
            findings.push(
                Finding.fromObject({
                    protocol: 'pStake stkBNB',
                    name: 'Large stkBNB Withdrawal',
                    description: `Withdrawn: ${ethers.utils.formatEther(bnbAmount)} stkBNB`,
                    alertId: 'LARGE_stkBNB_WITHDRAWAL',
                    severity: FindingSeverity.Low,
                    type: FindingType.Info,
                    metadata: {
                        bnbAmount,
                        timestamp,
                    },
                }),
            );
        }
    });

    return findings;
};

// const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
//   const findings: Finding[] = [];
//   // detect some block condition
//   return findings;
// }

export default {
    handleTransaction,
    // handleBlock
};
