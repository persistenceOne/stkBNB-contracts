import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { getStorageSlots, removeContractDeployment } from ".";

/**
 * Use human-readable format for miniRelayFee value.
 * For instance 0.1 is 10% of a whole ETH (18 decimals).
 */
export type TokenHubArgs = {
  miniRelayFee: string,
  transferOutTimeout: number
}

export async function getTokenHubParameteres(tokenHubArgs: TokenHubArgs) {
  const TokenHub = await ethers.getContractFactory("TokenHubMock");

  // Deploy the mocked TokenHub contract so we can get the bytecode 
  // deployed with adequate constructor args.
  const tokenHubDeployed = await TokenHub.deploy(
    ethers.utils.parseEther(tokenHubArgs.miniRelayFee), 
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