import { BigNumber } from 'ethers';
import fs from 'fs';
import Ajv from 'ajv-draft-04';
import { getNetwork, isLocalNetwork } from '../utils/network';

interface ContractConfig<T> {
    address: string;
    deploy: boolean;
    init: T;
}

interface UpgradableContractConfig<T> extends ContractConfig<T> {
    upgrade: boolean;
}

interface Fee {
    reward: BigNumber;
    deposit: BigNumber;
    withdraw: BigNumber;
}

export interface StakePoolConfig {
    bcStakingWallet: string;
    minCrossChainTransfer: BigNumber;
    minBNBDeposit: BigNumber;
    minTokenWithdrawal: BigNumber;
    cooldownPeriod: BigNumber;
    fee: Fee;
}

interface StakePoolInit {
    config: StakePoolConfig;
}

export interface IConfig {
    mnemonic: string;
    botAddr: string;
    numConfirmBlocks: number;
    postDeploySetup: boolean;
    gnosisSafeAddr: string;
    addressStore: ContractConfig<null>;
    stkBNB: ContractConfig<null>;
    undelegationHolder: ContractConfig<null>;
    feeVault: UpgradableContractConfig<null>;
    stakePool: UpgradableContractConfig<StakePoolInit>;
}

export class Config implements IConfig {
    mnemonic: string;
    botAddr: string;
    numConfirmBlocks: number;
    postDeploySetup: boolean;
    gnosisSafeAddr: string;
    addressStore: ContractConfig<null>;
    stkBNB: ContractConfig<null>;
    undelegationHolder: ContractConfig<null>;
    feeVault: UpgradableContractConfig<null>;
    stakePool: UpgradableContractConfig<StakePoolInit>;

    constructor(config: IConfig) {
        this.mnemonic = config.mnemonic;
        this.botAddr = config.botAddr;
        this.numConfirmBlocks = config.numConfirmBlocks;
        this.postDeploySetup = config.postDeploySetup;
        this.gnosisSafeAddr = config.gnosisSafeAddr;
        this.addressStore = config.addressStore;
        this.stkBNB = config.stkBNB;
        this.undelegationHolder = config.undelegationHolder;
        this.feeVault = config.feeVault;
        this.stakePool = config.stakePool;
    }

    public static load(): Config {
        const network = getNetwork();
        console.log(`Detected network: ${process.env.NETWORK_PATH}`);
        let envJsonPath: string;
        // find the correct path of the .env file to load
        if (isLocalNetwork(network)) {
            // load .env.json if no network, or a local/hardhat network is given.
            envJsonPath = './.env.json';
        } else {
            // load .env.<network>.json for associated network.
            envJsonPath = './.env.' + network + '.json';
        }
        console.log(`Using config file: ${envJsonPath}`);
        return Config.read(envJsonPath);
    }

    private static read(envJsonPath: string): Config {
        const envJson = JSON.parse(fs.readFileSync(envJsonPath).toString());
        const err = this.validate(envJson);
        if (err !== undefined) {
            throw err;
        }

        return new Config(envJson as IConfig);
    }

    private static validate(envJson: any): Error | undefined {
        const schema = JSON.parse(fs.readFileSync('env-schema.json').toString());
        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        if (!validate(envJson)) {
            const errMsg: string =
                validate.errors
                    ?.map<string>(v => {
                        return `${v.instancePath}: ${v.keyword}: ${v.message}`;
                    })
                    .reduce((prev, curr, i) => {
                        return `${prev}\n${curr}`;
                    }) || 'Unknown error';
            return { name: 'Config Validation Error', message: errMsg };
        }
    }
}

export const CONFIG: Config = Config.load();
