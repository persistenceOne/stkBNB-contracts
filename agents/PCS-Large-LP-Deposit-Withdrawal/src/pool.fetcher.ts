import { Contract, BigNumber, providers } from "ethers";
import { FUNCTIONS_ABI } from "./constants";

export default class PoolFetcher {
  private provider: providers.Provider;

  constructor(provider: providers.Provider) {
    this.provider = provider;
  }

  public async getPoolData(block: number, poolAddress: string): Promise<[boolean, string, string, BigNumber]> {
    let returnedValues: [boolean, string, string, BigNumber];
    

    const pool = new Contract(poolAddress, FUNCTIONS_ABI, this.provider);
    try {
      const [token0, token1, totalSupply] = await Promise.all([
        pool.token0({ blockTag: block }),
        pool.token1({ blockTag: block }),
        pool.totalSupply({ blockTag: block }),
      ]);
      returnedValues = [true, token0.toLowerCase(), token1.toLowerCase(), totalSupply];
    } catch {
      returnedValues = [false, "", "", BigNumber.from(0)];
    }

    return returnedValues;
  }

  public async getPoolBalance(
    block: number,
    poolAddress: string,
    token0: string,
    token1: string
  ): Promise<[BigNumber, BigNumber]> {
    

    const token0Contract = new Contract(token0, FUNCTIONS_ABI, this.provider);
    const token1Contract = new Contract(token1, FUNCTIONS_ABI, this.provider);
    let returnedValues: [BigNumber, BigNumber];
    try {
      const [balance0, balance1] = await Promise.all([
        token0Contract.balanceOf(poolAddress, { blockTag: block }),
        token1Contract.balanceOf(poolAddress, { blockTag: block }),
      ]);
      returnedValues = [BigNumber.from(balance0), BigNumber.from(balance1)];
    } catch {
      returnedValues = [BigNumber.from(0), BigNumber.from(0)];
    }

    return returnedValues;
  }
}
