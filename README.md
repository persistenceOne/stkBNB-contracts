# Liquid Staked BNB Project
Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.js
node scripts/deploy.js
npx eslint '**/*.js'
npx eslint '**/*.js' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

## Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.js
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```

## Cross-chain token transfer
1. Mirror: https://docs.bnbchain.org/docs/mirror
2. Mint/Burn tokens on BSC. Then sync the total supply with BC everyday: https://docs.bnbchain.org/docs/sync
3. If not synced, the cross-chain transfers won't work. The transfer-out packages will be refunded.
4. Eg:
   1. BSC: https://testnet.bscscan.com/token/0xF2998aE1e8147418473fC334225a25C9136A669C
   2. BC: https://testnet-explorer.binance.org/asset/STKBNB-342

## TODOs
* Fix todos in code
* Check cross-chain token movement with the actual BEP-20 compatible token
* Remove unnecessary logs from Contracts class now

## Questions
1. The token mirroring worked even if there was no `getOwner()` function on the token contract. This is what bnbcli showed:
```shell
./tbnbcli token info --symbol STKBNB-342 --trust-node --node http://data-seed-pre-0-s3.binance.org:80
```
```json
{
  "type": "bnbchain/Token",
  "value": {
    "name": "Staked BNB",
    "symbol": "STKBNB-342",
    "original_symbol": "STKBNB",
    "total_supply": "0.00000000",
    "owner": "tbnb1v8vkkymvhe2sf7gd2092ujc6hweta38xnc4wpr",
    "mintable": true,
    "contract_address": "0xF2998aE1e8147418473fC334225a25C9136A669C",
    "contract_decimals": 18
  }
}
```
* The owner here seems to be a pure-code-controlled address on BC as mentioned [here](https://docs.bnbchain.org/docs/cross-chain-transfer#mint-token-on-bsc).
* The strange thing is, the [testnet explorer](https://testnet-explorer.binance.org/asset/STKBNB-342) shows it as non-mintable, in contrast to the output from bnbcli.
* Are both these things expected? Can we have a token without an owner on BSC, and still be able to mirror it? Any drawbacks?
