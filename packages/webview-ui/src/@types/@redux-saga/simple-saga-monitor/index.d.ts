declare module '@redux-saga/simple-saga-monitor' {
  // simple type declaration for simple-saga-monitor because it doesn't have one
  // https://github.com/redux-saga/redux-saga/blob/main/packages/simple-saga-monitor/src/index.js
  import type { SagaMonitor } from "redux-saga";
  export = _ as SagaMonitor;
}