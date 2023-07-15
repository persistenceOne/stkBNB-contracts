import { CONFIG } from './types/config';
import { deployAllContracts, upgradeStakePoolV2 } from '../helpers/deployments';
import { StakePoolConfigV2 } from './../scripts/types/config';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { Provider } from '@ethersproject/providers';
import { DAY_SECONDS, STAKE_POOL_CONFIG, STAKE_POOL_CONFIG_V2 } from '../test/helpers/constants';
import { fillAddressStore } from '../helpers/setUps/addressStore';
import { Contracts } from '../helpers/types';
import { stakePoolSetUp } from '../helpers/setUps/stakePool';

// NOTE: ERC-1820 Registry deployed by default, check the hardhat config file.

async function main() {
    console.log('Ecosystem local deployment');
    console.log('mnemonic:', CONFIG.mnemonic);
    const [deployer, bot] = await ethers.getSigners();
    console.log('deployer address', await deployer.getAddress());
    console.log('deployer balance', await deployer.getBalance());
    const provider = deployer.provider as Provider;
    console.log('network', await provider.getNetwork());

    const contracts = await deployAllContracts(
        DAY_SECONDS,
        STAKE_POOL_CONFIG,
        STAKE_POOL_CONFIG_V2,
        [deployer.address],
        [deployer.address],
    );

    console.log('stake pool address');
    console.log(contracts.stakePool.address);

    console.log('filling address store');
    await fillAddressStore(contracts);

    console.log('setting up stake pool');
    await stakePoolSetUp(contracts.stakePool, bot.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
    console.error(error);
    process.exit(1);
});
