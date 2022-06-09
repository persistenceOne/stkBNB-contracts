// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, network, upgrades, web3 } from 'hardhat';

require('@openzeppelin/test-helpers/configure')({ web3 });
const { singletons } = require('@openzeppelin/test-helpers');

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // deploy ERC1820 registry for local networks
    if (network.name.startsWith('local') || network.name.startsWith('hardhat')) {
        await singletons.ERC1820Registry(await (await ethers.getSigners())[0].getAddress());
    }

    // deploy AddressStore
    const addressStoreFactory = await ethers.getContractFactory('AddressStore');
    const addressStore = await addressStoreFactory.deploy();
    await addressStore.deployed();
    console.log('AddressStore deployed to:', addressStore.address);

    // deploy FeeVault
    const feeVaultFactory = await ethers.getContractFactory('FeeVault');
    const feeVault = await upgrades.deployProxy(feeVaultFactory, [addressStore.address]);
    await feeVault.deployed();
    console.log('feeVault deployed to:', feeVault.address);

    // deploy stkBNB
    const stkBNBTokenFactory = await ethers.getContractFactory('StakedBNBToken');
    const stkBNB = await stkBNBTokenFactory.deploy();
    await stkBNB.deployed();
    console.log('stkBNB deployed to:', stkBNB.address);

    // deploy UndelegationHolder
    const undelegationHolderFactory = await ethers.getContractFactory('UndelegationHolder');
    const undelegationHolder = await undelegationHolderFactory.deploy(addressStore.address);
    await undelegationHolder.deployed();
    console.log('UndelegationHolder deployed to:', undelegationHolder.address);

    // deploy FeeVault
    const stakePoolFactory = await ethers.getContractFactory('StakePool');
    const stakePool = await upgrades.deployProxy(stakePoolFactory, [
        addressStore.address,
        {
            bcStakingWallet: '0x0000000000000000000000000000000000000000',
            minBNBDeposit: 1e12,
            minTokenWithdrawal: 1e12,
            cooldownPeriod: 86400,
            fee: {
                reward: 2000000000,
                deposit: 0,
                withdraw: 0,
            },
        },
    ]);
    await stakePool.deployed();
    console.log('stakePool deployed to:', stakePool.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
