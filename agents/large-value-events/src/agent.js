const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { after } = require("mocha");
const config = require('../agent-config.json');
import {normalizeValue} from './utils.js';
const { ethers } = require("ethers");



// StakePool contract events
const STAKE_POOL_DEPOSIT_EVENT = "event Deposit(address indexed user,uint256 bnbAmount,uint256 poolTokenAmount,uint256 timestamp)";
const STAKE_POOL_WITHDRAW_EVENT = "event Withdraw(address indexed user,uint256 poolTokenAmount,uint256 bnbAmount,uint256 timestamp)";

// StkBNBToken contract events
const STKBNB_MINT_EVENT = "event Minted(address indexed operator, address indexed to, uint256 amount, bytes data, bytes operatorData)";
const STKBNB_POOL_BURN_EVENT = "event Burned(address indexed operator, address indexed from, uint256 amount, bytes data, bytes operatorData)";


// Contract Addresses
const STAKEPOOL_ADDRESS = config.STAKEPOOL_ADDRESS;
const STAKEDBNBTOKEN_ADDRESS= config.STAKEDBNBTOKEN_ADDRESS

// Thresholds 
const HighThreshold = config.HighThreshold;   // 1 Million 
const MediumThreshold = config.MediumThreshold;  // 500k 
const LowThreshold = config.LowThreshold;     // 100k 


const handleTransaction = async (txEvent) => {

  // Findings are stored
  const findings = [];

  //////////////////////////////////MINTED/////////////////////////////////////////////////////////
  const stkbnbMintedEvents = txEvent.filterLog(
       STKBNB_MINT_EVENT,
       STAKEDBNBTOKEN_ADDRESS
     );
  
     stkbnbMintedEvents.forEach((mintEvent) => {
      // extract mint event arguments
      const { amount } = mintEvent.args;
      

      // Normalised value bought down from 18 decimals
       normalizedValue= normalizeValue(amount)

      //TODO Create a finding object at that time with the severity as per the variable
      // if more than 1Million stkBNB were minted, report it
      if (normalizedValue.gte(HighThreshold) ) {
        findings.push(
          Finding.fromObject({
            protocol:"pStake stkBNB",
            name: "Large stkBNB Mint",
            description: `Minted: ${ethers.utils.formatEther(amount)} stkBNB`,
            alertId: "LARGE_stkBNB_MINT",
            severity: FindingSeverity.High,
            type: FindingType.Info,
            metadata: {
               amount
            },
          })
        );
      }
      // else if more than 500,000 stkBNB but less than 1 Million stkBNB were minted, report it
      else if (normalizedValue.gte(MediumThreshold) ) {
        findings.push(
          Finding.fromObject({
            protocol:"pStake stkBNB",
            name: "Large stkBNB Mint",
            description: `Minted: ${ethers.utils.formatEther(amount)} stkBNB`,
            alertId: "LARGE_stkBNB_MINT",
            severity: FindingSeverity.Medium,
            type: FindingType.Info,
            metadata: {
             amount
            },
          })
        );
      }
      // else if more than 100,000 stkBNB but less than 500,000 stkBNB were minted, report it
      else if (normalizedValue.gte(LowThreshold)  ) {
        findings.push(
          Finding.fromObject({
            protocol:"pStake stkBNB",
            name: "Large stkBNB Mint",
            description: `Minted: ${ethers.utils.formatEther(amount)} stkBNB`,
            alertId: "LARGE_stkBNB_MINT",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              amount
            },
          })
        );
      }
    });
   
/////////////////////////////////////////BURNED///////////////////////////////////////////////////////////


const stkbnbBurnedEvents = txEvent.filterLog(
  STKBNB_BURN_EVENT,
  STAKEDBNBTOKEN_ADDRESS
);

stkbnbBurnedEvents.forEach((burnEvent) => {
 // extract burn event arguments
 const { amount } = burnEvent.args;


 normalizedValue= normalizeValue(amount)


 // if equal or more than 1 Million stkBNB were burnt, report it
 if (normalizedValue.gte(HighThreshold) ) {
   findings.push(
     Finding.fromObject({
       protocol:"pStake stkBNB",
       name: "Large stkBNB Burn",
       description: `Burned: ${ethers.utils.formatEther(amount)} stkBNB`,
       alertId: "LARGE_stkBNB_BURN",
       severity: FindingSeverity.High,
       type: FindingType.Info,
       metadata: {
          amount
       },
     })
   );
 }
 // else if euqal or more than 500,000 stkBNB but less than 1Million stkBNB were burnt, report it
 else if (normalizedValue.gte(MediumThreshold) ) {
   findings.push(
     Finding.fromObject({
       protocol:"pStake stkBNB",
       name: "Large stkBNB Burn",
       description: `Burned: ${ethers.utils.formatEther(amount)} stkBNB`,
       alertId: "LARGE_stkBNB_BURN",
       severity: FindingSeverity.Medium,
       type: FindingType.Info,
       metadata: {
        amount
       },
     })
   );
 }
 // else if equal or more than 100,000 stkBNB but less than 500,000 stkBNB were burnt, report it
 else if (normalizedValue.gte(LowThreshold) ) {
   findings.push(
     Finding.fromObject({
       protocol:"pStake stkBNB",
       name: "Large stkBNB Burn",
       description: `Burned: ${ethers.utils.formatEther(amount)} stkBNB`,
       alertId: "LARGE_stkBNB_BURN",
       severity: FindingSeverity.Low,
       type: FindingType.Info,
       metadata: {
         amount
       },
     })
   );
 }
});





//////////////////////////////////////////DEPOSITS////////////////////////////////////////////

  // filter the transaction logs for stkbnb Deposit events
  const bnbDepositEvents = txEvent.filterLog(
    STAKE_POOL_DEPOSIT_EVENT,
    STAKEPOOL_ADDRESS
  );


  bnbDepositEvents.forEach((depositEvent) => {
    // extract deposit event arguments
    const { timestamp, bnbAmount } = depositEvent.args;

    normalizedValue= normalizeValue(bnbAmount)

    // if equal or more than 1 Million stkBNB were deposited, report it
    if (normalizedValue.gte(HighThreshold) ) {
      findings.push(
        Finding.fromObject({
          protocol:"pStake stkBNB",
          name: "Large BNB Deposit",
          description: `Deposited: ${ethers.utils.formatEther(amount)} BNB`,
          alertId: "LARGE_stkBNB_DEPOSIT",
          severity: FindingSeverity.High,
          type: FindingType.Info,
          metadata: {
            bnbAmount,
            timestamp

            
          },
        })
      );
    }
    // else if equal or more than 500,000 stkBNB but less than 1 Million stkBNB were deposited, report it
    else if (normalizedValue.gte(MediumThreshold) ) {
      findings.push(
        Finding.fromObject({
          protocol:"pStake stkBNB",
          name: "Large BNB Deposit",
          description: `Deposited: ${ethers.utils.formatEther(amount)} BNB`,
          alertId: "LARGE_stkBNB_DEPOSIT",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            bnbAmount,
            timestamp
          },
        })
      );
    }
    // else if equal or more than 100,000 stkBNB but less than 500,000 stkBNB were deposited, report it
    else if (normalizedValue.gte(LowThreshold)  ) {
      findings.push(
        Finding.fromObject({
          protocol:"pStake stkBNB",
          name: "Large BNB Deposit",
          description: `Deposited: ${ethers.utils.formatEther(amount)} BNB`,
          alertId: "LARGE_stkBNB_DEPOSIT",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            bnbAmount,
            timestamp
          },
        })
      );
    }
  });
////////////////////////////////WITHDRWALS////////////////////////////////////////////////////////////////

const stkbnbWithdrawEvents=txEvent.filterLog(
  STAKE_POOL_WITHDRAW_EVENT,
  STAKEPOOL_ADDRESS
);

  stkbnbWithdrawEvents.forEach((depositEvent) => {
    // extract withdraw event arguments
    const { timestamp, bnbAmount } = depositEvent.args;
    // convert 18 decimal places to normal value

    normalizedValue= normalizeValue(bnbAmount)

    // if equal or more than 1 Million stkBNB were withdrawn, report it
    if (normalizedValue.gte(HighThreshold) ) {
      findings.push(
        Finding.fromObject({
          protocol:"pStake stkBNB",
          name: "Large stkBNB Withdrawal",
          description: `Withdrawn: ${ethers.utils.formatEther(amount)} stkBNB`,
          alertId: "LARGE_stkBNB_WITHDRAWAL",
          severity: FindingSeverity.High,
          type: FindingType.Info,
          metadata: {
            bnbAmount,
            timestamp
          },
        })
      );
    }
     // else if equal or more than 500,000 stkBNB but less than 1 Million stkBNB were withdrawn, report it
    else if (normalizedValue.gte(MediumThreshold)  ) {
      findings.push(
        Finding.fromObject({
          protocol:"pStake stkBNB",
          name: "Large stkBNB Withdrawal",
          description: `Withdrawn: ${ethers.utils.formatEther(amount)} stkBNB`,
          alertId: "LARGE_stkBNB_WITHDRAWAL",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            bnbAmount,
            timestamp
          },
        })
      );
    }
    // else if equal or more than 100,000 stkBNB but less than 500,000 stkBNB were withdrawn, report it
    else if (normalizedValue.gte(LowThreshold) ) {
      findings.push(
        Finding.fromObject({
          protocol:"pStake stkBNB",
          name: "Large stkBNB Withdrawal",
          description: `Withdrawn: ${ethers.utils.formatEther(amount)} stkBNB`,
          alertId: "LARGE_stkBNB_WITHDRAWAL",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            bnbAmount,
            timestamp
          },
        })
      );
    }
  });
  return findings;
};


module.exports = {
  handleTransaction,
 
  STAKE_POOL_DEPOSIT_EVENT, // exported for unit tests
  STAKE_POOL_WITHDRAW_EVENT, // exported for unit tests
  STAKEPOOL_ADDRESS, // exported for unit tests
  STKBNB_BURN_EVENT, // exported for unit tests
  STKBNB_MINT_EVENT, // exported for unit tests
  STAKEDBNBTOKEN_ADDRESS // exported for unit tests

};
