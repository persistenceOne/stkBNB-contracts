import { BigNumber } from "ethers";
import { Finding, HandleTransaction, TransactionEvent, LogDescription, getEthersProvider } from "forta-agent";
import { EVENTS_ABI, POOL_SUPPLY_THRESHOLD, THRESHOLD_PERCENTAGE, FACTORY } from "./constants";
import { createPair } from "./utils";
import { createFinding } from "./finding";
import PoolFetcher from "./pool.fetcher";
const STKBNB_POOL_ADDRESS = "0xaa2527ff1893e0d40d4a454623d362b79e8bb7f1";
const STKBNB_TOKEN_ADDRESS = "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16";
const WBNB_TOKEN_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

export const provideHandleTransaction =
  (
    createPair: any,
    fetcher: PoolFetcher,
    poolSupplyThreshold: BigNumber,
    thresholdPercentage: BigNumber,
    factory: string
  ): HandleTransaction =>
  async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];
    const block: number = txEvent.blockNumber;
    const logs: LogDescription[] = txEvent.filterLog(EVENTS_ABI, STKBNB_POOL_ADDRESS);
    if (!logs) return findings;
    await Promise.all(
      logs.map(async (log) => {
        const { amount0, amount1 } = log.args;
        const [valid,totalSupply] = await fetcher.getPoolData(block - 1, log.address);
        
        const createdPair = createPair( WBNB_TOKEN_ADDRESS, STKBNB_TOKEN_ADDRESS, factory);
        if (valid && log.address === createdPair) {
          
          const [balance0, balance1] = await fetcher.getPoolBalance(block - 1, log.address, WBNB_TOKEN_ADDRESS, STKBNB_TOKEN_ADDRESS);
          if (
            log.address == STKBNB_POOL_ADDRESS &&
            totalSupply.gt(poolSupplyThreshold) &&
            (amount0.mul(100).gt(balance0.mul(thresholdPercentage)) ||
              amount1.mul(100).gt(balance1.mul(thresholdPercentage)))
          ) {
            
            findings.push(createFinding(log,totalSupply));
          }
        }
      })
    );

    return findings;
  };

export default {
  handleTransaction: provideHandleTransaction(
    createPair,
    new PoolFetcher(getEthersProvider()),
    POOL_SUPPLY_THRESHOLD,
    THRESHOLD_PERCENTAGE,
    FACTORY
  ),
};
