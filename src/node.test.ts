import Graph from 'graphology';
import { GraphRx } from './graphology-observable';
import { finalize, take } from 'rxjs';

let graph: Graph;
let graphRx: GraphRx;

describe('#node()', () => {
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
    let nodeEmitted = false;
    graphRx.node('nonexistent key').subscribe({
      next: nodeRx => {
        nodeEmitted = true;
        expect(() => nodeRx.getAttribute('attr')).toThrowError();
        expect(nodeRx.getAttributes).toThrowError();
        expect(() => nodeRx.hasAttribute('attr')).toThrowError();
        expect(() => nodeRx.setAttribute('attr', 'val')).toThrowError();
        expect(() => nodeRx.updateAttribute('attr', () => ({ attr: 'val' }))).toThrowError();
        expect(() => nodeRx.removeAttribute('attr')).toThrowError();
        expect(() => nodeRx.replaceAttributes({ attr: false })).toThrowError();
        expect(() => nodeRx.mergeAttributes({ attr: false })).toThrowError();
        expect(() => nodeRx.updateAttributes(() => ({ attr: 'val' }))).toThrowError();
      }
    });

    expect(nodeEmitted).toEqual(true);
    graphRx.complete();
    done();
  });

  test('#node() reading attributes should return the correct values', done => {
    const expectedAttrs = {
      attr: 'val',
      hasAttributes: true
    };

    graph.addNode('n');
    graph.replaceNodeAttributes('n', expectedAttrs);

    graphRx.node('n').subscribe({
      next: nodeRx => {
        expect(nodeRx.key).toEqual('n');
        expect(nodeRx.getAttribute('attr')).toEqual('val');
        expect(nodeRx.getAttribute('hasAttributes')).toEqual(true);
        expect(nodeRx.getAttributes()).toEqual(expectedAttrs);
        expect(nodeRx.hasAttribute('attr')).toEqual(true);
        expect(nodeRx.hasAttribute('not a property')).toEqual(false);
        done();
      }
    });
  });

  test('#node() mutating node attributes should update the node stream', done => {
    const expectedEmitCount = 7; // initial node plus # of mutations
    let emitCount = 0;

    graph.addNode('n');

    graphRx
      .node('n')
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
      .node('n')
      .pipe(take(1))
      .subscribe({
        next: nodeRx => {
          // 6 mutations
          nodeRx.setAttribute('attr', 'val');
          nodeRx.updateAttribute('attr', () => ({ attr: 'val2' }));
          nodeRx.removeAttribute('attr');
          nodeRx.replaceAttributes({ attr: false });
          nodeRx.mergeAttributes({ attr: true });
          nodeRx.updateAttributes(() => ({ attr: 'val3' }));
        }
      });

    graphRx.complete();
  });

  test('relevant `nodeDropped` events should complete the #node() stream', () => {
    graph.addNode('n');
    graph.addNode('other');
    const subscription = graphRx.node('n').subscribe();

    graph.dropNode('other');
    expect(subscription.closed).toBe(false);

    graph.dropNode('n');
    expect(subscription.closed).toBe(true);
  });

  test('`cleared` events should complete the #node() stream', () => {
    graph.addNode('n');

    const subscription = graphRx.node('n').subscribe();
    graph.clear();

    expect(subscription.closed).toBe(true);
  });
});
