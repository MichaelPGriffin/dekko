import { Edge } from './src/Edge.js';
import { Vertex } from './src/Vertex.js';
import { countNeighbors,
  traverseGraph,
  discoverIslands } from './src/Graph-Helpers.js';

// Initially I tried writing a method to see if I could identify cliques.
// This is interesting stuff. But for my purposes, perhaps I could achieve
// this just by pruning out all of the edges that fall below a certain weight
// threshold.

// Build up a graph of nodes.
const zero = new Vertex(0);
const one = new Vertex(1);
const two = new Vertex(2);
const three = new Vertex(3);
const four = new Vertex(4);
const five = new Vertex(5);
const six = new Vertex(6);
const seven = new Vertex(7);

// All vertices.
const graph = [zero, one, two, three, four, five, six, seven];

// Establish a 3-clique.
zero.link(new Edge(one, 0));
zero.link(new Edge(two, 0));
one.link(new Edge(two, 0.5));

// Append some other nodes to the preceding.
two.link(new Edge(three, -0.004));
three.link(new Edge(four, -0.003));
four.link(new Edge(five, -0.2));
five.link(new Edge(six, 0.001));
five.link(new Edge(seven, 0.001));

// Inspect neighbors from initial setup.
traverseGraph(graph, countNeighbors);

// This prints the nodes that were the first to be
// unlinked with all of the others by iterative pruning.
// This is the heart of the algorithm.
const result = discoverIslands(3, graph);
console.log('result is:');
result.forEach(v => console.log(v));

console.log('end');
