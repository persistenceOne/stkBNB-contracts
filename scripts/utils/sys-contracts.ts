import { ethers } from 'hardhat';
import { BigNumber, Contract } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { executeTx, getContractName } from './transaction';
import { ADDRESS } from './constants';

function nowInSecs(): number {
    return Math.floor(new Date().getTime() / 1000);
}

interface ISysContracts {
    stakeHub: Contract;
}

export class SysContracts implements ISysContracts {
    stakeHub: Contract;

    private constructor(sysContracts: ISysContracts) {
        this.stakeHub = sysContracts.stakeHub;
    }

    // A wrapper around the constructor to create an instance of this class.
    // Needed because of the async/await syntax.
    // Always this should be used to instead of the constructor.
    public static async new(): Promise<SysContracts> {
        return new SysContracts({
            stakeHub: await ethers.getContractAt('IStakeHub', ADDRESS.stakeHub),
        });
    }

    // public async mirror(bep20Addr: string) {
    //     console.log(`mirroring ${getContractName(bep20Addr)}...`);

    //     const mirrorFee: BigNumber = await this.tokenManager.mirrorFee();
    //     const miniRelayFee: BigNumber = await this.tokenHub.getMiniRelayFee();
    //     const totalFee: BigNumber = mirrorFee.add(miniRelayFee);
    //     console.log(
    //         `totalFee (${formatEther(totalFee)}) = mirrorFee (${formatEther(
    //             mirrorFee,
    //         )}) + miniRelayFee (${formatEther(miniRelayFee)})`,
    //     );

    //     const opts = { value: totalFee };
    //     await executeTx(this.tokenManager, 'mirror', [
    //         bep20Addr,
    //         nowInSecs() + mirrorTimeout,
    //         opts,
    //     ]);

    //     const bep2Symbol: string = await this.tokenHub.getBoundBep2Symbol(bep20Addr);
    //     console.log(`tokenHub.getBoundBep2Symbol(${bep20Addr}): ${bep2Symbol}`);
    //     const boundContract: string = await this.tokenHub.getBoundContract(bep2Symbol);
    //     console.log(`tokenHub.getBoundContract(${bep2Symbol}): ${boundContract}`);
    // }

    // public async sync(bep20Addr: string) {
    //     console.log(`syncing ${getContractName(bep20Addr)}...`);

    //     const syncFee: BigNumber = await this.tokenManager.syncFee();
    //     const miniRelayFee: BigNumber = await this.tokenHub.getMiniRelayFee();
    //     const totalFee: BigNumber = syncFee.add(miniRelayFee);
    //     console.log(
    //         `totalFee (${formatEther(totalFee)}) = syncFee (${formatEther(
    //             syncFee,
    //         )}) + miniRelayFee (${formatEther(miniRelayFee)})`,
    //     );

    //     const opts = { value: totalFee };
    //     await executeTx(this.tokenManager, 'sync', [bep20Addr, nowInSecs() + syncTimeout, opts]);
    // }

    // public async transferOut(bep20Contract: Contract, bcRecipient: string, amount: BigNumber) {
    //     console.log(`transferring out ${getContractName(bep20Contract.address)}...`);

    //     await executeTx(bep20Contract, 'approve', [this.tokenHub.address, amount]);

    //     const miniRelayFee: BigNumber = await this.tokenHub.getMiniRelayFee();
    //     console.log(`miniRelayFee: ${formatEther(miniRelayFee)}`);

    //     const opts = { value: miniRelayFee };
    //     await executeTx(this.tokenHub, 'transferOut', [
    //         bep20Contract.address,
    //         bcRecipient,
    //         amount,
    //         nowInSecs() + transferOutTimeout,
    //         opts,
    //     ]);
    // }
}
