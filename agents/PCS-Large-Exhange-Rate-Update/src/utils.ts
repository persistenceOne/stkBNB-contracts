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

const createFinding = (exchangerateOld: Number, exchangerateNew: Number, percentChange: Number): Finding => {
  return Finding.from({
    name: "Large exchangeRate change",
    description: `Old exchange rate ${ethers.utils.formatEther(
      exchangerateOld.toString()
    )} & New exchange rate ${ethers.utils.formatEther(
      exchangerateNew.toString()
    )} : Percent Change ${ethers.utils.formatEther(percentChange.toString())} `,
    alertId: "pSTAKE-stkBNB-PCS-SUBSTANTIAL-ExchangeRate-Update",
    protocol: "stkBNB",
    type: FindingType.Info,
    severity: FindingSeverity.Info,
    metadata: {
      exchangerateOld: exchangerateOld.toString(),
      exchangerateNew: exchangerateNew.toString(),
    },
  });
};

export { createFinding, getPancakePairCreate2Address };
