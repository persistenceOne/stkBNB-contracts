# Large STKBNB Large Deposit Withdrawals Agent

## Description

This agent detects transactions with large deposits, withdrawals to the stkBNB stakepool contract, and detects large Mint and Burn events of stkBNB token

## Supported Chains

- BNB chain


## Alerts

- Large stkBNB Deposit
  - Fired when a transaction deposits over 100,000/500,000,1 Million stkBNB.
  - Severity is always set to "low" "Medium" "High" based on thresholds
  - Type is always set to "info" 

- Large stkBNB Withdrawals
  - Fired when a transaction withdraws over 100,000/500,000,1 Million stkBNB.
  - Severity is always set to "low" "Medium" "High" based on thresholds
  - Type is always set to "info" 


- Large stkBNB Mint
  - Fired when a transaction mints over 100,000/500,000,1 Million stkBNB.
  - Severity is always set to "low" "Medium" "High" based on thresholds
  - Type is always set to "info" 

- Large stkBNB Burn
  - Fired when a transaction burns over 100,000/500,000,1 Million stkBNB.
  - Severity is always set to "low" "Medium" "High" based on thresholds
  - Type is always set to "info" 


 
