import { AfterChangeEvent, CollectorComponent, Store } from '../../index.d';

type State = {
  currentComponent: CollectorComponent | null;
  isInBrowser: boolean;
  isBatchUpdating: boolean;
  listeners: Map<string, Set<CollectorComponent>>;
  manualListeners: ((e: AfterChangeEvent) => void)[];
  nextStore: Store;
  proxyIsMuted: boolean;
  store: Store;
};

/**
 * Any state shared between modules goes here
 */
const state: State = {
  currentComponent: null,
  isInBrowser: typeof window !== 'undefined',
  listeners: new Map(),
  manualListeners: [],
  nextStore: {},
  proxyIsMuted: false,
  isBatchUpdating: false,
  store: {},
};

export default state;
