import Graph from 'graphology';
import { GraphRx } from './graphology-observable';

/**
 * Turning off a graph event listener removes the individual listener, plus the graph emit listener.
 */
const LISTENERS_REMOVED_COUNT = 2;
let graph: Graph;
let graphRx: GraphRx;

describe('#on, #off should enable/disable internal listeners', () => {
  beforeEach(() => {
    graph = new Graph();
    graphRx = new GraphRx(graph);
  });

  afterEach(() => {
    if (!graphRx.isClosed) {
      graphRx.complete();
    }
  });

  describe('`nodeAdded`', () => {
    const EVENT = 'nodeAdded';
    test('#on() should not attach duplicate internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.on(EVENT);
      graphRx.on(EVENT);
      const count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#on() should reenable internal listener', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);
      let count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount - LISTENERS_REMOVED_COUNT);

      graphRx.on(EVENT);
      count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#off() should remove internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);

      const sleepCount = graph.listenerCount(EVENT);
      expect(sleepCount).toBe(initialCount - LISTENERS_REMOVED_COUNT);
    });

    test('#off() should prevent updates to event stream', done => {
      const expectedCount = 1;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graph.addNode('n');

      graphRx.off(EVENT);
      graph.addNode('slept on');

      graphRx.complete();
    });

    test('#off() then #on() should prevent then reenable updates to event stream', done => {
      const expectedCount = 1;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graphRx.off(EVENT);
      graph.addNode('slept on');

      graphRx.on(EVENT);
      graph.addNode('n2');

      graphRx.complete();
    });
  });

  describe('`edgeAdded`', () => {
    const EVENT = 'edgeAdded';
    test('#on() should not attach duplicate internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.on(EVENT);
      graphRx.on(EVENT);
      const count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#on() should reenable internal listener', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);
      let count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount - LISTENERS_REMOVED_COUNT);

      graphRx.on(EVENT);
      count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#off() should remove internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);

      const sleepCount = graph.listenerCount(EVENT);
      expect(sleepCount).toBe(initialCount - LISTENERS_REMOVED_COUNT);
    });

    test('#off() should prevent updates to event stream', done => {
      const expectedCount = 2;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graph.addNode('s');
      graph.addNode('t');

      graphRx.off(EVENT);
      graph.addEdge('t', 's');

      graphRx.complete();
    });

    test('#off() then #on() should prevent then reenable updates to event stream', done => {
      const expectedCount = 3;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graph.addNode('s');
      graph.addNode('t');

      graphRx.off(EVENT);
      graph.addEdge('s', 't');

      graphRx.on(EVENT);
      graph.addEdge('t', 's');

      graphRx.complete();
    });
  });

  describe('`nodeDropped`', () => {
    const EVENT = 'nodeDropped';
    test('#on() should not attach duplicate internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.on(EVENT);
      graphRx.on(EVENT);
      const count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#on() should reenable internal listener', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);
      let count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount - LISTENERS_REMOVED_COUNT);

      graphRx.on(EVENT);
      count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#off() should remove internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);

      const sleepCount = graph.listenerCount(EVENT);
      expect(sleepCount).toBe(initialCount - LISTENERS_REMOVED_COUNT);
    });

    test('#off() should prevent updates to event stream', done => {
      const expectedCount = 1;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graph.addNode('n');

      graphRx.off(EVENT);
      graph.dropNode('n');

      graphRx.complete();
    });

    test('#off() then #on() should prevent then reenable updates to event stream', done => {
      const expectedCount = 3;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graph.addNode('n');

      graphRx.off(EVENT);
      graph.dropNode('n');

      graphRx.on(EVENT);
      graph.addNode('n');
      graph.dropNode('n');

      graphRx.complete();
    });
  });

  describe('`edgeDropped`', () => {
    const EVENT = 'edgeDropped';
    test('#on() should not attach duplicate internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.on(EVENT);
      graphRx.on(EVENT);
      const count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#on() should reenable internal listener', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);
      let count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount - LISTENERS_REMOVED_COUNT);

      graphRx.on(EVENT);
      count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#off() should remove internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);

      const sleepCount = graph.listenerCount(EVENT);
      expect(sleepCount).toBe(initialCount - LISTENERS_REMOVED_COUNT);
    });

    test('#off() should prevent updates to event stream', done => {
      const expectedCount = 3;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graph.addNode('s');
      graph.addNode('t');
      graph.addEdge('s', 't');

      graphRx.off(EVENT);
      graph.dropEdge('s', 't');

      graphRx.complete();
    });

    test('#off() then #on() should prevent then reenable updates to event stream', done => {
      const expectedCount = 5;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graph.addNode('s');
      graph.addNode('t');
      graph.addEdge('s', 't');

      graphRx.off(EVENT);
      graph.dropEdge('s', 't');

      graphRx.on(EVENT);
      graph.addEdge('s', 't');
      graph.dropEdge('s', 't');

      graphRx.complete();
    });
  });

  describe('`cleared`', () => {
    const EVENT = 'cleared';
    test('#on() should not attach duplicate internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.on(EVENT);
      graphRx.on(EVENT);
      const count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#on() should reenable internal listener', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);
      let count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount - LISTENERS_REMOVED_COUNT);

      graphRx.on(EVENT);
      count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#off() should remove internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);

      const sleepCount = graph.listenerCount(EVENT);
      expect(sleepCount).toBe(initialCount - LISTENERS_REMOVED_COUNT);
    });

    test('#off() should prevent updates to event stream', done => {
      const expectedCount = 0;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graphRx.off(EVENT);
      graph.clear();

      graphRx.complete();
    });

    test('#off() then #on() should prevent then reenable updates to event stream', done => {
      const expectedCount = 1;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graphRx.off(EVENT);
      graph.clear();

      graphRx.on(EVENT);
      graph.clear();

      graphRx.complete();
    });
  });

  describe('`edgesCleared`', () => {
    const EVENT = 'edgesCleared';
    test('#on() should not attach duplicate internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.on(EVENT);
      graphRx.on(EVENT);
      const count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#on() should reenable internal listener', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);
      let count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount - LISTENERS_REMOVED_COUNT);

      graphRx.on(EVENT);
      count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#off() should remove internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);

      const sleepCount = graph.listenerCount(EVENT);
      expect(sleepCount).toBe(initialCount - LISTENERS_REMOVED_COUNT);
    });

    test('#off() should prevent updates to event stream', done => {
      const expectedCount = 0;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graphRx.off(EVENT);
      graph.clearEdges();

      graphRx.complete();
    });

    test('#off() then #on() should prevent then reenable updates to event stream', done => {
      const expectedCount = 1;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graphRx.off(EVENT);
      graph.clearEdges();

      graphRx.on(EVENT);
      graph.clearEdges();

      graphRx.complete();
    });
  });

  describe('`attributesUpdated`', () => {
    const EVENT = 'attributesUpdated';
    test('#on() should not attach duplicate internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.on(EVENT);
      graphRx.on(EVENT);
      const count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#on() should reenable internal listener', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);
      let count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount - LISTENERS_REMOVED_COUNT);

      graphRx.on(EVENT);
      count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#off() should remove internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);

      const sleepCount = graph.listenerCount(EVENT);
      expect(sleepCount).toBe(initialCount - LISTENERS_REMOVED_COUNT);
    });

    test('#off() should prevent updates to event stream', done => {
      const expectedCount = 0;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graphRx.off(EVENT);
      graph.setAttribute('attr', 'val');

      graphRx.complete();
    });

    test('#off() then #on() should prevent then reenable updates to event stream', done => {
      const expectedCount = 1;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graphRx.off(EVENT);
      graph.setAttribute('attr', 'val');

      graphRx.on(EVENT);
      graph.setAttribute('attr', 'val');

      graphRx.complete();
    });
  });

  describe('`nodeAttributesUpdated`', () => {
    const EVENT = 'nodeAttributesUpdated';
    test('#on() should not attach duplicate internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.on(EVENT);
      graphRx.on(EVENT);
      const count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#on() should reenable internal listener', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);
      let count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount - LISTENERS_REMOVED_COUNT);

      graphRx.on(EVENT);
      count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#off() should remove internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);

      const sleepCount = graph.listenerCount(EVENT);
      expect(sleepCount).toBe(initialCount - LISTENERS_REMOVED_COUNT);
    });

    test('#off() should prevent updates to event stream', done => {
      const expectedCount = 1;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graph.addNode('n');

      graphRx.off(EVENT);
      graph.setNodeAttribute('n', 'attr', 'val');

      graphRx.complete();
    });

    test('#off() then #on() should prevent then reenable updates to event stream', done => {
      const expectedCount = 2;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graph.addNode('n');

      graphRx.off(EVENT);
      graph.setNodeAttribute('n', 'attr', 'val');

      graphRx.on(EVENT);
      graph.setNodeAttribute('n', 'attr', 'val');

      graphRx.complete();
    });
  });

  describe('`edgeAttributesUpdated`', () => {
    const EVENT = 'edgeAttributesUpdated';
    test('#on() should not attach duplicate internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.on(EVENT);
      graphRx.on(EVENT);
      const count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#on() should reenable internal listener', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);
      let count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount - LISTENERS_REMOVED_COUNT);

      graphRx.on(EVENT);
      count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#off() should remove internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);

      const sleepCount = graph.listenerCount(EVENT);
      expect(sleepCount).toBe(initialCount - LISTENERS_REMOVED_COUNT);
    });

    test('#off() should prevent updates to event stream', done => {
      const expectedCount = 3;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graph.addNode('s');
      graph.addNode('t');
      graph.addEdgeWithKey('e', 's', 't');

      graphRx.off(EVENT);
      graph.setEdgeAttribute('e', 'attr', 'val');

      graphRx.complete();
    });

    test('#off() then #on() should prevent then reenable updates to event stream', done => {
      const expectedCount = 4;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graph.addNode('s');
      graph.addNode('t');
      graph.addEdgeWithKey('e', 's', 't');

      graphRx.off(EVENT);
      graph.setEdgeAttribute('e', 'attr', 'val');

      graphRx.on(EVENT);
      graph.setEdgeAttribute('e', 'attr', 'val');

      graphRx.complete();
    });
  });

  describe('`eachNodeAttributesUpdated`', () => {
    const EVENT = 'eachNodeAttributesUpdated';
    test('#on() should not attach duplicate internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.on(EVENT);
      graphRx.on(EVENT);
      const count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#on() should reenable internal listener', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);
      let count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount - LISTENERS_REMOVED_COUNT);

      graphRx.on(EVENT);
      count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#off() should remove internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);

      const sleepCount = graph.listenerCount(EVENT);
      expect(sleepCount).toBe(initialCount - LISTENERS_REMOVED_COUNT);
    });

    test('#off() should prevent updates to event stream', done => {
      const expectedCount = 0;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graphRx.off(EVENT);
      graph.updateEachNodeAttributes((node, attributes) => {
        attributes[node] = node;
        return attributes;
      });

      graphRx.complete();
    });

    test('#off() then #on() should prevent then reenable updates to event stream', done => {
      const expectedCount = 1;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graphRx.off(EVENT);
      graph.updateEachNodeAttributes((node, attributes) => {
        attributes[node] = node;
        return attributes;
      });

      graphRx.on(EVENT);
      graph.updateEachNodeAttributes((node, attributes) => {
        attributes[node] = node;
        return attributes;
      });

      graphRx.complete();
    });
  });

  describe('`eachEdgeAttributesUpdated`', () => {
    const EVENT = 'eachEdgeAttributesUpdated';
    test('#on() should not attach duplicate internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.on(EVENT);
      graphRx.on(EVENT);
      const count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#on() should reenable internal listener', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);
      let count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount - LISTENERS_REMOVED_COUNT);

      graphRx.on(EVENT);
      count = graph.listenerCount(EVENT);
      expect(count).toBe(initialCount);
    });

    test('#off() should remove internal listeners', () => {
      const initialCount = graph.listenerCount(EVENT);

      graphRx.off(EVENT);

      const sleepCount = graph.listenerCount(EVENT);
      expect(sleepCount).toBe(initialCount - LISTENERS_REMOVED_COUNT);
    });

    test('#off() should prevent updates to event stream', done => {
      const expectedCount = 0;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graphRx.off(EVENT);
      graph.updateEachEdgeAttributes((edge, attributes) => {
        attributes[edge] = edge;
        return attributes;
      });

      graphRx.complete();
    });

    test('#off() then #on() should prevent then reenable updates to event stream', done => {
      const expectedCount = 1;
      let actualCount = 0;
      const graph$ = graphRx.stream();

      graph$.subscribe({
        next: () => actualCount++,
        complete: () => {
          expect(actualCount).toBe(expectedCount);
          done();
        }
      });

      graphRx.off(EVENT);
      graph.updateEachEdgeAttributes((edge, attributes) => {
        attributes[edge] = edge;
        return attributes;
      });

      graphRx.on(EVENT);
      graph.updateEachEdgeAttributes((edge, attributes) => {
        attributes[edge] = edge;
        return attributes;
      });

      graphRx.complete();
    });
  });
});
