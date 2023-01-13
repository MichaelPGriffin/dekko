import { Edge } from './Edge.js';

export class Vertex {
  constructor(value) {
    this.Value = value;
    this.isVisited = false;
    this.Edges = new Map();
  }

  link(edges) {
    const { Edges } = this;

    // Use flatMap() so input can be a scalar or an array.
    [edges].flatMap(e => e)
        .filter(e => !Edges.has(e.Node))
        .forEach(e => {
          // Establish link from this to the adjacent node.
          // Then establish link from the adjacent node to this.
          // Note the edge has the same weight in both directions.
          Edges.set(e.Node, e.Weight);
          e.Node.link(new Edge(this, e.Weight));
        });
  }

  unlink(target) {
    [target]
        .flatMap(t => t)
        .forEach(t => {
          this.Edges.delete(t);
          t.Edges.delete(this);
        });
  }

  hasNeighbors() {
    return this.Edges.size > 0;
  }

  relationToNeighbor(neighborValue) {
    let result = null;

    for (const k of this.Edges.keys()) {
      if (k.Value === neighborValue) {
        result = this.Edges.get(k);
        break;
      }
    }

    return result;
  }
}
