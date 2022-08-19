import {
    ethers,
    Finding,
    FindingSeverity,
    FindingType,
    HandleTransaction,
    TransactionEvent,
} from 'forta-agent';
import { normalizeValue } from './utils';
import config from '../agent-config.json';

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

    // filter the transaction logs for stkBNB mint events
    const stkbnbMintedEvents = txEvent.filterLog(STKBNB_MINT_EVENT, STAKEDBNBTOKEN_ADDRESS);

    stkbnbMintedEvents.forEach(mintEvent => {
        // extract mint event arguments
        const { amount } = mintEvent.args;
        // Normalised value brought down from 18 decimals
        const normalizedValue = normalizeValue(amount);

        let severity: FindingSeverity | undefined;
        if (normalizedValue.gte(HighThreshold)) {
            severity = FindingSeverity.High;
        } else if (normalizedValue.gte(MediumThreshold)) {
            severity = FindingSeverity.Medium;
        } else if (normalizedValue.gte(LowThreshold)) {
            severity = FindingSeverity.Low;
        }

        if (severity !== undefined) {
            findings.push(
                Finding.fromObject({
                    protocol: 'stkBNB',
                    name: 'Substantial stkBNB Mint',
                    description: `Minted: ${ethers.utils.formatEther(amount)} stkBNB`,
                    alertId: 'pSTAKE-stkBNB-SUBSTANTIAL-MINT',
                    severity,
                    type: FindingType.Info,
                    metadata: {
                        amount,
                    },
                }),
            );
        }
    });

    /// //////////////////////////////////////BURNED///////////////////////////////////////////////////////////
    const stkbnbBurnedEvents = txEvent.filterLog(STKBNB_BURN_EVENT, STAKEDBNBTOKEN_ADDRESS);

    stkbnbBurnedEvents.forEach(burnEvent => {
        // extract burn event arguments
        const { amount } = burnEvent.args;
        const normalizedValue = normalizeValue(amount);

        let severity: FindingSeverity | undefined;
        if (normalizedValue.gte(HighThreshold)) {
            severity = FindingSeverity.High;
        } else if (normalizedValue.gte(MediumThreshold)) {
            severity = FindingSeverity.Medium;
        } else if (normalizedValue.gte(LowThreshold)) {
            severity = FindingSeverity.Low;
        }

        if (severity !== undefined) {
            findings.push(
                Finding.fromObject({
                    protocol: 'stkBNB',
                    name: 'Substantial stkBNB Burn',
                    description: `Burned: ${ethers.utils.formatEther(amount)} stkBNB`,
                    alertId: 'pSTAKE-stkBNB-SUBSTANTIAL-BURN',
                    severity,
                    type: FindingType.Info,
                    metadata: {
                        amount,
                    },
                }),
            );
        }
    });

    /// ///////////////////////////////////////DEPOSITS////////////////////////////////////////////

    // filter the transaction logs for stkbnb Deposit events
    const bnbDepositEvents = txEvent.filterLog(STAKE_POOL_DEPOSIT_EVENT, STAKEPOOL_ADDRESS);

    bnbDepositEvents.forEach(depositEvent => {
        // extract deposit event arguments
        const { bnbAmount } = depositEvent.args;
        const normalizedValue = normalizeValue(bnbAmount);

        let severity: FindingSeverity | undefined;
        if (normalizedValue.gte(HighThreshold)) {
            severity = FindingSeverity.High;
        } else if (normalizedValue.gte(MediumThreshold)) {
            severity = FindingSeverity.Medium;
        } else if (normalizedValue.gte(LowThreshold)) {
            severity = FindingSeverity.Low;
        }

        if (severity !== undefined) {
            findings.push(
                Finding.fromObject({
                    protocol: 'stkBNB',
                    name: 'Substantial BNB Deposit',
                    description: `Deposited: ${ethers.utils.formatEther(bnbAmount)} BNB`,
                    alertId: 'pSTAKE-stkBNB-SUBSTANTIAL-DEPOSIT',
                    severity,
                    type: FindingType.Info,
                    metadata: {
                        bnbAmount,
                    },
                }),
            );
        }
    });
    /// /////////////////////////////WITHDRWALS////////////////////////////////////////////////////////////////

    const stakePoolWithdrawEvents = txEvent.filterLog(STAKE_POOL_WITHDRAW_EVENT, STAKEPOOL_ADDRESS);

    stakePoolWithdrawEvents.forEach(withdrawEvent => {
        // extract withdraw event arguments
        const { bnbAmount } = withdrawEvent.args;
        // convert 18 decimal places to normal value
        const normalizedValue = normalizeValue(bnbAmount);

        let severity: FindingSeverity | undefined;
        if (normalizedValue.gte(HighThreshold)) {
            severity = FindingSeverity.High;
        } else if (normalizedValue.gte(MediumThreshold)) {
            severity = FindingSeverity.Medium;
        } else if (normalizedValue.gte(LowThreshold)) {
            severity = FindingSeverity.Low;
        }

        if (severity !== undefined) {
            findings.push(
                Finding.fromObject({
                    protocol: 'stkBNB',
                    name: 'Substantial BNB Withdrawal',
                    description: `Withdrawn: ${ethers.utils.formatEther(bnbAmount)} BNB`,
                    alertId: 'pSTAKE-stkBNB-SUBSTANTIAL-WITHDRAWAL',
                    severity,
                    type: FindingType.Info,
                    metadata: {
                        bnbAmount,
                    },
                }),
            );
        }
    });

    return findings;
};

export default {
    handleTransaction,
};
