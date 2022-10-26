import { Finding, HandleTransaction, TransactionEvent, getEthersProvider } from "forta-agent";
import { BigNumber } from "ethers";
import DataFetcher from "./data.fetcher";
import { createFinding } from "./utils";
import {
  SWAP_EVENT,
  ER_THRESHOLD,
  PANCAKE_FACTORY_ADDRESS,
  INIT_CODE_PAIR_HASH,
  STKBNB_POOL_ADDRESS,
  STKBNB_TOKEN_ADDRESS,
  WBNB_TOKEN_ADDRESS,
} from "./constants";

export const provideBotHandler = (erThreshold: Number, fetcher: DataFetcher): HandleTransaction => {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    // filter the transaction logs for swap events
    const swapEvents = txEvent.filterLog(SWAP_EVENT, STKBNB_POOL_ADDRESS);
    await Promise.all(
      swapEvents.map(async (event) => {
        const pairAddress = event.address;

        // Fetch pool balances from previous block
        const [token0Balance, token1Balance] = await Promise.all([
          fetcher.getERC20Balance(WBNB_TOKEN_ADDRESS, pairAddress, txEvent.blockNumber - 1),
          fetcher.getERC20Balance(STKBNB_TOKEN_ADDRESS, pairAddress, txEvent.blockNumber - 1),
        ]);

        // calculate old exchange rate
        const exchangerateOld: Number = Number(token1Balance) / Number(token0Balance);

        // Fetch exchange rate from current block
        const [token0Balancenew, token1Balancenew] = await Promise.all([
          fetcher.getERC20Balance(WBNB_TOKEN_ADDRESS, pairAddress, txEvent.blockNumber),
          fetcher.getERC20Balance(STKBNB_TOKEN_ADDRESS, pairAddress, txEvent.blockNumber),
        ]);

        // calculate new exchange rate
        const exchangerateNew: Number = Number(token1Balancenew) / Number(token0Balancenew);

        const percentChange: Number = Math.abs(
          ((Number(exchangerateOld) - Number(exchangerateNew)) / Number(exchangerateOld)) * 100
        );

        if (percentChange >= erThreshold) {
          findings.push(createFinding(exchangerateOld, exchangerateNew, percentChange));
        }
      })
    );

    return findings;
  };
};

export default {
  handleTransaction: provideBotHandler(ER_THRESHOLD, new DataFetcher(getEthersProvider())),
};
