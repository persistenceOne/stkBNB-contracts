import { Finding, FindingSeverity, FindingType, LogDescription } from "forta-agent";
import { BigNumber } from "ethers";

export const createFinding = (log: LogDescription, token0: string, token1: string, totalSupply: BigNumber): Finding => {
  const metadata = {
    poolAddress: log.address,
    token0: token0,
    token1: token1,
    amount0: log.args.amount0.toString(),
    amount1: log.args.amount1.toString(),
    totalSupply: totalSupply.toString(),
  };

  if (log.name === "Mint") {
    return Finding.fromObject({
      name: "Large LP Deposit in stkBNB-BNB Pancakeswap pool",
      description: `${log.name} event with large amounts emitted from stkBNB-BNB Pancakeswap pool`,
      alertId: "pSTAKE-stkBNB-PCS-SUBSTANTIAL-Deposit",
      severity: FindingSeverity.Info,
      type: FindingType.Info,
      protocol: "stkBNB",
      metadata,
    });
  } else
    return Finding.fromObject({
      name: "Large LP Withdrawal from stkBNB-BNB Pancakeswap pool",
      description: `${log.name} event with large amount emitted from stkBNB-BNB Pancakeswap pool`,
      alertId: "pSTAKE-stkBNB-PCS-SUBSTANTIAL-Withdrawal",
      severity: FindingSeverity.Info,
      type: FindingType.Info,
      protocol: "stkBNB",
      metadata,
    });
};
