import { BigNumber } from "ethers";

const toBigNumber = (number: number, decimals = 18): string => {
  return BigNumber.from(number)
    .mul(BigNumber.from(10).pow(decimals))
    .toString();
};

export { toBigNumber };
