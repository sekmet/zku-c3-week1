const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/

const verifierRegex = /contract Verifier/

let content3p = fs.readFileSync("./contracts/RangeProofVerifierPlonk.sol", { encoding: 'utf-8' });
let bumped3p = content3p.replace(solidityRegex, 'pragma solidity ^0.8.0');
bumped3p = bumped3p.replace(/contract PlonkVerifier/, 'contract RangeProofVerifierPlonk');

fs.writeFileSync("./contracts/RangeProofVerifierPlonk.sol", bumped3p);

let content = fs.readFileSync("./contracts/SystemOfEquationsVerifier.sol", { encoding: 'utf-8' });
let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
bumped = bumped.replace(verifierRegex, 'contract SystemOfEquationsVerifier');

fs.writeFileSync("./contracts/SystemOfEquationsVerifier.sol", bumped);