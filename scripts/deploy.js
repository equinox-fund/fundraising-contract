const dayjs = require("dayjs");
const { ethers } = require("hardhat");
const setup = require("./setup.json");
/**
 * Please make sure to complete setup.json before you run the deploy command
 *
 * == paymentToken ==
 * is the stablecoin you wish to use for your fundraising. Fill the correct contractAddress and number of decimals
 *
 * == projectToken ==
 * is the token you wish to raise funds for. Fill the correct contractAddress and number of decimals.
 * If the token does not exist yet, you can simply put 0x0000000000000000000000000000000000000000 address and use the same number of decimals as paymentToken
 *
 * == withdrawFundsAddress ==
 * should be the address where funds are sent after the fundraising
 *
 * == vestingPercentage ==
 * use to calculate the amount of tokens bought the buyer is allow to receive after the fundraising, usually called "TGE".
 * For example, let's say vestingPercentage = 20%.
 * If the token price is 1$ and the buyer buy 100 dollars worth of tokens, he will be able to receive 20 tokens immediately after the fundraising.
 * Put "100" if the buyer can receive all of his tokens.
 *
 * == pools ==
 * Array of pools.
 * - poolId must be the unique identifier of your pool.
 * - openTime must be the time when open the pool. it should be using the DateTime Format. (YYY-MM-DDTHH:mm:ss.sssZ)
 * - totalProjectToken must be the number of tokens available to purchase. Please note it does not take in consideration the vesting percentage.
 * - tokenPrice. If tokenPrice is 0.01, then token price should be 1
 * - tokenForPrice If tokenPrice is 0.01, then tokensForPrice should be 100. (1 / 100 = 0.01)
 */

async function main() {
  const {
    withdrawFundsAddress,
    vestingPercentage,
    projectToken,
    paymentToken,
    pools,
  } = setup;

  // We get the contract to deploy
  const Contract = await ethers.getContractFactory("Contract");
  const contract = await Contract.deploy(
    paymentToken.contractAddress,
    projectToken.contractAddress,
    vestingPercentage.toString(),
    withdrawFundsAddress
  );

  await contract.deployed();

  console.log("Contract deployed to: ", contract.address);
  console.log("Adding pools... Please wait.");

  for await (const pool of pools) {
    console.log("================================");
    const {
      poolId,
      openTime,
      paymentTokenAllocation,
      totalProjectToken,
      tokenPrice,
      tokensForPrice,
    } = pool;

    console.log(`Adding pool ${poolId}.`);
    console.log(`Token price ${tokenPrice / tokensForPrice}$`);
    const unixOpenTime = dayjs(openTime).unix();

    // convert to BIG number according to the number of decimals of PaymentToken
    const _paymentTokenAllocation = ethers.utils.parseUnits(
      paymentTokenAllocation.toString(),
      paymentToken.decimals
    );

    // convert to BIG number according to the number of decimals of ProjectToken
    const _totalProjectToken = ethers.utils.parseUnits(
      totalProjectToken.toString(),
      projectToken.decimals
    );

    const _tokenPrice = tokenPrice.toString();

    // decimals difference
    const decimalsDiff =
      paymentToken.decimals >= projectToken.decimals
        ? paymentToken.decimals - projectToken.decimals
        : projectToken.decimals - paymentToken.decimals;

    // tokens for price
    const _tokensForPrice = (tokensForPrice * 10 ** decimalsDiff).toString();

    await contract.initializePool(
      poolId,
      unixOpenTime,
      _paymentTokenAllocation,
      _totalProjectToken,
      _tokenPrice,
      _tokensForPrice
    );
    console.log(`Pool ${poolId} successfully added`);
  }

  console.log("Contract successfully configured");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
