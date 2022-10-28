# Large Exchange Rate Change Bot

## Description

This bot detects large change in stkBNB <-> BNB exchange rate in stkBNB-BNB Pancakeswap pool every time exchange rate updates.

> The threshold `ER_THRESHOLD` of what is considered large can be adjusted in `src/constants.ts` & is set to 1%.

## Supported Chains

- BNB Chain

## Alerts

- pSTAKE-stkBNB-PCS-SUBSTANTIAL-Pool-Swap
  - Fired when exchange rate change is considered "large"
  - Severity is always set to "Info"
  - Type is always set to "Info"
  - Metadata:
    - `exchangerateOld`: Exchange rate from previous block.
    - `exchangerateNew`: Exchange rate in current block.


