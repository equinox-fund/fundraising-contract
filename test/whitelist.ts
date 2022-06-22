import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import dayjs from "dayjs";
import { toBigNumber } from "./helpers";

/**
 * Please note:
 * For the purpose of the test,
 * we assume the paymentToken and projectToken are both 18 decimals ERC20
 *
 */

describe("Tests Whitelist.sol", () => {
  let contract: Contract;
  const poolId = 1;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;
  let addr4: SignerWithAddress;

  // deploy contract and add pool
  before(async () => {
    const Contract = await ethers.getContractFactory("Contract");
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    const paymentToken = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
    const projectToken = "0x0000000000000000000000000000000000000000";
    const withdrawFundsAddress = "0x70A78123250635DD66b081D029B5e65F8c5EDB42";
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
  });

  describe("Whitelist", () => {
    it("Should whitelist 3 addresses with 2 tickets each", async () => {
      const addresses = [addr1.address, addr2.address, addr3.address];
      const tickets = 2;

      await contract
        .connect(owner)
        .whitelistAddresses(addresses, tickets, poolId);

      expect(await contract.whitelist(poolId, addr1.address)).to.equals(2);
      expect(await contract.whitelist(poolId, addr2.address)).to.equals(2);
      expect(await contract.whitelist(poolId, addr3.address)).to.equals(2);
    });

    it("Should whitelist 1 existing address and top-up tickets", async () => {
      await contract
        .connect(owner)
        .whitelistAddresses([addr1.address], 2, poolId);

      expect(await contract.whitelist(poolId, addr1.address)).to.equals(4);
    });
  });

  describe("Can Access", () => {
    it("Should not be able to access because no tickets", async () => {
      const canAccess = await contract.canAccess(addr4.address, poolId);

      expect(canAccess).to.equals(false);
    });

    it("Should be able to access because owns tickets", async () => {
      const canAccess = await contract.canAccess(addr1.address, poolId);

      expect(canAccess).to.equals(true);
    });
  });
});
