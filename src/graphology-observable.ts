import Graph from 'graphology';
import { Attributes, GraphEvents } from 'graphology-types';
import { Observable, Subject, filter, map, merge, startWith, take, takeUntil, withLatestFrom } from 'rxjs';

/**
 * `Object.keys()` but type safe.
 */
const objectKeys = <T extends object>(obj: T): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[];
};
/**
 * Internal type to improve `eventStreams` initialization readability.
 */
type GraphEventStreams = { [Event in keyof GraphEvents]: Subject<Parameters<GraphEvents[Event]>> };

const getAttributesApi = (graph: Graph) => ({
  getAttribute: <T>(attribute: keyof Attributes) => graph.getAttribute(attribute) as T,
  getAttributes: <T extends ReturnType<Graph['getAttributes']> = ReturnType<Graph['getAttributes']>>(
    attribute: keyof Attributes
  ) => graph.getAttribute(attribute) as T,
  hasAttribute: (attribute: string | number) => graph.hasAttribute(attribute),
  setAttribute: <T = keyof Attributes>(attribute: string | number, value: T) => graph.setAttribute(attribute, value),
  updateAttribute: <T>(attribute: string | number, updater: (value: T) => T) =>
    graph.updateAttribute(attribute, updater),
  removeAttribute: (attribute: string | number) => graph.removeAttribute(attribute),
  replaceAttributes: <T extends Attributes = Attributes>(attributes: T) => graph.replaceAttributes(attributes),
  mergeAttributes: <T extends Attributes = Attributes>(attributes: Partial<T>) => graph.mergeAttributes(attributes),
  updateAttributes: <T extends Attributes = Attributes>(updater: (attributes: Attributes) => T) => {
    graph.updateAttributes(updater);
  }
});

const getNodeAttributesApi = (nodeKey: string, graph: Graph) => ({
  key: nodeKey,
  getAttribute: <T>(attribute: keyof Attributes) => graph.getNodeAttribute(nodeKey, attribute) as T,
  getAttributes: <T>() => ({ ...graph.getNodeAttributes(nodeKey) }) as T,
  hasAttribute: (attribute: keyof Attributes) => graph.hasNodeAttribute(nodeKey, attribute),
  setAttribute: <T extends keyof Attributes = keyof Attributes>(attribute: keyof Attributes, value: T) =>
    graph.setNodeAttribute(nodeKey, attribute, value),
  updateAttribute: <T>(attribute: string | number, updater: (value: T) => T) => {
    graph.updateNodeAttribute(nodeKey, attribute, updater);
  },
  removeAttribute: (attribute: string | number) => {
    graph.removeNodeAttribute(nodeKey, attribute);
  },
  replaceAttributes: (attributes: Attributes) => {
    graph.replaceNodeAttributes(nodeKey, attributes);
  },
  mergeAttributes: <T extends Attributes = Attributes>(attributes: Partial<T>) => {
    graph.mergeNodeAttributes(nodeKey, attributes);
  },
  updateAttributes: (updater: (attributes: Attributes) => Attributes) => {
    graph.updateNodeAttributes(nodeKey, updater);
  }
});

const getEdgeAttributesApi = (edgeKey: string, graph: Graph) => ({
  key: edgeKey,
  source: () => graph.source(edgeKey),
  target: () => graph.target(edgeKey),
  undirected: () => graph.isUndirected(edgeKey),
  getAttribute: <T>(attribute: keyof Attributes) => graph.getEdgeAttribute(edgeKey, attribute) as T,
  getAttributes: <T>() => ({ ...graph.getEdgeAttributes(edgeKey) }) as T,
  hasAttribute: (attribute: keyof Attributes) => graph.hasEdgeAttribute(edgeKey, attribute),
  setAttribute: <T extends keyof Attributes = keyof Attributes>(attribute: keyof Attributes, value: T) =>
    graph.setEdgeAttribute(edgeKey, attribute, value),
  updateAttribute: <T>(attribute: string | number, updater: (value: T) => T) => {
    graph.updateEdgeAttribute(edgeKey, attribute, updater);
  },
  removeAttribute: (attribute: string | number) => {
    graph.removeEdgeAttribute(edgeKey, attribute);
  },
  replaceAttributes: (attributes: Attributes) => {
    graph.replaceEdgeAttributes(edgeKey, attributes);
  },
  mergeAttributes: (attributes: Attributes) => {
    graph.mergeEdgeAttributes(edgeKey, attributes);
  },
  updateAttributes: (updater: (attributes: Attributes) => Attributes) => {
    graph.updateEdgeAttributes(edgeKey, updater);
  }
});

/**
 * RxJS-based reactive wrapper around Graphology's Graph object specification.
 */
class GraphRx {
  private _isClosed = false;
  get isClosed() {
    return this._isClosed;
  }
  private graph$: Subject<Graph>;

  readonly events: (keyof GraphEvents)[] = [
    'nodeAdded',
    'edgeAdded',
    'nodeDropped',
    'edgeDropped',
    'cleared',
    'edgesCleared',
    'attributesUpdated',
    'nodeAttributesUpdated',
    'edgeAttributesUpdated',
    'eachNodeAttributesUpdated',
    'eachEdgeAttributesUpdated'
  ];

  private eventStreams: GraphEventStreams = this.events.reduce(
    (streams, event) => ({ ...streams, [event]: new Subject<Parameters<GraphEvents[typeof event]>>() }),
    {} as GraphEventStreams
  );

  private eventListeners: { [Event in keyof GraphEvents]: (...payload: Parameters<GraphEvents[Event]>) => void } = {
    nodeAdded: payload => this.eventStreams['nodeAdded'].next([payload]),
    edgeAdded: payload => this.eventStreams['edgeAdded'].next([payload]),
    nodeDropped: payload => this.eventStreams['nodeDropped'].next([payload]),
    edgeDropped: payload => this.eventStreams['edgeDropped'].next([payload]),
    cleared: () => this.eventStreams['cleared'].next([]),
    edgesCleared: () => this.eventStreams['edgesCleared'].next([]),
    attributesUpdated: payload => this.eventStreams['attributesUpdated'].next([payload]),
    nodeAttributesUpdated: payload => this.eventStreams['nodeAttributesUpdated'].next([payload]),
    edgeAttributesUpdated: payload => this.eventStreams['edgeAttributesUpdated'].next([payload]),
    eachNodeAttributesUpdated: payload => this.eventStreams['eachNodeAttributesUpdated'].next([payload]),
    eachEdgeAttributesUpdated: payload => this.eventStreams['eachEdgeAttributesUpdated'].next([payload])
  };
  /**
   * Event listener function responsible for emitting values to the `graph$` stream
   * when any `Graph` event emitter fires.
   */
  private graphEmitListener = () => this.graph$.next(this.graph);
  /**
   * Initialize a new reactive Graph.
   * @param graph `Graph` object to wrap
   */
  constructor(public readonly graph: Graph) {
    this.graph$ = new Subject<Graph>();
    this.graph$.next(this.graph);

    this.events.forEach(event => {
      this.graph.on(event, this.eventListeners[event]);
      this.graph.on(event, this.graphEmitListener);
    });
  }
  /**
   * Get the underlying `Graph` object as a stream that emits based on graph mutations.
   *
   * Warning: this will emit a new value whenever any of the native `Graph` events are fired!
   * Consider filtering the stream with `filter`, `throttle`, etc. or disable specific event listeners via `GraphRx.off`
   *
   * Note: this observable return the same object reference each time it emits. If your use case requires object
   * immutability, you can `map` the output to an object containing the graph.
   *
   * @see off
   */
  stream(): Observable<Graph> {
    return this.graph$;
  }
  /**
   * Enable internal listeners for a given `Graph` event.
   *
   * @param event `Graph` event name
   */
  on(event: keyof GraphEvents) {
    if (!this.graph.listeners(event).includes(this.eventListeners[event])) {
      this.graph.on(event, this.eventListeners[event]);
      this.graph.on(event, this.graphEmitListener);
    }
  }
  /**
   * Disable internal listeners for a given `Graph` event.
   *
   * @param event `Graph` event name
   */
  off(event: keyof GraphEvents) {
    this.graph.off(event, this.eventListeners[event]);
    this.graph.off(event, this.graphEmitListener);
  }
  /**
   * Complete all internal observables and remove event listeners from the underlying `Graph`.
   */
  complete() {
    objectKeys(this.eventListeners).forEach(event => {
      this.graph.off(event, this.eventListeners[event]);
      this.graph.off(event, this.graphEmitListener);
    });
    Object.values(this.eventStreams).forEach(stream => stream.complete());
    this.graph$.complete();
    this._isClosed = true;
  }

  graphAttributes() {
    return this.eventStreams['attributesUpdated'].pipe(
      withLatestFrom(this.graph$),
      map(([_, graph]) => getAttributesApi(graph)),
      startWith(getAttributesApi(this.graph))
    );
  }

  node(nodeKey: string) {
    return this.eventStreams['nodeAttributesUpdated'].pipe(
      filter(([{ key }]) => key === nodeKey),
      map(() => getNodeAttributesApi(nodeKey, this.graph)),
      startWith(getNodeAttributesApi(nodeKey, this.graph)),
      takeUntil(
        merge(
          this.eventStreams['cleared'],
          this.eventStreams['nodeDropped'].pipe(filter(([{ key }]) => key === nodeKey))
        ).pipe(take(1))
      )
    );
  }

  edge(edgeKey: string) {
    return this.eventStreams['edgeAttributesUpdated'].pipe(
      filter(([{ key }]) => key === edgeKey),
      map(() => getEdgeAttributesApi(edgeKey, this.graph)),
      startWith(getEdgeAttributesApi(edgeKey, this.graph)),
      takeUntil(
        merge(
          this.eventStreams['cleared'],
          this.eventStreams['edgesCleared'],
          this.eventStreams['edgeDropped'].pipe(filter(([{ key }]) => key === edgeKey))
        ).pipe(take(1))
      )
    );
  }
}

export { GraphRx };
