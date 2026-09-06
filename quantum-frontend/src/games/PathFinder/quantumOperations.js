// Circuit construction only. Quantum evolution and sampling belong to /simulate.
export const minimumQubits = (choices) => Math.max(1, Math.ceil(Math.log2(choices)));
export const bits = (value, n) => value.toString(2).padStart(n, '0');
export const allGates = (n, gate) => Array.from({ length: n }, (_, target) => ({ gate, target }));

// exp(i*pi*|11…1><11…1|), up to an irrelevant global phase.
// Expand the projector in Z-parity terms; compute each parity using CNOT,
// rotate it using RZ, then uncompute. No ancillas or new API gates required.
export function phaseFlip(n, basis) {
  if (!Number.isInteger(n) || n < 1 || n > 4 || basis < 0 || basis >= 2 ** n) throw new Error('Invalid phase oracle input');
  const flips = [...bits(basis, n)].flatMap((bit, target) => bit === '0' ? [{ gate: 'X', target }] : []);
  const result = [...flips];
  for (let mask = 1; mask < 2 ** n; mask++) {
    const subset = Array.from({ length: n }, (_, q) => q).filter(q => mask & (1 << q));
    const target = subset.at(-1);
    const parity = subset.slice(0, -1).map(control => ({ gate: 'CNOT', control, target }));
    result.push(...parity, { gate: 'RZ', target, theta: (-1) ** (subset.length + 1) * Math.PI / 2 ** (n - 1) }, ...parity.toReversed());
  }
  return [...result, ...flips.toReversed()];
}
export const oracle = (n, safeIndices) => safeIndices.flatMap(index => phaseFlip(n, index));
// I - 2|s><s| differs from standard Grover diffusion only by global phase.
export const diffusion = n => [...allGates(n, 'H'), ...phaseFlip(n, 0), ...allGates(n, 'H')];
export function measuredIndex(result, n) {
  const values = Array.from({ length: n }, (_, q) => result.measurements?.find(m => m.qubit === q)?.value);
  if (values.some(value => value !== 0 && value !== 1)) throw new Error('The simulator did not return a measurement for every qubit.');
  return parseInt(values.join(''), 2);
}
export function validateResult(result, n) {
  if (!result?.states || !result?.amplitudes) throw new Error('The simulator response is missing its quantum state.');
  let total = 0;
  for (let i = 0; i < 2 ** n; i++) {
    const state = bits(i, n), p = result.states[state], a = result.amplitudes[state];
    if (!Number.isFinite(p) || p < -1e-8 || !a || !Number.isFinite(a.real) || !Number.isFinite(a.imag)) throw new Error('The simulator returned an invalid quantum state.');
    total += p;
  }
  if (Math.abs(total - 1) > 1e-5) throw new Error('The simulator returned an unnormalized state.');
  return result;
}
