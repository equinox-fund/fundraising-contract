import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("Tests Contract.sol", () => {
  let contract: Contract;
  let owner: SignerWithAddress;

  it("Should not be able to deploy because using 0x0 addresses", async () => {
    const Contract = await ethers.getContractFactory("Contract");
    const paymentToken = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
    const projectToken = "0x0000000000000000000000000000000000000000";
    const withdrawFundsAddress = "0x0000000000000000000000000000000000000000";
    const vestingRatioPercentage = 20;

    const deploy = Contract.deploy(
      paymentToken,
      projectToken,
      withdrawFundsAddress,
      vestingRatioPercentage
    );

    expect(deploy).to.revertedWith("Can not use 0x0");
  });

  it("Should be able to deploy and set initial values", async () => {
    const Contract = await ethers.getContractFactory("Contract");

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

    expect(await contract.vestingRatioPercentage()).to.equals(20);
    expect(await contract.paymentToken()).to.equals(paymentToken);
    expect(await contract.projectToken()).to.equals(projectToken);
    expect(await contract.withdrawFundsAddress()).to.equals(
      withdrawFundsAddress
    );
  });

  it("Should be able to read pools", async () => {
    [owner] = await ethers.getSigners();
    // add pools
    await contract.connect(owner).initializePool(1, 0, 1, 1, 1, 1);

    const pools = await contract.getPools();
    expect(pools.length).to.equals(1);
  });
});
