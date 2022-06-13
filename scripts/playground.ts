import { Contracts } from './utils/contracts';
import { CONFIG } from './types/config';

async function main() {
    /* const contracts = */ await Contracts.attach(CONFIG);

    // This is your playground. use it to do any sort of testing, but don't commit it.
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
    console.error(error);
    process.exit(1);
});
