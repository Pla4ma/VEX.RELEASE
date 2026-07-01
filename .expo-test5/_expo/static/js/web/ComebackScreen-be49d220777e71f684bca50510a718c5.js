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
  Object.defineProperty(exports, "ComebackScreen", {
    enumerable: true,
    get: function () {
      return ComebackScreenWithBoundary;
    }
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return ComebackScreen;
    }
  });
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[0]);
  var _react = require(_dependencyMap[1]);
  var _reactNativeWebDistExportsStyleSheet = require(_dependencyMap[2]);
  var StyleSheet = _interopDefault(_reactNativeWebDistExportsStyleSheet);
  var _reactNavigationNative = require(_dependencyMap[3]);
  var _reactNativeSafeAreaContext = require(_dependencyMap[4]);
  var _componentsPrimitivesBox = require(_dependencyMap[5]);
  var _storeSessionState = require(_dependencyMap[6]);
  var _themeThemeContext = require(_dependencyMap[7]);
  var _ComebackParticles = require(_dependencyMap[8]);
  var _sharedAnalyticsAnalyticsService = require(_dependencyMap[9]);
  var _ComebackCard = require(_dependencyMap[10]);
  var _reactJsxRuntime = require(_dependencyMap[11]);
  const PARTICLE_COUNT = 20;
  function ComebackScreen() {
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const route = (0, _reactNavigationNative.useRoute)();
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const insets = (0, _reactNativeSafeAreaContext.useSafeAreaInsets)();
    const dismissComeback = (0, _storeSessionState.useSessionUIStore)(state => state.dismissComeback);
    const comebackState = route.params.comebackState;
    (0, _react.useEffect)(() => {
      (0, _sharedAnalyticsAnalyticsService.capture)('comeback_offer_viewed', {
        days_absent: comebackState.daysAbsent,
        reward_multiplier: comebackState.rewardMultiplier,
        streak_before: comebackState.streakBefore,
        streak_restore_eligible: comebackState.streakRestoreEligible
      });
    }, [comebackState]);
    const particles = (0, _react.useMemo)(() => Array.from({
      length: PARTICLE_COUNT
    }, (_, index) => ({
      index,
      left: 12 + index * 17 % 320,
      size: 4 + index % 5,
      duration: 5500 + index * 220,
      delay: index * 0.45
    })), []);
    const closePrompt = () => {
      dismissComeback();
      navigation.goBack();
    };
    const startComeback = () => {
      (0, _sharedAnalyticsAnalyticsService.capture)('comeback_offer_accepted', {
        days_absent: comebackState.daysAbsent,
        reward_multiplier: comebackState.rewardMultiplier,
        streak_restore: comebackState.streakRestoreEligible
      });
      dismissComeback();
      navigation.replace('SessionStack', {
        screen: 'SessionSetup',
        params: {
          comebackMultiplier: comebackState.rewardMultiplier,
          comebackMessage: comebackState.message,
          comebackQuest: comebackState.streakRestoreEligible ? {
            streakBefore: comebackState.streakBefore,
            requiredSessions: 3
          } : null
        }
      });
    };
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      style: {
        backgroundColor: theme.colors.background.primary
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        style: Object.assign({}, StyleSheet.default.absoluteFill, {
          backgroundColor: theme.colors.background.primary
        }),
        children: particles.map(particle => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_ComebackParticles.Particle, Object.assign({
          color: theme.colors.primary[300]
        }, particle), particle.index))
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        flex: 1,
        justifyContent: "center",
        px: "lg",
        py: "xl",
        style: {
          paddingTop: insets.top + theme.spacing[6],
          paddingBottom: insets.bottom + theme.spacing[6]
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_ComebackCard.ComebackCard, {
          comebackState: comebackState,
          onStart: startComeback,
          onClose: closePrompt
        })
      })]
    });
  }
  const ComebackScreenWithBoundary = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(ComebackScreen, 'Comeback');
},3329,[2166,12,87,1359,719,1462,2305,1463,3565,1491,3566,203]);
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
  exports.Particle = Particle;
  var _react = require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _sharedUiCreateSheet = require(_dependencyMap[2]);
  var _hooks = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  const _worklet_6851039953850_init_data = {
    code: "function ComebackParticlesTsx1(){const{progress,delay}=this.__closure;return{opacity:0.2+0.5*(1-progress.value),transform:[{translateY:180-progress.value*560},{translateX:Math.sin(progress.value*Math.PI*2+delay)*16}]};}"
  };
  function Particle({
    index,
    left,
    size,
    duration,
    delay,
    color
  }) {
    const {
      isReducedMotion
    } = (0, _hooks.useReducedMotion)();
    const progress = (0, _reactNativeReanimated.useSharedValue)(0);
    (0, _react.useEffect)(() => {
      progress.value = isReducedMotion ? 1 : (0, _reactNativeReanimated.withRepeat)((0, _reactNativeReanimated.withTiming)(1, {
        duration,
        easing: _reactNativeReanimated.Easing.linear
      }), -1, false);
    }, [duration, progress, isReducedMotion]);
    const animatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function ComebackParticlesTsx1Factory({
      _worklet_6851039953850_init_data,
      progress,
      delay
    }) {
      const ComebackParticlesTsx1 = () => ({
        opacity: 0.2 + 0.5 * (1 - progress.value),
        transform: [{
          translateY: 180 - progress.value * 560
        }, {
          translateX: Math.sin(progress.value * Math.PI * 2 + delay) * 16
        }]
      });
      ComebackParticlesTsx1.__closure = {
        progress,
        delay
      };
      ComebackParticlesTsx1.__workletHash = 6851039953850;
      ComebackParticlesTsx1.__initData = _worklet_6851039953850_init_data;
      return ComebackParticlesTsx1;
    }({
      _worklet_6851039953850_init_data,
      progress,
      delay
    }));
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      style: [styles.particle, isReducedMotion ? {
        opacity: 0.2
      } : animatedStyle, {
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        bottom: -40 + index * 8
      }]
    });
  }
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    particle: {
      position: 'absolute'
    }
  });
},3565,[12,226,1678,2109,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.ComebackCard = ComebackCard;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesButton = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function ComebackCard({
    comebackState,
    onStart,
    onClose
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      p: "xl",
      style: {
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius['3xl'],
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        gap: theme.spacing[4]
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "label",
        color: theme.colors.primary[500],
        textTransform: "uppercase",
        children: "Comeback Mode"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "h2",
        color: theme.colors.text.primary,
        children: comebackState.message
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
        variant: "body",
        color: theme.colors.text.secondary,
        children: ["You were away ", comebackState.daysAbsent, " days"]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        p: "md",
        style: {
          backgroundColor: theme.colors.surface.selected,
          borderRadius: theme.borderRadius.xl,
          borderWidth: 1,
          borderColor: theme.colors.primary[200]
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: theme.colors.text.primary,
          children: `⚡ ${comebackState.rewardMultiplier}x XP on your first session back`
        })
      }), comebackState.streakRestoreEligible ? /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        p: "md",
        style: {
          backgroundColor: theme.colors.warning[50],
          borderRadius: theme.borderRadius.xl,
          borderWidth: 1,
          borderColor: theme.colors.warning[500],
          gap: theme.spacing[2]
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: theme.colors.text.primary,
          children: `🔥 Your ${comebackState.streakBefore}-day streak can be restored! Complete 3 sessions this week.`
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          gap: "sm",
          children: [0, 1, 2].map(step => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            flex: 1,
            height: 10,
            style: {
              backgroundColor: step === 0 ? theme.colors.warning[500] : theme.colors.background.tertiary,
              borderRadius: theme.borderRadius.full,
              opacity: step === 0 ? 0.35 : 1
            }
          }, step))
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: theme.colors.text.secondary,
          children: "0 / 3 sessions completed"
        })]
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
        size: "lg",
        onPress: onStart,
        accessibilityLabel: "Start comeback session",
        accessibilityRole: "button",
        accessibilityHint: "Double tap to activate",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          children: "Start My Comeback Session"
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
        variant: "ghost",
        size: "lg",
        onPress: onClose,
        accessibilityLabel: "Remind me later",
        accessibilityRole: "button",
        accessibilityHint: "Double tap to activate",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          children: "Remind Me Later"
        })
      })]
    });
  }
},3566,[12,1462,1680,1489,1463,203]);
//# sourceMappingURL=/_expo/static/js/web/ComebackScreen-be49d220777e71f684bca50510a718c5.js.map
//# debugId=68b0eb1f-f471-45f6-a953-583909d6f3eb