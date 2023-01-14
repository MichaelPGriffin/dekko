import { Edge } from '../../src/Edge.js';
import { Vertex } from '../../src/Vertex.js';
import { equal, ok } from 'assert';
import { DualKeyDictionary } from '../../src/DualKeyDictionary.js';
import { breadthFirstTraversal,
  initializeFullyConnectedGraph,
  updateEdgeWeights,
  traverseGraph
} from '../../src/Graph-Helpers.js';


describe('Vertex', function() {
  describe('link()', function() {
    it('Creates undirected relationship between nodes added to graph',
        function() {
          const a = new Vertex('A');
          const b = new Vertex('B');
          a.link(new Edge(b));

          ok(a.Edges.has(b));
          ok(b.Edges.has(a));
        });
  });

  describe('unlink()', function() {
    it('Removes immediate relationship between nodes',
        function() {
          const a = new Vertex('A');
          const b = new Vertex('B');
          a.link(new Edge(b));
          ok(a.Edges.has(b));
          ok(b.Edges.has(a));
          a.unlink(b);
          ok(!b.Edges.has(a));
          ok(!a.Edges.has(b));

          a.link(new Edge(b));
          ok(a.Edges.has(b));
          ok(b.Edges.has(a));

          // Same as the above test-case but checks that input can be array.
          a.unlink([b]);
          ok(!b.Edges.has(a));
          ok(!a.Edges.has(b));

          // Verify that a weight has the same value from the
          // perspective of either node.
          const expectedWeightValue = 999;
          a.link(new Edge(b, expectedWeightValue));
          equal(a.Edges.get(b), expectedWeightValue);
          equal(b.Edges.get(a), expectedWeightValue);
        });
  });

  describe('unlink() nodes based on edge weights', function() {
    it('The implementation can unlink based on edge weights', function() {
      const a = new Vertex(0, 1);
      a.link(new Edge(new Vertex(0, 1)));
      a.link(new Edge(new Vertex(0, 10)));
      a.link(new Edge(new Vertex(0, 100)));
      a.link(new Edge(new Vertex(0, -1)));
      a.link(new Edge(new Vertex(0, -1)));
      a.link(new Edge(new Vertex(0, -1)));

      for (const vertex of a.Edges.keys()) {
        const weight = a.Edges.get(vertex);

        if (weight < 0) {
          a.Edges.delete(vertex);
        }
      }

      const remainingEdgeWeights = [...a.Edges.values()];
      ok(remainingEdgeWeights.every(w => w >= 0));
    });
  });
});

describe('breadthFirstTraversal()', function() {
  describe('Order verification', function() {
    it('Traverses a graph in breadth-first order', function() {
      const head = new Vertex(0);

      // Build a collection of nodes linked in depth-first order.
      const membersInDepthFirstOrder = [head];
      for (let i = 1; i < 50; i++) {
        membersInDepthFirstOrder.push(new Vertex(i));
        membersInDepthFirstOrder[i]
            .link(new Edge(membersInDepthFirstOrder[i - 1]));
      }

      // Link a second node to the head node.
      const expectedEarlyResult = 'This should be the 3rd node\'s value';
      head.link(new Edge(new Vertex(expectedEarlyResult)));

      // Link a second node to what is currently the 2nd-to-last node. In a
      // breadth-first traversal, this newly linked node will be the
      // 2nd-to-last to be encountered.
      const expectedLateResult = 'This should be the 2nd-to-last node\'s value';
      membersInDepthFirstOrder[membersInDepthFirstOrder.length - 3]
          .link(new Edge(new Vertex(expectedLateResult)));

      // Record the order of elements in a breadth-first traversal.
      const elementsInTraversalOrder = [];
      const bfsCallback = function(node) {
        elementsInTraversalOrder.push(node);
      };

      breadthFirstTraversal(head, bfsCallback);

      // Verify this ordering is consistent with breadth-first traversal.
      const actualEarlyResult = elementsInTraversalOrder[2].Value;
      equal(expectedEarlyResult, actualEarlyResult);

      const lastElement = elementsInTraversalOrder.length - 1;
      const secondToLast = lastElement - 1;
      const actualLateResult = elementsInTraversalOrder[secondToLast].Value;
      equal(expectedLateResult, actualLateResult);
    });
  });

  describe('Weight inspection', function() {
    it('A callback can inspect the weights of each edge', function() {
      const a = new Vertex(1);
      const b = new Vertex(2);
      const c = new Vertex(3);

      const edgeBuilder = vertex => new Edge(vertex, vertex.Value * 100);
      a.link(edgeBuilder(b));
      b.link(edgeBuilder(c));

      const weights = [];
      const weightInspector = vertex => {
        for (const k of vertex.Edges.keys()) {
          weights.push(vertex.Edges.get(k));
        }
      };

      breadthFirstTraversal(a, weightInspector);

      equal(weights[0], 200);
      equal(weights[1], 200);
      equal(weights[2], 300);
      equal(weights[3], 300);
    });
  });
});

describe('initializeFullyConnectedGraph()', function() {
  it(
      `Consumes a node array and returns a fully-connected graph`,
      function() {
        const nodeValues = ['alpha', 'beta', 'delta'];
        const nodeCollection = nodeValues.map(n => new Vertex(n));
        const graph = initializeFullyConnectedGraph(nodeCollection);

        const nodeCollectionAsSet = new Set(nodeCollection);

        const checkNeighborsAreInNodeCollection = node => {
          const neighbors = [...node.Edges.keys()];
          neighbors.forEach(neighbor => {
            ok(nodeCollectionAsSet.has(neighbor),
                `Current node has value ${node.Value}.
                Neighbor with value ${neighbor.Value}`
            );
          });
        };

        traverseGraph(graph, checkNeighborsAreInNodeCollection);
      });
});

describe('assignEdgeWeights() with dual-key dictionary', function() {
  it('Looks up vertex-to-vertex relationships and assigns values to edges',
      function() {
        // Initialize a fully-connected graph at the outset.
        const nodeValues = ['alpha', 'beta', 'delta'];
        const nodeCollection = nodeValues.map(n => new Vertex(n));
        const [alpha, beta, delta] = nodeCollection;
        const graph = initializeFullyConnectedGraph(nodeCollection);

        const dkd = new DualKeyDictionary();
        dkd.set(alpha.Value, beta.Value, 100);
        dkd.set(alpha.Value, delta.Value, 200);
        dkd.set(delta.Value, beta.Value, 300);
        traverseGraph(graph, node => updateEdgeWeights(node, dkd));

        dkd.set(delta.Value, beta.Value, 300);

        // Traverse the graph and confirm the edge weights match the
        // dictionary contents.
        const weightVerifier = vertex => {
          [...vertex.Edges.entries()].forEach(edge => {
            const [neighbor, actualWeight] = edge;
            const expectedWeight = dkd.get(vertex.Value, neighbor.Value);

            equal(
                actualWeight,
                expectedWeight,
                `Expected edge weight between ${vertex.Value} and
                ${neighbor.Value} is ${actualWeight}.
                Expected ${expectedWeight}`);
          });
        };

        traverseGraph(graph, weightVerifier);
      });
});
