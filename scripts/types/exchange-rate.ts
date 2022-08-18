import { BigNumber, Contract } from 'ethers';

export class ExchangeRate {
    totalWei: BigNumber;
    poolTokenSupply: BigNumber;

    constructor(totalWei: BigNumber, poolTokenSupply: BigNumber) {
        this.totalWei = totalWei;
        this.poolTokenSupply = poolTokenSupply;
    }

    public static async get(stakePool: Contract, blockTag?: number): Promise<ExchangeRate> {
        const er = await stakePool.exchangeRate({ blockTag });
        return new ExchangeRate(er.totalWei, er.poolTokenSupply);
    }

    public value(): number {
        return this.totalWei.mul(1e6).div(this.poolTokenSupply).toNumber() / 1e6; // 6 digit precision
    }

    public apy(prevEpochExchangeRate: ExchangeRate): number {
        return (this.value() / prevEpochExchangeRate.value() - 1.0) * 365 * 100;
    }
}
