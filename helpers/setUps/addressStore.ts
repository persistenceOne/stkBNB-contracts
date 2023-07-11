import { Contracts } from "../../helpers/types";
import { AddressStore } from "../../typechain-types";

export type StoredAddresses = {
  feeVault: string,
  stakedBNBToken: string,
  stakePool: string,
  timelockedAdmin: string,
  undelegationHolder: string
}

export function getStorableContractAddresses(contracts: Contracts): StoredAddresses {
  return {
    feeVault: contracts.feeVault.address,
    stakedBNBToken: contracts.stakedBNBToken.address,
    stakePool: contracts.stakePool.address,
    timelockedAdmin: contracts.timelockedAdmin.address,
    undelegationHolder: contracts.undelegationHolder.address
  }
}

export async function fillAddressStore(contracts: Contracts) {
  const storableAddresses = getStorableContractAddresses(contracts);
  await storeAddresses(contracts.addressStore, storableAddresses);
}

export async function storeAddresses(addressStore: AddressStore, storedAddresses: StoredAddresses) {
  await addressStore.setFeeVault(storedAddresses.feeVault);
  await addressStore.setStakePool(storedAddresses.stakePool);
  await addressStore.setStkBNB(storedAddresses.stakedBNBToken);
  await addressStore.setTimelockedAdmin(storedAddresses.timelockedAdmin);
  await addressStore.setUndelegationHolder(storedAddresses.undelegationHolder);
}
