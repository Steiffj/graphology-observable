# graphology-observable
An RxJS-based reactive wrapper for [Graphology](https://github.com/graphology/graphology).

## Overview
The graphology-observable package exposes a `GraphRx` class provides `Observable` streams of
a `Graph`'s nodes, edge, and attributes that emit as the underlying graph changes.
`GraphRx`'s goal is to provide an interface between Graphology's mutable `Graph` object
and environments that require immutable data flow, such as a Redux implementation, Angular,
or any other code that uses RxJS.

## Development Status
The current version of graphology-observable is functional but not feature complete.
The long-term goal is to provide `Observable` wrappers for all read aspects of Graphology's API.

The following features are planned for future development:
1. Add the ability to query a single edge by source and target node.
2. Implement `Observable` wrappers for the node/edge arrays.
3. Update TypeScript definitions to account for `Graph` objects using generic attribute arguments
(and other general typing improvements).
3. Improve support for environments outside of TypeScript.
