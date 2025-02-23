import { Contract, BigNumber } from 'ethers';
import { ethers, upgrades, network } from 'hardhat';
import { expect } from 'chai';
import { HardhatNetworkConfig } from 'hardhat/types';
import { StakePoolConfig, CONFIG } from '../scripts/types/config.ts';
import { Contracts } from '../scripts/utils/contracts.ts';
import { setClaimReserve, setClaimRequest } from './helpers/storage-helpers';

describe('StakePool User Functionality Test', function () {
    let deployerAddr: string, contracts: Contracts;

    before(async function () {
        deployerAddr = (await ethers.getSigners())[0].address;
        contracts = await Contracts.deploy(CONFIG);
    });

    it('Should be able to deposit BNB & receive stkBNB', async function () {
        // const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');

        contracts.stakePool.deposit({ value: ethers.utils.parseEther('1.75') });

        const depositBNB: BigNumber = await ethers.provider.getBalance(contracts.stakePool.address);
        const stkBNBReceived: BigNumber = await contracts.stakedBNBToken.balanceOf(deployerAddr);

        expect(depositBNB.eq(stkBNBReceived)).to.equal(true);
    });

    it('Should be able to send Withdrawal request and claim BNB instantly', async function () {
        const recipient: string = contracts.stakePool.address;
        const stkBNBBalance: BigNumber = await contracts.stakedBNBToken.balanceOf(deployerAddr);

        const deployerBalTi = await ethers.provider.getBalance(deployerAddr);

        // Set _claimReserve to match the withdrawal amount
        await setClaimReserve(contracts.stakePool.address, stkBNBBalance);

        const txn = await contracts.stakedBNBToken.send(recipient, stkBNBBalance, '0x');
        const receipt = await txn.wait();
        const txnBlockNo = await ethers.provider.getBlock(txn.blockNumber);
        const timestamp = txnBlockNo.timestamp;

        const deployerBalTf = await ethers.provider.getBalance(deployerAddr);

        // Calculate gas costs
        const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);

        // Verify Withdraw event
        expect(txn)
            .to.be.emit(contracts.stakePool, 'Withdraw')
            .withArgs(deployerAddr, stkBNBBalance, stkBNBBalance, timestamp);

        // Verify the BNB balance change
        expect(deployerBalTf.sub(deployerBalTi).add(gasCost)).to.equal(stkBNBBalance);
    });

    it('Should be able to claim BNB by yet to claim users', async function () {
        // deposit BNB 
        contracts.stakePool.deposit({ value: ethers.utils.parseEther('3.45') });
        const stkBNBBalance: BigNumber = await contracts.stakedBNBToken.balanceOf(deployerAddr);
        const timestamp = (await ethers.provider.getBlock('latest')).timestamp;

        // Create withdrawal request manually
        await setClaimRequest(
            contracts.stakePool.address,
            deployerAddr,
            stkBNBBalance,
            timestamp
        );
        await setClaimReserve(contracts.stakePool.address, stkBNBBalance);

        const deployerBalTi = await ethers.provider.getBalance(deployerAddr);

        // claim BNB
        const txn = await contracts.stakePool.claim(0);
        const receipt = await txn.wait();
        const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);

        const deployerBalTf = await ethers.provider.getBalance(deployerAddr);

        // Verify the BNB balance change
        expect(deployerBalTf.sub(deployerBalTi).add(gasCost)).to.equal(stkBNBBalance);
    });

    it('Should be able to claimAll BNB by yet to claim users', async function () {
        // Get the user signer first
        const userSigner = (await ethers.getSigners())[1];
        const userAddr = userSigner.address;
        const userStakePool = contracts.stakePool.connect(userSigner);

        // deposit BNB as user
        await userStakePool.deposit({ value: ethers.utils.parseEther('10') });
        const stkBNBBalance: BigNumber = await contracts.stakedBNBToken.balanceOf(userAddr);
        const timestamp = (await ethers.provider.getBlock('latest')).timestamp;

        const withdrawalCount = 4;
        // Create 4 claim requests at once
        await setClaimRequest(
            contracts.stakePool.address,
            userAddr,
            stkBNBBalance.div(withdrawalCount),
            timestamp,
            withdrawalCount
        );
        await setClaimReserve(contracts.stakePool.address, stkBNBBalance);

        const userBalTi = await ethers.provider.getBalance(userAddr);

        // claim BNB as user
        const txn = await userStakePool.claimAll();
        const receipt = await txn.wait();
        const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);

        const userBalTf = await ethers.provider.getBalance(userAddr);

        // Verify the BNB balance change
        expect(userBalTf.sub(userBalTi).add(gasCost)).to.equal(stkBNBBalance);
    });
});