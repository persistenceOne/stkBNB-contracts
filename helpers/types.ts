import { AddressStore, FeeVault, StakePool, StakePoolV1, StakedBNBToken, TimelockedAdmin, UndelegationHolder } from "../typechain-types"

export type Contracts = {
  addressStore: AddressStore,
  feeVault: FeeVault,
  stakedBNBToken: StakedBNBToken,
  stakePool: StakePool | StakePoolV1,
  timelockedAdmin: TimelockedAdmin,
  undelegationHolder: UndelegationHolder
}