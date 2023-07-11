import { BigNumber } from "ethers";
import { StakePoolConfig, StakePoolConfigV2 } from "../../scripts/types/config";
import { TokenHubArgs } from "./system-contracts/tokenHub";

export const DAY_SECONDS = 86400; // One day

export const STAKE_POOL_CONFIG: StakePoolConfig = {
  bcStakingWallet: "0xE808c4F0562dC0826E62Aa991F8c188c10Afe6F0",
  minCrossChainTransfer: BigNumber.from("1100000000000000000"),
  transferOutTimeout: BigNumber.from("3600"),
  minBNBDeposit: BigNumber.from("1000000000000"),
  minTokenWithdrawal: BigNumber.from("1000000000000"),
  cooldownPeriod: BigNumber.from("1296000"),
  fee: {
    reward: BigNumber.from("2000000000"),
    deposit: BigNumber.from("0"),
    withdraw: BigNumber.from("0")
  }
};

export const STAKE_POOL_CONFIG_V2: StakePoolConfigV2 = {
  automatedClaimFee: BigNumber.from("500000000000000"), // 0.0005 ETH
  instantClaimFeePercentage: BigNumber.from("1"),
}

export const TOKEN_HUB_ADDRESS = "0x0000000000000000000000000000000000001004";

export const TOKEN_HUB_ARGS: TokenHubArgs = {
  miniRelayFee: "0.004",
  transferOutTimeout: 120
}