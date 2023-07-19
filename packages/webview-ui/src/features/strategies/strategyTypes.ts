import { AppListenerEffectApi } from "../../listenerMiddleware";
import {
  ScopeEntity,
  StackFrameEntity,
  ThreadEntity,
  VariablesEntity,
} from "../sessions/entities";
import { MatchActionListener } from "./listeners";

/**
 * Strategies and functions for specific debugger types ("python", "java", etc.)
 *
 * To implement support for a new debug type, add a directory under `./debugAdapters/`,
 * create an object that implements this interface,
 * then add it to `strategiesByDebugType` in `strategies.ts`.
 *
 * Most debug types probably only need to change a few methods. For example, one debugger might work
 * well with the default fetching logic, but you might want it to ignore specific variables. Or you
 * might want to add a new listener to handle other events, but keep the existing listeners. Here's
 * how you would handle that:
 * ```
 * export const myDebuggerStrategies: DebugTypeStrategies = {
 *   // Start by unpacking the default strategies
 *   ...defaultStrategies,
 * 
 *   // Override the function used to fetch variables after the debugger pauses
 *   fetchVariables: myFetchVariablesStrategy, // defined elsewhere
 * 
 *   // Add a new listener while keeping the existing default ones
 *   listeners: [...defaultStrategies.listeners, myNewActionListener],
 * };
 * ```
 */
export interface DebugTypeStrategies {
  /**
   * An array of `MatchActionListener`s for this debug type.
   * 
   * Listeners will run after an action is dispatched. You can use listeners to dispatch actions and
   * wait for them to finish, or do other async logic like fetching things from the debug adapter.
   * If you're familliar with redux sagas, listeners are basically a lightweight version of that.
   * 
   * These will start listening when the app is launched, but will only trigger when its matcher
   * is satisfied AND the action's `debugType` matches this debug type.
   * 
   * If you want to add new listeners while keeping the existing default ones, make sure you explicitly do that:
   * ```
   * export const MyDebuggerStrategies: DebugTypeStrategies = {
   *   // ...
   *   listeners: [...defaultStrategies.listeners, myNewActionListener],
   *   // ...
   * };
   * ```
   * 
   * @see {@link https://redux-toolkit.js.org/api/createListenerMiddleware} for more info about listeners.
   */
  listeners: MatchActionListener[];

  /**
   * Async function that fetches threads from the debug adapter after the debugger pauses.
   * This only does anything if `defaultDebuggerPausedListener` is used.
   */
  fetchThreads: FetchThreadsStrategy;

  /**
   * Async function that fetches stack frames from the debug adapter after the debugger pauses.
   * This only does anything if `defaultDebuggerPausedListener` is used.
   */
  fetchStackTraces: FetchStackTracesStrategy;

  /**
   * Async function that fetches scopes from the debug adapter after the debugger pauses.
   * This only does anything if `defaultDebuggerPausedListener` is used.
   */
  fetchScopes: FetchScopesStrategy;

  /**
   * Async function that fetches variables from the debug adapter after the debugger pauses.
   * This only does anything if `defaultDebuggerPausedListener` is used.
   */
  fetchVariables: FetchVariablesStrategy;
}

export type FetchThreadsStrategy = (
  api: AppListenerEffectApi,
  sessionId: string
) => Promise<ThreadEntity[]>;

export type FetchStackTracesStrategy = (
  api: AppListenerEffectApi,
  sessionId: string,
  threads: ThreadEntity[]
) => Promise<StackFrameEntity[]>;

export type FetchScopesStrategy = (
  api: AppListenerEffectApi,
  sessionId: string,
  stackFrames: StackFrameEntity[]
) => Promise<ScopeEntity[]>;

export type FetchVariablesStrategy = (
  api: AppListenerEffectApi,
  sessionId: string,
  scopes: ScopeEntity[]
) => Promise<VariablesEntity[]>;
