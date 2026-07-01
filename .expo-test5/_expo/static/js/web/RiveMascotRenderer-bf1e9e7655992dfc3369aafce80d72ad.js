__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  exports.RiveMascotRenderer = RiveMascotRenderer;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _riveAppReactNative = require(_dependencyMap[2]);
  var _PngMascotRenderer = require(_dependencyMap[3]);
  var _VexMascotGuideTokens = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  // SAFETY: require() needed for Metro asset bundling. Assets are resolved at build time.
  const RIVE_MASCOT_FILE = require(_dependencyMap[6]);
  function RiveMascotRenderer(props) {
    const {
      riveFile,
      isLoading,
      error
    } = (0, _riveAppReactNative.useRiveFile)(RIVE_MASCOT_FILE);
    const [hasRuntimeError, setHasRuntimeError] = (0, _react.useState)(false);
    (0, _react.useEffect)(() => {
      if (riveFile) {
        props.onReady?.();
      }
    }, [props, riveFile]);
    void _VexMascotGuideTokens.MASCOT_MOOD_NUMBER[props.mood];
    if (isLoading || error || !riveFile || hasRuntimeError) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PngMascotRenderer.PngMascotRenderer, Object.assign({}, props));
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      style: {
        width: props.size.width,
        height: props.size.height
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_riveAppReactNative.RiveView, {
        alignment: _riveAppReactNative.Alignment.Center,
        autoPlay: true,
        file: riveFile,
        fit: _riveAppReactNative.Fit.Contain,
        onError: () => {
          setHasRuntimeError(true);
        },
        style: {
          width: props.size.width,
          height: props.size.height
        }
      })
    });
  }
},3334,[12,80,3587,3022,3024,203,3692]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "NitroRiveView", {
    enumerable: true,
    get: function () {
      return _coreNitroRiveViewComponentJs.NitroRiveView;
    }
  });
  Object.defineProperty(exports, "RiveView", {
    enumerable: true,
    get: function () {
      return _coreRiveViewJs.RiveView;
    }
  });
  Object.defineProperty(exports, "Fit", {
    enumerable: true,
    get: function () {
      return _coreFitJs.Fit;
    }
  });
  Object.defineProperty(exports, "Alignment", {
    enumerable: true,
    get: function () {
      return _coreAlignmentJs.Alignment;
    }
  });
  Object.defineProperty(exports, "RiveFileFactory", {
    enumerable: true,
    get: function () {
      return _coreRiveFileJs.RiveFileFactory;
    }
  });
  Object.defineProperty(exports, "RiveImages", {
    enumerable: true,
    get: function () {
      return _coreRiveImagesJs.RiveImages;
    }
  });
  Object.defineProperty(exports, "RiveFonts", {
    enumerable: true,
    get: function () {
      return _coreRiveFontsJs.RiveFonts;
    }
  });
  Object.defineProperty(exports, "RiveColor", {
    enumerable: true,
    get: function () {
      return _coreRiveColorJs.RiveColor;
    }
  });
  Object.defineProperty(exports, "RiveEventType", {
    enumerable: true,
    get: function () {
      return _coreEventsJs.RiveEventType;
    }
  });
  Object.defineProperty(exports, "RiveErrorType", {
    enumerable: true,
    get: function () {
      return _coreErrorsJs.RiveErrorType;
    }
  });
  Object.defineProperty(exports, "ArtboardByIndex", {
    enumerable: true,
    get: function () {
      return _specsArtboardByJs.ArtboardByIndex;
    }
  });
  Object.defineProperty(exports, "ArtboardByName", {
    enumerable: true,
    get: function () {
      return _specsArtboardByJs.ArtboardByName;
    }
  });
  Object.defineProperty(exports, "useRive", {
    enumerable: true,
    get: function () {
      return _hooksUseRiveJs.useRive;
    }
  });
  Object.defineProperty(exports, "useRiveNumber", {
    enumerable: true,
    get: function () {
      return _hooksUseRiveNumberJs.useRiveNumber;
    }
  });
  Object.defineProperty(exports, "useRiveString", {
    enumerable: true,
    get: function () {
      return _hooksUseRiveStringJs.useRiveString;
    }
  });
  Object.defineProperty(exports, "useRiveBoolean", {
    enumerable: true,
    get: function () {
      return _hooksUseRiveBooleanJs.useRiveBoolean;
    }
  });
  Object.defineProperty(exports, "useRiveEnum", {
    enumerable: true,
    get: function () {
      return _hooksUseRiveEnumJs.useRiveEnum;
    }
  });
  Object.defineProperty(exports, "useRiveColor", {
    enumerable: true,
    get: function () {
      return _hooksUseRiveColorJs.useRiveColor;
    }
  });
  Object.defineProperty(exports, "useRiveTrigger", {
    enumerable: true,
    get: function () {
      return _hooksUseRiveTriggerJs.useRiveTrigger;
    }
  });
  Object.defineProperty(exports, "useRiveList", {
    enumerable: true,
    get: function () {
      return _hooksUseRiveListJs.useRiveList;
    }
  });
  Object.defineProperty(exports, "useViewModelInstance", {
    enumerable: true,
    get: function () {
      return _hooksUseViewModelInstanceJs.useViewModelInstance;
    }
  });
  Object.defineProperty(exports, "useRiveFile", {
    enumerable: true,
    get: function () {
      return _hooksUseRiveFileJs.useRiveFile;
    }
  });
  Object.defineProperty(exports, "RiveRuntime", {
    enumerable: true,
    get: function () {
      return _coreRiveRuntimeJs.RiveRuntime;
    }
  });
  Object.defineProperty(exports, "DataBindByName", {
    enumerable: true,
    get: function () {
      return DataBindByName;
    }
  });
  Object.defineProperty(exports, "DataBindMode", {
    enumerable: true,
    get: function () {
      return _specsRiveViewNitroJs.DataBindMode;
    }
  });
  var _specsRiveViewNitroJs = require(_dependencyMap[0]);
  var _coreNitroRiveViewComponentJs = require(_dependencyMap[1]);
  var _coreRiveViewJs = require(_dependencyMap[2]);
  var _coreFitJs = require(_dependencyMap[3]);
  var _coreAlignmentJs = require(_dependencyMap[4]);
  var _coreRiveFileJs = require(_dependencyMap[5]);
  var _coreRiveImagesJs = require(_dependencyMap[6]);
  var _coreRiveFontsJs = require(_dependencyMap[7]);
  var _coreRiveColorJs = require(_dependencyMap[8]);
  var _coreEventsJs = require(_dependencyMap[9]);
  var _coreErrorsJs = require(_dependencyMap[10]);
  var _specsArtboardByJs = require(_dependencyMap[11]);
  var _hooksUseRiveJs = require(_dependencyMap[12]);
  var _hooksUseRiveNumberJs = require(_dependencyMap[13]);
  var _hooksUseRiveStringJs = require(_dependencyMap[14]);
  var _hooksUseRiveBooleanJs = require(_dependencyMap[15]);
  var _hooksUseRiveEnumJs = require(_dependencyMap[16]);
  var _hooksUseRiveColorJs = require(_dependencyMap[17]);
  var _hooksUseRiveTriggerJs = require(_dependencyMap[18]);
  var _hooksUseRiveListJs = require(_dependencyMap[19]);
  var _hooksUseViewModelInstanceJs = require(_dependencyMap[20]);
  var _hooksUseRiveFileJs = require(_dependencyMap[21]);
  var _coreRiveRuntimeJs = require(_dependencyMap[22]);
  class DataBindByName {
    constructor(name) {
      this.byName = name;
    }
  }
},3587,[3588,3589,3666,3671,3672,3673,3674,3675,3676,3677,3669,3678,3679,3680,3683,3684,3685,3686,3687,3688,3689,3690,3691]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "DataBindMode", {
    enumerable: true,
    get: function () {
      return DataBindMode;
    }
  });
  let DataBindMode = /*#__PURE__*/function (DataBindMode) {
    DataBindMode[DataBindMode["Auto"] = 0] = "Auto";
    DataBindMode[DataBindMode["None"] = 1] = "None";
    return DataBindMode;
  }({});

  /**
   * Props interface for the RiveView component.
   * Extends HybridViewProps to include Rive-specific properties.
   */

  /**
   * Methods interface for the RiveView component.
   * Extends HybridViewMethods to include Rive-specific methods.
   */

  /**
   * Type definition for the RiveView component.
   * Combines RiveViewProps and RiveViewMethods with the HybridView type.
   */
},3588,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "NitroRiveView", {
    enumerable: true,
    get: function () {
      return NitroRiveView;
    }
  });
  var _reactNativeNitroModules = require(_dependencyMap[0]);
  var _nitrogenGeneratedSharedJsonRiveViewConfigJson = require(_dependencyMap[1]);
  var RiveViewConfig = _interopDefault(_nitrogenGeneratedSharedJsonRiveViewConfigJson);
  const NitroRiveView = (0, _reactNativeNitroModules.getHostComponent)('RiveView', () => RiveViewConfig.default);
},3589,[3590,3665]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var _workletsInstallWorkletsSupport = require(_dependencyMap[0]);
  var _AnyHybridObject = require(_dependencyMap[1]);
  Object.keys(_AnyHybridObject).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _AnyHybridObject[k];
        }
      });
    }
  });
  var _AnyMap = require(_dependencyMap[2]);
  Object.keys(_AnyMap).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _AnyMap[k];
        }
      });
    }
  });
  var _BoxedHybridObject = require(_dependencyMap[3]);
  Object.keys(_BoxedHybridObject).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _BoxedHybridObject[k];
        }
      });
    }
  });
  var _CustomType = require(_dependencyMap[4]);
  Object.keys(_CustomType).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _CustomType[k];
        }
      });
    }
  });
  var _getHybridObjectConstructor = require(_dependencyMap[5]);
  Object.keys(_getHybridObjectConstructor).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _getHybridObjectConstructor[k];
        }
      });
    }
  });
  var _HybridObject = require(_dependencyMap[6]);
  Object.keys(_HybridObject).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _HybridObject[k];
        }
      });
    }
  });
  var _NitroModules = require(_dependencyMap[7]);
  Object.keys(_NitroModules).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _NitroModules[k];
        }
      });
    }
  });
  var _Sync = require(_dependencyMap[8]);
  Object.keys(_Sync).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _Sync[k];
        }
      });
    }
  });
  var _Int = require(_dependencyMap[9]);
  Object.keys(_Int).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _Int[k];
        }
      });
    }
  });
  var _viewsHybridView = require(_dependencyMap[10]);
  Object.keys(_viewsHybridView).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _viewsHybridView[k];
        }
      });
    }
  });
  var _viewsGetHostComponent = require(_dependencyMap[11]);
  Object.keys(_viewsGetHostComponent).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _viewsGetHostComponent[k];
        }
      });
    }
  });
  (0, _workletsInstallWorkletsSupport.installWorkletsSupport)();
},3590,[3591,3594,3595,3596,3597,3598,3599,3592,3600,3601,3602,3603]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.installWorkletsSupport = installWorkletsSupport;
  var _NitroModules = require(_dependencyMap[0]);
  const _worklet_2425421307002_init_data = {
    code: "function determine_installWorkletsSupportJs1(value){const{boxedNitroProxy}=this.__closure;const nitroProxy=boxedNitroProxy.unbox();return nitroProxy.isHybridObject(value);}"
  };
  const _worklet_4248512736475_init_data = {
    code: "function pack_installWorkletsSupportJs2(value){const{boxedNitroProxy}=this.__closure;const nitroProxy=boxedNitroProxy.unbox();return nitroProxy.box(value);}"
  };
  const _worklet_1991944678660_init_data = {
    code: "function unpack_installWorkletsSupportJs3(value){return value.unbox();}"
  };
  function installWorkletsSupport() {
    try {
      const {
        registerCustomSerializable
      } = require(_dependencyMap[1], "react-native-worklets");
      const boxedNitroProxy = _NitroModules.NitroModules.box(_NitroModules.NitroModules);
      registerCustomSerializable({
        name: 'nitro.HybridObject',
        determine: function determine_installWorkletsSupportJs1Factory({
          _worklet_2425421307002_init_data,
          boxedNitroProxy
        }) {
          const determine = function (value) {
            const nitroProxy = boxedNitroProxy.unbox();
            return nitroProxy.isHybridObject(value);
          };
          determine.__closure = {
            boxedNitroProxy
          };
          determine.__workletHash = 2425421307002;
          determine.__initData = _worklet_2425421307002_init_data;
          return determine;
        }({
          _worklet_2425421307002_init_data,
          boxedNitroProxy
        }),
        pack: function pack_installWorkletsSupportJs2Factory({
          _worklet_4248512736475_init_data,
          boxedNitroProxy
        }) {
          const pack = function (value) {
            const nitroProxy = boxedNitroProxy.unbox();
            return nitroProxy.box(value);
          };
          pack.__closure = {
            boxedNitroProxy
          };
          pack.__workletHash = 4248512736475;
          pack.__initData = _worklet_4248512736475_init_data;
          return pack;
        }({
          _worklet_4248512736475_init_data,
          boxedNitroProxy
        }),
        unpack: function unpack_installWorkletsSupportJs3Factory({
          _worklet_1991944678660_init_data
        }) {
          const unpack = function (value) {
            return value.unbox();
          };
          unpack.__closure = {};
          unpack.__workletHash = 1991944678660;
          unpack.__initData = _worklet_1991944678660_init_data;
          return unpack;
        }({
          _worklet_1991944678660_init_data
        })
      });
    } catch {
      // react-native-worklets not installed.
    }
  }
},3591,[3592,229]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  // Re-exports the platform specific `NitroModulesProxy` (or a stub-implementation if not found)
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var _turbomoduleNativeNitroModules = require(_dependencyMap[0]);
  Object.keys(_turbomoduleNativeNitroModules).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _turbomoduleNativeNitroModules[k];
        }
      });
    }
  });
},3592,[3593]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "NitroModules", {
    enumerable: true,
    get: function () {
      return NitroModules;
    }
  });
  exports.isRuntimeAlive = isRuntimeAlive;
  require(_dependencyMap[0]);
  const NitroModules = new Proxy({}, {
    get: () => {
      throw new Error(`Native NitroModules are not available on ${"web"}! Make sure you're not calling getNativeNitroModules() in a ${"web"} (.${"web"}.ts) environment.`);
    }
  });
  function isRuntimeAlive() {
    return false;
  }
},3593,[18]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";
},3594,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";
},3595,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";
},3596,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";
},3597,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getHybridObjectConstructor = getHybridObjectConstructor;
  var _NitroModules = require(_dependencyMap[0]);
  const cache = new Map();

  /**
   * Get a constructor function for the given `HybridObject` {@linkcode T}.
   * @param name The name of the `HybridObject` under which it was registered at.
   * @returns A constructor that creates instances of {@linkcode T}
   * @example
   * ```ts
   * export const HybridImage = getHybridObjectConstructor<Image>('Image')
   *
   * const image1 = new HybridImage()
   * const image2 = new HybridImage()
   * image1 instanceof HybridImage // --> true
   * ```
   */
  function getHybridObjectConstructor(name) {
    // Cache functions for performance.
    if (cache.has(name)) {
      return cache.get(name);
    }

    // A function that creates the HybridObject.
    // This can be called with `new`, and internally sets the prototype.
    const constructorFunc = function () {
      const instance = _NitroModules.NitroModules.createHybridObject(name);
      const prototype = Object.getPrototypeOf(instance);
      if (constructorFunc.prototype !== prototype) {
        constructorFunc.prototype = prototype;
        constructorFunc.prototypeInitialized = true;
      }
      return instance;
    };

    // Configure lazy prototype. If `instanceof` is called before a `T`
    // has been created, we just lazy-create a new `T` instance to set the proto.
    constructorFunc.prototypeInitialized = false;
    Object.defineProperty(constructorFunc, Symbol.hasInstance, {
      value: instance => {
        if (!constructorFunc.prototypeInitialized) {
          // User didn't call `new T()` yet, so we don't
          // know the prototype yet. Just create one temp object to find
          // out the prototype.
          const tempInstance = _NitroModules.NitroModules.createHybridObject(name);
          constructorFunc.prototype = Object.getPrototypeOf(tempInstance);
          constructorFunc.prototypeInitialized = true;
        }
        // Loop through the prototype chain of the value
        // we're testing for to see if it is a direct instance
        // of `T`, or a derivative of it.
        let proto = Object.getPrototypeOf(instance);
        while (proto != null) {
          if (proto === constructorFunc.prototype) {
            return true;
          }
          proto = Object.getPrototypeOf(proto);
        }
        // No prototype overlap.
        return false;
      }
    });
    cache.set(name, constructorFunc);
    return constructorFunc;
  }
},3598,[3592]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";
},3599,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";
},3600,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";
},3601,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";
},3602,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = {};
    if (e) Object.keys(e).forEach(function (k) {
      var d = Object.getOwnPropertyDescriptor(e, k);
      Object.defineProperty(n, k, d.get ? d : {
        enumerable: true,
        get: function () {
          return e[k];
        }
      });
    });
    n.default = e;
    return n;
  }
  exports.getHostComponent = getHostComponent;
  exports.callback = callback;
  require(_dependencyMap[0]);
  var _reactNativeLibrariesNativeComponentNativeComponentRegistry = require(_dependencyMap[1]);
  var NativeComponentRegistry = _interopNamespace(_reactNativeLibrariesNativeComponentNativeComponentRegistry);
  // TODO: Migrate to the official export of `NativeComponentRegistry` from `react-native` once react-native 0.83.0 becomes more established as this is deprecated
  // eslint-disable-next-line @react-native/no-deep-imports

  function typesafe(config) {
    // TODO: Remove this unsafe cast and make it safe
    return config;
  }

  /**
   * Represents all default props a Nitro HybridView has.
   */

  /**
   * Wraps a callback function in a Nitro-compatible object format.
   *
   * @note Due to a React limitation, functions cannot be passed to native directly
   * because RN converts them to booleans (`true`). As a workaround,
   * Nitro requires you to wrap each function using `callback(...)`,
   * which bypasses React Native's conversion.
   * Please see the [Callbacks have to be wrapped](https://nitro.margelo.com/docs/guides/view-components#callbacks-have-to-be-wrapped) section for more information.
   *
   * @type {Object} NitroViewWrappedCallback
   * @property {T} f - The wrapped callback function
   */

  // Due to a React limitation, functions cannot be passed to native directly
  // because RN converts them to booleans (`true`). Nitro knows this and just
  // wraps functions as objects - the original function is stored in `f`.

  /**
   * Represents a React Native view, implemented as a Nitro View, with the given props and methods.
   *
   * @note Every React Native view has a {@linkcode DefaultHybridViewProps.hybridRef hybridRef} which can be used to gain access
   *       to the underlying Nitro {@linkcode HybridView}.
   * @note Every function/callback is wrapped as a `{ f: … }` object. Use {@linkcode callback | callback(...)} for this.
   * @note Every method can be called on the Ref. Including setting properties directly.
   */

  /**
   * Wraps all valid attributes of {@linkcode TProps} using Nitro's
   * default `diff` and `process` functions.
   */
  function wrapValidAttributes(attributes) {
    const keys = Object.keys(attributes);
    for (const key of keys) {
      attributes[key] = {
        diff: (a, b) => a !== b,
        process: i => i
      };
    }
    return attributes;
  }

  /**
   * Finds and returns a native view (aka "HostComponent") via the given {@linkcode name}.
   *
   * The view is bridged to a native Hybrid Object using Nitro Views.
   */
  function getHostComponent(name, getViewConfig) {
    if (NativeComponentRegistry == null) {
      throw new Error(`NativeComponentRegistry is not available on ${"web"}!`);
    }
    return NativeComponentRegistry.get(name, () => {
      const config = getViewConfig();
      config.validAttributes = wrapValidAttributes(config.validAttributes);
      return typesafe(config);
    });
  }

  /**
   * Wrap the given {@linkcode func} in a Nitro callback.
   * - For older versions of react-native, this wraps the callback in a `{ f: T }` object.
   * - For newer versions of react-native, this just returns the function as-is.
   */

  function callback(func) {
    if (typeof func === 'function') {
      return {
        f: func
      };
    }
    return func;
  }
},3603,[18,3604]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = {};
    if (e) Object.keys(e).forEach(function (k) {
      var d = Object.getOwnPropertyDescriptor(e, k);
      Object.defineProperty(n, k, d.get ? d : {
        enumerable: true,
        get: function () {
          return e[k];
        }
      });
    });
    n.default = e;
    return n;
  }
  exports.setRuntimeConfigProvider = setRuntimeConfigProvider;
  exports.get = get;
  exports.getWithFallback_DEPRECATED = getWithFallback_DEPRECATED;
  exports.unstable_hasStaticViewConfig = unstable_hasStaticViewConfig;
  var _ReactNativeGetNativeComponentAttributes = require(_dependencyMap[0]);
  var getNativeComponentAttributes = _interopDefault(_ReactNativeGetNativeComponentAttributes);
  var _ReactNativeUIManager = require(_dependencyMap[1]);
  var UIManager = _interopDefault(_ReactNativeUIManager);
  var _RendererShimsReactNativeViewConfigRegistry = require(_dependencyMap[2]);
  var ReactNativeViewConfigRegistry = _interopNamespace(_RendererShimsReactNativeViewConfigRegistry);
  var _StaticViewConfigValidator = require(_dependencyMap[3]);
  var StaticViewConfigValidator = _interopNamespace(_StaticViewConfigValidator);
  var _ViewConfig = require(_dependencyMap[4]);
  var _invariant = require(_dependencyMap[5]);
  var invariant = _interopDefault(_invariant);
  require(_dependencyMap[6]);
  let getRuntimeConfig;
  function setRuntimeConfigProvider(runtimeConfigProvider) {
    if (getRuntimeConfig === undefined) {
      getRuntimeConfig = runtimeConfigProvider;
    }
  }
  function get(name, viewConfigProvider) {
    ReactNativeViewConfigRegistry.register(name, () => {
      const {
        native,
        verify
      } = getRuntimeConfig?.(name) ?? {
        native: !global.RN$Bridgeless,
        verify: false
      };
      let viewConfig;
      if (native) {
        viewConfig = (0, getNativeComponentAttributes.default)(name) ?? (0, _ViewConfig.createViewConfig)(viewConfigProvider());
      } else {
        viewConfig = (0, _ViewConfig.createViewConfig)(viewConfigProvider()) ?? (0, getNativeComponentAttributes.default)(name);
      }
      (0, invariant.default)(viewConfig != null, 'NativeComponentRegistry.get: both static and native view config are missing for native component "%s".', name);
      if (verify) {
        const nativeViewConfig = native ? viewConfig : (0, getNativeComponentAttributes.default)(name);
        if (nativeViewConfig == null) {
          return viewConfig;
        }
        const staticViewConfig = native ? (0, _ViewConfig.createViewConfig)(viewConfigProvider()) : viewConfig;
        const validationOutput = StaticViewConfigValidator.validate(name, nativeViewConfig, staticViewConfig);
        if (validationOutput.type === 'invalid') {
          console.error(StaticViewConfigValidator.stringifyValidationResult(name, validationOutput));
        }
      }
      return viewConfig;
    });
    return name;
  }
  function getWithFallback_DEPRECATED(name, viewConfigProvider) {
    if (getRuntimeConfig == null) {
      if (hasNativeViewConfig(name)) {
        return get(name, viewConfigProvider);
      }
    } else {
      if (getRuntimeConfig(name) != null) {
        return get(name, viewConfigProvider);
      }
    }
    const FallbackNativeComponent = function (props) {
      return null;
    };
    FallbackNativeComponent.displayName = `Fallback(${name})`;
    return FallbackNativeComponent;
  }
  function hasNativeViewConfig(name) {
    (0, invariant.default)(getRuntimeConfig == null, 'Unexpected invocation!');
    return UIManager.default.getViewManagerConfig(name) != null;
  }
  function unstable_hasStaticViewConfig(name) {
    const {
      native
    } = getRuntimeConfig?.(name) ?? {
      native: true
    };
    return !native;
  }
},3604,[3605,3652,3660,3661,3662,644,12]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _StyleSheetProcessBoxShadow = require(_dependencyMap[0]);
  var processBoxShadow = _interopDefault(_StyleSheetProcessBoxShadow);
  const ReactNativeStyleAttributes = require(_dependencyMap[1]).default;
  const resolveAssetSource = require(_dependencyMap[2]).default;
  const processBackgroundImage = require(_dependencyMap[3]).default;
  const processBackgroundPosition = require(_dependencyMap[4]).default;
  const processBackgroundRepeat = require(_dependencyMap[5]).default;
  const processBackgroundSize = require(_dependencyMap[6]).default;
  const processColor = require(_dependencyMap[7]).default;
  const processColorArray = require(_dependencyMap[8]).default;
  const processFilter = require(_dependencyMap[9]).default;
  const insetsDiffer = require(_dependencyMap[10]).default;
  const matricesDiffer = require(_dependencyMap[11]).default;
  const pointsDiffer = require(_dependencyMap[12]).default;
  const sizesDiffer = require(_dependencyMap[13]).default;
  const UIManager = require(_dependencyMap[14]).default;
  const nullthrows = require(_dependencyMap[15]);
  function getNativeComponentAttributes(uiViewClassName) {
    const viewConfig = UIManager.getViewManagerConfig(uiViewClassName);
    if (viewConfig == null) {
      return null;
    }
    let {
      baseModuleName,
      bubblingEventTypes,
      directEventTypes
    } = viewConfig;
    let nativeProps = viewConfig.NativeProps;
    bubblingEventTypes = bubblingEventTypes ?? {};
    directEventTypes = directEventTypes ?? {};
    while (baseModuleName) {
      const baseModule = UIManager.getViewManagerConfig(baseModuleName);
      if (!baseModule) {
        baseModuleName = null;
      } else {
        bubblingEventTypes = Object.assign({}, baseModule.bubblingEventTypes, bubblingEventTypes);
        directEventTypes = Object.assign({}, baseModule.directEventTypes, directEventTypes);
        nativeProps = Object.assign({}, baseModule.NativeProps, nativeProps);
        baseModuleName = baseModule.baseModuleName;
      }
    }
    const validAttributes = {};
    for (const key in nativeProps) {
      const typeName = nativeProps[key];
      const diff = getDifferForType(typeName);
      const process = getProcessorForType(typeName);
      validAttributes[key] = diff == null ? process == null ? true : {
        process
      } : process == null ? {
        diff
      } : {
        diff,
        process
      };
    }
    validAttributes.style = ReactNativeStyleAttributes;
    Object.assign(viewConfig, {
      uiViewClassName,
      validAttributes,
      bubblingEventTypes,
      directEventTypes
    });
    attachDefaultEventTypes(viewConfig);
    return viewConfig;
  }
  function attachDefaultEventTypes(viewConfig) {
    const constants = UIManager.getConstants();
    if (constants.ViewManagerNames || constants.LazyViewManagersEnabled) {
      viewConfig = merge(viewConfig, nullthrows(UIManager.getDefaultEventTypes)());
    } else {
      viewConfig.bubblingEventTypes = merge(viewConfig.bubblingEventTypes, constants.genericBubblingEventTypes);
      viewConfig.directEventTypes = merge(viewConfig.directEventTypes, constants.genericDirectEventTypes);
    }
  }
  function merge(destination, source) {
    if (!source) {
      return destination;
    }
    if (!destination) {
      return source;
    }
    for (const key in source) {
      if (!source.hasOwnProperty(key)) {
        continue;
      }
      let sourceValue = source[key];
      if (destination.hasOwnProperty(key)) {
        const destinationValue = destination[key];
        if (typeof sourceValue === 'object' && typeof destinationValue === 'object') {
          sourceValue = merge(destinationValue, sourceValue);
        }
      }
      destination[key] = sourceValue;
    }
    return destination;
  }
  function getDifferForType(typeName) {
    switch (typeName) {
      case 'CATransform3D':
        return matricesDiffer;
      case 'CGPoint':
        return pointsDiffer;
      case 'CGSize':
        return sizesDiffer;
      case 'UIEdgeInsets':
        return insetsDiffer;
      case 'Point':
        return pointsDiffer;
      case 'EdgeInsets':
        return insetsDiffer;
    }
    return null;
  }
  function getProcessorForType(typeName) {
    switch (typeName) {
      case 'CGColor':
      case 'UIColor':
        return processColor;
      case 'CGColorArray':
      case 'UIColorArray':
        return processColorArray;
      case 'CGImage':
      case 'UIImage':
      case 'RCTImageSource':
        return resolveAssetSource;
      case 'BoxShadowArray':
        return processBoxShadow.default;
      case 'FilterArray':
        return processFilter;
      case 'Color':
        return processColor;
      case 'ColorArray':
        return processColorArray;
      case 'Filter':
        return processFilter;
      case 'BackgroundImage':
        return processBackgroundImage;
      case 'BackgroundPosition':
        return processBackgroundPosition;
      case 'BackgroundRepeat':
        return processBackgroundRepeat;
      case 'BackgroundSize':
        return processBackgroundSize;
      case 'ImageSource':
        return resolveAssetSource;
      case 'BoxShadow':
        return processBoxShadow.default;
    }
    return null;
  }
  var _default = getNativeComponentAttributes;
},3605,[3606,3625,3636,3627,3628,3629,3630,3620,3648,3631,3649,3650,3651,3635,3652,191]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return processBoxShadow;
    }
  });
  var _srcPrivateFeatureflagsReactNativeFeatureFlags = require(_dependencyMap[0]);
  var _processColor = require(_dependencyMap[1]);
  var processColor = _interopDefault(_processColor);
  const COMMA_SPLIT_REGEX = /,(?![^()]*\))/;
  const WHITESPACE_SPLIT_REGEX = /\s+(?![^(]*\))/;
  const LENGTH_PARSE_REGEX = /^([+-]?\d*\.?\d+)(px)?$/;
  const NEWLINE_REGEX = /\n/g;
  function processBoxShadow(rawBoxShadows) {
    const result = [];
    if (rawBoxShadows == null) {
      return result;
    }
    const boxShadowList = typeof rawBoxShadows === 'string' ? parseBoxShadowString(rawBoxShadows.replace((0, _srcPrivateFeatureflagsReactNativeFeatureFlags.enableOptimizedBoxShadowParsing)() ? NEWLINE_REGEX : /\n/g, ' ')) : rawBoxShadows;
    for (const rawBoxShadow of boxShadowList) {
      const parsedBoxShadow = {
        offsetX: 0,
        offsetY: 0
      };
      let value;
      for (const arg in rawBoxShadow) {
        switch (arg) {
          case 'offsetX':
            value = typeof rawBoxShadow.offsetX === 'string' ? parseLength(rawBoxShadow.offsetX) : rawBoxShadow.offsetX;
            if (value == null) {
              return [];
            }
            parsedBoxShadow.offsetX = value;
            break;
          case 'offsetY':
            value = typeof rawBoxShadow.offsetY === 'string' ? parseLength(rawBoxShadow.offsetY) : rawBoxShadow.offsetY;
            if (value == null) {
              return [];
            }
            parsedBoxShadow.offsetY = value;
            break;
          case 'spreadDistance':
            value = typeof rawBoxShadow.spreadDistance === 'string' ? parseLength(rawBoxShadow.spreadDistance) : rawBoxShadow.spreadDistance;
            if (value == null) {
              return [];
            }
            parsedBoxShadow.spreadDistance = value;
            break;
          case 'blurRadius':
            value = typeof rawBoxShadow.blurRadius === 'string' ? parseLength(rawBoxShadow.blurRadius) : rawBoxShadow.blurRadius;
            if (value == null || value < 0) {
              return [];
            }
            parsedBoxShadow.blurRadius = value;
            break;
          case 'color':
            const color = (0, processColor.default)(rawBoxShadow.color);
            if (color == null) {
              return [];
            }
            parsedBoxShadow.color = color;
            break;
          case 'inset':
            parsedBoxShadow.inset = rawBoxShadow.inset;
        }
      }
      result.push(parsedBoxShadow);
    }
    return result;
  }
  function parseBoxShadowString(rawBoxShadows) {
    let result = [];
    for (const rawBoxShadow of rawBoxShadows.split((0, _srcPrivateFeatureflagsReactNativeFeatureFlags.enableOptimizedBoxShadowParsing)() ? COMMA_SPLIT_REGEX : /,(?![^()]*\))/).map(bS => bS.trim()).filter(bS => bS !== '')) {
      const boxShadow = {
        offsetX: 0,
        offsetY: 0
      };
      let offsetX;
      let offsetY;
      let keywordDetectedAfterLength = false;
      let lengthCount = 0;
      const args = rawBoxShadow.split((0, _srcPrivateFeatureflagsReactNativeFeatureFlags.enableOptimizedBoxShadowParsing)() ? WHITESPACE_SPLIT_REGEX : /\s+(?![^(]*\))/);
      for (const arg of args) {
        const processedColor = (0, processColor.default)(arg);
        if (processedColor != null) {
          if (boxShadow.color != null) {
            return [];
          }
          if (offsetX != null) {
            keywordDetectedAfterLength = true;
          }
          boxShadow.color = arg;
          continue;
        }
        if (arg === 'inset') {
          if (boxShadow.inset != null) {
            return [];
          }
          if (offsetX != null) {
            keywordDetectedAfterLength = true;
          }
          boxShadow.inset = true;
          continue;
        }
        switch (lengthCount) {
          case 0:
            offsetX = arg;
            lengthCount++;
            break;
          case 1:
            if (keywordDetectedAfterLength) {
              return [];
            }
            offsetY = arg;
            lengthCount++;
            break;
          case 2:
            if (keywordDetectedAfterLength) {
              return [];
            }
            boxShadow.blurRadius = arg;
            lengthCount++;
            break;
          case 3:
            if (keywordDetectedAfterLength) {
              return [];
            }
            boxShadow.spreadDistance = arg;
            lengthCount++;
            break;
          default:
            return [];
        }
      }
      if (offsetX == null || offsetY == null) {
        return [];
      }
      boxShadow.offsetX = offsetX;
      boxShadow.offsetY = offsetY;
      result.push(boxShadow);
    }
    return result;
  }
  function parseLength(length) {
    if ((0, _srcPrivateFeatureflagsReactNativeFeatureFlags.enableOptimizedBoxShadowParsing)()) {
      const match = LENGTH_PARSE_REGEX.exec(length);
      if (!match) {
        return null;
      }
      const value = parseFloat(match[1]);
      if (Number.isNaN(value)) {
        return null;
      }
      if (match[2] == null && value !== 0) {
        return null;
      }
      return value;
    }
    const argsWithUnitsRegex = /([+-]?\d*(\.\d+)?)([\w\W]+)?/g;
    const match = argsWithUnitsRegex.exec(length);
    if (!match || Number.isNaN(match[1])) {
      return null;
    }
    if (match[3] != null && match[3] !== 'px') {
      return null;
    }
    if (match[3] == null && match[1] !== '0') {
      return null;
    }
    return Number(match[1]);
  }
},3606,[3607,3620]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "jsOnlyTestFlag", {
    enumerable: true,
    get: function () {
      return jsOnlyTestFlag;
    }
  });
  Object.defineProperty(exports, "animatedShouldDebounceQueueFlush", {
    enumerable: true,
    get: function () {
      return animatedShouldDebounceQueueFlush;
    }
  });
  Object.defineProperty(exports, "animatedShouldUseSingleOp", {
    enumerable: true,
    get: function () {
      return animatedShouldUseSingleOp;
    }
  });
  Object.defineProperty(exports, "deferFlatListFocusChangeRenderUpdate", {
    enumerable: true,
    get: function () {
      return deferFlatListFocusChangeRenderUpdate;
    }
  });
  Object.defineProperty(exports, "disableMaintainVisibleContentPosition", {
    enumerable: true,
    get: function () {
      return disableMaintainVisibleContentPosition;
    }
  });
  Object.defineProperty(exports, "enableOptimizedBoxShadowParsing", {
    enumerable: true,
    get: function () {
      return enableOptimizedBoxShadowParsing;
    }
  });
  Object.defineProperty(exports, "externalElementInspectionEnabled", {
    enumerable: true,
    get: function () {
      return externalElementInspectionEnabled;
    }
  });
  Object.defineProperty(exports, "fixImageSrcDimensionPropagation", {
    enumerable: true,
    get: function () {
      return fixImageSrcDimensionPropagation;
    }
  });
  Object.defineProperty(exports, "fixVirtualizeListCollapseWindowSize", {
    enumerable: true,
    get: function () {
      return fixVirtualizeListCollapseWindowSize;
    }
  });
  Object.defineProperty(exports, "isLayoutAnimationEnabled", {
    enumerable: true,
    get: function () {
      return isLayoutAnimationEnabled;
    }
  });
  Object.defineProperty(exports, "shouldUseAnimatedObjectForTransform", {
    enumerable: true,
    get: function () {
      return shouldUseAnimatedObjectForTransform;
    }
  });
  Object.defineProperty(exports, "shouldUseRemoveClippedSubviewsAsDefaultOnIOS", {
    enumerable: true,
    get: function () {
      return shouldUseRemoveClippedSubviewsAsDefaultOnIOS;
    }
  });
  Object.defineProperty(exports, "shouldUseSetNativePropsInFabric", {
    enumerable: true,
    get: function () {
      return shouldUseSetNativePropsInFabric;
    }
  });
  Object.defineProperty(exports, "commonTestFlag", {
    enumerable: true,
    get: function () {
      return commonTestFlag;
    }
  });
  Object.defineProperty(exports, "commonTestFlagWithoutNativeImplementation", {
    enumerable: true,
    get: function () {
      return commonTestFlagWithoutNativeImplementation;
    }
  });
  Object.defineProperty(exports, "cdpInteractionMetricsEnabled", {
    enumerable: true,
    get: function () {
      return cdpInteractionMetricsEnabled;
    }
  });
  Object.defineProperty(exports, "cxxNativeAnimatedEnabled", {
    enumerable: true,
    get: function () {
      return cxxNativeAnimatedEnabled;
    }
  });
  Object.defineProperty(exports, "defaultTextToOverflowHidden", {
    enumerable: true,
    get: function () {
      return defaultTextToOverflowHidden;
    }
  });
  Object.defineProperty(exports, "disableEarlyViewCommandExecution", {
    enumerable: true,
    get: function () {
      return disableEarlyViewCommandExecution;
    }
  });
  Object.defineProperty(exports, "disableImageViewPreallocationAndroid", {
    enumerable: true,
    get: function () {
      return disableImageViewPreallocationAndroid;
    }
  });
  Object.defineProperty(exports, "disableMountItemReorderingAndroid", {
    enumerable: true,
    get: function () {
      return disableMountItemReorderingAndroid;
    }
  });
  Object.defineProperty(exports, "disableSubviewClippingAndroid", {
    enumerable: true,
    get: function () {
      return disableSubviewClippingAndroid;
    }
  });
  Object.defineProperty(exports, "disableTextLayoutManagerCacheAndroid", {
    enumerable: true,
    get: function () {
      return disableTextLayoutManagerCacheAndroid;
    }
  });
  Object.defineProperty(exports, "disableViewPreallocationAndroid", {
    enumerable: true,
    get: function () {
      return disableViewPreallocationAndroid;
    }
  });
  Object.defineProperty(exports, "enableAccessibilityOrder", {
    enumerable: true,
    get: function () {
      return enableAccessibilityOrder;
    }
  });
  Object.defineProperty(exports, "enableAccumulatedUpdatesInRawPropsAndroid", {
    enumerable: true,
    get: function () {
      return enableAccumulatedUpdatesInRawPropsAndroid;
    }
  });
  Object.defineProperty(exports, "enableAndroidAntialiasedBorderRadiusClipping", {
    enumerable: true,
    get: function () {
      return enableAndroidAntialiasedBorderRadiusClipping;
    }
  });
  Object.defineProperty(exports, "enableAndroidLinearText", {
    enumerable: true,
    get: function () {
      return enableAndroidLinearText;
    }
  });
  Object.defineProperty(exports, "enableAndroidTextMeasurementOptimizations", {
    enumerable: true,
    get: function () {
      return enableAndroidTextMeasurementOptimizations;
    }
  });
  Object.defineProperty(exports, "enableBridgelessArchitecture", {
    enumerable: true,
    get: function () {
      return enableBridgelessArchitecture;
    }
  });
  Object.defineProperty(exports, "enableCppPropsIteratorSetter", {
    enumerable: true,
    get: function () {
      return enableCppPropsIteratorSetter;
    }
  });
  Object.defineProperty(exports, "enableCustomFocusSearchOnClippedElementsAndroid", {
    enumerable: true,
    get: function () {
      return enableCustomFocusSearchOnClippedElementsAndroid;
    }
  });
  Object.defineProperty(exports, "enableDestroyShadowTreeRevisionAsync", {
    enumerable: true,
    get: function () {
      return enableDestroyShadowTreeRevisionAsync;
    }
  });
  Object.defineProperty(exports, "enableDoubleMeasurementFixAndroid", {
    enumerable: true,
    get: function () {
      return enableDoubleMeasurementFixAndroid;
    }
  });
  Object.defineProperty(exports, "enableEagerMainQueueModulesOnIOS", {
    enumerable: true,
    get: function () {
      return enableEagerMainQueueModulesOnIOS;
    }
  });
  Object.defineProperty(exports, "enableEagerRootViewAttachment", {
    enumerable: true,
    get: function () {
      return enableEagerRootViewAttachment;
    }
  });
  Object.defineProperty(exports, "enableExclusivePropsUpdateAndroid", {
    enumerable: true,
    get: function () {
      return enableExclusivePropsUpdateAndroid;
    }
  });
  Object.defineProperty(exports, "enableFabricCommitBranching", {
    enumerable: true,
    get: function () {
      return enableFabricCommitBranching;
    }
  });
  Object.defineProperty(exports, "enableFabricLogs", {
    enumerable: true,
    get: function () {
      return enableFabricLogs;
    }
  });
  Object.defineProperty(exports, "enableFabricRenderer", {
    enumerable: true,
    get: function () {
      return enableFabricRenderer;
    }
  });
  Object.defineProperty(exports, "enableFontScaleChangesUpdatingLayout", {
    enumerable: true,
    get: function () {
      return enableFontScaleChangesUpdatingLayout;
    }
  });
  Object.defineProperty(exports, "enableIOSTextBaselineOffsetPerLine", {
    enumerable: true,
    get: function () {
      return enableIOSTextBaselineOffsetPerLine;
    }
  });
  Object.defineProperty(exports, "enableIOSViewClipToPaddingBox", {
    enumerable: true,
    get: function () {
      return enableIOSViewClipToPaddingBox;
    }
  });
  Object.defineProperty(exports, "enableImagePrefetchingAndroid", {
    enumerable: true,
    get: function () {
      return enableImagePrefetchingAndroid;
    }
  });
  Object.defineProperty(exports, "enableImagePrefetchingJNIBatchingAndroid", {
    enumerable: true,
    get: function () {
      return enableImagePrefetchingJNIBatchingAndroid;
    }
  });
  Object.defineProperty(exports, "enableImagePrefetchingOnUiThreadAndroid", {
    enumerable: true,
    get: function () {
      return enableImagePrefetchingOnUiThreadAndroid;
    }
  });
  Object.defineProperty(exports, "enableImmediateUpdateModeForContentOffsetChanges", {
    enumerable: true,
    get: function () {
      return enableImmediateUpdateModeForContentOffsetChanges;
    }
  });
  Object.defineProperty(exports, "enableImperativeFocus", {
    enumerable: true,
    get: function () {
      return enableImperativeFocus;
    }
  });
  Object.defineProperty(exports, "enableInteropViewManagerClassLookUpOptimizationIOS", {
    enumerable: true,
    get: function () {
      return enableInteropViewManagerClassLookUpOptimizationIOS;
    }
  });
  Object.defineProperty(exports, "enableIntersectionObserverByDefault", {
    enumerable: true,
    get: function () {
      return enableIntersectionObserverByDefault;
    }
  });
  Object.defineProperty(exports, "enableKeyEvents", {
    enumerable: true,
    get: function () {
      return enableKeyEvents;
    }
  });
  Object.defineProperty(exports, "enableLayoutAnimationsOnAndroid", {
    enumerable: true,
    get: function () {
      return enableLayoutAnimationsOnAndroid;
    }
  });
  Object.defineProperty(exports, "enableLayoutAnimationsOnIOS", {
    enumerable: true,
    get: function () {
      return enableLayoutAnimationsOnIOS;
    }
  });
  Object.defineProperty(exports, "enableMainQueueCoordinatorOnIOS", {
    enumerable: true,
    get: function () {
      return enableMainQueueCoordinatorOnIOS;
    }
  });
  Object.defineProperty(exports, "enableModuleArgumentNSNullConversionIOS", {
    enumerable: true,
    get: function () {
      return enableModuleArgumentNSNullConversionIOS;
    }
  });
  Object.defineProperty(exports, "enableMutationObserverByDefault", {
    enumerable: true,
    get: function () {
      return enableMutationObserverByDefault;
    }
  });
  Object.defineProperty(exports, "enableNativeCSSParsing", {
    enumerable: true,
    get: function () {
      return enableNativeCSSParsing;
    }
  });
  Object.defineProperty(exports, "enableNetworkEventReporting", {
    enumerable: true,
    get: function () {
      return enableNetworkEventReporting;
    }
  });
  Object.defineProperty(exports, "enablePreparedTextLayout", {
    enumerable: true,
    get: function () {
      return enablePreparedTextLayout;
    }
  });
  Object.defineProperty(exports, "enablePropsUpdateReconciliationAndroid", {
    enumerable: true,
    get: function () {
      return enablePropsUpdateReconciliationAndroid;
    }
  });
  Object.defineProperty(exports, "enableSwiftUIBasedFilters", {
    enumerable: true,
    get: function () {
      return enableSwiftUIBasedFilters;
    }
  });
  Object.defineProperty(exports, "enableViewCulling", {
    enumerable: true,
    get: function () {
      return enableViewCulling;
    }
  });
  Object.defineProperty(exports, "enableViewRecycling", {
    enumerable: true,
    get: function () {
      return enableViewRecycling;
    }
  });
  Object.defineProperty(exports, "enableViewRecyclingForImage", {
    enumerable: true,
    get: function () {
      return enableViewRecyclingForImage;
    }
  });
  Object.defineProperty(exports, "enableViewRecyclingForScrollView", {
    enumerable: true,
    get: function () {
      return enableViewRecyclingForScrollView;
    }
  });
  Object.defineProperty(exports, "enableViewRecyclingForText", {
    enumerable: true,
    get: function () {
      return enableViewRecyclingForText;
    }
  });
  Object.defineProperty(exports, "enableViewRecyclingForView", {
    enumerable: true,
    get: function () {
      return enableViewRecyclingForView;
    }
  });
  Object.defineProperty(exports, "enableVirtualViewContainerStateExperimental", {
    enumerable: true,
    get: function () {
      return enableVirtualViewContainerStateExperimental;
    }
  });
  Object.defineProperty(exports, "enableVirtualViewDebugFeatures", {
    enumerable: true,
    get: function () {
      return enableVirtualViewDebugFeatures;
    }
  });
  Object.defineProperty(exports, "fixFindShadowNodeByTagRaceCondition", {
    enumerable: true,
    get: function () {
      return fixFindShadowNodeByTagRaceCondition;
    }
  });
  Object.defineProperty(exports, "fixMappingOfEventPrioritiesBetweenFabricAndReact", {
    enumerable: true,
    get: function () {
      return fixMappingOfEventPrioritiesBetweenFabricAndReact;
    }
  });
  Object.defineProperty(exports, "fixTextClippingAndroid15useBoundsForWidth", {
    enumerable: true,
    get: function () {
      return fixTextClippingAndroid15useBoundsForWidth;
    }
  });
  Object.defineProperty(exports, "fuseboxAssertSingleHostState", {
    enumerable: true,
    get: function () {
      return fuseboxAssertSingleHostState;
    }
  });
  Object.defineProperty(exports, "fuseboxEnabledRelease", {
    enumerable: true,
    get: function () {
      return fuseboxEnabledRelease;
    }
  });
  Object.defineProperty(exports, "fuseboxFrameRecordingEnabled", {
    enumerable: true,
    get: function () {
      return fuseboxFrameRecordingEnabled;
    }
  });
  Object.defineProperty(exports, "fuseboxNetworkInspectionEnabled", {
    enumerable: true,
    get: function () {
      return fuseboxNetworkInspectionEnabled;
    }
  });
  Object.defineProperty(exports, "fuseboxScreenshotCaptureEnabled", {
    enumerable: true,
    get: function () {
      return fuseboxScreenshotCaptureEnabled;
    }
  });
  Object.defineProperty(exports, "hideOffscreenVirtualViewsOnIOS", {
    enumerable: true,
    get: function () {
      return hideOffscreenVirtualViewsOnIOS;
    }
  });
  Object.defineProperty(exports, "overrideBySynchronousMountPropsAtMountingAndroid", {
    enumerable: true,
    get: function () {
      return overrideBySynchronousMountPropsAtMountingAndroid;
    }
  });
  Object.defineProperty(exports, "perfIssuesEnabled", {
    enumerable: true,
    get: function () {
      return perfIssuesEnabled;
    }
  });
  Object.defineProperty(exports, "perfMonitorV2Enabled", {
    enumerable: true,
    get: function () {
      return perfMonitorV2Enabled;
    }
  });
  Object.defineProperty(exports, "preparedTextCacheSize", {
    enumerable: true,
    get: function () {
      return preparedTextCacheSize;
    }
  });
  Object.defineProperty(exports, "preventShadowTreeCommitExhaustion", {
    enumerable: true,
    get: function () {
      return preventShadowTreeCommitExhaustion;
    }
  });
  Object.defineProperty(exports, "redBoxV2Android", {
    enumerable: true,
    get: function () {
      return redBoxV2Android;
    }
  });
  Object.defineProperty(exports, "redBoxV2IOS", {
    enumerable: true,
    get: function () {
      return redBoxV2IOS;
    }
  });
  Object.defineProperty(exports, "shouldPressibilityUseW3CPointerEventsForHover", {
    enumerable: true,
    get: function () {
      return shouldPressibilityUseW3CPointerEventsForHover;
    }
  });
  Object.defineProperty(exports, "shouldTriggerResponderTransferOnScrollAndroid", {
    enumerable: true,
    get: function () {
      return shouldTriggerResponderTransferOnScrollAndroid;
    }
  });
  Object.defineProperty(exports, "skipActivityIdentityAssertionOnHostPause", {
    enumerable: true,
    get: function () {
      return skipActivityIdentityAssertionOnHostPause;
    }
  });
  Object.defineProperty(exports, "syncAndroidClipToPaddingWithOverflow", {
    enumerable: true,
    get: function () {
      return syncAndroidClipToPaddingWithOverflow;
    }
  });
  Object.defineProperty(exports, "traceTurboModulePromiseRejectionsOnAndroid", {
    enumerable: true,
    get: function () {
      return traceTurboModulePromiseRejectionsOnAndroid;
    }
  });
  Object.defineProperty(exports, "updateRuntimeShadowNodeReferencesOnCommit", {
    enumerable: true,
    get: function () {
      return updateRuntimeShadowNodeReferencesOnCommit;
    }
  });
  Object.defineProperty(exports, "updateRuntimeShadowNodeReferencesOnCommitThread", {
    enumerable: true,
    get: function () {
      return updateRuntimeShadowNodeReferencesOnCommitThread;
    }
  });
  Object.defineProperty(exports, "useAlwaysAvailableJSErrorHandling", {
    enumerable: true,
    get: function () {
      return useAlwaysAvailableJSErrorHandling;
    }
  });
  Object.defineProperty(exports, "useFabricInterop", {
    enumerable: true,
    get: function () {
      return useFabricInterop;
    }
  });
  Object.defineProperty(exports, "useNativeViewConfigsInBridgelessMode", {
    enumerable: true,
    get: function () {
      return useNativeViewConfigsInBridgelessMode;
    }
  });
  Object.defineProperty(exports, "useNestedScrollViewAndroid", {
    enumerable: true,
    get: function () {
      return useNestedScrollViewAndroid;
    }
  });
  Object.defineProperty(exports, "useSharedAnimatedBackend", {
    enumerable: true,
    get: function () {
      return useSharedAnimatedBackend;
    }
  });
  Object.defineProperty(exports, "useTraitHiddenOnAndroid", {
    enumerable: true,
    get: function () {
      return useTraitHiddenOnAndroid;
    }
  });
  Object.defineProperty(exports, "useTurboModuleInterop", {
    enumerable: true,
    get: function () {
      return useTurboModuleInterop;
    }
  });
  Object.defineProperty(exports, "useTurboModules", {
    enumerable: true,
    get: function () {
      return useTurboModules;
    }
  });
  Object.defineProperty(exports, "useUnorderedMapInDifferentiator", {
    enumerable: true,
    get: function () {
      return useUnorderedMapInDifferentiator;
    }
  });
  Object.defineProperty(exports, "viewCullingOutsetRatio", {
    enumerable: true,
    get: function () {
      return viewCullingOutsetRatio;
    }
  });
  Object.defineProperty(exports, "viewTransitionEnabled", {
    enumerable: true,
    get: function () {
      return viewTransitionEnabled;
    }
  });
  Object.defineProperty(exports, "virtualViewPrerenderRatio", {
    enumerable: true,
    get: function () {
      return virtualViewPrerenderRatio;
    }
  });
  Object.defineProperty(exports, "override", {
    enumerable: true,
    get: function () {
      return override;
    }
  });
  var _ReactNativeFeatureFlagsBase = require(_dependencyMap[0]);
  const jsOnlyTestFlag = (0, _ReactNativeFeatureFlagsBase.createJavaScriptFlagGetter)('jsOnlyTestFlag', false);
  const animatedShouldDebounceQueueFlush = (0, _ReactNativeFeatureFlagsBase.createJavaScriptFlagGetter)('animatedShouldDebounceQueueFlush', false);
  const animatedShouldUseSingleOp = (0, _ReactNativeFeatureFlagsBase.createJavaScriptFlagGetter)('animatedShouldUseSingleOp', false);
  const deferFlatListFocusChangeRenderUpdate = (0, _ReactNativeFeatureFlagsBase.createJavaScriptFlagGetter)('deferFlatListFocusChangeRenderUpdate', false);
  const disableMaintainVisibleContentPosition = (0, _ReactNativeFeatureFlagsBase.createJavaScriptFlagGetter)('disableMaintainVisibleContentPosition', false);
  const enableOptimizedBoxShadowParsing = (0, _ReactNativeFeatureFlagsBase.createJavaScriptFlagGetter)('enableOptimizedBoxShadowParsing', false);
  const externalElementInspectionEnabled = (0, _ReactNativeFeatureFlagsBase.createJavaScriptFlagGetter)('externalElementInspectionEnabled', true);
  const fixImageSrcDimensionPropagation = (0, _ReactNativeFeatureFlagsBase.createJavaScriptFlagGetter)('fixImageSrcDimensionPropagation', true);
  const fixVirtualizeListCollapseWindowSize = (0, _ReactNativeFeatureFlagsBase.createJavaScriptFlagGetter)('fixVirtualizeListCollapseWindowSize', false);
  const isLayoutAnimationEnabled = (0, _ReactNativeFeatureFlagsBase.createJavaScriptFlagGetter)('isLayoutAnimationEnabled', true);
  const shouldUseAnimatedObjectForTransform = (0, _ReactNativeFeatureFlagsBase.createJavaScriptFlagGetter)('shouldUseAnimatedObjectForTransform', false);
  const shouldUseRemoveClippedSubviewsAsDefaultOnIOS = (0, _ReactNativeFeatureFlagsBase.createJavaScriptFlagGetter)('shouldUseRemoveClippedSubviewsAsDefaultOnIOS', false);
  const shouldUseSetNativePropsInFabric = (0, _ReactNativeFeatureFlagsBase.createJavaScriptFlagGetter)('shouldUseSetNativePropsInFabric', true);
  const commonTestFlag = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('commonTestFlag', false);
  const commonTestFlagWithoutNativeImplementation = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('commonTestFlagWithoutNativeImplementation', false);
  const cdpInteractionMetricsEnabled = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('cdpInteractionMetricsEnabled', false);
  const cxxNativeAnimatedEnabled = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('cxxNativeAnimatedEnabled', false);
  const defaultTextToOverflowHidden = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('defaultTextToOverflowHidden', true);
  const disableEarlyViewCommandExecution = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('disableEarlyViewCommandExecution', false);
  const disableImageViewPreallocationAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('disableImageViewPreallocationAndroid', false);
  const disableMountItemReorderingAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('disableMountItemReorderingAndroid', false);
  const disableSubviewClippingAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('disableSubviewClippingAndroid', false);
  const disableTextLayoutManagerCacheAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('disableTextLayoutManagerCacheAndroid', false);
  const disableViewPreallocationAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('disableViewPreallocationAndroid', false);
  const enableAccessibilityOrder = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableAccessibilityOrder', false);
  const enableAccumulatedUpdatesInRawPropsAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableAccumulatedUpdatesInRawPropsAndroid', false);
  const enableAndroidAntialiasedBorderRadiusClipping = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableAndroidAntialiasedBorderRadiusClipping', false);
  const enableAndroidLinearText = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableAndroidLinearText', false);
  const enableAndroidTextMeasurementOptimizations = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableAndroidTextMeasurementOptimizations', false);
  const enableBridgelessArchitecture = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableBridgelessArchitecture', false);
  const enableCppPropsIteratorSetter = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableCppPropsIteratorSetter', false);
  const enableCustomFocusSearchOnClippedElementsAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableCustomFocusSearchOnClippedElementsAndroid', true);
  const enableDestroyShadowTreeRevisionAsync = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableDestroyShadowTreeRevisionAsync', false);
  const enableDoubleMeasurementFixAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableDoubleMeasurementFixAndroid', false);
  const enableEagerMainQueueModulesOnIOS = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableEagerMainQueueModulesOnIOS', false);
  const enableEagerRootViewAttachment = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableEagerRootViewAttachment', false);
  const enableExclusivePropsUpdateAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableExclusivePropsUpdateAndroid', false);
  const enableFabricCommitBranching = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableFabricCommitBranching', false);
  const enableFabricLogs = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableFabricLogs', false);
  const enableFabricRenderer = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableFabricRenderer', false);
  const enableFontScaleChangesUpdatingLayout = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableFontScaleChangesUpdatingLayout', true);
  const enableIOSTextBaselineOffsetPerLine = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableIOSTextBaselineOffsetPerLine', false);
  const enableIOSViewClipToPaddingBox = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableIOSViewClipToPaddingBox', false);
  const enableImagePrefetchingAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableImagePrefetchingAndroid', false);
  const enableImagePrefetchingJNIBatchingAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableImagePrefetchingJNIBatchingAndroid', false);
  const enableImagePrefetchingOnUiThreadAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableImagePrefetchingOnUiThreadAndroid', false);
  const enableImmediateUpdateModeForContentOffsetChanges = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableImmediateUpdateModeForContentOffsetChanges', false);
  const enableImperativeFocus = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableImperativeFocus', false);
  const enableInteropViewManagerClassLookUpOptimizationIOS = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableInteropViewManagerClassLookUpOptimizationIOS', false);
  const enableIntersectionObserverByDefault = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableIntersectionObserverByDefault', false);
  const enableKeyEvents = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableKeyEvents', false);
  const enableLayoutAnimationsOnAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableLayoutAnimationsOnAndroid', false);
  const enableLayoutAnimationsOnIOS = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableLayoutAnimationsOnIOS', true);
  const enableMainQueueCoordinatorOnIOS = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableMainQueueCoordinatorOnIOS', false);
  const enableModuleArgumentNSNullConversionIOS = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableModuleArgumentNSNullConversionIOS', false);
  const enableMutationObserverByDefault = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableMutationObserverByDefault', false);
  const enableNativeCSSParsing = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableNativeCSSParsing', false);
  const enableNetworkEventReporting = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableNetworkEventReporting', true);
  const enablePreparedTextLayout = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enablePreparedTextLayout', false);
  const enablePropsUpdateReconciliationAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enablePropsUpdateReconciliationAndroid', false);
  const enableSwiftUIBasedFilters = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableSwiftUIBasedFilters', false);
  const enableViewCulling = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableViewCulling', false);
  const enableViewRecycling = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableViewRecycling', false);
  const enableViewRecyclingForImage = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableViewRecyclingForImage', true);
  const enableViewRecyclingForScrollView = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableViewRecyclingForScrollView', false);
  const enableViewRecyclingForText = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableViewRecyclingForText', true);
  const enableViewRecyclingForView = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableViewRecyclingForView', true);
  const enableVirtualViewContainerStateExperimental = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableVirtualViewContainerStateExperimental', false);
  const enableVirtualViewDebugFeatures = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('enableVirtualViewDebugFeatures', false);
  const fixFindShadowNodeByTagRaceCondition = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('fixFindShadowNodeByTagRaceCondition', false);
  const fixMappingOfEventPrioritiesBetweenFabricAndReact = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('fixMappingOfEventPrioritiesBetweenFabricAndReact', false);
  const fixTextClippingAndroid15useBoundsForWidth = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('fixTextClippingAndroid15useBoundsForWidth', false);
  const fuseboxAssertSingleHostState = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('fuseboxAssertSingleHostState', true);
  const fuseboxEnabledRelease = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('fuseboxEnabledRelease', false);
  const fuseboxFrameRecordingEnabled = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('fuseboxFrameRecordingEnabled', false);
  const fuseboxNetworkInspectionEnabled = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('fuseboxNetworkInspectionEnabled', true);
  const fuseboxScreenshotCaptureEnabled = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('fuseboxScreenshotCaptureEnabled', false);
  const hideOffscreenVirtualViewsOnIOS = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('hideOffscreenVirtualViewsOnIOS', false);
  const overrideBySynchronousMountPropsAtMountingAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('overrideBySynchronousMountPropsAtMountingAndroid', false);
  const perfIssuesEnabled = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('perfIssuesEnabled', false);
  const perfMonitorV2Enabled = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('perfMonitorV2Enabled', false);
  const preparedTextCacheSize = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('preparedTextCacheSize', 200);
  const preventShadowTreeCommitExhaustion = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('preventShadowTreeCommitExhaustion', false);
  const redBoxV2Android = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('redBoxV2Android', false);
  const redBoxV2IOS = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('redBoxV2IOS', false);
  const shouldPressibilityUseW3CPointerEventsForHover = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('shouldPressibilityUseW3CPointerEventsForHover', false);
  const shouldTriggerResponderTransferOnScrollAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('shouldTriggerResponderTransferOnScrollAndroid', false);
  const skipActivityIdentityAssertionOnHostPause = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('skipActivityIdentityAssertionOnHostPause', false);
  const syncAndroidClipToPaddingWithOverflow = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('syncAndroidClipToPaddingWithOverflow', false);
  const traceTurboModulePromiseRejectionsOnAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('traceTurboModulePromiseRejectionsOnAndroid', false);
  const updateRuntimeShadowNodeReferencesOnCommit = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('updateRuntimeShadowNodeReferencesOnCommit', false);
  const updateRuntimeShadowNodeReferencesOnCommitThread = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('updateRuntimeShadowNodeReferencesOnCommitThread', false);
  const useAlwaysAvailableJSErrorHandling = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('useAlwaysAvailableJSErrorHandling', false);
  const useFabricInterop = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('useFabricInterop', true);
  const useNativeViewConfigsInBridgelessMode = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('useNativeViewConfigsInBridgelessMode', false);
  const useNestedScrollViewAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('useNestedScrollViewAndroid', false);
  const useSharedAnimatedBackend = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('useSharedAnimatedBackend', false);
  const useTraitHiddenOnAndroid = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('useTraitHiddenOnAndroid', false);
  const useTurboModuleInterop = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('useTurboModuleInterop', false);
  const useTurboModules = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('useTurboModules', false);
  const useUnorderedMapInDifferentiator = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('useUnorderedMapInDifferentiator', false);
  const viewCullingOutsetRatio = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('viewCullingOutsetRatio', 0);
  const viewTransitionEnabled = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('viewTransitionEnabled', false);
  const virtualViewPrerenderRatio = (0, _ReactNativeFeatureFlagsBase.createNativeFlagGetter)('virtualViewPrerenderRatio', 5);
  const override = _ReactNativeFeatureFlagsBase.setOverrides;
},3607,[3608]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  exports.createJavaScriptFlagGetter = createJavaScriptFlagGetter;
  exports.createNativeFlagGetter = createNativeFlagGetter;
  exports.getOverrides = getOverrides;
  exports.setOverrides = setOverrides;
  exports.dangerouslyResetForTesting = dangerouslyResetForTesting;
  var _specsNativeReactNativeFeatureFlags = require(_dependencyMap[0]);
  var NativeReactNativeFeatureFlags = _interopDefault(_specsNativeReactNativeFeatureFlags);
  const accessedFeatureFlags = new Set();
  let overrides;
  const clearCachedValuesFns = [];
  function createGetter(configName, customValueGetter, defaultValue) {
    let cachedValue;
    return () => {
      if (cachedValue == null) {
        cachedValue = customValueGetter() ?? defaultValue;
      }
      return cachedValue;
    };
  }
  function createJavaScriptFlagGetter(configName, defaultValue) {
    return createGetter(configName, () => {
      accessedFeatureFlags.add(configName);
      return overrides?.[configName]?.();
    }, defaultValue);
  }
  function createNativeFlagGetter(configName, defaultValue, skipUnavailableNativeModuleError = false) {
    return createGetter(configName, () => {
      maybeLogUnavailableNativeModuleError(configName);
      return NativeReactNativeFeatureFlags.default?.[configName]?.();
    }, defaultValue);
  }
  function getOverrides() {
    return overrides;
  }
  function setOverrides(newOverrides) {
    if (overrides != null) {
      throw new Error('Feature flags cannot be overridden more than once');
    }
    if (accessedFeatureFlags.size > 0) {
      const accessedFeatureFlagsStr = Array.from(accessedFeatureFlags).join(', ');
      throw new Error(`Feature flags were accessed before being overridden: ${accessedFeatureFlagsStr}`);
    }
    overrides = newOverrides;
  }
  const reportedConfigNames = new Set();
  const hasTurboModules = global.RN$Bridgeless === true || global.__turboModuleProxy != null;
  function maybeLogUnavailableNativeModuleError(configName) {
    if (!NativeReactNativeFeatureFlags.default && true && !reportedConfigNames.has(configName) && hasTurboModules) {
      reportedConfigNames.add(configName);
      console.error(`Could not access feature flag '${configName}' because native module method was not available`);
    }
  }
  function dangerouslyResetForTesting() {}
},3608,[3609]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = {};
    if (e) Object.keys(e).forEach(function (k) {
      var d = Object.getOwnPropertyDescriptor(e, k);
      Object.defineProperty(n, k, d.get ? d : {
        enumerable: true,
        get: function () {
          return e[k];
        }
      });
    });
    n.default = e;
    return n;
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _LibrariesTurboModuleTurboModuleRegistry = require(_dependencyMap[0]);
  var TurboModuleRegistry = _interopNamespace(_LibrariesTurboModuleTurboModuleRegistry);
  const NativeReactNativeFeatureFlags = TurboModuleRegistry.get('NativeReactNativeFeatureFlagsCxx');
  var _default = NativeReactNativeFeatureFlags;
},3609,[3610]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  exports.get = get;
  exports.getEnforcing = getEnforcing;
  var _invariant = require(_dependencyMap[0]);
  var invariant = _interopDefault(_invariant);
  const NativeModules = require(_dependencyMap[1]).default;
  const turboModuleProxy = global.__turboModuleProxy;
  function requireModule(name) {
    if (turboModuleProxy != null) {
      const module = turboModuleProxy(name);
      if (module != null) {
        return module;
      }
    }
    const legacyModule = NativeModules[name];
    if (legacyModule != null) {
      return legacyModule;
    }
    return null;
  }
  function get(name) {
    return requireModule(name);
  }
  function getEnforcing(name) {
    const module = requireModule(name);
    (0, invariant.default)(module != null, `TurboModuleRegistry.getEnforcing(...): '${name}' could not be found. ` + 'Verify that a module by this name is registered in the native binary.');
    return module;
  }
},3610,[644,3611]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  const BatchedBridge = require(_dependencyMap[0]).default;
  const invariant = require(_dependencyMap[1]);
  function genModule(config, moduleID) {
    if (!config) {
      return null;
    }
    const [moduleName, constants, methods, promiseMethods, syncMethods] = config;
    invariant(!moduleName.startsWith('RCT') && !moduleName.startsWith('RK'), "Module name prefixes should've been stripped by the native side but wasn't for " + moduleName);
    if (!constants && !methods) {
      return {
        name: moduleName
      };
    }
    const module = {};
    methods && methods.forEach((methodName, methodID) => {
      const isPromise = promiseMethods && arrayContains(promiseMethods, methodID) || false;
      const isSync = syncMethods && arrayContains(syncMethods, methodID) || false;
      invariant(!isPromise || !isSync, 'Cannot have a method that is both async and a sync hook');
      const methodType = isPromise ? 'promise' : isSync ? 'sync' : 'async';
      module[methodName] = genMethod(moduleID, methodID, methodType);
    });
    Object.assign(module, constants);
    if (module.getConstants == null) {
      module.getConstants = () => constants || Object.freeze({});
    } else {
      console.warn(`Unable to define method 'getConstants()' on NativeModule '${moduleName}'. NativeModule '${moduleName}' already has a constant or method called 'getConstants'. Please remove it.`);
    }
    return {
      name: moduleName,
      module
    };
  }
  global.__fbGenNativeModule = genModule;
  function loadModule(name, moduleID) {
    invariant(global.nativeRequireModuleConfig, "Can't lazily create module without nativeRequireModuleConfig");
    const config = global.nativeRequireModuleConfig(name);
    const info = genModule(config, moduleID);
    return info && info.module;
  }
  function genMethod(moduleID, methodID, type) {
    let fn = null;
    if (type === 'promise') {
      fn = function promiseMethodWrapper(...args) {
        const enqueueingFrameError = new Error();
        return new Promise((resolve, reject) => {
          BatchedBridge.enqueueNativeCall(moduleID, methodID, args, data => resolve(data), errorData => reject(updateErrorWithErrorData(errorData, enqueueingFrameError)));
        });
      };
    } else {
      fn = function nonPromiseMethodWrapper(...args) {
        const lastArg = args.length > 0 ? args[args.length - 1] : null;
        const secondLastArg = args.length > 1 ? args[args.length - 2] : null;
        const hasSuccessCallback = typeof lastArg === 'function';
        const hasErrorCallback = typeof secondLastArg === 'function';
        hasErrorCallback && invariant(hasSuccessCallback, 'Cannot have a non-function arg after a function arg.');
        const onSuccess = hasSuccessCallback ? lastArg : null;
        const onFail = hasErrorCallback ? secondLastArg : null;
        const callbackCount = hasSuccessCallback + hasErrorCallback;
        const newArgs = args.slice(0, args.length - callbackCount);
        if (type === 'sync') {
          return BatchedBridge.callNativeSyncHook(moduleID, methodID, newArgs, onFail, onSuccess);
        } else {
          BatchedBridge.enqueueNativeCall(moduleID, methodID, newArgs, onFail, onSuccess);
        }
      };
    }
    fn.type = type;
    return fn;
  }
  function arrayContains(array, value) {
    return array.indexOf(value) !== -1;
  }
  function updateErrorWithErrorData(errorData, error) {
    return Object.assign(error, errorData || {});
  }
  let NativeModules = {};
  if (global.nativeModuleProxy) {
    NativeModules = global.nativeModuleProxy;
  } else {
    const bridgeConfig = global.__fbBatchedBridgeConfig;
    invariant(bridgeConfig, '__fbBatchedBridgeConfig is not set, cannot invoke native modules');
    const defineLazyObjectProperty = require(_dependencyMap[2]).default;
    (bridgeConfig.remoteModuleConfig || []).forEach((config, moduleID) => {
      const info = genModule(config, moduleID);
      if (!info) {
        return;
      }
      if (info.module) {
        NativeModules[info.name] = info.module;
      } else {
        defineLazyObjectProperty(NativeModules, info.name, {
          get: () => loadModule(info.name, moduleID)
        });
      }
    });
  }
  var _default = NativeModules;
},3611,[3612,644,3619]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  const MessageQueue = require(_dependencyMap[0]).default;
  const BatchedBridge = new MessageQueue();
  Object.defineProperty(global, '__fbBatchedBridge', {
    configurable: true,
    value: BatchedBridge
  });
  var _default = BatchedBridge;
},3612,[3613]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  const Systrace = require(_dependencyMap[0]);
  const deepFreezeAndThrowOnMutationInDev = require(_dependencyMap[1]).default;
  const stringifySafe = require(_dependencyMap[2]).default;
  const warnOnce = require(_dependencyMap[3]).default;
  const ErrorUtils = require(_dependencyMap[4]).default;
  const invariant = require(_dependencyMap[5]);
  const TO_JS = 0;
  const TO_NATIVE = 1;
  const MODULE_IDS = 0;
  const METHOD_IDS = 1;
  const PARAMS = 2;
  const MIN_TIME_BETWEEN_FLUSHES_MS = 5;
  const TRACE_TAG_REACT = 8192;
  const DEBUG_INFO_LIMIT = 32;
  class MessageQueue {
    constructor() {
      this._lazyCallableModules = {};
      this._queue = [[], [], [], 0];
      this._successCallbacks = new Map();
      this._failureCallbacks = new Map();
      this._callID = 0;
      this._lastFlush = 0;
      this._eventLoopStartTime = Date.now();
      this._reactNativeMicrotasksCallback = null;
      this.callFunctionReturnFlushedQueue = this.callFunctionReturnFlushedQueue.bind(this);
      this.flushedQueue = this.flushedQueue.bind(this);
      this.invokeCallbackAndReturnFlushedQueue = this.invokeCallbackAndReturnFlushedQueue.bind(this);
    }
    static spy(spyOrToggle) {
      if (spyOrToggle === true) {
        MessageQueue.prototype.__spy = info => {};
      } else if (spyOrToggle === false) {
        MessageQueue.prototype.__spy = null;
      } else {
        MessageQueue.prototype.__spy = spyOrToggle;
      }
    }
    callFunctionReturnFlushedQueue(module, method, args) {
      this.__guard(() => {
        this.__callFunction(module, method, args);
      });
      return this.flushedQueue();
    }
    invokeCallbackAndReturnFlushedQueue(cbID, args) {
      this.__guard(() => {
        this.__invokeCallback(cbID, args);
      });
      return this.flushedQueue();
    }
    flushedQueue() {
      this.__guard(() => {
        this.__callReactNativeMicrotasks();
      });
      const queue = this._queue;
      this._queue = [[], [], [], this._callID];
      return queue[0].length ? queue : null;
    }
    getEventLoopRunningTime() {
      return Date.now() - this._eventLoopStartTime;
    }
    registerCallableModule(name, module) {
      this._lazyCallableModules[name] = () => module;
    }
    registerLazyCallableModule(name, factory) {
      let module;
      let getValue = factory;
      this._lazyCallableModules[name] = () => {
        if (getValue) {
          module = getValue();
          getValue = null;
        }
        return module;
      };
    }
    getCallableModule(name) {
      const getValue = this._lazyCallableModules[name];
      return getValue ? getValue() : null;
    }
    callNativeSyncHook(moduleID, methodID, params, onFail, onSucc) {
      this.processCallbacks(moduleID, methodID, params, onFail, onSucc);
      return global.nativeCallSyncHook(moduleID, methodID, params);
    }
    processCallbacks(moduleID, methodID, params, onFail, onSucc) {
      if (onFail || onSucc) {
        onFail && params.push(this._callID << 1);
        onSucc && params.push(this._callID << 1 | 1);
        this._successCallbacks.set(this._callID, onSucc);
        this._failureCallbacks.set(this._callID, onFail);
      }
      this._callID++;
    }
    enqueueNativeCall(moduleID, methodID, params, onFail, onSucc) {
      this.processCallbacks(moduleID, methodID, params, onFail, onSucc);
      this._queue[MODULE_IDS].push(moduleID);
      this._queue[METHOD_IDS].push(methodID);
      this._queue[PARAMS].push(params);
      const now = Date.now();
      if (global.nativeFlushQueueImmediate && now - this._lastFlush >= MIN_TIME_BETWEEN_FLUSHES_MS) {
        const queue = this._queue;
        this._queue = [[], [], [], this._callID];
        this._lastFlush = now;
        global.nativeFlushQueueImmediate(queue);
      }
      Systrace.counterEvent('pending_js_to_native_queue', this._queue[0].length);
      if (this.__spy) {
        this.__spy({
          type: TO_NATIVE,
          module: moduleID + '',
          method: methodID,
          args: params
        });
      }
    }
    createDebugLookup(moduleID, name, methods) {}
    setReactNativeMicrotasksCallback(fn) {
      this._reactNativeMicrotasksCallback = fn;
    }
    __guard(fn) {
      if (this.__shouldPauseOnThrow()) {
        fn();
      } else {
        try {
          fn();
        } catch (error) {
          ErrorUtils.reportFatalError(error);
        }
      }
    }
    __shouldPauseOnThrow() {
      return typeof DebuggerInternal !== 'undefined' && DebuggerInternal.shouldPauseOnThrow === true;
    }
    __callReactNativeMicrotasks() {
      Systrace.beginEvent('JSTimers.callReactNativeMicrotasks()');
      try {
        if (this._reactNativeMicrotasksCallback != null) {
          this._reactNativeMicrotasksCallback();
        }
      } finally {
        Systrace.endEvent();
      }
    }
    __callFunction(module, method, args) {
      this._lastFlush = Date.now();
      this._eventLoopStartTime = this._lastFlush;
      if (this.__spy) {
        Systrace.beginEvent(`${module}.${method}(${stringifySafe(args)})`);
      } else {
        Systrace.beginEvent(`${module}.${method}(...)`);
      }
      try {
        if (this.__spy) {
          this.__spy({
            type: TO_JS,
            module,
            method,
            args
          });
        }
        const moduleMethods = this.getCallableModule(module);
        if (!moduleMethods) {
          const callableModuleNames = Object.keys(this._lazyCallableModules);
          const n = callableModuleNames.length;
          const callableModuleNameList = callableModuleNames.join(', ');
          const isBridgelessMode = global.RN$Bridgeless === true ? 'true' : 'false';
          invariant(false, `Failed to call into JavaScript module method ${module}.${method}(). Module has not been registered as callable. Bridgeless Mode: ${isBridgelessMode}. Registered callable JavaScript modules (n = ${n}): ${callableModuleNameList}.
          A frequent cause of the error is that the application entry file path is incorrect. This can also happen when the JS bundle is corrupt or there is an early initialization error when loading React Native.`);
        }
        if (!moduleMethods[method]) {
          invariant(false, `Failed to call into JavaScript module method ${module}.${method}(). Module exists, but the method is undefined.`);
        }
        moduleMethods[method].apply(moduleMethods, args);
      } finally {
        Systrace.endEvent();
      }
    }
    __invokeCallback(cbID, args) {
      this._lastFlush = Date.now();
      this._eventLoopStartTime = this._lastFlush;
      const callID = cbID >>> 1;
      const isSuccess = cbID & 1;
      const callback = isSuccess ? this._successCallbacks.get(callID) : this._failureCallbacks.get(callID);
      try {
        if (!callback) {
          return;
        }
        this._successCallbacks.delete(callID);
        this._failureCallbacks.delete(callID);
        callback(...args);
      } finally {}
    }
  }
  var _default = MessageQueue;
},3613,[3614,3615,3616,3617,3618,644]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.isEnabled = isEnabled;
  exports.setEnabled = setEnabled;
  exports.beginEvent = beginEvent;
  exports.endEvent = endEvent;
  exports.beginAsyncEvent = beginAsyncEvent;
  exports.endAsyncEvent = endAsyncEvent;
  exports.counterEvent = counterEvent;
  const TRACE_TAG_REACT = 8192;
  let _asyncCookie = 0;
  function isEnabled() {
    return global.nativeTraceIsTracing ? global.nativeTraceIsTracing(TRACE_TAG_REACT) : Boolean(global.__RCTProfileIsProfiling);
  }
  function setEnabled(_doEnable) {}
  function beginEvent(eventName, args) {
    if (isEnabled()) {
      const eventNameString = typeof eventName === 'function' ? eventName() : eventName;
      global.nativeTraceBeginSection(TRACE_TAG_REACT, eventNameString, args);
    }
  }
  function endEvent(args) {
    if (isEnabled()) {
      global.nativeTraceEndSection(TRACE_TAG_REACT, args);
    }
  }
  function beginAsyncEvent(eventName, args) {
    const cookie = _asyncCookie;
    if (isEnabled()) {
      _asyncCookie++;
      const eventNameString = typeof eventName === 'function' ? eventName() : eventName;
      global.nativeTraceBeginAsyncSection(TRACE_TAG_REACT, eventNameString, cookie, args);
    }
    return cookie;
  }
  function endAsyncEvent(eventName, cookie, args) {
    if (isEnabled()) {
      const eventNameString = typeof eventName === 'function' ? eventName() : eventName;
      global.nativeTraceEndAsyncSection(TRACE_TAG_REACT, eventNameString, cookie, args);
    }
  }
  function counterEvent(eventName, value) {
    if (isEnabled()) {
      const eventNameString = typeof eventName === 'function' ? eventName() : eventName;
      global.nativeTraceCounter && global.nativeTraceCounter(TRACE_TAG_REACT, eventNameString, value);
    }
  }
},3614,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  function deepFreezeAndThrowOnMutationInDev(object) {
    return object;
  }
  var _default = deepFreezeAndThrowOnMutationInDev;
},3615,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  exports.createStringifySafeWithLimits = createStringifySafeWithLimits;
  var _invariant = require(_dependencyMap[0]);
  var invariant = _interopDefault(_invariant);
  function createStringifySafeWithLimits(limits) {
    const {
      maxDepth = Number.POSITIVE_INFINITY,
      maxStringLimit = Number.POSITIVE_INFINITY,
      maxArrayLimit = Number.POSITIVE_INFINITY,
      maxObjectKeysLimit = Number.POSITIVE_INFINITY
    } = limits;
    const stack = [];
    function replacer(key, value) {
      while (stack.length && this !== stack[0]) {
        stack.shift();
      }
      if (typeof value === 'string') {
        const truncatedString = '...(truncated)...';
        if (value.length > maxStringLimit + truncatedString.length) {
          return value.substring(0, maxStringLimit) + truncatedString;
        }
        return value;
      }
      if (typeof value !== 'object' || value === null) {
        return value;
      }
      let retval = value;
      if (Array.isArray(value)) {
        if (stack.length >= maxDepth) {
          retval = `[ ... array with ${value.length} values ... ]`;
        } else if (value.length > maxArrayLimit) {
          retval = value.slice(0, maxArrayLimit).concat([`... extra ${value.length - maxArrayLimit} values truncated ...`]);
        }
      } else {
        (0, invariant.default)(typeof value === 'object', 'This was already found earlier');
        let keys = Object.keys(value);
        if (stack.length >= maxDepth) {
          retval = `{ ... object with ${keys.length} keys ... }`;
        } else if (keys.length > maxObjectKeysLimit) {
          retval = {};
          for (let k of keys.slice(0, maxObjectKeysLimit)) {
            retval[k] = value[k];
          }
          const truncatedKey = '...(truncated keys)...';
          retval[truncatedKey] = keys.length - maxObjectKeysLimit;
        }
      }
      stack.unshift(retval);
      return retval;
    }
    return function stringifySafe(arg) {
      if (arg === undefined) {
        return 'undefined';
      } else if (arg === null) {
        return 'null';
      } else if (typeof arg === 'function') {
        try {
          return arg.toString();
        } catch {
          return '[function unknown]';
        }
      } else if (arg instanceof Error) {
        return arg.name + ': ' + arg.message;
      } else {
        try {
          const ret = JSON.stringify(arg, replacer);
          if (ret === undefined) {
            return '["' + typeof arg + '" failed to stringify]';
          }
          return ret;
        } catch {
          if (typeof arg.toString === 'function') {
            try {
              return arg.toString();
            } catch {}
          }
        }
      }
      return '["' + typeof arg + '" failed to stringify]';
    };
  }
  const stringifySafe = createStringifySafeWithLimits({
    maxDepth: 10,
    maxStringLimit: 100,
    maxArrayLimit: 50,
    maxObjectKeysLimit: 50
  });
  var _default = stringifySafe;
},3616,[644]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  const warnedKeys = {};
  function warnOnce(key, message) {
    if (warnedKeys[key]) {
      return;
    }
    console.warn(message);
    warnedKeys[key] = true;
  }
  var _default = warnOnce;
},3617,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _default = global.ErrorUtils;
},3618,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  function defineLazyObjectProperty(object, name, descriptor) {
    const {
      get
    } = descriptor;
    const enumerable = descriptor.enumerable !== false;
    const writable = descriptor.writable !== false;
    let value;
    let valueSet = false;
    function getValue() {
      if (!valueSet) {
        valueSet = true;
        setValue(get());
      }
      return value;
    }
    function setValue(newValue) {
      value = newValue;
      valueSet = true;
      Object.defineProperty(object, name, {
        value: newValue,
        configurable: true,
        enumerable,
        writable
      });
    }
    Object.defineProperty(object, name, {
      get: getValue,
      set: setValue,
      configurable: true,
      enumerable
    });
  }
  var _default = defineLazyObjectProperty;
},3619,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  const Platform = require(_dependencyMap[0]).default;
  const normalizeColor = require(_dependencyMap[1]).default;
  function processColor(color) {
    if (color === undefined || color === null) {
      return color;
    }
    let normalizedColor = normalizeColor(color);
    if (normalizedColor === null || normalizedColor === undefined) {
      return undefined;
    }
    if (typeof normalizedColor === 'object') {
      const processColorObject = require(_dependencyMap[2]).processColorObject;
      const processedColorObj = processColorObject(normalizedColor);
      if (processedColorObj != null) {
        return processedColorObj;
      }
    }
    if (typeof normalizedColor !== 'number') {
      return null;
    }
    normalizedColor = (normalizedColor << 24 | normalizedColor >>> 8) >>> 0;
    return normalizedColor;
  }
  var _default = processColor;
},3620,[3621,3622,3624]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _Platform = require(_dependencyMap[0]);
  var Platform = _interopDefault(_Platform);
  var _default = Platform.default;
},3621,[3621]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _reactNativeNormalizeColors = require(_dependencyMap[0]);
  var _normalizeColor = _interopDefault(_reactNativeNormalizeColors);
  function normalizeColor(color) {
    if (typeof color === 'object' && color != null) {
      const {
        normalizeColorObject
      } = require(_dependencyMap[1]);
      const normalizedColor = normalizeColorObject(color);
      if (normalizedColor != null) {
        return normalizedColor;
      }
    }
    if (typeof color === 'string' || typeof color === 'number') {
      return (0, _normalizeColor.default)(color);
    }
  }
  var _default = normalizeColor;
},3622,[3623,3624]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  /**
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * @format
   * 
   */

  /* eslint no-bitwise: 0 */

  'use strict';

  function normalizeColor(color) {
    if (typeof color === 'number') {
      if (color >>> 0 === color && color >= 0 && color <= 0xffffffff) {
        return color;
      }
      return null;
    }
    if (typeof color !== 'string') {
      return null;
    }
    const matchers = getMatchers();
    let match;

    // Ordered based on occurrences on Facebook codebase
    if (match = matchers.hex6.exec(color)) {
      return parseInt(match[1] + 'ff', 16) >>> 0;
    }
    const colorFromKeyword = normalizeKeyword(color);
    if (colorFromKeyword != null) {
      return colorFromKeyword;
    }
    if (match = matchers.rgba.exec(color) || matchers.rgb.exec(color)) {
      // rgb(R G B / A) / rgba(R G B / A) notation
      if (match[9] !== undefined) {
        return (parse255(match[9]) << 24 |
        // r
        parse255(match[10]) << 16 |
        // g
        parse255(match[11]) << 8 |
        // b
        parse1(match[12])) >>>
        // a
        0;
      }
      // rgb(R, G, B, A) / rgba(R, G, B, A) notation
      else if (match[5] !== undefined) {
        return (parse255(match[5]) << 24 |
        // r
        parse255(match[6]) << 16 |
        // g
        parse255(match[7]) << 8 |
        // b
        parse1(match[8])) >>>
        // a
        0;
      }
      // rgb(R, G, B) / rgba(R, G, B) notation
      return (parse255(match[2]) << 24 |
      // r
      parse255(match[3]) << 16 |
      // g
      parse255(match[4]) << 8 |
      // b
      0x000000ff) >>>
      // a
      0;
    }
    if (match = matchers.hex3.exec(color)) {
      return parseInt(match[1] + match[1] +
      // r
      match[2] + match[2] +
      // g
      match[3] + match[3] +
      // b
      'ff',
      // a
      16) >>> 0;
    }

    // https://drafts.csswg.org/css-color-4/#hex-notation
    if (match = matchers.hex8.exec(color)) {
      return parseInt(match[1], 16) >>> 0;
    }
    if (match = matchers.hex4.exec(color)) {
      return parseInt(match[1] + match[1] +
      // r
      match[2] + match[2] +
      // g
      match[3] + match[3] +
      // b
      match[4] + match[4],
      // a
      16) >>> 0;
    }
    if (match = matchers.hsl.exec(color)) {
      return (hslToRgb(parse360(match[1]),
      // h
      parsePercentage(match[2]),
      // s
      parsePercentage(match[3]) // l
      ) | 0x000000ff) >>>
      // a
      0;
    }
    if (match = matchers.hsla.exec(color)) {
      // hsla(H S L / A) notation
      if (match[6] !== undefined) {
        return (hslToRgb(parse360(match[6]),
        // h
        parsePercentage(match[7]),
        // s
        parsePercentage(match[8]) // l
        ) | parse1(match[9])) >>>
        // a
        0;
      }

      // hsla(H, S, L, A) notation
      return (hslToRgb(parse360(match[2]),
      // h
      parsePercentage(match[3]),
      // s
      parsePercentage(match[4]) // l
      ) | parse1(match[5])) >>>
      // a
      0;
    }
    if (match = matchers.hwb.exec(color)) {
      if (match[5] !== undefined) {
        // hwb(H W B / A) notation
        return (hwbToRgb(parse360(match[5]),
        // h
        parsePercentage(match[6]),
        // w
        parsePercentage(match[7]) // b
        ) | parse1(match[8])) >>>
        // a
        0;
      }
      // hwb(H W B) notation
      return (hwbToRgb(parse360(match[2]),
      // h
      parsePercentage(match[3]),
      // w
      parsePercentage(match[4]) // b
      ) | 0x000000ff) >>>
      // a
      0;
    }
    return null;
  }
  function hue2rgb(p, q, t) {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 0.16666666666666666) {
      return p + (q - p) * 6 * t;
    }
    if (t < 0.5) {
      return q;
    }
    if (t < 0.6666666666666666) {
      return p + (q - p) * (0.6666666666666666 - t) * 6;
    }
    return p;
  }
  function hslToRgb(h, s, l) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 0.3333333333333333);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 0.3333333333333333);
    return Math.round(r * 255) << 24 | Math.round(g * 255) << 16 | Math.round(b * 255) << 8;
  }
  function hwbToRgb(h, w, b) {
    if (w + b >= 1) {
      const gray = Math.round(w * 255 / (w + b));
      return gray << 24 | gray << 16 | gray << 8;
    }
    const red = hue2rgb(0, 1, h + 0.3333333333333333) * (1 - w - b) + w;
    const green = hue2rgb(0, 1, h) * (1 - w - b) + w;
    const blue = hue2rgb(0, 1, h - 0.3333333333333333) * (1 - w - b) + w;
    return Math.round(red * 255) << 24 | Math.round(green * 255) << 16 | Math.round(blue * 255) << 8;
  }
  const NUMBER = '[-+]?\\d*\\.?\\d+';
  const PERCENTAGE = "[-+]?\\d*\\.?\\d+%";
  function call(...args) {
    return '\\(\\s*(' + args.join(')\\s*,?\\s*(') + ')\\s*\\)';
  }
  function callModern(...args) {
    return '\\(\\s*(' + args.join(')\\s*(') + ')\\s*\\)';
  }
  function callWithSlashSeparator(...args) {
    return '\\(\\s*(' + args.slice(0, args.length - 1).join(')\\s*,?\\s*(') + ')\\s*/\\s*(' + args[args.length - 1] + ')\\s*\\)';
  }
  function commaSeparatedCall(...args) {
    return '\\(\\s*(' + args.join(')\\s*,\\s*(') + ')\\s*\\)';
  }
  let cachedMatchers;
  function getMatchers() {
    if (cachedMatchers === undefined) {
      const rgbRegexPattern = call(NUMBER, NUMBER, NUMBER) + '|' + commaSeparatedCall(NUMBER, NUMBER, NUMBER, NUMBER) + '|' + callWithSlashSeparator(NUMBER, NUMBER, NUMBER, NUMBER);
      cachedMatchers = {
        rgb: new RegExp('rgb(' + rgbRegexPattern + ')'),
        rgba: new RegExp('rgba(' + rgbRegexPattern + ')'),
        hsl: new RegExp('hsl' + call(NUMBER, PERCENTAGE, PERCENTAGE)),
        hsla: new RegExp('hsla(' + commaSeparatedCall(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER) + '|' + callWithSlashSeparator(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER) + ')'),
        hwb: new RegExp('hwb(' + callModern(NUMBER, PERCENTAGE, PERCENTAGE) + '|' + callWithSlashSeparator(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER) + ')'),
        hex3: /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex4: /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^#([0-9a-fA-F]{6})$/,
        hex8: /^#([0-9a-fA-F]{8})$/
      };
    }
    return cachedMatchers;
  }
  function parse255(str) {
    const int = parseInt(str, 10);
    if (int < 0) {
      return 0;
    }
    if (int > 255) {
      return 255;
    }
    return int;
  }
  function parse360(str) {
    const int = parseFloat(str);
    return (int % 360 + 360) % 360 / 360;
  }
  function parse1(str) {
    const num = parseFloat(str);
    if (num < 0) {
      return 0;
    }
    if (num > 1) {
      return 255;
    }
    return Math.round(num * 255);
  }
  function parsePercentage(str) {
    // parseFloat conveniently ignores the final %
    const int = parseFloat(str);
    if (int < 0) {
      return 0;
    }
    if (int > 100) {
      return 1;
    }
    return int / 100;
  }
  function normalizeKeyword(name) {
    // prettier-ignore
    switch (name) {
      case 'transparent':
        return 0x00000000;
      // http://www.w3.org/TR/css3-color/#svg-color
      case 'aliceblue':
        return 0xf0f8ffff;
      case 'antiquewhite':
        return 0xfaebd7ff;
      case 'aqua':
        return 0x00ffffff;
      case 'aquamarine':
        return 0x7fffd4ff;
      case 'azure':
        return 0xf0ffffff;
      case 'beige':
        return 0xf5f5dcff;
      case 'bisque':
        return 0xffe4c4ff;
      case 'black':
        return 0x000000ff;
      case 'blanchedalmond':
        return 0xffebcdff;
      case 'blue':
        return 0x0000ffff;
      case 'blueviolet':
        return 0x8a2be2ff;
      case 'brown':
        return 0xa52a2aff;
      case 'burlywood':
        return 0xdeb887ff;
      case 'burntsienna':
        return 0xea7e5dff;
      case 'cadetblue':
        return 0x5f9ea0ff;
      case 'chartreuse':
        return 0x7fff00ff;
      case 'chocolate':
        return 0xd2691eff;
      case 'coral':
        return 0xff7f50ff;
      case 'cornflowerblue':
        return 0x6495edff;
      case 'cornsilk':
        return 0xfff8dcff;
      case 'crimson':
        return 0xdc143cff;
      case 'cyan':
        return 0x00ffffff;
      case 'darkblue':
        return 0x00008bff;
      case 'darkcyan':
        return 0x008b8bff;
      case 'darkgoldenrod':
        return 0xb8860bff;
      case 'darkgray':
        return 0xa9a9a9ff;
      case 'darkgreen':
        return 0x006400ff;
      case 'darkgrey':
        return 0xa9a9a9ff;
      case 'darkkhaki':
        return 0xbdb76bff;
      case 'darkmagenta':
        return 0x8b008bff;
      case 'darkolivegreen':
        return 0x556b2fff;
      case 'darkorange':
        return 0xff8c00ff;
      case 'darkorchid':
        return 0x9932ccff;
      case 'darkred':
        return 0x8b0000ff;
      case 'darksalmon':
        return 0xe9967aff;
      case 'darkseagreen':
        return 0x8fbc8fff;
      case 'darkslateblue':
        return 0x483d8bff;
      case 'darkslategray':
        return 0x2f4f4fff;
      case 'darkslategrey':
        return 0x2f4f4fff;
      case 'darkturquoise':
        return 0x00ced1ff;
      case 'darkviolet':
        return 0x9400d3ff;
      case 'deeppink':
        return 0xff1493ff;
      case 'deepskyblue':
        return 0x00bfffff;
      case 'dimgray':
        return 0x696969ff;
      case 'dimgrey':
        return 0x696969ff;
      case 'dodgerblue':
        return 0x1e90ffff;
      case 'firebrick':
        return 0xb22222ff;
      case 'floralwhite':
        return 0xfffaf0ff;
      case 'forestgreen':
        return 0x228b22ff;
      case 'fuchsia':
        return 0xff00ffff;
      case 'gainsboro':
        return 0xdcdcdcff;
      case 'ghostwhite':
        return 0xf8f8ffff;
      case 'gold':
        return 0xffd700ff;
      case 'goldenrod':
        return 0xdaa520ff;
      case 'gray':
        return 0x808080ff;
      case 'green':
        return 0x008000ff;
      case 'greenyellow':
        return 0xadff2fff;
      case 'grey':
        return 0x808080ff;
      case 'honeydew':
        return 0xf0fff0ff;
      case 'hotpink':
        return 0xff69b4ff;
      case 'indianred':
        return 0xcd5c5cff;
      case 'indigo':
        return 0x4b0082ff;
      case 'ivory':
        return 0xfffff0ff;
      case 'khaki':
        return 0xf0e68cff;
      case 'lavender':
        return 0xe6e6faff;
      case 'lavenderblush':
        return 0xfff0f5ff;
      case 'lawngreen':
        return 0x7cfc00ff;
      case 'lemonchiffon':
        return 0xfffacdff;
      case 'lightblue':
        return 0xadd8e6ff;
      case 'lightcoral':
        return 0xf08080ff;
      case 'lightcyan':
        return 0xe0ffffff;
      case 'lightgoldenrodyellow':
        return 0xfafad2ff;
      case 'lightgray':
        return 0xd3d3d3ff;
      case 'lightgreen':
        return 0x90ee90ff;
      case 'lightgrey':
        return 0xd3d3d3ff;
      case 'lightpink':
        return 0xffb6c1ff;
      case 'lightsalmon':
        return 0xffa07aff;
      case 'lightseagreen':
        return 0x20b2aaff;
      case 'lightskyblue':
        return 0x87cefaff;
      case 'lightslategray':
        return 0x778899ff;
      case 'lightslategrey':
        return 0x778899ff;
      case 'lightsteelblue':
        return 0xb0c4deff;
      case 'lightyellow':
        return 0xffffe0ff;
      case 'lime':
        return 0x00ff00ff;
      case 'limegreen':
        return 0x32cd32ff;
      case 'linen':
        return 0xfaf0e6ff;
      case 'magenta':
        return 0xff00ffff;
      case 'maroon':
        return 0x800000ff;
      case 'mediumaquamarine':
        return 0x66cdaaff;
      case 'mediumblue':
        return 0x0000cdff;
      case 'mediumorchid':
        return 0xba55d3ff;
      case 'mediumpurple':
        return 0x9370dbff;
      case 'mediumseagreen':
        return 0x3cb371ff;
      case 'mediumslateblue':
        return 0x7b68eeff;
      case 'mediumspringgreen':
        return 0x00fa9aff;
      case 'mediumturquoise':
        return 0x48d1ccff;
      case 'mediumvioletred':
        return 0xc71585ff;
      case 'midnightblue':
        return 0x191970ff;
      case 'mintcream':
        return 0xf5fffaff;
      case 'mistyrose':
        return 0xffe4e1ff;
      case 'moccasin':
        return 0xffe4b5ff;
      case 'navajowhite':
        return 0xffdeadff;
      case 'navy':
        return 0x000080ff;
      case 'oldlace':
        return 0xfdf5e6ff;
      case 'olive':
        return 0x808000ff;
      case 'olivedrab':
        return 0x6b8e23ff;
      case 'orange':
        return 0xffa500ff;
      case 'orangered':
        return 0xff4500ff;
      case 'orchid':
        return 0xda70d6ff;
      case 'palegoldenrod':
        return 0xeee8aaff;
      case 'palegreen':
        return 0x98fb98ff;
      case 'paleturquoise':
        return 0xafeeeeff;
      case 'palevioletred':
        return 0xdb7093ff;
      case 'papayawhip':
        return 0xffefd5ff;
      case 'peachpuff':
        return 0xffdab9ff;
      case 'peru':
        return 0xcd853fff;
      case 'pink':
        return 0xffc0cbff;
      case 'plum':
        return 0xdda0ddff;
      case 'powderblue':
        return 0xb0e0e6ff;
      case 'purple':
        return 0x800080ff;
      case 'rebeccapurple':
        return 0x663399ff;
      case 'red':
        return 0xff0000ff;
      case 'rosybrown':
        return 0xbc8f8fff;
      case 'royalblue':
        return 0x4169e1ff;
      case 'saddlebrown':
        return 0x8b4513ff;
      case 'salmon':
        return 0xfa8072ff;
      case 'sandybrown':
        return 0xf4a460ff;
      case 'seagreen':
        return 0x2e8b57ff;
      case 'seashell':
        return 0xfff5eeff;
      case 'sienna':
        return 0xa0522dff;
      case 'silver':
        return 0xc0c0c0ff;
      case 'skyblue':
        return 0x87ceebff;
      case 'slateblue':
        return 0x6a5acdff;
      case 'slategray':
        return 0x708090ff;
      case 'slategrey':
        return 0x708090ff;
      case 'snow':
        return 0xfffafaff;
      case 'springgreen':
        return 0x00ff7fff;
      case 'steelblue':
        return 0x4682b4ff;
      case 'tan':
        return 0xd2b48cff;
      case 'teal':
        return 0x008080ff;
      case 'thistle':
        return 0xd8bfd8ff;
      case 'tomato':
        return 0xff6347ff;
      case 'turquoise':
        return 0x40e0d0ff;
      case 'violet':
        return 0xee82eeff;
      case 'wheat':
        return 0xf5deb3ff;
      case 'white':
        return 0xffffffff;
      case 'whitesmoke':
        return 0xf5f5f5ff;
      case 'yellow':
        return 0xffff00ff;
      case 'yellowgreen':
        return 0x9acd32ff;
    }
    return null;
  }
  module.exports = normalizeColor;
},3623,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var _PlatformColorValueTypes = require(_dependencyMap[0]);
  Object.keys(_PlatformColorValueTypes).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _PlatformColorValueTypes[k];
        }
      });
    }
  });
},3624,[3624]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = {};
    if (e) Object.keys(e).forEach(function (k) {
      var d = Object.getOwnPropertyDescriptor(e, k);
      Object.defineProperty(n, k, d.get ? d : {
        enumerable: true,
        get: function () {
          return e[k];
        }
      });
    });
    n.default = e;
    return n;
  }
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  Object.defineProperty(exports, "colorAttribute", {
    enumerable: true,
    get: function () {
      return colorAttribute;
    }
  });
  Object.defineProperty(exports, "filterAttribute", {
    enumerable: true,
    get: function () {
      return filterAttribute;
    }
  });
  Object.defineProperty(exports, "boxShadowAttribute", {
    enumerable: true,
    get: function () {
      return boxShadowAttribute;
    }
  });
  Object.defineProperty(exports, "backgroundImageAttribute", {
    enumerable: true,
    get: function () {
      return backgroundImageAttribute;
    }
  });
  Object.defineProperty(exports, "backgroundSizeAttribute", {
    enumerable: true,
    get: function () {
      return backgroundSizeAttribute;
    }
  });
  Object.defineProperty(exports, "backgroundPositionAttribute", {
    enumerable: true,
    get: function () {
      return backgroundPositionAttribute;
    }
  });
  Object.defineProperty(exports, "backgroundRepeatAttribute", {
    enumerable: true,
    get: function () {
      return backgroundRepeatAttribute;
    }
  });
  Object.defineProperty(exports, "transformAttribute", {
    enumerable: true,
    get: function () {
      return transformAttribute;
    }
  });
  Object.defineProperty(exports, "transformOriginAttribute", {
    enumerable: true,
    get: function () {
      return transformOriginAttribute;
    }
  });
  var _srcPrivateFeatureflagsReactNativeFeatureFlags = require(_dependencyMap[0]);
  var ReactNativeFeatureFlags = _interopNamespace(_srcPrivateFeatureflagsReactNativeFeatureFlags);
  var _StyleSheetProcessAspectRatio = require(_dependencyMap[1]);
  var processAspectRatio = _interopDefault(_StyleSheetProcessAspectRatio);
  var _StyleSheetProcessBackgroundImage = require(_dependencyMap[2]);
  var processBackgroundImage = _interopDefault(_StyleSheetProcessBackgroundImage);
  var _StyleSheetProcessBackgroundPosition = require(_dependencyMap[3]);
  var processBackgroundPosition = _interopDefault(_StyleSheetProcessBackgroundPosition);
  var _StyleSheetProcessBackgroundRepeat = require(_dependencyMap[4]);
  var processBackgroundRepeat = _interopDefault(_StyleSheetProcessBackgroundRepeat);
  var _StyleSheetProcessBackgroundSize = require(_dependencyMap[5]);
  var processBackgroundSize = _interopDefault(_StyleSheetProcessBackgroundSize);
  var _StyleSheetProcessBoxShadow = require(_dependencyMap[6]);
  var processBoxShadow = _interopDefault(_StyleSheetProcessBoxShadow);
  var _StyleSheetProcessColor = require(_dependencyMap[7]);
  var processColor = _interopDefault(_StyleSheetProcessColor);
  var _StyleSheetProcessFilter = require(_dependencyMap[8]);
  var processFilter = _interopDefault(_StyleSheetProcessFilter);
  var _StyleSheetProcessFontVariant = require(_dependencyMap[9]);
  var processFontVariant = _interopDefault(_StyleSheetProcessFontVariant);
  var _StyleSheetProcessTransform = require(_dependencyMap[10]);
  var processTransform = _interopDefault(_StyleSheetProcessTransform);
  var _StyleSheetProcessTransformOrigin = require(_dependencyMap[11]);
  var processTransformOrigin = _interopDefault(_StyleSheetProcessTransformOrigin);
  var _UtilitiesDifferSizesDiffer = require(_dependencyMap[12]);
  var sizesDiffer = _interopDefault(_UtilitiesDifferSizesDiffer);
  const nativeCSSParsing = ReactNativeFeatureFlags.enableNativeCSSParsing();
  const colorAttribute = nativeCSSParsing ? true : {
    process: processColor.default
  };
  const filterAttribute = nativeCSSParsing ? true : {
    process: processFilter.default
  };
  const boxShadowAttribute = nativeCSSParsing ? true : {
    process: processBoxShadow.default
  };
  const backgroundImageAttribute = nativeCSSParsing ? true : {
    process: processBackgroundImage.default
  };
  const backgroundSizeAttribute = nativeCSSParsing ? true : {
    process: processBackgroundSize.default
  };
  const backgroundPositionAttribute = nativeCSSParsing ? true : {
    process: processBackgroundPosition.default
  };
  const backgroundRepeatAttribute = nativeCSSParsing ? true : {
    process: processBackgroundRepeat.default
  };
  const transformAttribute = nativeCSSParsing ? true : {
    process: processTransform.default
  };
  const transformOriginAttribute = nativeCSSParsing ? true : {
    process: processTransformOrigin.default
  };
  const ReactNativeStyleAttributes = {
    alignContent: true,
    alignItems: true,
    alignSelf: true,
    aspectRatio: {
      process: processAspectRatio.default
    },
    borderBottomWidth: true,
    borderEndWidth: true,
    borderLeftWidth: true,
    borderRightWidth: true,
    borderStartWidth: true,
    borderTopWidth: true,
    boxSizing: true,
    columnGap: true,
    borderWidth: true,
    bottom: true,
    direction: true,
    display: true,
    end: true,
    flex: true,
    flexBasis: true,
    flexDirection: true,
    flexGrow: true,
    flexShrink: true,
    flexWrap: true,
    gap: true,
    height: true,
    inset: true,
    insetBlock: true,
    insetBlockEnd: true,
    insetBlockStart: true,
    insetInline: true,
    insetInlineEnd: true,
    insetInlineStart: true,
    justifyContent: true,
    left: true,
    margin: true,
    marginBlock: true,
    marginBlockEnd: true,
    marginBlockStart: true,
    marginBottom: true,
    marginEnd: true,
    marginHorizontal: true,
    marginInline: true,
    marginInlineEnd: true,
    marginInlineStart: true,
    marginLeft: true,
    marginRight: true,
    marginStart: true,
    marginTop: true,
    marginVertical: true,
    maxHeight: true,
    maxWidth: true,
    minHeight: true,
    minWidth: true,
    overflow: true,
    padding: true,
    paddingBlock: true,
    paddingBlockEnd: true,
    paddingBlockStart: true,
    paddingBottom: true,
    paddingEnd: true,
    paddingHorizontal: true,
    paddingInline: true,
    paddingInlineEnd: true,
    paddingInlineStart: true,
    paddingLeft: true,
    paddingRight: true,
    paddingStart: true,
    paddingTop: true,
    paddingVertical: true,
    position: true,
    right: true,
    rowGap: true,
    start: true,
    top: true,
    width: true,
    zIndex: true,
    elevation: true,
    shadowColor: colorAttribute,
    shadowOffset: {
      diff: sizesDiffer.default
    },
    shadowOpacity: true,
    shadowRadius: true,
    transform: transformAttribute,
    transformOrigin: transformOriginAttribute,
    filter: filterAttribute,
    mixBlendMode: true,
    isolation: true,
    boxShadow: boxShadowAttribute,
    experimental_backgroundImage: backgroundImageAttribute,
    experimental_backgroundSize: backgroundSizeAttribute,
    experimental_backgroundPosition: backgroundPositionAttribute,
    experimental_backgroundRepeat: backgroundRepeatAttribute,
    backfaceVisibility: true,
    backgroundColor: colorAttribute,
    borderBlockColor: colorAttribute,
    borderBlockEndColor: colorAttribute,
    borderBlockStartColor: colorAttribute,
    borderBottomColor: colorAttribute,
    borderBottomEndRadius: true,
    borderBottomLeftRadius: true,
    borderBottomRightRadius: true,
    borderBottomStartRadius: true,
    borderColor: colorAttribute,
    borderCurve: true,
    borderEndColor: colorAttribute,
    borderEndEndRadius: true,
    borderEndStartRadius: true,
    borderLeftColor: colorAttribute,
    borderRadius: true,
    borderRightColor: colorAttribute,
    borderStartColor: colorAttribute,
    borderStartEndRadius: true,
    borderStartStartRadius: true,
    borderStyle: true,
    borderTopColor: colorAttribute,
    borderTopEndRadius: true,
    borderTopLeftRadius: true,
    borderTopRightRadius: true,
    borderTopStartRadius: true,
    cursor: true,
    opacity: true,
    outlineColor: colorAttribute,
    outlineOffset: true,
    outlineStyle: true,
    outlineWidth: true,
    pointerEvents: true,
    color: colorAttribute,
    fontFamily: true,
    fontSize: true,
    fontStyle: true,
    fontVariant: {
      process: processFontVariant.default
    },
    fontWeight: true,
    includeFontPadding: true,
    letterSpacing: true,
    lineHeight: true,
    textAlign: true,
    textAlignVertical: true,
    textDecorationColor: colorAttribute,
    textDecorationLine: true,
    textDecorationStyle: true,
    textShadowColor: colorAttribute,
    textShadowOffset: true,
    textShadowRadius: true,
    textTransform: true,
    userSelect: true,
    verticalAlign: true,
    writingDirection: true,
    overlayColor: colorAttribute,
    resizeMode: true,
    tintColor: colorAttribute,
    objectFit: true
  };
  var _default = ReactNativeStyleAttributes;
},3625,[3607,3626,3627,3628,3629,3630,3606,3620,3631,3632,3633,3634,3635]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  const invariant = require(_dependencyMap[0]);
  function processAspectRatio(aspectRatio) {
    if (typeof aspectRatio === 'number') {
      return aspectRatio;
    }
    if (typeof aspectRatio !== 'string') {
      return;
    }
    const matches = aspectRatio.split('/').map(s => s.trim());
    if (matches.includes('auto')) {
      return;
    }
    const hasNonNumericValues = matches.some(n => Number.isNaN(Number(n)));
    if (hasNonNumericValues) {
      return;
    }
    if (matches.length === 2) {
      return Number(matches[0]) / Number(matches[1]);
    }
    return Number(matches[0]);
  }
  var _default = processAspectRatio;
},3626,[644]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return processBackgroundImage;
    }
  });
  const processColor = require(_dependencyMap[0]).default;
  const LINEAR_GRADIENT_DIRECTION_REGEX = /^to\s+(?:top|bottom|left|right)(?:\s+(?:top|bottom|left|right))?/i;
  const LINEAR_GRADIENT_ANGLE_UNIT_REGEX = /^([+-]?\d*\.?\d+)(deg|grad|rad|turn)$/i;
  const LINEAR_GRADIENT_DEFAULT_DIRECTION = {
    type: 'angle',
    value: 180
  };
  const DEFAULT_RADIAL_SHAPE = 'ellipse';
  const DEFAULT_RADIAL_SIZE = 'farthest-corner';
  const DEFAULT_RADIAL_POSITION = {
    top: '50%',
    left: '50%'
  };
  function processBackgroundImage(backgroundImage) {
    let result = [];
    if (backgroundImage == null) {
      return result;
    }
    if (typeof backgroundImage === 'string') {
      result = parseBackgroundImageCSSString(backgroundImage.replace(/\n/g, ' '));
    } else if (Array.isArray(backgroundImage)) {
      for (const bgImage of backgroundImage) {
        const processedColorStops = processColorStops(bgImage);
        if (processedColorStops == null) {
          return [];
        }
        if (bgImage.type === 'linear-gradient') {
          let direction = LINEAR_GRADIENT_DEFAULT_DIRECTION;
          const bgDirection = bgImage.direction != null ? bgImage.direction.toLowerCase() : null;
          if (bgDirection != null) {
            if (LINEAR_GRADIENT_ANGLE_UNIT_REGEX.test(bgDirection)) {
              const parsedAngle = getAngleInDegrees(bgDirection);
              if (parsedAngle != null) {
                direction = {
                  type: 'angle',
                  value: parsedAngle
                };
              } else {
                return [];
              }
            } else if (LINEAR_GRADIENT_DIRECTION_REGEX.test(bgDirection)) {
              const parsedDirection = getDirectionForKeyword(bgDirection);
              if (parsedDirection != null) {
                direction = parsedDirection;
              } else {
                return [];
              }
            } else {
              return [];
            }
          }
          result = result.concat({
            type: 'linear-gradient',
            direction,
            colorStops: processedColorStops
          });
        } else if (bgImage.type === 'radial-gradient') {
          let shape = DEFAULT_RADIAL_SHAPE;
          let size = DEFAULT_RADIAL_SIZE;
          let position = Object.assign({}, DEFAULT_RADIAL_POSITION);
          if (bgImage.shape != null) {
            if (bgImage.shape === 'circle' || bgImage.shape === 'ellipse') {
              shape = bgImage.shape;
            } else {
              return [];
            }
          }
          if (bgImage.size != null) {
            if (typeof bgImage.size === 'string' && (bgImage.size === 'closest-side' || bgImage.size === 'closest-corner' || bgImage.size === 'farthest-side' || bgImage.size === 'farthest-corner')) {
              size = bgImage.size;
            } else if (typeof bgImage.size === 'object' && bgImage.size.x != null && bgImage.size.y != null) {
              size = {
                x: bgImage.size.x,
                y: bgImage.size.y
              };
            } else {
              return [];
            }
          }
          if (bgImage.position != null) {
            position = bgImage.position;
          }
          result = result.concat({
            type: 'radial-gradient',
            shape,
            size,
            position,
            colorStops: processedColorStops
          });
        }
      }
    }
    return result;
  }
  function processColorStops(bgImage) {
    const processedColorStops = [];
    for (let index = 0; index < bgImage.colorStops.length; index++) {
      const colorStop = bgImage.colorStops[index];
      const positions = colorStop.positions;
      if (colorStop.color == null && Array.isArray(positions) && positions.length === 1) {
        const position = positions[0];
        if (typeof position === 'number' || typeof position === 'string' && position.endsWith('%')) {
          processedColorStops.push({
            color: null,
            position
          });
        } else {
          return null;
        }
      } else {
        const processedColor = processColor(colorStop.color);
        if (processedColor == null) {
          return null;
        }
        if (positions != null && positions.length > 0) {
          for (const position of positions) {
            if (typeof position === 'number' || typeof position === 'string' && position.endsWith('%')) {
              processedColorStops.push({
                color: processedColor,
                position
              });
            } else {
              return null;
            }
          }
        } else {
          processedColorStops.push({
            color: processedColor,
            position: null
          });
        }
      }
    }
    return processedColorStops;
  }
  function parseBackgroundImageCSSString(cssString) {
    const gradients = [];
    const bgImageStrings = splitGradients(cssString);
    for (const bgImageString of bgImageStrings) {
      const bgImage = bgImageString.toLowerCase();
      const gradientRegex = /^(linear|radial)-gradient\(((?:\([^)]*\)|[^()])*)\)/;
      const match = gradientRegex.exec(bgImage);
      if (match) {
        const [, type, gradientContent] = match;
        const isRadial = type.toLowerCase() === 'radial';
        const gradient = isRadial ? parseRadialGradientCSSString(gradientContent) : parseLinearGradientCSSString(gradientContent);
        if (gradient != null) {
          gradients.push(gradient);
        }
      }
    }
    return gradients;
  }
  function parseRadialGradientCSSString(gradientContent) {
    let shape = DEFAULT_RADIAL_SHAPE;
    let size = DEFAULT_RADIAL_SIZE;
    let position = Object.assign({}, DEFAULT_RADIAL_POSITION);
    const parts = gradientContent.split(/,(?![^(]*\))/);
    const firstPartStr = parts[0].trim();
    const remainingParts = [...parts];
    let hasShapeSizeOrPositionString = false;
    let hasExplicitSingleSize = false;
    let hasExplicitShape = false;
    const firstPartTokens = firstPartStr.split(/\s+/);
    while (firstPartTokens.length > 0) {
      let token = firstPartTokens.shift();
      if (token == null) {
        continue;
      }
      let tokenTrimmed = token.toLowerCase().trim();
      if (tokenTrimmed === 'circle' || tokenTrimmed === 'ellipse') {
        shape = tokenTrimmed === 'circle' ? 'circle' : 'ellipse';
        hasShapeSizeOrPositionString = true;
        hasExplicitShape = true;
      } else if (tokenTrimmed === 'closest-corner' || tokenTrimmed === 'farthest-corner' || tokenTrimmed === 'closest-side' || tokenTrimmed === 'farthest-side') {
        size = tokenTrimmed;
        hasShapeSizeOrPositionString = true;
      } else if (tokenTrimmed.endsWith('px') || tokenTrimmed.endsWith('%')) {
        let sizeX = getPositionFromCSSValue(tokenTrimmed);
        if (sizeX == null) {
          return null;
        }
        if (typeof sizeX === 'number' && sizeX < 0) {
          return null;
        }
        hasShapeSizeOrPositionString = true;
        size = {
          x: sizeX,
          y: sizeX
        };
        token = firstPartTokens.shift();
        if (token == null) {
          hasExplicitSingleSize = true;
          continue;
        }
        tokenTrimmed = token.toLowerCase().trim();
        if (tokenTrimmed.endsWith('px') || tokenTrimmed.endsWith('%')) {
          const sizeY = getPositionFromCSSValue(tokenTrimmed);
          if (sizeY == null) {
            return null;
          }
          if (typeof sizeY === 'number' && sizeY < 0) {
            return null;
          }
          size = {
            x: sizeX,
            y: sizeY
          };
        } else {
          hasExplicitSingleSize = true;
        }
      } else if (tokenTrimmed === 'at') {
        let top;
        let left;
        let right;
        let bottom;
        hasShapeSizeOrPositionString = true;
        if (firstPartTokens.length === 0) {
          return null;
        }
        if (firstPartTokens.length === 1) {
          token = firstPartTokens.shift();
          if (token == null) {
            return null;
          }
          tokenTrimmed = token.toLowerCase().trim();
          if (tokenTrimmed === 'left') {
            left = '0%';
            top = '50%';
          } else if (tokenTrimmed === 'center') {
            left = '50%';
            top = '50%';
          } else if (tokenTrimmed === 'right') {
            left = '100%';
            top = '50%';
          } else if (tokenTrimmed === 'top') {
            left = '50%';
            top = '0%';
          } else if (tokenTrimmed === 'bottom') {
            left = '50%';
            top = '100%';
          } else if (tokenTrimmed.endsWith('px') || tokenTrimmed.endsWith('%')) {
            const value = getPositionFromCSSValue(tokenTrimmed);
            if (value == null) {
              return null;
            }
            left = value;
            top = '50%';
          }
        }
        if (firstPartTokens.length === 2) {
          const t1 = firstPartTokens.shift();
          const t2 = firstPartTokens.shift();
          if (t1 == null || t2 == null) {
            return null;
          }
          const token1 = t1.toLowerCase().trim();
          const token2 = t2.toLowerCase().trim();
          const horizontalPositions = ['left', 'center', 'right'];
          const verticalPositions = ['top', 'center', 'bottom'];
          if (horizontalPositions.includes(token1) && verticalPositions.includes(token2)) {
            left = token1 === 'left' ? '0%' : token1 === 'center' ? '50%' : '100%';
            top = token2 === 'top' ? '0%' : token2 === 'center' ? '50%' : '100%';
          } else if (verticalPositions.includes(token1) && horizontalPositions.includes(token2)) {
            left = token2 === 'left' ? '0%' : token2 === 'center' ? '50%' : '100%';
            top = token1 === 'top' ? '0%' : token1 === 'center' ? '50%' : '100%';
          } else {
            if (token1 === 'left') {
              left = '0%';
            } else if (token1 === 'center') {
              left = '50%';
            } else if (token1 === 'right') {
              left = '100%';
            } else if (token1.endsWith('px') || token1.endsWith('%')) {
              const value = getPositionFromCSSValue(token1);
              if (value == null) {
                return null;
              }
              left = value;
            } else {
              return null;
            }
            if (token2 === 'top') {
              top = '0%';
            } else if (token2 === 'center') {
              top = '50%';
            } else if (token2 === 'bottom') {
              top = '100%';
            } else if (token2.endsWith('px') || token2.endsWith('%')) {
              const value = getPositionFromCSSValue(token2);
              if (value == null) {
                return null;
              }
              top = value;
            } else {
              return null;
            }
          }
        }
        if (firstPartTokens.length === 4) {
          const t1 = firstPartTokens.shift();
          const t2 = firstPartTokens.shift();
          const t3 = firstPartTokens.shift();
          const t4 = firstPartTokens.shift();
          if (t1 == null || t2 == null || t3 == null || t4 == null) {
            return null;
          }
          const token1 = t1.toLowerCase().trim();
          const token2 = t2.toLowerCase().trim();
          const token3 = t3.toLowerCase().trim();
          const token4 = t4.toLowerCase().trim();
          const keyword1 = token1;
          const value1 = getPositionFromCSSValue(token2);
          const keyword2 = token3;
          const value2 = getPositionFromCSSValue(token4);
          if (value1 == null || value2 == null) {
            return null;
          }
          if (keyword1 === 'left') {
            left = value1;
          } else if (keyword1 === 'right') {
            right = value1;
          } else if (keyword1 === 'top') {
            top = value1;
          } else if (keyword1 === 'bottom') {
            bottom = value1;
          } else {
            return null;
          }
          if (keyword2 === 'left') {
            left = value2;
          } else if (keyword2 === 'right') {
            right = value2;
          } else if (keyword2 === 'top') {
            top = value2;
          } else if (keyword2 === 'bottom') {
            bottom = value2;
          } else {
            return null;
          }
        }
        if (top != null && left != null) {
          position = {
            top,
            left
          };
        } else if (bottom != null && right != null) {
          position = {
            bottom,
            right
          };
        } else if (top != null && right != null) {
          position = {
            top,
            right
          };
        } else if (bottom != null && left != null) {
          position = {
            bottom,
            left
          };
        } else {
          return null;
        }
        break;
      }
      if (!hasShapeSizeOrPositionString) {
        break;
      }
    }
    if (hasShapeSizeOrPositionString) {
      remainingParts.shift();
      if (!hasExplicitShape && hasExplicitSingleSize) {
        shape = 'circle';
      }
      if (hasExplicitSingleSize && hasExplicitShape && shape === 'ellipse') {
        return null;
      }
    }
    const colorStops = parseColorStopsCSSString(remainingParts);
    if (colorStops == null) {
      return null;
    }
    return {
      type: 'radial-gradient',
      shape,
      size,
      position,
      colorStops
    };
  }
  function parseLinearGradientCSSString(gradientContent) {
    const parts = gradientContent.split(',');
    let direction = LINEAR_GRADIENT_DEFAULT_DIRECTION;
    const trimmedDirection = parts[0].trim().toLowerCase();
    if (LINEAR_GRADIENT_ANGLE_UNIT_REGEX.test(trimmedDirection)) {
      const parsedAngle = getAngleInDegrees(trimmedDirection);
      if (parsedAngle != null) {
        direction = {
          type: 'angle',
          value: parsedAngle
        };
        parts.shift();
      } else {
        return null;
      }
    } else if (LINEAR_GRADIENT_DIRECTION_REGEX.test(trimmedDirection)) {
      const parsedDirection = getDirectionForKeyword(trimmedDirection);
      if (parsedDirection != null) {
        direction = parsedDirection;
        parts.shift();
      } else {
        return null;
      }
    }
    const colorStops = parseColorStopsCSSString(parts);
    if (colorStops == null) {
      return null;
    }
    return {
      type: 'linear-gradient',
      direction,
      colorStops
    };
  }
  function parseColorStopsCSSString(parts) {
    const colorStopsString = parts.join(',');
    const colorStops = [];
    const stops = colorStopsString.split(/,(?![^(]*\))/);
    let prevStop = null;
    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      const trimmedStop = stop.trim().toLowerCase();
      const colorStopParts = trimmedStop.match(/\S+\([^)]*\)|\S+/g);
      if (colorStopParts == null) {
        return null;
      }
      if (colorStopParts.length === 3) {
        const color = colorStopParts[0];
        const position1 = getPositionFromCSSValue(colorStopParts[1]);
        const position2 = getPositionFromCSSValue(colorStopParts[2]);
        const processedColor = processColor(color);
        if (processedColor == null) {
          return null;
        }
        if (position1 == null || position2 == null) {
          return null;
        }
        colorStops.push({
          color: processedColor,
          position: position1
        });
        colorStops.push({
          color: processedColor,
          position: position2
        });
      } else if (colorStopParts.length === 2) {
        const color = colorStopParts[0];
        const position = getPositionFromCSSValue(colorStopParts[1]);
        const processedColor = processColor(color);
        if (processedColor == null) {
          return null;
        }
        if (position == null) {
          return null;
        }
        colorStops.push({
          color: processedColor,
          position
        });
      } else if (colorStopParts.length === 1) {
        const position = getPositionFromCSSValue(colorStopParts[0]);
        if (position != null) {
          if (prevStop != null && prevStop.length === 1 && getPositionFromCSSValue(prevStop[0]) != null || i === stops.length - 1 || i === 0) {
            return null;
          }
          colorStops.push({
            color: null,
            position
          });
        } else {
          const processedColor = processColor(colorStopParts[0]);
          if (processedColor == null) {
            return null;
          }
          colorStops.push({
            color: processedColor,
            position: null
          });
        }
      } else {
        return null;
      }
      prevStop = colorStopParts;
    }
    return colorStops;
  }
  function getDirectionForKeyword(direction) {
    if (direction == null) {
      return null;
    }
    const normalized = direction.replace(/\s+/g, ' ').toLowerCase();
    switch (normalized) {
      case 'to top':
        return {
          type: 'angle',
          value: 0
        };
      case 'to right':
        return {
          type: 'angle',
          value: 90
        };
      case 'to bottom':
        return {
          type: 'angle',
          value: 180
        };
      case 'to left':
        return {
          type: 'angle',
          value: 270
        };
      case 'to top right':
      case 'to right top':
        return {
          type: 'keyword',
          value: 'to top right'
        };
      case 'to bottom right':
      case 'to right bottom':
        return {
          type: 'keyword',
          value: 'to bottom right'
        };
      case 'to top left':
      case 'to left top':
        return {
          type: 'keyword',
          value: 'to top left'
        };
      case 'to bottom left':
      case 'to left bottom':
        return {
          type: 'keyword',
          value: 'to bottom left'
        };
      default:
        return null;
    }
  }
  function getAngleInDegrees(angle) {
    if (angle == null) {
      return null;
    }
    const match = angle.match(LINEAR_GRADIENT_ANGLE_UNIT_REGEX);
    if (!match) {
      return null;
    }
    const [, value, unit] = match;
    const numericValue = parseFloat(value);
    switch (unit) {
      case 'deg':
        return numericValue;
      case 'grad':
        return numericValue * 0.9;
      case 'rad':
        return numericValue * 180 / Math.PI;
      case 'turn':
        return numericValue * 360;
      default:
        return null;
    }
  }
  function getPositionFromCSSValue(position) {
    if (position.endsWith('px')) {
      return parseFloat(position);
    }
    if (position.endsWith('%')) {
      return position;
    }
  }
  function splitGradients(input) {
    const result = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      if (char === '(') {
        depth++;
      } else if (char === ')') {
        depth--;
      } else if (char === ',' && depth === 0) {
        result.push(current.trim());
        current = '';
        continue;
      }
      current += char;
    }
    if (current.trim() !== '') {
      result.push(current.trim());
    }
    return result;
  }
},3627,[3620]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return processBackgroundPosition;
    }
  });
  function processBackgroundPosition(backgroundPosition) {
    let result = [];
    if (backgroundPosition == null) {
      return [];
    }
    if (typeof backgroundPosition === 'string') {
      result = parseBackgroundPositionCSSString(backgroundPosition.replace(/\n/g, ' '));
    } else if (Array.isArray(backgroundPosition)) {
      result = backgroundPosition;
    }
    return result;
  }
  const parseBackgroundPositionCSSString = backgroundPosition => {
    const result = [];
    const positions = backgroundPosition.split(',').map(s => s.trim());
    for (const position of positions) {
      let top;
      let left;
      let right;
      let bottom;
      const parts = position.split(/\s+/).filter(p => p.length > 0);
      if (parts.length === 1) {
        const t1 = parts[0];
        if (t1 == null) {
          return [];
        }
        const token1 = t1.toLowerCase().trim();
        if (token1 === 'left') {
          left = '0%';
          top = '50%';
        } else if (token1 === 'center') {
          left = '50%';
          top = '50%';
        } else if (token1 === 'right') {
          left = '100%';
          top = '50%';
        } else if (token1 === 'top') {
          left = '50%';
          top = '0%';
        } else if (token1 === 'bottom') {
          left = '50%';
          top = '100%';
        } else if (isValidPosition(token1)) {
          const value = getPositionFromCSSValue(token1);
          if (value == null) {
            return [];
          }
          left = value;
          top = '50%';
        }
      }
      if (parts.length === 2) {
        const t1 = parts[0];
        const t2 = parts[1];
        if (t1 == null || t2 == null) {
          return [];
        }
        const token1 = t1.toLowerCase().trim();
        if (token1 === 'left') {
          left = '0%';
        } else if (token1 === 'center') {
          left = '50%';
        } else if (token1 === 'right') {
          left = '100%';
        } else if (token1 === 'top') {
          top = '0%';
        } else if (token1 === 'bottom') {
          top = '100%';
        } else if (isValidPosition(token1)) {
          const value = getPositionFromCSSValue(token1);
          if (value == null) {
            return [];
          }
          left = value;
        }
        const token2 = t2.toLowerCase().trim();
        if (token2 === 'top') {
          top = '0%';
        } else if (token2 === 'center') {
          top = '50%';
        } else if (token2 === 'bottom') {
          top = '100%';
        } else if (token2 === 'left') {
          left = '0%';
        } else if (token2 === 'right') {
          left = '100%';
        } else if (isValidPosition(token2)) {
          const value = getPositionFromCSSValue(token2);
          if (value == null) {
            return [];
          }
          top = value;
        }
      }
      if (parts.length === 3) {
        const t1 = parts[0];
        const t2 = parts[1];
        const t3 = parts[2];
        if (t1 == null || t2 == null || t3 == null) {
          return [];
        }
        const token1 = t1.toLowerCase().trim();
        const token2 = t2.toLowerCase().trim();
        const token3 = t3.toLowerCase().trim();
        if (token1 === 'center') {
          left = '50%';
          const value = getPositionFromCSSValue(token3);
          if (value == null) {
            return [];
          }
          if (token2 === 'top') {
            top = value;
          } else if (token2 === 'bottom') {
            bottom = value;
          } else {
            return [];
          }
        } else if (token3 === 'center') {
          top = '50%';
          const value = getPositionFromCSSValue(token2);
          if (value == null) {
            return [];
          }
          if (token1 === 'left') {
            left = value;
          } else if (token1 === 'right') {
            right = value;
          } else {
            return [];
          }
        } else {
          const tokens = [token1, token2, token3];
          for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (isValidPosition(token)) {
              const value = getPositionFromCSSValue(token);
              if (value == null) {
                return [];
              }
              const previousToken = tokens[i - 1];
              if (previousToken === 'left') {
                left = value;
              } else if (previousToken === 'right') {
                right = value;
              } else if (previousToken === 'top') {
                top = value;
              } else if (previousToken === 'bottom') {
                bottom = value;
              }
            } else {
              if (token === 'left') {
                left = '0%';
              } else if (token === 'right') {
                right = '0%';
              } else if (token === 'top') {
                top = '0%';
              } else if (token === 'bottom') {
                bottom = '0%';
              } else {
                return [];
              }
            }
          }
        }
      }
      if (parts.length === 4) {
        const t1 = parts.shift();
        const t2 = parts.shift();
        const t3 = parts.shift();
        const t4 = parts.shift();
        if (t1 == null || t2 == null || t3 == null || t4 == null) {
          return [];
        }
        const token1 = t1.toLowerCase().trim();
        const token2 = t2.toLowerCase().trim();
        const token3 = t3.toLowerCase().trim();
        const token4 = t4.toLowerCase().trim();
        const keyword1 = token1;
        const value1 = getPositionFromCSSValue(token2);
        const keyword2 = token3;
        const value2 = getPositionFromCSSValue(token4);
        if (value1 == null || value2 == null) {
          return [];
        }
        if (keyword1 === 'left') {
          left = value1;
        } else if (keyword1 === 'right') {
          right = value1;
        }
        if (keyword2 === 'top') {
          top = value2;
        } else if (keyword2 === 'bottom') {
          bottom = value2;
        }
      }
      if (top != null && left != null) {
        result.push({
          top,
          left
        });
      } else if (bottom != null && right != null) {
        result.push({
          bottom,
          right
        });
      } else if (top != null && right != null) {
        result.push({
          top,
          right
        });
      } else if (bottom != null && left != null) {
        result.push({
          bottom,
          left
        });
      } else {
        return [];
      }
    }
    return result;
  };
  function getPositionFromCSSValue(position) {
    if (position.endsWith('px')) {
      return parseFloat(position);
    }
    if (position.endsWith('%')) {
      return position;
    }
    if (position === '0') {
      return 0;
    }
  }
  function isValidPosition(position) {
    if (position.endsWith('px') || position.endsWith('%') || position === '0') {
      return true;
    }
    return false;
  }
},3628,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return processBackgroundRepeat;
    }
  });
  function isBackgroundRepeatKeyword(value) {
    return value === 'repeat' || value === 'space' || value === 'round' || value === 'no-repeat';
  }
  function processBackgroundRepeat(backgroundRepeat) {
    let result = [];
    if (backgroundRepeat == null) {
      return [];
    }
    if (Array.isArray(backgroundRepeat)) {
      return backgroundRepeat;
    }
    if (typeof backgroundRepeat === 'string') {
      result = parseBackgroundRepeatCSSString(backgroundRepeat.replace(/\n/g, ' '));
    }
    return result;
  }
  function parseBackgroundRepeatCSSString(backgroundRepeat) {
    const result = [];
    const bgRepeatArray = backgroundRepeat.split(',').map(s => s.trim());
    for (const bgRepeat of bgRepeatArray) {
      if (bgRepeat.length === 0) {
        return [];
      }
      const parts = bgRepeat.split(/\s+/).filter(p => p.length > 0);
      if (parts.length === 1) {
        const part1 = parts[0];
        if (part1 == null) {
          return [];
        }
        const token1 = part1.toLowerCase();
        if (token1 === 'repeat-x') {
          result.push({
            x: 'repeat',
            y: 'no-repeat'
          });
        } else if (token1 === 'repeat-y') {
          result.push({
            x: 'no-repeat',
            y: 'repeat'
          });
        } else if (token1 === 'repeat') {
          result.push({
            x: 'repeat',
            y: 'repeat'
          });
        } else if (token1 === 'space') {
          result.push({
            x: 'space',
            y: 'space'
          });
        } else if (token1 === 'round') {
          result.push({
            x: 'round',
            y: 'round'
          });
        } else if (token1 === 'no-repeat') {
          result.push({
            x: 'no-repeat',
            y: 'no-repeat'
          });
        } else {
          return [];
        }
      } else if (parts.length === 2) {
        const part1 = parts[0];
        const part2 = parts[1];
        if (part1 == null || part2 == null) {
          return [];
        }
        const token1 = part1.toLowerCase();
        const token2 = part2.toLowerCase();
        if (isBackgroundRepeatKeyword(token1) && isBackgroundRepeatKeyword(token2)) {
          result.push({
            x: token1,
            y: token2
          });
        } else {
          return [];
        }
      }
    }
    return result;
  }
},3629,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return processBackgroundSize;
    }
  });
  function processBackgroundSize(backgroundSize) {
    let result = [];
    if (backgroundSize == null) {
      return [];
    }
    if (typeof backgroundSize === 'string') {
      result = parseBackgroundSizeCSSString(backgroundSize.replace(/\n/g, ' '));
    } else if (Array.isArray(backgroundSize)) {
      result = backgroundSize;
    }
    return result;
  }
  function parseBackgroundSizeCSSString(backgroundSize) {
    const result = [];
    const sizes = backgroundSize.split(',').map(s => s.trim());
    for (const size of sizes) {
      if (size.length === 0) {
        return [];
      }
      const parts = size.split(/\s+/).filter(p => p.length > 0);
      if (parts.length === 2) {
        const x = getValidLengthPercentageSizeOrNull(parts[0].toLowerCase());
        const y = getValidLengthPercentageSizeOrNull(parts[1].toLowerCase());
        if (x != null && y != null) {
          result.push({
            x,
            y
          });
        } else {
          return [];
        }
      } else if (parts.length === 1) {
        const part = parts[0].toLowerCase();
        if (part === 'cover' || part === 'contain') {
          result.push(part);
        } else {
          const x = getValidLengthPercentageSizeOrNull(parts[0].toLowerCase());
          if (x != null) {
            result.push({
              x,
              y: 'auto'
            });
          } else {
            return [];
          }
        }
      }
    }
    return result;
  }
  function getValidLengthPercentageSizeOrNull(size) {
    if (size == null) {
      return null;
    }
    if (size.endsWith('px')) {
      const num = parseFloat(size);
      if (!Number.isNaN(num) && num >= 0) {
        return num;
      }
    }
    if (size.endsWith('%')) {
      if (parseFloat(size) >= 0) {
        return size;
      }
    }
    if (size === 'auto') {
      return size;
    }
    return null;
  }
},3630,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return processFilter;
    }
  });
  var _processColor = require(_dependencyMap[0]);
  var processColor = _interopDefault(_processColor);
  function processFilter(filter) {
    let result = [];
    if (filter == null) {
      return result;
    }
    if (typeof filter === 'string') {
      filter = filter.replace(/\n/g, ' ');
      const regex = /([\w-]+)\(([^()]*|\([^()]*\)|[^()]*\([^()]*\)[^()]*)\)/g;
      let matches;
      while (matches = regex.exec(filter)) {
        let filterName = matches[1].toLowerCase();
        if (filterName === 'drop-shadow') {
          const dropShadow = parseDropShadow(matches[2]);
          if (dropShadow != null) {
            result.push({
              dropShadow
            });
          } else {
            return [];
          }
        } else {
          const camelizedName = filterName === 'drop-shadow' ? 'dropShadow' : filterName === 'hue-rotate' ? 'hueRotate' : filterName;
          const amount = _getFilterAmount(camelizedName, matches[2]);
          if (amount != null) {
            const filterFunction = {};
            filterFunction[camelizedName] = amount;
            result.push(filterFunction);
          } else {
            return [];
          }
        }
      }
    } else if (Array.isArray(filter)) {
      for (const filterFunction of filter) {
        const [filterName, filterValue] = Object.entries(filterFunction)[0];
        if (filterName === 'dropShadow') {
          const dropShadow = parseDropShadow(filterValue);
          if (dropShadow == null) {
            return [];
          }
          result.push({
            dropShadow
          });
        } else {
          const amount = _getFilterAmount(filterName, filterValue);
          if (amount != null) {
            const resultObject = {};
            resultObject[filterName] = amount;
            result.push(resultObject);
          } else {
            return [];
          }
        }
      }
    } else {
      throw new TypeError(`${typeof filter} filter is not a string or array`);
    }
    return result;
  }
  function _getFilterAmount(filterName, filterArgs) {
    let filterArgAsNumber;
    let unit;
    if (typeof filterArgs === 'string') {
      const argsWithUnitsRegex = new RegExp(/([+-]?\d*(\.\d+)?)([a-zA-Z%]+)?/g);
      const match = argsWithUnitsRegex.exec(filterArgs);
      if (!match || isNaN(Number(match[1]))) {
        return undefined;
      }
      filterArgAsNumber = Number(match[1]);
      unit = match[3];
    } else if (typeof filterArgs === 'number') {
      filterArgAsNumber = filterArgs;
    } else {
      return undefined;
    }
    switch (filterName) {
      case 'hueRotate':
        if (filterArgAsNumber === 0) {
          return 0;
        }
        if (unit !== 'deg' && unit !== 'rad') {
          return undefined;
        }
        return unit === 'rad' ? 180 * filterArgAsNumber / Math.PI : filterArgAsNumber;
      case 'blur':
        if (unit && unit !== 'px' || filterArgAsNumber < 0) {
          return undefined;
        }
        return filterArgAsNumber;
      case 'brightness':
      case 'contrast':
      case 'grayscale':
      case 'invert':
      case 'opacity':
      case 'saturate':
      case 'sepia':
        if (unit && unit !== '%' && unit !== 'px' || filterArgAsNumber < 0) {
          return undefined;
        }
        if (unit === '%') {
          filterArgAsNumber /= 100;
        }
        return filterArgAsNumber;
      default:
        return undefined;
    }
  }
  function parseDropShadow(rawDropShadow) {
    const dropShadow = typeof rawDropShadow === 'string' ? parseDropShadowString(rawDropShadow) : rawDropShadow;
    const parsedDropShadow = {
      offsetX: 0,
      offsetY: 0
    };
    let offsetX;
    let offsetY;
    for (const arg in dropShadow) {
      let value;
      switch (arg) {
        case 'offsetX':
          value = typeof dropShadow.offsetX === 'string' ? parseLength(dropShadow.offsetX) : dropShadow.offsetX;
          if (value == null) {
            return null;
          }
          offsetX = value;
          break;
        case 'offsetY':
          value = typeof dropShadow.offsetY === 'string' ? parseLength(dropShadow.offsetY) : dropShadow.offsetY;
          if (value == null) {
            return null;
          }
          offsetY = value;
          break;
        case 'standardDeviation':
          value = typeof dropShadow.standardDeviation === 'string' ? parseLength(dropShadow.standardDeviation) : dropShadow.standardDeviation;
          if (value == null || value < 0) {
            return null;
          }
          parsedDropShadow.standardDeviation = value;
          break;
        case 'color':
          const color = (0, processColor.default)(dropShadow.color);
          if (color == null) {
            return null;
          }
          parsedDropShadow.color = color;
          break;
        default:
          return null;
      }
    }
    if (offsetX == null || offsetY == null) {
      return null;
    }
    parsedDropShadow.offsetX = offsetX;
    parsedDropShadow.offsetY = offsetY;
    return parsedDropShadow;
  }
  function parseDropShadowString(rawDropShadow) {
    const dropShadow = {
      offsetX: 0,
      offsetY: 0
    };
    let offsetX;
    let offsetY;
    let lengthCount = 0;
    let keywordDetectedAfterLength = false;
    for (const arg of rawDropShadow.split(/\s+(?![^(]*\))/)) {
      const processedColor = (0, processColor.default)(arg);
      if (processedColor != null) {
        if (dropShadow.color != null) {
          return null;
        }
        if (offsetX != null) {
          keywordDetectedAfterLength = true;
        }
        dropShadow.color = arg;
        continue;
      }
      switch (lengthCount) {
        case 0:
          offsetX = arg;
          lengthCount++;
          break;
        case 1:
          if (keywordDetectedAfterLength) {
            return null;
          }
          offsetY = arg;
          lengthCount++;
          break;
        case 2:
          if (keywordDetectedAfterLength) {
            return null;
          }
          dropShadow.standardDeviation = arg;
          lengthCount++;
          break;
        default:
          return null;
      }
    }
    if (offsetX == null || offsetY == null) {
      return null;
    }
    dropShadow.offsetX = offsetX;
    dropShadow.offsetY = offsetY;
    return dropShadow;
  }
  function parseLength(length) {
    const argsWithUnitsRegex = /([+-]?\d*(\.\d+)?)([\w\W]+)?/g;
    const match = argsWithUnitsRegex.exec(length);
    if (!match || Number.isNaN(match[1])) {
      return null;
    }
    if (match[3] != null && match[3] !== 'px') {
      return null;
    }
    if (match[3] == null && match[1] !== '0') {
      return null;
    }
    return Number(match[1]);
  }
},3631,[3620]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  function processFontVariant(fontVariant) {
    if (Array.isArray(fontVariant)) {
      return fontVariant;
    }
    const match = fontVariant.split(' ').filter(Boolean);
    return match;
  }
  var _default = processFontVariant;
},3632,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  const stringifySafe = require(_dependencyMap[0]).default;
  const invariant = require(_dependencyMap[1]);
  function processTransform(transform) {
    if (typeof transform === 'string') {
      const regex = new RegExp(/(\w+)\(([^)]+)\)/g);
      const transformArray = [];
      let matches;
      while (matches = regex.exec(transform)) {
        const {
          key,
          value
        } = _getKeyAndValueFromCSSTransform(matches[1], matches[2]);
        if (value !== undefined) {
          transformArray.push({
            [key]: value
          });
        }
      }
      transform = transformArray;
    }
    return transform;
  }
  const _getKeyAndValueFromCSSTransform = (key, args) => {
    const argsWithUnitsRegex = new RegExp(/([+-]?\d+(\.\d+)?)([a-zA-Z]+|%)?/g);
    switch (key) {
      case 'matrix':
        return {
          key,
          value: args.match(/[+-]?\d+(\.\d+)?/g)?.map(Number)
        };
      case 'translate':
      case 'translate3d':
        const parsedArgs = [];
        let missingUnitOfMeasurement = false;
        let matches;
        while (matches = argsWithUnitsRegex.exec(args)) {
          const value = Number(matches[1]);
          const unitOfMeasurement = matches[3];
          if (value !== 0 && !unitOfMeasurement) {
            missingUnitOfMeasurement = true;
          }
          if (unitOfMeasurement === '%') {
            parsedArgs.push(`${value}%`);
          } else {
            parsedArgs.push(value);
          }
        }
        if (parsedArgs?.length === 1) {
          parsedArgs.push(0);
        }
        return {
          key: 'translate',
          value: parsedArgs
        };
      case 'translateX':
      case 'translateY':
      case 'perspective':
        const argMatches = argsWithUnitsRegex.exec(args);
        if (!argMatches?.length) {
          return {
            key,
            value: undefined
          };
        }
        const value = Number(argMatches[1]);
        const unitOfMeasurement = argMatches[3];
        return {
          key,
          value
        };
      default:
        return {
          key,
          value: !isNaN(args) ? Number(args) : args
        };
    }
  };
  var _default = processTransform;
},3633,[3616,644]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return processTransformOrigin;
    }
  });
  var _invariant = require(_dependencyMap[0]);
  var invariant = _interopDefault(_invariant);
  const INDEX_X = 0;
  const INDEX_Y = 1;
  const INDEX_Z = 2;
  function processTransformOrigin(transformOrigin) {
    if (typeof transformOrigin === 'string') {
      const transformOriginString = transformOrigin;
      const regex = /(top|bottom|left|right|center|\d+(?:%|px)|0)/gi;
      const transformOriginArray = ['50%', '50%', 0];
      let index = INDEX_X;
      let matches;
      outer: while (matches = regex.exec(transformOriginString)) {
        let nextIndex = index + 1;
        const value = matches[0];
        const valueLower = value.toLowerCase();
        switch (valueLower) {
          case 'left':
          case 'right':
            {
              (0, invariant.default)(index === INDEX_X, 'Transform-origin %s can only be used for x-position', value);
              transformOriginArray[INDEX_X] = valueLower === 'left' ? 0 : '100%';
              break;
            }
          case 'top':
          case 'bottom':
            {
              (0, invariant.default)(index !== INDEX_Z, 'Transform-origin %s can only be used for y-position', value);
              transformOriginArray[INDEX_Y] = valueLower === 'top' ? 0 : '100%';
              if (index === INDEX_X) {
                const horizontal = regex.exec(transformOriginString);
                if (horizontal == null) {
                  break outer;
                }
                switch (horizontal[0].toLowerCase()) {
                  case 'left':
                    transformOriginArray[INDEX_X] = 0;
                    break;
                  case 'right':
                    transformOriginArray[INDEX_X] = '100%';
                    break;
                  case 'center':
                    transformOriginArray[INDEX_X] = '50%';
                    break;
                  default:
                    (0, invariant.default)(false, 'Could not parse transform-origin: %s', transformOriginString);
                }
                nextIndex = INDEX_Z;
              }
              break;
            }
          case 'center':
            {
              (0, invariant.default)(index !== INDEX_Z, 'Transform-origin value %s cannot be used for z-position', value);
              transformOriginArray[index] = '50%';
              break;
            }
          default:
            {
              if (value.endsWith('%')) {
                transformOriginArray[index] = value;
              } else {
                transformOriginArray[index] = parseFloat(value);
              }
              break;
            }
        }
        index = nextIndex;
      }
      transformOrigin = transformOriginArray;
    }
    return transformOrigin;
  }
},3634,[644]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  const dummySize = {
    width: undefined,
    height: undefined
  };
  function sizesDiffer(one, two) {
    const defaultedOne = one || dummySize;
    const defaultedTwo = two || dummySize;
    return defaultedOne !== defaultedTwo && (defaultedOne.width !== defaultedTwo.width || defaultedOne.height !== defaultedTwo.height);
  }
  var _default = sizesDiffer;
},3635,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _NativeModulesSpecsNativeSourceCode = require(_dependencyMap[0]);
  var SourceCode = _interopDefault(_NativeModulesSpecsNativeSourceCode);
  const AssetSourceResolver = require(_dependencyMap[1]).default;
  const {
    pickScale
  } = require(_dependencyMap[2]);
  const AssetRegistry = require(_dependencyMap[3]);
  let _customSourceTransformers = [];
  let _serverURL;
  let _scriptURL;
  let _sourceCodeScriptURL;
  function getSourceCodeScriptURL() {
    if (_sourceCodeScriptURL != null) {
      return _sourceCodeScriptURL;
    }
    _sourceCodeScriptURL = SourceCode.default.getConstants().scriptURL;
    return _sourceCodeScriptURL;
  }
  function getDevServerURL() {
    if (_serverURL === undefined) {
      const sourceCodeScriptURL = getSourceCodeScriptURL();
      const match = sourceCodeScriptURL?.match(/^https?:\/\/.*?\//);
      if (match) {
        _serverURL = match[0];
      } else {
        _serverURL = null;
      }
    }
    return _serverURL;
  }
  function _coerceLocalScriptURL(scriptURL) {
    let normalizedScriptURL = scriptURL;
    if (normalizedScriptURL != null) {
      if (normalizedScriptURL.startsWith('assets://')) {
        return null;
      }
      normalizedScriptURL = normalizedScriptURL.substring(0, normalizedScriptURL.lastIndexOf('/') + 1);
      if (!normalizedScriptURL.includes('://')) {
        normalizedScriptURL = 'file://' + normalizedScriptURL;
      }
    }
    return normalizedScriptURL;
  }
  function getScriptURL() {
    if (_scriptURL === undefined) {
      _scriptURL = _coerceLocalScriptURL(getSourceCodeScriptURL());
    }
    return _scriptURL;
  }
  function setCustomSourceTransformer(transformer) {
    _customSourceTransformers = [transformer];
  }
  function addCustomSourceTransformer(transformer) {
    _customSourceTransformers.push(transformer);
  }
  function resolveAssetSource(source) {
    if (source == null || typeof source === 'object') {
      return source;
    }
    const asset = AssetRegistry.getAssetByID(source);
    if (!asset) {
      return null;
    }
    const resolver = new AssetSourceResolver(getDevServerURL(), getScriptURL(), asset);
    if (_customSourceTransformers) {
      for (const customSourceTransformer of _customSourceTransformers) {
        const transformedSource = customSourceTransformer(resolver);
        if (transformedSource != null) {
          return transformedSource;
        }
      }
    }
    return resolver.defaultAsset();
  }
  resolveAssetSource.pickScale = pickScale;
  resolveAssetSource.setCustomSourceTransformer = setCustomSourceTransformer;
  resolveAssetSource.addCustomSourceTransformer = addCustomSourceTransformer;
  var _default = resolveAssetSource;
},3636,[3637,3639,3646,470]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _srcPrivateSpecs_DEPRECATEDModulesNativeSourceCode = require(_dependencyMap[0]);
  Object.keys(_srcPrivateSpecs_DEPRECATEDModulesNativeSourceCode).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _srcPrivateSpecs_DEPRECATEDModulesNativeSourceCode[k];
        }
      });
    }
  });
  var NativeSourceCode = _interopDefault(_srcPrivateSpecs_DEPRECATEDModulesNativeSourceCode);
  var _default = NativeSourceCode.default;
},3637,[3638]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = {};
    if (e) Object.keys(e).forEach(function (k) {
      var d = Object.getOwnPropertyDescriptor(e, k);
      Object.defineProperty(n, k, d.get ? d : {
        enumerable: true,
        get: function () {
          return e[k];
        }
      });
    });
    n.default = e;
    return n;
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _LibrariesTurboModuleTurboModuleRegistry = require(_dependencyMap[0]);
  var TurboModuleRegistry = _interopNamespace(_LibrariesTurboModuleTurboModuleRegistry);
  const NativeModule = TurboModuleRegistry.getEnforcing('SourceCode');
  let constants = null;
  const NativeSourceCode = {
    getConstants() {
      if (constants == null) {
        constants = NativeModule.getConstants();
      }
      return constants;
    }
  };
  var _default = NativeSourceCode;
},3638,[3610]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  const PixelRatio = require(_dependencyMap[0]).default;
  const Platform = require(_dependencyMap[1]).default;
  const {
    pickScale
  } = require(_dependencyMap[2]);
  const {
    getAndroidResourceFolderName,
    getAndroidResourceIdentifier,
    getBasePath
  } = require(_dependencyMap[3]);
  const invariant = require(_dependencyMap[4]);
  function getScaledAssetPath(asset) {
    const scale = pickScale(asset.scales, PixelRatio.get());
    const scaleSuffix = scale === 1 ? '' : '@' + scale + 'x';
    const assetDir = getBasePath(asset);
    return assetDir + '/' + asset.name + scaleSuffix + '.' + asset.type;
  }
  function getAssetPathInDrawableFolder(asset) {
    const scale = pickScale(asset.scales, PixelRatio.get());
    const drawableFolder = getAndroidResourceFolderName(asset, scale);
    const fileName = getAndroidResourceIdentifier(asset);
    return drawableFolder + '/' + fileName + '.' + asset.type;
  }
  function assetSupportsNetworkLoads(asset) {
    return !(asset.type === 'xml' && false);
  }
  class AssetSourceResolver {
    constructor(serverUrl, jsbundleUrl, asset) {
      this.serverUrl = serverUrl;
      this.jsbundleUrl = jsbundleUrl;
      this.asset = asset;
    }
    isLoadedFromServer() {
      return this.serverUrl != null && this.serverUrl !== '' && assetSupportsNetworkLoads(this.asset);
    }
    isLoadedFromFileSystem() {
      return this.jsbundleUrl != null && this.jsbundleUrl?.startsWith('file://');
    }
    defaultAsset() {
      if (this.isLoadedFromServer()) {
        return this.assetServerURL();
      }
      if (this.asset.resolver != null) {
        return this.getAssetUsingResolver(this.asset.resolver);
      }
      {
        return this.scaledAssetURLNearBundle();
      }
    }
    getAssetUsingResolver(resolver) {
      switch (resolver) {
        case 'android':
          return this.isLoadedFromFileSystem() ? this.drawableFolderInBundle() : this.resourceIdentifierWithoutScale();
        case 'generic':
          return this.scaledAssetURLNearBundle();
        default:
          throw new Error("Don't know how to get asset via provided resolver: " + resolver + '\nAsset: ' + JSON.stringify(this.asset, null, '\t') + '\nPossible resolvers are:' + JSON.stringify(['android', 'generic'], null, '\t'));
      }
    }
    assetServerURL() {
      invariant(this.serverUrl != null, 'need server to load from');
      return this.fromSource(this.serverUrl + getScaledAssetPath(this.asset) + '?platform=' + "web" + '&hash=' + this.asset.hash);
    }
    scaledAssetPath() {
      return this.fromSource(getScaledAssetPath(this.asset));
    }
    scaledAssetURLNearBundle() {
      const path = this.jsbundleUrl ?? 'file://';
      return this.fromSource(path + getScaledAssetPath(this.asset).replace(/\.\.\//g, '_'));
    }
    resourceIdentifierWithoutScale() {
      invariant(false, 'resource identifiers work on Android');
      return this.fromSource(getAndroidResourceIdentifier(this.asset));
    }
    drawableFolderInBundle() {
      const path = this.jsbundleUrl ?? 'file://';
      return this.fromSource(path + getAssetPathInDrawableFolder(this.asset));
    }
    fromSource(source) {
      return {
        __packager_asset: true,
        width: this.asset.width,
        height: this.asset.height,
        uri: source,
        scale: pickScale(this.asset.scales, PixelRatio.get())
      };
    }
    static pickScale = pickScale;
  }
  var _default = AssetSourceResolver;
},3639,[3640,3621,3646,3647,644]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  const Dimensions = require(_dependencyMap[0]).default;
  class PixelRatio {
    static get() {
      return Dimensions.get('window').scale;
    }
    static getFontScale() {
      return Dimensions.get('window').fontScale || PixelRatio.get();
    }
    static getPixelSizeForLayoutSize(layoutSize) {
      return Math.round(layoutSize * PixelRatio.get());
    }
    static roundToNearestPixel(layoutSize) {
      const ratio = PixelRatio.get();
      return Math.round(layoutSize * ratio) / ratio;
    }
    static startDetecting() {}
  }
  var _default = PixelRatio;
},3640,[3641]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _EventEmitterRCTDeviceEventEmitter = require(_dependencyMap[0]);
  var RCTDeviceEventEmitter = _interopDefault(_EventEmitterRCTDeviceEventEmitter);
  var _vendorEmitterEventEmitter = require(_dependencyMap[1]);
  var EventEmitter = _interopDefault(_vendorEmitterEventEmitter);
  var _NativeDeviceInfo = require(_dependencyMap[2]);
  var NativeDeviceInfo = _interopDefault(_NativeDeviceInfo);
  var _invariant = require(_dependencyMap[3]);
  var invariant = _interopDefault(_invariant);
  const eventEmitter = new EventEmitter.default();
  let dimensionsInitialized = false;
  let dimensions;
  class Dimensions {
    static get(dim) {
      (0, invariant.default)(dimensions[dim], 'No dimension set for key ' + dim);
      return dimensions[dim];
    }
    static set(dims) {
      let {
        screen,
        window
      } = dims;
      const {
        windowPhysicalPixels
      } = dims;
      if (windowPhysicalPixels) {
        window = {
          width: windowPhysicalPixels.width / windowPhysicalPixels.scale,
          height: windowPhysicalPixels.height / windowPhysicalPixels.scale,
          scale: windowPhysicalPixels.scale,
          fontScale: windowPhysicalPixels.fontScale
        };
      }
      const {
        screenPhysicalPixels
      } = dims;
      if (screenPhysicalPixels) {
        screen = {
          width: screenPhysicalPixels.width / screenPhysicalPixels.scale,
          height: screenPhysicalPixels.height / screenPhysicalPixels.scale,
          scale: screenPhysicalPixels.scale,
          fontScale: screenPhysicalPixels.fontScale
        };
      } else if (screen == null) {
        screen = window;
      }
      dimensions = {
        window,
        screen
      };
      if (dimensionsInitialized) {
        eventEmitter.emit('change', dimensions);
      } else {
        dimensionsInitialized = true;
      }
    }
    static addEventListener(type, handler) {
      (0, invariant.default)(type === 'change', 'Trying to subscribe to unknown event: "%s"', type);
      return eventEmitter.addListener(type, handler);
    }
  }
  RCTDeviceEventEmitter.default.addListener('didUpdateDimensions', update => {
    Dimensions.set(update);
  });
  Dimensions.set(NativeDeviceInfo.default.getConstants().Dimensions);
  var _default = Dimensions;
},3641,[3642,3643,3644,644]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _PerformanceSystrace = require(_dependencyMap[0]);
  var _vendorEmitterEventEmitter = require(_dependencyMap[1]);
  var EventEmitter = _interopDefault(_vendorEmitterEventEmitter);
  class RCTDeviceEventEmitterImpl extends EventEmitter.default {
    emit(eventType, ...args) {
      (0, _PerformanceSystrace.beginEvent)(() => `RCTDeviceEventEmitter.emit#${eventType}`);
      try {
        super.emit(eventType, ...args);
      } finally {
        (0, _PerformanceSystrace.endEvent)();
      }
    }
  }
  const RCTDeviceEventEmitter = new RCTDeviceEventEmitterImpl();
  Object.defineProperty(global, '__rctDeviceEventEmitter', {
    configurable: true,
    value: RCTDeviceEventEmitter
  });
  var _default = RCTDeviceEventEmitter;
},3642,[3614,3643]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return EventEmitter;
    }
  });
  class EventEmitter {
    #registry;
    constructor() {
      this.#registry = {};
    }
    addListener(eventType, listener, context) {
      if (typeof listener !== 'function') {
        throw new TypeError('EventEmitter.addListener(...): 2nd argument must be a function.');
      }
      const registrations = allocate(this.#registry, eventType);
      const registration = {
        context,
        listener,
        remove() {
          registrations.delete(registration);
        }
      };
      registrations.add(registration);
      return registration;
    }
    emit(eventType, ...args) {
      const registrations = this.#registry[eventType];
      if (registrations != null) {
        for (const registration of Array.from(registrations)) {
          registration.listener.apply(registration.context, args);
        }
      }
    }
    removeAllListeners(eventType) {
      if (eventType == null) {
        this.#registry = {};
      } else {
        delete this.#registry[eventType];
      }
    }
    listenerCount(eventType) {
      const registrations = this.#registry[eventType];
      return registrations == null ? 0 : registrations.size;
    }
  }
  function allocate(registry, eventType) {
    let registrations = registry[eventType];
    if (registrations == null) {
      registrations = new Set();
      registry[eventType] = registrations;
    }
    return registrations;
  }
},3643,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _srcPrivateSpecs_DEPRECATEDModulesNativeDeviceInfo2.default;
    }
  });
  var _srcPrivateSpecs_DEPRECATEDModulesNativeDeviceInfo = require(_dependencyMap[0]);
  Object.keys(_srcPrivateSpecs_DEPRECATEDModulesNativeDeviceInfo).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _srcPrivateSpecs_DEPRECATEDModulesNativeDeviceInfo[k];
        }
      });
    }
  });
  var _srcPrivateSpecs_DEPRECATEDModulesNativeDeviceInfo2 = _interopDefault(_srcPrivateSpecs_DEPRECATEDModulesNativeDeviceInfo);
},3644,[3645]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = {};
    if (e) Object.keys(e).forEach(function (k) {
      var d = Object.getOwnPropertyDescriptor(e, k);
      Object.defineProperty(n, k, d.get ? d : {
        enumerable: true,
        get: function () {
          return e[k];
        }
      });
    });
    n.default = e;
    return n;
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _LibrariesTurboModuleTurboModuleRegistry = require(_dependencyMap[0]);
  var TurboModuleRegistry = _interopNamespace(_LibrariesTurboModuleTurboModuleRegistry);
  const NativeModule = TurboModuleRegistry.getEnforcing('DeviceInfo');
  let constants = null;
  const NativeDeviceInfo = {
    getConstants() {
      if (constants == null) {
        constants = NativeModule.getConstants();
      }
      return constants;
    }
  };
  var _default = NativeDeviceInfo;
},3645,[3610]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  exports.pickScale = pickScale;
  exports.setUrlCacheBreaker = setUrlCacheBreaker;
  exports.getUrlCacheBreaker = getUrlCacheBreaker;
  var _UtilitiesPixelRatio = require(_dependencyMap[0]);
  var PixelRatio = _interopDefault(_UtilitiesPixelRatio);
  let cacheBreaker;
  let warnIfCacheBreakerUnset = true;
  function pickScale(scales, deviceScale) {
    const requiredDeviceScale = deviceScale ?? PixelRatio.default.get();
    for (let i = 0; i < scales.length; i++) {
      if (scales[i] >= requiredDeviceScale) {
        return scales[i];
      }
    }
    return scales[scales.length - 1] || 1;
  }
  function setUrlCacheBreaker(appendage) {
    cacheBreaker = appendage;
  }
  function getUrlCacheBreaker() {
    if (cacheBreaker == null) {
      return '';
    }
    return cacheBreaker;
  }
},3646,[3640]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  const androidScaleSuffix = {
    '0.75': 'ldpi',
    '1': 'mdpi',
    '1.5': 'hdpi',
    '2': 'xhdpi',
    '3': 'xxhdpi',
    '4': 'xxxhdpi'
  };
  const ANDROID_BASE_DENSITY = 160;
  function getAndroidAssetSuffix(scale) {
    if (scale.toString() in androidScaleSuffix) {
      return androidScaleSuffix[scale.toString()];
    }
    if (Number.isFinite(scale) && scale > 0) {
      return Math.round(scale * ANDROID_BASE_DENSITY) + 'dpi';
    }
    throw new Error('no such scale ' + scale.toString());
  }
  const drawableFileTypes = new Set(['gif', 'heic', 'heif', 'jpeg', 'jpg', 'ktx', 'png', 'webp', 'xml']);
  function getAndroidResourceFolderName(asset, scale) {
    if (!drawableFileTypes.has(asset.type)) {
      return 'raw';
    }
    const suffix = getAndroidAssetSuffix(scale);
    if (!suffix) {
      throw new Error("Don't know which android drawable suffix to use for scale: " + scale + '\nAsset: ' + JSON.stringify(asset, null, '\t') + '\nPossible scales are:' + JSON.stringify(androidScaleSuffix, null, '\t'));
    }
    return 'drawable-' + suffix;
  }
  function getAndroidResourceIdentifier(asset) {
    return (getBasePath(asset) + '/' + asset.name).toLowerCase().replace(/\//g, '_').replace(/([^a-z0-9_])/g, '').replace(/^(?:assets|assetsunstable_path)_/, '');
  }
  function getBasePath(asset) {
    const basePath = asset.httpServerLocation;
    return basePath.startsWith('/') ? basePath.slice(1) : basePath;
  }
  module.exports = {
    getAndroidResourceFolderName,
    getAndroidResourceIdentifier,
    getBasePath
  };
},3647,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _processColor = require(_dependencyMap[0]);
  var processColor = _interopDefault(_processColor);
  const TRANSPARENT = 0;
  function processColorArray(colors) {
    return colors == null ? null : colors.map(processColorElement);
  }
  function processColorElement(color) {
    const value = (0, processColor.default)(color);
    if (value == null) {
      console.error('Invalid value in color array:', color);
      return TRANSPARENT;
    }
    return value;
  }
  var _default = processColorArray;
},3648,[3620]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  const dummyInsets = {
    top: undefined,
    left: undefined,
    right: undefined,
    bottom: undefined
  };
  function insetsDiffer(one, two) {
    one = one || dummyInsets;
    two = two || dummyInsets;
    return one !== two && (one.top !== two.top || one.left !== two.left || one.right !== two.right || one.bottom !== two.bottom);
  }
  var _default = insetsDiffer;
},3649,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  function matricesDiffer(one, two) {
    if (one === two) {
      return false;
    }
    return !one || !two || one[12] !== two[12] || one[13] !== two[13] || one[14] !== two[14] || one[5] !== two[5] || one[10] !== two[10] || one[0] !== two[0] || one[1] !== two[1] || one[2] !== two[2] || one[3] !== two[3] || one[4] !== two[4] || one[6] !== two[6] || one[7] !== two[7] || one[8] !== two[8] || one[9] !== two[9] || one[11] !== two[11] || one[15] !== two[15];
  }
  var _default = matricesDiffer;
},3650,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  const dummyPoint = {
    x: undefined,
    y: undefined
  };
  function pointsDiffer(one, two) {
    one = one || dummyPoint;
    two = two || dummyPoint;
    return one !== two && (one.x !== two.x || one.y !== two.y);
  }
  var _default = pointsDiffer;
},3651,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _FabricUIManager = require(_dependencyMap[0]);
  var _nullthrows = require(_dependencyMap[1]);
  var nullthrows = _interopDefault(_nullthrows);
  function isFabricReactTag(reactTag) {
    return reactTag % 2 === 0;
  }
  const UIManagerImpl = global.RN$Bridgeless === true ? require(_dependencyMap[2]).default : require(_dependencyMap[3]).default;
  const UIManager = Object.assign({}, UIManagerImpl, {
    measure(reactTag, callback) {
      if (isFabricReactTag(reactTag)) {
        const FabricUIManager = (0, nullthrows.default)((0, _FabricUIManager.getFabricUIManager)());
        const shadowNode = FabricUIManager.findShadowNodeByTag_DEPRECATED(reactTag);
        if (shadowNode) {
          FabricUIManager.measure(shadowNode, callback);
        } else {
          console.warn(`measure cannot find view with tag #${reactTag}`);
          callback();
        }
      } else {
        UIManagerImpl.measure(reactTag, callback);
      }
    },
    measureInWindow(reactTag, callback) {
      if (isFabricReactTag(reactTag)) {
        const FabricUIManager = (0, nullthrows.default)((0, _FabricUIManager.getFabricUIManager)());
        const shadowNode = FabricUIManager.findShadowNodeByTag_DEPRECATED(reactTag);
        if (shadowNode) {
          FabricUIManager.measureInWindow(shadowNode, callback);
        } else {
          console.warn(`measure cannot find view with tag #${reactTag}`);
          callback();
        }
      } else {
        UIManagerImpl.measureInWindow(reactTag, callback);
      }
    },
    measureLayout(reactTag, ancestorReactTag, errorCallback, callback) {
      if (isFabricReactTag(reactTag)) {
        const FabricUIManager = (0, nullthrows.default)((0, _FabricUIManager.getFabricUIManager)());
        const shadowNode = FabricUIManager.findShadowNodeByTag_DEPRECATED(reactTag);
        const ancestorShadowNode = FabricUIManager.findShadowNodeByTag_DEPRECATED(ancestorReactTag);
        if (!shadowNode || !ancestorShadowNode) {
          return;
        }
        FabricUIManager.measureLayout(shadowNode, ancestorShadowNode, errorCallback, callback);
      } else {
        UIManagerImpl.measureLayout(reactTag, ancestorReactTag, errorCallback, callback);
      }
    },
    measureLayoutRelativeToParent(reactTag, errorCallback, callback) {
      if (isFabricReactTag(reactTag)) {
        console.warn('RCTUIManager.measureLayoutRelativeToParent method is deprecated and it will not be implemented in newer versions of RN (Fabric) - T47686450');
        const FabricUIManager = (0, nullthrows.default)((0, _FabricUIManager.getFabricUIManager)());
        const shadowNode = FabricUIManager.findShadowNodeByTag_DEPRECATED(reactTag);
        if (shadowNode) {
          FabricUIManager.measure(shadowNode, (left, top, width, height, pageX, pageY) => {
            callback(left, top, width, height);
          });
        }
      } else {
        UIManagerImpl.measureLayoutRelativeToParent(reactTag, errorCallback, callback);
      }
    },
    dispatchViewManagerCommand(reactTag, commandName, commandArgs) {
      if (typeof reactTag !== 'number') {
        throw new Error('dispatchViewManagerCommand: found null reactTag');
      }
      if (isFabricReactTag(reactTag)) {
        const FabricUIManager = (0, nullthrows.default)((0, _FabricUIManager.getFabricUIManager)());
        const shadowNode = FabricUIManager.findShadowNodeByTag_DEPRECATED(reactTag);
        if (shadowNode) {
          commandName = `${commandName}`;
          FabricUIManager.dispatchCommand(shadowNode, commandName, commandArgs);
        }
      } else {
        UIManagerImpl.dispatchViewManagerCommand(reactTag, commandName, commandArgs);
      }
    }
  });
  var _default = UIManager;
},3652,[3653,191,3654,3656]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  exports.getFabricUIManager = getFabricUIManager;
  var _UtilitiesDefineLazyObjectProperty = require(_dependencyMap[0]);
  var defineLazyObjectProperty = _interopDefault(_UtilitiesDefineLazyObjectProperty);
  let nativeFabricUIManagerProxy;
  const CACHED_PROPERTIES = ['createNode', 'cloneNode', 'cloneNodeWithNewChildren', 'cloneNodeWithNewProps', 'cloneNodeWithNewChildrenAndProps', 'createChildSet', 'appendChild', 'appendChildToSet', 'completeRoot', 'measure', 'measureInWindow', 'measureLayout', 'configureNextLayoutAnimation', 'sendAccessibilityEvent', 'findShadowNodeByTag_DEPRECATED', 'setNativeProps', 'dispatchCommand', 'compareDocumentPosition', 'getBoundingClientRect', 'unstable_DefaultEventPriority', 'unstable_DiscreteEventPriority', 'unstable_ContinuousEventPriority', 'unstable_IdleEventPriority', 'unstable_getCurrentEventPriority'];
  function getFabricUIManager() {
    if (nativeFabricUIManagerProxy == null && global.nativeFabricUIManager != null) {
      nativeFabricUIManagerProxy = createProxyWithCachedProperties(global.nativeFabricUIManager, CACHED_PROPERTIES);
    }
    return nativeFabricUIManagerProxy;
  }
  function createProxyWithCachedProperties(implementation, propertiesToCache) {
    const proxy = Object.create(implementation);
    for (const propertyName of propertiesToCache) {
      (0, defineLazyObjectProperty.default)(proxy, propertyName, {
        get: () => implementation[propertyName]
      });
    }
    return proxy;
  }
},3653,[3619]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _NativeComponentNativeComponentRegistryUnstable = require(_dependencyMap[0]);
  var _UtilitiesDefineLazyObjectProperty = require(_dependencyMap[1]);
  var defineLazyObjectProperty = _interopDefault(_UtilitiesDefineLazyObjectProperty);
  require(_dependencyMap[2]);
  var _FabricUIManager = require(_dependencyMap[3]);
  var _nullthrows = require(_dependencyMap[4]);
  var nullthrows = _interopDefault(_nullthrows);
  function raiseSoftError(methodName, details) {
    console.error(`[ReactNative Architecture][JS] '${methodName}' is not available in the new React Native architecture.` + (details ? ` ${details}` : ''));
  }
  const getUIManagerConstants = global.RN$LegacyInterop_UIManager_getConstants;
  const getUIManagerConstantsCached = function () {
    let wasCalledOnce = false;
    let result = {};
    return () => {
      if (!wasCalledOnce) {
        result = (0, nullthrows.default)(getUIManagerConstants)();
        wasCalledOnce = true;
      }
      return result;
    };
  }();
  const getConstantsForViewManager = global.RN$LegacyInterop_UIManager_getConstantsForViewManager;
  const getDefaultEventTypes = global.RN$LegacyInterop_UIManager_getDefaultEventTypes;
  const getDefaultEventTypesCached = function () {
    let wasCalledOnce = false;
    let result = null;
    return () => {
      if (!wasCalledOnce) {
        result = (0, nullthrows.default)(getDefaultEventTypes)();
        wasCalledOnce = true;
      }
      return result;
    };
  }();
  const UIManagerJSOverridenAPIs = {
    measure: (reactTag, callback) => {
      raiseSoftError('measure');
    },
    measureInWindow: (reactTag, callback) => {
      raiseSoftError('measureInWindow');
    },
    measureLayout: (reactTag, ancestorReactTag, errorCallback, callback) => {
      raiseSoftError('measureLayout');
    },
    measureLayoutRelativeToParent: (reactTag, errorCallback, callback) => {
      raiseSoftError('measureLayoutRelativeToParent');
    },
    dispatchViewManagerCommand: (reactTag, commandID, commandArgs) => {
      raiseSoftError('dispatchViewManagerCommand');
    }
  };
  const UIManagerJSUnusedInNewArchAPIs = {
    createView: (reactTag, viewName, rootTag, props) => {
      raiseSoftError('createView');
    },
    updateView: (reactTag, viewName, props) => {
      raiseSoftError('updateView');
    },
    setChildren: (containerTag, reactTags) => {
      raiseSoftError('setChildren');
    },
    manageChildren: (containerTag, moveFromIndices, moveToIndices, addChildReactTags, addAtIndices, removeAtIndices) => {
      raiseSoftError('manageChildren');
    },
    setJSResponder: (reactTag, blockNativeResponder) => {
      raiseSoftError('setJSResponder');
    },
    clearJSResponder: () => {
      raiseSoftError('clearJSResponder');
    }
  };
  const UIManagerJSDeprecatedPlatformAPIs = undefined;
  const UIManagerJSPlatformAPIs = undefined;
  const UIManagerJS = Object.assign({}, UIManagerJSOverridenAPIs, UIManagerJSDeprecatedPlatformAPIs, UIManagerJSPlatformAPIs, UIManagerJSUnusedInNewArchAPIs, {
    getViewManagerConfig: viewManagerName => {
      if (getUIManagerConstants) {
        const constants = getUIManagerConstantsCached();
        if (!constants[viewManagerName] && UIManagerJS.getConstantsForViewManager) {
          constants[viewManagerName] = UIManagerJS.getConstantsForViewManager(viewManagerName);
        }
        return constants[viewManagerName];
      } else {
        raiseSoftError(`getViewManagerConfig('${viewManagerName}')`, `If '${viewManagerName}' has a ViewManager and you want to retrieve its native ViewConfig, please turn on the native ViewConfig interop layer. If you want to see if this component is registered with React Native, please call hasViewManagerConfig('${viewManagerName}') instead.`);
        return null;
      }
    },
    hasViewManagerConfig: viewManagerName => {
      return (0, _NativeComponentNativeComponentRegistryUnstable.unstable_hasComponent)(viewManagerName);
    },
    getConstants: () => {
      if (getUIManagerConstants) {
        return getUIManagerConstantsCached();
      } else {
        raiseSoftError('getConstants');
        return null;
      }
    },
    findSubviewIn: (reactTag, point, callback) => {
      const FabricUIManager = (0, nullthrows.default)((0, _FabricUIManager.getFabricUIManager)());
      const shadowNode = FabricUIManager.findShadowNodeByTag_DEPRECATED(reactTag);
      if (!shadowNode) {
        console.error(`findSubviewIn() noop: Cannot find view with reactTag ${reactTag}`);
        return;
      }
      FabricUIManager.findNodeAtPoint(shadowNode, point[0], point[1], function (internalInstanceHandle) {
        if (internalInstanceHandle == null) {
          console.error('findSubviewIn(): Cannot find node at point');
          return;
        }
        let instanceHandle = internalInstanceHandle;
        let node = instanceHandle.stateNode.node;
        if (!node) {
          console.error('findSubviewIn(): Cannot find node at point');
          return;
        }
        let nativeViewTag = instanceHandle.stateNode.canonical.nativeTag;
        FabricUIManager.measure(node, function (x, y, width, height, pageX, pageY) {
          callback(nativeViewTag, pageX, pageY, width, height);
        });
      });
    },
    viewIsDescendantOf: (reactTag, ancestorReactTag, callback) => {
      const FabricUIManager = (0, nullthrows.default)((0, _FabricUIManager.getFabricUIManager)());
      const shadowNode = FabricUIManager.findShadowNodeByTag_DEPRECATED(reactTag);
      if (!shadowNode) {
        console.error(`viewIsDescendantOf() noop: Cannot find view with reactTag ${reactTag}`);
        return;
      }
      const ancestorShadowNode = FabricUIManager.findShadowNodeByTag_DEPRECATED(ancestorReactTag);
      if (!ancestorShadowNode) {
        console.error(`viewIsDescendantOf() noop: Cannot find view with ancestorReactTag ${ancestorReactTag}`);
        return;
      }
      const DOCUMENT_POSITION_CONTAINED_BY = 16;
      let result = FabricUIManager.compareDocumentPosition(ancestorShadowNode, shadowNode);
      let isAncestor = (result & DOCUMENT_POSITION_CONTAINED_BY) !== 0;
      callback([isAncestor]);
    },
    configureNextLayoutAnimation: (config, callback, errorCallback) => {
      const FabricUIManager = (0, nullthrows.default)((0, _FabricUIManager.getFabricUIManager)());
      FabricUIManager.configureNextLayoutAnimation(config, callback, errorCallback);
    }
  });
  if (getUIManagerConstants) {
    Object.keys(getUIManagerConstantsCached()).forEach(viewConfigName => {
      UIManagerJS[viewConfigName] = getUIManagerConstantsCached()[viewConfigName];
    });
    if (UIManagerJS.getConstants().ViewManagerNames) {
      UIManagerJS.getConstants().ViewManagerNames.forEach(viewManagerName => {
        (0, defineLazyObjectProperty.default)(UIManagerJS, viewManagerName, {
          get: () => (0, nullthrows.default)(UIManagerJS.getConstantsForViewManager)(viewManagerName)
        });
      });
    }
  }
  var _default = UIManagerJS;
},3654,[3655,3619,3621,3653,191]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.unstable_hasComponent = unstable_hasComponent;
  let componentNameToExists = new Map();
  function unstable_hasComponent(name) {
    let hasNativeComponent = componentNameToExists.get(name);
    if (hasNativeComponent == null) {
      if (global.__nativeComponentRegistry__hasComponent) {
        hasNativeComponent = global.__nativeComponentRegistry__hasComponent(name);
        componentNameToExists.set(name, hasNativeComponent);
      } else {
        throw new Error(`unstable_hasComponent('${name}'): Global function is not registered`);
      }
    }
    return hasNativeComponent;
  }
},3655,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _NativeUIManager = require(_dependencyMap[0]);
  var NativeUIManager = _interopDefault(_NativeUIManager);
  var _nullthrows = require(_dependencyMap[1]);
  var nullthrows = _interopDefault(_nullthrows);
  const NativeModules = require(_dependencyMap[2]).default;
  const defineLazyObjectProperty = require(_dependencyMap[3]).default;
  const Platform = require(_dependencyMap[4]).default;
  const UIManagerProperties = require(_dependencyMap[5]).default;
  const viewManagerConfigs = {};
  const triedLoadingConfig = new Set();
  let NativeUIManagerConstants = {};
  let isNativeUIManagerConstantsSet = false;
  function getConstants() {
    if (!isNativeUIManagerConstantsSet) {
      NativeUIManagerConstants = NativeUIManager.default.getConstants();
      isNativeUIManagerConstantsSet = true;
    }
    return NativeUIManagerConstants;
  }
  function getViewManagerConfig(viewManagerName) {
    if (viewManagerConfigs[viewManagerName] === undefined && NativeUIManager.default.getConstantsForViewManager) {
      try {
        viewManagerConfigs[viewManagerName] = NativeUIManager.default.getConstantsForViewManager(viewManagerName);
      } catch (e) {
        console.error("NativeUIManager.getConstantsForViewManager('" + viewManagerName + "') threw an exception.", e);
        viewManagerConfigs[viewManagerName] = null;
      }
    }
    const config = viewManagerConfigs[viewManagerName];
    if (config) {
      return config;
    }
    if (!global.nativeCallSyncHook) {
      return config;
    }
    if (NativeUIManager.default.lazilyLoadView && !triedLoadingConfig.has(viewManagerName)) {
      const result = (0, nullthrows.default)(NativeUIManager.default.lazilyLoadView)(viewManagerName);
      triedLoadingConfig.add(viewManagerName);
      if (result != null && result.viewConfig != null) {
        getConstants()[viewManagerName] = result.viewConfig;
        lazifyViewManagerConfig(viewManagerName);
      }
    }
    return viewManagerConfigs[viewManagerName];
  }
  const UIManagerJS = Object.assign({}, NativeUIManager.default, {
    createView(reactTag, viewName, rootTag, props) {
      NativeUIManager.default.createView(reactTag, viewName, rootTag, props);
    },
    getConstants() {
      return getConstants();
    },
    getViewManagerConfig(viewManagerName) {
      return getViewManagerConfig(viewManagerName);
    },
    hasViewManagerConfig(viewManagerName) {
      return getViewManagerConfig(viewManagerName) != null;
    }
  });
  NativeUIManager.default.getViewManagerConfig = UIManagerJS.getViewManagerConfig;
  function lazifyViewManagerConfig(viewName) {
    const viewConfig = getConstants()[viewName];
    viewManagerConfigs[viewName] = viewConfig;
    if (viewConfig.Manager) {
      defineLazyObjectProperty(viewConfig, 'Constants', {
        get: () => {
          const viewManager = NativeModules[viewConfig.Manager];
          const constants = {};
          viewManager && Object.keys(viewManager).forEach(key => {
            const value = viewManager[key];
            if (typeof value !== 'function') {
              constants[key] = value;
            }
          });
          return constants;
        }
      });
      defineLazyObjectProperty(viewConfig, 'Commands', {
        get: () => {
          const viewManager = NativeModules[viewConfig.Manager];
          const commands = {};
          let index = 0;
          viewManager && Object.keys(viewManager).forEach(key => {
            const value = viewManager[key];
            if (typeof value === 'function') {
              commands[key] = index++;
            }
          });
          return commands;
        }
      });
    }
  }
  if (getConstants().ViewManagerNames) {
    NativeUIManager.default.getConstants().ViewManagerNames.forEach(viewManagerName => {
      defineLazyObjectProperty(NativeUIManager.default, viewManagerName, {
        get: () => (0, nullthrows.default)(NativeUIManager.default.getConstantsForViewManager)(viewManagerName)
      });
    });
  }
  if (!global.nativeCallSyncHook) {
    Object.keys(getConstants()).forEach(viewManagerName => {
      if (!UIManagerProperties.includes(viewManagerName)) {
        if (!viewManagerConfigs[viewManagerName]) {
          viewManagerConfigs[viewManagerName] = getConstants()[viewManagerName];
        }
        defineLazyObjectProperty(NativeUIManager.default, viewManagerName, {
          get: () => {
            console.warn(`Accessing view manager configs directly off UIManager via UIManager['${viewManagerName}'] ` + `is no longer supported. Use UIManager.getViewManagerConfig('${viewManagerName}') instead.`);
            return UIManagerJS.getViewManagerConfig(viewManagerName);
          }
        });
      }
    });
  }
  var _default = UIManagerJS;
},3656,[3657,191,3611,3619,3621,3659]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _srcPrivateSpecs_DEPRECATEDModulesNativeUIManager = require(_dependencyMap[0]);
  Object.keys(_srcPrivateSpecs_DEPRECATEDModulesNativeUIManager).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _srcPrivateSpecs_DEPRECATEDModulesNativeUIManager[k];
        }
      });
    }
  });
  var NativeUIManager = _interopDefault(_srcPrivateSpecs_DEPRECATEDModulesNativeUIManager);
  var _default = NativeUIManager.default;
},3657,[3658]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = {};
    if (e) Object.keys(e).forEach(function (k) {
      var d = Object.getOwnPropertyDescriptor(e, k);
      Object.defineProperty(n, k, d.get ? d : {
        enumerable: true,
        get: function () {
          return e[k];
        }
      });
    });
    n.default = e;
    return n;
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _LibrariesTurboModuleTurboModuleRegistry = require(_dependencyMap[0]);
  var TurboModuleRegistry = _interopNamespace(_LibrariesTurboModuleTurboModuleRegistry);
  var _default = TurboModuleRegistry.getEnforcing('UIManager');
},3658,[3610]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  const UIManagerProperties = ['clearJSResponder', 'configureNextLayoutAnimation', 'createView', 'dispatchViewManagerCommand', 'findSubviewIn', 'getConstantsForViewManager', 'getDefaultEventTypes', 'manageChildren', 'measure', 'measureInWindow', 'measureLayout', 'measureLayoutRelativeToParent', 'removeRootView', 'sendAccessibilityEvent', 'setChildren', 'setJSResponder', 'setLayoutAnimationEnabledExperimental', 'updateView', 'viewIsDescendantOf', 'LazyViewManagersEnabled', 'ViewManagerNames', 'StyleConstants', 'AccessibilityEventTypes', 'UIView', 'getViewManagerConfig', 'hasViewManagerConfig', 'blur', 'focus', 'genericBubblingEventTypes', 'genericDirectEventTypes', 'lazilyLoadView'];
  var _default = UIManagerProperties;
},3659,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "customBubblingEventTypes", {
    enumerable: true,
    get: function () {
      return customBubblingEventTypes;
    }
  });
  Object.defineProperty(exports, "customDirectEventTypes", {
    enumerable: true,
    get: function () {
      return customDirectEventTypes;
    }
  });
  exports.register = register;
  exports.get = get;
  var _invariant = require(_dependencyMap[0]);
  var invariant = _interopDefault(_invariant);
  const customBubblingEventTypes = {};
  const customDirectEventTypes = {};
  const viewConfigCallbacks = new Map();
  const viewConfigs = new Map();
  function processEventTypes(viewConfig) {
    const {
      bubblingEventTypes,
      directEventTypes
    } = viewConfig;
    if (bubblingEventTypes != null) {
      for (const topLevelType in bubblingEventTypes) {
        if (customBubblingEventTypes[topLevelType] == null) {
          customBubblingEventTypes[topLevelType] = bubblingEventTypes[topLevelType];
        }
      }
    }
    if (directEventTypes != null) {
      for (const topLevelType in directEventTypes) {
        if (customDirectEventTypes[topLevelType] == null) {
          customDirectEventTypes[topLevelType] = directEventTypes[topLevelType];
        }
      }
    }
  }
  function register(name, callback) {
    (0, invariant.default)(!viewConfigCallbacks.has(name), 'Tried to register two views with the same name %s', name);
    (0, invariant.default)(typeof callback === 'function', 'View config getter callback for component `%s` must be a function (received `%s`)', name, callback === null ? 'null' : typeof callback);
    viewConfigCallbacks.set(name, callback);
    return name;
  }
  function get(name) {
    let viewConfig = viewConfigs.get(name);
    if (viewConfig == null) {
      const callback = viewConfigCallbacks.get(name);
      if (typeof callback !== 'function') {
        (0, invariant.default)(false, 'View config getter callback for component `%s` must be a function (received `%s`).%s', name, callback === null ? 'null' : typeof callback, typeof name[0] === 'string' && /[a-z]/.test(name[0]) ? ' Make sure to start component names with a capital letter.' : '');
      }
      viewConfig = callback();
      (0, invariant.default)(viewConfig, 'View config not found for component `%s`', name);
      processEventTypes(viewConfig);
      viewConfigs.set(name, viewConfig);
      viewConfigCallbacks.set(name, null);
    }
    return viewConfig;
  }
},3660,[644]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = {};
    if (e) Object.keys(e).forEach(function (k) {
      var d = Object.getOwnPropertyDescriptor(e, k);
      Object.defineProperty(n, k, d.get ? d : {
        enumerable: true,
        get: function () {
          return e[k];
        }
      });
    });
    n.default = e;
    return n;
  }
  exports.validate = validate;
  exports.stringifyValidationResult = stringifyValidationResult;
  var _srcPrivateFeatureflagsReactNativeFeatureFlags = require(_dependencyMap[0]);
  var ReactNativeFeatureFlags = _interopNamespace(_srcPrivateFeatureflagsReactNativeFeatureFlags);
  function validate(name, nativeViewConfig, staticViewConfig) {
    const differences = [];
    accumulateDifferences(differences, [], {
      bubblingEventTypes: nativeViewConfig.bubblingEventTypes,
      directEventTypes: nativeViewConfig.directEventTypes,
      uiViewClassName: nativeViewConfig.uiViewClassName,
      validAttributes: nativeViewConfig.validAttributes
    }, {
      bubblingEventTypes: staticViewConfig.bubblingEventTypes,
      directEventTypes: staticViewConfig.directEventTypes,
      uiViewClassName: staticViewConfig.uiViewClassName,
      validAttributes: staticViewConfig.validAttributes
    });
    if (differences.length === 0) {
      return {
        type: 'valid'
      };
    }
    return {
      type: 'invalid',
      differences
    };
  }
  function stringifyValidationResult(name, validationResult) {
    const {
      differences
    } = validationResult;
    return [`StaticViewConfigValidator: Invalid static view config for '${name}'.`, '', ...differences.map(difference => {
      const {
        type,
        path
      } = difference;
      switch (type) {
        case 'missing':
          return `- '${path.join('.')}' is missing.`;
        case 'unequal':
          return `- '${path.join('.')}' is the wrong value.`;
      }
    }), ''].join('\n');
  }
  function accumulateDifferences(differences, path, nativeObject, staticObject) {
    for (const nativeKey in nativeObject) {
      const nativeValue = nativeObject[nativeKey];
      if (!staticObject.hasOwnProperty(nativeKey)) {
        differences.push({
          path: [...path, nativeKey],
          type: 'missing',
          nativeValue
        });
        continue;
      }
      const staticValue = staticObject[nativeKey];
      const nativeValueIfObject = ifObject(nativeValue);
      if (nativeValueIfObject != null) {
        const staticValueIfObject = ifObject(staticValue);
        if (staticValueIfObject != null) {
          path.push(nativeKey);
          accumulateDifferences(differences, path, nativeValueIfObject, staticValueIfObject);
          path.pop();
          continue;
        }
      }
      if (nativeValue !== staticValue && !ReactNativeFeatureFlags.enableNativeCSSParsing()) {
        differences.push({
          path: [...path, nativeKey],
          type: 'unequal',
          nativeValue,
          staticValue
        });
      }
    }
  }
  function ifObject(value) {
    return typeof value === 'object' && !Array.isArray(value) ? value : null;
  }
},3661,[3607]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  exports.createViewConfig = createViewConfig;
  var _PlatformBaseViewConfig = require(_dependencyMap[0]);
  var PlatformBaseViewConfig = _interopDefault(_PlatformBaseViewConfig);
  function createViewConfig(partialViewConfig) {
    return {
      uiViewClassName: partialViewConfig.uiViewClassName,
      Commands: {},
      bubblingEventTypes: composeIndexers(PlatformBaseViewConfig.default.bubblingEventTypes, partialViewConfig.bubblingEventTypes),
      directEventTypes: composeIndexers(PlatformBaseViewConfig.default.directEventTypes, partialViewConfig.directEventTypes),
      validAttributes: composeIndexers(PlatformBaseViewConfig.default.validAttributes, partialViewConfig.validAttributes)
    };
  }
  function composeIndexers(maybeA, maybeB) {
    return maybeA == null || maybeB == null ? maybeA ?? maybeB ?? {} : Object.assign({}, maybeA, maybeB);
  }
},3662,[3663]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _BaseViewConfig = require(_dependencyMap[0]);
  var BaseViewConfig = _interopDefault(_BaseViewConfig);
  const PlatformBaseViewConfig = BaseViewConfig.default;
  var _default = PlatformBaseViewConfig;
},3663,[3664]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return _default;
    }
  });
  var _BaseViewConfig = require(_dependencyMap[0]);
  var BaseViewConfig = _interopDefault(_BaseViewConfig);
  var _default = BaseViewConfig.default;
},3664,[3664]);
__d(function(global, require, _importDefaultUnused, _importAllUnused, module, exports, _dependencyMapUnused) {
  module.exports = {
  "uiViewClassName": "RiveView",
  "supportsRawText": false,
  "bubblingEventTypes": {},
  "directEventTypes": {},
  "validAttributes": {
    "artboardName": true,
    "stateMachineName": true,
    "autoPlay": true,
    "file": true,
    "alignment": true,
    "fit": true,
    "layoutScaleFactor": true,
    "dataBind": true,
    "onError": true,
    "hybridRef": true
  }
}
;
},3665,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  const _excluded = ["onError", "hybridRef"];
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  exports.RiveView = RiveView;
  var _babelRuntimeHelpersObjectWithoutPropertiesLoose = require(_dependencyMap[0]);
  var _objectWithoutPropertiesLoose = _interopDefault(_babelRuntimeHelpersObjectWithoutPropertiesLoose);
  var _reactCompilerRuntime = require(_dependencyMap[1]);
  var _react = require(_dependencyMap[2]);
  var _NitroRiveViewComponentJs = require(_dependencyMap[3]);
  var _ErrorsJs = require(_dependencyMap[4]);
  var _callDisposeJs = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  const defaultOnError = error => console.error(`[${_ErrorsJs.RiveErrorType[error.type]}] ${error.message}`);

  /**
   * RiveView is a React Native component that renders Rive graphics.
   * It provides a seamless way to display and control Rive graphics in your app.
   *
   * @example
   * ```tsx
   * <RiveView
   *   file={riveFile}
   *   artboardName="New Artboard"
   *   stateMachineName="State Machine 1"
   *   autoPlay={true}
   *   fit={Fit.Contain}
   *   style={styles.riveContainer}
   * />
   * ```
   *
   * @property {RiveFile} file - The Rive file to be displayed
   * @property {string} [artboardName] - Name of the artboard to display from the Rive file
   * @property {string} [stateMachineName] - Name of the state machine to play
   * @property {ViewModelInstance | DataBindMode | DataBindByName} [dataBind] - Data binding configuration for the state machine, defaults to DataBindMode.Auto
   * @property {boolean} [autoPlay=true] - Whether to automatically start playing the state machine
   * @property {Alignment} [alignment] - How the Rive graphic should be aligned within its container
   * @property {Fit} [fit] - How the Rive graphic should fit within its container
   * @property {Object} [style] - React Native style object for container customization
   * @property {(error: RiveError) => void} [onError] - Callback function that is called when an error occurs
   *
   * The component also exposes methods for controlling playback:
   * - play(): Starts playing the Rive graphic
   * - pause(): Pauses the Rive graphic
   */
  function RiveView(props) {
    const $ = (0, _reactCompilerRuntime.c)(16);
    let onError;
    let rest;
    let userHybridRef;
    if ($[0] !== props) {
      var _props = props;
      ({
        onError,
        hybridRef: userHybridRef
      } = _props);
      rest = (0, _objectWithoutPropertiesLoose.default)(_props, _excluded);
      _props;
      $[0] = props;
      $[1] = onError;
      $[2] = rest;
      $[3] = userHybridRef;
    } else {
      onError = $[1];
      rest = $[2];
      userHybridRef = $[3];
    }
    const wrappedOnError = onError ?? defaultOnError;
    const viewRef = (0, _react.useRef)(null);
    let t0;
    let t1;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
      t0 = () => () => {
        if (viewRef.current) {
          (0, _callDisposeJs.callDispose)(viewRef.current);
          viewRef.current = null;
        }
      };
      t1 = [];
      $[4] = t0;
      $[5] = t1;
    } else {
      t0 = $[4];
      t1 = $[5];
    }
    (0, _react.useEffect)(t0, t1);
    let t2;
    if ($[6] !== userHybridRef) {
      t2 = ref => {
        viewRef.current = ref;
        if (userHybridRef?.f) {
          userHybridRef.f(ref);
        }
      };
      $[6] = userHybridRef;
      $[7] = t2;
    } else {
      t2 = $[7];
    }
    const setRef = t2;
    let t3;
    if ($[8] !== wrappedOnError) {
      t3 = {
        f: wrappedOnError
      };
      $[8] = wrappedOnError;
      $[9] = t3;
    } else {
      t3 = $[9];
    }
    let t4;
    if ($[10] !== setRef) {
      t4 = {
        f: setRef
      };
      $[10] = setRef;
      $[11] = t4;
    } else {
      t4 = $[11];
    }
    let t5;
    if ($[12] !== rest || $[13] !== t3 || $[14] !== t4) {
      t5 = /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_NitroRiveViewComponentJs.NitroRiveView, Object.assign({}, rest, {
        onError: t3,
        hybridRef: t4
      }));
      $[12] = rest;
      $[13] = t3;
      $[14] = t4;
      $[15] = t5;
    } else {
      t5 = $[15];
    }
    return t5;
  }
},3666,[21,3667,12,3589,3669,3670,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  /**
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  'use strict';

  {
    module.exports = require(_dependencyMap[0]);
  }
},3667,[3668]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  /**
   * @license React
   * react-compiler-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  "use strict";

  var ReactSharedInternals = require(_dependencyMap[0]).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  exports.c = function (size) {
    return ReactSharedInternals.H.useMemoCache(size);
  };
},3668,[12]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "RiveErrorType", {
    enumerable: true,
    get: function () {
      return RiveErrorType;
    }
  });
  let RiveErrorType = /*#__PURE__*/function (RiveErrorType) {
    RiveErrorType[RiveErrorType["Unknown"] = 0] = "Unknown";
    RiveErrorType[RiveErrorType["FileNotFound"] = 1] = "FileNotFound";
    RiveErrorType[RiveErrorType["MalformedFile"] = 2] = "MalformedFile";
    RiveErrorType[RiveErrorType["IncorrectArtboardName"] = 3] = "IncorrectArtboardName";
    RiveErrorType[RiveErrorType["IncorrectStateMachineName"] = 4] = "IncorrectStateMachineName";
    RiveErrorType[RiveErrorType["ViewModelInstanceNotFound"] = 6] = "ViewModelInstanceNotFound";
    RiveErrorType[RiveErrorType["IncorrectStateMachineInputName"] = 8] = "IncorrectStateMachineInputName";
    return RiveErrorType;
  }({});
},3669,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.callDispose = callDispose;
  const NITRO_DISPOSE_ERROR = 'failed to define internal native state property';
  /**
   * Safely disposes a Nitro HybridObject.
   *
   * Before calling dispose(), overrides all JS-visible properties with undefined
   * so that React Fabric can safely diff old props without crashing. Without this,
   * Fabric's cloneNodeWithNewProps reads properties (e.g. toString, artboardNames)
   * from the disposed object whose NativeState is already null, causing:
   *   "Cannot get hybrid property ... - `this`'s `NativeState` is `null`"
   *
   * Also handles https://github.com/mrousavy/nitro/issues/1083
   */
  function callDispose(obj) {
    // Override inherited (prototype) properties — these are the Nitro HybridObject
    // getters that would throw after dispose. Own properties are left alone since
    // they are plain JS values, not native getters.
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) continue;
      if (key === '__type' || key === 'dispose') continue;
      try {
        Object.defineProperty(obj, key, {
          value: undefined,
          enumerable: false,
          configurable: true
        });
      } catch (_) {
        // non-configurable — skip
      }
    }
    try {
      Object.defineProperty(obj, 'toString', {
        value: () => '[disposed HybridObject]',
        enumerable: false,
        configurable: true
      });
    } catch (_) {
      // skip
    }
    try {
      obj.dispose();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? '');
      if (!message.includes(NITRO_DISPOSE_ERROR)) {
        throw error;
      }
    }
  }
},3670,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "Fit", {
    enumerable: true,
    get: function () {
      return Fit;
    }
  });
  let Fit = /*#__PURE__*/function (Fit) {
    /**
     * Rive content will fill the available view. If the aspect ratios differ,
     * then the Rive content will be stretched.
     */
    Fit[Fit["Fill"] = 0] = "Fill";
    /**
     * Rive content will be contained within the view, preserving the aspect
     * ratio. If the ratios differ, then a portion of the view will be unused
     */
    Fit[Fit["Contain"] = 1] = "Contain";
    /**
     * Rive will cover the view, preserving the aspect ratio. If the Rive
     * content has a different ratio to the view, then the Rive content will be
     * clipped.
     */
    Fit[Fit["Cover"] = 2] = "Cover";
    /**
     * Rive content will fill to the width of the view. This may result in
     * clipping or unfilled view space.
     */
    Fit[Fit["FitWidth"] = 3] = "FitWidth";
    /**
     * Rive content will fill to the height of the view. This may result in
     * clipping or unfilled view space.
     */
    Fit[Fit["FitHeight"] = 4] = "FitHeight";
    /**
     * Rive content will render to the size of its artboard, which may result
     * in clipping or unfilled view space.
     */
    Fit[Fit["None"] = 5] = "None";
    /**
     * Rive content is scaled down to the size of the view, preserving the
     * aspect ratio. This is equivalent to Contain when the content is larger
     * than the canvas. If the canvas is larger, then ScaleDown will not scale
     * up.
     */
    Fit[Fit["ScaleDown"] = 6] = "ScaleDown";
    /**
     * Rive content will be resized automatically based on layout constraints of
     * the artboard to match the underlying widget size.
     *
     * @see [Responsive Layout](https://rive.app/community/doc/layout/docBl81zd1GB#responsive-layout)
     */
    Fit[Fit["Layout"] = 7] = "Layout";
    return Fit;
  }({});
},3671,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "Alignment", {
    enumerable: true,
    get: function () {
      return Alignment;
    }
  });
  let Alignment = /*#__PURE__*/function (Alignment) {
    /**
     * Aligns content to the top-left corner of the container
     */
    Alignment["TopLeft"] = "topLeft";
    /**
     * Centers content horizontally at the top of the container
     */
    Alignment["TopCenter"] = "topCenter";
    /**
     * Aligns content to the top-right corner of the container
     */
    Alignment["TopRight"] = "topRight";
    /**
     * Centers content vertically on the left side of the container
     */
    Alignment["CenterLeft"] = "centerLeft";
    /**
     * Centers content both horizontally and vertically in the container
     */
    Alignment["Center"] = "center";
    /**
     * Centers content vertically on the right side of the container
     */
    Alignment["CenterRight"] = "centerRight";
    /**
     * Aligns content to the bottom-left corner of the container
     */
    Alignment["BottomLeft"] = "bottomLeft";
    /**
     * Centers content horizontally at the bottom of the container
     */
    Alignment["BottomCenter"] = "bottomCenter";
    /**
     * Aligns content to the bottom-right corner of the container
     */
    Alignment["BottomRight"] = "bottomRight";
    return Alignment;
  }({});
},3672,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "RiveFileFactory", {
    enumerable: true,
    get: function () {
      return RiveFileFactory;
    }
  });
  var _reactNativeNitroModules = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsImage = require(_dependencyMap[1]);
  var Image = _interopDefault(_reactNativeWebDistExportsImage);
  const RiveFileInternal = _reactNativeNitroModules.NitroModules.createHybridObject('RiveFileFactory');

  /**
   * Factory namespace for creating RiveFile instances from different sources.
   * Provides static methods to load Rive files from URLs, resources, or raw bytes.
   */
  let RiveFileFactory;
  (function (_RiveFileFactory) {
    async function fromURL(url, referencedAssets, loadCdn = true) {
      return RiveFileInternal.fromURL(url, loadCdn, referencedAssets ? {
        data: referencedAssets
      } : undefined);
    }
    _RiveFileFactory.fromURL = fromURL;
    async function fromFileURL(fileURL, referencedAssets = undefined, loadCdn = true) {
      return RiveFileInternal.fromFileURL(fileURL, loadCdn, referencedAssets ? {
        data: referencedAssets
      } : undefined);
    }
    _RiveFileFactory.fromFileURL = fromFileURL;
    async function fromResource(resource, referencedAssets, loadCdn = true) {
      return RiveFileInternal.fromResource(resource, loadCdn, referencedAssets ? {
        data: referencedAssets
      } : undefined);
    }
    _RiveFileFactory.fromResource = fromResource;
    async function fromBytes(bytes, referencedAssets, loadCdn = true) {
      return RiveFileInternal.fromBytes(bytes, loadCdn, referencedAssets ? {
        data: referencedAssets
      } : undefined);
    }
    _RiveFileFactory.fromBytes = fromBytes;
    async function fromSource(source, referencedAssets, loadCdn = true) {
      const assetID = typeof source === 'number' ? source : null;
      const sourceURI = typeof source === 'object' ? source.uri : null;
      const assetURI = assetID ? Image.default.resolveAssetSource(assetID)?.uri : sourceURI;
      if (!assetURI) {
        throw new Error(`Invalid source: could not resolve asset ${source}. Ensure 'riv' is in metro.config.js assetExts.`);
      }
      try {
        // handle http address and dev server
        if (assetURI.match(/https?:\/\//)) {
          return RiveFileFactory.fromURL(assetURI, referencedAssets, loadCdn);
        }

        // handle iOS bundled asset
        if (assetURI.match(/file:\/\//)) {
          return RiveFileFactory.fromFileURL(assetURI, referencedAssets, loadCdn);
        }

        // handle Android bundled asset or resource name uri
        return RiveFileFactory.fromResource(assetURI, referencedAssets, loadCdn);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to load Rive file from source: ${errorMessage}`);
      }
    }
    _RiveFileFactory.fromSource = fromSource;
  })(RiveFileFactory || (RiveFileFactory = {}));
},3673,[3590,469]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "RiveImages", {
    enumerable: true,
    get: function () {
      return RiveImages;
    }
  });
  var _reactNativeNitroModules = require(_dependencyMap[0]);
  const RiveImages = _reactNativeNitroModules.NitroModules.createHybridObject('RiveImageFactory');
},3674,[3590]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "RiveFonts", {
    enumerable: true,
    get: function () {
      return RiveFonts;
    }
  });
  var _reactNativeNitroModules = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsImage = require(_dependencyMap[1]);
  var Image = _interopDefault(_reactNativeWebDistExportsImage);
  const RiveFontConfigInternal = _reactNativeNitroModules.NitroModules.createHybridObject('RiveFontConfig');

  /**
   * A font source that can be:
   * - `number` — a Metro `require('./Font.ttf')` asset ID
   * - `{ uri: string }` — a URI object (http/https URL, file:// path, or resource name)
   * - `string` — a native resource name (e.g. "kanit_regular.ttf") or URL
   * - `{ name: string }` — a system font name (e.g. "Arial", "sans-serif")
   * - `ArrayBuffer` — raw font bytes (TTF/OTF)
   */

  const DEFAULT_WEIGHT = 0;
  function resolveWeight(key) {
    return key === 'default' ? DEFAULT_WEIGHT : Number(key);
  }
  let RiveFonts;
  (function (_RiveFonts) {
    async function loadFont(source) {
      if (source instanceof ArrayBuffer) {
        return RiveFontConfigInternal.loadFontFromBytes(source);
      }
      if (typeof source === 'number') {
        const resolved = Image.default.resolveAssetSource(source);
        if (!resolved?.uri) {
          throw new Error(`Invalid font asset: could not resolve require() ID ${source}. Ensure 'ttf' is in metro.config.js assetExts.`);
        }
        return loadFontByURI(resolved.uri);
      }
      if (typeof source === 'object' && 'name' in source) {
        return RiveFontConfigInternal.loadFontByName(source.name);
      }
      if (typeof source === 'object' && 'uri' in source) {
        return loadFontByURI(source.uri);
      }
      if (typeof source === 'string') {
        if (/^https?:\/\//.test(source) || /^file:\/\//.test(source)) {
          return RiveFontConfigInternal.loadFontFromURL(source);
        }
        return RiveFontConfigInternal.loadFontFromResource(source);
      }
      throw new Error(`Invalid font source: ${String(source)}`);
    }
    _RiveFonts.loadFont = loadFont;
    function systemFallback() {
      return RiveFontConfigInternal.getSystemDefaultFont();
    }
    _RiveFonts.systemFallback = systemFallback;
    async function setFallbackFonts(fontsByWeight) {
      for (const [key, fonts] of Object.entries(fontsByWeight)) {
        if (fonts) {
          RiveFontConfigInternal.setFontsForWeight(resolveWeight(key), fonts);
        }
      }
      await RiveFontConfigInternal.applyFallbackFonts();
    }
    _RiveFonts.setFallbackFonts = setFallbackFonts;
    async function clearFallbackFonts() {
      return RiveFontConfigInternal.clearFallbackFonts();
    }
    _RiveFonts.clearFallbackFonts = clearFallbackFonts;
  })(RiveFonts || (RiveFonts = {}));
  function loadFontByURI(uri) {
    if (/^https?:\/\//.test(uri) || /^file:\/\//.test(uri)) {
      return RiveFontConfigInternal.loadFontFromURL(uri);
    }
    return RiveFontConfigInternal.loadFontFromResource(uri);
  }
},3675,[3590,469]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  /* eslint-disable no-bitwise */

  /**
   * Represents a color in RGBA format for use with Rive color data binding.
   * Each channel (r, g, b, a) is represented as a number between 0-255.
   */
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "RiveColor", {
    enumerable: true,
    get: function () {
      return RiveColor;
    }
  });
  class RiveColor {
    /**
     * Creates a new RiveColor instance.
     * @param r - Red channel (0-255)
     * @param g - Green channel (0-255)
     * @param b - Blue channel (0-255)
     * @param a - Alpha channel (0-255, where 255 is fully opaque)
     */
    constructor(r, g, b, a) {
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
    }

    /**
     * Compares this color with another RiveColor instance.
     * @param other - The RiveColor to compare with
     * @returns true if the colors are equal, false otherwise
     */
    equals(other) {
      if (!other) return false;
      return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
    }

    /**
     * Creates a RiveColor instance from a hex color string.
     * Supports both 6-digit (#RRGGBB) and 8-digit (#RRGGBBAA) formats.
     * @param color - Hex color string (e.g., '#FF0000' or '#FF000080')
     * @returns A new RiveColor instance
     * @throws Will return black (0,0,0,255) with a warning if the hex string is invalid
     */
    static fromHexString(color) {
      const hex = color.replace(/^#/, '');
      const isValidHex = /^[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(hex);
      if (!isValidHex) {
        console.warn(`Rive invalid hex color: ${color}`);
        return new RiveColor(0, 0, 0, 255);
      }
      let r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16),
        a = 255;

      // Optionally parse alpha channel if present
      if (hex.length === 8) {
        a = parseInt(hex.slice(6, 8), 16);
      }
      return new RiveColor(r, g, b, a);
    }

    /**
     * Creates a RiveColor instance from a 32-bit integer.
     * The integer should be in ARGB format where:
     * - Bits 24-31: Alpha channel
     * - Bits 16-23: Red channel
     * - Bits 8-15: Green channel
     * - Bits 0-7: Blue channel
     * @param colorValue - 32-bit integer representing the color
     * @returns A new RiveColor instance
     */
    static fromInt(colorValue) {
      const a = colorValue >> 24 & 0xff;
      const r = colorValue >> 16 & 0xff;
      const g = colorValue >> 8 & 0xff;
      const b = colorValue & 0xff;
      return new RiveColor(r, g, b, a);
    }

    /**
     * Converts this color to a 32-bit integer in ARGB format.
     * @returns A 32-bit integer where:
     * - Bits 24-31: Alpha channel
     * - Bits 16-23: Red channel
     * - Bits 8-15: Green channel
     * - Bits 0-7: Blue channel
     */
    toInt() {
      return (this.a & 0xff) << 24 | (this.r & 0xff) << 16 | (this.g & 0xff) << 8 | this.b & 0xff;
    }
  }
},3676,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "RiveEventType", {
    enumerable: true,
    get: function () {
      return RiveEventType;
    }
  });
  let RiveEventType = /*#__PURE__*/function (RiveEventType) {
    RiveEventType[RiveEventType["General"] = 0] = "General";
    RiveEventType[RiveEventType["OpenUrl"] = 1] = "OpenUrl";
    return RiveEventType;
  }({});
},3677,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  /**
   * Creates an ArtboardBy object for the artboard at the given index.
   * @param {number} index - The index of the artboard to create an ArtboardBy object for.
   * @returns {ArtboardBy} An ArtboardBy object for the artboard at the given index.
   */
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "ArtboardByIndex", {
    enumerable: true,
    get: function () {
      return ArtboardByIndex;
    }
  });
  Object.defineProperty(exports, "ArtboardByName", {
    enumerable: true,
    get: function () {
      return ArtboardByName;
    }
  });
  const ArtboardByIndex = index => {
    if (!Number.isInteger(index)) {
      throw new Error('Artboard index must be an integer');
    }
    return {
      type: 'index',
      index: index
    };
  };

  /**
   * Creates an ArtboardBy object for the artboard with the given name.
   * @param {string} name - The name of the artboard to create an ArtboardBy object for.
   * @returns {ArtboardBy} An ArtboardBy object for the artboard with the given name.
   */
  const ArtboardByName = name => ({
    type: 'name',
    name: name
  });
},3678,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useRive = useRive;
  var _reactCompilerRuntime = require(_dependencyMap[0]);
  var _react = require(_dependencyMap[1]);
  function useRive() {
    const $ = (0, _reactCompilerRuntime.c)(4);
    const riveRef = (0, _react.useRef)(null);
    const [riveViewRef, setRiveViewRef] = (0, _react.useState)(null);
    const timeoutRef = (0, _react.useRef)(null);
    let t0;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
      t0 = node => {
        if (riveRef.current !== node) {
          riveRef.current = node;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          const timeout = new Promise((_, reject) => {
            timeoutRef.current = setTimeout(() => {
              reject(new Error("Rive view ready timeout"));
            }, 5000);
          });
          Promise.race([node?.awaitViewReady(), timeout]).then(result => {
            if (result === true) {
              setRiveViewRef(node);
            } else {
              console.warn("Rive view ready check returned false");
              setRiveViewRef(null);
            }
          }).catch(error => {
            console.warn("Failed to initialize Rive view:", error);
            setRiveViewRef(null);
          }).finally(() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          });
        }
      };
      $[0] = t0;
    } else {
      t0 = $[0];
    }
    const setRef = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
      t1 = {
        f: setRef
      };
      $[1] = t1;
    } else {
      t1 = $[1];
    }
    let t2;
    if ($[2] !== riveViewRef) {
      t2 = {
        riveRef,
        riveViewRef,
        setHybridRef: t1
      };
      $[2] = riveViewRef;
      $[3] = t2;
    } else {
      t2 = $[3];
    }
    return t2;
  }
},3679,[3667,12]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useRiveNumber = useRiveNumber;
  var _reactCompilerRuntime = require(_dependencyMap[0]);
  var _useRivePropertyJs = require(_dependencyMap[1]);
  const getNumberProperty = (vmi, p) => vmi.numberProperty(p);

  /**
   * Hook for interacting with number ViewModel instance properties.
   *
   * @param path - The path to the number property
   * @param viewModelInstance - The ViewModelInstance containing the number property to operate on
   * @returns An object with the number value, a setter function, and an error if the property is not found
   */
  function useRiveNumber(path, viewModelInstance) {
    const $ = (0, _reactCompilerRuntime.c)(4);
    const [value, setValue, error] = (0, _useRivePropertyJs.useRiveProperty)(viewModelInstance, path, getNumberProperty);
    let t0;
    if ($[0] !== error || $[1] !== setValue || $[2] !== value) {
      t0 = {
        value,
        setValue,
        error
      };
      $[0] = error;
      $[1] = setValue;
      $[2] = value;
      $[3] = t0;
    } else {
      t0 = $[3];
    }
    return t0;
  }
},3680,[3667,3681]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useRiveProperty = useRiveProperty;
  var _react = require(_dependencyMap[0]);
  var _useDisposableMemoJs = require(_dependencyMap[1]);
  /**
   * Base hook for all ViewModelInstance value-property interactions
   * (number, string, boolean, color, enum).
   *
   * Not used for triggers — see {@link useRiveTrigger} which manages its own
   * property lifecycle to avoid coupling callback identity to native disposal.
   *
   * @template P - The type of the property (e.g., ViewModelBooleanProperty)
   * @template T - The primitive type of the property value (number, boolean, string)
   *
   * @param viewModelInstance - The source ViewModelInstance
   * @param path - Property path in the ViewModelInstance
   * @param getProperty - Function to get the property from a ViewModelInstance
   * @returns A tuple containing [value, setter, error, property]
   */
  function useRiveProperty(viewModelInstance, path, getProperty) {
    const property = (0, _useDisposableMemoJs.useDisposableMemo)(() => {
      if (!viewModelInstance) return undefined;
      return getProperty(viewModelInstance, path);
    }, p => p?.dispose(), [viewModelInstance, path]);

    // Always start undefined — the listener delivers the current value as its first emission.
    // (iOS experimental: via valueStream; iOS/Android legacy: emitted synchronously on subscribe)
    // This ensures consumers handle the loading state correctly on all backends.
    const [value, setValue] = (0, _react.useState)(undefined);
    const [error, setError] = (0, _react.useState)(null);

    // Clear error when path or instance changes
    (0, _react.useEffect)(() => {
      setError(null);
    }, [path, viewModelInstance]);

    // Set error if property is not found
    (0, _react.useEffect)(() => {
      if (viewModelInstance && !property) {
        setError(new Error(`Property "${path}" not found in the ViewModel instance`));
      }
    }, [viewModelInstance, property, path]);

    // Add listener for changes to the property
    (0, _react.useEffect)(() => {
      if (!property) return;

      // Deliver the current value immediately so the hook transitions from
      // undefined → value without waiting for a property change.
      // (Legacy addListener does NOT emit on subscribe — only on changes.
      //  Experimental valueStream emits the current value as its first element.)
      setValue(property.value);
      const removeListener = property.addListener(newValue => {
        setValue(newValue);
      });
      return () => {
        try {
          removeListener();
        } catch {
          // Property may already be disposed by useDisposableMemo (deps change).
          // Native dispose() handles listener cleanup, so this is safe to ignore.
        }
      };
    }, [property]);

    // Set the value of the property (no-op if property isn't available yet).
    // Uses tracked `value` from state for updater functions — avoids a synchronous
    // property.value read and is consistent with how React state works.
    const setPropertyValue = (0, _react.useCallback)(valueOrUpdater => {
      if (!property) {
        return;
      } else {
        const newValue_0 = typeof valueOrUpdater === 'function' ? valueOrUpdater(value) : valueOrUpdater;
        property.value = newValue_0;
      }
    }, [property, value]);
    return [value, setPropertyValue, error, property];
  }

  /**
   * This interface extends the ViewModelProperty and ObservableProperty interfaces.
   * It adds the addListener and value as known properties.
   *
   * @template T - The primitive type of the property value (number, boolean, string)
   */
},3681,[12,3682]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useDisposableMemo = useDisposableMemo;
  var _react = require(_dependencyMap[0]);
  const UNINITIALIZED = Symbol('UNINITIALIZED');
  function depsEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false;
    }
    return true;
  }

  /**
   * Like `useMemo`, but with a cleanup callback for disposable native resources.
   *
   * - Value is created synchronously during render (available on first render).
   * - When deps change, the old value is cleaned up during render and a new one
   *   is created.
   * - On unmount in production: cleaned up synchronously in effect cleanup.
   * - On unmount in development: cleanup is deferred via `setTimeout(0)` so that
   *   fast refresh and Strict Mode can cancel it when effects re-run.
   *
   * Replaces the common `useMemo` + dispose-in-`useEffect`-cleanup pattern that
   * breaks on fast refresh (HMR re-runs all effect cleanups, disposing the native
   * object, but `useMemo` returns the same dead reference):
   *
   * ```tsx
   * // BEFORE — breaks on fast refresh
   * const property = useMemo(() => instance?.getProperty(path), [instance, path]);
   * useEffect(() => {
   *   const unsub = property?.addListener(setValue);
   *   return () => { unsub?.(); property?.dispose(); };
   * }, [property]);
   *
   * // AFTER
   * const property = useDisposableMemo(
   *   () => instance?.getProperty(path),
   *   (p) => p?.dispose(),
   *   [instance, path]
   * );
   * useEffect(() => {
   *   const unsub = property?.addListener(setValue);
   *   return () => unsub?.();  // only unsubscribe, no dispose
   * }, [property]);
   * ```
   */
  function useDisposableMemo(factory, cleanup, deps, liveRef) {
    const ref = (0, _react.useRef)({
      value: undefined,
      deps: UNINITIALIZED,
      pendingDisposal: null
    });
    const cleanupRef = (0, _react.useRef)(cleanup);
    cleanupRef.current = cleanup;
    const liveRefRef = (0, _react.useRef)(liveRef);
    liveRefRef.current = liveRef;
    if (ref.current.deps === UNINITIALIZED || !depsEqual(ref.current.deps, deps)) {
      if (ref.current.deps !== UNINITIALIZED) {
        if (liveRefRef.current) liveRefRef.current.current = undefined;
        try {
          cleanupRef.current(ref.current.value);
        } catch {
          // Swallow cleanup errors — the old value is being replaced regardless.
        }
      }
      ref.current = {
        value: factory(),
        deps,
        pendingDisposal: null
      };
      if (liveRefRef.current) liveRefRef.current.current = ref.current.value;
    }
    (0, _react.useEffect)(() => {
      return () => {
        {
          if (liveRefRef.current) liveRefRef.current.current = undefined;
          try {
            cleanupRef.current(ref.current.value);
          } catch {
            // Swallow — object may already be in a bad state.
          }
        }
      };
    }, []);
    return ref.current.value;
  }
},3682,[12]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useRiveString = useRiveString;
  var _reactCompilerRuntime = require(_dependencyMap[0]);
  var _useRivePropertyJs = require(_dependencyMap[1]);
  const getStringProperty = (vmi, p) => vmi.stringProperty(p);

  /**
   * Hook for interacting with string ViewModel instance properties.
   *
   * @param path - The path to the string property
   * @param viewModelInstance - The ViewModelInstance containing the string property to operate on
   * @returns An object with the number value, a setter function, and an error if the property is not found
   */
  function useRiveString(path, viewModelInstance) {
    const $ = (0, _reactCompilerRuntime.c)(4);
    const [value, setValue, error] = (0, _useRivePropertyJs.useRiveProperty)(viewModelInstance, path, getStringProperty);
    let t0;
    if ($[0] !== error || $[1] !== setValue || $[2] !== value) {
      t0 = {
        value,
        setValue,
        error
      };
      $[0] = error;
      $[1] = setValue;
      $[2] = value;
      $[3] = t0;
    } else {
      t0 = $[3];
    }
    return t0;
  }
},3683,[3667,3681]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useRiveBoolean = useRiveBoolean;
  var _reactCompilerRuntime = require(_dependencyMap[0]);
  var _useRivePropertyJs = require(_dependencyMap[1]);
  const getBooleanProperty = (vmi, p) => vmi.booleanProperty(p);

  /**
   * Hook for interacting with boolean ViewModel instance properties.
   *
   * @param path - The path to the boolean property
   * @param viewModelInstance - The ViewModelInstance containing the boolean property to operate on
   * @returns An object with the boolean value, a setter function, and an error if the property is not found
   */
  function useRiveBoolean(path, viewModelInstance) {
    const $ = (0, _reactCompilerRuntime.c)(4);
    const [value, setValue, error] = (0, _useRivePropertyJs.useRiveProperty)(viewModelInstance, path, getBooleanProperty);
    let t0;
    if ($[0] !== error || $[1] !== setValue || $[2] !== value) {
      t0 = {
        value,
        setValue,
        error
      };
      $[0] = error;
      $[1] = setValue;
      $[2] = value;
      $[3] = t0;
    } else {
      t0 = $[3];
    }
    return t0;
  }
},3684,[3667,3681]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useRiveEnum = useRiveEnum;
  var _reactCompilerRuntime = require(_dependencyMap[0]);
  var _useRivePropertyJs = require(_dependencyMap[1]);
  const getEnumProperty = (vmi, p) => vmi.enumProperty(p);

  /**
   * Hook for interacting with enum ViewModel instance properties.
   *
   * @param path - The path to the enum property
   * @param viewModelInstance - The ViewModelInstance containing the enum property to operate on
   * @returns An object with the enum value, a setter function, and an error if the property is not found
   */
  function useRiveEnum(path, viewModelInstance) {
    const $ = (0, _reactCompilerRuntime.c)(4);
    const [value, setValue, error] = (0, _useRivePropertyJs.useRiveProperty)(viewModelInstance, path, getEnumProperty);
    let t0;
    if ($[0] !== error || $[1] !== setValue || $[2] !== value) {
      t0 = {
        value,
        setValue,
        error
      };
      $[0] = error;
      $[1] = setValue;
      $[2] = value;
      $[3] = t0;
    } else {
      t0 = $[3];
    }
    return t0;
  }
},3685,[3667,3681]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useRiveColor = useRiveColor;
  var _reactCompilerRuntime = require(_dependencyMap[0]);
  require(_dependencyMap[1]);
  var _useRivePropertyJs = require(_dependencyMap[2]);
  var _coreRiveColorJs = require(_dependencyMap[3]);
  const getColorProperty = (vmi, p) => vmi.colorProperty(p);
  /**
   * Hook for interacting with color ViewModel instance properties.
   *
   * @param path - The path to the color property
   * @param viewModelInstance - The ViewModelInstance containing the color property to operate on
   * @returns An object with the color value as RGBA, a setter function that accepts either RGBA or hex string, and an error if the property is not found
   */
  function useRiveColor(path, viewModelInstance) {
    const $ = (0, _reactCompilerRuntime.c)(8);
    const [rawValue, setRawValue, error] = (0, _useRivePropertyJs.useRiveProperty)(viewModelInstance, path, getColorProperty);
    let t0;
    if ($[0] !== rawValue) {
      t0 = rawValue !== undefined ? _coreRiveColorJs.RiveColor.fromInt(rawValue) : undefined;
      $[0] = rawValue;
      $[1] = t0;
    } else {
      t0 = $[1];
    }
    const value = t0;
    let t1;
    if ($[2] !== setRawValue) {
      t1 = newValue => {
        const color = typeof newValue === "string" ? _coreRiveColorJs.RiveColor.fromHexString(newValue) : newValue;
        setRawValue(color.toInt());
      };
      $[2] = setRawValue;
      $[3] = t1;
    } else {
      t1 = $[3];
    }
    const setValue = t1;
    let t2;
    if ($[4] !== error || $[5] !== setValue || $[6] !== value) {
      t2 = {
        value,
        setValue,
        error
      };
      $[4] = error;
      $[5] = setValue;
      $[6] = value;
      $[7] = t2;
    } else {
      t2 = $[7];
    }
    return t2;
  }
},3686,[3667,12,3681,3676]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useRiveTrigger = useRiveTrigger;
  var _react = require(_dependencyMap[0]);
  var _useDisposableMemoJs = require(_dependencyMap[1]);
  /**
   * Hook for interacting with trigger ViewModel instance properties.
   *
   * Manages its own property lifecycle (separate from useRiveProperty) because
   * triggers take a user callback whose identity may change across renders.
   * Storing the callback in a ref avoids coupling it to native property disposal.
   *
   * @param path - The path to the trigger property
   * @param viewModelInstance - The ViewModelInstance containing the trigger property
   * @param params - Optional parameters including onTrigger callback
   * @returns A trigger function and any error
   */
  function useRiveTrigger(path, viewModelInstance, params) {
    const {
      onTrigger
    } = params ?? {};
    const liveRef = (0, _react.useRef)(undefined);
    const wasEverLive = (0, _react.useRef)(false);
    const onTriggerRef = (0, _react.useRef)(onTrigger);
    onTriggerRef.current = onTrigger;
    const property = (0, _useDisposableMemoJs.useDisposableMemo)(() => {
      if (!viewModelInstance) return undefined;
      return viewModelInstance.triggerProperty(path);
    }, p => p?.dispose(), [viewModelInstance, path], liveRef);
    if (liveRef.current) {
      wasEverLive.current = true;
    }
    const [error, setError] = (0, _react.useState)(null);
    (0, _react.useEffect)(() => {
      setError(null);
    }, [path, viewModelInstance]);
    (0, _react.useEffect)(() => {
      if (viewModelInstance && !property) {
        setError(new Error(`Property "${path}" not found in the ViewModel instance`));
      }
    }, [viewModelInstance, property, path]);
    (0, _react.useEffect)(() => {
      if (!property) return;
      const removeListener = property.addListener(() => {
        onTriggerRef.current?.();
      });
      return () => {
        try {
          removeListener();
        } catch {
          // Property may already be disposed by useDisposableMemo (deps change).
        }
      };
    }, [property]);
    const trigger = (0, _react.useCallback)(() => {
      if (!liveRef.current) {
        if (wasEverLive.current) {
          console.warn(`useRiveTrigger: trigger('${path}') called after dispose. ` + 'The property has been cleaned up — this is likely a stale closure ' + 'from an async callback that fired after unmount.');
        } else {
          console.warn(`useRiveTrigger: trigger('${path}') called but the property is not available yet. ` + 'The viewModelInstance may still be loading.');
        }
        return;
      }
      liveRef.current.trigger();
    }, [path]);
    return {
      trigger,
      error
    };
  }
},3687,[12,3682]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useRiveList = useRiveList;
  var _reactCompilerRuntime = require(_dependencyMap[0]);
  var _react = require(_dependencyMap[1]);
  var _useDisposableMemoJs = require(_dependencyMap[2]);
  // TODO: migrate length/getInstanceAt to async equivalents
  /* eslint-disable @typescript-eslint/no-deprecated */

  /**
   * Hook for interacting with list ViewModel instance properties.
   *
   * @param path - The path to the list property
   * @param viewModelInstance - The ViewModelInstance containing the list property
   * @returns An object with list length, manipulation methods, and error state
   */
  function useRiveList(path, viewModelInstance) {
    const $ = (0, _reactCompilerRuntime.c)(39);
    const [error, setError] = (0, _react.useState)(null);
    const [revision, setRevision] = (0, _react.useState)(0);
    let t0;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
      t0 = () => {
        setError(null);
      };
      $[0] = t0;
    } else {
      t0 = $[0];
    }
    let t1;
    if ($[1] !== path || $[2] !== viewModelInstance) {
      t1 = [path, viewModelInstance];
      $[1] = path;
      $[2] = viewModelInstance;
      $[3] = t1;
    } else {
      t1 = $[3];
    }
    (0, _react.useEffect)(t0, t1);
    let t2;
    if ($[4] !== path || $[5] !== viewModelInstance) {
      t2 = () => {
        if (!viewModelInstance) {
          return;
        }
        return viewModelInstance.listProperty(path);
      };
      $[4] = path;
      $[5] = viewModelInstance;
      $[6] = t2;
    } else {
      t2 = $[6];
    }
    let t3;
    if ($[7] !== path || $[8] !== viewModelInstance) {
      t3 = [viewModelInstance, path];
      $[7] = path;
      $[8] = viewModelInstance;
      $[9] = t3;
    } else {
      t3 = $[9];
    }
    const property = (0, _useDisposableMemoJs.useDisposableMemo)(t2, _temp, t3);
    let t4;
    let t5;
    if ($[10] !== path || $[11] !== property || $[12] !== viewModelInstance) {
      t4 = () => {
        if (viewModelInstance && !property) {
          setError(new Error(`List property "${path}" not found in the ViewModel instance`));
        }
      };
      t5 = [viewModelInstance, property, path];
      $[10] = path;
      $[11] = property;
      $[12] = viewModelInstance;
      $[13] = t4;
      $[14] = t5;
    } else {
      t4 = $[13];
      t5 = $[14];
    }
    (0, _react.useEffect)(t4, t5);
    let t6;
    let t7;
    if ($[15] !== property) {
      t6 = () => {
        if (!property) {
          return;
        }
        const removeListener = property.addListener(() => {
          setRevision(_temp2);
        });
        return () => {
          try {
            removeListener();
            property.removeListeners();
          } catch {}
        };
      };
      t7 = [property];
      $[15] = property;
      $[16] = t6;
      $[17] = t7;
    } else {
      t6 = $[16];
      t7 = $[17];
    }
    (0, _react.useEffect)(t6, t7);
    const length = property?.length ?? 0;
    let t8;
    if ($[18] !== property) {
      t8 = index => property?.getInstanceAt(index);
      $[18] = property;
      $[19] = t8;
    } else {
      t8 = $[19];
    }
    const getInstanceAt = t8;
    let t9;
    if ($[20] !== property) {
      t9 = instance => {
        property?.addInstance(instance);
      };
      $[20] = property;
      $[21] = t9;
    } else {
      t9 = $[21];
    }
    const addInstance = t9;
    let t10;
    if ($[22] !== property) {
      t10 = (instance_0, index_0) => property?.addInstanceAt(instance_0, index_0) ?? false;
      $[22] = property;
      $[23] = t10;
    } else {
      t10 = $[23];
    }
    const addInstanceAt = t10;
    let t11;
    if ($[24] !== property) {
      t11 = instance_1 => {
        property?.removeInstance(instance_1);
      };
      $[24] = property;
      $[25] = t11;
    } else {
      t11 = $[25];
    }
    const removeInstance = t11;
    let t12;
    if ($[26] !== property) {
      t12 = index_1 => {
        property?.removeInstanceAt(index_1);
      };
      $[26] = property;
      $[27] = t12;
    } else {
      t12 = $[27];
    }
    const removeInstanceAt = t12;
    let t13;
    if ($[28] !== property) {
      t13 = (index1, index2) => property?.swap(index1, index2) ?? false;
      $[28] = property;
      $[29] = t13;
    } else {
      t13 = $[29];
    }
    const swap = t13;
    let t14;
    if ($[30] !== addInstance || $[31] !== addInstanceAt || $[32] !== error || $[33] !== getInstanceAt || $[34] !== length || $[35] !== removeInstance || $[36] !== removeInstanceAt || $[37] !== swap) {
      t14 = {
        length,
        getInstanceAt,
        addInstance,
        addInstanceAt,
        removeInstance,
        removeInstanceAt,
        swap,
        error
      };
      $[30] = addInstance;
      $[31] = addInstanceAt;
      $[32] = error;
      $[33] = getInstanceAt;
      $[34] = length;
      $[35] = removeInstance;
      $[36] = removeInstanceAt;
      $[37] = swap;
      $[38] = t14;
    } else {
      t14 = $[38];
    }
    return t14;
  }
  function _temp2(r) {
    return r + 1;
  }
  function _temp(p) {
    return p?.dispose();
  }
},3688,[3667,12,3682]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  // TODO: migrate createInstance/createInstanceByName/etc to async equivalents
  /* eslint-disable @typescript-eslint/no-deprecated */
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useViewModelInstance = useViewModelInstance;
  var _react = require(_dependencyMap[0]);
  var _coreCallDisposeJs = require(_dependencyMap[1]);
  var _specsArtboardByJs = require(_dependencyMap[2]);
  var _useDisposableMemoJs = require(_dependencyMap[3]);
  /**
   * Use the ViewModel assigned to the default artboard.
   */
  /**
   * Use the ViewModel assigned to a specific artboard.
   */
  /**
   * Use a ViewModel by name (file-wide lookup).
   * ViewModels are defined at the file level, not per-artboard.
   */
  function isRiveViewRef(source) {
    return source != null && 'getViewModelInstance' in source;
  }
  function isRiveFile(source) {
    return source != null && 'defaultArtboardViewModel' in source;
  }
  function createInstance(source, instanceName, artboardName, viewModelName, useNew) {
    if (!source) {
      return {
        instance: undefined,
        needsDispose: false
      };
    }
    if (isRiveViewRef(source)) {
      const vmi = source.getViewModelInstance();
      return {
        instance: vmi ?? null,
        needsDispose: false
      };
    }
    if (isRiveFile(source)) {
      let viewModel;
      if (viewModelName) {
        viewModel = source.viewModelByName(viewModelName);
        if (!viewModel) {
          return {
            instance: null,
            needsDispose: false,
            error: `ViewModel '${viewModelName}' not found`
          };
        }
      } else {
        viewModel = source.defaultArtboardViewModel(artboardName ? (0, _specsArtboardByJs.ArtboardByName)(artboardName) : undefined);
        if (!viewModel) {
          if (artboardName) {
            return {
              instance: null,
              needsDispose: false,
              error: `Artboard '${artboardName}' not found or has no ViewModel`
            };
          }
          return {
            instance: null,
            needsDispose: false
          };
        }
      }
      const vmi = instanceName ? viewModel.createInstanceByName(instanceName) : viewModel.createDefaultInstance();
      if (!vmi && instanceName) {
        return {
          instance: null,
          needsDispose: false,
          error: `ViewModel instance '${instanceName}' not found`
        };
      }
      return {
        instance: vmi ?? null,
        needsDispose: true
      };
    }

    // ViewModel source
    let vmi;
    if (instanceName) {
      vmi = source.createInstanceByName(instanceName);
      if (!vmi) {
        return {
          instance: null,
          needsDispose: false,
          error: `ViewModel instance '${instanceName}' not found`
        };
      }
    } else if (useNew) {
      vmi = source.createInstance();
    } else {
      vmi = source.createDefaultInstance();
    }
    return {
      instance: vmi ?? null,
      needsDispose: true
    };
  }

  /**
   * Hook for getting a ViewModelInstance from a RiveFile, ViewModel, or RiveViewRef.
   *
   * @param source - The RiveFile, ViewModel, or RiveViewRef to get an instance from
   * @param params - Configuration for which instance to retrieve
   * @returns An object with `instance` and `error` (discriminated union)
   *
   * @example
   * ```tsx
   * // From RiveFile (get default instance)
   * const { riveFile } = useRiveFile(require('./animation.riv'));
   * const { instance } = useViewModelInstance(riveFile);
   * ```
   *
   * @example
   * ```tsx
   * // From RiveFile with specific instance name
   * const { riveFile } = useRiveFile(require('./animation.riv'));
   * const { instance } = useViewModelInstance(riveFile, { instanceName: 'PersonInstance' });
   * ```
   *
   * @example
   * ```tsx
   * // From RiveFile with specific ViewModel name
   * const { riveFile } = useRiveFile(require('./animation.riv'));
   * const { instance } = useViewModelInstance(riveFile, { viewModelName: 'Settings' });
   * ```
   *
   * @example
   * ```tsx
   * // From RiveFile with specific artboard
   * const { riveFile } = useRiveFile(require('./animation.riv'));
   * const { instance } = useViewModelInstance(riveFile, { artboardName: 'MainArtboard' });
   * ```
   *
   * @example
   * ```tsx
   * // From RiveViewRef (get auto-bound instance)
   * const { riveViewRef, setHybridRef } = useRive();
   * const { instance } = useViewModelInstance(riveViewRef);
   * ```
   *
   * @example
   * ```tsx
   * // From ViewModel
   * const viewModel = file.viewModelByName('main');
   * const { instance } = useViewModelInstance(viewModel);
   * ```
   *
   * @example
   * ```tsx
   * // Create a new blank instance from ViewModel
   * const viewModel = file.viewModelByName('TodoItem');
   * const { instance } = useViewModelInstance(viewModel, { useNew: true });
   * ```
   *
   * @example
   * ```tsx
   * // With required: true (throws if null, use with Error Boundary)
   * const { instance } = useViewModelInstance(riveFile, { required: true });
   * // instance is guaranteed to be non-null here
   * ```
   *
   * @example
   * ```tsx
   * // With onInit to set initial values synchronously
   * const { instance } = useViewModelInstance(riveFile, {
   *   onInit: (vmi) => {
   *     vmi.numberProperty('count').set(initialCount);
   *     vmi.stringProperty('name').set(userName);
   *   }
   * });
   * ```
   *
   * @example
   * ```tsx
   * // Error handling
   * const { instance, error } = useViewModelInstance(riveFile, { viewModelName: 'Missing' });
   * if (error) console.error(error.message);
   * ```
   */
  // RiveFile overloads

  // ViewModel overloads

  // RiveViewRef overloads

  // Implementation
  function useViewModelInstance(source, params) {
    const fileInstanceName = params?.instanceName;
    const viewModelInstanceName = params?.name;
    const instanceName = fileInstanceName ?? viewModelInstanceName;
    const artboardName = params?.artboardName;
    const viewModelName = params?.viewModelName;
    const useNew = params?.useNew ?? false;
    const required = params?.required ?? false;
    const onInit = params?.onInit;
    const onInitRef = (0, _react.useRef)(onInit);
    onInitRef.current = onInit;
    const result = (0, _useDisposableMemoJs.useDisposableMemo)(() => {
      const created = createInstance(source, instanceName, artboardName, viewModelName, useNew);
      if (created.instance && onInitRef.current) {
        onInitRef.current(created.instance);
      }
      return created;
    }, r => {
      if (r.needsDispose && r.instance) {
        (0, _coreCallDisposeJs.callDispose)(r.instance);
      }
    }, [source, instanceName, artboardName, viewModelName, useNew]);
    const error = (0, _react.useMemo)(() => result.error ? new Error(result.error) : null, [result.error]);
    if (required && result.instance === null) {
      throw new Error(result.error ? `useViewModelInstance: ${result.error}` : "useViewModelInstance: Failed to get ViewModelInstance. Ensure the source has a valid ViewModel and instance available.");
    }
    if (result.instance) {
      return {
        instance: result.instance,
        error: null
      };
    }
    if (result.instance === undefined) {
      return {
        instance: undefined,
        error: null
      };
    }
    return {
      instance: null,
      error
    };
  }
},3689,[12,3670,3678,3682]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  exports.useRiveFile = useRiveFile;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsImage = require(_dependencyMap[1]);
  var Image = _interopDefault(_reactNativeWebDistExportsImage);
  var _coreRiveFileJs = require(_dependencyMap[2]);
  var _coreCallDisposeJs = require(_dependencyMap[3]);
  function isUriInput(input) {
    return input != null && typeof input === 'object' && 'uri' in input;
  }
  function isRiveImage(value) {
    return value !== null && typeof value === 'object' && '__type' in value && value.__type === 'HybridObject<RiveImage>';
  }
  function parsePossibleSources(asset) {
    if (isRiveImage(asset)) {
      return {
        image: asset
      };
    }
    const source = asset.source;
    if (typeof source === 'number') {
      const resolvedAsset = Image.default.resolveAssetSource(source);
      if (resolvedAsset && resolvedAsset.uri) {
        return {
          sourceAssetId: resolvedAsset.uri
        };
      } else {
        throw new Error('Invalid asset source provided.');
      }
    }
    const uri = source.uri;
    if (typeof source === 'object' && uri) {
      return {
        sourceUrl: uri
      };
    }
    const fileName = source.fileName;
    const path = source.path;
    if (typeof source === 'object' && fileName) {
      const result = {
        sourceAsset: fileName
      };
      if (path) {
        result.path = path;
      }
      return result;
    }
    throw new Error('Invalid source provided.');
  }
  function transformFilesHandledMapping(mapping) {
    const transformedMapping = {};
    if (mapping === undefined) {
      return undefined;
    }
    Object.entries(mapping).forEach(([key, asset]) => {
      transformedMapping[key] = parsePossibleSources(asset);
    });
    return transformedMapping;
  }
  function useRiveFile(input, options = {}) {
    const [result, setResult] = (0, _react.useState)({
      riveFile: undefined,
      isLoading: true,
      error: null
    });
    const referencedAssets = (0, _react.useMemo)(() => transformFilesHandledMapping(options.referencedAssets), [options.referencedAssets]);
    const initialReferencedAssets = (0, _react.useRef)(referencedAssets);
    const inputKind = isUriInput(input) ? 'uri' : 'primitive';
    const inputValue = isUriInput(input) ? input.uri : input;
    (0, _react.useEffect)(() => {
      let currentFile = null;
      const loadRiveFile = async () => {
        try {
          const currentInput = inputKind === 'uri' ? {
            uri: inputValue
          } : inputValue;
          if (currentInput == null) {
            setResult({
              riveFile: null,
              isLoading: false,
              error: new Error('No Rive file input provided.')
            });
            return;
          }
          if (typeof currentInput === 'string') {
            if (currentInput.startsWith('http://') || currentInput.startsWith('https://')) {
              currentFile = await _coreRiveFileJs.RiveFileFactory.fromURL(currentInput, initialReferencedAssets.current);
            } else {
              currentFile = await _coreRiveFileJs.RiveFileFactory.fromResource(currentInput, initialReferencedAssets.current);
            }
          } else if (typeof currentInput === 'number' || 'uri' in currentInput) {
            currentFile = await _coreRiveFileJs.RiveFileFactory.fromSource(currentInput, initialReferencedAssets.current);
          } else if (currentInput instanceof ArrayBuffer) {
            currentFile = await _coreRiveFileJs.RiveFileFactory.fromBytes(currentInput, initialReferencedAssets.current);
          }
          setResult({
            riveFile: currentFile,
            isLoading: false,
            error: null
          });
        } catch (err) {
          console.error(err);
          setResult({
            riveFile: null,
            isLoading: false,
            error: err instanceof Error ? err : new Error('Failed to load Rive file')
          });
        }
      };
      loadRiveFile();
      return () => {
        if (currentFile) {
          (0, _coreCallDisposeJs.callDispose)(currentFile);
        }
      };
    }, [inputKind, inputValue]);
    const {
      riveFile
    } = result;
    (0, _react.useEffect)(() => {
      if (initialReferencedAssets.current !== referencedAssets) {
        if (riveFile && referencedAssets) {
          riveFile.updateReferencedAssets({
            data: referencedAssets
          });
          initialReferencedAssets.current = referencedAssets;
        }
      }
    }, [referencedAssets, riveFile]);
    return {
      riveFile: result.riveFile,
      isLoading: result.isLoading,
      error: result.error
    };
  }
},3690,[12,469,3673,3670]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "RiveRuntime", {
    enumerable: true,
    get: function () {
      return RiveRuntime;
    }
  });
  var _reactNativeNitroModules = require(_dependencyMap[0]);
  const RiveRuntimeInternal = _reactNativeNitroModules.NitroModules.createHybridObject('RiveRuntime');
  let RiveRuntime;
  (function (_RiveRuntime) {
    async function initialize() {
      await RiveRuntimeInternal.initialize();
      if (!RiveRuntimeInternal.isInitialized) {
        throw new Error(`Rive initialization failed: ${RiveRuntimeInternal.initError ?? 'Unknown error'}`);
      }
    }
    _RiveRuntime.initialize = initialize;
    function getStatus() {
      return {
        isInitialized: RiveRuntimeInternal.isInitialized,
        error: RiveRuntimeInternal.initError ?? undefined
      };
    }
    _RiveRuntime.getStatus = getStatus;
  })(RiveRuntime || (RiveRuntime = {}));
},3691,[3590]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  module.exports = "/assets/assets/mascot/vex_mascot.023bcb15af90ae8483e92128408853e6.riv";
},3692,[]);
//# sourceMappingURL=/_expo/static/js/web/RiveMascotRenderer-bf1e9e7655992dfc3369aafce80d72ad.js.map
//# debugId=a8e7b3a6-161d-45f3-967a-374dea24de3f