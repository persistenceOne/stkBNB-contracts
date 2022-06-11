import { Contract, BigNumber } from 'ethers';
import { expect } from 'chai';
import { ethers, upgrades, network, web3 } from 'hardhat';
import { HardhatNetworkConfig } from 'hardhat/types';

require('@openzeppelin/test-helpers/configure')({ web3 });
const { singletons } = require('@openzeppelin/test-helpers');

// At max, our contract can successfully support this many number of simultaneous claims per user.
// If a user has more claim requests than this number, then claiming all the requests at once
// will not work. Although, claiming one by one will still work.
// Also, claiming this many number of requests at once is possible only if the claimAll tx is the
// only tx in the block, as it will consume all the blockGasLimit.
const MAX_CLAIMS_PER_USER = 3125;

describe('StakePool Claims', function () {
    let deployerAddr: string, contract: Contract;

    it('Should deploy ERC1820Registry on local networks', async function () {
        if (network.name.startsWith('local') || network.name.startsWith('hardhat')) {
            deployerAddr = await (await ethers.getSigners())[0].getAddress();
            await singletons.ERC1820Registry(deployerAddr);
        } else {
            console.log('Not a local network: ', network.name);
            console.log('Skipping ERC1820Registry deployment.');
        }
    });

    it('should deploy the test contract', async function () {
        const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
        contract = await upgrades.deployProxy(await ethers.getContractFactory('StakePoolTest'), [
            ZERO_ADDR,
            {
                bcStakingWallet: ZERO_ADDR,
                minBNBDeposit: 0,
                minTokenWithdrawal: 0,
                cooldownPeriod: 0,
                fee: {
                    reward: 0,
                    deposit: 0,
                    withdraw: 0,
                },
            },
        ]);
        await contract.deployed();
        await contract.unpause();
    });

    it('should fill claim requests', fillClaims);

    let gasLimitClaimAll: number, gasUsedClaimAll: number;

    // If this test fails, please consider lowering the value for MAX_CLAIMS_PER_USER.
    // It might be failing simply because the gas usage of the function call increased.
    it('should claim all', async function () {
        const tx = await contract.claimAll();
        const receipt = await tx.wait(1);
        gasLimitClaimAll = tx.gasLimit.toNumber();
        gasUsedClaimAll = receipt.gasUsed.toNumber();

        await expectClaimRequestCount(0);
    });

    it('re-fill claim requests', fillClaims);

    const gasLimitOneByOne: number[] = [];
    const gasUsedOneByOne: number[] = [];
    it('should claim one by one', async function () {
        for (let i = 0; i < MAX_CLAIMS_PER_USER; i++) {
            // randomly pick a request to claim
            const claimsLeft = MAX_CLAIMS_PER_USER - i;
            const tx = await contract.claim(Math.floor(Math.random() * claimsLeft));
            const receipt = await tx.wait(1);
            gasLimitOneByOne.push(tx.gasLimit.toNumber());
            gasUsedOneByOne.push(receipt.gasUsed.toNumber());
        }

        await expectClaimRequestCount(0);
    }).timeout(150000); // This timeout is required for the localhost network

    it('print analytics', function () {
        const netConfig: HardhatNetworkConfig = network.config as HardhatNetworkConfig;
        const gasLimitSum = gasLimitOneByOne.reduce((sum, a) => sum + a, 0);
        const gasUsedSum = gasUsedOneByOne.reduce((sum, a) => sum + a, 0);
        console.log('===================================================================');
        console.log();
        console.log('NUM_CLAIMS', MAX_CLAIMS_PER_USER);
        console.log();
        console.log('==== Gas Limit Stats ====');
        console.log('Min - one by one:', Math.min(...gasLimitOneByOne));
        console.log('Max - one by one:', Math.max(...gasLimitOneByOne));
        console.log('Avg - one by one:', gasLimitSum / MAX_CLAIMS_PER_USER);
        console.log('Total - one by one:', gasLimitSum);
        console.log('Avg - claimAll:', gasLimitClaimAll / MAX_CLAIMS_PER_USER);
        console.log('Total - claimAll:', gasLimitClaimAll);
        console.log(
            'Gas limit for claimAll is less than allowed blockGasLimit (%d): %s',
            netConfig.blockGasLimit,
            gasLimitClaimAll < netConfig.blockGasLimit,
        );
        console.log();
        console.log('==== Gas Used Stats ====');
        console.log('Min - one by one:', Math.min(...gasUsedOneByOne));
        console.log('Max - one by one:', Math.max(...gasUsedOneByOne));
        console.log('Avg - one by one:', gasUsedSum / MAX_CLAIMS_PER_USER);
        console.log('Total - one by one:', gasUsedSum);
        console.log('Avg - claimAll:', gasUsedClaimAll / MAX_CLAIMS_PER_USER);
        console.log('Total - claimAll:', gasUsedClaimAll);
        console.log(
            'Gas used for claimAll is less than allowed blockGasLimit (%d): %s',
            netConfig.blockGasLimit,
            gasUsedClaimAll < netConfig.blockGasLimit,
        );
        console.log();
        console.log('===================================================================');
    });

    async function fillClaims() {
        const chunkSize = 500;
        const numChunks = Math.floor(MAX_CLAIMS_PER_USER / chunkSize);
        const remainder = MAX_CLAIMS_PER_USER - numChunks * chunkSize;

        // fill claims only chunkSize at a time to ensure we don't hit the block gas limit
        for (let i = 0; i < numChunks; i++) {
            await contract.fillClaims(chunkSize);
        }
        if (remainder > 0) {
            await contract.fillClaims(remainder);
        }
        await expectClaimRequestCount(MAX_CLAIMS_PER_USER);
    }

    async function expectClaimRequestCount(expected: number) {
        expect(await contract.getClaimRequestCount(deployerAddr)).to.equal(
            BigNumber.from(expected),
        );
    }
});
