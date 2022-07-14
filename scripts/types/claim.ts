import { BigNumber, Contract } from 'ethers';

interface ClaimRequest {
    weiToReturn: BigNumber;
    createdAt: Date;
}

export class Claims {
    count: number;
    claimRequests: ClaimRequest[];

    constructor(count: number, reqs: ClaimRequest[]) {
        this.count = count;
        this.claimRequests = reqs;
    }

    public static async get(stakePool: Contract, addr: string): Promise<Claims> {
        const count: BigNumber = await stakePool.getClaimRequestCount(addr);
        if (count.lte(0)) {
            return new Claims(count.toNumber(), []);
        }
        // TODO: properly map uint256 timestamp to date in reqs
        const reqs: ClaimRequest[] = await stakePool.getPaginatedClaimRequests(addr, 0, count);

        return new Claims(count.toNumber(), reqs);
    }
}
