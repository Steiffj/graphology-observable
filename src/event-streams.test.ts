import Graph from 'graphology';
import { GraphRx } from './graphology-observable';

let graph: Graph;
let graphRx: GraphRx;

describe('graph events should update graph$ observable ', () => {
  beforeEach(() => {
    graph = new Graph();
    graphRx = new GraphRx(graph);
  });

  test('#addNode() should update graph$ stream', done => {
    const expectedCount = 3;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('node 1');
    graph.addNode('node 2');
    graph.addNode('node 3');

    graphRx.complete();
  });

  test('#mergeNode() should update graph$ stream', done => {
    const expectedCount = 2;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('n');
    graph.mergeNode('n', { attr: 'attr' });

    graphRx.complete();
  });

  test('#updateNode() should update graph$ stream', done => {
    const expectedCount = 2;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('n');
    graph.updateNode('n', attributes => ({ ...attributes, attr: true }));

    graphRx.complete();
  });

  test('#addEdge() should update graph$ stream', done => {
    const expectedCount = 3;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdge('s', 't');

    graphRx.complete();
  });

  test('#addDirectedEdge() should update graph$ stream', done => {
    const expectedCount = 3;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addDirectedEdge('s', 't');

    graphRx.complete();
  });

  test('#addUndirectedEdge() should update graph$ stream', done => {
    const expectedCount = 3;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addUndirectedEdge('s', 't');

    graphRx.complete();
  });

  test('#addEdgeWithKey() should update graph$ stream', done => {
    const expectedCount = 3;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdgeWithKey('e', 's', 't');

    graphRx.complete();
  });

  test('#addDirectedEdgeWithKey() should update graph$ stream', done => {
    const expectedCount = 3;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addDirectedEdgeWithKey('e', 's', 't');

    graphRx.complete();
  });

  test('#addUndirectedEdgeWithKey() should update graph$ stream', done => {
    const expectedCount = 3;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addUndirectedEdgeWithKey('e', 's', 't');

    graphRx.complete();
  });

  test('#mergeEdge() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdge('s', 't');
    graph.mergeEdge('s', 't', { attr: true });

    graphRx.complete();
  });

  test('#mergeDirectedEdge() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addDirectedEdge('s', 't');
    graph.mergeDirectedEdge('s', 't', { attr: true });

    graphRx.complete();
  });

  test('#mergeUndirectedEdge() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addUndirectedEdge('s', 't');
    graph.mergeUndirectedEdge('s', 't', { attr: true });

    graphRx.complete();
  });

  test('#mergeEdgeWithKey() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdgeWithKey('e', 's', 't');
    graph.mergeEdgeWithKey('e', 's', 't', { attr: true });

    graphRx.complete();
  });

  test('#mergeEdgeWithKey() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addDirectedEdgeWithKey('e', 's', 't');
    graph.mergeDirectedEdgeWithKey('e', 's', 't', { attr: true });

    graphRx.complete();
  });

  test('#mergeUndirectedEdgeWithKey() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addUndirectedEdgeWithKey('e', 's', 't');
    graph.mergeUndirectedEdgeWithKey('e', 's', 't', { attr: true });

    graphRx.complete();
  });

  test('#updateEdge() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdge('s', 't');
    graph.updateEdge('s', 't', attributes => ({ ...attributes, attr: true }));

    graphRx.complete();
  });

  test('#updateDirectedEdge() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdge('s', 't');
    graph.updateDirectedEdge('s', 't', attributes => ({ ...attributes, attr: true }));

    graphRx.complete();
  });

  test('#updateUndirectedEdge() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdge('s', 't');
    graph.updateUndirectedEdge('s', 't', attributes => ({ ...attributes, attr: true }));

    graphRx.complete();
  });

  test('#updateEdgeWithKey() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdgeWithKey('e', 's', 't');
    graph.updateEdgeWithKey('e', 's', 't', attributes => ({ ...attributes, attr: true }));

    graphRx.complete();
  });

  test('#updateDirectedEdgeWithKey() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdgeWithKey('e', 's', 't');
    graph.updateDirectedEdgeWithKey('e', 's', 't', attributes => ({ ...attributes, attr: true }));

    graphRx.complete();
  });

  test('#updateUndirectedEdgeWithKey() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdgeWithKey('e', 's', 't');
    graph.updateUndirectedEdgeWithKey('e', 's', 't', attributes => ({ ...attributes, attr: true }));

    graphRx.complete();
  });

  test('#dropNode() should update graph$ stream', done => {
    const expectedCount = 2;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('n');
    graph.dropNode('n');

    graphRx.complete();
  });

  test('#dropEdge() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdge('s', 't');
    graph.dropEdge('s', 't');

    graphRx.complete();
  });

  test('#dropDirectedEdge() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addDirectedEdge('s', 't');
    graph.dropDirectedEdge('s', 't');

    graphRx.complete();
  });

  test('#dropUndirectedEdge() should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addUndirectedEdge('s', 't');
    graph.dropUndirectedEdge('s', 't');

    graphRx.complete();
  });

  test('#clear() with empty graph should update graph$ stream', done => {
    const expectedCount = 1;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.clear();

    graphRx.complete();
  });

  test('#clear() with populated graph should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdge('s', 't');
    graph.clear();

    graphRx.complete();
  });

  test('#clearEdges() with empty graph should update graph$ stream', done => {
    const expectedCount = 1;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.clearEdges();

    graphRx.complete();
  });

  test('#clearEdges() with only nodes should update graph$ stream', done => {
    const expectedCount = 2;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('n');
    graph.clearEdges();

    graphRx.complete();
  });

  test('#clearEdges() with populated graph should update graph$ stream', done => {
    const expectedCount = 4;
    let emitCount = 0;
    const graph$ = graphRx.stream();

    graph$.subscribe({
      next: () => emitCount++,
      complete: () => {
        expect(emitCount).toBe(expectedCount);
        done();
      }
    });

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdge('s', 't');
    graph.clearEdges();

    graphRx.complete();
  });
});
