import { ethers } from 'hardhat';

export async function logDeployerInfo(): Promise<string> {
    const deployerAddr: string = await getDeployerAddr();
    console.log('=== Deployer Info ===');
    console.log('Address: ', deployerAddr);
    console.log(
        'Balance: ',
        ethers.utils.formatEther(await ethers.provider.getBalance(deployerAddr)),
    );
    console.log('=== Deployer Info ===');
    console.log('\n\n');

    return deployerAddr;
}

export async function getDeployerAddr(): Promise<string> {
    return (await ethers.getSigners())[0].getAddress();
}
