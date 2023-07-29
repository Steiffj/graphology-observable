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
 * Internal type to improve `eventStreams` initalization readabiliy.
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
  replaceAttribute: (attributes: Attributes) => {
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
  source: graph.source(edgeKey),
  target: graph.target(edgeKey),
  undirected: graph.isUndirected(edgeKey),
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
  replaceAttribute: (attributes: Attributes) => {
    graph.replaceEdgeAttributes(edgeKey, attributes);
  },
  mergeAttributes: (attributes: Attributes) => {
    graph.mergeEdgeAttributes(edgeKey, attributes);
  },
  updateAttributes: (updater: (attributes: Attributes) => Attributes) => {
    graph.updateEdgeAttributes(edgeKey, updater);
  }
});

class GraphRx {
  private graph$ = new Subject<Graph>();

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

  constructor(public readonly graph: Graph) {
    this.graph$.next(this.graph);

    this.events.forEach(event => {
      this.graph.on(event, () => {
        this.graph$.next(this.graph);
        this.graph.on(event, this.eventListeners[event]);
      });
    });
  }

  stream(): Observable<Graph> {
    return this.graph$;
  }

  on(event: keyof GraphEvents) {
    if (!this.graph.listeners(event).includes(this.eventListeners[event])) {
      this.graph.on(event, this.eventListeners[event]);
    }
  }

  off(event: keyof GraphEvents) {
    this.graph.off(event, this.eventListeners[event]);
  }

  complete() {
    objectKeys(this.eventListeners).forEach(event => {
      this.graph.off(event, this.eventListeners[event]);
    });
    Object.values(this.eventStreams).forEach(stream => stream.complete());
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
      withLatestFrom(this.graph$),
      map(([_, graph]) => getNodeAttributesApi(nodeKey, graph)),
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
      withLatestFrom(this.graph$),
      map(([_, graph]) => getEdgeAttributesApi(edgeKey, graph)),
      startWith(getEdgeAttributesApi(edgeKey, this.graph)),
      takeUntil(
        merge(
          this.eventStreams['cleared'],
          this.eventStreams['edgeDropped'].pipe(filter(([{ key }]) => key === edgeKey))
        ).pipe(take(1))
      )
    );
  }
}

export { GraphRx };
