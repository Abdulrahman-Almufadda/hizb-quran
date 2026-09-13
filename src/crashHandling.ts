declare const ErrorUtils: {
  getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
  setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
};

/**
 * Catches JS errors that fall outside any React error boundary (e.g. thrown from
 * a timer, event handler, or unawaited promise) so they're logged instead of
 * silently killing the JS thread. Native-level crashes are outside JS's reach -
 * this only covers what the JS runtime can see.
 */
export function installGlobalErrorHandler(): void {
  if (typeof ErrorUtils === 'undefined') return;

  const previousHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error(`[GlobalError] isFatal=${String(isFatal)}:`, error);
    previousHandler?.(error, isFatal);
  });
}
