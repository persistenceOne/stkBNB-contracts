import { Contracts } from '../scripts/utils/contracts';
import {
    Config,
    ContractConfig,
    Fee,
    IConfig,
    StakePoolConfig,
    StakePoolInit,
    TimelockedAdminConfig,
    UpgradableContractConfig,
} from '../scripts/types/config';
import { BigNumber, ethers } from 'ethers';
import { executeTx } from '../scripts/utils/transaction';
import { getDeployerAddr } from '../scripts/utils/deployer';
import { expect } from 'chai';

const timelockDelay = BigNumber.from(30); // 30 seconds
const mockAddr = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const mockDeployableNonUpgradableContract = { deploy: true } as ContractConfig<null>;
const mockDeployableUpgradableContract = { deploy: true } as UpgradableContractConfig<null>;
const mockTimelockedAdminConfig = {
    deploy: true,
    init: { minDelay: timelockDelay } as TimelockedAdminConfig,
} as ContractConfig<TimelockedAdminConfig>;
const mockStakePoolContractConfig = {
    deploy: true,
    init: {
        config: {
            bcStakingWallet: mockAddr,
            minCrossChainTransfer: BigNumber.from(1),
            minBNBDeposit: ethers.constants.WeiPerEther,
            minTokenWithdrawal: ethers.constants.WeiPerEther,
            cooldownPeriod: BigNumber.from(0),
            fee: {
                reward: BigNumber.from(0),
                deposit: BigNumber.from(0),
                withdraw: BigNumber.from(0),
            } as Fee,
        } as StakePoolConfig,
    } as StakePoolInit,
} as UpgradableContractConfig<StakePoolInit>;

const mockDeployConfig = {
    mnemonic: '',
    botAddr: mockAddr,
    numConfirmBlocks: 1,
    postDeploySetup: true,
    gnosisSafeAddr: { primary: mockAddr, secondary: mockAddr },
    addressStore: mockDeployableNonUpgradableContract,
    timelockedAdmin: mockTimelockedAdminConfig,
    stkBNB: mockDeployableNonUpgradableContract,
    undelegationHolder: mockDeployableNonUpgradableContract,
    feeVault: mockDeployableUpgradableContract,
    stakePool: mockStakePoolContractConfig,
} as IConfig;

describe('System Scripts', function () {
    let contracts: Contracts, deployerAddr: string;

    it('deploy', async function () {
        contracts = await Contracts.deploy(new Config(mockDeployConfig));
        deployerAddr = await getDeployerAddr();

        // used in later tests to propose things to timelock controller
        await executeTx(contracts.timelockedAdmin, 'grantRole', [
            await contracts.timelockedAdmin.PROPOSER_ROLE(),
            deployerAddr,
        ]);
    });

    let conf: IConfig;
    it('transferOwnershipToGnosis', async function () {
        conf = JSON.parse(JSON.stringify(mockDeployConfig)) as IConfig;
        conf.addressStore.address = contracts.addressStore.address;
        conf.timelockedAdmin.address = contracts.timelockedAdmin.address;
        conf.stkBNB.address = contracts.stakedBNBToken.address;
        conf.undelegationHolder.address = contracts.undelegationHolder.address;
        conf.feeVault.address = contracts.feeVault.address;
        conf.stakePool.address = contracts.stakePool.address;

        await Contracts.transferOwnershipToGnosis(conf);
    });

    it('should propose and execute via timelock', async function () {
        const calldata = contracts.addressStore.interface.encodeFunctionData('setAddr', [
            'mockKey',
            mockAddr,
        ]);

        // schedule a timelocked operation on a contract
        await executeTx(contracts.timelockedAdmin, 'schedule', [
            contracts.addressStore.address,
            0,
            calldata,
            ethers.constants.HashZero,
            ethers.constants.HashZero,
            timelockDelay,
        ]);

        // executing it before delay will result in failure
        await expect(
            executeTx(contracts.timelockedAdmin, 'execute', [
                contracts.addressStore.address,
                0,
                calldata,
                ethers.constants.HashZero,
                ethers.constants.HashZero,
            ]),
        ).to.be.revertedWith('TimelockController: operation is not ready');

        // we can verify that the address store wasn't updated
        expect(await contracts.addressStore.getAddr('mockKey')).to.equal(
            ethers.constants.AddressZero,
        );

        // wait for the timelock delay to pass
        await new Promise(resolve => setTimeout(resolve, (timelockDelay.toNumber() + 1) * 1000));

        // this time it should execute
        await executeTx(contracts.timelockedAdmin, 'execute', [
            contracts.addressStore.address,
            0,
            calldata,
            ethers.constants.HashZero,
            ethers.constants.HashZero,
        ]);

        // we can verify the same by querying the address store
        expect(await contracts.addressStore.getAddr('mockKey')).to.equal(mockAddr);
    }).timeout((timelockDelay.toNumber() + 5) * 1000);

    it('upgrade', async function () {
        const upgradeConf = JSON.parse(JSON.stringify(conf)) as IConfig;
        upgradeConf.stakePool.upgrade = true;
        upgradeConf.feeVault.upgrade = true;

        contracts = await Contracts.upgrade(upgradeConf);
    });
});
