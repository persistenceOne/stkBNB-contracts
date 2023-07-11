import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractInterface } from "ethers";
import { ethers, network } from "hardhat";
import { removeLeadingZeros } from "../utils";

const STORAGE_SLOT_VALUE_ZERO = "0x0000000000000000000000000000000000000000000000000000000000000000"; // 32 bytes long

/**
 * Impersonate address zero as a signer and sets it's balance to 10k ETH. 
 * Needs ETH to deploy contracts.
 * Don't forget to call `stopImpersonatingAddressZero` afterwards!
 * NOTE: It has side-effects. Sets the default signer to address zero.
 * @returns An address zero signer.
 */
export async function impersonateAddressZero(): Promise<SignerWithAddress> {
  await network.provider.send("hardhat_setBalance", [
    ethers.constants.AddressZero,
    "0x21e19e0c9bab2400000" // 10k ETH
  ]);

  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [ethers.constants.AddressZero],
  });

  return await ethers.getSigner(ethers.constants.AddressZero);
}

export async function stopImpersonatingAddressZero() {
  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [ethers.constants.AddressZero],
  });
}

/**
 * Removes the deployment of a contract.
 * @param address 
 * @param storageSlotsNumber 
 */
export async function removeContractDeployment(address: string, storageSlotsNumber: number) {
  await network.provider.send("hardhat_setCode", [
    address,
    "0x"
  ]);

  const promises = [];

  for (let i = 0; i < storageSlotsNumber; ++i) {
    const hexNumber = `0x${i.toString(16)}`;
    const promise = network.provider.send("hardhat_setStorageAt", [
      address,
      removeLeadingZeros(hexNumber),
      STORAGE_SLOT_VALUE_ZERO
    ]);
    promises.push(promise);
  }

  await Promise.all(promises);
}

/**
 * Returnes the storage slot values.
 * @param address 
 * @param storageSlotsNumber 
 * @returns 
 */
export async function getStorageSlots(address: string, storageSlotsNumber: number): Promise<Array<string>> {
  const storageSlots = [];

  for (let i = 0; i < storageSlotsNumber; ++i) {
    storageSlots.push(await ethers.provider.getStorageAt(address, i));
  }

  return storageSlots;
}

/**
 * Deploys a system contract. 
 * @param address Where do you want the contract to be.
 * @param bytecode What bytecode do you want contract to have.
 * @param abi 
 * @param storageSlots How populate the storage slots.
 * @returns The contract instance without a signer connected.
 */
export async function deploySystemContract(
  address: string, 
  bytecode: string, 
  abi: ContractInterface, 
  storageSlots: Array<string>
  ): Promise<Contract> {
  await network.provider.send("hardhat_setCode", [
    address,
    bytecode
  ]);

  const promises = [];

  for (let i = 0; i < storageSlots.length; ++i) {
    const hexNumber = `0x${i.toString(16)}`;
    const promise = network.provider.send("hardhat_setStorageAt", [
      address,
      removeLeadingZeros(hexNumber),
      storageSlots[i],
    ]);
    promises.push(promise);
  }

  await Promise.all(promises);

  return new Contract(address, abi);
}