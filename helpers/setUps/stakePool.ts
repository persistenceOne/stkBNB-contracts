import { StakePool } from "../../typechain-types";

export async function stakePoolSetUp(stakePool: StakePool, botAddress: string) {
  await stakePool.grantRole(await stakePool.BOT_ROLE(), botAddress);
  await stakePool.unpause();
}