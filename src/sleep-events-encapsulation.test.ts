import Graph from 'graphology';
import { GraphRx } from './graphology-observable';

let graph: Graph;
let graphRx: GraphRx;

const EVENT = 'nodeAdded';

describe('#on, #off should only affect internal listeners', () => {
  beforeEach(() => {
    graph = new Graph();
    graphRx = new GraphRx(graph);
  });

  afterEach(() => {
    if (!graphRx.isClosed) {
      graphRx.complete();
    }
  });

  test("#off should not remove consumers' event listeners", () => {
    let listenerCalled = false;
    graph.on(EVENT, () => {
      listenerCalled = true;
    });

    graphRx.off(EVENT);
    graph.addNode('n');

    expect(listenerCalled).toBe(true);
  });
});
