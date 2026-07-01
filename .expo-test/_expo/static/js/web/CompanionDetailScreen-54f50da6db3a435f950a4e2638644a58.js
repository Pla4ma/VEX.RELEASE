__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "CompanionDetailScreen", {
    enumerable: true,
    get: function () {
      return CompanionDetailScreenWithBoundary;
    }
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return CompanionDetailScreen;
    }
  });
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[0]);
  var _react = require(_dependencyMap[1]);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesButton = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _featuresCompanionSessionStorage = require(_dependencyMap[5]);
  var _store = require(_dependencyMap[6]);
  var _themeThemeContext = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  function CompanionDetailScreen() {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      user
    } = (0, _store.useAuthStore)();
    const userId = user?.id ?? '';
    const [loadState, setLoadState] = (0, _react.useState)({
      status: 'loading'
    });
    const mountedRef = (0, _react.useRef)(true);
    (0, _react.useEffect)(() => {
      return () => {
        mountedRef.current = false;
      };
    }, []);
    const load = (0, _react.useCallback)(() => {
      if (!userId) {
        setLoadState({
          status: 'empty'
        });
        return;
      }
      setLoadState({
        status: 'loading'
      });
      (0, _featuresCompanionSessionStorage.loadCompanionState)(userId).then(companion => {
        if (!mountedRef.current) {
          return;
        }
        setLoadState({
          status: 'success',
          companion
        });
      }).catch(caught => {
        if (!mountedRef.current) {
          return;
        }
        setLoadState({
          status: 'error',
          error: caught instanceof Error ? caught : new Error(String(caught))
        });
      });
    }, [userId]);
    (0, _react.useEffect)(() => {
      load();
    }, [load]);
    if (loadState.status === 'loading') {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flex: 1,
        bg: "background.primary",
        p: "lg",
        justifyContent: "center",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          height: 28,
          width: 180,
          borderRadius: "sm",
          bg: theme.colors.background.tertiary
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          mt: 4,
          height: 120,
          borderRadius: "lg",
          bg: theme.colors.background.secondary
        })]
      });
    }
    if (loadState.status === 'empty') {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        flex: 1,
        bg: "background.primary",
        p: "lg",
        justifyContent: "center",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: "text.primary",
          children: "Your companion needs an active profile."
        })
      });
    }
    if (loadState.status === 'error') {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flex: 1,
        bg: "background.primary",
        p: "lg",
        justifyContent: "center",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: theme.colors.error.DEFAULT,
          children: "Companion details did not load."
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: "text.secondary",
          mt: 2,
          children: "VEX kept the session safe. Retry the companion profile."
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "secondary",
          onPress: load,
          style: {
            marginTop: theme.spacing[4]
          },
          accessibilityLabel: "Retry loading companion",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: "Retry"
          })
        })]
      });
    }
    const {
      companion
    } = loadState;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      bg: "background.primary",
      p: "lg",
      justifyContent: "center",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "label",
        color: theme.colors.primary[400],
        children: "Living Companion"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "h2",
        color: "text.primary",
        mt: 2,
        children: companion.currentMood
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        mt: 5,
        p: 4,
        borderRadius: "lg",
        bg: theme.colors.background.secondary,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: "text.primary",
          children: [companion.phase, " - Level ", companion.level]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: "text.secondary",
          mt: 2,
          children: [Math.floor(companion.totalFocusMinutes), " focus minutes together."]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.secondary",
          mt: 2,
          children: ["Element affinity ", companion.elementAffinity, "% - ", companion.element]
        })]
      })]
    });
  }
  const CompanionDetailScreenWithBoundary = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(CompanionDetailScreen, "CompanionDetail");
},3335,[2166,12,1462,1680,1489,3541,1705,1463,203]);