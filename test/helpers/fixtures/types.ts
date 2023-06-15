import { BigNumberish, TypedDataDomain } from "ethers";
import { Contracts } from "../../../helpers/types";
import { StakePoolConfig, StakePoolConfigV2 } from "../../../scripts/types/config";
import { AddressStore, FeeVault, StakePool, StakedBNBToken, TimelockedAdmin, UndelegationHolder } from "../../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export type Fixture<T> = () => Promise<T>;

export type AddressStoreDeployment = {
  addressStore: AddressStore,
  deployer: SignerWithAddress
}

export type StakedBNBTokenDeployment = {
  stakedBNBToken: StakedBNBToken
} & AddressStoreDeployment;

export type UndelegationHolderDeployment = {
  undelegationHolder: UndelegationHolder
} & AddressStoreDeployment;

export type TimelockedAdminArgs = {
  minPeriod: Number,
  proposers: Array<SignerWithAddress>,
  executors: Array<SignerWithAddress>
}

export type TimelockedAdminDeployment = {
  timelockedAdminArgs: TimelockedAdminArgs
  timelockedAdmin: TimelockedAdmin,
}

export type FeeVaultDeployment = {
  feeVaultProxy: FeeVault
} & AddressStoreDeployment;

export type StakePoolDeployment = {
  stakePoolProxy: StakePool,
  stakePoolConfig: StakePoolConfig
} & AddressStoreDeployment;

export type AllContractsDeployment = {
  contracts: Contracts,
  stakepoolConfig: StakePoolConfig,
  stakepoolConfigV2: StakePoolConfigV2,
  timelockedAdminArgs: {
    minDelay: BigNumberish,
    proposers: Array<string>,
    executors: Array<string>
  },
  accounts: {
    deployer: SignerWithAddress,
    bot: SignerWithAddress,
    user: SignerWithAddress
  },
  domains: {
    StakePoolDomain: TypedDataDomain
  }
}