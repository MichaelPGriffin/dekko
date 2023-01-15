import { directoryPath } from './src/config.js';
import { symbols } from '../symbols.js'; 
import { Vertex } from './src/Vertex.js';
import {
  initializeFullyConnectedGraph,
  buildCorrelationDictionary,
  discoverIslands
} from './src/Graph-Helpers.js';

const correlations = await buildCorrelationDictionary(symbols, directoryPath);

// Start constructing the graph.
const nodes = symbols.map(s => new Vertex(s));
const getEdgeWeight = (v1, v2) => correlations.get(v1.Value, v2.Value);
const graph = initializeFullyConnectedGraph(nodes, getEdgeWeight);

const targetIslandCount = process.argv.slice(2)[0];

if (!targetIslandCount || Number.isNaN(targetIslandCount) || targetIslandCount < 2) {
  const messageText =  `Invalid count parameter value ${targetIslandCount}.\n` +
    'Must be equal to 2 or greater';
  throw new Error(messageText);
}

const islands = discoverIslands(targetIslandCount, graph);
console.log('The islands are:');
islands.forEach(v => console.log(v.Value));

console.log();
