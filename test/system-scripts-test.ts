import { expect } from 'chai';
import { BigNumber, ethers } from 'ethers';
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
import { executeTx } from '../scripts/utils/transaction';
import { getDeployerAddr } from '../scripts/utils/deployer';
import { sleep } from '../scripts/utils/util';

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
            minCrossChainTransfer: ethers.constants.One,
            transferOutTimeout: ethers.constants.One,
            minBNBDeposit: ethers.constants.Zero,
            minTokenWithdrawal: ethers.constants.Zero,
            cooldownPeriod: ethers.constants.Zero,
            fee: {
                reward: ethers.constants.Zero,
                deposit: ethers.constants.Zero,
                withdraw: ethers.constants.Zero,
            } as Fee,
        } as StakePoolConfig,
    } as StakePoolInit,
} as UpgradableContractConfig<StakePoolInit>;

const mockDeployConfig = {
    mnemonic: '',
    etherscanApiKey: '',
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

    // TODO: keep only script tests in this file, move the below two tests somewhere else
    it('should update AddressStore via timelock', async function () {
        const calldata = contracts.addressStore.interface.encodeFunctionData('setAddr', [
            'mockKey',
            mockAddr,
        ]);

        // schedule a timelocked operation on a contract
        await contracts.scheduleTimelockOp(contracts.addressStore.address, calldata);

        // executing it before delay will result in failure
        await expect(
            contracts.executeTmielockOp(contracts.addressStore.address, calldata),
        ).to.be.revertedWith('TimelockController: operation is not ready');

        // we can verify that the address store wasn't updated
        expect(await contracts.addressStore.getAddr('mockKey')).to.equal(
            ethers.constants.AddressZero,
        );

        // wait for the timelock delay to pass
        await sleep(timelockDelay.toNumber() + 1);

        // this time it should execute
        await contracts.executeTmielockOp(contracts.addressStore.address, calldata);

        // we can verify the same by querying the address store
        expect(await contracts.addressStore.getAddr('mockKey')).to.equal(mockAddr);
    }).timeout((timelockDelay.toNumber() + 5) * 1000);

    it('should destroy stkBNB via timelock', async function () {
        // pause so that we can call selfdestruct
        await executeTx(contracts.stakedBNBToken, 'pause', []);
        // pausing again should fail
        await expect(executeTx(contracts.stakedBNBToken, 'pause', [])).to.be.revertedWith(
            'Pausable: paused',
        );
        // querying something should work
        expect(await contracts.stakedBNBToken.decimals()).to.eq(18);

        // trying to let the deployer destroy stkBNB shouldn't work
        await expect(executeTx(contracts.stakedBNBToken, 'selfDestruct', [])).to.be.revertedWith(
            'UnauthorizedSender',
        );

        // destroy the contract
        const calldata = contracts.stakedBNBToken.interface.encodeFunctionData('selfDestruct');
        await contracts.scheduleTimelockOp(contracts.stakedBNBToken.address, calldata);
        await sleep(timelockDelay.toNumber() + 1);
        await contracts.executeTmielockOp(contracts.stakedBNBToken.address, calldata);

        // pausing here shouldn't revert as there is no contract to interact with
        await executeTx(contracts.stakedBNBToken, 'pause', []);
        // and we can pause again, it just doesn't matter now
        await executeTx(contracts.stakedBNBToken, 'pause', []);
        // querying something should revert
        await expect(contracts.stakedBNBToken.decimals()).to.be.revertedWith('');
    }).timeout((timelockDelay.toNumber() + 5) * 1000);

    it('upgrade', async function () {
        const upgradeConf = JSON.parse(JSON.stringify(conf)) as IConfig;
        upgradeConf.stakePool.upgrade = true;
        upgradeConf.feeVault.upgrade = true;

        contracts = await Contracts.upgrade(upgradeConf);
    });
});
