import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ERC1820_REGISTRY_ADDRESS } from './helpers/erc1820Registry';
import { ethers } from 'hardhat';
import {
    deployAddressStoreFixture,
    deployFeeVaultFixture,
    deployProtocolContractsFixture,
    deployStakePoolFixture,
    deployStakedBnbTokenFixture,
    deployTimelockedAdminFixture,
    deployTokenHubFixture,
    deployUndelegationHolderFixture,
} from './helpers/fixtures';
import { getStorableContractAddresses, storeAddresses } from '../helpers/setUps/addressStore';
import { TOKEN_HUB_ADDRESS, TOKEN_HUB_ARGS } from './helpers/constants';

describe('Set-up & Deployment tests', () => {
    describe('System contracts', () => {
        it('should check for TokenHub instance', async () => {
            const tokenHub = await deployTokenHubFixture();
            expect(tokenHub.address).to.be.equal(TOKEN_HUB_ADDRESS);
            expect(await tokenHub.getMiniRelayFee()).to.be.equal(
                ethers.utils.parseEther(TOKEN_HUB_ARGS.miniRelayFee),
            );
        });

        it('should check for ERC1820 instance', async () => {
            const erc1820Code = await ethers.provider.getCode(ERC1820_REGISTRY_ADDRESS);
            expect(erc1820Code.substring(0, 2)).to.be.equal('0x');
        });
    });

    it('should deploy an AddressStore', async () => {
        const addressStoreDeployment = await loadFixture(deployAddressStoreFixture);
        const { addressStore, deployer } = addressStoreDeployment;
        expect(await addressStore.owner()).to.be.equal(deployer.address);
    });

    it('should deploy UndelegationHolder', async () => {
        const undelegationHolderDeployment = await loadFixture(deployUndelegationHolderFixture);
        const { undelegationHolder, addressStore } = undelegationHolderDeployment;
        expect(await undelegationHolder.addressStore()).to.be.equal(addressStore.address);
    });

    it('should deploy StakedBNBToken', async () => {
        const stakedBNBTokenDeployment = await loadFixture(deployStakedBnbTokenFixture);
        const { stakedBNBToken, deployer } = stakedBNBTokenDeployment;
        expect(await stakedBNBToken.getOwner()).to.be.equal(deployer.address);
    });

    it('should deploy TimelockedAdmin', async () => {
        const { timelockedAdmin, timelockedAdminArgs } = await loadFixture(
            deployTimelockedAdminFixture,
        );
        expect(await timelockedAdmin.getMinDelay()).to.be.equal(timelockedAdminArgs.minPeriod);
    });

    it('should deploy FeeVault', async () => {
        const feeVaultDeployment = await loadFixture(deployFeeVaultFixture);
        const { feeVaultProxy, addressStore } = feeVaultDeployment;
        expect(await feeVaultProxy.addressStore()).to.be.equal(addressStore.address);
    });

    it('should deploy StakePool', async () => {
        const stakePoolDeployment = await loadFixture(deployStakePoolFixture);
        const { stakePoolProxy } = stakePoolDeployment;
        expect(await stakePoolProxy.paused()).to.be.true;
    });

    it('should store the addresses', async () => {
        const { contracts } = await loadFixture(deployProtocolContractsFixture);
        const { addressStore } = contracts;
        const storedContractAddresses = getStorableContractAddresses(contracts);
        await expect(storeAddresses(contracts.addressStore, storedContractAddresses)).to.not.be
            .reverted;
        expect(await addressStore.getFeeVault()).to.be.equal(storedContractAddresses.feeVault);
        expect(await addressStore.getStakePool()).to.be.equal(storedContractAddresses.stakePool);
        expect(await addressStore.getStkBNB()).to.be.equal(storedContractAddresses.stakedBNBToken);
        expect(await addressStore.getTimelockedAdmin()).to.be.equal(
            storedContractAddresses.timelockedAdmin,
        );
        expect(await addressStore.getUndelegationHolder()).to.be.equal(
            storedContractAddresses.undelegationHolder,
        );
    });
});
