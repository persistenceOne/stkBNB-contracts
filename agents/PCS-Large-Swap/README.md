# PCS Large Swap Bot

## Description

This bot detects large swaps in stkBNB-BNB (i.e. the amount of tokens swapped in stkBNB-BNB Pancake pair contract is a significant fraction of the
pair's pool reserves) pool.

> The threshold `LARGE_THRESHOLD` of what is considered large can be adjusted in `src/constants.ts` & is set to 1%.

## Supported Chains

- BNB Chain

## Alerts

- pSTAKE-stkBNB-PCS-SUBSTANTIAL-Pool-Swap
  - Fired when a swap is considered "large"
  - Severity is always set to "Info"
  - Type is always set to "Info"
  - Metadata:
    - `amountIn`: The swap's `amountIn` of `tokenIn`
    - `amountOut`: The swap's `amountOut` of `tokenOut`
    - `percentageIn`: The percentage of `amountIn` relative to the previous block's pair `tokenIn` balance
    - `percentageOut`: The percentage of `amountOut` relative to the previous block's pair `tokenOut` balance
    - `swapRecipient`: The swap's `to` address

