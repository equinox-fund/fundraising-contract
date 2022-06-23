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

describe("Tests Buyer.sol", () => {
  let contract: Contract;
  let projectTokenContract: Contract;
  let paymentTokenContract: Contract;

  const poolId = 1;
  const withdrawFundsAddress = "0x70A78123250635DD66b081D029B5e65F8c5EDB42";

  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;
  let addr4: SignerWithAddress;

  // deploy contract and add pool
  before(async () => {
    const Contract = await ethers.getContractFactory("Contract");
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

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

  describe("BUY", () => {
    it("should not be able to buy because does not have funds", () => {});
    it("should not be able to buy because didnt give allowance for transfer", () => {});
  });
});
