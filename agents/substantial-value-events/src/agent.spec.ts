import {
    FindingType,
    FindingSeverity,
    Finding,
    HandleTransaction,
    createTransactionEvent,
    ethers,
} from 'forta-agent';
import agent, {
    STAKE_POOL_DEPOSIT_EVENT,
    STAKEPOOL_ADDRESS,
    STAKE_POOL_WITHDRAW_EVENT,
    STKBNB_MINT_EVENT,
    STKBNB_BURN_EVENT,
    STAKEDBNBTOKEN_ADDRESS,
} from './agent';

describe('Large value stkBNB deposit agent', () => {
    let handleTransaction: HandleTransaction;
    const mockTxEvent = createTransactionEvent({} as any);

    beforeAll(() => {
        handleTransaction = agent.handleTransaction;
    });

    describe('handleTransaction', () => {
        it('returns empty findings if there are no stkBNB ', async () => {
            mockTxEvent.filterLog = jest.fn().mockReturnValue([]);

            const findings = await handleTransaction(mockTxEvent);

            expect(findings).toStrictEqual([]);
            expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(4);
        });
    });
});
