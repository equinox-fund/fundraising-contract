import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { toBigNumber } from "./helpers";

/**
 * Please note:
 * For the purpose of the test,
 * we assume the paymentToken and projectToken are both 18 decimals ERC20
 *
 */

describe("Tests Vault.sol", () => {
  let contract: Contract;
  let projectTokenContract: Contract;
  let paymentTokenContract: Contract;

  const withdrawFundsAddress = "0x70A78123250635DD66b081D029B5e65F8c5EDB42";

  let owner: SignerWithAddress;

  // deploy contract and add pool
  before(async () => {
    const Contract = await ethers.getContractFactory("Contract");
    [owner] = await ethers.getSigners();

    // deploy project token contract
    const projectTokenContractFactory = await ethers.getContractFactory(
      "SampleERC20"
    );
    projectTokenContract = await projectTokenContractFactory.deploy();

    // deploy payment token contract
    const paymentTokenContractFactory = await ethers.getContractFactory(
      "SampleERC20"
    );
    paymentTokenContract = await paymentTokenContractFactory.deploy();

    const paymentToken = paymentTokenContract.address;
    const projectToken = projectTokenContract.address;
    const vestingRatioPercentage = 20;

    contract = await Contract.deploy(
      paymentToken,
      projectToken,
      withdrawFundsAddress,
      vestingRatioPercentage
    );

    // send tokens
    await paymentTokenContract.mintToWallet(
      contract.address,
      toBigNumber(1000)
    );
    await projectTokenContract.mintToWallet(
      contract.address,
      toBigNumber(1000)
    );
  });

  describe("Withdraw", () => {
    it("should be able to withdraw project tokens", async () => {
      const withdraw = contract.connect(owner).withdrawProjectTokens();

      await expect(withdraw)
        .to.be.emit(contract, "WithdrawnProjectToken")
        .withArgs(toBigNumber(1000));
    });
    it("should be able to withdraw payment tokens", async () => {
      const withdraw = contract.connect(owner).withdrawPaymentTokens();

      await expect(withdraw)
        .to.be.emit(contract, "WithdrawnPaymentToken")
        .withArgs(toBigNumber(1000));

      const balance = await paymentTokenContract.balanceOf(
        withdrawFundsAddress
      );

      expect(balance).to.be.equals(toBigNumber(1000));
    });
  });
});
