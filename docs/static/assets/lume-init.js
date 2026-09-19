/**
 * Initializes the shared Lume tooltip engine after the pinned jsDelivr UMD
 * bundle has loaded.
 */
(() => {
  const Lume = window.Lume?.Lume ?? window.Lume;

  if (typeof Lume !== 'function') {
    console.warn('[TypeFlow docs] Lume tooltip engine did not load.');
    return;
  }

  window.typeflowLume?.destroy?.();
  window.typeflowLume = new Lume();
})();
