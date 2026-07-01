__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "ChallengesScreen", {
    enumerable: true,
    get: function () {
      return ChallengesScreenWithBoundary;
    }
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return ChallengesScreen;
    }
  });
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[0]);
  var _react = require(_dependencyMap[1]);
  var _utilsErrorSanitizer = require(_dependencyMap[2]);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _featuresChallengesComponentsChallengeHub = require(_dependencyMap[5]);
  var _featuresChallengesHooksChallengeMutations = require(_dependencyMap[6]);
  var _store = require(_dependencyMap[7]);
  var _sharedUiComponentsToast = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  function ChallengesScreen() {
    const userId = (0, _store.useAuthStore)(state => state.user?.id);
    const claimReward = (0, _featuresChallengesHooksChallengeMutations.useClaimChallengeReward)();
    const {
      show: showToast
    } = (0, _sharedUiComponentsToast.useToast)();
    const handleClaimReward = (0, _react.useCallback)(challengeId => {
      if (!userId) {
        showToast({
          type: 'error',
          title: 'Sign in required',
          message: 'You need an active profile to claim challenge rewards.'
        });
        return;
      }
      claimReward.mutate({
        userId,
        challengeId
      }, {
        onSuccess: result => {
          const rewardText = result.rewards.map(reward => `+${reward.amount} ${reward.type}`).join(', ');
          showToast({
            type: 'success',
            title: `Reward claimed! ${rewardText}`
          });
        },
        onError: error => {
          showToast({
            type: 'error',
            title: 'Reward claim failed',
            message: error instanceof Error ? (0, _utilsErrorSanitizer.sanitizeErrorMessage)(error) : 'Try again when your connection is stable.',
            action: {
              label: 'Retry',
              onPress: () => handleClaimReward(challengeId)
            }
          });
        }
      });
    }, [claimReward, showToast, userId]);
    if (!userId) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        p: "lg",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h3",
          color: "text.primary",
          textAlign: "center",
          children: "Sign in to view challenges"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: "text.secondary",
          textAlign: "center",
          mt: "sm",
          children: "Your active and completed challenge rewards are tied to your profile."
        })]
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresChallengesComponentsChallengeHub.ChallengeHub, {
      userId: userId,
      onClaimReward: handleClaimReward
    });
  }
  const ChallengesScreenWithBoundary = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(ChallengesScreen, 'Challenges');
},3338,[2166,12,3058,1462,1489,3717,2528,1705,2159,203]);
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
  Object.defineProperty(exports, "ChallengeHub", {
    enumerable: true,
    get: function () {
      return ChallengeHub;
    }
  });
  var _react = require(_dependencyMap[0]);
  var React = _interopDefault(_react);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsText = require(_dependencyMap[2]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[3]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[4]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _shopifyFlashList = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _componentsPrimitivesCard = require(_dependencyMap[7]);
  var _componentsBadge = require(_dependencyMap[8]);
  var _componentsUiProgressBar = require(_dependencyMap[9]);
  var _ChallengeHubSkeleton = require(_dependencyMap[10]);
  var _hooksChallengeQueries = require(_dependencyMap[11]);
  var _ChallengeCard = require(_dependencyMap[12]);
  var _sharedUiPrimitivesEmptyStateVariants = require(_dependencyMap[13]);
  var _challengeHubStyles = require(_dependencyMap[14]);
  var _challengeHubHelpers = require(_dependencyMap[15]);
  var _reactJsxRuntime = require(_dependencyMap[16]);
  const ChallengeHub = /*#__PURE__*/React.default.memo(({
    userId,
    onChallengePress,
    onClaimReward,
    onBrowseChallenges
  }) => {
    const theme = (0, _themeThemeContext.useThemeObject)();
    const [activeFilter, setActiveFilter] = (0, _react.useState)('ALL');
    const {
      isLoading: isLoadingAll
    } = (0, _hooksChallengeQueries.useActiveChallenges)(userId);
    const {
      data: challengeSummaries,
      isLoading: isLoadingSummaries
    } = (0, _hooksChallengeQueries.useChallengeSummaries)(userId);
    const isLoading = isLoadingAll || isLoadingSummaries;
    const stats = (0, _challengeHubHelpers.getChallengeStats)(challengeSummaries);
    const filteredChallenges = (0, _challengeHubHelpers.getFilteredChallenges)(challengeSummaries, activeFilter);
    const renderChallenge = ({
      item
    }) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
      onPress: () => onChallengePress?.(item.challengeId),
      style: ({
        pressed
      }) => [pressed && {
        opacity: 0.9
      }],
      accessibilityLabel: "Claim reward",
      accessibilityRole: "button",
      accessibilityHint: "Double tap to select",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_ChallengeCard.ChallengeCard, {
        challenge: item,
        onClaim: () => onClaimReward?.(item.challengeId)
      })
    });
    if (isLoading) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_ChallengeHubSkeleton.ChallengeHubSkeleton, {});
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(ScrollView.default, {
      style: [_challengeHubStyles.styles.container, {
        backgroundColor: theme.colors.background.primary
      }],
      contentContainerStyle: _challengeHubStyles.styles.content,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesCard.Card, {
        style: _challengeHubStyles.styles.statsCard,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: _challengeHubStyles.styles.statsTitle,
          children: "Challenge Progress"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: _challengeHubStyles.styles.statsGrid,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: _challengeHubStyles.styles.statItem,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: _challengeHubStyles.styles.statValue,
              children: stats.available
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: _challengeHubStyles.styles.statLabel,
              children: "Active"
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: _challengeHubStyles.styles.statItem,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: _challengeHubStyles.styles.statValue,
              children: stats.completed
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: _challengeHubStyles.styles.statLabel,
              children: "Completed"
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: _challengeHubStyles.styles.statItem,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: _challengeHubStyles.styles.statValue,
              children: stats.claimed
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: _challengeHubStyles.styles.statLabel,
              children: "Claimed"
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: _challengeHubStyles.styles.statItem,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Text.default, {
              style: _challengeHubStyles.styles.statValue,
              children: [Math.round(stats.completed / Math.max(1, stats.total) * 100), "%"]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: _challengeHubStyles.styles.statLabel,
              children: "Progress"
            })]
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiProgressBar.ProgressBar, {
          progress: stats.total > 0 ? (stats.completed + stats.claimed) / stats.total : 0
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(ScrollView.default, {
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        style: _challengeHubStyles.styles.filterContainer,
        contentContainerStyle: _challengeHubStyles.styles.filterContent,
        children: _challengeHubHelpers.FILTER_OPTIONS.map(filter => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          style: ({
            pressed
          }) => [_challengeHubStyles.styles.filterTab, activeFilter === filter && _challengeHubStyles.styles.filterTabActive, pressed && {
            opacity: 0.7
          }],
          onPress: () => setActiveFilter(filter),
          accessibilityLabel: "Challenge hub item",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to select",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [_challengeHubStyles.styles.filterText, activeFilter === filter && _challengeHubStyles.styles.filterTextActive],
            children: filter
          })
        }, filter))
      }), (activeFilter === 'ALL' || activeFilter === 'DAILY') && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesCard.Card, {
        style: _challengeHubStyles.styles.streakCard,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: _challengeHubStyles.styles.streakHeader,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: _challengeHubStyles.styles.streakTitle,
            children: "Daily Streak"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBadge.Badge, {
            variant: "warning",
            label: "3 Days"
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: _challengeHubStyles.styles.streakDescription,
          children: "Complete daily challenges to maintain your streak and earn bonus rewards!"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: _challengeHubStyles.styles.streakDays,
          children: ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: [_challengeHubStyles.styles.streakDay, index < 3 && _challengeHubStyles.styles.streakDayCompleted],
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: [_challengeHubStyles.styles.streakDayText, index < 3 && _challengeHubStyles.styles.streakDayTextCompleted],
              children: day
            })
          }, index))
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _challengeHubStyles.styles.listSection,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: _challengeHubStyles.styles.listTitle,
          children: activeFilter === 'ALL' ? 'All Challenges' : `${activeFilter} Challenges`
        }), filteredChallenges.length === 0 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesEmptyStateVariants.EmptyChallenges, {
          onBrowseChallenges: onBrowseChallenges
        }) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_shopifyFlashList.FlashList, {
          data: filteredChallenges,
          renderItem: renderChallenge,
          keyExtractor: item => item.challengeId,
          estimatedItemSize: 168
        })]
      })]
    });
  });
  ChallengeHub.displayName = 'ChallengeHub';
},3717,[12,80,493,171,1286,2702,1463,2621,3083,3718,3719,2524,3721,3069,3720,3723,203]);
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
  Object.defineProperty(exports, "ProgressBar", {
    enumerable: true,
    get: function () {
      return ProgressBar;
    }
  });
  var _react = require(_dependencyMap[0]);
  var React = _interopDefault(_react);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _primitivesText = require(_dependencyMap[3]);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  const clampProgress = value => Math.max(0, Math.min(1, value));
  const _worklet_6614133182279_init_data = {
    code: "function ProgressBarTsx1(){const{animatedValue}=this.__closure;return{width:animatedValue.value*100+\"%\"};}"
  };
  const ProgressBar = /*#__PURE__*/React.default.memo(function ProgressBar({
    progress,
    color,
    backgroundColor,
    height = 8,
    showPercentage = false,
    animated = true,
    label
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const reducedMotion = (0, _reactNativeReanimated.useReducedMotion)();
    const animatedValue = (0, _reactNativeReanimated.useSharedValue)(0);
    const nextProgress = clampProgress(progress);
    const barColor = color ?? theme.colors.semantic.primary;
    const bgColor = backgroundColor ?? theme.colors.semantic.border;
    (0, _react.useEffect)(() => {
      if (reducedMotion) {
        animatedValue.value = nextProgress;
        return;
      }
      animatedValue.value = animated ? (0, _reactNativeReanimated.withTiming)(nextProgress, {
        duration: 500
      }) : nextProgress;
    }, [animated, animatedValue, nextProgress, reducedMotion]);
    const fillStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function ProgressBarTsx1Factory({
      _worklet_6614133182279_init_data,
      animatedValue
    }) {
      const ProgressBarTsx1 = () => ({
        width: `${animatedValue.value * 100}%`
      });
      ProgressBarTsx1.__closure = {
        animatedValue
      };
      ProgressBarTsx1.__workletHash = 6614133182279;
      ProgressBarTsx1.__initData = _worklet_6614133182279_init_data;
      return ProgressBarTsx1;
    }({
      _worklet_6614133182279_init_data,
      animatedValue
    }));
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: {
        width: '100%'
      },
      children: [label || showPercentage ? /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: theme.spacing[1]
        },
        children: [label ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesText.Text, {
          color: "text.secondary",
          variant: "caption",
          children: label
        }) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {}), showPercentage ? /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_primitivesText.Text, {
          color: barColor,
          fontWeight: "700",
          variant: "caption",
          children: [Math.round(nextProgress * 100), "%"]
        }) : null]
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: {
          backgroundColor: bgColor,
          borderRadius: theme.borderRadius.full,
          height,
          overflow: 'hidden'
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          style: [{
            backgroundColor: barColor,
            borderRadius: theme.borderRadius.full,
            height: '100%'
          }, fillStyle]
        })
      })]
    });
  });
},3718,[12,80,226,1489,1463,203]);
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
  Object.defineProperty(exports, "ChallengeHubSkeleton", {
    enumerable: true,
    get: function () {
      return ChallengeHubSkeleton;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[2]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _themeThemeContext = require(_dependencyMap[3]);
  var _componentsPrimitivesCard = require(_dependencyMap[4]);
  var _sharedUiComponentsSkeletonItem = require(_dependencyMap[5]);
  var _challengeHubStyles = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  const ChallengeHubSkeleton = () => {
    const theme = (0, _themeThemeContext.useThemeObject)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(ScrollView.default, {
      style: [_challengeHubStyles.styles.container, {
        backgroundColor: theme.colors.background.primary
      }],
      contentContainerStyle: _challengeHubStyles.styles.content,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesCard.Card, {
        style: _challengeHubStyles.styles.statsCard,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
          variant: "title",
          width: "50%",
          style: {
            marginBottom: 12
          }
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: _challengeHubStyles.styles.statsGrid,
          children: [0, 1, 2, 3].map(i => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: _challengeHubStyles.styles.statItem,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
              variant: "text",
              width: 32,
              height: 24
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
              variant: "text",
              width: 48,
              height: 12,
              style: {
                marginTop: 4
              }
            })]
          }, i))
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
          variant: "text",
          height: 8,
          style: {
            borderRadius: 4,
            marginTop: 8
          }
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: _challengeHubStyles.styles.filterContainer,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: [_challengeHubStyles.styles.filterContent, {
            flexDirection: 'row'
          }],
          children: ['ALL', 'DAILY', 'WEEKLY', 'SPECIAL'].map(filter => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
            variant: "button",
            width: 80,
            height: 36,
            style: {
              borderRadius: 20
            }
          }, filter))
        })
      }), [0, 1, 2].map(i => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesCard.Card, {
        style: {
          padding: 16,
          marginBottom: 12
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flexDirection: 'row',
            gap: 8,
            marginBottom: 12
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
            variant: "button",
            width: 60,
            height: 24,
            style: {
              borderRadius: 12
            }
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
            variant: "button",
            width: 60,
            height: 24,
            style: {
              borderRadius: 12
            }
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
            variant: "button",
            width: 60,
            height: 24,
            style: {
              borderRadius: 12
            }
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
          variant: "title",
          width: "80%",
          style: {
            marginBottom: 8
          }
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
          variant: "text",
          style: {
            marginBottom: 4
          }
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
          variant: "text",
          width: "60%",
          style: {
            marginBottom: 16
          }
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
            variant: "text",
            width: 80,
            height: 14
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
            variant: "text",
            width: 40,
            height: 14
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
          variant: "text",
          height: 8,
          style: {
            borderRadius: 4,
            marginBottom: 12
          }
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: {
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.light,
            paddingTop: 12
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
            variant: "text",
            width: "50%",
            height: 14
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: {
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.light,
            paddingTop: 12,
            marginTop: 12
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsSkeletonItem.SkeletonItem, {
            variant: "button",
            width: 140,
            height: 44
          })
        })]
      }, i))]
    });
  };
},3719,[12,80,171,1463,2621,3125,3720,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "styles", {
    enumerable: true,
    get: function () {
      return styles;
    }
  });
  var _sharedUiCreateSheet = require(_dependencyMap[0]);
  var _themeTokensColors = require(_dependencyMap[1]);
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      flex: 1
    },
    content: {
      padding: 16
    },
    loadingText: {
      textAlign: 'center',
      marginTop: 12,
      fontSize: 14,
      color: _themeTokensColors.lightColors.text.muted
    },
    statsCard: {
      padding: 16,
      marginBottom: 12
    },
    statsTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 12
    },
    statItem: {
      alignItems: 'center'
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: _themeTokensColors.lightColors.accent.blue
    },
    statLabel: {
      fontSize: 12,
      color: _themeTokensColors.lightColors.text.muted,
      marginTop: 2
    },
    overallProgress: {
      marginTop: 8
    },
    filterContainer: {
      marginBottom: 12
    },
    filterContent: {
      gap: 8,
      paddingHorizontal: 4
    },
    filterTab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: _themeTokensColors.lightColors.surface.button
    },
    filterTabActive: {
      backgroundColor: _themeTokensColors.lightColors.accent.blue
    },
    filterText: {
      fontSize: 13,
      fontWeight: '500',
      color: _themeTokensColors.lightColors.text.muted
    },
    filterTextActive: {
      color: _themeTokensColors.lightColors.text.inverse
    },
    streakCard: {
      padding: 16,
      marginBottom: 12,
      backgroundColor: _themeTokensColors.lightColors.warning[50]
    },
    streakHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    },
    streakTitle: {
      fontSize: 16,
      fontWeight: '600'
    },
    streakDescription: {
      fontSize: 13,
      color: _themeTokensColors.lightColors.text.muted,
      marginBottom: 12
    },
    streakDays: {
      flexDirection: 'row',
      gap: 8
    },
    streakDay: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: _themeTokensColors.lightColors.border.light,
      justifyContent: 'center',
      alignItems: 'center'
    },
    streakDayCompleted: {
      backgroundColor: _themeTokensColors.lightColors.semantic.warning
    },
    streakDayText: {
      fontSize: 12,
      fontWeight: '600',
      color: _themeTokensColors.lightColors.text.muted
    },
    streakDayTextCompleted: {
      color: _themeTokensColors.lightColors.text.inverse
    },
    listSection: {
      marginTop: 8
    },
    listTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12
    },
    emptyCard: {
      padding: 32,
      alignItems: 'center'
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 12
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4
    },
    emptyText: {
      fontSize: 14,
      color: _themeTokensColors.lightColors.text.muted,
      textAlign: 'center'
    }
  });
},3720,[1678,1465]);
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
  exports.ChallengeCard = ChallengeCard;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[2]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _componentsBadge = require(_dependencyMap[3]);
  var _componentsPrimitivesButton = require(_dependencyMap[4]);
  var _componentsPrimitivesCard = require(_dependencyMap[5]);
  var _componentsPrimitivesText = require(_dependencyMap[6]);
  var _themeThemeContext = require(_dependencyMap[7]);
  var _challengeCardHelpers = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  function ChallengeCard({
    challenge,
    onClaim,
    onReroll,
    loading = false
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const isActionable = challenge.status === 'ACTIVE' || challenge.status === 'COMPLETED';
    const cardStyle = challenge.isExpired ? Object.assign({}, _challengeCardHelpers.challengeCardStyles.container, _challengeCardHelpers.challengeCardStyles.expiredContainer) : _challengeCardHelpers.challengeCardStyles.container;
    const statusBadge = (0, _challengeCardHelpers.getStatusBadge)(challenge.status);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesCard.Card, {
      style: cardStyle,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _challengeCardHelpers.challengeCardStyles.header,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: _challengeCardHelpers.challengeCardStyles.categoryRow,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBadge.Badge, {
            variant: "outline",
            size: "sm",
            children: challenge.type
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBadge.Badge, {
            variant: (0, _challengeCardHelpers.getDifficultyVariant)(challenge.difficulty),
            size: "sm",
            children: challenge.difficulty
          }), statusBadge]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          style: _challengeCardHelpers.challengeCardStyles.title,
          numberOfLines: 2,
          children: challenge.title
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          style: [_challengeCardHelpers.challengeCardStyles.description, {
            color: theme.colors.text.secondary
          }],
          numberOfLines: 2,
          children: challenge.description
        })]
      }), challenge.status === 'ACTIVE' && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _challengeCardHelpers.challengeCardStyles.progressSection,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: _challengeCardHelpers.challengeCardStyles.progressRow,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
            style: _challengeCardHelpers.challengeCardStyles.progressText,
            children: [challenge.currentValue, " / ", challenge.targetValue]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
            style: [_challengeCardHelpers.challengeCardStyles.progressPercent, {
              color: theme.colors.primary[500]
            }],
            children: [Math.round(challenge.progressPercent), "%"]
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: [_challengeCardHelpers.challengeCardStyles.progressBarTrack, {
            backgroundColor: theme.colors.background.tertiary
          }],
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: [_challengeCardHelpers.challengeCardStyles.progressBarFill, {
              backgroundColor: theme.colors.primary[500],
              width: `${challenge.progressPercent}%`
            }]
          })
        }), challenge.expiresInMs !== null && challenge.expiresInMs > 0 && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          style: [_challengeCardHelpers.challengeCardStyles.expiresText, {
            color: theme.colors.error.DEFAULT
          }],
          children: ["Expires in ", (0, _challengeCardHelpers.formatDuration)(challenge.expiresInMs)]
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: [_challengeCardHelpers.challengeCardStyles.rewardRow, {
          borderTopColor: theme.colors.border.light
        }],
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          style: [_challengeCardHelpers.challengeCardStyles.rewardText, {
            color: theme.colors.success.DEFAULT
          }],
          children: ["Reward: ", challenge.rewardAmount, " ", challenge.rewardType]
        })
      }), isActionable && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: [_challengeCardHelpers.challengeCardStyles.actionsRow, {
          borderTopColor: theme.colors.border.light
        }],
        children: [challenge.status === 'COMPLETED' && onClaim && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "primary",
          onPress: onClaim,
          style: _challengeCardHelpers.challengeCardStyles.actionButton,
          isLoading: loading,
          isDisabled: loading,
          accessibilityLabel: "Claim challenge reward",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to select",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: "Claim Reward"
          })
        }), challenge.status === 'ACTIVE' && challenge.canReroll && onReroll && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          onPress: onReroll,
          style: ({
            pressed
          }) => [_challengeCardHelpers.challengeCardStyles.rerollButton, pressed && {
            opacity: 0.8
          }],
          disabled: loading,
          accessibilityLabel: "Challenge card",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to select",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBadge.Badge, {
            variant: "outline",
            children: challenge.freeRerollAvailable ? 'Free Reroll' : `${challenge.rerollCost} Gems`
          })
        })]
      })]
    });
  }
},3721,[12,80,1286,3083,1680,2621,1489,1463,3722,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "formatDuration", {
    enumerable: true,
    get: function () {
      return _utilsFormatDuration.formatDurationFromMs;
    }
  });
  exports.getStatusBadge = getStatusBadge;
  exports.getDifficultyVariant = getDifficultyVariant;
  Object.defineProperty(exports, "challengeCardStyles", {
    enumerable: true,
    get: function () {
      return challengeCardStyles;
    }
  });
  var _componentsBadge = require(_dependencyMap[0]);
  var _sharedUiCreateSheet = require(_dependencyMap[1]);
  var _reactJsxRuntime = require(_dependencyMap[2]);
  var _utilsFormatDuration = require(_dependencyMap[3]);
  function getStatusBadge(status) {
    switch (status) {
      case 'COMPLETED':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBadge.Badge, {
          variant: "success",
          label: "Ready to Claim"
        });
      case 'CLAIMED':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBadge.Badge, {
          variant: "secondary",
          label: "Claimed"
        });
      case 'EXPIRED':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBadge.Badge, {
          variant: "error",
          label: "Expired"
        });
      case 'REROLLED':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBadge.Badge, {
          variant: "secondary",
          label: "Rerolled"
        });
      default:
        return null;
    }
  }
  function getDifficultyVariant(difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'primary';
      case 'hard':
        return 'warning';
      case 'expert':
        return 'error';
      default:
        return 'default';
    }
  }
  const challengeCardStyles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 12
    },
    expiredContainer: {
      opacity: 0.6
    },
    header: {
      marginBottom: 12
    },
    categoryRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4
    },
    description: {
      fontSize: 14
    },
    progressSection: {
      marginBottom: 12
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4
    },
    progressText: {
      fontSize: 14,
      fontWeight: '500'
    },
    progressPercent: {
      fontSize: 14,
      fontWeight: '600'
    },
    progressBarTrack: {
      height: 8,
      borderRadius: 4
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4
    },
    expiresText: {
      fontSize: 12,
      marginTop: 4
    },
    rewardRow: {
      paddingTop: 12,
      borderTopWidth: 1
    },
    rewardText: {
      fontSize: 14,
      fontWeight: '500'
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1
    },
    actionButton: {
      flex: 1
    },
    rerollButton: {
      padding: 4
    }
  });
},3722,[3083,1678,203,2633]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "FILTER_OPTIONS", {
    enumerable: true,
    get: function () {
      return FILTER_OPTIONS;
    }
  });
  exports.getFilteredChallenges = getFilteredChallenges;
  exports.getChallengeStats = getChallengeStats;
  const FILTER_OPTIONS = ['ALL', 'DAILY', 'WEEKLY', 'EVENT', 'COMPLETED'];
  function getFilteredChallenges(challengeSummaries, activeFilter) {
    if (!challengeSummaries) {
      return [];
    }
    switch (activeFilter) {
      case 'DAILY':
        return challengeSummaries.filter(c => c.type === 'DAILY');
      case 'WEEKLY':
        return challengeSummaries.filter(c => c.type === 'WEEKLY');
      case 'EVENT':
        return challengeSummaries.filter(c => c.type === 'EVENT');
      case 'COMPLETED':
        return challengeSummaries.filter(c => c.status === 'COMPLETED' || c.status === 'CLAIMED');
      case 'ALL':
      default:
        return challengeSummaries;
    }
  }
  function getChallengeStats(challengeSummaries) {
    if (!challengeSummaries) {
      return {
        total: 0,
        completed: 0,
        claimed: 0,
        available: 0
      };
    }
    const completed = challengeSummaries.filter(c => c.status === 'COMPLETED').length;
    const claimed = challengeSummaries.filter(c => c.status === 'CLAIMED').length;
    const available = challengeSummaries.filter(c => c.status === 'ACTIVE').length;
    return {
      total: challengeSummaries.length,
      completed,
      claimed,
      available
    };
  }
},3723,[]);