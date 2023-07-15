import { CONFIG } from './types/config';
import { ethers } from 'hardhat';
import { Provider } from '@ethersproject/providers';

async function main() {
    console.log("Executing V2 StakePool unpause");
    console.log(CONFIG.mnemonic);
    const [deployer] = await ethers.getSigners();
    console.log("deployer address", await deployer.getAddress());
    console.log("deployer balance", await deployer.getBalance());
    const provider = deployer.provider as Provider;
    console.log("network", await provider.getNetwork());
    const stakePool = await ethers.getContractAt("StakePool", CONFIG.stakePool.address);
    const tx = await stakePool.unpause();
    const txReceipt = await tx.wait();
    console.log(txReceipt.transactionHash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
    console.error(error);
    process.exit(1);
});
