import { ListenerEffectAPI, ListenerMiddlewareInstance, TypedStartListening, createListenerMiddleware } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "./store";

export const appListenerMiddleware = createListenerMiddleware();

type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export type AppListenerMiddlewareInstance = ListenerMiddlewareInstance<RootState, AppDispatch>;
export type AppListenerEffectApi = ListenerEffectAPI<RootState, AppDispatch>;

export const appStartListening = appListenerMiddleware.startListening as AppStartListening;
