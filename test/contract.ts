import { expect } from "chai";
import { ethers } from "hardhat";

describe("Tests Contract.sol", () => {
  it("Should fail if address 0x0 are provided", async () => {
    const Contract = await ethers.getContractFactory("Contract");

    const paymentToken = "0x0000000000000000000000000000000000000000";
    const projectToken = "0x0000000000000000000000000000000000000000";
    const withdrawFundsAddress = "0x0000000000000000000000000000000000000000";
    const vestingRatioPercentage = 0;

    const contract = Contract.deploy(
      paymentToken,
      projectToken,
      withdrawFundsAddress,
      vestingRatioPercentage
    );

    await expect(contract).to.be.revertedWith("Cannot set address 0x0");
  });

  it("Should be able to deploy and set initial values", async () => {
    const Contract = await ethers.getContractFactory("Contract");

    const paymentToken = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
    const projectToken = "0x0000000000000000000000000000000000000000";
    const withdrawFundsAddress = "0x70A78123250635DD66b081D029B5e65F8c5EDB42";
    const vestingRatioPercentage = 20;

    const contract = await Contract.deploy(
      paymentToken,
      projectToken,
      withdrawFundsAddress,
      vestingRatioPercentage
    );

    expect(await contract.vestingRatioPercentage()).to.equals(20);
    expect(await contract.paymentToken()).to.equals(paymentToken);
  });

  it("Should be able to update projectToken and paymentToken", async () => {
    const Contract = await ethers.getContractFactory("Contract");

    const paymentToken = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
    const projectToken = "0x0000000000000000000000000000000000000000";
    const withdrawFundsAddress = "0x70A78123250635DD66b081D029B5e65F8c5EDB42";
    const vestingRatioPercentage = 20;

    const [owner] = await ethers.getSigners();

    const contract = await Contract.deploy(
      paymentToken,
      projectToken,
      withdrawFundsAddress,
      vestingRatioPercentage
    );

    const newPaymentToken = "0x567BBEF0efDF53355C569b7AeddE4C4f7c008014";
    const newProjectToken = "0x55d398326f99059fF775485246999027B3197955";

    await contract.connect(owner).setPaymentTokenAddress(newPaymentToken);
    await contract.connect(owner).setProjectTokenAddress(newProjectToken);

    expect(await contract.paymentToken()).to.equals(newPaymentToken);
    expect(await contract.projectToken()).to.equals(newProjectToken);
  });
});
