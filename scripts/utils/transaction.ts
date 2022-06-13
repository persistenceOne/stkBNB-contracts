import { TransactionResponse, TransactionReceipt } from '@ethersproject/abstract-provider';
import { CONFIG } from '../types/config';
import { Contract } from 'ethers';

export async function wait(tx: TransactionResponse): Promise<TransactionReceipt> {
    return tx.wait(CONFIG.numConfirmBlocks);
}

// It executes the tx with given name and args on the contract and waits for the tx to be finalized.
export async function executeTx(
    c: Contract,
    name: string,
    args: any[],
): Promise<TransactionReceipt> {
    const executor: any = c[name];
    if (typeof executor !== 'function') {
        throw new Error(`Transaction with name: ${name} not found in the contract ABI`);
    }
    return wait(await executor(...args));
}
