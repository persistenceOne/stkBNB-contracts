const { expect } = require('chai');
const { ethers, upgrades, network } = require('hardhat');
require('@openzeppelin/test-helpers/configure')({ web3 });
const { singletons } = require('@openzeppelin/test-helpers');

// address of admim
let adminAddress;


describe('StakedBNBToken', function() {
    let stakedBNBToken;
    it('Should deploy StakedBNBToken', async function() {
        const StakedBNBToken = await ethers.getContractFactory('StakedBNBToken');
        stakedBNBToken = await StakedBNBToken.deploy();
        await stakedBNBToken.deployed();
        expect(await stakedBNBToken.signer.getAddress()).to.equal(adminAddress);
    });

});
