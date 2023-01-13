import { Queue } from './Queue.js';
import { Edge } from './Edge.js';
import { DualKeyDictionary } from './DualKeyDictionary.js';
import { correlation } from './Statistics.js';
import { readFile } from 'fs';
import { promisify } from 'util';

export const resetNodeFlags = (nodes = []) => {
  nodes.forEach(n => {
    n.isVisited = false;
  });
};

export const visit = node => {
  console.log(node.Value);
};

export const sortSubgraphs = (vertexArray = []) => {
  const vertexComparer = (a, b) => {
    if (getNeighborCount(a) < getNeighborCount(b)) {
      return -1;
    }

    if (getNeighborCount(a) > getNeighborCount(b)) {
      return 1;
    }

    return a.Value < b.Value ? -1 : 1;
  };

  vertexArray.sort(vertexComparer);
};

export const breadthFirstTraversal = (rootNode, callback = visit) => {
  if (rootNode === null || rootNode.isVisited) {
    return;
  }

  const q = new Queue();
  let current = rootNode;
  q.enqueue(current);

  while (q.count() > 0) {
    current = q.dequeue();
    if (current.isVisited) {
      continue;
    } else {
      current.isVisited = true;
    }

    for (const neighbor of current.Edges.keys()) {
      if (!neighbor.isVisited) {
        q.enqueue(neighbor);
      }
    }

    callback(current);
  }
};

export const traverseGraph = (vertexArray = [], callback = visit) => {
  vertexArray.forEach(n => breadthFirstTraversal(n, callback));
  resetNodeFlags(vertexArray);
};

export const countNeighbors = vertex => {
  const count = vertex.Edges.size;
  const neighborWord = count === 1 ? 'neighbor' : 'neighbors';
  console.log(
      `Node with value ${vertex.Value} links to ${count} ${neighborWord}`
  );
};

export const getNeighborCount = vertex =>
  vertex.Edges.size;


export const unlinkNegativeWeightedNeighbors = vertex => {
  for (const neighborNode of vertex.Edges.keys()) {
    const weight = vertex.Edges.get(neighborNode);

    if (weight < 0) {
      vertex.unlink(neighborNode);
    }
  }
};

export const unlinkByPredicate = (vertex, weightPredicate) => {
  for (const neighborNode of vertex.Edges.keys()) {
    const weight = vertex.Edges.get(neighborNode);

    if (weightPredicate(weight)) {
      vertex.unlink(neighborNode);
    }
  }
};

export const pruneEdges = (graph, predicate) => {
  const unlinkHelper = (v) => {
    unlinkByPredicate(v, predicate);
  };

  traverseGraph(graph, unlinkHelper);
  sortSubgraphs(graph);
};

export const pruneNodes = (graph, removalPredicate) => {
  const outputGraph = graph.map(v => v);
  for (const vertex of outputGraph) {
    const isTargetVertex = removalPredicate(vertex);

    if (isTargetVertex) {
      for (const neighborNode of vertex.Edges.keys()) {
        vertex.unlink(neighborNode);
      }
    }
  }

  return outputGraph.filter(vertex => vertex.hasNeighbors());
};

export const discoverIslands = (islandCount = 3, graph = []) => {
  if (islandCount < 0 || islandCount > graph.length) {
    throw new Error(`Invalid count value: ${islandCount}`);
  }

  let threshold = 0;

  const getCandidateIslands = () => graph.slice(0, islandCount);
  const isSearchingForIslands = () => getCandidateIslands()
      .some(v => getNeighborCount(v) > 0);

  // Normally I don't write such verbose logic but
  // it's interesting to set breakpoints here and
  // inspect the relationships between the nodes
  // for which the predicate evaluates to true.
  const unlinkingPredicate = w => {
    const isUnlinking = Math.abs(w) < threshold;

    if (isUnlinking) {
      return true;
    }

    return false;
  };

  while (isSearchingForIslands()) {
    pruneEdges(graph, unlinkingPredicate);
    threshold += 0.01;
  }

  // With each pruning, there may be more than 1 newly-neighborless
  // vertex. Since it's an unknown count, collect them with a while loop.
  let index = 0;
  const result = [];
  while (index < graph.length && getNeighborCount(graph[index]) === 0) {
    result.push(graph[index++]);
  }

  return result;
};

export const initializeFullyConnectedGraph = (
    nodes,
    weightCallback = () => 0) => {
  nodes.forEach(n => {
    nodes.forEach(o => {
      if (n !== o && !n.Edges.has(o)) {
        n.link(new Edge(o, weightCallback(n, o)));
      }
    });
  });

  return nodes;
};

export const updateEdgeWeights = (node, dualKeyDictionary) => {
  const neighbors = [...node.Edges.keys()];
  neighbors.forEach(neighbor => {
    const weight = dualKeyDictionary.get(node.Value, neighbor.Value);
    node.Edges.set(neighbor, weight);
  });
};

export const printEdgeWeights = node => {
  console.log('');
  console.log(`Vertex:${node.Value}`);
  const hasNeighbors = node.Edges.size !== 0;

  if (hasNeighbors) {
    const count = node.Edges.size;
    console.log(`Has ${count} ${count === 1 ? 'neighbor' : 'neighbors'}`);
    console.log('Edges:');
    [...node.Edges.entries()].forEach(edge => {
      const [node, edgeWeight] = edge;
      console.log(`    Weight: ${edgeWeight} to ${node.Value}`);
    });
  } else {
    console.log('Has no neighbors');
  };
};

export const buildCorrelationDictionary = async (symbols, directory) => {
  const readTimeSeries = async (symbol, directory) => {
    const targetFile = `${directory}\\${symbol}.csv`;
    const readDataAsync = promisify(readFile);

    return readDataAsync(targetFile, 'utf-8').then((data) => {
      const rawValues = data.split('\n');

      // Remove any trailing new line and convert values to numbers.
      return rawValues.filter(v => v !== '').map(v => Number(v));
    });
  };

  const mapping = new DualKeyDictionary();

  for (let i = 0; i < symbols.length; i++) {
    const outerSymbol = symbols[i];
    const seriesX = await readTimeSeries(outerSymbol, directory);

    for (let j = i + 1; j < symbols.length; j++) {
      const innerSymbol = symbols[j];
      const seriesY = await readTimeSeries(innerSymbol, directory);

      const correlationCalc = correlation(seriesX, seriesY);

      mapping.set(outerSymbol, innerSymbol, correlationCalc);
    }
  }

  return mapping;
};
