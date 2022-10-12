import { Contract, BigNumber, providers } from "ethers";
import { getPancakePairCreate2Address } from "./utils";
import { ERC20_ABI, PANCAKE_PAIR_ABI } from "./constants";

export default class DataFetcher {
  private provider: providers.Provider;

  constructor(provider: providers.Provider) {
    this.provider = provider;
  }

  public async getERC20Balance(tokenAddress: string, pairAddress: string, blockNumber: number): Promise<BigNumber> {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, this.provider);
    let balance: BigNumber;
    try {
      balance = BigNumber.from(await tokenContract.balanceOf(pairAddress, { blockTag: blockNumber }));
    } catch {
      return BigNumber.from("0");
    }

    return balance;
  }
}
