import { Finding, FindingSeverity, FindingType, LogDescription } from "forta-agent";
import { BigNumber } from "ethers";
import { ethers } from "forta-agent";

export const createFinding = (log: LogDescription, token0: string, token1: string, totalSupply: BigNumber): Finding => {
  const metadata = {
    amount0: ethers.utils.formatEther(log.args.amount0.toString()),
    amount1: ethers.utils.formatEther(log.args.amount1.toString()),
    totalSupply: ethers.utils.formatEther(totalSupply.toString()),
  };

  if (log.name === "Mint") {
    return Finding.fromObject({
      name: "Large LP Deposit in stkBNB-BNB Pancakeswap pool",
      description: `${ethers.utils.formatEther(log.args.amount0.toString())} BNB & ${ethers.utils.formatEther(log.args.amount1.toString())} stkBNB deposited into stkBNB-BNB Pancakeswap pool`,
      alertId: "pSTAKE-stkBNB-PCS-SUBSTANTIAL-Pool-Deposit",
      severity: FindingSeverity.Info,
      type: FindingType.Info,
      protocol: "stkBNB",
      metadata,
    });
  } else
    return Finding.fromObject({
      name: "Large LP Withdrawal from stkBNB-BNB Pancakeswap pool",
      description: `${ethers.utils.formatEther(log.args.amount0.toString())} BNB & ${ethers.utils.formatEther(log.args.amount1.toString())} stkBNB withdrawn from stkBNB-BNB Pancakeswap pool`,
      alertId: "pSTAKE-stkBNB-PCS-SUBSTANTIAL-Pool-Withdrawal",
      severity: FindingSeverity.Info,
      type: FindingType.Info,
      protocol: "stkBNB",
      metadata,
    });
};
