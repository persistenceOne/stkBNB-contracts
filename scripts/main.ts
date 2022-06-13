// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { Contracts } from './utils/contracts';
import { CONFIG } from './types/config';

async function main() {
    console.log(`Executing task: ${process.env.TASK}`);
    switch (process.env.TASK) {
        case 'deploy':
            await Contracts.deploy(CONFIG);
            break;
        case 'upgrade':
            await Contracts.upgrade(CONFIG);
            break;
        case 'query':
            await Contracts.query(CONFIG);
            break;
        case 'useGnosis':
            await Contracts.transferOwnershipToGnosis(CONFIG);
            break;
        case 'stakePool:updateConfig':
            await Contracts.updateStakePoolConfig(CONFIG);
            break;
        default:
            throw new Error(`Unknown task: ${process.env.TASK}`);
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
    console.error(error);
    process.exit(1);
});
