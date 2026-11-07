OPENQASM 3.0;
include "stdgates.inc";

// Lithium Hydride (LiH) Ground State VQE Ansatz
// Optimal bond length R = 1.595 Angstrom, theta = 0.226 rad
qubit[4] q;
bit[4] c;

// 1. Hartree-Fock Reference State |0011>
x q[0];
x q[1];

// 2. Pair Excitation Unitary (UCC Entangler)
cx q[0], q[2];
cx q[1], q[3];
ry(0.226) q[0];
ry(0.226) q[1];
cx q[0], q[2];
cx q[1], q[3];

// 3. Measurement in Computational Basis
c[0] = measure q[0];
c[1] = measure q[1];
c[2] = measure q[2];
c[3] = measure q[3];
