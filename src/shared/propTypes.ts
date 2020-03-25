import PropTypes from 'prop-types';
import { whileMuted } from './utils';

const wrapMeIfYouCan = (item: any, handler: ProxyHandler<any>) => {
  if (
    typeof item === 'function' ||
    (typeof item === 'object' && item !== null)
  ) {
    return new Proxy(item, handler);
  }
  return item;
};

const handlerWithMuting: ProxyHandler<any> = {
  get(...args) {
    return wrapMeIfYouCan(Reflect.get(...args), this);
  },
  apply(...args) {
    // The PropTypes object is made up of functions that call functions, so
    // we recursively wrap responses in the same handler ('this')
    const result = whileMuted(() => Reflect.apply(...args));
    return wrapMeIfYouCan(result, this);
  },
};

// TODO (davidg): conditional export, how?
export default process.env.NODE_ENV !== 'production'
  ? new Proxy(PropTypes, handlerWithMuting)
  : PropTypes;
