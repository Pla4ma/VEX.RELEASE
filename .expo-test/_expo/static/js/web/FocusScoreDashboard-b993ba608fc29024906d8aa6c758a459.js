__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "FocusScoreDashboard", {
    enumerable: true,
    get: function () {
      return _FocusScoreDashboardMain.FocusScoreDashboard;
    }
  });
  Object.defineProperty(exports, "FocusScoreDashboardSkeleton", {
    enumerable: true,
    get: function () {
      return _FocusScoreDashboardSkeleton.FocusScoreDashboardSkeleton;
    }
  });
  Object.defineProperty(exports, "formatDelta", {
    enumerable: true,
    get: function () {
      return _FocusScoreDashboardHelpers.formatDelta;
    }
  });
  Object.defineProperty(exports, "formatFactorName", {
    enumerable: true,
    get: function () {
      return _FocusScoreDashboardHelpers.formatFactorName;
    }
  });
  Object.defineProperty(exports, "formatHistoryPoint", {
    enumerable: true,
    get: function () {
      return _FocusScoreDashboardHelpers.formatHistoryPoint;
    }
  });
  var _FocusScoreDashboardMain = require(_dependencyMap[0]);
  var _FocusScoreDashboardSkeleton = require(_dependencyMap[1]);
  var _FocusScoreDashboardHelpers = require(_dependencyMap[2]);
},3330,[3567,3568,3569]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "FocusScoreDashboard", {
    enumerable: true,
    get: function () {
      return FocusScoreDashboard;
    }
  });
  require(_dependencyMap[0]);
  var _reactNavigationNative = require(_dependencyMap[1]);
  var _hooksFocusScore = require(_dependencyMap[2]);
  var _componentsPrimitives = require(_dependencyMap[3]);
  var _networkUseNetInfo = require(_dependencyMap[4]);
  var _navigationNavigationHelpers = require(_dependencyMap[5]);
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[6]);
  var _FocusScoreDashboardSkeleton = require(_dependencyMap[7]);
  var _FocusScoreDashboardHelpers = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  const FocusScoreDashboard = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(function FocusScoreDashboardInner() {
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const {
      score,
      history,
      status,
      error,
      refetch,
      isRefetching
    } = (0, _hooksFocusScore.useFocusScore)();
    const {
      isOffline
    } = (0, _networkUseNetInfo.useNetInfo)();

    // Compute static month value at render time to avoid hydration mismatch
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (status === 'pending') {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_FocusScoreDashboardSkeleton.FocusScoreDashboardSkeleton, {});
    }
    if (status === 'error') {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Box, {
        p: "md",
        gap: "md",
        alignItems: "center",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Text, {
          color: "error",
          children: ["Error: ", error?.message]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Button, {
          accessibilityLabel: "Retry loading focus score",
          onPress: () => refetch(),
          variant: "primary",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
            children: "Retry"
          })
        })]
      });
    }
    if (isOffline) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Box, {
        p: "md",
        bg: "warning",
        borderRadius: "md",
        mb: "md",
        alignItems: "center",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
          color: "onWarning",
          children: "You are offline. Data may be outdated."
        })
      });
    }
    if (!score) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Box, {
        p: "md",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
          children: "Start your first session to see your Focus Score."
        })
      });
    }
    const {
      currentScore,
      band,
      lastChangeReason,
      factors,
      previousScore,
      topPositiveFactor,
      topNegativeFactor
    } = score;
    const delta = currentScore - previousScore;
    const positiveFactor = topPositiveFactor ? factors[topPositiveFactor] : null;
    const negativeFactor = topNegativeFactor ? factors[topNegativeFactor] : null;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Box, {
      p: "md",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Stack, {
        gap: "md",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Box, {
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
            variant: "h3",
            children: "Focus Score"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
            variant: "h1",
            children: currentScore
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
            variant: "h4",
            children: band
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Text, {
            color: delta >= 0 ? 'success' : 'error',
            children: [(0, _FocusScoreDashboardHelpers.formatDelta)(delta), " since last session"]
          }), isRefetching && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
            color: "textMuted",
            variant: "caption",
            children: "Updating..."
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Box, {
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
            variant: "h4",
            mb: "sm",
            children: "30-day trend"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Stack, {
            gap: "sm",
            children: history && history.length > 0 ? history.slice(-5).map((point, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Box, {
              flexDirection: "row",
              justifyContent: "space-between",
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
                children: (0, _FocusScoreDashboardHelpers.formatHistoryPoint)(point)
              })
            }, `point-${point.timestamp}`)) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
              children: "No history available yet."
            })
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Box, {
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
            variant: "h4",
            mb: "sm",
            children: "Factors"
          }), Object.entries(factors).map(([key, factor]) => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Box, {
            mb: "xs",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
              variant: "bodySmall",
              children: key
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Box, {
              height: 8,
              bg: "border",
              borderRadius: "full",
              overflow: "hidden",
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Box, {
                height: "100%",
                bg: "primary",
                style: {
                  width: `${factor.score}%`
                }
              })
            })]
          }, key))]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Box, {
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
            variant: "h4",
            mb: "sm",
            children: "What Changed"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
            children: lastChangeReason
          }), positiveFactor && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
            children: `Strongest: ${positiveFactor.explanation}`
          }), negativeFactor && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
            children: `Weakest: ${negativeFactor.explanation}`
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Box, {
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Button, {
            accessibilityLabel: "View Monthly Report",
            onPress: () => (0, _navigationNavigationHelpers.navigateToMainStackScreen)(navigation, 'Analytics', {
              month: currentMonth
            }),
            variant: "secondary",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Text, {
              children: "View Monthly Report"
            })
          })
        })]
      })
    });
  }, 'Focus Dashboard');
},3567,[12,1359,2776,3048,2173,2052,2166,3568,3569,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "FocusScoreDashboardSkeleton", {
    enumerable: true,
    get: function () {
      return FocusScoreDashboardSkeleton;
    }
  });
  require(_dependencyMap[0]);
  var _componentsPrimitives = require(_dependencyMap[1]);
  var _hooksUseReducedMotion = require(_dependencyMap[2]);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  const FocusScoreDashboardSkeleton = () => {
    const {
      isReducedMotion
    } = (0, _hooksUseReducedMotion.useReducedMotion)();
    const animate = !isReducedMotion;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Stack, {
      gap: "md",
      testID: "focus-score-dashboard-skeleton",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Box, {
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Skeleton, {
          width: 100,
          height: 20,
          animated: animate
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Skeleton, {
          width: 80,
          height: 30,
          animated: animate
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Skeleton, {
          width: 120,
          height: 16,
          animated: animate
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Box, {
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Skeleton, {
          width: "100%",
          height: 150,
          animated: animate
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Box, {
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Skeleton, {
          width: 120,
          height: 20,
          animated: animate
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Skeleton, {
          width: "100%",
          height: 16,
          animated: animate
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitives.Box, {
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Skeleton, {
          width: 120,
          height: 20,
          animated: animate
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Skeleton, {
          width: "100%",
          height: 40,
          variant: "rounded",
          animated: animate
        })]
      })]
    });
  };
},3568,[12,3048,1681,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.formatDelta = formatDelta;
  exports.formatFactorName = formatFactorName;
  exports.formatHistoryPoint = formatHistoryPoint;
  function formatDelta(delta) {
    return `${delta >= 0 ? '+' : ''}${delta}`;
  }
  function formatFactorName(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase());
  }
  function formatHistoryPoint(point) {
    const date = new Date(point.timestamp);
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}: ${point.score} (${formatDelta(point.delta)})`;
  }
},3569,[]);