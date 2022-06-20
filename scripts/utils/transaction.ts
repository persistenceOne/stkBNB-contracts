import { TransactionResponse, TransactionReceipt } from '@ethersproject/abstract-provider';
import { CONFIG } from '../types/config';
import { Contract } from 'ethers';
import { ADDRESS } from './constants';
import { inspect } from 'util';

export async function wait(tx: TransactionResponse): Promise<TransactionReceipt> {
    return tx.wait(CONFIG.numConfirmBlocks);
}

// It executes the tx with given name and args on the contract and waits for the tx to be finalized.
export async function executeTx(
    c: Contract,
    name: string,
    args: any[],
): Promise<TransactionReceipt> {
    console.log(); // empty line for better formatting
    console.log(`------------------------------------------------------`);
    console.log(`${getContractName(c.address)}.${name}(${inspect(args)})`);
    console.log(`\tExecuting ...`);

    const executor: any = c[name];
    if (typeof executor !== 'function') {
        throw new Error(`Transaction with name: ${name} not found in the contract ABI`);
    }
    const receipt = await wait(await executor(...args));

    console.log(`\tExecuted !!!`);
    console.log(`\ttxHash: ${receipt.transactionHash}`);
    console.log(`------------------------------------------------------`);
    console.log(); // empty line for better formatting

    return receipt;
}

export function getContractName(address: string): string {
    switch (address) {
        case '':
            // This case is needed first, as sometimes the config might not have the addresses for any contract.
            // We want to distinguish such cases from actual contract addresses. Otherwise, we might end up
            // reporting the name of an actual contract for an empty address.
            return 'Empty_Contract_Address';
        case CONFIG.addressStore.address:
            return 'AddressStore';
        case CONFIG.stkBNB.address:
            return 'stkBNB';
        case CONFIG.undelegationHolder.address:
            return 'UndelegationHolder';
        case CONFIG.feeVault.address:
            return 'FeeVault';
        case CONFIG.stakePool.address:
            return 'StakePool';
        case ADDRESS.tokenHub:
            return 'TokenHub';
        case ADDRESS.tokenManager:
            return 'TokenManager';
        default:
            return `Unknown_Contract(${address})`;
    }
}
