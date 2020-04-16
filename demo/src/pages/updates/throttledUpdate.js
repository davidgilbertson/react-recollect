let nextAction = null;

const throttledUpdate = (action) => {
  if (!nextAction) {
    nextAction = action;

    requestAnimationFrame(() => {
      nextAction();
      nextAction = null;
    });
  } else {
    nextAction = action;
  }
};

export default throttledUpdate;
