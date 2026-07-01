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
  Object.defineProperty(exports, "StreakFuneralScreen", {
    enumerable: true,
    get: function () {
      return StreakFuneralScreenWithBoundary;
    }
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return StreakFuneralScreen;
    }
  });
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[0]);
  var _react = require(_dependencyMap[1]);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[2]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _reactNativeReanimated = require(_dependencyMap[3]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _reactNavigationNative = require(_dependencyMap[4]);
  var _sentryReactNative = require(_dependencyMap[5]);
  var Sentry = _interopNamespace(_sentryReactNative);
  var _componentsPrimitives = require(_dependencyMap[6]);
  var _componentsPrimitivesButton = require(_dependencyMap[7]);
  var _store = require(_dependencyMap[8]);
  var _streaksStreakService = require(_dependencyMap[9]);
  var _themeThemeContext = require(_dependencyMap[10]);
  var _sharedUiComponentsToast = require(_dependencyMap[11]);
  var _StreakFuneralFlame = require(_dependencyMap[12]);
  var _componentsPrimitivesText = require(_dependencyMap[13]);
  var _reactJsxRuntime = require(_dependencyMap[14]);
  const StreakFuneralScreen = () => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      show: showToast
    } = (0, _sharedUiComponentsToast.useToast)();
    const {
      user
    } = (0, _store.useAuthStore)();
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const route = (0, _reactNavigationNative.useRoute)();
    const {
      previousStreak,
      diedAt
    } = route.params;
    const hoursSinceDeath = Math.floor((Date.now() - diedAt) / 3600000);
    const daysSinceDeath = Math.floor(hoursSinceDeath / 24);
    const completeFuneral = (0, _react.useCallback)(() => {
      if (user?.id) {
        (0, _streaksStreakService.getStreakService)(user.id).markFuneralShown();
      }
      navigation.goBack();
    }, [navigation, user?.id]);
    const handleStartFresh = (0, _react.useCallback)(() => {
      Sentry.addBreadcrumb({
        category: 'streaks',
        message: 'User acknowledged streak pause and started fresh',
        level: 'info',
        data: {
          previousStreak,
          diedAt
        }
      });
      showToast({
        type: 'success',
        title: 'New rhythm started!',
        message: 'Every day is a clean start.',
        duration: 3000
      });
      completeFuneral();
    }, [completeFuneral, previousStreak, diedAt, showToast]);
    const handleReminisce = (0, _react.useCallback)(() => {
      Sentry.addBreadcrumb({
        category: 'streaks',
        message: 'User chose to view streak history',
        level: 'info'
      });
      completeFuneral();
    }, [completeFuneral]);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Box, {
      flex: 1,
      bg: "background.primary",
      px: "lg",
      pt: "xl",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(ScrollView.default, {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: {
          flexGrow: 1,
          justifyContent: 'center'
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeIn.delay(200),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Box, {
            alignItems: "center",
            mb: "2xl",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_StreakFuneralFlame.StreakFuneralFlame, {})
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeInUp.delay(400),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Box, {
            alignItems: "center",
            mb: "xl",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Text, {
              variant: "h2",
              color: "text.primary",
              textAlign: "center",
              mb: "md",
              children: [previousStreak, "-day rhythm paused"]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
              variant: "body",
              color: "text.secondary",
              textAlign: "center",
              children: daysSinceDeath > 0 ? `${daysSinceDeath} day${daysSinceDeath !== 1 ? 's' : ''} ago` : `${hoursSinceDeath} hour${hoursSinceDeath !== 1 ? 's' : ''} ago`
            })]
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeInUp.delay(500),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Box, {
            alignItems: "center",
            mb: "xl",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Text, {
              variant: "body",
              color: "text.secondary",
              textAlign: "center",
              children: [previousStreak, " days of focus. Every day built your rhythm, and that rhythm starts again today."]
            })
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeInUp.delay(600),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Box, {
            bg: "background.secondary",
            p: "xl",
            borderRadius: "lg",
            alignItems: "center",
            mb: "2xl",
            style: {
              borderWidth: 1,
              borderColor: theme.colors.border.light
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
              variant: "caption",
              color: "text.secondary",
              mb: "sm",
              children: "YOUR RHYTHM"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
              variant: "hero",
              color: "primary.500",
              style: {
                fontSize: 72,
                fontWeight: '800'
              },
              children: previousStreak
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
              variant: "h4",
              color: "text.primary",
              children: previousStreak === 1 ? 'day' : 'days'
            })]
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeInUp.delay(800),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Box, {
            mb: "2xl",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
              variant: "body",
              color: "text.secondary",
              textAlign: "center",
              mb: "md",
              children: "\"Every comeback is proof of real consistency."
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
              variant: "body",
              color: "text.secondary",
              textAlign: "center",
              children: "Starting fresh is not failure. It is commitment.\""
            })]
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeInUp.delay(1000),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Box, {
            gap: "md",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
              variant: "primary",
              size: "lg",
              fullWidth: true,
              onPress: handleStartFresh,
              accessibilityLabel: "Start fresh with a new rhythm",
              accessibilityRole: "button",
              accessibilityHint: "Begins a new rhythm with your next session",
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                children: "Start fresh \u2014 new rhythm"
              })
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
              variant: "ghost",
              size: "sm",
              fullWidth: true,
              onPress: handleReminisce,
              accessibilityLabel: "View focus history",
              accessibilityRole: "button",
              accessibilityHint: "Double tap to activate",
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                children: "View Focus History"
              })
            })]
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Box, {
          height: 40
        })]
      })
    });
  };
  const StreakFuneralScreenWithBoundary = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(StreakFuneralScreen, 'StreakFuneral');
},3328,[2166,12,171,226,1359,834,3048,1680,1705,2061,1463,2159,3562,1489,203]);
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
  exports.StreakFuneralFlame = StreakFuneralFlame;
  var _react = require(_dependencyMap[0]);
  var React = _interopDefault(_react);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _sharedUiComponentsEnhancedSkeleton = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  const _worklet_5950155872430_init_data = {
    code: "function StreakFuneralFlameTsx1(){const{flameScale,flameOpacity}=this.__closure;return{transform:[{scale:flameScale.value}],opacity:flameOpacity.value};}"
  };
  function StreakFuneralFlame({
    isPending
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const semantic = theme.colors.semantic;
    const flameScale = (0, _reactNativeReanimated.useSharedValue)(1);
    const flameOpacity = (0, _reactNativeReanimated.useSharedValue)(1);
    React.default.useEffect(() => {
      flameScale.value = (0, _reactNativeReanimated.withSequence)((0, _reactNativeReanimated.withTiming)(0.9, {
        duration: 500
      }), (0, _reactNativeReanimated.withTiming)(0.7, {
        duration: 500
      }), (0, _reactNativeReanimated.withTiming)(0.4, {
        duration: 500
      }), (0, _reactNativeReanimated.withTiming)(0, {
        duration: 500
      }));
      flameOpacity.value = (0, _reactNativeReanimated.withSequence)((0, _reactNativeReanimated.withTiming)(0.8, {
        duration: 500
      }), (0, _reactNativeReanimated.withTiming)(0.6, {
        duration: 500
      }), (0, _reactNativeReanimated.withTiming)(0.3, {
        duration: 500
      }), (0, _reactNativeReanimated.withTiming)(0, {
        duration: 500
      }));
    }, [flameOpacity, flameScale]);
    const animatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function StreakFuneralFlameTsx1Factory({
      _worklet_5950155872430_init_data,
      flameScale,
      flameOpacity
    }) {
      const StreakFuneralFlameTsx1 = () => ({
        transform: [{
          scale: flameScale.value
        }],
        opacity: flameOpacity.value
      });
      StreakFuneralFlameTsx1.__closure = {
        flameScale,
        flameOpacity
      };
      StreakFuneralFlameTsx1.__workletHash = 5950155872430;
      StreakFuneralFlameTsx1.__initData = _worklet_5950155872430_init_data;
      return StreakFuneralFlameTsx1;
    }({
      _worklet_5950155872430_init_data,
      flameScale,
      flameOpacity
    }));
    if (isPending) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsEnhancedSkeleton.SkeletonItem, {
        variant: "circle",
        width: 96,
        height: 96
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      style: animatedStyle,
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: {
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: `${semantic.danger}18`,
          alignItems: 'center',
          justifyContent: 'center'
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          fontSize: 40,
          color: "error.DEFAULT",
          fontWeight: "700",
          children: "V"
        })
      })
    });
  }
},3562,[12,226,80,1489,1463,3563,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "SkeletonItem", {
    enumerable: true,
    get: function () {
      return _SkeletonItem.SkeletonItem;
    }
  });
  Object.defineProperty(exports, "CardSkeleton", {
    enumerable: true,
    get: function () {
      return _skeletonLayouts.CardSkeleton;
    }
  });
  Object.defineProperty(exports, "HeroSkeleton", {
    enumerable: true,
    get: function () {
      return _skeletonLayouts.HeroSkeleton;
    }
  });
  Object.defineProperty(exports, "ListSkeleton", {
    enumerable: true,
    get: function () {
      return _skeletonLayouts.ListSkeleton;
    }
  });
  Object.defineProperty(exports, "StatsSkeleton", {
    enumerable: true,
    get: function () {
      return _skeletonLayouts.StatsSkeleton;
    }
  });
  Object.defineProperty(exports, "TextBlockSkeleton", {
    enumerable: true,
    get: function () {
      return _skeletonLayouts.TextBlockSkeleton;
    }
  });
  Object.defineProperty(exports, "EnhancedSkeleton", {
    enumerable: true,
    get: function () {
      return _skeletonLayouts.EnhancedSkeleton;
    }
  });
  Object.defineProperty(exports, "ScreenLoadingState", {
    enumerable: true,
    get: function () {
      return _skeletonLayouts.ScreenLoadingState;
    }
  });
  var _SkeletonItem = require(_dependencyMap[0]);
  var _skeletonLayouts = require(_dependencyMap[1]);
},3563,[3125,3564]);
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
  Object.defineProperty(exports, "CardSkeleton", {
    enumerable: true,
    get: function () {
      return CardSkeleton;
    }
  });
  Object.defineProperty(exports, "HeroSkeleton", {
    enumerable: true,
    get: function () {
      return HeroSkeleton;
    }
  });
  Object.defineProperty(exports, "ListSkeleton", {
    enumerable: true,
    get: function () {
      return ListSkeleton;
    }
  });
  Object.defineProperty(exports, "StatsSkeleton", {
    enumerable: true,
    get: function () {
      return StatsSkeleton;
    }
  });
  Object.defineProperty(exports, "TextBlockSkeleton", {
    enumerable: true,
    get: function () {
      return TextBlockSkeleton;
    }
  });
  Object.defineProperty(exports, "EnhancedSkeleton", {
    enumerable: true,
    get: function () {
      return EnhancedSkeleton;
    }
  });
  Object.defineProperty(exports, "ScreenLoadingState", {
    enumerable: true,
    get: function () {
      return ScreenLoadingState;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _themeThemeContext = require(_dependencyMap[2]);
  var _SkeletonItem = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  const CardSkeleton = ({
    style
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: [{
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing[4],
        gap: theme.spacing[3],
        borderWidth: 1,
        borderColor: theme.colors.border.light
      }, style],
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          flexDirection: 'row',
          gap: theme.spacing[3],
          alignItems: 'center'
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
          variant: "avatar"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flex: 1,
            gap: theme.spacing[2]
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
            variant: "title",
            width: "60%"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
            variant: "text",
            width: "40%"
          })]
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
        variant: "text",
        width: "90%"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
        variant: "text",
        width: "75%"
      })]
    });
  };
  const HeroSkeleton = ({
    style
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: [{
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius['2xl'],
        padding: theme.spacing[5],
        gap: theme.spacing[4]
      }, style],
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
        variant: "title",
        width: "50%",
        height: 32
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
        variant: "text",
        width: "80%"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          flexDirection: 'row',
          gap: theme.spacing[4],
          marginTop: theme.spacing[2]
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
          variant: "circle",
          width: 80,
          height: 80
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flex: 1,
            justifyContent: 'center',
            gap: theme.spacing[2]
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
            variant: "text",
            width: "60%"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
            variant: "text",
            width: "40%"
          })]
        })]
      })]
    });
  };
  const ListSkeleton = ({
    count = 3,
    style
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      style: [{
        gap: theme.spacing[3]
      }, style],
      children: Array.from({
        length: count
      }).map((_, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(CardSkeleton, {}, index))
    });
  };
  const StatsSkeleton = ({
    style
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      style: [{
        flexDirection: 'row',
        gap: theme.spacing[3]
      }, style],
      children: [1, 2, 3].map(i => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          flex: 1,
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[4],
          gap: theme.spacing[2]
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
          variant: "text",
          width: "80%"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
          variant: "title",
          width: "60%",
          height: 28
        })]
      }, i))
    });
  };
  const TextBlockSkeleton = ({
    lines = 4,
    style
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: [{
        gap: theme.spacing[2]
      }, style],
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
        variant: "title",
        width: "70%"
      }), Array.from({
        length: lines - 1
      }).map((_, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SkeletonItem.SkeletonItem, {
        variant: "text",
        width: index === lines - 2 ? '50%' : '100%'
      }, index))]
    });
  };
  const EnhancedSkeleton = ({
    type,
    count = 3,
    style
  }) => {
    switch (type) {
      case 'card':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(CardSkeleton, {
          style: style
        });
      case 'list':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(ListSkeleton, {
          count: count,
          style: style
        });
      case 'hero':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(HeroSkeleton, {
          style: style
        });
      case 'stats':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(StatsSkeleton, {
          style: style
        });
      case 'text-block':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(TextBlockSkeleton, {
          lines: count,
          style: style
        });
      default:
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(CardSkeleton, {
          style: style
        });
    }
  };
  const ScreenLoadingState = ({
    hero = true,
    stats = true,
    cards = 2,
    style
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: [{
        flex: 1,
        padding: theme.spacing[5],
        gap: theme.spacing[4]
      }, style],
      children: [hero && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(HeroSkeleton, {}), stats && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(StatsSkeleton, {}), cards > 0 && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(ListSkeleton, {
        count: cards
      })]
    });
  };
},3564,[12,80,1463,3125,203]);
//# sourceMappingURL=/_expo/static/js/web/StreakFuneralScreen-392b420f08a5148e4b0e370ac42d662d.js.map
//# debugId=ffb34a40-86bf-4c44-aaab-77afd5082ad1