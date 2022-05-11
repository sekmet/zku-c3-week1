#!/bin/bash

cd contracts/circuits

mkdir LessThan10_plonk

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling LessThen10.circom with plonk..."

# compile circuit

circom LessThan10.circom --r1cs --wasm --sym -o LessThan10_plonk
snarkjs r1cs info LessThan10_plonk/LessThan10.r1cs

# Start a new zkey

snarkjs plonk setup LessThan10_plonk/LessThan10.r1cs powersOfTau28_hez_final_10.ptau LessThan10_plonk/circuit_final.zkey
snarkjs zkey export verificationkey LessThan10_plonk/circuit_final.zkey LessThan10_plonk/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier LessThan10_plonk/circuit_final.zkey ../LessThan10VerifierPlonk.sol

# computing the witness
echo '{"in": 96}' > LessThan10_plonk/input.json
node LessThan10_plonk/LessThan10_js/generate_witness.js LessThan10_plonk/LessThan10_js/LessThan10.wasm LessThan10_plonk/input.json LessThan10_plonk/witness.wtns

# prove the circuit
snarkjs plonk prove LessThan10_plonk/circuit_final.zkey LessThan10_plonk/witness.wtns LessThan10_plonk/proof.json LessThan10_plonk/public.json

# verify the proof
snarkjs plonk verify LessThan10_plonk/verification_key.json LessThan10_plonk/public.json LessThan10_plonk/proof.json

cd ../..