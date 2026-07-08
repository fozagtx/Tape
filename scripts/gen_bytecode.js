// Regenerates lib/bytecode.ts from contracts/TapeOrderBook.sol using the
// local solc npm package (0.8.26, satisfies pragma ^0.8.20). No network needed.
//   node scripts/gen_bytecode.js
const solc = require("solc");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(root, "contracts/TapeOrderBook.sol"), "utf8");

const input = {
  language: "Solidity",
  sources: { "TapeOrderBook.sol": { content: src } },
  settings: {
    outputSelection: {
      "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] },
    },
  },
};

const out = JSON.parse(solc.compile(JSON.stringify(input)));
if (out.errors) {
  for (const e of out.errors) console.error(e.formattedMessage);
  if (out.errors.some((e) => e.severity === "error")) process.exit(1);
}

const c = out.contracts["TapeOrderBook.sol"]["TapeOrderBook"];
const bytecode = "0x" + c.evm.bytecode.object;

const file =
  "// AUTO-GENERATED: real compiled creation bytecode of TapeOrderBook.sol\n" +
  "// Compiled with solc 0.8.26 (satisfies pragma ^0.8.20). Regenerate via scripts/gen_bytecode.js\n" +
  "// This is the ACTUAL order-book contract — not a stub. Used by the in-browser Deploy button.\n" +
  `export const TAPE_BYTECODE = "${bytecode}";\n`;

fs.writeFileSync(path.join(root, "lib/bytecode.ts"), file);
console.log("wrote lib/bytecode.ts —", (bytecode.length - 2) / 2, "bytes of creation bytecode");
