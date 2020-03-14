/**
 * This file is unfortunate. I would prefer for the proxy handler to call
 * `updateInNextStore` directly, but there is circular logic:
 * object change » handler » update store » clone » create proxy » handler
 * The logic is sound (?), but the import loop needs to be broken somewhere,
 * hence this file.
 */
import {
  AfterChangeEvent,
  UpdateInNextStore,
  UpdateInStoreNextProps,
} from './types';
import state from './state';

const enum ActionTypes {
  UpdateNextStore = 'UpdateNextStore',
}

type Subscribers = {
  UpdateNextStore?: UpdateInNextStore;
};

const subscribers: Subscribers = {};

export const onUpdateInNextStore = (func: UpdateInNextStore) => {
  subscribers[ActionTypes.UpdateNextStore] = func;
};

export const dispatchUpdateInNextStore = (data: UpdateInStoreNextProps) => {
  const func = subscribers[ActionTypes.UpdateNextStore];
  if (func) func(data);
};

/**
 * Add a callback to be called every time the store changes
 */
export const afterChange = (cb: (e: AfterChangeEvent) => void) => {
  state.manualListeners.push(cb);
};
