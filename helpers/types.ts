import { AddressStore, FeeVault, StakePool, StakedBNBToken, TimelockedAdmin, UndelegationHolder } from "../typechain-types"

export type Contracts = {
  addressStore: AddressStore,
  feeVault: FeeVault,
  stakedBNBToken: StakedBNBToken,
  stakePool: StakePool,
  timelockedAdmin: TimelockedAdmin,
  undelegationHolder: UndelegationHolder
}