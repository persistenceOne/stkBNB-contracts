import { Contracts } from './utils/contracts.ts';
import { CONFIG } from './types/config.ts';
import { executeTx } from './utils/transaction.ts';

async function main() {
    const contracts = await Contracts.attach(CONFIG);
    await executeTx(contracts.stakePool, 'deposit', []);

    // This is your playground. use it to do any sort of testing, but don't commit it.
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
    console.error(error);
    process.exit(1);
});
