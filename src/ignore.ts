import state from './shared/state';

declare type FunctionEmptyReturn = () => any;

const ignoreProxy = (callback: FunctionEmptyReturn) => {
  state.proxyIsMuted = true;
  callback();
  state.proxyIsMuted = false;
};

export default ignoreProxy;
