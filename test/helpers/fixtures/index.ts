import { ethers, network } from 'hardhat';
import {
    deployAddressStore,
    deployAllContracts,
    deployAllContractsV1,
    deployFeeVault,
    deployStakePool,
    deployStakedBnbToken,
    deployTimelockedAdmin,
    deployUndelegationHolder,
} from '../../../helpers/deployments';
import {
    DAY_SECONDS,
    STAKE_POOL_CONFIG,
    STAKE_POOL_CONFIG_V2,
    TOKEN_HUB_ADDRESS,
    TOKEN_HUB_ARGS,
} from './../constants';
import {
    AddressStoreDeployment,
    AllContractsDeployment,
    FeeVaultDeployment,
    StakePoolDeployment,
    StakedBNBTokenDeployment,
    TimelockedAdminDeployment,
    UndelegationHolderDeployment,
} from './types';
import { fillAddressStore } from './../../../helpers/setUps/addressStore';
import { stakePoolSetUp } from '../../../helpers/setUps/stakePool';
import { ITokenHub } from '../../../typechain-types';
import {
    deploySystemContract,
    impersonateAddressZero,
    stopImpersonatingAddressZero,
} from '../system-contracts';
import { getTokenHubParameteres } from '../system-contracts/tokenHub';
import { TypedDataDomain } from 'ethers';

export async function deployTokenHubFixture(): Promise<ITokenHub> {
    // Impersonate the address 0 as the deployer
    // to emulate creation at the genesis block.
    // After all, TokenHub is a system contract.
    const addressZeroSigner = await impersonateAddressZero();

    const { tokenHubBytecode, tokenHubInterface, storageSlots } = await getTokenHubParameteres(
        TOKEN_HUB_ARGS,
    );
    const tokenHub: ITokenHub = (await deploySystemContract(
        TOKEN_HUB_ADDRESS,
        tokenHubBytecode,
        tokenHubInterface,
        storageSlots,
    )) as ITokenHub;

    await stopImpersonatingAddressZero();

    return tokenHub.connect(addressZeroSigner);
}

export async function deployAddressStoreFixture(): Promise<AddressStoreDeployment> {
    const [deployer] = await ethers.getSigners();
    const addressStore = await deployAddressStore();
    return {
        addressStore,
        deployer,
    };
}

export async function deployStakedBnbTokenFixture(): Promise<StakedBNBTokenDeployment> {
    const addressStoreDeployment = await deployAddressStoreFixture();
    const { addressStore } = addressStoreDeployment;
    const stakedBNBToken = await deployStakedBnbToken(addressStore.address);
    return {
        ...addressStoreDeployment,
        stakedBNBToken,
    };
}

export async function deployUndelegationHolderFixture(): Promise<UndelegationHolderDeployment> {
    const addressStoreDeployment = await deployAddressStoreFixture();
    const { addressStore } = addressStoreDeployment;
    const undelegationHolder = await deployUndelegationHolder(addressStore.address);
    return {
        ...addressStoreDeployment,
        undelegationHolder,
    };
}

export async function deployFeeVaultFixture(): Promise<FeeVaultDeployment> {
    const addressStoreDeployment = await deployAddressStoreFixture();
    const { addressStore } = addressStoreDeployment;

    const feeVaultProxy = await deployFeeVault(addressStore.address);
    return {
        ...addressStoreDeployment,
        feeVaultProxy,
    };
}

export async function deployStakePoolFixture(): Promise<StakePoolDeployment> {
    const addressStoreDeployment = await deployAddressStoreFixture();
    const { addressStore } = addressStoreDeployment;

    const stakePoolProxy = await deployStakePool(
        addressStore.address,
        STAKE_POOL_CONFIG,
        STAKE_POOL_CONFIG_V2,
    );
    return {
        ...addressStoreDeployment,
        stakePoolConfig: STAKE_POOL_CONFIG,
        stakePoolProxy,
    };
}

export async function deployTimelockedAdminFixture(): Promise<TimelockedAdminDeployment> {
    const [deployer] = await ethers.getSigners();
    const timelockedAdmin = await deployTimelockedAdmin(
        DAY_SECONDS,
        [deployer.address],
        [deployer.address],
    );
    return {
        timelockedAdmin,
        timelockedAdminArgs: {
            minPeriod: DAY_SECONDS,
            proposers: [deployer],
            executors: [deployer],
        },
    };
}

export async function deployProtocolContractsV1Fixture(): Promise<AllContractsDeployment> {
    const [deployer, bot, user] = await ethers.getSigners();
    const proposers = [deployer.address];
    const executors = [deployer.address];
    const contracts = await deployAllContractsV1(
        DAY_SECONDS,
        STAKE_POOL_CONFIG,
        [deployer.address],
        [deployer.address],
    );

    const StakePoolDomain: TypedDataDomain = {
        name: 'Stake Pool',
        version: 'v2',
        chainId: 31337, // 31337 by default for hardhat localhost
        verifyingContract: contracts.stakePool.address.toLowerCase(),
    };

    return {
        contracts,
        stakepoolConfig: STAKE_POOL_CONFIG,
        stakepoolConfigV2: STAKE_POOL_CONFIG_V2,
        timelockedAdminArgs: {
            minDelay: DAY_SECONDS,
            proposers,
            executors,
        },
        accounts: {
            deployer,
            bot,
            user,
        },
        domains: {
            StakePoolDomain,
        },
    };
}

export async function deployProtocolContractsFixture(): Promise<AllContractsDeployment> {
    const [deployer, bot, user] = await ethers.getSigners();
    const proposers = [deployer.address];
    const executors = [deployer.address];
    const contracts = await deployAllContracts(
        DAY_SECONDS,
        STAKE_POOL_CONFIG,
        STAKE_POOL_CONFIG_V2,
        [deployer.address],
        [deployer.address],
    );

    const StakePoolDomain: TypedDataDomain = {
        name: 'Stake Pool',
        version: 'v2',
        chainId: 31337, // 31337 by default for hardhat localhost
        verifyingContract: contracts.stakePool.address.toLowerCase(),
    };

    return {
        contracts,
        stakepoolConfig: STAKE_POOL_CONFIG,
        stakepoolConfigV2: STAKE_POOL_CONFIG_V2,
        timelockedAdminArgs: {
            minDelay: DAY_SECONDS,
            proposers,
            executors,
        },
        accounts: {
            deployer,
            bot,
            user,
        },
        domains: {
            StakePoolDomain,
        },
    };
}

export async function setupProtocolV1Fixture(): Promise<AllContractsDeployment> {
    await deployTokenHubFixture();
    const allContractsDeployment = await deployProtocolContractsV1Fixture();
    const { contracts, accounts } = allContractsDeployment;

    await fillAddressStore(contracts);
    await stakePoolSetUp(contracts.stakePool, accounts.bot.address);

    return allContractsDeployment;
}

export async function setupProtocolFixture(): Promise<AllContractsDeployment> {
    await deployTokenHubFixture();
    const allContractsDeployment = await deployProtocolContractsFixture();
    const { contracts, accounts } = allContractsDeployment;

    await fillAddressStore(contracts);
    await stakePoolSetUp(contracts.stakePool, accounts.bot.address);

    return allContractsDeployment;
}

export async function fundUndelegationHolderV1Fixture(): Promise<AllContractsDeployment> {
    const allContractsDeployment = await setupProtocolV1Fixture();

    const { deployer } = allContractsDeployment.accounts;

    const undelegationHolder = allContractsDeployment.contracts.undelegationHolder;

    await deployer.sendTransaction({
        value: ethers.constants.WeiPerEther,
        to: undelegationHolder.address,
    });

    return allContractsDeployment;
}

export async function fundUndelegationHolderFixture(): Promise<AllContractsDeployment> {
    const allContractsDeployment = await setupProtocolFixture();

    const { deployer } = allContractsDeployment.accounts;

    const undelegationHolder = allContractsDeployment.contracts.undelegationHolder;

    await deployer.sendTransaction({
        value: ethers.constants.WeiPerEther,
        to: undelegationHolder.address,
    });

    return allContractsDeployment;
}

export async function depositBnbV1Fixture(): Promise<AllContractsDeployment> {
    const allContractsDeployment = await fundUndelegationHolderV1Fixture();
    const { stakePool } = allContractsDeployment.contracts;

    const { user } = allContractsDeployment.accounts;

    const stakePoolConnectedUser = stakePool.connect(user);
    await stakePoolConnectedUser.deposit({ value: ethers.constants.WeiPerEther });
    return allContractsDeployment;
}

export async function depositBnbFixture(): Promise<AllContractsDeployment> {
    const allContractsDeployment = await fundUndelegationHolderFixture();
    const { stakePool } = allContractsDeployment.contracts;

    const { user } = allContractsDeployment.accounts;

    const stakePoolConnectedUser = stakePool.connect(user);
    await stakePoolConnectedUser.deposit({ value: ethers.constants.WeiPerEther });
    return allContractsDeployment;
}

export async function createClaimV1Fixture(): Promise<AllContractsDeployment> {
    const allContractsDeployment = await depositBnbV1Fixture();
    const { bot, user } = allContractsDeployment.accounts;
    const stakedBNBTokenConnectedUser =
        allContractsDeployment.contracts.stakedBNBToken.connect(user);
    const { stakePool } = allContractsDeployment.contracts;

    const stkBnbBalance = await stakedBNBTokenConnectedUser.balanceOf(user.address);

    await stakedBNBTokenConnectedUser.send(stakePool.address, stkBnbBalance, []);

    const stakePoolConnectedBot = stakePool.connect(bot);

    await stakePoolConnectedBot.unbondingInitiated(ethers.constants.WeiPerEther);
    await stakePoolConnectedBot.unbondingFinished();

    return allContractsDeployment;
}

export async function createClaimFixture(): Promise<AllContractsDeployment> {
    const allContractsDeployment = await depositBnbFixture();
    const { bot, user } = allContractsDeployment.accounts;
    const stakedBNBTokenConnectedUser =
        allContractsDeployment.contracts.stakedBNBToken.connect(user);
    const { stakePool } = allContractsDeployment.contracts;

    const stkBnbBalance = await stakedBNBTokenConnectedUser.balanceOf(user.address);

    await stakedBNBTokenConnectedUser.send(stakePool.address, stkBnbBalance, []);

    const stakePoolConnectedBot = stakePool.connect(bot);

    await stakePoolConnectedBot.unbondingInitiated(ethers.constants.WeiPerEther);
    await stakePoolConnectedBot.unbondingFinished();

    return allContractsDeployment;
}
