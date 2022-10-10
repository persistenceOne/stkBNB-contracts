# Large Liquidity Pool Deposit/Withdrawal Bot

## Description

This bot detects large addition/removal of liquidity in stkBNB-BNB PancakeSwap pool. 
> The `POOL_SUPPLY_THRESHOLD` `THRESHOLD_PERCENTAGE` can be adjusted in **src/constants.ts**.


## Supported Chains

- BNB chain 

## Alerts

- pSTAKE-stkBNB-PCS-SUBSTANTIAL-Pool-Deposit
  - Fired when large liquidity is deposited to a Pancakeswap stkBNB-BNB pool as `Mint` event is emitted with a `totalSuppply` that exceeds the pool's `poolSupplyThreshold` and `amount0`/`amount1` that exceeds `token0`/`token1` `thresholdPercentage`
  - Severity is always set to "Info"
  - Type is always set to "Info"
  - Metadata:
    - `poolAddress`: The address of the stkBNB-BNB liquidity pool 
    - `token0`: The address of token0
    - `amount0`: The deposited amount of token0
    - `token1`: The address of token1
    - `amount1`: The deposited amount of token1
    - `totalSupply`: The total supply of the pool before the deposit transaction at the preceeding block


- pSTAKE-stkBNB-PCS-SUBSTANTIAL-Pool-Withdrawal
  - Fired when large liquidity is withdrawn from a Pancakeswap stkBNB-BNB pool as `Burn` event is emitted with a `totalSuppply` that exceeds the pool's `poolSupplyThreshold` threshold and `amount0`/`amount1` that exceeds `token0`/`token1` `thresholdPercentage`
  - Severity is always set to "Info"
  - Type is always set to "Info"
  - Metadata:
    - `poolAddress`: The address of the stkBNB-BNB liquidity pool 
    - `token0`: The address of token0
    - `token1`: The address of token1
    - `amount0`: The withdrawn amount of token0
    - `amount1`: The withdrawn amount of token1
    - `totalSupply`: The total supply of the pool before the withdrawal transaction at the preceeding block

