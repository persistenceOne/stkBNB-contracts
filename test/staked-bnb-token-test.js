const { expect } = require('chai');
const { ethers, upgrades, network } = require('hardhat');
require('@openzeppelin/test-helpers/configure')({ web3 });
const { singletons } = require('@openzeppelin/test-helpers');

describe('StakedAVAXToken', function() {
    let stakedAVAXToken;
    it('Should deploy StakedAVAXToken', async function() {
        const StakedAVAXToken = await ethers.getContractFactory('StakedAVAXToken');
        stakedAVAXToken = await StakedAVAXToken.deploy();
        await stakedAVAXToken.deployed();
        expect(await stakedAVAXToken.signer.getAddress()).to.equal(adminAddress);
    });

});
