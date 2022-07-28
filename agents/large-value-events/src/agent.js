const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { after } = require("mocha");

// StakePool contract events
const STKBNB_DEPOSIT_EVENT = "event Deposit(address indexed user,uint256 bnbAmount,uint256 poolTokenAmount,uint256 timestamp)";
const STKBNB_WITHDRAW_EVENT = "event Withdraw(address indexed user,uint256 poolTokenAmount,uint256 bnbAmount,uint256 timestamp)";

// StkBNBToken contract events
const STKBNB_MINT_EVENT = "event Minted(address indexed operator, address indexed to, uint256 amount, bytes data, bytes operatorData)";
const STKBNB_BURN_EVENT = "event Burned(address indexed operator, address indexed from, uint256 amount, bytes data, bytes operatorData)";


// Contract Addresses
const STAKEPOOL_ADDRESS = "0xEB6048eE3F39eb701712073936CA76Be774b6e0f";
const STAKEDBNBTOKEN_ADDRESS= "0xCA115d3723A0d36f4984d7CebE69a85ca235CfCA"

// Thresholds 
const HighThreshold = 1000000;   // 1 Million $
const MediumThreshold = 500000;  // 500k $
const LowThreshold = 100000;     // 100k $

// Unused
const STKBNB_DECIMALS = 18;
let findingsCount = 0;

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
      
      // Normalize decimal places from 18 NOTE: Div does not support 18 decimals hence done in 2 steps
      function normalizeValue(value){
        value=value.div(10**10)
        value=value.div(10**8)
        return value
      }

      // Log the timestamp
      console.log(new Date( txEvent.block.timestamp * 1000) )

      // Normalised value bought down from 18 decimals
      const normalizedValue= normalizeValue(amount)

  
      // if more than 1Million stkBNB were minted, report it
      if (normalizedValue.gte(HighThreshold) ) {
        findings.push(
          Finding.fromObject({
            name: "High stkBNB Mint",
            description: `High amount of StkBNB minted: ${normalizedValue}`,
            alertId: "FORTA-1",
            severity: FindingSeverity.High,
            type: FindingType.Info,
            metadata: {
               amount
  
              
            },
          })
        );
        findingsCount++;
      }
      // else if more than 500,000 stkBNB but less than 1 Million stkBNB were minted, report it
      else if (normalizedValue.gte(MediumThreshold) && normalizedValue.lt(HighThreshold) ) {
        findings.push(
          Finding.fromObject({
            name: "High stkBNB Mint",
            description: `Medium amount of StkBNB minted: ${normalizedValue}`,
            alertId: "FORTA-1",
            severity: FindingSeverity.Medium,
            type: FindingType.Info,
            metadata: {
             amount
            },
          })
        );
        findingsCount++;
      }
      // else if more than 100,000 stkBNB but less than 500,000 stkBNB were minted, report it
      else if (normalizedValue.gte(LowThreshold) && normalizedValue.lt(MediumThreshold) ) {
        findings.push(
          Finding.fromObject({
            name: "High stkBNB Mint",
            description: `Low amount of StkBNB minted: ${normalizedValue}`,
            alertId: "FORTA-1",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              amount
            },
          })
        );
        findingsCount++;
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

 function normalizeValue(value){
   value=value.div(10**10)
   value=value.div(10**8)
   return value
 }
 console.log(new Date( txEvent.block.timestamp * 1000) )
 const normalizedValue= normalizeValue(amount)


 // if equal or more than 1 Million stkBNB were burnt, report it
 if (normalizedValue.gte(HighThreshold) ) {
   findings.push(
     Finding.fromObject({
       name: "High stkBNB Burn",
       description: `High amount of StkBNB burnt: ${normalizedValue}`,
       alertId: "FORTA-1",
       severity: FindingSeverity.High,
       type: FindingType.Info,
       metadata: {
          amount,
          

         
       },
     })
   );
   findingsCount++;
 }
 // else if euqal or more than 500,000 stkBNB but less than 1Million stkBNB were burnt, report it
 else if (normalizedValue.gte(MediumThreshold) && normalizedValue.lt(HighThreshold) ) {
   findings.push(
     Finding.fromObject({
       name: "High stkBNB Mint",
       description: `Medium amount of StkBNB burnt: ${normalizedValue}`,
       alertId: "FORTA-1",
       severity: FindingSeverity.Medium,
       type: FindingType.Info,
       metadata: {
        amount
       },
     })
   );
   findingsCount++;
 }
 // else if equal or more than 100,000 stkBNB but less than 500,000 stkBNB were burnt, report it
 else if (normalizedValue.gte(LowThreshold) && normalizedValue.lt(MediumThreshold) ) {
   findings.push(
     Finding.fromObject({
       name: "High stkBNB Mint",
       description: `Low amount of StkBNB burnt: ${normalizedValue}`,
       alertId: "FORTA-1",
       severity: FindingSeverity.Low,
       type: FindingType.Info,
       metadata: {
         amount
       },
     })
   );
   findingsCount++;
 }
});





//////////////////////////////////////////DEPOSITS////////////////////////////////////////////

  // filter the transaction logs for stkbnb Deposit events
  const stkbnbDepositEvents = txEvent.filterLog(
    STKBNB_DEPOSIT_EVENT,
    STAKEPOOL_ADDRESS
  );


  stkbnbDepositEvents.forEach((depositEvent) => {
    // extract deposit event arguments
    const { timestamp, bnbAmount } = depositEvent.args;

    function normalizeValue(value){
      value=value.div(10**10)
      value=value.div(10**8)
      return value
    }
    const normalizedValue= normalizeValue(bnbAmount)

    // if equal or more than 1 Million stkBNB were deposited, report it
    if (normalizedValue.gte(HighThreshold) ) {
      findings.push(
        Finding.fromObject({
          name: "High stkBNB Deposit",
          description: `High amount of StkBNB deposit: ${normalizedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.High,
          type: FindingType.Info,
          metadata: {
             date : new Date(timestamp * 1000),

            
          },
        })
      );
      findingsCount++;
    }
    // else if equal or more than 500,000 stkBNB but less than 1 Million stkBNB were deposited, report it
    else if (normalizedValue.gte(MediumThreshold) && normalizedValue.lt(HighThreshold) ) {
      findings.push(
        Finding.fromObject({
          name: "High stkBNB Deposit",
          description: `High amount of StkBNB deposit: ${normalizedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            timestamp
          },
        })
      );
      findingsCount++;
    }
    // else if equal or more than 100,000 stkBNB but less than 500,000 stkBNB were deposited, report it
    else if (normalizedValue.gte(LowThreshold) && normalizedValue.lt(MediumThreshold) ) {
      findings.push(
        Finding.fromObject({
          name: "High stkBNB Deposit",
          description: `High amount of StkBNB deposit: ${normalizedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            timestamp
          },
        })
      );
      findingsCount++;
    }
  });
////////////////////////////////WITHDRWALS////////////////////////////////////////////////////////////////

const stkbnbWithdrawEvents=txEvent.filterLog(
  STKBNB_WITHDRAW_EVENT,
  STAKEPOOL_ADDRESS
);

  stkbnbWithdrawEvents.forEach((depositEvent) => {
    // extract withdraw event arguments
    const { timestamp, bnbAmount } = depositEvent.args;
    // convert 18 decimal places to normal value
    function normalizeValue(value){
      value=value.div(10**10)
      value=value.div(10**8)
      return value
    }
    const normalizedValue= normalizeValue(bnbAmount)

    // if equal or more than 1 Million stkBNB were withdrawn, report it
    if (normalizedValue.gte(HighThreshold) ) {
      findings.push(
        Finding.fromObject({
          name: "High stkBNB Withdrawal",
          description: `High amount of StkBNB withdrawn: ${normalizedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.High,
          type: FindingType.Info,
          metadata: {
             date : new Date(timestamp * 1000),

            
          },
        })
      );
      findingsCount++;
    }
     // else if equal or more than 500,000 stkBNB but less than 1 Million stkBNB were withdrawn, report it
    else if (normalizedValue.gte(MediumThreshold) && normalizedValue.lt(HighThreshold) ) {
      findings.push(
        Finding.fromObject({
          name: "High stkBNB Withdrawal",
          description: `High amount of StkBNB withdrawn: ${normalizedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            timestamp
          },
        })
      );
      findingsCount++;
    }
    // else if equal or more than 100,000 stkBNB but less than 500,000 stkBNB were withdrawn, report it
    else if (normalizedValue.gte(LowThreshold) && normalizedValue.lt(MediumThreshold) ) {
      findings.push(
        Finding.fromObject({
          name: "High stkBNB Withdrawal",
          description: `High amount of StkBNB withdrawn: ${normalizedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            timestamp
          },
        })
      );
      findingsCount++;
    }
  });


  return findings;
};


module.exports = {
  handleTransaction,
  // handleBlock,
  STKBNB_DEPOSIT_EVENT, // exported for unit tests
  STKBNB_WITHDRAW_EVENT, // exported for unit tests
  STAKEPOOL_ADDRESS, // exported for unit tests
  STKBNB_DECIMALS, // exported for unit tests
  STKBNB_BURN_EVENT, // exported for unit tests
  STKBNB_MINT_EVENT, // exported for unit tests
  STAKEDBNBTOKEN_ADDRESS // exported for unit tests

};
