import { DebugEventName, DebugEvent } from "shared";
import { createSessionAction } from "./debugSessions/sessionAction";

function generateDebugEventAC<
  E extends DebugEventName>(event: E) {
  return createSessionAction<DebugEvent<E>>(`debugEvent/${event}`);
}

/**
 * Actions related to debug adapter events.
 * 
 * If you need to dispatch a specific action with a generic event,
 * index this object to get the correct action creator.
 */
export const debugEventAction: {
  [E in DebugEventName]: ReturnType<typeof generateDebugEventAC<E>>
} = {
  initialized: generateDebugEventAC("initialized"),
  stopped: generateDebugEventAC("stopped"),
  continued: generateDebugEventAC("continued"),
  exited: generateDebugEventAC("exited"),
  terminated: generateDebugEventAC("terminated"),
  thread: generateDebugEventAC("thread"),
  output: generateDebugEventAC("output"),
  breakpoint: generateDebugEventAC("breakpoint"),
  module: generateDebugEventAC("module"),
  loadedSource: generateDebugEventAC("loadedSource"),
  process: generateDebugEventAC("process"),
  capabilities: generateDebugEventAC("capabilities"),
  progressStart: generateDebugEventAC("progressStart"),
  progressUpdate: generateDebugEventAC("progressUpdate"),
  progressEnd: generateDebugEventAC("progressEnd"),
  invalidated: generateDebugEventAC("invalidated"),
  memory: generateDebugEventAC("memory"),
};
