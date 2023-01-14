import { directoryPath } from './src/config.js';
import { symbols } from '../symbols.js'; 
import { Vertex } from './src/Vertex.js';
import {
  initializeFullyConnectedGraph,
  buildCorrelationDictionary,
  discoverIslands,
  pruneNodes
} from './src/Graph-Helpers.js';

const correlations = await buildCorrelationDictionary(symbols, directoryPath);

// Start constructing the graph.
const nodes = symbols.map(s => new Vertex(s));
const getEdgeWeight = (v1, v2) => correlations.get(v1.Value, v2.Value);
const graph = initializeFullyConnectedGraph(nodes, getEdgeWeight);


// First island of 3 is O, APD, DIS.

// If I ran until there were only 3 items left...
// These symbols have extremely high correlations, so this makes sense.

// Can remove nodes if they violate some criteria.
// For example, if price is outside of a certain range.
// const removalPredicate = vertex => vertex.Value[0] === 'A';
// const prunedGraph = pruneNodes(graph, removalPredicate);
// prunedGraph.forEach(v => console.log(v.Value));


// TODO: Get some more data using the S&P 500 list and try
// to understand if the results make any sense.
// TODO: After completing the above, come up with plan for backtesting.
let islands = discoverIslands(3, graph);
console.log('The islands are:');
islands.forEach(v => console.log(v.Value));

// Re-apply the original edges
// const nodesCopy = symbols.map(s => new Vertex(s));
islands = initializeFullyConnectedGraph(islands, getEdgeWeight);

console.log('End');
