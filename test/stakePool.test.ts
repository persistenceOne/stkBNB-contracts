import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAY_SECONDS, STAKE_POOL_CONFIG, STAKE_POOL_CONFIG_V2 } from './helpers/constants';
import { createClaimFixture, createClaimV1Fixture, deployProtocolContractsV1Fixture, deployStakedBnbTokenFixture, depositBnbFixture, setupProtocolFixture } from './helpers/fixtures';
import { AllContractsDeployment } from './helpers/fixtures/types';
import { StakePool, StakePoolV1, StakedBNBToken } from '../typechain-types';
import { BigNumber, TypedDataDomain } from 'ethers';
import { StakePoolConfig } from '../scripts/types/config';
import { upgradeStakePoolV2 } from '../helpers/deployments';

export const PausablePaused = "PausablePaused";

// EIP712 helpers
const ClaimDataType = {
  Claim: [
    { name: "index", type: "uint256" },
  ]
};

type ClaimArgs = {
  index: BigNumber
}

describe("Stakepool tests", function () {
  it("should pause the StakedBNBToken", async () => {
    const stakedBNBTokenDeployment = await loadFixture(deployStakedBnbTokenFixture);
    const { stakedBNBToken } = stakedBNBTokenDeployment;
    expect(await stakedBNBToken.paused()).to.be.false;
    expect(await stakedBNBToken.pause()).to.not.be.reverted;
    expect(await stakedBNBToken.paused()).to.be.true;
  });

  describe("config tests", async () => {
    it("should update cooldown period", async () => {
      const allContractsDeployment = await loadFixture(setupProtocolFixture);
      const { stakePool } = allContractsDeployment.contracts;
      const currentConfig = await stakePool.config();
      expect(currentConfig.cooldownPeriod).to.be.equal(STAKE_POOL_CONFIG.cooldownPeriod);
      const newCooldownPeriod = BigNumber.from(24 * 3600) // 1 day
      const updatedConfig: StakePoolConfig = {
        ...STAKE_POOL_CONFIG,
        cooldownPeriod: newCooldownPeriod
      };
      await expect(stakePool.updateConfig(updatedConfig)).not.to.be.reverted;
      const newConfig = await stakePool.config();
      expect(newConfig.cooldownPeriod).to.be.equal(newCooldownPeriod);
    });

  });

  describe("deposit tests", () => {
    it("should make a deposit", async () => {
      const allContractsDeployment = await loadFixture(setupProtocolFixture);
      const { stakePool } = allContractsDeployment.contracts;
      const [user] = await ethers.getSigners();
      const stakePoolConnectedUser = stakePool.connect(user);
      expect(await stakePoolConnectedUser.deposit({ value: ethers.constants.WeiPerEther })).to.not.be.reverted;
    });
  
    it("should mint stkBNB correctly", async () => {
      const allContractsDeployment = await loadFixture(setupProtocolFixture);
      const { stakePool, stakedBNBToken } = allContractsDeployment.contracts;
      const [user] = await ethers.getSigners();
      const stakePoolConnectedUser = stakePool.connect(user);
      expect(await stakePoolConnectedUser.deposit({ value: ethers.constants.WeiPerEther }))
        .to.changeTokenBalance(stakedBNBToken, user, ethers.constants.WeiPerEther);
    });

    it("should mint stkBNB correctly when the rewards are distributed", async () => {
      const allContractsDeployment = await loadFixture(setupProtocolFixture);
      const { stakePool, stakedBNBToken, undelegationHolder } = allContractsDeployment.contracts;
      const { deployer, bot } = allContractsDeployment.accounts;
      const [user] = await ethers.getSigners();
      const stakePoolConnectedUser = stakePool.connect(user);

      expect(await stakePoolConnectedUser.deposit({ value: ethers.constants.WeiPerEther }))
        .to.changeTokenBalance(stakedBNBToken, user, ethers.constants.WeiPerEther);
      
      const stakePoolConnectedBot = stakePool.connect(bot);
      await stakePoolConnectedBot.epochUpdate(ethers.constants.WeiPerEther);
      
      await expect(stakePoolConnectedUser.deposit({ value: ethers.constants.WeiPerEther })).not.to.be.reverted;
      const userBalance = await stakedBNBToken.balanceOf(user.address);
      expect(userBalance.lt(ethers.constants.WeiPerEther.mul(2))).to.be.true; // Deposited 2 BNB, should have less than 2 stkBNB because of an epoch update
    });
  });

  describe("tokensReceived tests", () => {
    let allContractsDeployment: AllContractsDeployment;
    let stakePool: StakePool;
    let stakePoolConnectedUser: StakePool;
    let stkBnB: StakedBNBToken;
    let stkBnBConnectedUser: StakedBNBToken;
    let user: SignerWithAddress;

    beforeEach(async () => {
      allContractsDeployment = await loadFixture(setupProtocolFixture);
      stakePool = allContractsDeployment.contracts.stakePool as StakePool;
      
      const [_, userSigner] = await ethers.getSigners();
      user = userSigner;
      
      stakePoolConnectedUser = stakePool.connect(userSigner);
      expect(await stakePoolConnectedUser.deposit({ value: ethers.constants.WeiPerEther })).to.not.be.reverted;

      stkBnB = allContractsDeployment.contracts.stakedBNBToken;
      stkBnBConnectedUser = stkBnB.connect(userSigner);
    });

    it("should revert when paused", async () => {
      await stakePool.pause();
      expect(await stakePool.paused()).to.be.true;
      const balance = await stkBnB.balanceOf(user.address);
      await expect(stkBnBConnectedUser.send(stakePool.address, balance, []))
        .to.be.revertedWithCustomError(stakePool, PausablePaused);
    });

    it("should revert when message sender is not stkBNB", async () => {
      await expect(stakePool.tokensReceived(
        ethers.constants.AddressZero, 
        user.address, 
        stakePool.address, 
        ethers.constants.WeiPerEther, 
        [], 
        []
      )).to.be.revertedWithCustomError(stakePool, "UnknownSender");
    });

    it("should revert when minting tokens to self - sender address zero", async () => {
      const { addressStore } = allContractsDeployment.contracts;
      await addressStore.setStakePool(user.address); // to be able to mint 
      await expect(stkBnBConnectedUser.mint(
        stakePool.address, 
        ethers.constants.WeiPerEther, 
        [], 
        []
      )).to.be.revertedWithCustomError(stakePool, "TokenMintingToSelfNotAllowed");
    });
  });

  describe("Withdraw tests", () => {
    let allContractsDeployment: AllContractsDeployment;
    let user: SignerWithAddress;

    beforeEach(async () => {
      allContractsDeployment = await loadFixture(depositBnbFixture);      
      user = allContractsDeployment.accounts.user; 
    });

    it("should create a claim request", async () => {
      const stakedBNBTokenConnectedUser = allContractsDeployment.contracts.stakedBNBToken.connect(user);
      const { stakePool } = allContractsDeployment.contracts;

      const stkBnbBalance = await stakedBNBTokenConnectedUser.balanceOf(user.address);

      expect(await stakedBNBTokenConnectedUser.send(stakePool.address, stkBnbBalance, [])).to.not.be.reverted;
      expect(await stakePool.bnbToUnbond()).to.be.equal(stkBnbBalance);
      expect(await stakePool.getClaimRequestCount(user.address)).to.be.equal(ethers.constants.One);
      
      const blockNumber = await ethers.provider.getBlockNumber();
      
      const {weiToReturn, createdAt } = await stakePool.claimReqs(user.address, 0);
      
      const targetBlock = await ethers.provider.getBlock(blockNumber);
      
      expect(weiToReturn).to.be.equal(ethers.constants.WeiPerEther);
      expect(createdAt.toNumber()).to.be.equal(targetBlock.timestamp);
    });

    it("should claim", async () => {
      const { stakePool } = allContractsDeployment.contracts;
      const { user, bot} = allContractsDeployment.accounts;

      const stakedBNBTokenConnectedUser = allContractsDeployment.contracts.stakedBNBToken.connect(user);

      const stkBnbBalance = await stakedBNBTokenConnectedUser.balanceOf(user.address);

      expect(await stakedBNBTokenConnectedUser.send(stakePool.address, stkBnbBalance, [])).to.not.be.reverted;
      
      const stakePoolConnectedBot = stakePool.connect(bot);

      await stakePoolConnectedBot.unbondingInitiated(ethers.constants.WeiPerEther);
      await stakePoolConnectedBot.unbondingFinished();

      const stakePoolConnectedUser = stakePool.connect(user);

      await time.increase(DAY_SECONDS * 16);
      await time.increase(DAY_SECONDS * 16);
      await time.increase(DAY_SECONDS * 16);

      await stakePoolConnectedUser.claim(0);
    });
  });

  describe("V2 claims", () => {
    let allContractsDeployment: AllContractsDeployment;
    let user: SignerWithAddress;
    let stakePoolConnectedUser: StakePool
    let latestClaimIndex: BigNumber;

    beforeEach(async () => {
      allContractsDeployment = await loadFixture(createClaimFixture);      
      user = allContractsDeployment.accounts.user; 
      stakePoolConnectedUser = allContractsDeployment.contracts.stakePool.connect(user) as StakePool;
      
      const claimRequestCount = await stakePoolConnectedUser.getClaimRequestCount(user.address);
      latestClaimIndex = claimRequestCount.sub(1); // Because arrays are indexed from 0
    });

    describe("instant claim", () => {
      it("should instantClaim successfully", async () => {
        await expect(stakePoolConnectedUser.instantClaim(latestClaimIndex)).not.to.be.reverted;
      });
  
      it("should update the balances correctly when using instantClaim", async () => {
        const feePercentage = 1; // TODO: Get from contract
        const expectedValue = ethers.constants.WeiPerEther.mul(100 - feePercentage).div(100);
  
        await expect(stakePoolConnectedUser.instantClaim(latestClaimIndex))
          .to.changeEtherBalances(
            [user, stakePoolConnectedUser], 
            [expectedValue, expectedValue.mul(-1)]
          );
      });
    });

    describe("automatedClaim", () => {
      let signature: string;
      let stakePool: StakePool;

      beforeEach(async () => {
        stakePool = allContractsDeployment.contracts.stakePool as StakePool;
        const { user } = allContractsDeployment.accounts;

        const claim: ClaimArgs = {
          index: latestClaimIndex
        };

        signature = await user._signTypedData(allContractsDeployment.domains.StakePoolDomain, ClaimDataType, claim);

        await time.increase(24*3600*16);
      });

      it("should make an automatedClaim successfully", async () => {
        await expect(stakePool.automatedClaim(signature, latestClaimIndex, user.address)).to.not.be.reverted;
      });

      it("should update the balances correctly", async () => {
        const expectedValue = ethers.constants.WeiPerEther.sub(STAKE_POOL_CONFIG_V2.automatedClaimFee);
        await expect(stakePool.automatedClaim(signature, latestClaimIndex, user.address))
          .to.changeEtherBalances([user, stakePool], [expectedValue, expectedValue.mul(-1)]);
      });
    });
  });

  describe("Upgrade tests", () => {
    let allContractsDeployment: AllContractsDeployment;
    let stakePoolV1: StakePoolV1;
    let stakePool: StakePool;

    describe("after upgrade", () => {
      beforeEach(async () => { 
        allContractsDeployment = await loadFixture(deployProtocolContractsV1Fixture);
        stakePoolV1 = allContractsDeployment.contracts.stakePool as StakePoolV1;
        stakePool = await upgradeStakePoolV2(stakePoolV1.address, STAKE_POOL_CONFIG_V2);
      });

      it("should be paused after the upgrade", async () => {
        expect(await stakePool.paused()).to.be.true;
      });
    });

    describe("with upgrade", () => {
      let user: SignerWithAddress;
      let latestClaimIndex: BigNumber;
      
      beforeEach(async () => { 
        allContractsDeployment = await loadFixture(createClaimV1Fixture);
        
        stakePoolV1 = allContractsDeployment.contracts.stakePool as StakePoolV1;
        stakePool = await upgradeStakePoolV2(stakePoolV1.address, STAKE_POOL_CONFIG_V2);

        await stakePool.unpause();
        
        user = allContractsDeployment.accounts.user;

        const claimRequestCount = await stakePool.getClaimRequestCount(user.address);
        latestClaimIndex = claimRequestCount.sub(1); // Because arrays are indexed from 0
      });

      it("should finish a claim successfully", async () => {
        const stakePoolConnectedUser = stakePool.connect(user);
        await time.increase(24*3600*16);
        await expect(stakePoolConnectedUser.claim(latestClaimIndex)).not.to.be.reverted;

      });

      it("should finish an automated claim successfully", async () => {
        const claim: ClaimArgs = {
          index: latestClaimIndex
        };

        const signature = await user._signTypedData(allContractsDeployment.domains.StakePoolDomain, ClaimDataType, claim);

        await time.increase(24*3600*16);
        await expect(stakePool.automatedClaim(signature, latestClaimIndex, user.address)).not.to.be.reverted;
      });

      it("should finish an instantClaim successfully", async () => {
        const stakePoolConnectedUser = stakePool.connect(user);
        await expect(stakePoolConnectedUser.instantClaim(latestClaimIndex))
      });
    });
  });
});
