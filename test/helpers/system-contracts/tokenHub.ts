import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { getStorageSlots, removeContractDeployment } from ".";

export type TokenHubArgs = {
  minRelayFee: string,
  transferOutTimeout: number
}

export async function getTokenHubParameteres(tokenHubArgs: TokenHubArgs) {
  const TokenHub = await ethers.getContractFactory("TokenHubMock");

  // Deploy the mocked TokenHub contract so we can get the bytecode 
  // deployed with adequate constructor args.
  const tokenHubDeployed = await TokenHub.deploy(
    ethers.utils.parseEther(tokenHubArgs.minRelayFee), 
    BigNumber.from(tokenHubArgs.transferOutTimeout)
  );

  const tokenHubBytecode = await ethers.provider.getCode(tokenHubDeployed.address);

  const tokenHubStorageSlots = 2; // There are only 2 storage slots used for the contract, since they are both uint256

  const storageSlots = await getStorageSlots(tokenHubDeployed.address, tokenHubStorageSlots); 

  // Remove the TokenHub deployment
  await removeContractDeployment(tokenHubDeployed.address, tokenHubStorageSlots);

  return {
    tokenHubBytecode,
    tokenHubInterface: TokenHub.interface,
    storageSlots
  };
}