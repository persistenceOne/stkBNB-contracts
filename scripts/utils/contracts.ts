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
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { getAdminAddress } from '@openzeppelin/upgrades-core';
import * as assert from 'assert';
import { sleep } from './util';

require('@openzeppelin/test-helpers/configure')({ web3 });
const { singletons } = require('@openzeppelin/test-helpers');

export interface ContractFactories {
    AddressStore: ContractFactory;
    TimelockedAdmin: ContractFactory;
    StakedBNBToken: ContractFactory;
    DelegationManager: ContractFactory;
    FeeVault: ContractFactory;
    StakePool: ContractFactory;
}

export class Contracts {
    private static NUM_CONTRACTS: number = 6;
    public addressStore: Contract;
    public timelockedAdmin: Contract;
    public stakedBNBToken: Contract;
    public delegationManager: Contract;
    public feeVault: Contract;
    public stakePool: Contract;
    public sys: SysContracts;

    // The constructor should not be used anywhere in the code, except the `new` function.
    private constructor(contracts: Contract[], sys: SysContracts) {
        this.addressStore = contracts[0];
        this.timelockedAdmin = contracts[1];
        this.stakedBNBToken = contracts[2];
        this.delegationManager = contracts[3];
        this.feeVault = contracts[4];
        this.stakePool = contracts[5];
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
            TimelockedAdmin: await ethers.getContractFactory('TimelockedAdmin'),
            StakedBNBToken: await ethers.getContractFactory('StakedBNBToken'),
            DelegationManager: await ethers.getContractFactory('DelegationManager'),
            FeeVault: await ethers.getContractFactory('FeeVault'),
            StakePool: await ethers.getContractFactory('StakePool'),
        } as ContractFactories;
    }

    public static async attach(config: Config): Promise<Contracts> {
        const factories: ContractFactories = await Contracts.factories();

        return Contracts.new([
            factories.AddressStore.attach(config.addressStore.address),
            factories.TimelockedAdmin.attach(config.timelockedAdmin.address),
            factories.StakedBNBToken.attach(config.stkBNB.address),
            factories.DelegationManager.attach(config.delegationManager.address),
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

        // deploy timelocked admin
        if (config.timelockedAdmin.deploy) {
            contracts.timelockedAdmin = await factories.TimelockedAdmin.deploy(
                config.timelockedAdmin.init.minDelay,
                [], // no proposers initially
                [ethers.constants.AddressZero], // executor => anyone
            );
            await contracts.timelockedAdmin.deployed();

            console.log(`TimelockedAdmin deployed: ${contracts.timelockedAdmin.address}`);
        } else {
            contracts.timelockedAdmin = factories.TimelockedAdmin.attach(
                config.timelockedAdmin.address,
            );
            console.log(`TimelockedAdmin attached: ${contracts.timelockedAdmin.address}`);
        }

        // deploy stkBNB
        if (config.stkBNB.deploy) {
            contracts.stakedBNBToken = await factories.StakedBNBToken.deploy(
                contracts.addressStore.address,
            );
            await contracts.stakedBNBToken.deployed();

            console.log(`StakedBNBToken deployed: ${contracts.stakedBNBToken.address}`);
        } else {
            contracts.stakedBNBToken = factories.StakedBNBToken.attach(config.stkBNB.address);
            console.log(`StakedBNBToken attached: ${contracts.stakedBNBToken.address}`);
        }

        // deploy DelegationManager
        if (config.delegationManager.deploy) {
            contracts.delegationManager = await factories.DelegationManager.deploy(
                contracts.addressStore.address,
            );
            await contracts.delegationManager.deployed();

            console.log(`DelegationManager deployed: ${contracts.delegationManager.address}`);
        } else {
            contracts.delegationManager = factories.DelegationManager.attach(
                config.delegationManager.address,
            );
            console.log(`DelegationManager attached: ${contracts.delegationManager.address}`);
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

            // setup timelocked admin
            if (config.timelockedAdmin.deploy) {
                await executeTx(contracts.addressStore, 'setTimelockedAdmin', [
                    contracts.timelockedAdmin.address,
                ]);
                console.log('AddressStore updated with TimelockedAdmin');
            }

            // setup stkBNB
            if (config.stkBNB.deploy) {
                await executeTx(contracts.addressStore, 'setStkBNB', [
                    contracts.stakedBNBToken.address,
                ]);
                console.log('AddressStore updated with stkBNB');
            }

            // setup DelegationManager
            if (config.delegationManager.deploy) {
                await executeTx(contracts.addressStore, 'setDelegationManager', [
                    contracts.delegationManager.address,
                ]);
                console.log('AddressStore updated with DelegationManager');
            }

            // setup FeeVault
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

        // stkBNB: Transfer BEP20 ownership to primary Gnosis
        await executeTx(contracts.stakedBNBToken, 'transferOwnership', [
            config.gnosisSafeAddr.primary,
        ]);
        console.log('Transferred stkBNB BEP20 ownership from deployer to primary Gnosis');

        // StakePool: Transfer DEFAULT_ADMIN_ROLE to Gnosis and revoke role from deployer account
        await executeTx(contracts.stakePool, 'grantRole', [
            await contracts.stakePool.DEFAULT_ADMIN_ROLE(),
            config.gnosisSafeAddr.primary,
        ]);
        console.log('Granted StakePool DEFAULT_ADMIN to primary Gnosis');

        await executeTx(contracts.stakePool, 'grantRole', [
            await contracts.stakePool.DEFAULT_ADMIN_ROLE(),
            config.gnosisSafeAddr.secondary,
        ]);
        console.log('Granted StakePool DEFAULT_ADMIN to secondary Gnosis');

        await executeTx(contracts.stakePool, 'revokeRole', [
            await contracts.stakePool.DEFAULT_ADMIN_ROLE(),
            deployerAddr,
        ]);
        console.log('Revoked StakePool DEFAULT_ADMIN from deployer');

        // FeeVault: Transfer ownership to secondary Gnosis
        await executeTx(contracts.feeVault, 'transferOwnership', [config.gnosisSafeAddr.secondary]);
        console.log('Transferred FeeVault ownership from deployer to secondary Gnosis');

        // TimelockedAdmin: Grant PROPOSER_ROLE to primary & secondary Gnosis
        await executeTx(contracts.timelockedAdmin, 'grantRole', [
            await contracts.timelockedAdmin.PROPOSER_ROLE(),
            config.gnosisSafeAddr.primary,
        ]);
        console.log('Granted TimelockedAdmin PROPOSER_ROLE to primary Gnosis');

        await executeTx(contracts.timelockedAdmin, 'grantRole', [
            await contracts.timelockedAdmin.PROPOSER_ROLE(),
            config.gnosisSafeAddr.secondary,
        ]);
        console.log('Granted TimelockedAdmin PROPOSER_ROLE to secondary Gnosis');

        // TimelockedAdmin: Grant CANCELLER_ROLE to primary & secondary Gnosis
        await executeTx(contracts.timelockedAdmin, 'grantRole', [
            await contracts.timelockedAdmin.CANCELLER_ROLE(),
            config.gnosisSafeAddr.primary,
        ]);
        console.log('Granted TimelockedAdmin CANCELLER_ROLE to primary Gnosis');

        await executeTx(contracts.timelockedAdmin, 'grantRole', [
            await contracts.timelockedAdmin.CANCELLER_ROLE(),
            config.gnosisSafeAddr.secondary,
        ]);
        console.log('Granted TimelockedAdmin CANCELLER_ROLE to secondary Gnosis');

        // TimelockedAdmin: Revoke TIMELOCK_ADMIN_ROLE from deployer
        await executeTx(contracts.timelockedAdmin, 'revokeRole', [
            await contracts.timelockedAdmin.TIMELOCK_ADMIN_ROLE(),
            deployerAddr,
        ]);
        console.log('Revoked TimelockedAdmin TIMELOCK_ADMIN_ROLE from deployer');
        console.log(
            '**NOTE**: Any changes to TimelockedAdmin will now have to be scheduled via TimelockedAdmin itself, resulting in delay as configured in the TimelockedAdmin',
        );

        // AddressStore: Transfer ownership to TimelockedAdmin
        await executeTx(contracts.addressStore, 'transferOwnership', [
            config.timelockedAdmin.address,
        ]);
        console.log('Transferred AddressStore ownership from deployer to TimelockedAdmin');

        // ProxyAdmin: Transfer ownership to TimelockedAdmin
        // should be transferred back when needed for upgrade
        await executeTx(await contracts.proxyAdmin(), 'transferOwnership', [
            config.timelockedAdmin.address,
        ]);
        console.log('Transferred ProxyAdmin ownership from deployer to TimelockedAdmin');
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
        console.log(`getTimelockedAdmin: ${await addressStore.getTimelockedAdmin()}`);
        console.log(`getStkBNB: ${await addressStore.getStkBNB()}`);
        console.log(`getDelegationManager: ${await addressStore.getDelegationManager()}`);
        console.log(`getFeeVault: ${await addressStore.getFeeVault()}`);
        console.log(`getStakePool: ${await addressStore.getStakePool()}`);

        console.log('\n\n');

        const timelockedAdmin: Contract = this.timelockedAdmin;
        console.log('=== TimelockedAdmin ===');
        console.log(`minDelay: ${await timelockedAdmin.getMinDelay()}`);

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

        console.log('\n\n');

        const uh: Contract = this.delegationManager;
        console.log('=== DelegationManager ===');
        console.log('Address: ', uh.address);
        console.log(`Balance: ${formatEther(await ethers.provider.getBalance(uh.address))} BNB`);

        console.log('\n\n');

        const proxyAdmin: Contract = await this.proxyAdmin();
        console.log('=== ProxyAdmin ===');
        console.log('Address: ', proxyAdmin.address);
        console.log(`Owner: ${await proxyAdmin.owner()}`);

        console.log('\n\n');

        const feeVault: Contract = this.feeVault;
        console.log('=== FeeVault ===');
        console.log('Address (proxy): ', feeVault.address);
        console.log(`Address (impl): ${await proxyAdmin.getProxyImplementation(feeVault.address)}`);
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
        console.log('Address (proxy): ', stakePool.address);
        console.log(
            `Address (impl): ${await proxyAdmin.getProxyImplementation(stakePool.address)}`,
        );
        console.log(`Balance: ${formatEther(balance)} BNB`);
        console.log(
            'DEFAULT_ADMIN_ROLE: ',
            await RoleInfo.get(stakePool, await stakePool.DEFAULT_ADMIN_ROLE()),
        );
        console.log('BOT_ROLE: ', await RoleInfo.get(stakePool, await stakePool.BOT_ROLE()));
        console.log('Paused: ', await stakePool.paused());
        console.log('AddressStore: ', await stakePool.addressStore());
        console.log('bnbToUnbond: ', formatEther(await stakePool.bnbToUnbond()));
        console.log('bnbUnbonding: ', formatEther(await stakePool.bnbUnbonding()));
        console.log('claimReserve: ', formatEther(claimReserve));
        console.log('Balance - claimReserve: ', formatEther(balance.sub(claimReserve)));
        console.log('Exchange Rate: ', await stakePool.exchangeRate());
        console.log('Config: ', await stakePool.config());
        console.log(`claims[${deployerAddr}]: `, await Claims.get(stakePool, deployerAddr)); // claims for the deployer

        console.log('\n\n');

        console.log('End time: ', new Date());
        console.log(`Total time spent: ${(new Date().getTime() - startTime.getTime()) / 1000}s`);
    }

    public async proxyAdmin(): Promise<Contract> {
        const feeVaultProxyAdmin: string = await getAdminAddress(
            ethers.provider,
            this.feeVault.address,
        );
        const stakePoolProxyAdmin: string = await getAdminAddress(
            ethers.provider,
            this.stakePool.address,
        );
        assert.strictEqual<string>(feeVaultProxyAdmin, stakePoolProxyAdmin);

        return ethers.getContractAt('IProxyAdmin', feeVaultProxyAdmin);
    }

    public async scheduleAndExecuteTimelockOp(
        targetAddr: string,
        calldata: string,
    ): Promise<{ schedule: TransactionReceipt; execute: TransactionReceipt }> {
        const schedule = await this.scheduleTimelockOp(targetAddr, calldata);
        await sleep((await this.timelockedAdmin.getMinDelay()).toNumber() + 1);
        const execute = await this.executeTimelockOp(targetAddr, calldata);

        return { schedule, execute };
    }

    public async scheduleTimelockOp(
        targetAddr: string,
        calldata: string,
    ): Promise<TransactionReceipt> {
        return executeTx(this.timelockedAdmin, 'schedule', [
            targetAddr,
            0,
            calldata,
            ethers.constants.HashZero, // predecessor
            ethers.constants.HashZero, // salt
            await this.timelockedAdmin.getMinDelay(),
        ]);
    }

    public async executeTimelockOp(
        targetAddr: string,
        calldata: string,
    ): Promise<TransactionReceipt> {
        return executeTx(this.timelockedAdmin, 'execute', [
            targetAddr,
            0,
            calldata,
            ethers.constants.HashZero, // predecessor
            ethers.constants.HashZero, // salt
        ]);
    }

    public logAddress() {
        console.log();
        console.log('======== Contract Addresses ========');
        for (const [k, v] of Object.entries(this)) {
            if (v instanceof Contract) {
                console.log(`${k}: ${v.address}`);
            }
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
