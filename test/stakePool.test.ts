import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAY_SECONDS } from './helpers/constants';
import { deployStakedBnbTokenFixture, depositBnbFixture, setupProtocolFixture } from './helpers/fixtures';
import { AllContractsDeployment } from './helpers/fixtures/types';

describe("Stakepool tests", function () {
  it("should pause the StakedBNBToken", async () => {
    const stakedBNBTokenDeployment = await loadFixture(deployStakedBnbTokenFixture);
    const { stakedBNBToken } = stakedBNBTokenDeployment;
    expect(await stakedBNBToken.paused()).to.be.false;
    expect(await stakedBNBToken.pause()).to.not.be.reverted;
    expect(await stakedBNBToken.paused()).to.be.true;
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
  });

  describe("withdraw tests", () => {
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
});
