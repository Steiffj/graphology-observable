import Graph from 'graphology';
import { finalize, take } from 'rxjs';
import { GraphRx } from './graphology-observable';

let graph: Graph;
let graphRx: GraphRx;

describe('#edge()', () => {
  beforeEach(() => {
    graph = new Graph();
    graphRx = new GraphRx(graph);
  });

  afterEach(() => {
    if (!graphRx.isClosed) {
      graphRx.complete();
    }
  });

  test('nonexistent key should return a value but throw errors when accessing methods', done => {
    let edgeEmitted = false;
    graphRx.edge('nonexistent key').subscribe({
      next: edgeRx => {
        edgeEmitted = true;
        expect(() => edgeRx.getAttribute('attr')).toThrowError();
        expect(edgeRx.getAttributes).toThrowError();
        expect(() => edgeRx.hasAttribute('attr')).toThrowError();
        expect(() => edgeRx.setAttribute('attr', 'val')).toThrowError();
        expect(() => edgeRx.updateAttribute('attr', () => ({ attr: 'val' }))).toThrowError();
        expect(() => edgeRx.removeAttribute('attr')).toThrowError();
        expect(() => edgeRx.replaceAttributes({ attr: false })).toThrowError();
        expect(() => edgeRx.mergeAttributes({ attr: false })).toThrowError();
        expect(() => edgeRx.updateAttributes(() => ({ attr: 'val' }))).toThrowError();
      }
    });

    expect(edgeEmitted).toEqual(true);
    graphRx.complete();
    done();
  });

  test('#edge() reading attributes should return the correct values', done => {
    const expectedAttrs = {
      attr: 'val',
      hasAttributes: true
    };

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdgeWithKey('e', 's', 't');
    graph.replaceEdgeAttributes('e', expectedAttrs);

    graphRx.edge('e').subscribe({
      next: edgeRx => {
        expect(edgeRx.key).toEqual('e');
        expect(edgeRx.source()).toEqual('s');
        expect(edgeRx.target()).toEqual('t');
        expect(edgeRx.undirected()).toEqual(graph.isUndirected('e'));
        expect(edgeRx.getAttribute('attr')).toEqual('val');
        expect(edgeRx.getAttribute('hasAttributes')).toEqual(true);
        expect(edgeRx.getAttributes()).toEqual(expectedAttrs);
        expect(edgeRx.hasAttribute('attr')).toEqual(true);
        expect(edgeRx.hasAttribute('not a property')).toEqual(false);
        done();
      }
    });
  });

  test('#edge() mutating edge attributes should update the edge stream', done => {
    const expectedEmitCount = 7; // initial edge plus # of mutations
    let emitCount = 0;

    graph.addNode('s');
    graph.addNode('t');
    graph.addEdgeWithKey('e', 's', 't');

    graphRx
      .edge('e')
      .pipe(
        finalize(() => {
          expect(emitCount).toBe(expectedEmitCount);
          done();
        })
      )
      .subscribe({
        next: () => emitCount++
      });

    graphRx
      .edge('e')
      .pipe(take(1))
      .subscribe({
        next: edgeRx => {
          // 6 mutations
          edgeRx.setAttribute('attr', 'val');
          edgeRx.updateAttribute('attr', () => ({ attr: 'val2' }));
          edgeRx.removeAttribute('attr');
          edgeRx.replaceAttributes({ attr: false });
          edgeRx.mergeAttributes({ attr: true });
          edgeRx.updateAttributes(() => ({ attr: 'val3' }));
        }
      });

    graphRx.complete();
  });

  test('relevant `edgeDropped` events should complete the #edge() stream', () => {
    graph.addNode('s');
    graph.addNode('t');
    graph.addEdgeWithKey('e', 's', 't');
    graph.addEdgeWithKey('other', 't', 's');
    const subscription = graphRx.edge('e').subscribe();

    graph.dropEdge('other');
    expect(subscription.closed).toBe(false);

    graph.dropEdge('e');
    expect(subscription.closed).toBe(true);
  });

  test('`cleared` events should complete the #node() stream', () => {
    graph.addNode('s');
    graph.addNode('t');
    graph.addEdgeWithKey('e', 's', 't');

    const subscription = graphRx.edge('e').subscribe();
    graph.clear();

    expect(subscription.closed).toBe(true);
  });

  test('`edgesCleared` events should complete the #node() stream', () => {
    graph.addNode('s');
    graph.addNode('t');
    graph.addEdgeWithKey('e', 's', 't');

    const subscription = graphRx.edge('e').subscribe();
    graph.clearEdges();

    expect(subscription.closed).toBe(true);
  });
});
