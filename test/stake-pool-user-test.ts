import { Contract, BigNumber } from 'ethers';
import { ethers, upgrades, network } from 'hardhat';
import { expect } from 'chai';
import { HardhatNetworkConfig } from 'hardhat/types';
import { StakePoolConfig, CONFIG } from '../scripts/types/config.ts';
import { Contracts } from '../scripts/utils/contracts.ts';

describe('StakePool User Functionality Test', function () {
    let deployerAddr: string, contracts: Contracts;

    before(async function () {
        deployerAddr = await (await ethers.getSigners())[0].address;
        contracts = await Contracts.deploy(CONFIG);
    });

    it('Should be able to deposit BNB & receive stkBNB', async function () {
        // const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');

        contracts.stakePool.deposit({ value: ethers.utils.parseEther('1.75') });

        const depositBNB: BigNumber = await ethers.provider.getBalance(contracts.stakePool.address);
        const stkBNBReceived: BigNumber = await contracts.stakedBNBToken.balanceOf(deployerAddr);

        expect(depositBNB.eq(stkBNBReceived)).to.equal(true);
    });

    it('Should be able to send Withdrawal request', async function () {
        const recipient: string = contracts.stakePool.address;
        const stkBNBBalance: BigNumber = await contracts.stakedBNBToken.balanceOf(deployerAddr);

        const txn = await contracts.stakedBNBToken.send(recipient, stkBNBBalance, '0x');
        const txnBlockNo = await ethers.provider.getBlock(txn.blockNumber);
        const timestamp = txnBlockNo.timestamp;

        expect(txn)
            .to.be.emit(contracts.stakePool, 'Withdraw')
            .withArgs(deployerAddr, stkBNBBalance, stkBNBBalance, timestamp);
    });

    it('Should not be able to claim BNB', async function () {
        await expect(contracts.stakePool.claim(0)).to.be.revertedWithCustomError(
            contracts.stakePool,
            'CantClaimBeforeDeadline',
        );
    });

    it('Should not be able to claimAll BNB', async function () {
        const initBal: BigNumber = await ethers.provider.getBalance(deployerAddr);
        await contracts.stakePool.claimAll();
        const finalBal: BigNumber = await ethers.provider.getBalance(deployerAddr);

        expect(initBal.sub(finalBal)).to.be.greaterThan(0);
    });
});
