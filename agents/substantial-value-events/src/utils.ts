import { BigNumber } from 'ethers';
const { ethers } = require('ethers');

// normalizeValue converts a value with decimals to just the integer part without decimals
export function normalizeValue(value: BigNumber) {
    return value.div(ethers.constants.WeiPerEther);
}
