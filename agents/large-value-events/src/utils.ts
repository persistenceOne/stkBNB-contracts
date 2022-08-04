import { BigNumber } from "ethers";
const { ethers } = require("ethers");

// export function normalizeValue(value){
//     return value.div(ethers.constants.WeiPerEther)
// }


export function normalizedValue( value : any){
    value = value/(ethers.constants.WeiPerEther) 
    return value
  }