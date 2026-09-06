export const missions = [
  { name: 'First Light', description: 'Learn to allocate qubits and scan a junction.', junctions: 3, maxChoices: 4 },
  { name: 'The Silent Wing', description: 'More branches. A safe corridor may be a dead end.', junctions: 4, maxChoices: 5 },
  { name: 'Eight-Way Junction', description: 'Up to eight corridors. Watch for unused states.', junctions: 5, maxChoices: 8 },
  { name: 'Interference Lab', description: 'Experiment with different numbers of safe paths.', junctions: 6, maxChoices: 8 },
  { name: 'Final Passage', description: 'Find your way out with a carefully built circuit.', junctions: 7, maxChoices: 8 },
];
const shuffle = (items, random) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
// Randomness here builds the classical map only; never samples quantum outcomes.
export function createMaze(mission, random = Math.random) {
  const nodes = {};
  for (let depth = 0; depth < mission.junctions; depth++) {
    const id = `j${depth}`;
    const count = 2 + Math.floor(random() * (mission.maxChoices - 1));
    const exits = [depth === mission.junctions - 1 ? 'exit' : `j${depth + 1}`];
    for (let i = 1; i < count; i++) {
      const leaf = `${id}-${i}`;
      nodes[leaf] = { id: leaf, type: i === 1 ? 'bomb' : random() < .5 ? 'bomb' : 'deadend', parent: id, depth, branch: i };
      exits.push(leaf);
    }
    nodes[id] = { id, type: 'junction', depth, parent: depth ? `j${depth - 1}` : null, exits: shuffle(exits, random) };
  }
  nodes.exit = { id: 'exit', type: 'exit', depth: mission.junctions, parent: `j${mission.junctions - 1}` };
  // Lay out all exits using the same rules: geometry must not reveal which one
  // continues toward the destination. Reserve distinct grid cells for rooms.
  const occupied = new Set(['0,0']);
  nodes.j0.position = [0,0];
  for (let depth = 0; depth < mission.junctions; depth++) {
    const node = nodes[`j${depth}`];
    const [x,y] = node.position;
    for (const id of node.exits) {
      let placed = false;
      for (let radius = 1; !placed; radius++) {
        const offsets = shuffle([[0,-radius],[radius,-radius],[radius,0],[radius,radius],[0,radius],[-radius,radius],[-radius,0],[-radius,-radius]], random);
        for (const [dx,dy] of offsets) {
          const key = `${x+dx},${y+dy}`;
          if (!occupied.has(key)) { occupied.add(key); nodes[id].position = [x+dx,y+dy]; placed = true; break; }
        }
      }
    }
  }
  return { nodes, start: 'j0' };
}
export const safeChoices = (maze, id) => maze.nodes[id].exits.flatMap((next, index) => maze.nodes[next].type !== 'bomb' ? [index] : []);
