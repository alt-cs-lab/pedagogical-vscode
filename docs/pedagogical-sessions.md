# Debug Sessions in Pedagogical

Pedagogical uses classes to determine how it should handle a debug session for each type of debugger. Sessions are highly customizable--you can extend the default session and make small changes to support a certain debugger, or you can forgo the default implementation entirely and render whatever you want.

## `BaseSession`

The [`BaseSession`](../packages/webview-ui/src/features/sessions/debugSessions/BaseSession.ts) abstract class is the bare minimum that a class needs to implement for Pedagogical to handle it. Each session must implement the following (read the doc comments in the code for more info):

- `initialState` - The initial state that will be assigned when a session reducer is added.
- `reducer` - The reducer function, which should be created using `createReducer` from redux-toolkit. When this reducer is added, it will only run if the debug session id matches `sessionId` in the action's `meta` property.
- `component` - The react component that will be rendered whenever the debug session is active in vscode.
- `addListeners(addListener)` - Returns a list of `addListener` actions that will be dispatched by the session manager. These actions will be cancelled and unsubscribed when the session is removed.

## `DefaultSession`

The [`DefaultSession`](../packages/webview-ui/src/features/sessions/debugSessions/default/DefaultSession.ts) is the fallback class that will be used if there is no class for a debug session. It contains implementations that will be useful for most debuggers, so if you want to add support for a debugger, you start by extending this class and override whatever you need.

### `strategies`

In addition to implementing the abstract `BaseSession` properties, `DefaultSession` adds a `strategies` property, which contains different strategies used for fetching objects or updating state. This makes it easy for other session types to extend `DefaultSession` if they only need to override a few specific strategies.

For example, the only different `PythonSession` has from `DefaultSession` is that it overrides `strategies.fetchVariables(...)` to ignore certain variables.

## `SessionManager`

The [`SessionManager`](../packages/webview-ui/src/features/sessions/sessionManager.ts) handles the adding and removing of sessions, as well as getting the component to be displayed.

When a debug session is started in vscode, the session manager will match the debug type to the session class (given by `sessionByDebugType` in the same file) then construct the session, subscribe the listeners, wrap its reducer to match the session id, then merge the reducer into the app's root reducer.

When a session closes, the session manager will remove the session's reducer and cancel and unsubscribe the listeners.
