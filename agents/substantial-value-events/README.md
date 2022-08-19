# stkBNB Substantial Value Agent

## Description

This agent detects transactions with large deposits, withdrawals to the stkBNB StakePool contract, and detects large
Mint and Burn events of stkBNB token.

## Supported Chains

- BNB chain

## Alerts

- pSTAKE-stkBNB-SUBSTANTIAL-DEPOSIT
    - Fired when a transaction deposits over 100/500/1000 BNB.
    - Severity is always set to "Low", "Medium" or "High" based on thresholds.
    - Type is always set to "Info".

- pSTAKE-stkBNB-SUBSTANTIAL-WITHDRAWAL
    - Fired when a transaction withdraws over 100/500/1000 BNB.
    - Severity is always set to "Low", "Medium" or "High" based on thresholds.
    - Type is always set to "info".


- pSTAKE-stkBNB-SUBSTANTIAL-MINT
    - Fired when a transaction mints over 100/500/1000 stkBNB.
    - Severity is always set to "Low", "Medium" or "High" based on thresholds.
    - Type is always set to "Info".

- pSTAKE-stkBNB-SUBSTANTIAL-BURN
    - Fired when a transaction burns over 100/500/1000 stkBNB.
    - Severity is always set to "Low", "Medium" or "High" based on thresholds.
    - Type is always set to "Info".


 
