import { StakePool, StakePoolV1 } from "../../typechain-types";

export async function stakePoolSetUp(stakePool: StakePool | StakePoolV1, botAddress: string) {
  await stakePool.grantRole(await stakePool.BOT_ROLE(), botAddress);
  await stakePool.unpause();
}