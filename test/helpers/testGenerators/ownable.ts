import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Fixture } from "../fixtures/types";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Contract, constants } from "ethers";
import { expect } from "chai";

export type OwnershipTest = {
  deploymentFixture: Fixture<unknown>,
  contractObjectName: string,
  ownerObjectName: string,
  ownableErrorMessage?: string
}

const OWNABLE_ERROR_MESSAGE = "Ownable: caller is not the owner";

async function getNonOwnerSigner(owner: SignerWithAddress) {
  const signers = await ethers.getSigners();
  let i = 0;
  while (signers[i].address == owner.address) {
    ++i;
  }
  return signers[i];
}

async function prepareObjects(data: OwnershipTest) {
  const result = (await loadFixture(data.deploymentFixture)) as any; // To hell with typesafety
  const owner = result[data.ownerObjectName] as SignerWithAddress;
  const nonOwner = await getNonOwnerSigner(owner);
  const contract = result[data.contractObjectName] as Contract;

  const ownable = await ethers.getContractAt("Ownable", contract.address);

  return {
    owner,
    nonOwner,
    ownable
  }
}

/**
 * Uses ethers.getSignerS() internally. Be aware. Only for hardhat testing.
 */
export async function generateOwnershipTests(data: OwnershipTest) {
  const ownableErrorMessage = data.ownableErrorMessage ? data.ownableErrorMessage : OWNABLE_ERROR_MESSAGE;

  describe(`Ownable: ${data.contractObjectName}`, () => {
    it("Should renounce the ownership", async () => {
      const { owner, ownable } = await prepareObjects(data);
      // Connect the owner
      const ownableConnectedOwner = ownable.connect(owner);

      expect(await ownableConnectedOwner.renounceOwnership()).not.to.be.reverted;
      expect(await ownableConnectedOwner.owner()).to.be.equal(constants.AddressZero);
    });

    it("Should fail to renounce the ownership if the caller isn't the owner", async () => {
      const { nonOwner, ownable } = await prepareObjects(data);
      // Connect the nonOwner
      const ownableConnectedNonOwner = ownable.connect(nonOwner);

      await expect(ownableConnectedNonOwner.renounceOwnership()).to.be.revertedWith(ownableErrorMessage);
    });

    it("Should transfer the ownership", async () => {
      const { owner, nonOwner, ownable } = await prepareObjects(data);
      // Connect the owner
      const ownableConnectedOwner = ownable.connect(owner);

      expect(await ownableConnectedOwner.transferOwnership(nonOwner.address)).not.to.be.reverted;
      expect(await ownableConnectedOwner.owner()).to.be.equal(nonOwner.address);
    });

    it("Should fail to transfer the ownership if the caller isn't the owner", async () => {
      const { nonOwner, ownable } = await prepareObjects(data);
      // Connect the nonOwner
      const ownableConnectedNonOwner = ownable.connect(nonOwner);

      await expect(ownableConnectedNonOwner.transferOwnership(nonOwner.address)).to.be.revertedWith(ownableErrorMessage);
    });
  });
}

export async function initiateOwnershipTests(tests: OwnershipTest[]) {
  const promises = tests.map(t => generateOwnershipTests(t));
  Promise.all(promises);
}