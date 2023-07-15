import { CONFIG } from './types/config';
import { deployAllContracts, upgradeStakePoolV2 } from '../helpers/deployments';
import { StakePoolConfigV2 } from './types/config';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { Provider } from '@ethersproject/providers';
import { DAY_SECONDS, STAKE_POOL_CONFIG, STAKE_POOL_CONFIG_V2 } from '../test/helpers/constants';
import { fillAddressStore } from '../helpers/setUps/addressStore';
import { Contracts } from '../helpers/types';
import { stakePoolSetUp } from '../helpers/setUps/stakePool';

// NOTE: ERC-1820 Registry deployed by default, check the hardhat config file.

async function main() {
    const STAKE_POOL_ADDRESS = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853';

    const stakePool = await ethers.getContractAt('StakePool', STAKE_POOL_ADDRESS);

    console.log(await stakePool.config());
    console.log(await stakePool.claimFeeConfig());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
    console.error(error);
    process.exit(1);
});
