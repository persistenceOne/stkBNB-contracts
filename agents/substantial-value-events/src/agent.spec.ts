import { HandleTransaction, createTransactionEvent } from 'forta-agent';
import agent from './agent';

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
