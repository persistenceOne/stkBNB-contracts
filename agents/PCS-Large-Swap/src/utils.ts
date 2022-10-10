import { ethers, Finding, FindingType, FindingSeverity } from "forta-agent";
import { BigNumber } from "ethers";
import { getCreate2Address } from "@ethersproject/address";

const getPancakePairCreate2Address = (
  pancakeFactoryAddr: string,
  token0: string,
  token1: string,
  initCode: string
): string => {
  const salt = ethers.utils.solidityKeccak256(["address", "address"], [token0, token1]);
  return getCreate2Address(pancakeFactoryAddr, salt, initCode);
};

const createFinding = (
  swapTokenIn: string,
  swapTokenOut: string,
  swapAmountIn: BigNumber,
  swapAmountOut: BigNumber,
  percentageTokenIn: BigNumber,
  percentageTokenOut: BigNumber,
  swap_recipient: string
): Finding => {
  return Finding.from({
    name: "Large Swap in stkBNB-BNB Pancakeswap pool",
    description:  `${ethers.utils.formatEther(swapAmountIn.toString())} ${swapTokenIn} swapped for ${ethers.utils.formatEther(
      swapAmountOut.toString()
    )} ${swapTokenOut}`,
    alertId: "pSTAKE-stkBNB-PCS-SUBSTANTIAL-Pool-Swap",
    protocol: "stkBNB",
    type: FindingType.Info,
    severity: FindingSeverity.Info,
    metadata: {
      amountIn: swapAmountIn.toString(),
      amountOut: swapAmountOut.toString(),
      percentageIn: percentageTokenIn.toString(),
      percentageOut: percentageTokenOut.toString(),
      swapRecipient: swap_recipient,
    },
  });
};

export { createFinding, getPancakePairCreate2Address };
