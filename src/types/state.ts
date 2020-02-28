import { CollectorComponent } from './collect';
import { Store } from './store';
import { AfterChangeEvent } from './updating';

export type State = {
  currentComponent: CollectorComponent | null;
  isInBrowser: boolean;
  isBatchUpdating: boolean;
  listeners: Map<string, Set<CollectorComponent>>;
  manualListeners: ((e: AfterChangeEvent) => void)[];
  nextStore: Store;
  proxyIsMuted: boolean;
  store: Store;
};
