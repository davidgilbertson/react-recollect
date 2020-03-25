import * as OriginalPropTypes from 'prop-types';
import { whileMuted } from './utils';

let EnvPropTypes;

// In the dev build of Recollect, we wrap PropTypes in a proxy so we can
// mute the store while the prop types library reads the props.
if (process.env.NODE_ENV !== 'production') {
  // The PropTypes object is made up of functions that call functions, so
  // we recursively wrap responses in the same handler
  const wrapMeIfYouCan = (item: any, handler: ProxyHandler<any>) => {
    if (
      typeof item === 'function' ||
      (typeof item === 'object' && item !== null)
    ) {
      return new Proxy(item, handler);
    }
    return item;
  };

  const handler: ProxyHandler<any> = {
    get(...args) {
      return wrapMeIfYouCan(Reflect.get(...args), this);
    },
    apply(...args) {
      // Here we mute the function calls
      const result = whileMuted(() => Reflect.apply(...args));
      return wrapMeIfYouCan(result, this);
    },
  };

  EnvPropTypes = new Proxy(OriginalPropTypes, handler);
} else {
  // For prod builds, just use the normal PropTypes which is a no-op
  EnvPropTypes = OriginalPropTypes;
}

// We do this so we're exporting a const (EnvPropTypes is a let)
const PropTypes: typeof OriginalPropTypes = EnvPropTypes;

export default PropTypes;
