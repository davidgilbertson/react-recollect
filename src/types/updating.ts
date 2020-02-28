import { Store } from './store';
import { CollectorComponent } from './collect';

export type AfterChangeEvent = {
  store: Store;
  changedProps: string[];
  renderedComponents: CollectorComponent[];
  prevStore: Store;
};
