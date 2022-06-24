import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import dayjs from "dayjs";
// eslint-disable-next-line node/no-missing-import
import { toBigNumber } from "./helpers";

/**
 * Please note:
 * For the purpose of the test,
 * we assume the paymentToken and projectToken are both 18 decimals ERC20
 *
 */

describe("Tests Pool.sol", () => {
  let contract: Contract;
  let sampleERC20: Contract;
  let owner: SignerWithAddress;

  // deploy contract
  before(async () => {
    // we need set a token address and deploy a ERC20 sample
    // deploy, assuming 18 decimals
    const factory = await ethers.getContractFactory("SampleERC20");
    sampleERC20 = await factory.deploy(18);

    const Contract = await ethers.getContractFactory("Contract");
    [owner] = await ethers.getSigners();
    const paymentToken = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
    const projectToken = sampleERC20.address;
    const withdrawFundsAddress = "0x70A78123250635DD66b081D029B5e65F8c5EDB42";
    const vestingRatioPercentage = 20;

    contract = await Contract.deploy(
      paymentToken,
      projectToken,
      withdrawFundsAddress,
      vestingRatioPercentage
    );

    // mint 10000 to the contract
    await sampleERC20.mintToWallet(contract.address, toBigNumber(10000));
  });

  describe("Initialization", () => {
    it("Should initialize a pool", async () => {
      const poolId = 1;
      // now
      const startTime = dayjs().unix();
      // 100 dollars
      const paymentTokenAllocation = toBigNumber(100);
      // 10000 tokens
      const totalProjectToken = toBigNumber(10000);
      // lets say the token cost 0.02 cent
      // solidity not support decimals, we set 2 as token price
      const projectTokenPrice = toBigNumber(2);
      // 2 / 100 = 0.02
      const projectTokenForPrice = toBigNumber(100);

      await contract
        .connect(owner)
        .initializePool(
          poolId,
          startTime,
          paymentTokenAllocation,
          totalProjectToken,
          projectTokenPrice,
          projectTokenForPrice
        );

      const pool = await contract.pools(poolId);

      expect(pool.startTime).to.equals(startTime);
    });

    it("Should not initialize a pool because already initialized", async () => {
      const poolId = 1;

      const initialize = contract
        .connect(owner)
        .initializePool(poolId, 0, 0, 0, 0, 0);

      await expect(initialize).to.be.revertedWith("Pool already initialized");
    });
  });

  describe("Pausing", () => {
    it("Should not be able to unpause pool", async () => {
      const poolId = 1;

      const unpausing = contract.connect(owner).unPausePool(poolId);
      await expect(unpausing).to.be.revertedWith("Pool not paused");
    });

    it("Should be able to pause pool and then unpause", async () => {
      const poolId = 1;

      await contract.connect(owner).pausePool(poolId);
      expect((await contract.pools(poolId)).paused).to.equals(true);
      await contract.connect(owner).unPausePool(poolId);
      expect((await contract.pools(poolId)).paused).to.equals(false);
    });
  });

  describe("Closing", () => {
    it("Should be able to close pool", async () => {
      const poolId = 1;

      await contract.connect(owner).closePool(poolId);
      expect((await contract.pools(poolId)).closed).to.equals(true);
    });
  });

  describe("Allow Redeem", () => {
    it("Should be able to allow redeem", async () => {
      const poolId = 1;

      await contract.connect(owner).allowPoolRedeem(poolId);
      expect((await contract.pools(poolId)).canRedeem).to.equals(true);
    });
  });
});
