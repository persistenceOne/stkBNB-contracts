import { AddressStore, FeeVault, StakePool, StakePoolV1, StakedBNBToken, TimelockedAdmin, UndelegationHolder } from '../typechain-types';
import { BigNumberish } from "ethers";
import { ethers, upgrades } from "hardhat";
import { StakePoolConfig, StakePoolConfigV2 } from '../scripts/types/config';
import { Contracts } from './types';
import { STAKE_POOL_CONFIG_V2 } from '../test/helpers/constants';

export async function deployAddressStore(): Promise<AddressStore> {
  const AddressStore = await ethers.getContractFactory("AddressStore");
  const addressStore = await AddressStore.deploy();
  return addressStore;
}

export async function deployStakedBnbToken(addressStoreAddress: string): Promise<StakedBNBToken> {
  const StakedBNBToken = await ethers.getContractFactory("StakedBNBToken");
  const stakedBNBToken = await StakedBNBToken.deploy(addressStoreAddress);
  return stakedBNBToken;
}

export async function deployUndelegationHolder(addressStoreAddress: string): Promise<UndelegationHolder> {
  const UndelegationHolder = await ethers.getContractFactory("UndelegationHolder");
  const undelegationHolder = await UndelegationHolder.deploy(addressStoreAddress);
  return undelegationHolder;
}

export async function deployTimelockedAdmin(minDelay: BigNumberish, proposers: Array<string>, executors: Array<string>): Promise<TimelockedAdmin> {
  const TimelockedAdmin = await ethers.getContractFactory("TimelockedAdmin");
  const timelockedAdmin = await TimelockedAdmin.deploy(minDelay, proposers, executors);
  return timelockedAdmin;
}

export async function deployFeeVault(addressStoreAddress: string): Promise<FeeVault> {
  const FeeVault = await ethers.getContractFactory("FeeVault");
  const feeVaultProxy = await upgrades.deployProxy(
    FeeVault,
    [addressStoreAddress],
    {
      initializer: "initialize",
      kind: "transparent"
    }) as FeeVault;
  return feeVaultProxy;
}

export async function deployStakePoolV1(addressStoreAddress: string, stakePoolConfig: StakePoolConfig): Promise<StakePoolV1> {
  const StakePoolV1 = await ethers.getContractFactory("StakePoolV1");

  const stakePoolV1Proxy = await upgrades.deployProxy(
    StakePoolV1,
    [addressStoreAddress, stakePoolConfig],
    {
      initializer: "initialize",
      kind: "transparent"
    }
  ) as StakePoolV1;
  return stakePoolV1Proxy;
}

export async function deployStakePool(
  addressStoreAddress: string, 
  stakePoolConfig: StakePoolConfig, 
  stakePoolConfigV2: StakePoolConfigV2
): Promise<StakePool> {
  const stakePool = await deployStakePoolV1(addressStoreAddress, stakePoolConfig);

  return await upgradeStakePoolV2(stakePool.address, stakePoolConfigV2);
}

export async function upgradeStakePoolV2(stakePoolV1address: string, stakePoolConfigV2: StakePoolConfigV2): Promise<StakePool> {
  const StakePool = await ethers.getContractFactory("StakePool");
  const stakePoolProxy = await upgrades.upgradeProxy(
    stakePoolV1address, 
    StakePool, 
    {
      call: {
        fn: "reinitialize",
        args: [stakePoolConfigV2]
      }
    }) as StakePool;
  return stakePoolProxy;
}

export async function deployAllContractsV1(
  minDelay: BigNumberish, 
  stakepoolConfig: StakePoolConfig,
  proposers: Array<string>, 
  executors: Array<string>
  ): Promise<Contracts> {
  const addressStore = await deployAddressStore();
  const feeVault = await deployFeeVault(addressStore.address);
  const stakedBNBToken = await deployStakedBnbToken(addressStore.address);
  const stakePool = await deployStakePoolV1(addressStore.address, stakepoolConfig);
  const timelockedAdmin = await deployTimelockedAdmin(minDelay, proposers, executors);
  const undelegationHolder = await deployUndelegationHolder(addressStore.address);

  return {
    addressStore,
    feeVault,
    stakedBNBToken,
    stakePool,
    timelockedAdmin,
    undelegationHolder
  }
}

export async function deployAllContracts(
  minDelay: BigNumberish, 
  stakepoolConfig: StakePoolConfig, 
  stakepoolConfigV2: StakePoolConfigV2,
  proposers: Array<string>, 
  executors: Array<string>
  ): Promise<Contracts> {
  const addressStore = await deployAddressStore();
  const feeVault = await deployFeeVault(addressStore.address);
  const stakedBNBToken = await deployStakedBnbToken(addressStore.address);
  const stakePool = await deployStakePool(addressStore.address, stakepoolConfig, stakepoolConfigV2);
  const timelockedAdmin = await deployTimelockedAdmin(minDelay, proposers, executors);
  const undelegationHolder = await deployUndelegationHolder(addressStore.address);

  return {
    addressStore,
    feeVault,
    stakedBNBToken,
    stakePool,
    timelockedAdmin,
    undelegationHolder
  }
}
