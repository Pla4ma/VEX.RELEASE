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
  Object.defineProperty(exports, "MasteryScreen", {
    enumerable: true,
    get: function () {
      return MasteryScreenWithBoundary;
    }
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return MasteryScreen;
    }
  });
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[0]);
  var _react = require(_dependencyMap[1]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[2]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsView = require(_dependencyMap[3]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeSafeAreaContext = require(_dependencyMap[4]);
  var _reactNavigationNative = require(_dependencyMap[5]);
  var _reactNativeReanimated = require(_dependencyMap[6]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[7]);
  var _componentsPrimitivesText = require(_dependencyMap[8]);
  var _sharedUiPrimitivesSkeleton = require(_dependencyMap[9]);
  var _componentsStatesErrorState = require(_dependencyMap[10]);
  var _iconsComponentsIcon = require(_dependencyMap[11]);
  var _store = require(_dependencyMap[12]);
  var _themeThemeContext = require(_dependencyMap[13]);
  var _MasteryHeader = require(_dependencyMap[14]);
  var _MasteryTechniqueGrid = require(_dependencyMap[15]);
  var _MasteryChallengesList = require(_dependencyMap[16]);
  var _useMasteryState = require(_dependencyMap[17]);
  var _reactJsxRuntime = require(_dependencyMap[18]);
  const _worklet_3802057794786_init_data = {
    code: "function MasteryScreenTsx1(){const{progressAnim}=this.__closure;return{width:progressAnim.value*100+\"%\"};}"
  };
  function MasteryScreen() {
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const insets = (0, _reactNativeSafeAreaContext.useSafeAreaInsets)();
    const {
      user
    } = (0, _store.useAuthStore)();
    const userId = user?.id ?? null;
    const {
      state,
      isLoading,
      error,
      refetch,
      claimChallenge,
      refreshChallenges,
      pointsToNext,
      nextRankName,
      rankProgress
    } = (0, _useMasteryState.useMasteryState)(userId);
    const progressAnim = (0, _reactNativeReanimated.useSharedValue)(0);
    const progressStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function MasteryScreenTsx1Factory({
      _worklet_3802057794786_init_data,
      progressAnim
    }) {
      const MasteryScreenTsx1 = () => ({
        width: `${progressAnim.value * 100}%`
      });
      MasteryScreenTsx1.__closure = {
        progressAnim
      };
      MasteryScreenTsx1.__workletHash = 3802057794786;
      MasteryScreenTsx1.__initData = _worklet_3802057794786_init_data;
      return MasteryScreenTsx1;
    }({
      _worklet_3802057794786_init_data,
      progressAnim
    }));
    (0, _react.useEffect)(() => {
      progressAnim.value = (0, _reactNativeReanimated.withTiming)(rankProgress, {
        duration: 1000
      });
    }, [progressAnim, rankProgress]);
    if (isLoading) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        flex: 1,
        style: {
          backgroundColor: theme.colors.background.primary
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          style: {
            paddingTop: insets.top + theme.spacing[5],
            paddingHorizontal: theme.spacing[5]
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
            width: 120,
            height: 20,
            style: {
              marginBottom: 12
            }
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
            width: 200,
            height: 32,
            style: {
              marginBottom: 16
            }
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
            width: "100%",
            height: 100,
            style: {
              marginBottom: 16
            }
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
            width: "100%",
            height: 200
          })]
        })
      });
    }
    if (error || !state) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        flex: 1,
        style: {
          backgroundColor: theme.colors.background.primary
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: {
            paddingTop: insets.top + theme.spacing[5],
            paddingHorizontal: theme.spacing[5]
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsStatesErrorState.ErrorState, {
            title: "Couldn't load mastery data",
            description: "We encountered an error loading your mastery progress. Please try again.",
            onRetry: refetch
          })
        })
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      flex: 1,
      style: {
        backgroundColor: theme.colors.background.primary
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          paddingTop: insets.top + theme.spacing[5],
          paddingHorizontal: theme.spacing[5],
          paddingBottom: theme.spacing[10]
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeInUp.duration(400),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "label",
                color: "text.secondary",
                children: "MASTERY"
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "h2",
                color: "text.primary",
                children: "Skill Progression"
              })]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
              onPress: () => navigation.goBack(),
              accessibilityLabel: "Go back",
              accessibilityRole: "button",
              style: {
                padding: 8
              },
              accessibilityHint: "Closes mastery screen",
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
                name: "close",
                size: 24,
                color: theme.colors.text.secondary
              })
            })]
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeInUp.duration(400).delay(100),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_MasteryHeader.MasteryHeader, {
            state: state,
            pointsToNext: pointsToNext,
            nextRankName: nextRankName,
            progressStyle: progressStyle
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeInUp.duration(400).delay(200),
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "h4",
            color: "text.primary",
            children: "Technique Mastery"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_MasteryTechniqueGrid.MasteryTechniqueGrid, {
            state: state
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeInUp.duration(400).delay(300),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_MasteryChallengesList.MasteryChallengesList, {
            challenges: state.activeChallenges,
            onClaim: claimChallenge,
            onRefresh: refreshChallenges
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeInUp.duration(400).delay(400),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_MasteryHeader.RankUnlocks, {
            currentRank: state.rank
          })
        })]
      })
    });
  }
  const MasteryScreenWithBoundary = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(MasteryScreen, 'Mastery');
},3339,[2166,12,1286,80,719,1359,226,1462,1489,3061,2813,1691,1705,1463,3724,3725,3726,3727,203]);
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
  exports.RankUnlocks = RankUnlocks;
  exports.MasteryHeader = MasteryHeader;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitives = require(_dependencyMap[4]);
  var _componentsPrimitivesText = require(_dependencyMap[5]);
  var _featuresMasteryComponentsMasteryRankBadge = require(_dependencyMap[6]);
  var _featuresMasteryTypes = require(_dependencyMap[7]);
  var _iconsComponentsIcon = require(_dependencyMap[8]);
  var _themeThemeContext = require(_dependencyMap[9]);
  var _reactJsxRuntime = require(_dependencyMap[10]);
  const RANK_UNLOCKS = {
    APPRENTICE: ['All base session modes', 'Basic boss encounters'],
    ADEPT: ['DEEP_WORK mode unlocked', 'Advanced boss tier 3-4 access'],
    EXPERT: ['Nightmare Mode sessions (2x XP)', 'Boss tier 5-6 access'],
    MASTER: ['Mastery Duel type', 'Custom challenge creation'],
    GRANDMASTER: ['Exclusive Grandmaster badge', 'Priority support access']
  };
  function RankUnlocks({
    currentRank
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: {
        gap: theme.spacing[3]
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "h4",
        color: "text.primary",
        children: "Rank Unlocks"
      }), ranks.map(rank => {
        const isCurrent = rank === currentRank;
        const isUnlocked = ranks.indexOf(rank) <= ranks.indexOf(currentRank);
        const rankDisplay = (0, _featuresMasteryTypes.getMasteryRankDisplay)(rank);
        return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[3],
            padding: theme.spacing[3],
            borderRadius: 12,
            backgroundColor: isCurrent ? `${rankDisplay.color}15` : theme.colors.background.secondary,
            borderWidth: isCurrent ? 1 : 0,
            borderColor: isCurrent ? rankDisplay.color : undefined,
            opacity: isUnlocked ? 1 : 0.5
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            fontSize: 24,
            children: rankDisplay.icon
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: {
              flex: 1
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
              variant: "body",
              color: "text.primary",
              fontWeight: isCurrent ? '700' : '500',
              style: {
                color: isUnlocked ? rankDisplay.color : theme.colors.text.secondary
              },
              children: [rankDisplay.title, isCurrent && ' (Current)', !isUnlocked && ' (Locked)']
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.tertiary",
              children: RANK_UNLOCKS[rank].join(' • ')
            })]
          }), isUnlocked && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
            name: "checkmark-circle",
            size: 20,
            color: theme.colors.success.DEFAULT
          })]
        }, rank);
      })]
    });
  }
  const ranks = ['APPRENTICE', 'ADEPT', 'EXPERT', 'MASTER', 'GRANDMASTER'];
  function MasteryHeader({
    state,
    pointsToNext,
    nextRankName,
    progressStyle
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const rankDisplay = (0, _featuresMasteryTypes.getMasteryRankDisplay)(state.rank);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Card, {
      size: "lg",
      style: {
        backgroundColor: theme.colors.background.secondary
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        alignItems: "center",
        gap: "md",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresMasteryComponentsMasteryRankBadge.MasteryRankBadge, {
          rank: state.rank,
          totalPoints: state.totalMasteryPoints,
          size: "lg"
        }), pointsToNext > 0 && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            width: '100%',
            gap: theme.spacing[2]
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.secondary",
              children: ["Progress to ", nextRankName]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.tertiary",
              children: [pointsToNext, " MP needed"]
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: {
              height: 8,
              borderRadius: 4,
              overflow: 'hidden',
              backgroundColor: theme.colors.background.tertiary
            },
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
              style: [{
                height: 8,
                borderRadius: 4,
                backgroundColor: rankDisplay.color
              }, progressStyle]
            })
          })]
        }), pointsToNext === 0 && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: "success.DEFAULT",
          fontWeight: "600",
          children: "Maximum Rank Achieved!"
        })]
      })
    });
  }
},3724,[12,80,226,1462,3048,1489,3544,2995,1691,1463,203]);
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
  Object.defineProperty(exports, "TECHNIQUES", {
    enumerable: true,
    get: function () {
      return TECHNIQUES;
    }
  });
  exports.MasteryTechniqueGrid = MasteryTechniqueGrid;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesCard = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _featuresMasteryComponentsTechniqueBar = require(_dependencyMap[4]);
  var _themeThemeContext = require(_dependencyMap[5]);
  var _themeTokensColors = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  const TECHNIQUES = [{
    key: 'durationMastery',
    label: 'Duration Focus',
    color: _themeTokensColors.lightColors.semantic.primary,
    description: 'Long sessions without interruption'
  }, {
    key: 'purityMastery',
    label: 'Purity',
    color: _themeTokensColors.lightColors.accent.teal,
    description: 'Sustained high focus scores'
  }, {
    key: 'consistencyMastery',
    label: 'Consistency',
    color: _themeTokensColors.lightColors.accent.orange,
    description: 'Daily streaks maintained'
  }, {
    key: 'comebackMastery',
    label: 'Comeback',
    color: _themeTokensColors.lightColors.accent.pink,
    description: 'Recovering from broken streaks'
  }, {
    key: 'bossMastery',
    label: 'Boss',
    color: _themeTokensColors.lightColors.semantic.warning,
    description: 'Boss defeat efficiency'
  }];
  function MasteryTechniqueGrid({
    state
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesCard.Card, {
      size: "md",
      style: {
        backgroundColor: theme.colors.background.secondary
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: {
          gap: theme.spacing[4]
        },
        children: TECHNIQUES.map(tech => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresMasteryComponentsTechniqueBar.TechniqueBar, {
            label: tech.label,
            value: state.techniques[tech.key],
            max: 25,
            color: tech.color
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.tertiary",
            style: {
              marginTop: theme.spacing[1]
            },
            children: tech.description
          })]
        }, tech.key))
      })
    });
  }
},3725,[12,80,2621,1489,3545,1463,1465,203]);
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
  exports.MasteryChallengesList = MasteryChallengesList;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesCard = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _componentsPrimitivesButton = require(_dependencyMap[5]);
  var _componentsEmptyState = require(_dependencyMap[6]);
  var _iconsComponentsIcon = require(_dependencyMap[7]);
  var _themeThemeContext = require(_dependencyMap[8]);
  var _themeTokensColors = require(_dependencyMap[9]);
  var _reactJsxRuntime = require(_dependencyMap[10]);
  const DIFFICULTY_COLORS = {
    EASY: _themeTokensColors.lightColors.accent.green,
    MEDIUM: _themeTokensColors.lightColors.accent.blue,
    HARD: _themeTokensColors.lightColors.semantic.warning,
    ELITE: _themeTokensColors.lightColors.accent.purple
  };
  function ChallengeCard({
    challenge,
    onClaim
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const progress = challenge.target > 0 ? Math.max(0, Math.min(1, challenge.current / challenge.target)) : 0;
    const badgeColor = DIFFICULTY_COLORS[challenge.difficulty];
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesCard.Card, {
      size: "md",
      style: {
        backgroundColor: theme.colors.background.secondary
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          gap: theme.spacing[3]
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: {
              flex: 1,
              gap: theme.spacing[1]
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "h4",
              color: "text.primary",
              children: challenge.title
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.secondary",
              children: challenge.description
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: {
              borderRadius: 999,
              paddingHorizontal: theme.spacing[2],
              paddingVertical: theme.spacing[1],
              backgroundColor: `${badgeColor}22`
            },
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              style: {
                color: badgeColor
              },
              children: challenge.difficulty
            })
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            gap: theme.spacing[1]
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: {
              height: 8,
              borderRadius: 4,
              overflow: 'hidden',
              backgroundColor: theme.colors.background.tertiary
            },
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
              style: {
                width: `${progress * 100}%`,
                height: 8,
                borderRadius: 4,
                backgroundColor: badgeColor
              }
            })
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.tertiary",
              children: [challenge.current, "/", challenge.target, " ", challenge.unit]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "success.DEFAULT",
              children: ["+", challenge.masteryPoints, " MP"]
            })]
          })]
        }), challenge.status === 'COMPLETED' && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          size: "sm",
          variant: "primary",
          onPress: onClaim,
          accessibilityLabel: `Claim reward for ${challenge.title}`,
          accessibilityRole: "button",
          accessibilityHint: `Claims ${challenge.masteryPoints} mastery points`,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
            children: ["Claim +", challenge.masteryPoints, " MP"]
          })
        })]
      })
    });
  }
  function MasteryChallengesList({
    challenges,
    onClaim,
    onRefresh
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: "text.primary",
          children: "Active Challenges"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          size: "sm",
          variant: "ghost",
          onPress: onRefresh,
          accessibilityLabel: "Refresh challenges",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
            name: "refresh",
            size: 16,
            color: theme.colors.primary[500]
          })
        })]
      }), challenges.length === 0 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesCard.Card, {
        size: "md",
        style: {
          backgroundColor: theme.colors.background.secondary
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsEmptyState.EmptyState, {
          iconName: "target",
          title: "No active challenges",
          body: "Complete sessions to unlock mastery challenges"
        })
      }) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: {
          gap: theme.spacing[3]
        },
        children: challenges.map(challenge => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(ChallengeCard, {
          challenge: challenge,
          onClaim: () => onClaim(challenge.id)
        }, challenge.id))
      })]
    });
  }
},3726,[12,80,1462,2621,1489,1680,2812,1691,1463,1465,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useMasteryState = useMasteryState;
  var _react = require(_dependencyMap[0]);
  var _featuresMasteryService = require(_dependencyMap[1]);
  var _featuresMasteryTypes = require(_dependencyMap[2]);
  function calculatePointsToNextRank(currentPoints, currentRank) {
    const ranks = ['APPRENTICE', 'ADEPT', 'EXPERT', 'MASTER', 'GRANDMASTER'];
    const currentIndex = ranks.indexOf(currentRank);
    if (currentIndex >= ranks.length - 1) {
      return 0;
    }
    const nextRank = ranks[currentIndex + 1];
    return Math.max(0, _featuresMasteryTypes.MASTERY_RANK_THRESHOLDS[nextRank] - currentPoints);
  }
  function useMasteryState(userId) {
    const [state, setState] = (0, _react.useState)(null);
    const [isLoading, setIsLoading] = (0, _react.useState)(true);
    const [error, setError] = (0, _react.useState)(null);
    const loadMastery = (0, _react.useCallback)(async () => {
      if (!userId) {
        setState(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const masteryState = _featuresMasteryService.MasteryService.getOrCreateMasteryState(userId);
        setState(masteryState);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load mastery state'));
      } finally {
        setIsLoading(false);
      }
    }, [userId]);
    (0, _react.useEffect)(() => {
      loadMastery();
    }, [loadMastery]);
    const claimChallenge = (0, _react.useCallback)(challengeId => {
      if (!userId) {
        return false;
      }
      const success = _featuresMasteryService.MasteryService.claimChallenge(userId, challengeId);
      if (success) {
        const updatedState = _featuresMasteryService.MasteryService.getOrCreateMasteryState(userId);
        setState(updatedState);
      }
      return success;
    }, [userId]);
    const refreshChallenges = (0, _react.useCallback)(() => {
      if (!userId) {
        return;
      }
      const updatedState = _featuresMasteryService.MasteryService.refreshChallenges(userId);
      setState(updatedState);
    }, [userId]);
    const pointsToNext = state ? calculatePointsToNextRank(state.totalMasteryPoints, state.rank ?? 'APPRENTICE') : 0;
    const nextRankName = (0, _react.useMemo)(() => {
      if (!state) {
        return '';
      }
      const ranks = ['APPRENTICE', 'ADEPT', 'EXPERT', 'MASTER', 'GRANDMASTER'];
      const currentIndex = ranks.indexOf(state.rank ?? 'APPRENTICE');
      if (currentIndex >= ranks.length - 1) {
        return 'Max Rank';
      }
      return (0, _featuresMasteryTypes.getMasteryRankDisplay)(ranks[currentIndex + 1]).title;
    }, [state]);
    const rankProgress = (0, _react.useMemo)(() => {
      if (!state || pointsToNext === 0) {
        return 1;
      }
      const currentThreshold = _featuresMasteryTypes.MASTERY_RANK_THRESHOLDS[state.rank];
      const nextThreshold = currentThreshold + pointsToNext;
      const progressInRank = state.totalMasteryPoints - currentThreshold;
      const rankRange = nextThreshold - currentThreshold;
      return Math.max(0, Math.min(1, progressInRank / rankRange));
    }, [state, pointsToNext]);
    return {
      state,
      isLoading,
      error,
      refetch: loadMastery,
      claimChallenge,
      refreshChallenges,
      pointsToNext,
      nextRankName,
      rankProgress
    };
  }
},3727,[12,2996,2995]);