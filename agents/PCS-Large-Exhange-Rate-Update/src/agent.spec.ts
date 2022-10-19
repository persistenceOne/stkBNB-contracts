import { ethers, Finding, FindingSeverity, FindingType, HandleTransaction } from "forta-agent";
import { provideBotHandler } from "./agent";
import { encodeParameter } from "forta-agent-tools/lib/utils";
import { TestTransactionEvent, createAddress, MockEthersProvider } from "forta-agent-tools/lib/tests";
import { getPancakePairCreate2Address } from "./utils";
import { ERC20ABI, ER_THRESHOLD, PANCAKE_PAIR_ABI } from "./constants";
import { BigNumber } from "ethers";
import DataFetcher from "./data.fetcher";

const createFinding = (exchangerateOld: Number, exchangerateNew: Number): Finding => {
  return Finding.from({
    name: "Large exchangeRate change",
    description: `Old exchange rate ${ethers.utils.formatEther(
      exchangerateOld.toString()
    )} & ${ethers.utils.formatEther(exchangerateNew.toString())}`,
    alertId: "pSTAKE-stkBNB-PCS-SUBSTANTIAL-ExchangeRate-Update",
    protocol: "stkBNB",
    type: FindingType.Info,
    severity: FindingSeverity.Info,
    metadata: {
      exchangerateOld: exchangerateOld.toString(),
      exchangerateNew: exchangerateNew.toString(),
    },
  });
};

const PAIR_IFACE = new ethers.utils.Interface(PANCAKE_PAIR_ABI);
const TOKEN_IFACE = new ethers.utils.Interface(ERC20ABI);
const TEST_PANCAKE_FACTORY = createAddress("0x32");
const [token0, token1, token2, token3] = [
  createAddress("0x01"),
  createAddress("0x02"),
  createAddress("0x03"),
  createAddress("0x04"),
];
const INIT_CODE = ethers.utils.keccak256("0x");
const TEST_PAIR_ADDRESS = getPancakePairCreate2Address(TEST_PANCAKE_FACTORY, token0, token1, INIT_CODE).toLowerCase();
const TEST_LARGE_THRESHOLD = BigNumber.from("10"); // percent
export const SWAP_EVENT =
  "event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out,uint amount1Out,address indexed to)";
const SENDER = createAddress("0x12");

const toEbn = (num: string) => ethers.BigNumber.from(num);

const createSwapEvent = (
  pairAddress: string,
  amount0In: ethers.BigNumber,
  amount1In: ethers.BigNumber,
  amount0Out: ethers.BigNumber,
  amount1Out: ethers.BigNumber,
  to: string
): [string, string, string, string, string] => {
  const data = ethers.utils.defaultAbiCoder.encode(
    ["uint", "uint", "uint", "uint"],
    [amount0In, amount1In, amount0Out, amount1Out]
  );
  const senderTopic = encodeParameter("address", SENDER);
  const toTopic = encodeParameter("address", to);
  return ["Swap(address,uint256,uint256,uint256,uint256,address)", pairAddress, data, senderTopic, toTopic];
};

describe("PancakeSwap Large Swap Bot Test Suite", () => {
  const mockProvider: MockEthersProvider = new MockEthersProvider();
  const mockFetcher: DataFetcher = new DataFetcher(mockProvider as any);
  const handleTransaction: HandleTransaction = provideBotHandler(ER_THRESHOLD, mockFetcher);

  const setBalanceOf = (block: number, tokenAddress: string, account: string, balance: ethers.BigNumber) => {
    mockProvider.addCallTo(tokenAddress, block, TOKEN_IFACE, "balanceOf", {
      inputs: [account],
      outputs: [balance],
    });
  };

  const setTokenPair = (block: number, pairAddress: string, tokenAddress: string, functionId: "token0" | "token1") => {
    mockProvider.addCallTo(pairAddress, block, PAIR_IFACE, functionId, {
      inputs: [],
      outputs: [tokenAddress],
    });
  };

  beforeEach(() => {
    mockProvider.clear();
  });

  it("should return empty findings with empty transaction", async () => {
    const txEvent = new TestTransactionEvent();
    expect(await handleTransaction(txEvent)).toStrictEqual([]);
  });

  it("should return empty findings for exchange rate updates that are not large", async () => {
    const swapEventLog = createSwapEvent(
      TEST_PAIR_ADDRESS,
      toEbn("0"),
      toEbn("200"),
      toEbn("100"),
      toEbn("0"),
      createAddress("0x1")
    );
    const txEvent = new TestTransactionEvent().setBlock(101).addEventLog(...swapEventLog);
    setTokenPair(101, TEST_PAIR_ADDRESS, token0, "token0");
    setTokenPair(101, TEST_PAIR_ADDRESS, token1, "token1");
    setBalanceOf(100, token0, TEST_PAIR_ADDRESS, toEbn("2000")); // swap not large
    setBalanceOf(100, token1, TEST_PAIR_ADDRESS, toEbn("4000")); // swap not large
    expect(await handleTransaction(txEvent)).toStrictEqual([]);
  });
});
