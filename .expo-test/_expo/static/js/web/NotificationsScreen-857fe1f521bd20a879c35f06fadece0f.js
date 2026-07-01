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
  Object.defineProperty(exports, "NotificationsScreen", {
    enumerable: true,
    get: function () {
      return NotificationsScreenWithBoundary;
    }
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return NotificationsScreen;
    }
  });
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[0]);
  var _react = require(_dependencyMap[1]);
  var React = _interopDefault(_react);
  var _utilsErrorSanitizer = require(_dependencyMap[2]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[3]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsRefreshControl = require(_dependencyMap[4]);
  var RefreshControl = _interopDefault(_reactNativeWebDistExportsRefreshControl);
  var _reactNativeSafeAreaContext = require(_dependencyMap[5]);
  var _shopifyFlashList = require(_dependencyMap[6]);
  var _reactNavigationNative = require(_dependencyMap[7]);
  var _themeThemeContext = require(_dependencyMap[8]);
  var _componentsPrimitivesBox = require(_dependencyMap[9]);
  var _componentsPrimitivesText = require(_dependencyMap[10]);
  var _NotificationStateViews = require(_dependencyMap[11]);
  var _NotificationComponents = require(_dependencyMap[12]);
  var _useNotificationsData = require(_dependencyMap[13]);
  var _reactJsxRuntime = require(_dependencyMap[14]);
  const NotificationsScreen = /*#__PURE__*/React.default.memo(() => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const insets = (0, _reactNativeSafeAreaContext.useSafeAreaInsets)();
    const {
      notifications,
      isLoading,
      isRefreshing,
      error,
      activeFilter,
      setActiveFilter,
      availableFilterTypes,
      unreadCount,
      listData,
      loadNotifications,
      handleMarkAllAsRead,
      handleNotificationPress,
      handleRefresh,
      formatTime
    } = (0, _useNotificationsData.useNotificationsData)();
    const handleOpenNotificationSettings = (0, _react.useCallback)(() => {
      navigation.navigate('Settings', {
        screen: 'NotificationSettings'
      });
    }, [navigation]);
    const bg = theme.colors.background.primary;
    const inset = insets.top;
    if (isLoading) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_NotificationStateViews.NotificationLoadingState, {
        insetsTop: inset,
        backgroundColor: bg
      });
    }
    if (error) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_NotificationStateViews.NotificationErrorState, {
        insetsTop: inset,
        backgroundColor: bg,
        message: (0, _utilsErrorSanitizer.sanitizeErrorMessage)(error),
        onRetry: () => loadNotifications()
      });
    }
    const header = /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      px: 20,
      pb: 12,
      pt: inset + 16,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 16,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h1",
          children: "Notifications"
        }), unreadCount > 0 && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          onPress: handleMarkAllAsRead,
          accessibilityLabel: "Mark all notifications as read",
          accessibilityRole: "button",
          accessibilityHint: "Marks all notifications as read",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            style: {
              color: theme.colors.primary[500]
            },
            children: "Mark all read"
          })
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_NotificationComponents.NotificationFilterBar, {
        availableFilterTypes: availableFilterTypes,
        activeFilter: activeFilter,
        onFilterChange: setActiveFilter,
        primaryColor: theme.colors.primary[500],
        secondaryBg: theme.colors.background.secondary,
        textSecondary: theme.colors.text.secondary
      })]
    });
    if (notifications.length === 0) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_NotificationStateViews.NotificationEmptyState, {
        backgroundColor: bg,
        headerElement: header,
        onAdjustSettings: handleOpenNotificationSettings
      });
    }
    if (listData.length === 0) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_NotificationStateViews.NotificationFilteredEmptyState, {
        backgroundColor: bg,
        headerElement: header,
        activeFilter: activeFilter
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      style: {
        backgroundColor: bg
      },
      children: [header, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_shopifyFlashList.FlashList, {
        data: listData,
        keyExtractor: (item, index) => item.type === 'header' ? `header-${item.title}-${index}` : item.data?.id ?? `item-${index}`,
        contentContainerStyle: {
          padding: 16,
          paddingTop: 0
        },
        estimatedItemSize: 80,
        renderItem: ({
          item
        }) => {
          if (item.type === 'header') {
            return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_NotificationComponents.NotificationSectionHeader, {
              title: item.title ?? '',
              count: item.count ?? 0
            });
          }
          return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_NotificationComponents.NotificationCard, {
            item: item.data // ponytail: notification type always has data
            ,
            onPress: handleNotificationPress,
            formatTime: formatTime,
            primaryColor: theme.colors.primary[500]
          });
        },
        refreshControl: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(RefreshControl.default, {
          refreshing: isRefreshing,
          onRefresh: handleRefresh,
          tintColor: theme.colors.primary[500]
        })
      })]
    });
  });
  NotificationsScreen.displayName = 'NotificationsScreen';
  const NotificationsScreenWithBoundary = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(NotificationsScreen, 'Notifications');
},3337,[2166,12,3058,1286,170,719,2702,1359,1463,1462,1489,3703,3705,3706,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.NotificationLoadingState = NotificationLoadingState;
  exports.NotificationErrorState = NotificationErrorState;
  exports.NotificationEmptyState = NotificationEmptyState;
  exports.NotificationFilteredEmptyState = NotificationFilteredEmptyState;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _sharedUiPrimitivesSkeleton = require(_dependencyMap[3]);
  var _componentsStatesErrorState = require(_dependencyMap[4]);
  var _sharedUiPrimitivesEmptyStateVariants = require(_dependencyMap[5]);
  var _NotificationScreenConfig = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function NotificationLoadingState({
    insetsTop,
    backgroundColor
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      style: {
        backgroundColor
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        px: 20,
        pb: 12,
        pt: insetsTop + 16,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          mb: 16,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
            width: 150,
            height: 28,
            variant: "text"
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          gap: 8,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
            width: 50,
            height: 28,
            variant: "rounded"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
            width: 80,
            height: 28,
            variant: "rounded"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
            width: 70,
            height: 28,
            variant: "rounded"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
            width: 60,
            height: 28,
            variant: "rounded"
          })]
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        px: 16,
        pt: 12,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.SkeletonList, {
          count: 6
        })
      })]
    });
  }
  function NotificationErrorState({
    insetsTop,
    backgroundColor,
    message,
    onRetry
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      style: {
        backgroundColor
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        px: 20,
        pb: 12,
        pt: insetsTop + 16,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h1",
          children: "Notifications"
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsStatesErrorState.ErrorState, {
        title: "Failed to load notifications",
        description: message,
        onRetry: onRetry,
        retryLabel: "Try Again"
      })]
    });
  }
  function NotificationEmptyState({
    backgroundColor,
    headerElement,
    onAdjustSettings
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      style: {
        backgroundColor
      },
      children: [headerElement, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesEmptyStateVariants.EmptyNotifications, {
        onAdjustSettings: onAdjustSettings
      })]
    });
  }
  function NotificationFilteredEmptyState({
    backgroundColor,
    headerElement,
    activeFilter
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      style: {
        backgroundColor
      },
      children: [headerElement, /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        px: 24,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          fontSize: 48,
          color: "text.tertiary",
          children: '\u{2315}'
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "h4",
          style: {
            marginTop: 16,
            textAlign: 'center'
          },
          children: ["No", ' ', activeFilter === 'all' ? '' : ` ${_NotificationScreenConfig.FILTER_LABELS[activeFilter] ?? activeFilter}`, ' ', "notifications"]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: "text.secondary",
          style: {
            marginTop: 8,
            textAlign: 'center'
          },
          children: "Try selecting a different filter"
        })]
      })]
    });
  }
},3703,[12,1462,1489,3061,2813,3069,3704,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "NOTIFICATION_CONFIG", {
    enumerable: true,
    get: function () {
      return NOTIFICATION_CONFIG;
    }
  });
  Object.defineProperty(exports, "NOTIFICATION_TYPE_TO_SAFE_ACTION", {
    enumerable: true,
    get: function () {
      return NOTIFICATION_TYPE_TO_SAFE_ACTION;
    }
  });
  Object.defineProperty(exports, "FILTER_LABELS", {
    enumerable: true,
    get: function () {
      return FILTER_LABELS;
    }
  });
  exports.groupNotificationsByTime = groupNotificationsByTime;
  exports.isNotificationTypeFilterable = isNotificationTypeFilterable;
  exports.mapToNotificationAction = mapToNotificationAction;
  var _featuresLiveopsConfigFeatureFlagService = require(_dependencyMap[0]);
  var _themeTokensColors = require(_dependencyMap[1]);
  const NOTIFICATION_CONFIG = {
    ACHIEVEMENT: {
      icon: '\u{1F3C6}',
      color: _themeTokensColors.lightColors.semantic.warning,
      bgColor: _themeTokensColors.lightColors.warning[50]
    },
    STREAK_RISK: {
      icon: '\u{1F525}',
      color: _themeTokensColors.lightColors.semantic.danger,
      bgColor: _themeTokensColors.lightColors.error[50]
    },
    BOSS: {
      icon: '\u{1F480}',
      color: _themeTokensColors.lightColors.accent.purple,
      bgColor: _themeTokensColors.lightColors.primary[50]
    },
    SQUAD: {
      icon: '\u{1F6E1}',
      color: _themeTokensColors.lightColors.accent.blue,
      bgColor: _themeTokensColors.lightColors.info[50]
    },
    RIVAL: {
      icon: '\u{2694}',
      color: _themeTokensColors.lightColors.semantic.danger,
      bgColor: _themeTokensColors.lightColors.error[50]
    },
    COACH: {
      icon: '\u{1F4AC}',
      color: _themeTokensColors.lightColors.semantic.success,
      bgColor: _themeTokensColors.lightColors.success[50]
    },
    REWARD: {
      icon: '\u{1F381}',
      color: _themeTokensColors.lightColors.semantic.warning,
      bgColor: _themeTokensColors.lightColors.warning[50]
    },
    LEVEL_UP: {
      icon: '\u{2B50}',
      color: _themeTokensColors.lightColors.accent.purple,
      bgColor: _themeTokensColors.lightColors.primary[50]
    }
  };
  const NOTIFICATION_TYPE_TO_SAFE_ACTION = {
    ACHIEVEMENT: 'view_progress',
    STREAK_RISK: 'view_streak',
    BOSS: 'view_boss',
    SQUAD: 'view_squad',
    RIVAL: 'join_duel',
    COACH: 'open_coach',
    REWARD: 'view_progress',
    LEVEL_UP: 'view_progress'
  };
  const FINAL_RELEASE_HIDDEN_NOTIFICATION_TYPES = ['SQUAD', 'RIVAL'];
  const FILTER_LABELS = {
    all: 'All',
    ACHIEVEMENT: 'Achievements',
    STREAK_RISK: 'Streaks',
    BOSS: 'Momentum',
    COACH: 'Coach',
    REWARD: 'Progress',
    LEVEL_UP: 'Levels'
  };
  function groupNotificationsByTime(notifications) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    return notifications.reduce((groups, notification) => {
      const date = new Date(notification.timestamp);
      const notificationDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (notificationDay.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notificationDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (notificationDay >= thisWeekStart) {
        groups.thisWeek.push(notification);
      } else {
        groups.earlier.push(notification);
      }
      return groups;
    }, {
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: []
    });
  }
  function isNotificationTypeFilterable(type, features) {
    if (FINAL_RELEASE_HIDDEN_NOTIFICATION_TYPES.includes(type)) {
      return false;
    }
    if (type === 'BOSS') {
      if ((0, _featuresLiveopsConfigFeatureFlagService.isFeatureHidden)('boss_tab')) {
        return false;
      }
      const bossAvailability = (0, _featuresLiveopsConfigFeatureFlagService.getFeatureAvailabilityFor)('boss_tab', features.boss_tab);
      return bossAvailability.canShowNotification || (0, _featuresLiveopsConfigFeatureFlagService.isFeatureAvailableForNavigation)(bossAvailability);
    }
    if (type === 'COACH') {
      if ((0, _featuresLiveopsConfigFeatureFlagService.isFeatureHidden)('ai_coach_advanced')) {
        return false;
      }
      const coachAvailability = (0, _featuresLiveopsConfigFeatureFlagService.getFeatureAvailabilityFor)('ai_coach_advanced', features.ai_coach_advanced);
      return coachAvailability.canShowNotification || (0, _featuresLiveopsConfigFeatureFlagService.isFeatureAvailableForNavigation)(coachAvailability);
    }
    return true;
  }
  function mapToNotificationAction(notification) {
    const type = notification.type;
    const mappedType = NOTIFICATION_TYPE_TO_SAFE_ACTION[type] ?? 'view_progress';
    return {
      type: mappedType,
      payload: notification.actionParams
    };
  }
},3704,[1963,1465]);
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
  exports.NotificationFilterBar = NotificationFilterBar;
  exports.NotificationCard = NotificationCard;
  exports.NotificationSectionHeader = NotificationSectionHeader;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitives = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _componentsAvatar = require(_dependencyMap[5]);
  var _themeTokensColors = require(_dependencyMap[6]);
  var _NotificationScreenConfig = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  function NotificationFilterBar({
    availableFilterTypes,
    activeFilter,
    onFilterChange,
    primaryColor,
    secondaryBg,
    textSecondary
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      flexDirection: "row",
      gap: 8,
      children: availableFilterTypes.map(filter => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
        style: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          backgroundColor: activeFilter === filter ? primaryColor : secondaryBg
        },
        onPress: () => onFilterChange(filter),
        accessibilityLabel: `Filter by ${_NotificationScreenConfig.FILTER_LABELS[filter] ?? filter}`,
        accessibilityRole: "button",
        accessibilityHint: `Show only ${_NotificationScreenConfig.FILTER_LABELS[filter] ?? filter} notifications`,
        accessibilityState: {
          selected: activeFilter === filter
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          style: {
            fontWeight: '600',
            color: activeFilter === filter ? _themeTokensColors.lightColors.text.inverse : textSecondary
          },
          children: _NotificationScreenConfig.FILTER_LABELS[filter] ?? filter
        })
      }, filter))
    });
  }
  function NotificationCard({
    item,
    onPress,
    formatTime,
    primaryColor
  }) {
    const config = _NotificationScreenConfig.NOTIFICATION_CONFIG[item.type];
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Card, {
      interactive: true,
      style: {
        opacity: item.read ? 0.8 : 1,
        backgroundColor: item.read ? undefined : _themeTokensColors.lightColors.surface.selected + '20'
      },
      size: "md",
      onPress: () => onPress(item),
      accessibilityLabel: `${item.title}: ${item.message}`,
      accessibilityRole: "button",
      accessibilityHint: `${item.read ? 'Read' : 'Unread'} notification. Tap to view details.`,
      accessibilityState: {
        selected: !item.read
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        alignItems: "flex-start",
        children: [item.avatar ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsAvatar.Avatar, {
          name: item.avatar,
          size: "md"
        }) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          width: 44,
          height: 44,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
          style: {
            backgroundColor: config.bgColor
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            fontSize: 20,
            color: config.color,
            children: config.icon
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flex: 1,
          ml: 12,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              style: {
                fontWeight: '600',
                flex: 1
              },
              children: item.title
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.tertiary",
              children: formatTime(item.timestamp)
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "bodySmall",
            color: "text.secondary",
            style: {
              marginTop: 2
            },
            children: item.message
          }), item.actionText && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Button, {
            variant: "ghost",
            size: "sm",
            style: {
              alignSelf: 'flex-start',
              marginTop: 4,
              paddingHorizontal: 0
            },
            accessibilityLabel: "Perform action",
            accessibilityRole: "button",
            accessibilityHint: "Double tap to activate",
            children: item.actionText
          })]
        }), !item.read && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          width: 8,
          height: 8,
          borderRadius: 4,
          ml: 8,
          mt: 6,
          style: {
            backgroundColor: primaryColor
          }
        })]
      })
    });
  }
  function NotificationSectionHeader({
    title,
    count
  }) {
    if (count === 0) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      px: 4,
      py: 8,
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "caption",
        color: "text.tertiary",
        style: {
          fontWeight: '600',
          textTransform: 'uppercase'
        },
        children: title
      })
    });
  }
},3705,[12,1286,1462,3048,1489,3076,1465,3704,203]);
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
  exports.useNotificationsData = useNotificationsData;
  var _react = require(_dependencyMap[0]);
  var _reactNavigationNative = require(_dependencyMap[1]);
  var _utilsDebug = require(_dependencyMap[2]);
  var _store = require(_dependencyMap[3]);
  var _featuresNotificationsService = require(_dependencyMap[4]);
  var notificationService = _interopNamespace(_featuresNotificationsService);
  var _navigationNotificationNavigator = require(_dependencyMap[5]);
  var _navigationNotificationFilters = require(_dependencyMap[6]);
  var _featuresLiveopsConfig = require(_dependencyMap[7]);
  var _featuresOnboardingStore = require(_dependencyMap[8]);
  var _NotificationScreenConfig = require(_dependencyMap[9]);
  const debug = (0, _utilsDebug.createDebugger)('notifications:screen');
  function useNotificationsData() {
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const {
      user
    } = (0, _store.useAuthStore)();
    const userId = user?.id ?? '';
    const disclosure = (0, _featuresLiveopsConfig.useFeatureAccess)();
    const motivationStyle = (0, _featuresOnboardingStore.useOnboardingStore)(state => state.explicitMotivationStyle);
    const [notifications, setNotifications] = (0, _react.useState)([]);
    const [isLoading, setIsLoading] = (0, _react.useState)(true);
    const [isRefreshing, setIsRefreshing] = (0, _react.useState)(false);
    const [error, setError] = (0, _react.useState)(null);
    const [activeFilter, setActiveFilter] = (0, _react.useState)('all');
    const availableFilterTypes = (0, _react.useMemo)(() => {
      const safeFilters = (0, _navigationNotificationFilters.getAvailableNotificationFilters)(disclosure.features);
      const types = ['all'];
      safeFilters.forEach(safeType => {
        const entry = Object.entries(_NotificationScreenConfig.NOTIFICATION_TYPE_TO_SAFE_ACTION).find(([, v]) => v === safeType);
        if (entry) {
          const notifType = entry[0];
          if ((0, _NotificationScreenConfig.isNotificationTypeFilterable)(notifType, disclosure.features)) {
            types.push(notifType);
          }
        }
      });
      return types;
    }, [disclosure.features]);
    const loadNotifications = (0, _react.useCallback)(async (showLoading = true) => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const result = await notificationService.getNotificationCenterItems(userId);
        setNotifications(result.items);
      } catch (err) {
        debug.error('Failed to load notifications', err);
        setError(err instanceof Error ? err : new Error('Failed to load notifications'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }, [userId]);
    (0, _react.useEffect)(() => {
      loadNotifications();
    }, [loadNotifications]);
    (0, _react.useEffect)(() => {
      if (!userId) {
        return;
      }
      return notificationService.subscribeToNotificationCenter(userId, () => loadNotifications(false));
    }, [userId, loadNotifications]);
    const filteredNotifications = (0, _react.useMemo)(() => activeFilter === 'all' ? notifications : notifications.filter(n => n.type === activeFilter), [notifications, activeFilter]);
    const grouped = (0, _react.useMemo)(() => (0, _NotificationScreenConfig.groupNotificationsByTime)(filteredNotifications), [filteredNotifications]);
    const unreadCount = (0, _react.useMemo)(() => notifications.filter(n => !n.read).length, [notifications]);
    const handleMarkAsRead = (0, _react.useCallback)(async id => {
      if (!userId) {
        return;
      }
      setNotifications(prev => prev.map(n => n.id === id ? Object.assign({}, n, {
        read: true
      }) : n));
      await notificationService.markNotificationRead(userId, id);
    }, [userId]);
    const handleMarkAllAsRead = (0, _react.useCallback)(async () => {
      if (!userId) {
        return;
      }
      setNotifications(prev => prev.map(n => Object.assign({}, n, {
        read: true
      })));
      await notificationService.markAllNotificationsRead(userId);
    }, [userId]);
    const handleNotificationPress = (0, _react.useCallback)(async notification => {
      if (!notification.read) {
        await handleMarkAsRead(notification.id);
      }
      const action = (0, _NotificationScreenConfig.mapToNotificationAction)(notification);
      const result = (0, _navigationNotificationNavigator.routeNotificationAction)(navigation, action, disclosure.features, motivationStyle);
      if (!result.success) {
        debug.warn('Notification routing blocked:', result.error);
      }
    }, [handleMarkAsRead, navigation, disclosure.features, motivationStyle]);
    const handleRefresh = (0, _react.useCallback)(() => {
      setIsRefreshing(true);
      loadNotifications(false);
    }, [loadNotifications]);
    const formatTime = (0, _react.useCallback)(timestamp => {
      const diff = Date.now() - new Date(timestamp).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) {
        return 'Just now';
      }
      if (mins < 60) {
        return `${mins}m ago`;
      }
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) {
        return `${hrs}h ago`;
      }
      const days = Math.floor(hrs / 24);
      if (days < 7) {
        return `${days}d ago`;
      }
      return new Date(timestamp).toLocaleDateString();
    }, []);
    const listData = (0, _react.useMemo)(() => {
      const items = [];
      const addGroup = (title, data) => {
        if (data.length > 0) {
          items.push({
            type: 'header',
            title,
            count: data.length
          });
          data.forEach(n => items.push({
            type: 'notification',
            data: n
          }));
        }
      };
      addGroup('Today', grouped.today);
      addGroup('Yesterday', grouped.yesterday);
      addGroup('This Week', grouped.thisWeek);
      addGroup('Earlier', grouped.earlier);
      return items;
    }, [grouped]);
    return {
      notifications,
      isLoading,
      isRefreshing,
      error,
      activeFilter,
      setActiveFilter,
      availableFilterTypes,
      unreadCount,
      listData,
      loadNotifications,
      handleMarkAllAsRead,
      handleNotificationPress,
      handleRefresh,
      formatTime
    };
  }
},3706,[12,1359,823,1705,3707,2050,2056,1956,1892,3704]);
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
  exports.getUnreadNotificationsCount = getUnreadNotificationsCount;
  exports.dispatchUrgencyNotification = dispatchUrgencyNotification;
  exports.registerPushToken = registerPushToken;
  exports.getNotificationCenterItems = getNotificationCenterItems;
  exports.markNotificationRead = markNotificationRead;
  exports.markAllNotificationsRead = markAllNotificationsRead;
  exports.subscribeToNotificationCenter = subscribeToNotificationCenter;
  var _zod = require(_dependencyMap[0]);
  var _eventsEventBus = require(_dependencyMap[1]);
  var _repository = require(_dependencyMap[2]);
  var repository = _interopNamespace(_repository);
  var _serviceHelpers = require(_dependencyMap[3]);
  var _notificationRules = require(_dependencyMap[4]);
  const UserIdSchema = _zod.z.string().min(1);
  const UnreadNotificationsCountSchema = _zod.z.number().int().nonnegative();
  async function getUnreadNotificationsCount(userId) {
    const validatedUserId = UserIdSchema.parse(userId);
    const count = await repository.fetchUnreadNotificationsCount(validatedUserId);
    return UnreadNotificationsCountSchema.parse(count);
  }
  async function dispatchUrgencyNotification(context, userTimezone = 'UTC', quietStart = 22, quietEnd = 8) {
    if ((0, _serviceHelpers.isQuietHours)(userTimezone, quietStart, quietEnd)) {
      return {
        sent: false,
        reason: 'quiet_hours',
        deferred: true,
        nextWindow: (0, _serviceHelpers.getNextNotificationWindow)(userTimezone, quietEnd)
      };
    }
    const limit = (0, _serviceHelpers.checkDailyNotificationLimit)(context.userId);
    if (!limit.canSend) {
      return {
        sent: false,
        reason: 'daily_limit_reached'
      };
    }
    const evaluation = (0, _notificationRules.evaluateNotificationRules)(context);
    if (!evaluation.shouldSend) {
      return {
        sent: false,
        reason: 'no_urgent_context'
      };
    }
    _eventsEventBus.eventBus.publish('notification:send', {
      userId: context.userId,
      type: 'URGENCY',
      title: evaluation.notification?.title ?? 'VEX',
      body: evaluation.notification?.body ?? 'You have an update waiting.',
      priority: 'high'
    });
    (0, _serviceHelpers.recordNotificationSent)(context.userId);
    return {
      sent: true
    };
  }
  const PushTokenInputSchema = _zod.z.object({
    userId: _zod.z.string().uuid(),
    token: _zod.z.string().min(1),
    platform: _zod.z.string().min(1)
  }).strict();
  async function registerPushToken(input) {
    const tokenInput = PushTokenInputSchema.parse(input);
    await repository.upsertPushToken(tokenInput.userId, tokenInput.token, tokenInput.platform);
  }
  async function getNotificationCenterItems(userId, cursor) {
    const validatedUserId = UserIdSchema.parse(userId);
    return repository.fetchNotificationCenterItems(validatedUserId, cursor);
  }
  async function markNotificationRead(userId, notificationId) {
    await repository.markNotificationRead(UserIdSchema.parse(userId), _zod.z.string().min(1).parse(notificationId));
  }
  async function markAllNotificationsRead(userId) {
    await repository.markAllNotificationsRead(UserIdSchema.parse(userId));
  }
  function subscribeToNotificationCenter(userId, onChange) {
    return repository.subscribeToNotificationCenter(UserIdSchema.parse(userId), onChange);
  }
},3707,[1774,1849,3708,3715,3716]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "RepositoryError", {
    enumerable: true,
    get: function () {
      return _repositoryShared.RepositoryError;
    }
  });
  Object.defineProperty(exports, "supabase", {
    enumerable: true,
    get: function () {
      return _repositoryShared.supabase;
    }
  });
  Object.defineProperty(exports, "fetchUnreadNotificationsCount", {
    enumerable: true,
    get: function () {
      return _repositoryNotifications.fetchUnreadNotificationsCount;
    }
  });
  Object.defineProperty(exports, "fetchNotificationCenterItems", {
    enumerable: true,
    get: function () {
      return _repositoryNotifications.fetchNotificationCenterItems;
    }
  });
  Object.defineProperty(exports, "markNotificationRead", {
    enumerable: true,
    get: function () {
      return _repositoryNotifications.markNotificationRead;
    }
  });
  Object.defineProperty(exports, "markAllNotificationsRead", {
    enumerable: true,
    get: function () {
      return _repositoryNotifications.markAllNotificationsRead;
    }
  });
  Object.defineProperty(exports, "subscribeToNotificationCenter", {
    enumerable: true,
    get: function () {
      return _repositoryNotifications.subscribeToNotificationCenter;
    }
  });
  Object.defineProperty(exports, "fetchRetentionUserProfile", {
    enumerable: true,
    get: function () {
      return _repositoryRetention.fetchRetentionUserProfile;
    }
  });
  Object.defineProperty(exports, "upsertReminderPlan", {
    enumerable: true,
    get: function () {
      return _repositoryRetention.upsertReminderPlan;
    }
  });
  Object.defineProperty(exports, "hasScheduledReminderWithin", {
    enumerable: true,
    get: function () {
      return _repositoryRetention.hasScheduledReminderWithin;
    }
  });
  Object.defineProperty(exports, "fetchChallengeExpiryCandidates", {
    enumerable: true,
    get: function () {
      return _repositoryRetention.fetchChallengeExpiryCandidates;
    }
  });
  Object.defineProperty(exports, "fetchReEngagementCandidates", {
    enumerable: true,
    get: function () {
      return _repositoryRetention.fetchReEngagementCandidates;
    }
  });
  Object.defineProperty(exports, "upsertPushToken", {
    enumerable: true,
    get: function () {
      return _repositoryPush.upsertPushToken;
    }
  });
  Object.defineProperty(exports, "fetchCompletedSessionsInWindow", {
    enumerable: true,
    get: function () {
      return _repositoryScheduler.fetchCompletedSessionsInWindow;
    }
  });
  Object.defineProperty(exports, "fetchCompletedSessionDurationsSince", {
    enumerable: true,
    get: function () {
      return _repositoryScheduler.fetchCompletedSessionDurationsSince;
    }
  });
  Object.defineProperty(exports, "fetchCurrentStreak", {
    enumerable: true,
    get: function () {
      return _repositoryScheduler.fetchCurrentStreak;
    }
  });
  Object.defineProperty(exports, "fetchActiveBossEncounter", {
    enumerable: true,
    get: function () {
      return _repositoryScheduler.fetchActiveBossEncounter;
    }
  });
  Object.defineProperty(exports, "fetchActiveRival", {
    enumerable: true,
    get: function () {
      return _repositoryScheduler.fetchActiveRival;
    }
  });
  Object.defineProperty(exports, "fetchActiveComebackQuest", {
    enumerable: true,
    get: function () {
      return _repositoryScheduler.fetchActiveComebackQuest;
    }
  });
  Object.defineProperty(exports, "fetchWeeklyLeaderboard", {
    enumerable: true,
    get: function () {
      return _repositoryScheduler.fetchWeeklyLeaderboard;
    }
  });
  Object.defineProperty(exports, "fetchNotificationCountToday", {
    enumerable: true,
    get: function () {
      return _repositoryScheduler.fetchNotificationCountToday;
    }
  });
  Object.defineProperty(exports, "recordNotificationSend", {
    enumerable: true,
    get: function () {
      return _repositoryScheduler.recordNotificationSend;
    }
  });
  Object.defineProperty(exports, "fetchNotificationEnabledUsers", {
    enumerable: true,
    get: function () {
      return _repositoryScheduler.fetchNotificationEnabledUsers;
    }
  });
  var _repositoryShared = require(_dependencyMap[0]);
  var _repositoryNotifications = require(_dependencyMap[1]);
  var _repositoryRetention = require(_dependencyMap[2]);
  var _repositoryPush = require(_dependencyMap[3]);
  var _repositoryScheduler = require(_dependencyMap[4]);
},3708,[3709,3710,3712,3713,3714]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "RepositoryError", {
    enumerable: true,
    get: function () {
      return _libRepositoryErrorHandling.RepositoryError;
    }
  });
  Object.defineProperty(exports, "supabase", {
    enumerable: true,
    get: function () {
      return _configSupabase.supabase;
    }
  });
  var _libRepositoryErrorHandling = require(_dependencyMap[0]);
  var _configSupabase = require(_dependencyMap[1]);
},3709,[2064,1726]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.fetchUnreadNotificationsCount = fetchUnreadNotificationsCount;
  exports.fetchNotificationCenterItems = fetchNotificationCenterItems;
  exports.markNotificationRead = markNotificationRead;
  exports.markAllNotificationsRead = markAllNotificationsRead;
  exports.subscribeToNotificationCenter = subscribeToNotificationCenter;
  var _zod = require(_dependencyMap[0]);
  var _schemas = require(_dependencyMap[1]);
  var _shared = require(_dependencyMap[2]);
  const UnreadNotificationsCountSchema = _zod.z.number().int().nonnegative();
  function isBootstrapReadError(error) {
    return error.status === 401 || error.status === 406 || /permission denied|row-level security/i.test(error.message ?? '');
  }
  async function fetchUnreadNotificationsCount(userId) {
    const {
      count,
      error
    } = await _shared.supabase.from('notifications').select('*', {
      count: 'exact',
      head: true
    }).eq('user_id', userId).eq('read', false);
    if (error) {
      if (isBootstrapReadError(error)) {
        return 0;
      }
      throw new _shared.RepositoryError('fetchUnreadNotificationsCount', error);
    }
    return UnreadNotificationsCountSchema.parse(count ?? 0);
  }
  function getObjectField(data, key) {
    if (data === null || Array.isArray(data) || typeof data !== 'object') {
      return undefined;
    }
    return data[key];
  }
  function getStringField(data, key) {
    const value = getObjectField(data, key);
    return typeof value === 'string' ? value : undefined;
  }
  function getObjectParamField(data, key) {
    const value = getObjectField(data, key);
    return value !== null && !Array.isArray(value) && typeof value === 'object' ? value : undefined;
  }
  function mapNotificationRow(row) {
    const rawType = String(row.type || '').toUpperCase();
    const parsed = _schemas.NotificationCenterItemSchema.shape.type.safeParse(rawType);
    return _schemas.NotificationCenterItemSchema.parse({
      id: String(row.id),
      type: parsed.success ? parsed.data : 'COACH',
      title: String(row.title || ''),
      message: String(row.body || ''),
      timestamp: Date.parse(row.created_at),
      read: row.read,
      avatar: getStringField(row.data, 'avatar'),
      actionText: getStringField(row.data, 'actionText'),
      actionRoute: getStringField(row.data, 'actionRoute'),
      actionParams: getObjectParamField(row.data, 'actionParams')
    });
  }
  async function fetchNotificationCenterItems(userId, cursor) {
    let query = _shared.supabase.from('notifications').select('id,type,title,body,created_at,read,data').eq('user_id', userId).order('created_at', {
      ascending: false
    });
    if (cursor) {
      query = query.lt('created_at', cursor);
    }
    const {
      data,
      error
    } = await query.limit(100);
    if (error) {
      if (isBootstrapReadError(error)) {
        return {
          items: [],
          nextCursor: null
        };
      }
      throw new _shared.RepositoryError('fetchNotificationCenterItems', error);
    }
    const items = (data ?? []).map(row => mapNotificationRow(row));
    // Use raw DB created_at for cursor — it is an ISO timestamp string that
    // matches the .lt('created_at', cursor) filter. Using the mapped numeric
    // timestamp would produce a mismatched cursor.
    const lastRow = data?.[data.length - 1];
    const nextCursor = items.length === 100 && lastRow?.created_at != null ? String(lastRow.created_at) : null;
    return {
      items,
      nextCursor
    };
  }
  async function markNotificationRead(userId, notificationId) {
    const {
      error
    } = await _shared.supabase.from('notifications').update({
      read: true
    }).eq('id', notificationId).eq('user_id', userId);
    if (error) {
      throw new _shared.RepositoryError('markNotificationRead', error);
    }
  }
  async function markAllNotificationsRead(userId) {
    const {
      error
    } = await _shared.supabase.from('notifications').update({
      read: true,
      updated_at: new Date().toISOString()
    }).eq('user_id', userId).eq('read', false);
    if (error) {
      throw new _shared.RepositoryError('markAllNotificationsRead', error);
    }
  }

  /**
   * Tracks active notification channels and subscriber counts per userId.
   * Keyed by userId, holds channel + subscriber count + callback set.
   */

  const activeNotificationChannels = new Map();
  function subscribeToNotificationCenter(userId, onChange) {
    const existing = activeNotificationChannels.get(userId);
    if (existing) {
      // Channel already exists — add this subscriber's callback and bump ref
      existing.callbacks.add(onChange);
      existing.refCount++;
      return () => {
        existing.callbacks.delete(onChange);
        existing.refCount--;
        if (existing.refCount <= 0) {
          existing.channel.unsubscribe();
          activeNotificationChannels.delete(userId);
        }
      };
    }
    const channelName = `notifications-screen:${userId}`;
    const channel = _shared.supabase.channel(channelName).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, () => {
      // Notify all active subscribers
      const entry = activeNotificationChannels.get(userId);
      if (entry) {
        entry.callbacks.forEach(cb => cb());
      }
    }).subscribe();
    activeNotificationChannels.set(userId, {
      channel,
      refCount: 1,
      callbacks: new Set([onChange])
    });
    return () => {
      const entry = activeNotificationChannels.get(userId);
      if (!entry) {
        return;
      }
      entry.callbacks.delete(onChange);
      entry.refCount--;
      if (entry.refCount <= 0) {
        entry.channel.unsubscribe();
        activeNotificationChannels.delete(userId);
      }
    };
  }
},3710,[1774,3711,3709]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "RetentionReminderTypeSchema", {
    enumerable: true,
    get: function () {
      return RetentionReminderTypeSchema;
    }
  });
  Object.defineProperty(exports, "ReminderMetadataSchema", {
    enumerable: true,
    get: function () {
      return ReminderMetadataSchema;
    }
  });
  Object.defineProperty(exports, "ReminderPlanInputSchema", {
    enumerable: true,
    get: function () {
      return ReminderPlanInputSchema;
    }
  });
  Object.defineProperty(exports, "ReminderPlanRowSchema", {
    enumerable: true,
    get: function () {
      return ReminderPlanRowSchema;
    }
  });
  Object.defineProperty(exports, "RetentionUserProfileSchema", {
    enumerable: true,
    get: function () {
      return RetentionUserProfileSchema;
    }
  });
  Object.defineProperty(exports, "ChallengeExpiryCandidateSchema", {
    enumerable: true,
    get: function () {
      return ChallengeExpiryCandidateSchema;
    }
  });
  Object.defineProperty(exports, "NotificationCenterTypeSchema", {
    enumerable: true,
    get: function () {
      return NotificationCenterTypeSchema;
    }
  });
  Object.defineProperty(exports, "NotificationCenterItemSchema", {
    enumerable: true,
    get: function () {
      return NotificationCenterItemSchema;
    }
  });
  var _zod = require(_dependencyMap[0]);
  const RetentionReminderTypeSchema = _zod.z.enum(['RETENTION_ONBOARDING_DAY_1', 'RETENTION_ONBOARDING_DAY_3', 'RETENTION_ONBOARDING_DAY_7', 'RETENTION_STREAK_PROTECTION', 'RETENTION_RE_ENGAGEMENT', 'RETENTION_CHALLENGE_EXPIRY']);
  const ReminderMetadataSchema = _zod.z.record(_zod.z.unknown());
  const ReminderPlanInputSchema = _zod.z.object({
    userId: _zod.z.string().uuid(),
    type: RetentionReminderTypeSchema,
    scheduledFor: _zod.z.number().int().positive(),
    message: _zod.z.string().min(1).max(500),
    metadata: ReminderMetadataSchema
  }).strict();
  const ReminderPlanRowSchema = _zod.z.object({
    id: _zod.z.string().uuid(),
    user_id: _zod.z.string().uuid(),
    reminder_type: RetentionReminderTypeSchema,
    scheduled_for: _zod.z.number().int().positive(),
    delivery_method: _zod.z.enum(['IN_APP', 'PUSH', 'BOTH', 'DEFERRED']).default('BOTH'),
    status: _zod.z.enum(['SCHEDULED', 'DELIVERED', 'FAILED', 'CANCELLED']),
    context: _zod.z.object({
      message: _zod.z.string().min(1).max(500),
      metadata: ReminderMetadataSchema
    }).passthrough(),
    created_at: _zod.z.number().int().positive(),
    updated_at: _zod.z.number().int().positive().optional()
  }).passthrough();
  const RetentionUserProfileSchema = _zod.z.object({
    id: _zod.z.string().uuid(),
    firstName: _zod.z.string().nullable()
  }).strict();
  const ChallengeExpiryCandidateSchema = _zod.z.object({
    userId: _zod.z.string().uuid(),
    challengeId: _zod.z.string().min(1),
    title: _zod.z.string().min(1),
    currentValue: _zod.z.number().nonnegative(),
    targetValue: _zod.z.number().positive(),
    expiresAt: _zod.z.number().int().positive()
  }).strict();
  const NotificationCenterTypeSchema = _zod.z.enum(['ACHIEVEMENT', 'STREAK_RISK', 'BOSS', 'SQUAD', 'RIVAL', 'COACH', 'REWARD', 'LEVEL_UP']);
  const NotificationCenterItemSchema = _zod.z.object({
    id: _zod.z.string().min(1),
    type: NotificationCenterTypeSchema,
    title: _zod.z.string(),
    message: _zod.z.string(),
    timestamp: _zod.z.number().int(),
    read: _zod.z.boolean(),
    avatar: _zod.z.string().optional(),
    actionText: _zod.z.string().optional(),
    actionRoute: _zod.z.string().optional(),
    actionParams: _zod.z.record(_zod.z.unknown()).optional()
  }).strict();
},3711,[1774]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.fetchRetentionUserProfile = fetchRetentionUserProfile;
  exports.upsertReminderPlan = upsertReminderPlan;
  exports.hasScheduledReminderWithin = hasScheduledReminderWithin;
  exports.fetchChallengeExpiryCandidates = fetchChallengeExpiryCandidates;
  exports.fetchReEngagementCandidates = fetchReEngagementCandidates;
  var _zod = require(_dependencyMap[0]);
  var _schemas = require(_dependencyMap[1]);
  var _utilsUuid = require(_dependencyMap[2]);
  var _shared = require(_dependencyMap[3]);
  async function fetchRetentionUserProfile(userId) {
    const {
      data,
      error
    } = await _shared.supabase.from('users').select('id, first_name').eq('id', userId).maybeSingle();
    if (error) {
      throw new _shared.RepositoryError('fetchRetentionUserProfile', error);
    }
    return _schemas.RetentionUserProfileSchema.parse({
      id: userId,
      firstName: typeof data?.first_name === 'string' ? data.first_name : null
    });
  }
  async function upsertReminderPlan(input) {
    const reminder = _schemas.ReminderPlanInputSchema.parse(input);
    const now = Date.now();
    const {
      data,
      error
    } = await _shared.supabase.from('reminder_plans').upsert({
      id: (0, _utilsUuid.v4)(),
      user_id: reminder.userId,
      reminder_type: reminder.type,
      scheduled_for: reminder.scheduledFor,
      delivery_method: 'BOTH',
      status: 'SCHEDULED',
      context: {
        message: reminder.message,
        metadata: reminder.metadata
      },
      created_at: now,
      updated_at: now
    }, {
      onConflict: 'user_id,reminder_type'
    }).select('id,user_id,reminder_type,scheduled_for,delivery_method,status,context,created_at,updated_at').single();
    if (error) {
      throw new _shared.RepositoryError('upsertReminderPlan', error);
    }
    return _schemas.ReminderPlanRowSchema.parse(data);
  }
  async function hasScheduledReminderWithin(userId, before) {
    const {
      data,
      error
    } = await _shared.supabase.from('reminder_plans').select('id').eq('user_id', userId).eq('status', 'SCHEDULED').gte('scheduled_for', Date.now()).lte('scheduled_for', before).limit(1);
    if (error) {
      throw new _shared.RepositoryError('hasScheduledReminderWithin', error);
    }
    return (data ?? []).length > 0;
  }

  /** Zod schema for the raw Supabase user_challenges joined row. */
  const ChallengeExpiryRowSchema = _zod.z.object({
    user_id: _zod.z.string().optional(),
    challenge_id: _zod.z.string().optional(),
    current_value: _zod.z.number().optional(),
    expires_at: _zod.z.string().optional(),
    challenges: _zod.z.object({
      title: _zod.z.string().optional(),
      target_value: _zod.z.number().optional()
    }).passthrough().nullable().or(_zod.z.array(_zod.z.object({
      title: _zod.z.string().optional(),
      target_value: _zod.z.number().optional()
    }).passthrough())).optional()
  }).passthrough();

  // ChallengeJoin type derived from ChallengeExpiryRow['challenges'] when needed

  /** Shape of a Supabase streaks row for re-engagement candidates. */

  async function fetchChallengeExpiryCandidates(userId) {
    const now = new Date();
    const nextDay = new Date(now.getTime() + 86400000);
    const {
      data,
      error
    } = await _shared.supabase.from('user_challenges').select('user_id, challenge_id, current_value, expires_at, challenges(title, target_value)').eq('user_id', userId).eq('status', 'ACTIVE').gt('current_value', 0).gt('expires_at', now.toISOString()).lt('expires_at', nextDay.toISOString());
    if (error) {
      throw new _shared.RepositoryError('fetchChallengeExpiryCandidates', error);
    }
    return (data ?? []).map(row => {
      const record = ChallengeExpiryRowSchema.parse(row);
      const challenge = Array.isArray(record.challenges) ? record.challenges[0] : record.challenges;
      const challengeRecord = typeof challenge === 'object' && challenge !== null ? challenge : {};
      return _schemas.ChallengeExpiryCandidateSchema.parse({
        userId: record.user_id,
        challengeId: record.challenge_id,
        title: challengeRecord.title,
        currentValue: record.current_value,
        targetValue: challengeRecord.target_value,
        expiresAt: Date.parse(String(record.expires_at))
      });
    });
  }
  async function fetchReEngagementCandidates(cutoff) {
    const {
      data,
      error
    } = await _shared.supabase.from('streaks').select('user_id, current_days, longest_days, last_qualifying_session_at').not('last_qualifying_session_at', 'is', null).lt('last_qualifying_session_at', cutoff).gt('longest_days', 0);
    if (error) {
      throw new _shared.RepositoryError('fetchReEngagementCandidates', error);
    }
    const result = [];
    for (const row of data ?? []) {
      const record = row;
      const lastSessionAt = Number(record.last_qualifying_session_at);
      const currentDays = Number(record.current_days ?? 0);
      const longestDays = Number(record.longest_days ?? 0);
      const userId = String(record.user_id);
      if (userId.length > 0 && Number.isFinite(lastSessionAt)) {
        result.push({
          userId,
          lastSessionAt,
          previousStreak: Math.max(currentDays, longestDays)
        });
      }
    }
    return result;
  }
},3712,[1774,3711,1864,3709]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.upsertPushToken = upsertPushToken;
  var _shared = require(_dependencyMap[0]);
  async function upsertPushToken(userId, token, platform) {
    const {
      error
    } = await _shared.supabase.from('push_tokens').upsert({
      user_id: userId,
      token,
      platform,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });
    if (error) {
      throw new _shared.RepositoryError('upsertPushToken', error);
    }
  }
},3713,[3709]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.fetchCompletedSessionsInWindow = fetchCompletedSessionsInWindow;
  exports.fetchCompletedSessionDurationsSince = fetchCompletedSessionDurationsSince;
  exports.fetchCurrentStreak = fetchCurrentStreak;
  exports.fetchActiveBossEncounter = fetchActiveBossEncounter;
  exports.fetchActiveRival = fetchActiveRival;
  exports.fetchActiveComebackQuest = fetchActiveComebackQuest;
  exports.fetchWeeklyLeaderboard = fetchWeeklyLeaderboard;
  exports.fetchNotificationCountToday = fetchNotificationCountToday;
  exports.recordNotificationSend = recordNotificationSend;
  exports.fetchNotificationEnabledUsers = fetchNotificationEnabledUsers;
  var _configSupabase = require(_dependencyMap[0]);
  var _shared = require(_dependencyMap[1]);
  /**
   * Scheduler Repository — Data access for Smart Notification Scheduler.
   *
   * All Supabase queries used by the scheduler live here.
   * Business logic stays in the scheduler service files.
   */

  async function fetchCompletedSessionsInWindow(userId, fromDate) {
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      data,
      error
    } = await supabase.from('sessions').select('started_at, timezone').eq('user_id', userId).eq('status', 'COMPLETED').gte('started_at', fromDate.toISOString()).order('started_at', {
      ascending: false
    });
    if (error) {
      throw new _shared.RepositoryError('fetchCompletedSessionsInWindow', error);
    }
    return data ?? [];
  }
  async function fetchCompletedSessionDurationsSince(userId, sinceDate) {
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      data,
      error
    } = await supabase.from('sessions').select('duration_seconds').eq('user_id', userId).eq('status', 'COMPLETED').gte('completed_at', sinceDate.toISOString());
    if (error) {
      throw new _shared.RepositoryError('fetchCompletedSessionDurationsSince', error);
    }
    return data ?? [];
  }
  async function fetchCurrentStreak(userId) {
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      data,
      error
    } = await supabase.from('user_streaks').select('current_streak').eq('user_id', userId).single();
    if (error) {
      return null;
    }
    return data;
  }
  async function fetchActiveBossEncounter(userId) {
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      data,
      error
    } = await supabase.from('boss_encounters').select('boss_name, current_health, max_health').eq('user_id', userId).eq('status', 'ACTIVE').order('created_at', {
      ascending: false
    }).limit(1).maybeSingle();
    if (error) {
      return null;
    }
    return data;
  }
  async function fetchActiveRival(userId) {
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      data,
      error
    } = await supabase.from('rivals').select('rival_name, rival_minutes, my_minutes').eq('user_id', userId).eq('is_active', true).maybeSingle();
    if (error) {
      return null;
    }
    return data;
  }
  async function fetchActiveComebackQuest(userId) {
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      data,
      error
    } = await supabase.from('comeback_quests').select('stage, days_absent').eq('user_id', userId).eq('all_quests_completed', false).order('created_at', {
      ascending: false
    }).limit(1).maybeSingle();
    if (error) {
      return null;
    }
    return data;
  }
  async function fetchWeeklyLeaderboard() {
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      data,
      error
    } = await supabase.from('weekly_leaderboard').select('user_id, focus_minutes').order('focus_minutes', {
      ascending: false
    });
    if (error) {
      throw new _shared.RepositoryError('fetchWeeklyLeaderboard', error);
    }
    return data ?? [];
  }
  async function fetchNotificationCountToday(userId, todayStart) {
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      count,
      error
    } = await supabase.from('notification_rate_limits').select('count', {
      count: 'exact',
      head: true
    }).eq('user_id', userId).gte('sent_at', todayStart.toISOString());
    if (error) {
      return 0;
    }
    return count ?? 0;
  }
  async function recordNotificationSend(userId, notificationType) {
    const supabase = (0, _configSupabase.getSupabaseClient)();
    await supabase.from('notification_rate_limits').insert({
      user_id: userId,
      notification_type: notificationType,
      sent_at: new Date().toISOString()
    });
  }
  async function fetchNotificationEnabledUsers() {
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      data,
      error
    } = await supabase.from('users').select('id, timezone').eq('notifications_enabled', true);
    if (error) {
      throw new _shared.RepositoryError('fetchNotificationEnabledUsers', error);
    }
    return data ?? [];
  }
},3714,[1726,3709]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.isQuietHours = isQuietHours;
  exports.getNextNotificationWindow = getNextNotificationWindow;
  exports.checkDailyNotificationLimit = checkDailyNotificationLimit;
  exports.recordNotificationSent = recordNotificationSent;
  exports.createRivalSessionNotification = createRivalSessionNotification;
  exports.createSquadNudgeNotification = createSquadNudgeNotification;
  exports.createSquadMilestoneNotification = createSquadMilestoneNotification;
  exports.createFeedReactionNotification = createFeedReactionNotification;
  var _persistenceMMKVStorageAdapter = require(_dependencyMap[0]);
  const MAX_NOTIFICATIONS_PER_DAY = 2;
  const notificationLimitStorage = new _persistenceMMKVStorageAdapter.MMKVStorageAdapter('notification-limits');
  const DEFAULT_QUIET_START_HOUR = 22;
  const DEFAULT_QUIET_END_HOUR = 8;
  function isQuietHours(userTimezone = 'UTC', quietStart = DEFAULT_QUIET_START_HOUR, quietEnd = DEFAULT_QUIET_END_HOUR) {
    const now = new Date();
    const userTime = new Date(now.toLocaleString('en-US', {
      timeZone: userTimezone
    }));
    const hour = userTime.getHours();
    if (quietStart <= quietEnd) {
      return hour >= quietStart && hour < quietEnd;
    }
    return hour >= quietStart || hour < quietEnd;
  }
  function getNextNotificationWindow(userTimezone = 'UTC', quietEnd = DEFAULT_QUIET_END_HOUR) {
    const now = new Date();
    const userTime = new Date(now.toLocaleString('en-US', {
      timeZone: userTimezone
    }));
    const nextWindow = new Date(userTime);
    nextWindow.setHours(quietEnd, 0, 0, 0);
    if (userTime.getHours() >= quietEnd) {
      nextWindow.setDate(nextWindow.getDate() + 1);
    }
    return nextWindow;
  }
  function checkDailyNotificationLimit(userId) {
    const key = `notifications:${userId}:${new Date().toDateString()}`;
    const raw = notificationLimitStorage.getItemSync(key);
    const count = raw ? Number.parseInt(raw, 10) : 0;
    const safeCount = Number.isFinite(count) ? count : 0;
    return {
      canSend: safeCount < MAX_NOTIFICATIONS_PER_DAY,
      remaining: Math.max(0, MAX_NOTIFICATIONS_PER_DAY - safeCount)
    };
  }
  function recordNotificationSent(userId) {
    const key = `notifications:${userId}:${new Date().toDateString()}`;
    const raw = notificationLimitStorage.getItemSync(key);
    const count = raw ? Number.parseInt(raw, 10) : 0;
    const safeCount = Number.isFinite(count) ? count : 0;
    notificationLimitStorage.setItemSync(key, String(safeCount + 1));
  }
  function createRivalSessionNotification(rivalName, sessionMinutes, currentDiff) {
    const diffText = currentDiff === 0 ? "You're tied now!" : currentDiff > 0 ? `Still ahead by ${currentDiff} min` : `${Math.abs(currentDiff)} min behind`;
    return {
      title: `${rivalName} just focused for ${sessionMinutes} min`,
      body: `${diffText} — start a session to stay in the lead!`
    };
  }
  function createSquadNudgeNotification(nudgerName, squadName, squadStreak) {
    return {
      title: `⚡ ${nudgerName} nudged you!`,
      body: `From ${squadName}: Your squad's ${squadStreak}-day streak depends on you. Start a quick session?`
    };
  }
  function createSquadMilestoneNotification(squadName, milestoneDays, bonusXp) {
    return {
      title: `🔥 ${squadName} Milestone!`,
      body: `Your squad hit a ${milestoneDays}-day streak! You all earned a ${bonusXp} XP bonus!`
    };
  }
  function createFeedReactionNotification(reactorName, reactionEmoji, postTitle) {
    return {
      title: `${reactorName} reacted ${reactionEmoji}`,
      body: `To your post: "${postTitle.substring(0, 50)}${postTitle.length > 50 ? '...' : ''}"`
    };
  }
},3715,[1717]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.shouldNotifyStreakAtRisk = shouldNotifyStreakAtRisk;
  exports.shouldNotifyBossEscape = shouldNotifyBossEscape;
  exports.shouldNotifySquadStreakAtRisk = shouldNotifySquadStreakAtRisk;
  exports.shouldNotifyRivalAhead = shouldNotifyRivalAhead;
  exports.shouldNotifyChestFull = shouldNotifyChestFull;
  exports.shouldNotifyChallengeExpiring = shouldNotifyChallengeExpiring;
  exports.shouldNotifySeasonEnding = shouldNotifySeasonEnding;
  exports.evaluateNotificationRules = evaluateNotificationRules;
  function shouldNotifyStreakAtRisk(context) {
    const {
      streakRisk
    } = context;
    if (!streakRisk || streakRisk.hoursRemaining > 12) {
      return {
        shouldSend: false,
        priority: 0,
        message: {
          title: '',
          body: ''
        }
      };
    }
    const urgency = streakRisk.riskLevel === 'CRITICAL' ? '🚨 LAST CHANCE' : streakRisk.riskLevel === 'HIGH' ? '⚠️ Streak at Risk' : '⏰ Streak Warning';
    return {
      shouldSend: true,
      priority: streakRisk.riskLevel === 'CRITICAL' ? 10 : 8,
      message: {
        title: urgency,
        body: `Your 🔥 ${streakRisk.streakDays}-day streak ends in ${streakRisk.hoursRemaining} hours! Start a session now.`
      }
    };
  }
  function shouldNotifyBossEscape(context) {
    const {
      bossEscape
    } = context;
    if (!bossEscape || bossEscape.hoursRemaining > 4) {
      return {
        shouldSend: false,
        priority: 0,
        message: {
          title: '',
          body: ''
        }
      };
    }
    return {
      shouldSend: true,
      priority: 9,
      message: {
        title: '👹 Boss Escaping Soon!',
        body: `${bossEscape.bossName} has ${bossEscape.healthPercent.toFixed(0)}% health and escapes in ${bossEscape.hoursRemaining}h! Defeat them now!`
      }
    };
  }
  function shouldNotifySquadStreakAtRisk(context) {
    const {
      squadStreak
    } = context;
    if (!squadStreak) {
      return {
        shouldSend: false,
        priority: 0,
        message: {
          title: '',
          body: ''
        }
      };
    }
    return {
      shouldSend: true,
      priority: 7,
      message: {
        title: '🔥 Squad Streak at Risk!',
        body: `${squadStreak.atRiskMemberName} hasn't focused today — your ${squadStreak.streakDays}-day squad streak is at risk!`
      }
    };
  }
  function shouldNotifyRivalAhead(context) {
    const {
      rivalUpdate
    } = context;
    if (!rivalUpdate || rivalUpdate.myScore >= rivalUpdate.theirScore) {
      return {
        shouldSend: false,
        priority: 0,
        message: {
          title: '',
          body: ''
        }
      };
    }
    const diff = rivalUpdate.theirScore - rivalUpdate.myScore;
    return {
      shouldSend: true,
      priority: 6,
      message: {
        title: '⚔️ Rival Alert!',
        body: `${rivalUpdate.rivalName} just focused for ${rivalUpdate.theirNewSessionMinutes} min. You're ${diff} min behind this week!`
      }
    };
  }
  function shouldNotifyChestFull(context) {
    const {
      chestStatus
    } = context;
    if (!chestStatus || chestStatus.unopenedCount < chestStatus.maxCapacity) {
      return {
        shouldSend: false,
        priority: 0,
        message: {
          title: '',
          body: ''
        }
      };
    }
    return {
      shouldSend: true,
      priority: 5,
      message: {
        title: '🎁 Chests Full!',
        body: `Your chest inventory is full (${chestStatus.unopenedCount}/${chestStatus.maxCapacity}). Open one to make room for more!`
      }
    };
  }
  function shouldNotifyChallengeExpiring(context) {
    const {
      challengeExpiry
    } = context;
    if (!challengeExpiry || challengeExpiry.hoursRemaining > 2 || challengeExpiry.progressPercent >= 50) {
      return {
        shouldSend: false,
        priority: 0,
        message: {
          title: '',
          body: ''
        }
      };
    }
    return {
      shouldSend: true,
      priority: 4,
      message: {
        title: '⏰ Challenge Ending!',
        body: `"${challengeExpiry.challengeName}" expires in ${challengeExpiry.hoursRemaining}h and you're only ${challengeExpiry.progressPercent}% complete!`
      }
    };
  }
  function shouldNotifySeasonEnding(context) {
    const {
      seasonEnding
    } = context;
    if (!seasonEnding || seasonEnding.hoursRemaining > 24 || seasonEnding.unclaimedTiers === 0) {
      return {
        shouldSend: false,
        priority: 0,
        message: {
          title: '',
          body: ''
        }
      };
    }
    return {
      shouldSend: true,
      priority: 8,
      message: {
        title: '🌙 Season Ending!',
        body: `Season ends in ${Math.floor(seasonEnding.hoursRemaining)} hours! You have ${seasonEnding.unclaimedTiers} unclaimed reward tiers!`
      }
    };
  }
  function evaluateNotificationRules(context) {
    const rules = [shouldNotifyStreakAtRisk(context), shouldNotifyBossEscape(context), shouldNotifySquadStreakAtRisk(context), shouldNotifyRivalAhead(context), shouldNotifyChestFull(context), shouldNotifyChallengeExpiring(context), shouldNotifySeasonEnding(context)];
    const sendable = rules.filter(r => r.shouldSend);
    if (sendable.length === 0) {
      return {
        shouldSend: false
      };
    }
    sendable.sort((a, b) => b.priority - a.priority);
    const top = sendable[0];
    return {
      shouldSend: true,
      notification: Object.assign({}, top.message, {
        priority: top.priority
      })
    };
  }
},3716,[]);