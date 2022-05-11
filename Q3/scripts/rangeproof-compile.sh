#!/bin/bash

cd contracts/circuits

rm -fr RangeProof_plonk

mkdir RangeProof_plonk

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling RangeProof.circom with plonk..."

# compile circuit

circom RangeProof.circom --r1cs --wasm --sym -o RangeProof_plonk
snarkjs r1cs info RangeProof_plonk/RangeProof.r1cs

# Start a new zkey

snarkjs plonk setup RangeProof_plonk/RangeProof.r1cs powersOfTau28_hez_final_10.ptau RangeProof_plonk/circuit_final.zkey
snarkjs zkey export verificationkey RangeProof_plonk/circuit_final.zkey RangeProof_plonk/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier RangeProof_plonk/circuit_final.zkey ../RangeProofVerifierPlonk.sol

node ../../scripts/bonus-bump-solidity.js

# computing the witness
echo '{"in":"8", "range":["0","9"]}' > RangeProof_plonk/input.json
node RangeProof_plonk/RangeProof_js/generate_witness.js RangeProof_plonk/RangeProof_js/RangeProof.wasm RangeProof_plonk/input.json RangeProof_plonk/witness.wtns

# prove the circuit
snarkjs plonk prove RangeProof_plonk/circuit_final.zkey RangeProof_plonk/witness.wtns RangeProof_plonk/proof.json RangeProof_plonk/public.json

# verify the proof
snarkjs plonk verify RangeProof_plonk/verification_key.json RangeProof_plonk/public.json RangeProof_plonk/proof.json

cd ../..