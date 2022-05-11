pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
// hint: you can use more than one templates in circomlib-matrix to help you
include "../../node_modules/circomlib-matrix/circuits/matAdd.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemMul.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemSum.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemPow.circom";
include "../../node_modules/circomlib-matrix/circuits/power.circom";

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here
    // Ax = b where
    // A is the 3x3 matrix of x, y and z coefficients
    // x is x, y and z, and
    // b is 51, 106 and 32

    // x + y + z = 51
    // x + 2y + 3z = 106
    // 2x - y + z = 32

    // 1  1  1  =  51
    // 1  2  3  =  106
    // 2 -1  1  =  32

    //x[n] = A[n][n]^-1 * b[n]
    // pow[i][j] = power(p);
    // pow[i][j].a <== a[i][j];
    // out[i][j] <== pow[i][j].out;

    //component pow = matElemPow(3,3,2);
    component mul = matElemMul(3,3);

    for (var i=0; i<n; i++) {
        for (var j=0; j<n; j++) {
            mul.a[i][j] <== j;//A[i][j]^(-1);
            mul.b[i][j] <== b[i];            
        }
    }

    for (var i=0; i<n; i++) {
        for (var j=0; j<n; j++) {
            mul.out[i][j] === 0;
            //x[i] <== mul.out[i][j];
        }
    }


}

component main {public [A, b]} = SystemOfEquations(3);