import { Contract, BigNumber } from 'ethers';
import { ethers, upgrades, network } from 'hardhat';
import { expect } from 'chai';
import { HardhatNetworkConfig } from 'hardhat/types';
import { StakePoolConfig, CONFIG } from '../scripts/types/config.ts';
import { Contracts } from '../scripts/utils/contracts.ts';
import { constants } from 'buffer';
import { wait } from '../scripts/utils/transaction.ts';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('StakePool Bot Functionality Test', function () {
    let deployerAddr: string,
        contracts: Contracts,
        stakeHub: Contract,
        stCredit: Contract,
        signers: any;

    before(async function () {
        deployerAddr = (await ethers.getSigners())[0].address;
        contracts = await Contracts.deploy(CONFIG);

        stakeHub = await ethers.getContractAt(
            'IStakeHub',
            '0x0000000000000000000000000000000000002002',
        );
        signers = await ethers.getSigners();
    });

    it('Should be able to make deposit 110 BNB', async function () {
        let totalDeposits = 0;
        for (let i = 1; i <= 10; i++) {
            const deposit = 2 * i;
            await contracts.stakePool
                .connect(signers[i])
                .deposit({ value: ethers.utils.parseEther(deposit.toString()) });
            totalDeposits += deposit;
        }

        const depositBNB: BigNumber = await ethers.provider.getBalance(contracts.stakePool.address);

        expect(ethers.utils.parseEther(totalDeposits.toString())).to.equal(depositBNB);
    });

    it('Should be able to create 5 Validators', async function () {
        const operators = [
            '0x1AE5f5C3Cb452E042b0B7b9DC60596C9CD84BaF6',
            '0xF2B1d86DC7459887B1f7Ce8d840db1D87613Ce7f',
            '0x773760b0708a5Cc369c346993a0c225D8e4043B1',
            '0x343dA7Ff0446247ca47AA41e2A25c5Bbb230ED0A',
            '0x5c38FF8Ca2b16099C086bF36546e99b13D152C4c',
        ];

        for (const operator of operators) {
            await (await contracts.stakePool.createValidator(operator)).wait();

            const validatorCredit = await stakeHub.getValidatorCreditContract(operator);
            const validator = await contracts.stakePool.getValidator(operator);

            expect(validator.stCred).to.equal(validatorCredit);
        }
    });

    it('Should be able to Delegate 110 BNB to 5 Validators', async function () {
        let validators = await contracts.stakePool.getValidators();
        const excessBNB = await ethers.provider.getBalance(contracts.stakePool.address);

        await contracts.stakePool.initiateDelegation(
            [
                validators[0].operator,
                validators[1].operator,
                validators[2].operator,
                validators[3].operator,
                validators[4].operator,
            ],
            [
                excessBNB.div(5),
                excessBNB.div(5),
                excessBNB.div(5),
                excessBNB.div(5),
                excessBNB.div(5),
            ],
        );

        validators = await contracts.stakePool.getValidators();
        for (const validator of validators) {
            stCredit = await ethers.getContractAt('IStakeCredit', validator.stCred);
            const stake = await stCredit.getPooledBNB(contracts.delegationManager.address);
            const validStake = validator.delegation.stakes;


            expect(validStake).to.equal(stake);
        }
    });

    it('Should be able to make deposit 200 BNB', async function () {
        let totalDeposits = 0;
        for (let i = 1; i <= 10; i++) {
            await contracts.stakePool
                .connect(signers[i])
                .deposit({ value: ethers.utils.parseEther('20') });
            totalDeposits += 20;
        }

        const depositBNB: BigNumber = await ethers.provider.getBalance(contracts.stakePool.address);

        expect(ethers.utils.parseEther(totalDeposits.toString())).to.equal(depositBNB);
    });

    it('Should be able to Delegate to 3 Validators', async function () {
        let validators = await contracts.stakePool.getValidators();
        const excessBNB = await ethers.provider.getBalance(contracts.stakePool.address);

        await contracts.stakePool.initiateDelegation(
            [validators[0].operator, validators[1].operator, validators[2].operator],
            [excessBNB.div(3).add(2), excessBNB.div(3), excessBNB.div(3)],
        );

        validators = await contracts.stakePool.getValidators();
        for (const validator of validators) {
            stCredit = await ethers.getContractAt('IStakeCredit', validator.stCred);
            const stake = await stCredit.getPooledBNB(contracts.delegationManager.address);
            const validStake = validator.delegation.stakes;

            expect(validStake).to.equal(stake);
        }
    });

    it('Should be able to redelegate to a new validator', async function () {
        const srvValidator = (await contracts.stakePool.getValidators())[0];
        const srcStakes = srvValidator.delegation.stakes;
        const srcRestakes = srcStakes.mul(67).div(100);
        // 0.02 % of redelegation amount will go to dstValidator Pool
        const redelegationFee = srcRestakes.mul(BigNumber.from('2')).div(BigNumber.from('100000'));
        const dstOperator = '0x4DC1Bf52da103452097df48505A6D01020fFB22b';

        await contracts.stakePool.initiateRedelegation(
            srvValidator.operator,
            dstOperator,
            srcRestakes,
        );

        const dstValidator = await contracts.stakePool.getValidator(dstOperator);
        const dstStakes = dstValidator.delegation.stakes;

        const validators = await contracts.stakePool.getValidators();

        expect(dstStakes.add(BigNumber.from('2'))).to.equal(srcRestakes.sub(redelegationFee));
    });

    it('Should be able to redelegate to a old validator', async function () {
        let validators = await contracts.stakePool.getValidators();
        const srvValidator = validators[0];
        const srcRestakes = srvValidator.delegation.stakes.mul(42).div(100);
        const dstValidator = validators[validators.length - 1];

        // 0.02 % of redelegation amount will go to dstValidator Pool
        const redelegationFee = srcRestakes.mul(BigNumber.from('2')).div(BigNumber.from('10000'));

        await contracts.stakePool.initiateRedelegation(
            srvValidator.operator,
            dstValidator.operator,
            srcRestakes,
        );

        validators = await contracts.stakePool.getValidators();
        const dstStakes = validators[validators.length - 1].delegation.stakes;

        stCredit = await ethers.getContractAt('IStakeCredit', dstValidator.stCred);
        const dstTotalPooledBNB = await stCredit.totalPooledBNB();
        const redelegationReward = redelegationFee
            .mul(dstValidator.delegation.stakes)
            .div(dstTotalPooledBNB);

        expect(
            dstStakes
                .sub(dstValidator.delegation.stakes)
                .add(redelegationReward)
                .gt(srcRestakes.sub(2).sub(redelegationFee)),
        ).to.equal(true);
    });

    it('Should be able unbondingInitiate with 6 Validators', async function () {
        let validators = await contracts.stakePool.getValidators();
        const unStakes = [
            validators[0].delegation.stakes.div(2),
            validators[1].delegation.stakes.div(2),
            validators[2].delegation.stakes.div(2),
            validators[3].delegation.stakes.div(2),
            validators[4].delegation.stakes.div(2),
            validators[5].delegation.stakes.div(2),
        ];

        await contracts.stakePool.unbondingInitiated(
            [
                validators[0].operator,
                validators[1].operator,
                validators[2].operator,
                validators[3].operator,
                validators[4].operator,
                validators[5].operator,
            ],
            unStakes,
        );

        validators = await contracts.stakePool.getValidators();
        let i = 0;
        for (const validator of validators) {
            stCredit = await ethers.getContractAt('IStakeCredit', validator.stCred);
            const lockedBNBs = await stCredit.lockedBNBs(contracts.delegationManager.address, 0);

            expect(lockedBNBs).to.equal(unStakes[i].sub(1));
            ++i;
        }
    });

    it('Should be able call StakePool.epochUpdate()', async function () {
        await expect(contracts.stakePool.epochUpdate()).to.be.emit(
            contracts.stakePool,
            'EpochUpdate',
        );
    });

    it('Should be able unbondingInitiate with 2 Validators', async function () {
        let validators = await contracts.stakePool.getValidators();
        const prevStakes = [validators[0].delegation.stakes, validators[1].delegation.stakes];
        const unStakes = [
            validators[0].delegation.stakes.div(2),
            validators[1].delegation.stakes.div(2),
        ];

        await contracts.stakePool.unbondingInitiated(
            [validators[0].operator, validators[1].operator],
            unStakes,
        );

        validators = await contracts.stakePool.getValidators();
        let i = 0;
        for (const validator of [validators[0], validators[1]]) {
            const currStake = validator.delegation.stakes;

            expect(unStakes[i]).to.equal(prevStakes[i].sub(currStake));
            ++i;
        }
    });

    it('Should be able call StakePool.unbondingFinished()', async function () {
        await network.provider.send('evm_setNextBlockTimestamp', [1715739058]); // 15th May 2024
        await network.provider.send('evm_mine');

        const validators = await contracts.stakePool.getValidators();

        const lockedBNBs: any[] = [];
        for (const validator of validators) {
            stCredit = await ethers.getContractAt('IStakeCredit', validator.stCred);
            const claim = await stCredit.lockedBNBs(contracts.delegationManager.address, 0);
            if (claim > BigNumber.from(0)) {
                lockedBNBs.push(claim);
            }
        }

        const totalBNB: BigNumber = lockedBNBs.reduce(
            (a: BigNumber, b: BigNumber) => a.add(b),
            BigNumber.from(0),
        );

        await expect(contracts.stakePool.unbondingFinished())
            .to.be.emit(contracts.stakePool, 'UnbondingFinished')
            .withArgs(totalBNB);

        const claimReserve = await contracts.stakePool.claimReserve();
        expect(claimReserve).to.equal(totalBNB);
    });

    it('Should be able to receive Funds from DelegationManager', async function () {
        const delegationManager = await ethers.getImpersonatedSigner(
            contracts.delegationManager.address,
        );

        await signers[0].sendTransaction({
            to: delegationManager.address,
            value: ethers.utils.parseEther('1000'),
        });

        const excessBNBBefore = await contracts.stakePool.getDeposits();

        const crossChainAmount = ethers.utils.parseEther('95');
        await delegationManager.sendTransaction({
            to: contracts.stakePool.address,
            value: crossChainAmount,
        });

        const excessBNBAfter = await contracts.stakePool.getDeposits();

        expect(excessBNBAfter.sub(excessBNBBefore)).to.equal(crossChainAmount);
    });

    // Admin Multi-Sig Functionality Tests

    it('Should be able to call StakePool.triggerRebalance()', async function () {
        const bnbToUnbondBefore = await contracts.stakePool.bnbToUnbond();
        const claimReserveBefore = await contracts.stakePool.claimReserve();

        const delegationManagerBNB = await ethers.provider.getBalance(contracts.delegationManager.address);

        await contracts.stakePool.triggerRebalance();

        const bnbToUnbondAfter = await contracts.stakePool.bnbToUnbond();
        const claimReserveAfter = await contracts.stakePool.claimReserve();

        expect(bnbToUnbondAfter).to.equal(bnbToUnbondBefore.sub(delegationManagerBNB));
        expect(claimReserveAfter).to.equal(claimReserveBefore.add(delegationManagerBNB));
    });

    it('Should be able to withdraw leftover BNB after stkBNB deprecation', async function () {
        await signers[0].sendTransaction({
            to: contracts.delegationManager.address,
            value: ethers.utils.parseEther('45'),
        });
        
        await contracts.stakePool.triggerRebalance();
        await contracts.stakePool.pause();

        const initialContractBalance = await ethers.provider.getBalance(contracts.stakePool.address);
        const initialReceiverBalance = await ethers.provider.getBalance(signers[2].address);

        await contracts.stakePool.withdrawBNB(signers[2].address);

        const finalContractBalance = await ethers.provider.getBalance(contracts.stakePool.address);
        const finalReceiverBalance = await ethers.provider.getBalance(signers[2].address);

        expect(finalContractBalance).to.equal(0);
        expect(finalReceiverBalance).to.equal(initialReceiverBalance.add(initialContractBalance));

        expect(await contracts.stakePool.bnbToUnbond()).to.equal(0);
        expect(await contracts.stakePool.bnbUnbonding()).to.equal(0);
        expect(await contracts.stakePool.claimReserve()).to.equal(0);

        await expect(contracts.stakePool.withdrawBNB(signers[2].address))
            .to.be.revertedWithCustomError(contracts.stakePool, "InsufficientFundsToSatisfyClaim");
    });
});