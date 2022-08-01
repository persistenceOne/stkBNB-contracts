const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
  ethers,
} = require("forta-agent");
const {
  handleTransaction,
  STKBNB_DEPOSIT_EVENT,
  STAKEPOOL_ADDRESS,
  STKBNB_DECIMALS,
} = require("./agent");

const STKBNB_DECIMALS = 18;
describe("high tether transfer agent", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = createTransactionEvent({});
    mockTxEvent.filterLog = jest.fn();

    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it("returns empty findings if there are no stkBNB deposits", async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterLog).toHaveBeenCalledWith(
        STKBNB_DEPOSIT_EVENT,
        STAKEPOOL_ADDRESS
      );
    });

    it("returns a finding if there is a stkBNB deposit over 10,000", async () => {
      const mockStkBNBDepositEvent = {
        args: {
          from: "0xabc",
          to: "0xdef",
          value: ethers.BigNumber.from("20000000000"), //20k with 6 decimals
        },
      };
      mockTxEvent.filterLog.mockReturnValue([mockStkBNBDepositEvent]);

      const findings = await handleTransaction(mockTxEvent);

      const normalizedValue = mockStkBNBDepositEvent.args.value.div(
        10 ** STKBNB_DECIMALS
      );
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "High stkBNB Deposit",
          description: `High amount of stkBNB Deposited: ${normalizedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            timestamp: mockStkBNBDepositEvent.args.timestamp,
            
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterLog).toHaveBeenCalledWith(
        STKBNB_DEPOSIT_EVENT,
        STAKEPOOL_ADDRESS
      );
    });
  });
});
