let DEBUG = localStorage.getItem('RECOLLECT__DEBUG') || 'off';

export const debugOn = () => {
  DEBUG = 'on';
  localStorage.setItem('RECOLLECT__DEBUG', DEBUG);
};

export const debugOff = () => {
  DEBUG = 'off';
  localStorage.setItem('RECOLLECT__DEBUG', DEBUG);
};


export const log = new Proxy(console, {
  get(target, prop) {
    // This means the line number for the log is where it was called, not here.
    if (DEBUG === 'on') return Reflect.get(target, prop);

    return () => {};
  },
});
