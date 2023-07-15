import { CONFIG } from './types/config';
import { upgradeStakePoolV2 } from '../helpers/deployments';
import { StakePoolConfigV2 } from './../scripts/types/config';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { Provider } from '@ethersproject/providers';

async function main() {
    console.log("Executing V2 StakePool upgrade - testnet");
    console.log(CONFIG.mnemonic);
    const [deployer] = await ethers.getSigners();
    console.log("deployer address", await deployer.getAddress());
    console.log("deployer balance", await deployer.getBalance());
    const provider = deployer.provider as Provider;
    console.log("network", await provider.getNetwork());
    const claimFeeConfig: StakePoolConfigV2 = {
      automatedClaimFee: BigNumber.from("500000000000000"), // 0.0005 ETH,
      instantClaimFeePercentage: BigNumber.from(1) // 1% Fee
    }
    await upgradeStakePoolV2(CONFIG.stakePool.address, claimFeeConfig);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
    console.error(error);
    process.exit(1);
});
