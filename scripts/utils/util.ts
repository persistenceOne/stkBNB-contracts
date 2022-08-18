import { Wallet } from 'ethers';
import fs from 'fs';

// sleeps for the given number of seconds
export async function sleep(seconds: number) {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

export async function logAndExportWallet(wallet: Wallet, exportKeystore?: boolean) {
    console.log(`Address: ${wallet.address}`);
    console.log(`PrivKey: ${wallet.privateKey}`);
    console.log(`Mnemonic: ${wallet.mnemonic.phrase}`);

    if (exportKeystore) {
        const keystoreContents: string = await wallet.encrypt('');
        const keystoreJSON: any = JSON.parse(keystoreContents);
        const keystoreFileName: string = keystoreJSON['x-ethers'].gethFilename;
        fs.writeFileSync(keystoreFileName, keystoreContents);

        console.log(`Exported keystore file: ${keystoreFileName}`);
        console.log(); // empty new line for nice formatting
        console.log('====================================================');
        console.log(`**NOTE** The exported keystore file has no password.`);
        console.log('====================================================');
    }
}
