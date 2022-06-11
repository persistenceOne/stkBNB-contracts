import { expect } from 'chai';
import { ethers, network, web3 } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';
import * as utils from '../scripts/utils';

require('@openzeppelin/test-helpers/configure')({ web3 });
const { singletons } = require('@openzeppelin/test-helpers');

describe('StakedBNBToken', function () {
    let signers: SignerWithAddress[], adminAddress: string;
    it('Should fetch all signers', async function () {
        signers = await ethers.getSigners();
        adminAddress = await signers[0].getAddress();
    });

    it('Should deploy ERC1820Registry on local networks', async function () {
        if (network.name.startsWith('local') || network.name.startsWith('hardhat')) {
            await singletons.ERC1820Registry(adminAddress);
        } else {
            console.log('Not a local network: ', network.name);
            console.log('Skipping ERC1820Registry deployment.');
        }
    });

    let stakedBNBToken: Contract;
    it('Should deploy StakedBNBToken', async function () {
        stakedBNBToken = await utils.deployContract('StakedBNBToken');
        expect(await stakedBNBToken.signer.getAddress()).to.equal(adminAddress);
    });
});
