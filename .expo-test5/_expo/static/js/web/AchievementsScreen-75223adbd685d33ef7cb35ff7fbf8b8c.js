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
  Object.defineProperty(exports, "AchievementsScreen", {
    enumerable: true,
    get: function () {
      return AchievementsScreenWithBoundary;
    }
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return AchievementsScreen;
    }
  });
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[0]);
  var _react = require(_dependencyMap[1]);
  var React = _interopDefault(_react);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[2]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _shopifyFlashList = require(_dependencyMap[3]);
  var _reactNavigationNative = require(_dependencyMap[4]);
  var _componentsPrimitivesBox = require(_dependencyMap[5]);
  var _componentsPrimitivesText = require(_dependencyMap[6]);
  var _sharedUiPrimitives = require(_dependencyMap[7]);
  var _theme = require(_dependencyMap[8]);
  var _featuresAchievementsHooks = require(_dependencyMap[9]);
  var _featuresAchievementsHooksComputed = require(_dependencyMap[10]);
  var _storeAuthStore = require(_dependencyMap[11]);
  var _tanstackReactQuery = require(_dependencyMap[12]);
  var _navigationNavigationHelpers = require(_dependencyMap[13]);
  var _AchievementProgressBar = require(_dependencyMap[14]);
  var _AchievementSearchFilter = require(_dependencyMap[15]);
  var _AchievementCategorySection = require(_dependencyMap[16]);
  var _reactJsxRuntime = require(_dependencyMap[17]);
  const RARITY_ORDER = ['LEGENDARY', 'EPIC', 'RARE', 'UNCOMMON', 'COMMON'];
  const CATEGORY_ORDER = ['SESSION', 'STREAK', 'BOSS', 'SOCIAL', 'PROGRESSION', 'ECONOMY'];
  const AchievementsScreen = /*#__PURE__*/React.default.memo(() => {
    const {
      theme
    } = (0, _theme.useTheme)();
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const queryClient = (0, _tanstackReactQuery.useQueryClient)();
    const user = (0, _storeAuthStore.useAuthStore)(state => state.user);
    const userId = user?.id ?? '';
    const {
      data: achievements,
      isLoading
    } = (0, _featuresAchievementsHooks.useAchievements)(userId);
    const {
      data: stats
    } = (0, _featuresAchievementsHooksComputed.useAchievementStats)(userId);
    const [selectedCategory, setSelectedCategory] = (0, _react.useState)('ALL');
    const [filter, setFilter] = (0, _react.useState)('ALL');
    const [sort, setSort] = (0, _react.useState)('RARITY');
    const [selectedAchievement, setSelectedAchievement] = (0, _react.useState)(null);
    const handleStartSession = (0, _react.useCallback)(() => {
      (0, _navigationNavigationHelpers.navigateToRootScreen)(navigation, 'SessionStack', {
        screen: 'SessionSetup',
        params: {}
      });
    }, [navigation]);
    const filteredAchievements = (0, _react.useMemo)(() => {
      if (!achievements) {
        return [];
      }
      let result = [...achievements];
      if (selectedCategory !== 'ALL') {
        result = result.filter(a => a.category === selectedCategory);
      }
      if (filter === 'UNLOCKED') {
        result = result.filter(a => a.isUnlocked);
      } else if (filter === 'LOCKED') {
        result = result.filter(a => !a.isUnlocked);
      }
      result.sort((a, b) => {
        if (sort === 'RARITY') {
          return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
        }
        if (sort === 'RECENT') {
          return (b.unlockedAt || 0) - (a.unlockedAt || 0);
        }
        if (sort === 'CATEGORY') {
          return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
        }
        return 0;
      });
      return result;
    }, [achievements, selectedCategory, filter, sort]);
    const handleRefresh = (0, _react.useCallback)(() => {
      queryClient.invalidateQueries({
        queryKey: _featuresAchievementsHooks.achievementKeys.list(userId)
      });
    }, [queryClient, userId]);
    const handleAchievementPress = (0, _react.useCallback)(achievement => {
      setSelectedAchievement(achievement);
    }, []);
    if (isLoading) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flex: 1,
        bg: theme.colors.background.primary,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          p: 4,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitives.Skeleton, {
            width: 200,
            height: 32
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitives.Skeleton, {
            width: 150,
            height: 20
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_shopifyFlashList.FlashList, {
          data: [1, 2, 3, 4, 5, 6],
          renderItem: () => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_AchievementCategorySection.AchievementSkeletonCard, {}),
          estimatedItemSize: 100,
          keyExtractor: item => item.toString()
        })]
      });
    }
    if (!filteredAchievements.length) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flex: 1,
        bg: theme.colors.background.primary,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_AchievementSearchFilter.CategoryTabs, {
          selected: selectedCategory,
          onSelect: setSelectedCategory
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_AchievementSearchFilter.FilterSortBar, {
          filter: filter,
          onFilterChange: setFilter,
          sort: sort,
          onSortChange: setSort
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_AchievementCategorySection.EmptyState, {
          onStartSession: handleStartSession
        })]
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      bg: theme.colors.background.primary,
      children: [stats && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_AchievementProgressBar.AchievementsHeader, {
        total: stats.total,
        unlocked: stats.unlocked,
        totalPoints: stats.totalPoints,
        pointsEarned: stats.pointsEarned
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_AchievementSearchFilter.CategoryTabs, {
        selected: selectedCategory,
        onSelect: setSelectedCategory
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_AchievementSearchFilter.FilterSortBar, {
        filter: filter,
        onFilterChange: setFilter,
        sort: sort,
        onSortChange: setSort
      }), selectedAchievement && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        p: 4,
        bg: theme.colors.background.secondary,
        mb: 4,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flex: 1,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "h3",
              color: theme.colors.text.primary,
              children: selectedAchievement.title
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              color: theme.colors.text.secondary,
              mt: 1,
              children: selectedAchievement.description
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
            onPress: () => setSelectedAchievement(null),
            style: ({
              pressed
            }) => [pressed && {
              opacity: 0.8
            }],
            accessibilityLabel: "Close achievements",
            accessibilityRole: "button",
            accessibilityHint: "Closes the achievement details",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              color: theme.colors.text.secondary,
              children: "Close"
            })
          })]
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_shopifyFlashList.FlashList, {
        data: filteredAchievements,
        renderItem: ({
          item
        }) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_AchievementCategorySection.AchievementCard, {
          achievement: item,
          onPress: () => handleAchievementPress(item)
        }),
        estimatedItemSize: 120,
        keyExtractor: item => item.id,
        contentContainerStyle: {
          paddingBottom: 20
        },
        refreshing: isLoading,
        onRefresh: handleRefresh,
        ListEmptyComponent: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_AchievementCategorySection.EmptyState, {
          onStartSession: handleStartSession
        })
      })]
    });
  });
  AchievementsScreen.displayName = 'AchievementsScreen';
  const AchievementsScreenWithBoundary = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(AchievementsScreen, 'Achievements');
},3331,[2166,12,1286,2702,1359,1462,1489,3065,2691,2957,3570,1707,771,2052,3571,3572,3573,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useAchievementsByCategory = useAchievementsByCategory;
  exports.useAchievementsByRarity = useAchievementsByRarity;
  exports.useUnlockedAchievements = useUnlockedAchievements;
  exports.useLockedAchievements = useLockedAchievements;
  exports.useAchievementStats = useAchievementStats;
  var _hooks = require(_dependencyMap[0]);
  const categories = ['SESSION', 'STREAK', 'BOSS', 'SOCIAL', 'PROGRESSION', 'ECONOMY'];
  function useAchievementsByCategory(userId, category) {
    const {
      data,
      error,
      isLoading,
      isError
    } = (0, _hooks.useAchievements)(userId);
    const filteredData = data?.filter(a => a.category === category) ?? null;
    return {
      data: filteredData,
      error,
      isLoading,
      isError
    };
  }
  function useAchievementsByRarity(userId, rarity) {
    const {
      data,
      error,
      isLoading,
      isError
    } = (0, _hooks.useAchievements)(userId);
    const filteredData = data?.filter(a => a.rarity === rarity) ?? null;
    return {
      data: filteredData,
      error,
      isLoading,
      isError
    };
  }
  function useUnlockedAchievements(userId) {
    const {
      data,
      error,
      isLoading,
      isError
    } = (0, _hooks.useAchievements)(userId);
    const unlockedData = data?.filter(a => a.isUnlocked) ?? null;
    return {
      data: unlockedData,
      error,
      isLoading,
      isError
    };
  }
  function useLockedAchievements(userId) {
    const {
      data,
      error,
      isLoading,
      isError
    } = (0, _hooks.useAchievements)(userId);
    const lockedData = data?.filter(a => !a.isUnlocked) ?? null;
    return {
      data: lockedData,
      error,
      isLoading,
      isError
    };
  }
  function useAchievementStats(userId) {
    const {
      data,
      error,
      isLoading,
      isError
    } = (0, _hooks.useAchievements)(userId);
    if (!data) {
      return {
        data: null,
        error,
        isLoading,
        isError
      };
    }
    const total = data.length;
    const unlocked = data.filter(a => a.isUnlocked).length;
    const locked = total - unlocked;
    const completionPercentage = Math.round(unlocked / total * 100);
    const totalPoints = data.reduce((sum, a) => sum + a.pointValue, 0);
    const pointsEarned = data.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.pointValue, 0);
    const byCategory = categories.reduce((acc, cat) => {
      const catAchievements = data.filter(a => a.category === cat);
      acc[cat] = {
        total: catAchievements.length,
        unlocked: catAchievements.filter(a => a.isUnlocked).length
      };
      return acc;
    }, {});
    const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
    const byRarity = rarities.reduce((acc, rarity) => {
      const rarityAchievements = data.filter(a => a.rarity === rarity);
      acc[rarity] = {
        total: rarityAchievements.length,
        unlocked: rarityAchievements.filter(a => a.isUnlocked).length
      };
      return acc;
    }, {});
    return {
      data: {
        total,
        unlocked,
        locked,
        completionPercentage,
        totalPoints,
        pointsEarned,
        byCategory,
        byRarity
      },
      error,
      isLoading,
      isError
    };
  }
},3570,[2957]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "AchievementsHeader", {
    enumerable: true,
    get: function () {
      return AchievementsHeader;
    }
  });
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _theme = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  const AchievementsHeader = ({
    total,
    unlocked,
    totalPoints,
    pointsEarned
  }) => {
    const {
      theme
    } = (0, _theme.useTheme)();
    const percentage = total > 0 ? Math.round(unlocked / total * 100) : 0;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      p: 4,
      bg: theme.colors.background.secondary,
      mb: 4,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
            variant: "h2",
            color: theme.colors.text.primary,
            children: [unlocked, " / ", total]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: theme.colors.text.secondary,
            children: "Achievements Unlocked"
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          alignItems: "flex-end",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              style: {
                fontSize: 24
              },
              children: "\u2B50"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "h3",
              color: theme.colors.warning.DEFAULT,
              children: pointsEarned.toLocaleString()
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: theme.colors.text.secondary,
            children: ["/ ", totalPoints.toLocaleString(), " Points"]
          })]
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        mt: 4,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          height: 8,
          borderRadius: 4,
          bg: theme.colors.background.tertiary,
          style: {
            overflow: 'hidden'
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            height: "100%",
            borderRadius: 4,
            bg: theme.colors.success.DEFAULT,
            style: {
              width: `${percentage}%`
            }
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: theme.colors.text.tertiary,
          mt: 1,
          textAlign: "center",
          children: [percentage, "% Complete"]
        })]
      })]
    });
  };
},3571,[12,1462,1489,2691,203]);
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
  Object.defineProperty(exports, "CATEGORIES", {
    enumerable: true,
    get: function () {
      return CATEGORIES;
    }
  });
  Object.defineProperty(exports, "CategoryTabs", {
    enumerable: true,
    get: function () {
      return CategoryTabs;
    }
  });
  Object.defineProperty(exports, "FilterSortBar", {
    enumerable: true,
    get: function () {
      return FilterSortBar;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _shopifyFlashList = require(_dependencyMap[2]);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _theme = require(_dependencyMap[5]);
  var _themeTokensColors = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  const CATEGORIES = [{
    id: 'ALL',
    label: 'All',
    icon: '🏆'
  }, {
    id: 'SESSION',
    label: 'Session',
    icon: '📚'
  }, {
    id: 'STREAK',
    label: 'Streak',
    icon: '🔥'
  }, {
    id: 'BOSS',
    label: 'Boss',
    icon: '⚔️'
  }, {
    id: 'SOCIAL',
    label: 'Social',
    icon: '👥'
  }, {
    id: 'PROGRESSION',
    label: 'Progression',
    icon: '📈'
  }];
  const CategoryTabs = ({
    selected,
    onSelect
  }) => {
    const {
      theme
    } = (0, _theme.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      py: 2,
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_shopifyFlashList.FlashList, {
        data: CATEGORIES,
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        estimatedItemSize: 100,
        keyExtractor: item => item.id,
        renderItem: ({
          item
        }) => {
          const isSelected = selected === item.id;
          return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
            onPress: () => onSelect(item.id),
            accessibilityLabel: "Achievement filter",
            accessibilityRole: "button",
            accessibilityHint: "Double tap to activate",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
              px: 4,
              py: 2,
              mx: 2,
              borderRadius: 20,
              bg: isSelected ? theme.colors.primary[500] : theme.colors.background.tertiary,
              style: {
                opacity: isSelected ? 1 : 0.7
              },
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
                children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  style: {
                    fontSize: 16
                  },
                  children: item.icon
                }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  variant: "body",
                  color: isSelected ? _themeTokensColors.lightColors.text.inverse : theme.colors.text.secondary,
                  fontWeight: isSelected ? 'semibold' : 'normal',
                  children: item.label
                })]
              })
            })
          });
        }
      })
    });
  };
  const FilterSortBar = ({
    filter,
    onFilterChange,
    sort,
    onSortChange
  }) => {
    const {
      theme
    } = (0, _theme.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      px: 4,
      py: 2,
      style: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        gap: 2,
        children: ['ALL', 'UNLOCKED', 'LOCKED'].map(f => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          onPress: () => onFilterChange(f),
          accessibilityLabel: "Achievement filter",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            px: 3,
            py: 1,
            borderRadius: 12,
            bg: filter === f ? theme.colors.accent.purple : 'transparent',
            style: {
              borderWidth: 1,
              borderColor: filter === f ? theme.colors.primary[500] : theme.colors.border.DEFAULT
            },
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: filter === f ? _themeTokensColors.lightColors.text.inverse : theme.colors.text.secondary,
              children: f === 'ALL' ? 'All' : f === 'UNLOCKED' ? 'Unlocked' : 'Locked'
            })
          })
        }, f))
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: theme.colors.text.tertiary,
          children: "Sort:"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          onPress: () => {
            const sorts = ['RARITY', 'RECENT', 'CATEGORY'];
            const currentIndex = sorts.indexOf(sort);
            const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % sorts.length;
            onSortChange(sorts[nextIndex]);
          },
          accessibilityLabel: "Toggle sort order",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: theme.colors.primary[500],
              children: sort === 'RARITY' ? 'Rarity' : sort === 'RECENT' ? 'Recent' : 'Category'
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              style: {
                fontSize: 12
              },
              children: "\u2195\uFE0F"
            })]
          })
        })]
      })]
    });
  };
},3572,[12,1286,2702,1462,1489,2691,1465,203]);
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
  Object.defineProperty(exports, "AchievementCard", {
    enumerable: true,
    get: function () {
      return AchievementCard;
    }
  });
  Object.defineProperty(exports, "AchievementSkeletonCard", {
    enumerable: true,
    get: function () {
      return AchievementSkeletonCard;
    }
  });
  Object.defineProperty(exports, "EmptyState", {
    enumerable: true,
    get: function () {
      return EmptyState;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _sharedUiPrimitives = require(_dependencyMap[5]);
  var _theme = require(_dependencyMap[6]);
  var _featuresAchievementsDefinitions = require(_dependencyMap[7]);
  var _sharedUiPrimitivesEmptyStateVariants = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  const AchievementCard = ({
    achievement,
    onPress
  }) => {
    const {
      theme
    } = (0, _theme.useTheme)();
    const display = (0, _featuresAchievementsDefinitions.getAchievementDisplayInfo)(achievement, achievement.isUnlocked);
    const rarityColor = (0, _featuresAchievementsDefinitions.getRarityColor)(achievement.rarity);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
      onPress: onPress,
      style: ({
        pressed
      }) => [pressed && {
        opacity: 0.7
      }],
      accessibilityLabel: "Achievement category",
      accessibilityRole: "button",
      accessibilityHint: "Double tap to activate",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        entering: _reactNativeReanimated.FadeInUp.duration(200),
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          p: 4,
          mx: 4,
          my: 2,
          borderRadius: 16,
          bg: theme.colors.background.secondary,
          style: {
            borderWidth: 2,
            borderColor: achievement.isUnlocked ? rarityColor : theme.colors.border.DEFAULT,
            opacity: achievement.isUnlocked ? 1 : 0.7
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
              width: 56,
              height: 56,
              borderRadius: 28,
              bg: achievement.isUnlocked ? `${rarityColor}20` : theme.colors.background.tertiary,
              alignItems: "center",
              justifyContent: "center",
              style: {
                borderWidth: 2,
                borderColor: achievement.isUnlocked ? rarityColor : theme.colors.border.DEFAULT
              },
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                style: {
                  fontSize: 28,
                  opacity: achievement.isUnlocked ? 1 : 0.5
                },
                children: display.icon
              })
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
              flex: 1,
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
                mb: 1,
                children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  variant: "h4",
                  color: achievement.isUnlocked ? theme.colors.text.primary : theme.colors.text.tertiary,
                  numberOfLines: 1,
                  children: display.title
                }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
                  px: 2,
                  py: 0.5,
                  borderRadius: 4,
                  style: {
                    backgroundColor: `${rarityColor}30`
                  },
                  children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                    variant: "caption",
                    color: rarityColor,
                    fontWeight: "bold",
                    children: achievement.rarity
                  })
                })]
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "bodySmall",
                color: achievement.isUnlocked ? theme.colors.text.secondary : theme.colors.text.tertiary,
                numberOfLines: 2,
                children: display.description
              }), !achievement.isUnlocked && achievement.progress > 0 && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
                mt: 2,
                children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
                  height: 4,
                  borderRadius: 2,
                  bg: theme.colors.background.tertiary,
                  style: {
                    overflow: 'hidden'
                  },
                  children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
                    height: "100%",
                    borderRadius: 2,
                    bg: rarityColor,
                    style: {
                      width: `${achievement.completionPercentage}%`
                    }
                  })
                }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
                  variant: "caption",
                  color: theme.colors.text.tertiary,
                  mt: 1,
                  children: [achievement.progress, " / ", achievement.progressMax]
                })]
              }), achievement.isUnlocked && achievement.unlockedAt && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
                variant: "caption",
                color: theme.colors.success.DEFAULT,
                mt: 1,
                children: ["Unlocked ", new Date(achievement.unlockedAt).toLocaleDateString()]
              })]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
              alignItems: "center",
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "h4",
                color: rarityColor,
                children: achievement.pointValue
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "caption",
                color: theme.colors.text.tertiary,
                children: "pts"
              })]
            })]
          })
        })
      })
    });
  };
  const AchievementSkeletonCard = () => {
    const {
      theme
    } = (0, _theme.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      p: 4,
      mx: 4,
      my: 2,
      borderRadius: 16,
      bg: theme.colors.background.secondary,
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitives.Skeleton, {
          width: 56,
          height: 56
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flex: 1,
          gap: 2,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitives.Skeleton, {
            width: 120,
            height: 20
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitives.Skeleton, {
            width: 200,
            height: 14
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitives.Skeleton, {
          width: 40,
          height: 24
        })]
      })
    });
  };
  const EmptyState = ({
    onStartSession
  }) => {
    const {
      theme
    } = (0, _theme.useTheme)();
    if (onStartSession) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesEmptyStateVariants.EmptyAchievements, {
        onStartSession: onStartSession
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      p: 8,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        style: {
          fontSize: 64
        },
        children: "\uD83C\uDFC6"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "h3",
        color: theme.colors.text.secondary,
        textAlign: "center",
        mt: 4,
        children: "No achievements yet"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "body",
        color: theme.colors.text.tertiary,
        textAlign: "center",
        mt: 2,
        children: "Start your first focus session to begin collecting achievements!"
      })]
    });
  };
},3573,[12,1286,226,1462,1489,3065,2691,2958,3069,203]);
//# sourceMappingURL=/_expo/static/js/web/AchievementsScreen-75223adbd685d33ef7cb35ff7fbf8b8c.js.map
//# debugId=daad89ee-8cdb-498f-b9e6-f574e3f183b5