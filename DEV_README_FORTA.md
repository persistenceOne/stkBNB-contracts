# Forta Setup

## For each bot
* Ensure you have a `forta.config.json` file in the agent dir. Sample:
```json
{
  "jsonRpcUrl": "https://bsc-dataseed.binance.org/",
}
```
* Ensure you have installed all the necessary dependencies with npm:
```shell
cd <AGENT-DIR>
npm install

# if the bot is typescript
npm run build
cp -r ./dist/src/* ./dist

# can use these to simulate a local tx

# admin-events
npm run tx 0x14b29d2fde6ffb5cf48b0339b9f2cfe4c18f49824ab4749fbd8ad6c26413886a
npm run tx 0x402c5a796b8d865beeb02b8b07da82505a4ebd8e8436101b0c7b37a50c7c3c3e
npm run tx 0xf557a374134c5d06025fc0bffc95924c619dabaea5c26981ceaa9f8321895a16
# operational-events
npm run tx 0x869db8da0f74b186d417ca39343f6e802c458252863c7666b643028563730e7e
# substantial-value-events
npm run tx 0x2378466e8d2e85f82baf846ee5114ff465cb8e0be1614111b82f007eecece6dd
npm run tx 0x89caa53495a6a2a2c5ca6debc5b1fa247a87f14c143e0363f4b12ec8e00bdf8c
```
* Run a forta agent locally from repo root: `yarn hardhat forta:run`
* Run a forta agent from the agent dir: `npm run start`
* Locally build docker image and test from agent dir. You will need to copy the `abis/ui` to `abi` in the agent dir:
```shell
docker build -t testbuild .
docker run testbuild
```

## Issues/TODOs
* The `npm build` for substantial-value-events is broken. The files need to be manually copied from `dist/src` to `dist`.
* Dockerfiles aren't proper. Getting this in substantial-value-events bot while building docker image:
```
npm WARN prepare removing existing node_modules/ before installation
```
* Tests have to be added properly.
