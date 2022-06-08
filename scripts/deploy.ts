// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, network, web3 } from 'hardhat';

require('@openzeppelin/test-helpers/configure')({ web3 });
const { singletons } = require('@openzeppelin/test-helpers');

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy

    if (network.name.startsWith('local') || network.name.startsWith('hardhat')) {
        await singletons.ERC1820Registry(await (await ethers.getSigners())[0].getAddress());
    }
    const StkBNB = await ethers.getContractFactory('StakedBNBToken');
    const stkbnb = await StkBNB.deploy();

    // await permissions.deployed();
    await stkbnb.deployed();

    console.log('Token contract deployed to:', stkbnb.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
