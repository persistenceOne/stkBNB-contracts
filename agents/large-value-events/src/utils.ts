import { BigNumber } from 'ethers';
const { ethers } = require('ethers');

export function normalizedValue(value: BigNumber) {
    value = value.div(ethers.constants.WeiPerEther);
    return value;
}
