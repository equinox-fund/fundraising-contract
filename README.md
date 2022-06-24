# Fundraising Contract

Solidity contract for IDO / INO / IGO ..

✔️ Multi-pool  
✔️ Whitelist per pool  
✔️ Vesting supported  
✔️ Multiple buy feature  
✔️ Raise funds with a stablecoin  
✔️ Raise funds with or without tokens!  
✔️ Clean code and great documentation  
✔️ Script ready to deploy  
✔️ Multi chain supported

## Configuration

Rename `.env.example` to `.env` and add your private key for your favorite blockchain.

### hardhat.config.ts

We've already added public node urls for Binance Smart Chain and Polygon.
We recommend using Moralis to get a free node and deploy on Ethereum or Avalanche. Please see [here](https://docs.moralis.io/speedy-nodes/connecting-to-rpc-nodes/connect-to-eth-node).

## Contract configuration

Set up your contract configuration with `setup.json` located in `scripts` folder.

**Please make sure to complete setup.json before you run the deploy command**

```json
{
  "paymentToken": {
    "contractAddress": "",
    "decimals": 18
  },
  "projectToken": {
    "contractAddress": "",
    "decimals": 18
  },
  "withdrawFundsAddress": "",
  "vestingPercentage": 100,
  "pools": [
    {
      "poolId": 1,
      "openTime": "2022-01-01T00:00:00.000Z",
      "totalProjectToken": 1000,
      "paymentTokenAllocation": 100,
      "tokenPrice": 1,
      "tokensForPrice": 1
    }
  ]
}
```

### paymentToken

paymentToken is the stablecoin you wish to use for your fundraising. Fill the correct contract address and number of decimals this ERC20 contract supports.

### projectToken

projectToken is the token you wish to raise funds for. Fill the correct contract address and number of decimals this ERC20 contract supports.

If the token does not exist yet, you can simply put `0x0000000000000000000000000000000000000000` address and use the same number of decimals as paymentToken

### withdrawFundsAddress

Should be the address where funds are sent after the fundraising.

For security purpose, we are not sending funds to the owner. If the private key of the owner get comprised, funds will be safe. Of course, we recommend to use a different address than the owner address.

### vestingPercentage

vestingPercentage is use to calculate the amount of tokens bought the buyer is allow to receive after the fundraising through the `redeem` feature.

For example, let's say vestingPercentage = 20%.

If the token price is 1$ and the buyer fund 100 dollars worth of tokens, he will redeem 20 tokens.
Put "100" if the buyer can receive all of his tokens.

### Pools

#### poolId

must be the unique identifier of your pool.

#### openTime

must be the time when open the pool. it should be using the DateTime Format. (YYY-MM-DDTHH:mm:ss.sssZ)

#### totalProjectToken

must be the number of tokens available to purchase.

**Do not take in consideration the vesting. The full purchasable amount must be indicate**

#### tokenPrice

If tokenPrice is 0.01$, then token price should be 1

#### tokenForPrice

If tokenPrice is 0.01$, then tokensForPrice should be 100. (1 / 100 = 0.01$)

## Deploy your contract

```javascript
// Binance Smart chain
// mainnet
npm run deploy:bsc:mainnet
// testnet
npm run deploy:bsc:testnet

// ETHEREUM
// mainnet
npm run deploy:eth:mainnet
// testnet
npm run deploy:eth:testnet

// Avalanche
// mainnet
npm run deploy:avax:mainnet
// testnet
npm run deploy:avax:testnet

// Polygon
// mainnet
npm run deploy:matic:mainnet
// testnet
npm run deploy:matic:testnet
```

## Whitelist

This fundraising contract works with a whitelist, your users must be on the whitelist to access the fundraising.

You must be calling the `whitelistAddresses` from your favorite UI (Defender, Remix, ..) or custom script.

```solidity
function whitelistAddresses(
   address[] memory _addrs,
   uint8 _tickets,
   uint8 _poolId
) external onlyOwner
```

Example:

```solidity
whitelistAddresses(['0x70A78123250635DD66b081D029B5e65F8c5EDB42'], 1, 1);
```

The number of tickets will be multiply by the `paymentTokenAllocation` and the result will be the maximum allocation the user can fund.

This contract has a `multiple buy feature`, meaning the user can send multiple `buy` transactions until he reaches his max allocation.

## Tests

```shell
npm run test
```

## Etherscan verification

Make sure to enter your Etherscan API key in your `.env` file

copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network bscMainnet DEPLOYED_CONTRACT_ADDRESS
```

## Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).
