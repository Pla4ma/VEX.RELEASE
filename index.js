// DIAGNOSTIC: Patch ErrorUtils BEFORE any module loads to capture [runtime not ready] errors
(function setupTrap() {
  try {
    var ErrorUtils = globalThis.ErrorUtils;
    if (ErrorUtils && ErrorUtils.getGlobalHandler && ErrorUtils.setGlobalHandler) {
      var _origHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler(function (error) {
        var err = error instanceof Error ? error : new Error(String(error));
        var msg = err.message || '';
        if (msg.indexOf('runtime not ready') !== -1 || msg.indexOf('undefined is not a function') !== -1) {
          console.error('[ERROR-TRAP] Message:', msg);
          console.error('[ERROR-TRAP] Stack:', err.stack);
          console.error('[ERROR-TRAP] Full error:', error);
        }
        if (typeof _origHandler === 'function') {
          _origHandler(error);
        }
      });
    }
  } catch (e) {}

  var _origConsoleError = console.error;
  console.error = function () {
    var args = Array.prototype.slice.call(arguments);
    var firstArg = args[0];
    if (typeof firstArg === 'string' && (firstArg.indexOf('runtime not ready') !== -1 || firstArg.indexOf('undefined is not a function') !== -1)) {
      console.error('[ERROR-TRAP] console.error runtime error:', args);
      console.error('[ERROR-TRAP] Stack:', new Error().stack);
    }
    _origConsoleError.apply(console, args);
  };
})();

// Use require instead of import to ensure the trap is set up first
require('./App');
