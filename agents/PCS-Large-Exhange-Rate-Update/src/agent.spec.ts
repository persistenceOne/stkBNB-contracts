import { ethers, Finding, FindingSeverity, FindingType, HandleTransaction } from "forta-agent";
import { provideBotHandler } from "./agent";
import { encodeParameter } from "forta-agent-tools/lib/utils";
import { TestTransactionEvent, createAddress, MockEthersProvider } from "forta-agent-tools/lib/tests";
import { getPancakePairCreate2Address, createFinding } from "./utils";
import { ERC20_ABI, ER_THRESHOLD, PANCAKE_PAIR_ABI } from "./constants";
import { BigNumber } from "ethers";
import DataFetcher from "./data.fetcher";

const PAIR_IFACE = new ethers.utils.Interface(PANCAKE_PAIR_ABI);
const TOKEN_IFACE = new ethers.utils.Interface(ERC20_ABI);
const TEST_PANCAKE_FACTORY = createAddress("0x32");

var exchangerateOld: Number = 1;
var exchangerateNew: Number = 2;

var percentChange: Number = Math.abs(
  ((Number(exchangerateOld) - Number(exchangerateNew)) / Number(exchangerateOld)) * 100
);

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
const er = (num: string) => Number(num);

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
    setBalanceOf(100, token0, TEST_PAIR_ADDRESS, toEbn("1000")); // swap not large
    setBalanceOf(100, token1, TEST_PAIR_ADDRESS, toEbn("1000")); // swap not large
    expect(await handleTransaction(txEvent)).toStrictEqual([]);
  });

  it("should return findings for exchange rate updates that are equal or large", async () => {
    const swapEventLog = createSwapEvent(
      TEST_PAIR_ADDRESS,
      toEbn("0"),
      toEbn("200"),
      toEbn("100"),
      toEbn("0"),
      createAddress("0x9")
    );
    const txEvent = new TestTransactionEvent().setBlock(101).addEventLog(...swapEventLog);
    setTokenPair(210, TEST_PAIR_ADDRESS, token0, "token0");
    setTokenPair(210, TEST_PAIR_ADDRESS, token1, "token1");
    setBalanceOf(209, token0, TEST_PAIR_ADDRESS, toEbn("1000")); // swap is large relative to pair's token balance
    setBalanceOf(209, token1, TEST_PAIR_ADDRESS, toEbn("2000"));
    exchangerateOld = 1;
    exchangerateNew = 2;
    expect(await handleTransaction(txEvent)).toStrictEqual([createFinding(er("1"), er("2"), er("100"))]);
  });
  it("should return findings for exchange rate updates that over threshold and in negative", async () => {
    const swapEventLog = createSwapEvent(
      TEST_PAIR_ADDRESS,
      toEbn("0"),
      toEbn("200"),
      toEbn("100"),
      toEbn("0"),
      createAddress("0x9")
    );
    const txEvent = new TestTransactionEvent().setBlock(101).addEventLog(...swapEventLog);
    setTokenPair(210, TEST_PAIR_ADDRESS, token0, "token0");
    setTokenPair(210, TEST_PAIR_ADDRESS, token1, "token1");
    setBalanceOf(209, token0, TEST_PAIR_ADDRESS, toEbn("2000")); // swap is large relative to pair's token balance
    setBalanceOf(209, token1, TEST_PAIR_ADDRESS, toEbn("1000"));
    exchangerateOld = 2;
    exchangerateNew = 1;
    expect(await handleTransaction(txEvent)).toStrictEqual([createFinding(er("2"), er("1"), er("100"))]);
  });
});
