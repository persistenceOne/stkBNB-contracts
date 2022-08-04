import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
} from 'forta-agent';
import agent, { 
  STAKEPOOL_ADDRESS,
} from './agent';

describe('Bot operation monitoring', () => {
  let handleTransaction: HandleTransaction;
  const mockTxEvent = createTransactionEvent({} as any);

  beforeAll(() => {
      handleTransaction = agent.handleTransaction;
  });

  describe('handleTransaction', () => {
      it('returns empty findings if there are bot operations', async () => {
          mockTxEvent.filterLog = jest.fn().mockReturnValue([]);

          const findings = await handleTransaction(mockTxEvent);

          expect(findings).toStrictEqual([]);
          expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(0);
      });
  });
});
