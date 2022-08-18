# stkBNB Admin Events Agent

## Description

This agent detects admin events emitted by the pSTAKE stkBNB smart contracts.

## Supported Chains

- BNB chain

## Alerts

- pSTAKE-stkBNB-ADMIN-EVENT
    - Fired when stkBNB smart contracts emit an admin event.
    - Severity is always set to "Info", "High" or "Critical" based on event.
    - Type is always set to "Info".

