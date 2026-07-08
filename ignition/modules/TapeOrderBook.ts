import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TapeOrderBookModule = buildModule("TapeOrderBook", (m) => {
  const book = m.contract("TapeOrderBook");
  return { book };
});

export default TapeOrderBookModule;
