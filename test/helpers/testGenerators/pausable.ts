import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Fixture } from '../fixtures/types';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { Contract } from 'ethers';
import { expect } from 'chai';

export type PausableTest = {
    deploymentFixture: Fixture<unknown>;
    contractObjectName: string;
    ownerObjectName: string;
    pausedUponCreation?: boolean;
    errorMessage?: string;
};

async function getNonOwnerSigner(owner: SignerWithAddress) {
    const signers = await ethers.getSigners();
    let i = 0;
    while (signers[i].address == owner.address) {
        ++i;
    }
    return signers[i];
}

async function prepareObjects(data: PausableTest) {
    const result = (await loadFixture(data.deploymentFixture)) as any; // To hell with typesafety
    const owner = result[data.ownerObjectName] as SignerWithAddress;
    const nonOwner = await getNonOwnerSigner(owner);
    const contract = result[data.contractObjectName] as Contract;

    const pausable = await ethers.getContractAt('PausableImplementer', contract.address);

    if (!data.pausedUponCreation) {
        await pausable.pause();
    }

    return {
        owner,
        nonOwner,
        pausable,
    };
}

/**
 * Uses ethers.getSignerS() internally. Be aware. Only for hardhat testing.
 */
export async function generatePausableTests(data: PausableTest) {
    describe(`Pausable: ${data.contractObjectName}`, () => {
        it('should be paused upon creation', async () => {
            const { pausable } = await prepareObjects(data);

            expect(await pausable.paused()).to.be.true;
        });

        it('should unpause the contract', async () => {
            const { owner, pausable } = await prepareObjects(data);
            // Connect the owner
            const pausableConnectedOwner = pausable.connect(owner);

            expect(await pausableConnectedOwner.paused()).to.be.true;
            expect(await pausableConnectedOwner.unpause()).not.to.be.reverted;
            expect(await pausableConnectedOwner.paused()).to.be.false;
        });

        it('should pause the contract', async () => {
            const { owner, pausable } = await prepareObjects(data);
            // Connect the owner
            const pausableConnectedOwner = pausable.connect(owner);

            expect(await pausableConnectedOwner.paused()).to.be.true;
            expect(await pausableConnectedOwner.unpause()).not.to.be.reverted;
            expect(await pausableConnectedOwner.paused()).to.be.false;
            expect(await pausableConnectedOwner.pause()).not.to.be.reverted;
            expect(await pausableConnectedOwner.paused()).to.be.true;
        });

        it("should fail to unpause the contract if the caller isn't the owner", async () => {
            const { nonOwner, pausable } = await prepareObjects(data);
            // Connect the nonOwner
            const pausableConnectedNonOwner = pausable.connect(nonOwner);

            expect(await pausableConnectedNonOwner.paused()).to.be.true;
            await expect(pausableConnectedNonOwner.unpause()).to.be.reverted;
        });

        it("should fail to pause the contract if the caller isn't the owner", async () => {
            const { owner, nonOwner, pausable } = await prepareObjects(data);

            // Connect the owner
            const pausableConnectedOwner = pausable.connect(owner);

            expect(await pausableConnectedOwner.paused()).to.be.true;
            expect(await pausableConnectedOwner.unpause()).not.to.be.reverted;
            expect(await pausableConnectedOwner.paused()).to.be.false;

            // Connect the nonOwner
            const pausableConnectedNonOwner = pausable.connect(nonOwner);

            await expect(pausableConnectedNonOwner.pause()).to.be.reverted;
        });
    });
}

export async function initiatePausableTests(tests: PausableTest[]) {
    const promises = tests.map(t => generatePausableTests(t));
    Promise.all(promises);
}
