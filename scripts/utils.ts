import { Contract, ContractFactory } from 'ethers';
import { ethers } from 'hardhat';

export async function deployContract(name: string): Promise<Contract> {
    const factory: ContractFactory = await ethers.getContractFactory(name);
    const contract: Contract = await factory.deploy();
    await contract.deployed();

    return contract;
}
