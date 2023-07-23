import { ActionCreator, AnyAction, ListenerEffect, ListenerEffectAPI, ListenerMiddlewareInstance, TypedAddListener, TypedStartListening, createListenerMiddleware } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "./store";

export const appListenerMiddleware = createListenerMiddleware();

type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export type AppAddListener = TypedAddListener<RootState, AppDispatch>;
export type AppListenerMiddlewareInstance = ListenerMiddlewareInstance<RootState, AppDispatch>;
export type AppListenerEffect<A extends AnyAction | ActionCreator<AnyAction>> = ListenerEffect<
  A extends ActionCreator<AnyAction> ? ReturnType<A> : A,
  RootState,
  AppDispatch
>;
export type AppListenerEffectApi = ListenerEffectAPI<RootState, AppDispatch>;

export const appStartListening = appListenerMiddleware.startListening as AppStartListening;
