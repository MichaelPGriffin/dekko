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

const islands = discoverIslands(3, graph);
console.log('The islands are:');
islands.forEach(v => console.log(v.Value));

console.log('End');
