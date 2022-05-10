const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

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

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        const { proof, publicSignals } = await groth16.fullProve({"a":"36","b":"3"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        console.log('36x3 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    let Verifier3;
    let verifier3;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier3 = await ethers.getContractFactory("Multiplier3Verifier");
        verifier3 = await Verifier3.deploy();
        await verifier3.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a":"396","b":"3","c":"9"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");

        console.log('396x3x9 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        const a3 = [argv[0], argv[1]];
        const b3 = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c3 = [argv[6], argv[7]];
        const Input3 = argv.slice(8);

        expect(await verifier3.verifyProof(a3, b3, c3, Input3)).to.be.true;

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a3 = [0, 0];
        let b3 = [[0, 0], [0, 0]];
        let c3 = [0, 0];
        let d3 = [0]
        expect(await verifier3.verifyProof(a3, b3, c3, d3)).to.be.false;

    });
});


describe("Multiplier3 with PLONK", function () {
    let Verifier3p;
    let verifier3p;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier3p = await ethers.getContractFactory("Multiplier3VerifierPlonk");
        verifier3p = await Verifier3p.deploy();
        await verifier3p.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.prove("contracts/circuits/Multiplier3_plonk/circuit_final.zkey","contracts/circuits/Multiplier3_plonk/witness.wtns");

        console.log('139x6x9 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
    
        const a3public = [calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString())[1]];
        const a3proof = calldata.split(',')[0];

        expect(await verifier3p.verifyProof(a3proof, a3public)).to.be.true;

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a3p = [0, 0];
        let b3p = [[0, 0], [0, 0]];
        let c3p = [0, 0];
        let d3p = [0]
        expect(await verifier3p.verifyProof(a3p, c3p,)).to.be.false;
    });
});