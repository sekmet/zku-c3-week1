const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("RangeProof with PLONK", function () {
    let Verifier3p;
    let verifier3p;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier3p = await ethers.getContractFactory("RangeProofVerifierPlonk");
        verifier3p = await Verifier3p.deploy();
        await verifier3p.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.prove("contracts/circuits/RangeProof_plonk/circuit_final.zkey","contracts/circuits/RangeProof_plonk/witness.wtns");

        console.log('in range = ',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
    
        //const a3public = [calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString())[1]];
        const a3proof = calldata.split(',')[0];

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        const a3public = [argv[1]];
        console.log(argv);

        expect(await verifier3p.verifyProof(a3proof, a3public)).to.be.true;

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a3p = [0, 0];
        let b3p = [[0, 0], [0, 0]];
        let c3p = [0, 0];
        let d3p = [0]
        expect(await verifier3p.verifyProof(a3p, c3p)).to.be.false;
    });
});