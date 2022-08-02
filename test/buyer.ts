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

describe("Tests Buyer.sol", () => {
  let contract: Contract;
  let projectTokenContract: Contract;
  let paymentTokenContract: Contract;

  const poolId = 1;
  const withdrawFundsAddress = "0x70A78123250635DD66b081D029B5e65F8c5EDB42";

  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  // let addr2: SignerWithAddress;
  // let addr3: SignerWithAddress;
  // let addr4: SignerWithAddress;

  // deploy contract and add pool
  before(async () => {
    const Contract = await ethers.getContractFactory("Contract");
    [owner, addr1] = await ethers.getSigners();

    // deploy project token contract
    const projectTokenContractFactory = await ethers.getContractFactory(
      "SampleERC20"
    );
    projectTokenContract = await projectTokenContractFactory.deploy(18);

    // deploy payment token contract
    const paymentTokenContractFactory = await ethers.getContractFactory(
      "SampleERC20"
    );
    paymentTokenContract = await paymentTokenContractFactory.deploy(18);

    const paymentToken = paymentTokenContract.address;
    const projectToken = projectTokenContract.address;
    const vestingRatioPercentage = 20;

    contract = await Contract.deploy(
      paymentToken,
      projectToken,
      withdrawFundsAddress,
      vestingRatioPercentage
    );

    // now
    const startTime = dayjs().unix();
    // 100 dollars
    const paymentTokenAllocation = toBigNumber(100);
    // 5000 tokens
    // we are putting 5000 tokens only
    const totalProjectToken = toBigNumber(5000);
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
  });

  describe("BUY", () => {
    it("should not be able to buy because sending 0 as allocation", async () => {
      // whitelist user1 in pool 1 with two tickets
      await contract
        .connect(owner)
        .whitelistAddresses([addr1.address], 2, poolId);

      const buying = contract.connect(addr1).buy(0, poolId);
      await expect(buying).to.be.revertedWith("Incorrect Allocation");
    });

    it("should not be able to buy because does not have funds", async () => {
      // 100 dollars
      const allocation = toBigNumber(100);
      const buying = contract.connect(addr1).buy(allocation, poolId);

      await expect(buying).to.be.revertedWith("Insufficient balance");
    });

    it("should not be able to buy because didnt give allowance for transfer", async () => {
      // send some funds to the user
      await paymentTokenContract
        .connect(owner)
        .mintToWallet(addr1.address, toBigNumber(1000));

      // 100 dollars
      const allocation = toBigNumber(100);
      const buying = contract.connect(addr1).buy(allocation, poolId);

      await expect(buying).to.be.revertedWith("You must approve transfer");
    });

    it("should not be able to buy because allocaton > maxAllocation", async () => {
      // giving 1000$ allowance
      await paymentTokenContract
        .connect(addr1)
        .approve(contract.address, toBigNumber(1000));
      // 1000 dollars
      const allocation = toBigNumber(1000);
      const buying = contract.connect(addr1).buy(allocation, poolId);

      await expect(buying).to.be.revertedWith("Max allocation excedeed");
    });

    it("should be able to buy", async () => {
      // 100 dollars
      const allocation = toBigNumber(100);
      const buying = contract.connect(addr1).buy(allocation, poolId);

      /**
       * 100 dollars of allocation will give
       * 100 / 0.02 = 5000 tokens
       * BUT there is 20% vesting, you will receive only 1000 tokens for release
       * (100 / 0.02) * 0.20 = 1000 tokens
       */

      /**
       *  event Bought(
          address indexed user,
          uint8 poolId,
          uint256 allocation,
          uint256 tokensBought,
          uint256 tokensRedeemable
        );
       */

      await expect(buying)
        .to.emit(contract, "Bought")
        .withArgs(
          addr1.address,
          poolId,
          allocation,
          toBigNumber(5000),
          toBigNumber(1000)
        );
    });

    it("should not be able to buy anymore because no tokens in pool", async () => {
      // 100 dollars
      const allocation = toBigNumber(100);
      const buying = contract.connect(addr1).buy(allocation, poolId);

      await expect(buying).to.be.revertedWith("Pool soldout");
    });

    it("pool should be updated correctly", async () => {
      const pool = await contract.pools(poolId);

      // we raise 100 dollars
      expect(pool.totalPaymentTokenRaised).to.be.equals(toBigNumber(100));
      // we sold 5000 tokens
      expect(pool.totalProjectTokenSold).to.be.equals(toBigNumber(5000));
      // unsold tokens 0
      expect(pool.totalProjectTokenUnsold).to.be.equals("0");
    });

    it("buyer profile should be correct", async () => {
      const buyerProfile = await contract.getBuyerProfile(addr1.address);

      const profilePool = buyerProfile[0];
      expect(profilePool.poolId).to.be.equals(poolId);
      // he had two tickets
      expect(profilePool.maxAllocation).to.be.equals(toBigNumber(200));
      // he spent 100
      expect(profilePool.allocation).to.be.equals(toBigNumber(100));
      // he bought 5000 tokens
      expect(profilePool.tokensBought).to.be.equals(toBigNumber(5000));
      // he can redeem 1000
      expect(profilePool.tokensRedeemable).to.be.equals(toBigNumber(1000));
      // he has not redeemed yet
      expect(profilePool.redeemed).to.be.equals(false);
    });
  });

  describe("REDEEM", () => {
    it("should not be able to redeem because pool is still open nor allow for redeem", async () => {
      const redeem = contract.connect(addr1).redeem(poolId);

      await expect(redeem).to.be.revertedWith("You're not allowed to redeem");
    });

    it("should be able to redeem because no tokens", async () => {
      // close pool and allow redeem
      await contract.connect(owner).closePool(poolId);
      await contract.connect(owner).allowPoolRedeem(poolId);

      const redeem = contract.connect(addr1).redeem(poolId);

      await expect(redeem).to.be.revertedWith("Insufficient tokens");
    });

    it("should be able to redeem", async () => {
      // send some tokens
      await projectTokenContract
        .connect(owner)
        .mintToWallet(contract.address, toBigNumber(10000));

      const redeem = contract.connect(addr1).redeem(poolId);

      /**
       * 
        event Redeemed(
            address indexed user,
            uint8 poolId,
            uint256 tokensRedeemable
        );
       */

      await expect(redeem)
        .to.emit(contract, "Redeemed")
        .withArgs(addr1.address, poolId, toBigNumber(1000));

      // check balance
      const balance = await projectTokenContract.balanceOf(addr1.address);
      expect(balance).to.be.equals(toBigNumber(1000));

      // check buyer
      const buyer = await contract.buyers(poolId, addr1.address);
      expect(buyer.redeemed).to.be.equals(true);
      // because he redeemed
      expect(buyer.tokensRedeemable).to.be.equals(0);
    });
  });
});
