import { ethers, upgrades, web3 } from 'hardhat';
import { BigNumber, Contract, ContractFactory } from 'ethers';
import { Config } from '../types/config';
import { getNetwork, isLocalNetwork } from './network';
import { executeTx } from './transaction';
import { logDeployerInfo } from './deployer';
import { formatEther } from 'ethers/lib/utils';
import { RoleInfo } from '../types/role-info';
import { Claims } from '../types/claim';
import { SysContracts } from './sys-contracts';

require('@openzeppelin/test-helpers/configure')({ web3 });
const { singletons } = require('@openzeppelin/test-helpers');

export interface ContractFactories {
    AddressStore: ContractFactory;
    StakedBNBToken: ContractFactory;
    UndelegationHolder: ContractFactory;
    FeeVault: ContractFactory;
    StakePool: ContractFactory;
}

export class Contracts {
    private static NUM_CONTRACTS: number = 5;
    public addressStore: Contract;
    public stakedBNBToken: Contract;
    public undelegationHolder: Contract;
    public feeVault: Contract;
    public stakePool: Contract;
    public sys: SysContracts;

    // The constructor should not be used anywhere in the code, except the `new` function.
    private constructor(contracts: Contract[], sys: SysContracts) {
        this.addressStore = contracts[0];
        this.stakedBNBToken = contracts[1];
        this.undelegationHolder = contracts[2];
        this.feeVault = contracts[3];
        this.stakePool = contracts[4];
        this.sys = sys;
    }

    // A wrapper around the constructor to pass in the system contracts.
    // Always this should be used to construct a new instance of this class.
    private static async new(contracts: Contract[]): Promise<Contracts> {
        return new Contracts(contracts, await SysContracts.new());
    }

    public static async factories(): Promise<ContractFactories> {
        return {
            AddressStore: await ethers.getContractFactory('AddressStore'),
            StakedBNBToken: await ethers.getContractFactory('StakedBNBToken'),
            UndelegationHolder: await ethers.getContractFactory('UndelegationHolder'),
            FeeVault: await ethers.getContractFactory('FeeVault'),
            StakePool: await ethers.getContractFactory('StakePool'),
        } as ContractFactories;
    }

    public static async attach(config: Config): Promise<Contracts> {
        const factories: ContractFactories = await Contracts.factories();

        return Contracts.new([
            factories.AddressStore.attach(config.addressStore.address),
            factories.StakedBNBToken.attach(config.stkBNB.address),
            factories.UndelegationHolder.attach(config.undelegationHolder.address),
            factories.FeeVault.attach(config.feeVault.address),
            factories.StakePool.attach(config.stakePool.address),
        ]);
    }

    public static async deploy(config: Config): Promise<Contracts> {
        const factories: ContractFactories = await Contracts.factories();
        const contracts = await Contracts.new(new Array<Contract>(Contracts.NUM_CONTRACTS));

        const deployerAddr = await logDeployerInfo();

        // deploy ERC1820Registry for local setup
        if (isLocalNetwork(getNetwork())) {
            await singletons.ERC1820Registry(deployerAddr);
            console.log('ERC1820 Registry deployed');
        }

        const initialDeployerBalance = await ethers.provider.getBalance(deployerAddr);

        // deploy address store
        if (config.addressStore.deploy) {
            contracts.addressStore = await factories.AddressStore.deploy();
            await contracts.addressStore.deployed();

            console.log(`AddressStore deployed: ${contracts.addressStore.address}`);
        } else {
            contracts.addressStore = factories.AddressStore.attach(config.addressStore.address);
            console.log(`AddressStore attached: ${contracts.addressStore.address}`);
        }

        // deploy stkBNB
        if (config.stkBNB.deploy) {
            contracts.stakedBNBToken = await factories.StakedBNBToken.deploy();
            await contracts.stakedBNBToken.deployed();

            console.log(`StakedBNBToken deployed: ${contracts.stakedBNBToken.address}`);
        } else {
            contracts.stakedBNBToken = factories.StakedBNBToken.attach(config.stkBNB.address);
            console.log(`StakedBNBToken attached: ${contracts.stakedBNBToken.address}`);
        }

        // deploy undelegationHolder
        if (config.undelegationHolder.deploy) {
            contracts.undelegationHolder = await factories.UndelegationHolder.deploy(
                contracts.addressStore.address,
            );
            await contracts.undelegationHolder.deployed();

            console.log(`UndelegationHolder deployed: ${contracts.undelegationHolder.address}`);
        } else {
            contracts.undelegationHolder = factories.UndelegationHolder.attach(
                config.undelegationHolder.address,
            );
            console.log(`UndelegationHolder attached: ${contracts.undelegationHolder.address}`);
        }

        // deploy fee vault
        if (config.feeVault.deploy) {
            contracts.feeVault = await upgrades.deployProxy(factories.FeeVault, [
                contracts.addressStore.address,
            ]);
            await contracts.feeVault.deployed();

            console.log(`FeeVault deployed: ${contracts.feeVault.address}`);
        } else {
            contracts.feeVault = factories.FeeVault.attach(config.feeVault.address);
            console.log(`FeeVault attached: ${contracts.feeVault.address}`);
        }

        // deploy stakePool
        if (config.stakePool.deploy) {
            contracts.stakePool = await upgrades.deployProxy(factories.StakePool, [
                contracts.addressStore.address,
                config.stakePool.init.config,
            ]);
            await contracts.stakePool.deployed();

            console.log(`StakePool deployed: ${contracts.stakePool.address}`);
        } else {
            contracts.stakePool = factories.StakePool.attach(config.stakePool.address);
            console.log(`StakePool attached: ${contracts.stakePool.address}`);
        }

        // setup the whole system
        if (config.postDeploySetup) {
            console.log('Starting post-deploy setup...');

            // setup stkBNB
            if (config.stkBNB.deploy) {
                await executeTx(contracts.addressStore, 'setStkBNB', [
                    contracts.stakedBNBToken.address,
                ]);
                console.log('AddressStore updated with stkBNB');
            }

            if (config.undelegationHolder.deploy) {
                await executeTx(contracts.addressStore, 'setUndelegationHolder', [
                    contracts.undelegationHolder.address,
                ]);
                console.log('AddressStore updated with UndelegationHolder');
            }

            if (config.feeVault.deploy) {
                await executeTx(contracts.addressStore, 'setFeeVault', [
                    contracts.feeVault.address,
                ]);
                console.log('AddressStore updated with FeeVault');
            }

            // setup StakePool
            if (config.stakePool.deploy) {
                await executeTx(contracts.addressStore, 'setStakePool', [
                    contracts.stakePool.address,
                ]);
                console.log('AddressStore updated with StakePool');

                await executeTx(contracts.stakedBNBToken, 'grantRole', [
                    await contracts.stakedBNBToken.MINTER_ROLE(),
                    contracts.stakePool.address,
                ]);
                console.log('stkBNB MINTER set to StakePool');

                await executeTx(contracts.stakedBNBToken, 'grantRole', [
                    await contracts.stakedBNBToken.BURNER_ROLE(),
                    contracts.stakePool.address,
                ]);
                console.log('stkBNB BURNER set to StakePool');

                await executeTx(contracts.stakePool, 'grantRole', [
                    await contracts.stakePool.BOT_ROLE(),
                    config.botAddr,
                ]);
                console.log(`Granted StakePool BOT_ROLE to ${config.botAddr}`);

                await executeTx(contracts.stakePool, 'unpause', []);
                console.log('StakePool unpaused');
            }

            console.log('Finished post-deploy setup!');
        } else {
            console.log('Skipping post-deploy setup.');
        }

        const balanceUsed = initialDeployerBalance.sub(
            await ethers.provider.getBalance(deployerAddr),
        );

        // logging
        contracts.logAddress();
        console.log('Balance used: ', ethers.utils.formatEther(balanceUsed));
        console.log('Deploy complete!!!');

        return contracts;
    }

    public static async upgrade(config: Config): Promise<Contracts> {
        const factories = await Contracts.factories();
        const contracts = await Contracts.new(new Array<Contract>(Contracts.NUM_CONTRACTS));

        const deployerAddr = await logDeployerInfo();
        const initialDeployerBalance = await ethers.provider.getBalance(deployerAddr);

        // FeeVault
        if (config.feeVault.upgrade) {
            contracts.feeVault = await upgrades.upgradeProxy(
                config.feeVault.address,
                factories.FeeVault,
            );
            await contracts.feeVault.deployed();
            console.log('FeeVault Upgraded!');
        }

        // StakePool
        if (config.stakePool.upgrade) {
            contracts.stakePool = await upgrades.upgradeProxy(
                config.stakePool.address,
                factories.StakePool,
            );
            await contracts.stakePool.deployed();
            console.log('StakePool Upgraded!');
        }

        const balanceUsed = initialDeployerBalance.sub(
            await ethers.provider.getBalance(deployerAddr),
        );

        // logging
        contracts.logAddress();
        console.log('Balance used: ', ethers.utils.formatEther(balanceUsed));
        console.log('Upgrade complete!!!');

        return contracts;
    }

    public static async transferOwnershipToGnosis(config: Config) {
        const contracts = await Contracts.attach(config);
        const deployerAddr = await logDeployerInfo();

        // stkBNB: Transfer BEP20 ownership to Gnosis
        await executeTx(contracts.stakedBNBToken, 'transferOwnership', [config.gnosisSafeAddr]);
        console.log('Transferred stkBNB BEP20 ownership to Gnosis');

        // stkBNB: Transfer DEFAULT_ADMIN_ROLE to Gnosis and revoke role from deployer account
        await executeTx(contracts.stakedBNBToken, 'grantRole', [
            await contracts.stakedBNBToken.DEFAULT_ADMIN_ROLE(),
            config.gnosisSafeAddr,
        ]);
        console.log('Granted stkBNB DEFAULT_ADMIN to Gnosis');

        await executeTx(contracts.stakedBNBToken, 'revokeRole', [
            await contracts.stakedBNBToken.DEFAULT_ADMIN_ROLE(),
            deployerAddr,
        ]);
        console.log('Revoked stkBNB DEFAULT_ADMIN from deployer');

        // StakePool: Transfer DEFAULT_ADMIN_ROLE to Gnosis and revoke role from deployer account
        await executeTx(contracts.stakePool, 'grantRole', [
            await contracts.stakePool.DEFAULT_ADMIN_ROLE(),
            config.gnosisSafeAddr,
        ]);
        console.log('Granted StakePool DEFAULT_ADMIN to Gnosis');

        await executeTx(contracts.stakePool, 'revokeRole', [
            await contracts.stakePool.DEFAULT_ADMIN_ROLE(),
            deployerAddr,
        ]);
        console.log('Revoked StakePool DEFAULT_ADMIN from deployer');

        // FeeVault & AddressStore: Transfer ownership to Gnosis
        await executeTx(contracts.feeVault, 'transferOwnership', [config.gnosisSafeAddr]);
        console.log('Transferred FeeVault ownership from deployer to Gnosis');
        await executeTx(contracts.addressStore, 'transferOwnership', [config.gnosisSafeAddr]);
        console.log('Transferred AddressStore ownership from deployer to Gnosis');
    }

    public static async updateStakePoolConfig(config: Config) {
        const contracts = await Contracts.attach(config);
        await executeTx(contracts.stakePool, 'updateConfig', [config.stakePool.init.config]);
        console.log('Config Updated!!!');
    }

    public static async query(config: Config) {
        const contracts = await Contracts.attach(config);
        await contracts.query();
    }

    public async query() {
        const startTime: Date = new Date();
        console.log('Start time: ', startTime);

        // print deployer info
        const deployerAddr = await logDeployerInfo();

        const addressStore: Contract = this.addressStore;
        console.log('=== AddressStore ===');
        console.log('Address: ', addressStore.address);
        console.log(`getStkBNB: ${await addressStore.getStkBNB()}`);
        console.log(`getUndelegationHolder: ${await addressStore.getUndelegationHolder()}`);
        console.log(`getFeeVault: ${await addressStore.getFeeVault()}`);
        console.log(`getStakePool: ${await addressStore.getStakePool()}`);

        console.log('\n\n');

        const stkBNB: Contract = this.stakedBNBToken;
        console.log('=== stkBNB ===');
        console.log('Address: ', stkBNB.address);
        console.log('Name: ', await stkBNB.name());
        console.log('Symbol: ', await stkBNB.symbol());
        console.log(`totalSupply: ${formatEther(await stkBNB.totalSupply())} stkBNB`);
        console.log('Decimals: ', await stkBNB.decimals());
        console.log('Granularity: ', await stkBNB.granularity());
        console.log('Owner: ', await stkBNB.getOwner());
        console.log(
            'DEFAULT_ADMIN_ROLE: ',
            await RoleInfo.get(stkBNB, await stkBNB.DEFAULT_ADMIN_ROLE()),
        );
        console.log('MINTER_ROLE: ', await RoleInfo.get(stkBNB, await stkBNB.MINTER_ROLE()));
        console.log('BURNER_ROLE: ', await RoleInfo.get(stkBNB, await stkBNB.BURNER_ROLE()));

        console.log('\n\n');

        const uh: Contract = this.undelegationHolder;
        console.log('=== UndelegationHolder ===');
        console.log('Address: ', uh.address);
        console.log(`Balance: ${formatEther(await ethers.provider.getBalance(uh.address))} BNB`);

        console.log('\n\n');

        const feeVault: Contract = this.feeVault;
        console.log('=== FeeVault ===');
        console.log('Address: ', feeVault.address);
        console.log(
            `Balance: ${formatEther(await ethers.provider.getBalance(feeVault.address))} BNB`,
        );
        console.log(
            `Balance (stkBNB): ${formatEther(await stkBNB.balanceOf(feeVault.address))} stkBNB`,
        );

        console.log('\n\n');

        const stakePool: Contract = this.stakePool;
        const balance: BigNumber = await ethers.provider.getBalance(stakePool.address);
        const claimReserve: BigNumber = await stakePool.claimReserve();
        console.log('=== StakePool ===');
        console.log('Address: ', stakePool.address);
        console.log(`Balance: ${formatEther(balance)} BNB`);
        console.log(
            'DEFAULT_ADMIN_ROLE: ',
            await RoleInfo.get(stakePool, await stakePool.DEFAULT_ADMIN_ROLE()),
        );
        console.log('BOT_ROLE: ', await RoleInfo.get(stakePool, await stakePool.BOT_ROLE()));
        console.log('Paused: ', await stakePool.paused());
        console.log('AddressStore: ', await stakePool.addressStore());
        console.log('bnbToUnbond: ', await stakePool.bnbToUnbond());
        console.log('bnbUnbonding: ', await stakePool.bnbUnbonding());
        console.log('claimReserve: ', claimReserve);
        console.log('Balance - claimReserve: ', balance.sub(claimReserve));
        console.log('Exchange Rate: ', await stakePool.exchangeRate());
        console.log('Config: ', await stakePool.config());
        console.log(`claims[${deployerAddr}]: `, await Claims.get(stakePool, deployerAddr)); // claims for the deployer

        console.log('\n\n');

        console.log('End time: ', new Date());
        console.log(`Total time spent: ${(new Date().getTime() - startTime.getTime()) / 1000}s`);
    }

    public async mirrorStkBNB() {
        await this.sys.mirror(this.stakedBNBToken.address);
    }

    public async syncStkBNB() {
        await this.sys.sync(this.stakedBNBToken.address);
    }

    public async transferOutStkBNB(bcRecipient: string, amount: BigNumber) {
        await this.sys.transferOut(this.stakedBNBToken, bcRecipient, amount);
    }

    public logAddress() {
        console.log();
        console.log('======== Contract Addresses ========');
        for (const [k, v] of Object.entries(this)) {
            let address: any;
            if (v !== undefined) {
                address = v.address;
            }
            console.log(`${k}: ${address}`);
        }
        console.log('======== Contract Addresses ========');
        console.log();
    }
}

// TODO: this should be removed, the Contracts class should be able to handle any deployment usecase
export async function deployContract(name: string): Promise<Contract> {
    const factory: ContractFactory = await ethers.getContractFactory(name);
    const contract: Contract = await factory.deploy();
    await contract.deployed();

    return contract;
}
