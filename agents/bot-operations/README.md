# Bot Operations Monitoring

## Description

This agent detects if the background bot for stkBNB carries out operations on the given UTC time period

## Supported Chains

- BSC


## Alerts


- Initiate_Delegation_Missed
  - Fired when initiate delegation event does not occur at in the specified time interval
  - Severity is always set to Critical
  - Type is always set to Degraded

- Epoch_Update_Missed
  - Fired when epoch update event does not occur at in the specified time interval
  - Severity is always set to Critical
  - Type is always set to Degraded

- Unbonding_Initiated_Missed
  - Fired when unbonding initiate event does not occur at in the specified time interval
  - Severity is always set to Critical
  - Type is always set to Degraded

- Unbonding_Finished_Missed
  - Fired when unbonding finished event does not occur at in the specified time interval
  - Severity is always set to Critical
  - Type is always set to Degraded



