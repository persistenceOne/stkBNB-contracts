import { task } from 'hardhat/config';
import '@nomiclabs/hardhat-web3';
import '@nomiclabs/hardhat-ethers';
import '@nomicfoundation/hardhat-verify';
import '@nomicfoundation/hardhat-chai-matchers';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-contract-sizer';
import 'hardhat-gas-reporter';
import { HardhatNetworkHDAccountsConfig } from 'hardhat/src/types/config.ts';
import { CONFIG } from './scripts/types/config.ts';
import 'hardhat-forta'; // forta
import { ethers } from 'ethers';
import { string } from 'hardhat/internal/core/params/argumentTypes';

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// This generates a random new keypair. One can generate key-pairs this way for testing purposes.
task('gen-keypair', 'Generates a new keypair', async (taskArgs, hre) => {
    const wallet = ethers.Wallet.createRandom();
    console.log(`Address: ${wallet.address}`);
    console.log(`PrivKey: ${wallet.privateKey}`);
    console.log(`Mnemonic: ${wallet.mnemonic.phrase}`);
});

task(
    'sign',
    'Signs the given msg using the default signer for the network',
    async (taskArgs: { msg: string }, hre) => {
        const signer = (await hre.ethers.getSigners())[0];
        const sig = await signer.signMessage(taskArgs.msg);
        console.log(`signer: ${signer.address}`);
        console.log(`signature: ${sig}`);
    },
).addParam('msg', 'the msg to sign', undefined, string, false);

// See:
// * https://forum.openzeppelin.com/t/how-to-verify-a-contract-on-etherscan-bscscan-polygonscan/14225
// * https://docs.openzeppelin.com/upgrades-plugins/1.x/api-hardhat-upgrades#verify
// * https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan#using-programmatically
task('verify-all', 'Verifies all contracts on Etherscan', async (taskArgs, hre) => {
    // AddressStore
    await hre.run('verify:verify', {
        address: CONFIG.addressStore.address,
        constructorArguments: [],
    });

    // TimelockedAdmin
    await hre.run('verify:verify', {
        address: CONFIG.timelockedAdmin.address,
        constructorArguments: [
            CONFIG.timelockedAdmin.init.minDelay,
            [],
            [ethers.constants.AddressZero],
        ],
        contract: 'contracts/TimelockedAdmin.sol:TimelockedAdmin',
    });

    // stkBNB
    await hre.run('verify:verify', {
        address: CONFIG.stkBNB.address,
        constructorArguments: [CONFIG.addressStore.address],
    });

    // proxy contracts: no constructor args here, they have initializers. Also,
    // can't use `verify:verify` as suggested in Etherscan plugin doc for programmatic verification,
    // as the openzeppelin upgrades plugin overrides only the `verify` task for proxies.
    // yarn hardhat verify --network <NETWORK> PROXY_CONTRACT_ADDR
    await hre.run('verify:verify', {
        address: CONFIG.delegationManager.address, // delegationManager
    });
    await hre.run('verify:verify', { address: CONFIG.feeVault.address }); // FeeVault
    await hre.run('verify:verify', { address: CONFIG.stakePool.address }); // StakePool
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
    gasReporter: {
        enabled: true,
        curreny: 'USD',
        L1: 'binance',
        coinmarketcap: '3fc0ac89-5b7a-4728-8ec4-49cd96443360',
        gasPrice: 1,
    },
    contractSizer: {
        alphaSort: false,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: true,
    },
    solidity: {
        version: '0.8.7',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    defaultNetwork: 'hardhat',
    networks: {
        // hardhat: {
        //     forking: {
        //         url: CONFIG.rpcURL,
        //     },
        //     chains: {
        //         97: {
        //             hardforkHistory: {
        //                 london: 35682300,
        //             },
        //         },
        //     },
        //     blockGasLimit: 50000000,
        // },
        hardhat: {
            forking: {
                url: CONFIG.rpcURL,
                blockNumber: 38144135,
            },
            chains: {
                56: {
                    hardforkHistory: {
                        london: 12965000,
                    },
                },
            },
            blockGasLimit: 50000000,
        },
        // This is the network created by `hardhat node`.
        localhost: {
            url: 'http://127.0.0.1:8545',
            blockGasLimit: 40000000,
            // accounts: { mnemonic: CONFIG.mnemonic } as HardhatNetworkHDAccountsConfig,
        },
        testnet: {
            // url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
            // https://rpc.ankr.com/bsc_testnet_chapel
            url: CONFIG.rpcURL,
            chainId: 97,
            gasPrice: 20000000000, // 20 Gwei
            blockGasLimit: 40000000,
            accounts: { mnemonic: CONFIG.mnemonic } as HardhatNetworkHDAccountsConfig,
        },
        mainnet: {
            // https://bsc-dataseed.binance.org/
            url: CONFIG.rpcURL,
            chainId: 56,
            gasPrice: 1000000000, // 1 Gwei
            blockGasLimit: 40000000,
            accounts: { mnemonic: CONFIG.mnemonic } as HardhatNetworkHDAccountsConfig,
        },
    },
    etherscan: {
        enabled: true,
        apiKey: { bscTestnet: CONFIG.etherscanApiKey, bsc: CONFIG.etherscanApiKey },
    },
    sourcify: {
        enabled: false,
    },
};
