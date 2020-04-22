beforeEach(() => {
  // Not all tests load the whole library, so this can be undefined
  if (window.__RR__) window.__RR__.clearHistory();
});
