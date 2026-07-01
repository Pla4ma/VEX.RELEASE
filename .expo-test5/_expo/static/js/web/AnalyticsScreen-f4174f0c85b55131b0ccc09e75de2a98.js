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
  Object.defineProperty(exports, "AnalyticsScreen", {
    enumerable: true,
    get: function () {
      return AnalyticsScreenWithBoundary;
    }
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return AnalyticsScreen;
    }
  });
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[0]);
  var _react = require(_dependencyMap[1]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNavigationNative = require(_dependencyMap[3]);
  var _featuresAnalyticsComponentsAnalyticsDashboard = require(_dependencyMap[4]);
  var _sharedMonetizationUseRevenuecat = require(_dependencyMap[5]);
  var _store = require(_dependencyMap[6]);
  var _themeThemeContext = require(_dependencyMap[7]);
  var _componentsUiSkeleton = require(_dependencyMap[8]);
  var _sharedUiCreateSheet = require(_dependencyMap[9]);
  var _reactJsxRuntime = require(_dependencyMap[10]);
  function AnalyticsScreen() {
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      user
    } = (0, _store.useAuthStore)();
    const {
      isPremium,
      isLoading
    } = (0, _sharedMonetizationUseRevenuecat.usePremiumStatus)();
    const hasRedirectedRef = (0, _react.useRef)(false);
    (0, _react.useEffect)(() => {
      if (!user || isLoading || isPremium || hasRedirectedRef.current) {
        return;
      }
      hasRedirectedRef.current = true;
      navigation.replace('Paywall', {
        source: 'analytics_screen',
        gatedFeature: 'advanced_analytics'
      });
    }, [isLoading, isPremium, navigation, user]);
    if (!user || isLoading || !isPremium) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: [styles.container, {
          backgroundColor: theme.colors.background.primary
        }],
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: styles.header,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
            width: 180,
            height: 28
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
            width: 40,
            height: 40,
            variant: "circular"
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: styles.statsRow,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
            width: "30%",
            height: 80,
            variant: "rounded"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
            width: "30%",
            height: 80,
            variant: "rounded"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
            width: "30%",
            height: 80,
            variant: "rounded"
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: styles.chart,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
            width: "100%",
            height: 180,
            variant: "rounded"
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.SkeletonList, {
          count: 4,
          itemHeight: 60
        })]
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresAnalyticsComponentsAnalyticsDashboard.AnalyticsDashboard, {
      userId: user.id
    });
  }
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 60
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24
    },
    chart: {
      marginBottom: 24
    }
  });
  const AnalyticsScreenWithBoundary = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(AnalyticsScreen, 'Analytics');
},3332,[2166,12,80,1359,3574,3115,1705,1463,1676,1678,203]);
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
  exports.AnalyticsDashboard = AnalyticsDashboard;
  var _utilsSilentFailure = require(_dependencyMap[0]);
  var _react = require(_dependencyMap[1]);
  var React = _interopDefault(_react);
  var _reactNativeWebDistExportsRefreshControl = require(_dependencyMap[2]);
  var RefreshControl = _interopDefault(_reactNativeWebDistExportsRefreshControl);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[3]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _reactNativeWebDistExportsText = require(_dependencyMap[4]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[5]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsView = require(_dependencyMap[6]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _tanstackReactQuery = require(_dependencyMap[7]);
  var _sentryReactNative = require(_dependencyMap[8]);
  var Sentry = _interopNamespace(_sentryReactNative);
  var _utilsSentryPrivacy = require(_dependencyMap[9]);
  var _errorsErrorBoundary = require(_dependencyMap[10]);
  var _eventsEventBus = require(_dependencyMap[11]);
  var _hooksUseAnalyticsQueries = require(_dependencyMap[12]);
  var _hooksAnalyticsKeys = require(_dependencyMap[13]);
  var _MetricSelector = require(_dependencyMap[14]);
  var _TimeRangeFilter = require(_dependencyMap[15]);
  var _themeTokensColors = require(_dependencyMap[16]);
  var _DashboardContent = require(_dependencyMap[17]);
  var _AnalyticsDashboardStyles = require(_dependencyMap[18]);
  var _AnalyticsDashboardHelpers = require(_dependencyMap[19]);
  var _reactJsxRuntime = require(_dependencyMap[20]);
  // Memoize refresh control outside render to avoid JSX-as-prop re-creation
  const DashboardRefreshControl = /*#__PURE__*/React.default.memo(function DashboardRefreshControl({
    isRefreshing,
    onRefresh
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(RefreshControl.default, {
      refreshing: isRefreshing,
      onRefresh: onRefresh,
      tintColor: _themeTokensColors.lightColors.semantic.primary
    });
  });
  function AnalyticsDashboard({
    userId,
    initialMetrics = ['sessions_completed', 'xp_earned'],
    initialTimeRange = 'last_7_days',
    onInsightPress,
    onExportPress,
    onSettingsPress
  }) {
    const queryClient = (0, _tanstackReactQuery.useQueryClient)();
    const [selectedMetrics, setSelectedMetrics] = (0, _react.useState)(initialMetrics);
    const [timeRange, setTimeRange] = (0, _react.useState)(initialTimeRange);
    const [isRefreshing, setIsRefreshing] = (0, _react.useState)(false);
    const [error, setError] = (0, _react.useState)(null);
    const weeks = (0, _react.useMemo)(() => (0, _AnalyticsDashboardHelpers.timeRangeToWeeks)(timeRange), [timeRange]);
    const analyticsMetrics = selectedMetrics;
    const {
      data: analyticsData,
      isLoading: dataLoading,
      isError: dataError,
      error: dataErrorObj,
      refetch: refetchData
    } = (0, _hooksUseAnalyticsQueries.useAnalyticsData)(userId, analyticsMetrics, timeRange, 'day', {
      dimensions: [],
      filters: []
    });
    const {
      data: heatmapData,
      isLoading: heatmapLoading,
      isError: heatmapError,
      refetch: refetchHeatmap
    } = (0, _hooksUseAnalyticsQueries.useSessionHeatmapData)(userId, weeks);
    const {
      data: insights,
      isLoading: insightsLoading
    } = (0, _hooksUseAnalyticsQueries.useInsights)(userId, {
      limit: 5
    });
    const prevDataErrorRef = (0, _react.useRef)(dataError);
    const prevDataErrorObjRef = (0, _react.useRef)(dataErrorObj);

    // SAFETY: error-to-error-state mapping must run as effect because setError
    // is a side-effect; error state propagates from data-fetch failure to UI state.
    React.default.useEffect(() => {
      if (dataError !== prevDataErrorRef.current || dataErrorObj !== prevDataErrorObjRef.current) {
        prevDataErrorRef.current = dataError;
        prevDataErrorObjRef.current = dataErrorObj;
        if (dataError && dataErrorObj) {
          const analyticsError = dataErrorObj instanceof Error ? dataErrorObj : new Error('Unknown error');
          setError({
            title: 'Failed to load analytics',
            message: analyticsError.message,
            recoverable: true,
            action: () => {
              refetchData();
            }
          });
        }
      }
    }, [dataError, dataErrorObj, refetchData]);

    // SAFETY: Sentry error capture is a fire-and-forget side effect; must run
    // from an effect when data-fetch errors change.
    React.default.useEffect(() => {
      if (!dataError || !dataErrorObj) {
        return;
      }
      const analyticsError = dataErrorObj instanceof Error ? dataErrorObj : new Error('Unknown error');
      Sentry.captureException(analyticsError, {
        tags: {
          component: 'AnalyticsDashboard',
          operation: 'fetchData'
        },
        extra: {
          userId: (0, _utilsSentryPrivacy.hashUserId)(userId),
          timeRange,
          metrics: selectedMetrics
        }
      });
    }, [dataError, dataErrorObj, userId, timeRange, selectedMetrics]);

    // Compute dashboard state with useMemo instead of useEffect + useState
    const state = (0, _react.useMemo)(() => {
      if (dataLoading || insightsLoading) {
        return 'loading';
      }
      if (dataError) {
        return 'error';
      }
      if (!analyticsData || analyticsData.length === 0) {
        return 'empty';
      }
      if (analyticsData.some(entry => entry.points.length === 0)) {
        return 'partial';
      }
      return 'ready';
    }, [analyticsData, dataError, dataLoading, insightsLoading]);
    const handleRefresh = (0, _react.useCallback)(async () => {
      setIsRefreshing(true);
      try {
        await Promise.all([refetchData(), refetchHeatmap(), queryClient.invalidateQueries({
          queryKey: _hooksAnalyticsKeys.analyticsKeys.insights(userId)
        })]);
        Sentry.addBreadcrumb({
          category: 'analytics_dashboard',
          message: 'Dashboard refreshed',
          level: 'info'
        });
      } catch (err) {
        (0, _utilsSilentFailure.captureSilentFailure)(err, {
          feature: 'analytics',
          operation: 'ui-fallback',
          type: 'ui'
        });
      } finally {
        setIsRefreshing(false);
      }
    }, [queryClient, refetchData, refetchHeatmap, userId]);
    const handleMetricsChange = (0, _react.useCallback)(metrics => {
      if (metrics.length > 0 && metrics.length <= 10) {
        setSelectedMetrics(metrics);
        Sentry.addBreadcrumb({
          category: 'analytics_dashboard',
          message: 'Metrics changed',
          level: 'info',
          data: {
            metrics
          }
        });
      }
    }, []);
    const handleTimeRangeChange = (0, _react.useCallback)(range => {
      setTimeRange(range);
      Sentry.addBreadcrumb({
        category: 'analytics_dashboard',
        message: 'Time range changed',
        level: 'info',
        data: {
          range
        }
      });
    }, []);
    const handleInsightPress = (0, _react.useCallback)(insightId => {
      onInsightPress?.(insightId);
      // SAFETY: event publishing is a fire-and-forget side effect; publishing via
      // eventBus from a callback is the expected React pattern for user-driven events.
      _eventsEventBus.eventBus.publish('analytics:insight_read', {
        userId,
        insightId
      });
    }, [onInsightPress, userId]);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: _AnalyticsDashboardStyles.styles.container,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _AnalyticsDashboardStyles.styles.header,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: _AnalyticsDashboardStyles.styles.headerTitle,
          children: "Analytics"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: _AnalyticsDashboardStyles.styles.headerActions,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
            style: ({
              pressed
            }) => [_AnalyticsDashboardStyles.styles.iconButton, pressed && {
              opacity: 0.8
            }],
            onPress: onExportPress,
            accessibilityRole: "button",
            accessibilityLabel: "Export analytics data",
            accessibilityHint: "Double tap to select",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: _AnalyticsDashboardStyles.styles.iconButtonText,
              children: "EXP"
            })
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
            style: ({
              pressed
            }) => [_AnalyticsDashboardStyles.styles.iconButton, pressed && {
              opacity: 0.8
            }],
            onPress: onSettingsPress,
            accessibilityRole: "button",
            accessibilityLabel: "Open analytics settings",
            accessibilityHint: "Double tap to select",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: _AnalyticsDashboardStyles.styles.iconButtonText,
              children: "SET"
            })
          })]
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _AnalyticsDashboardStyles.styles.filtersContainer,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_TimeRangeFilter.TimeRangeFilter, {
          selected: timeRange,
          onChange: handleTimeRangeChange
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_MetricSelector.MetricSelector, {
          selected: analyticsMetrics,
          onChange: handleMetricsChange,
          maxSelection: 5,
          disabled: state === 'loading' || isRefreshing
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(ScrollView.default, {
        style: _AnalyticsDashboardStyles.styles.scrollView,
        contentContainerStyle: _AnalyticsDashboardStyles.styles.scrollContent,
        refreshControl: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(DashboardRefreshControl, {
          isRefreshing: isRefreshing,
          onRefresh: handleRefresh
        }),
        showsVerticalScrollIndicator: false,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_errorsErrorBoundary.ErrorBoundary, {
          onReset: handleRefresh,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_DashboardContent.DashboardContent, {
            state: state,
            analyticsData: analyticsData,
            heatmapData: heatmapData,
            heatmapLoading: heatmapLoading,
            heatmapError: heatmapError,
            error: error,
            insights: insights,
            userId: userId,
            onInsightPress: handleInsightPress
          })
        })
      })]
    });
  }
},3574,[1477,12,170,171,493,1286,80,771,834,1983,1461,1849,3136,3163,3575,3577,1465,3578,3582,3581,203]);
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
  exports.MetricSelector = MetricSelector;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsText = require(_dependencyMap[2]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _reactNativeWebDistExportsModal = require(_dependencyMap[3]);
  var Modal = _interopDefault(_reactNativeWebDistExportsModal);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[4]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[5]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _metricSelectorStyles = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  const AVAILABLE_METRICS = [{
    value: 'sessions_completed',
    label: 'Sessions Completed',
    category: 'Sessions'
  }, {
    value: 'sessions_abandoned',
    label: 'Sessions Abandoned',
    category: 'Sessions'
  }, {
    value: 'total_focus_time',
    label: 'Total Focus Time',
    category: 'Sessions'
  }, {
    value: 'average_session_duration',
    label: 'Avg Session Duration',
    category: 'Sessions'
  }, {
    value: 'streak_days',
    label: 'Streak Days',
    category: 'Progress'
  }, {
    value: 'longest_streak',
    label: 'Longest Streak',
    category: 'Progress'
  }, {
    value: 'xp_earned',
    label: 'XP Earned',
    category: 'Progress'
  }, {
    value: 'level_progression',
    label: 'Level Progression',
    category: 'Progress'
  }, {
    value: 'boss_damage_dealt',
    label: 'Focus Intensity',
    category: 'Combat'
  }, {
    value: 'items_crafted',
    label: 'Items Crafted',
    category: 'Economy'
  }, {
    value: 'coins_spent',
    label: 'Coins Spent',
    category: 'Economy'
  }, {
    value: 'challenges_completed',
    label: 'Challenges Completed',
    category: 'Social'
  }];
  function MetricSelector({
    selected,
    onChange,
    maxSelection = 5,
    disabled
  }) {
    const [modalVisible, setModalVisible] = (0, _react.useState)(false);
    const groupedMetrics = AVAILABLE_METRICS.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category]?.push(metric); // ponytail: asserted non-null by set-if-missing guard above
      return acc;
    }, {});
    const toggleMetric = metric => {
      if (selected.includes(metric)) {
        onChange(selected.filter(m => m !== metric));
      } else if (selected.length < maxSelection) {
        onChange([...selected, metric]);
      }
    };
    const isSelected = metric => selected.includes(metric);
    const canSelectMore = selected.length < maxSelection;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: _metricSelectorStyles.styles.container,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Text.default, {
        style: _metricSelectorStyles.styles.label,
        children: ["Metrics (", selected.length, "/", maxSelection, ")"]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Pressable.default, {
        style: ({
          pressed
        }) => [_metricSelectorStyles.styles.selector, disabled && _metricSelectorStyles.styles.selectorDisabled, pressed && {
          opacity: 0.8
        }],
        onPress: () => !disabled && setModalVisible(true),
        disabled: disabled,
        accessibilityLabel: "Metric selector",
        accessibilityRole: "button",
        accessibilityHint: "Double tap to select",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: _metricSelectorStyles.styles.selectedContainer,
          children: selected.length === 0 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: _metricSelectorStyles.styles.placeholder,
            children: "Select metrics..."
          }) : /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Text.default, {
            style: _metricSelectorStyles.styles.selectedChipText,
            children: [selected.length, " selected:", ' ', selected.map(metric => AVAILABLE_METRICS.find(m => m.value === metric)?.label || metric).join(', ')]
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: _metricSelectorStyles.styles.chevron,
          children: "\u25BC"
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Modal.default, {
        visible: modalVisible,
        transparent: true,
        animationType: "slide",
        onRequestClose: () => setModalVisible(false),
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          style: _metricSelectorStyles.styles.overlay,
          onPress: () => setModalVisible(false),
          accessibilityLabel: "Metric selector",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to select",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: _metricSelectorStyles.styles.modalContent,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
              style: _metricSelectorStyles.styles.modalHeader,
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
                style: _metricSelectorStyles.styles.modalTitle,
                children: "Select Metrics"
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
                onPress: () => setModalVisible(false),
                style: ({
                  pressed
                }) => [pressed && {
                  opacity: 0.8
                }],
                accessibilityLabel: "Done selecting metrics",
                accessibilityRole: "button",
                accessibilityHint: "Double tap to select",
                children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
                  style: _metricSelectorStyles.styles.closeButton,
                  children: "Done"
                })
              })]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(ScrollView.default, {
              style: _metricSelectorStyles.styles.modalScroll,
              children: Object.entries(groupedMetrics).map(([category, metrics]) => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
                style: _metricSelectorStyles.styles.categorySection,
                children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
                  style: _metricSelectorStyles.styles.categoryTitle,
                  children: category
                }), metrics.map(metric => {
                  const selected_metric = isSelected(metric.value);
                  const disabled_metric = !selected_metric && !canSelectMore;
                  return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Pressable.default, {
                    style: ({
                      pressed
                    }) => [_metricSelectorStyles.styles.metricOption, selected_metric && _metricSelectorStyles.styles.metricOptionSelected, disabled_metric && _metricSelectorStyles.styles.metricOptionDisabled, pressed && {
                      opacity: 0.8
                    }],
                    onPress: () => toggleMetric(metric.value),
                    disabled: disabled_metric,
                    accessibilityLabel: "Metric selector",
                    accessibilityRole: "button",
                    accessibilityHint: "Double tap to select",
                    children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
                      style: [_metricSelectorStyles.styles.checkbox, selected_metric && _metricSelectorStyles.styles.checkboxSelected],
                      children: selected_metric && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
                        style: _metricSelectorStyles.styles.checkmark,
                        children: "\u2713"
                      })
                    }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
                      style: [_metricSelectorStyles.styles.metricLabel, selected_metric && _metricSelectorStyles.styles.metricLabelSelected, disabled_metric && _metricSelectorStyles.styles.metricLabelDisabled],
                      children: metric.label
                    })]
                  }, metric.value);
                })]
              }, category))
            })]
          })
        })
      })]
    });
  }
},3575,[12,80,493,1279,171,1286,3576,203]);
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
      marginVertical: 8
    },
    label: {
      fontSize: 12,
      fontWeight: '500',
      color: _themeTokensColors.lightColors.text.muted,
      marginBottom: 8,
      marginLeft: 4
    },
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 8,
      backgroundColor: _themeTokensColors.lightColors.surface.button,
      borderWidth: 1,
      borderColor: _themeTokensColors.lightColors.border.light
    },
    selectorDisabled: {
      opacity: 0.5
    },
    selectedContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      flex: 1,
      gap: 6
    },
    selectedChip: {
      backgroundColor: _themeTokensColors.lightColors.primary[50],
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12
    },
    selectedChipText: {
      fontSize: 12,
      color: _themeTokensColors.lightColors.semantic.primaryPressed,
      fontWeight: '500'
    },
    placeholder: {
      color: _themeTokensColors.lightColors.text.muted,
      fontSize: 14
    },
    chevron: {
      fontSize: 12,
      color: _themeTokensColors.lightColors.text.muted,
      marginLeft: 8
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end'
    },
    modalContent: {
      backgroundColor: _themeTokensColors.lightColors.text.inverse,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%'
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: _themeTokensColors.lightColors.border.light
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: _themeTokensColors.lightColors.semantic.backgroundMuted
    },
    closeButton: {
      fontSize: 16,
      color: _themeTokensColors.lightColors.semantic.primary,
      fontWeight: '500'
    },
    modalScroll: {
      padding: 16
    },
    categorySection: {
      marginBottom: 20
    },
    categoryTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: _themeTokensColors.lightColors.text.muted,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },
    metricOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 6
    },
    metricOptionSelected: {
      backgroundColor: _themeTokensColors.lightColors.surface.button
    },
    metricOptionDisabled: {
      opacity: 0.4
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: _themeTokensColors.lightColors.border.light,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center'
    },
    checkboxSelected: {
      backgroundColor: _themeTokensColors.lightColors.semantic.primary,
      borderColor: _themeTokensColors.lightColors.semantic.primary
    },
    checkmark: {
      color: _themeTokensColors.lightColors.text.inverse,
      fontSize: 12,
      fontWeight: '700'
    },
    metricLabel: {
      fontSize: 14,
      color: _themeTokensColors.lightColors.text.muted
    },
    metricLabelSelected: {
      color: _themeTokensColors.lightColors.semantic.backgroundMuted,
      fontWeight: '500'
    },
    metricLabelDisabled: {
      color: _themeTokensColors.lightColors.text.muted
    }
  });
},3576,[1678,1465]);
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
  exports.TimeRangeFilter = TimeRangeFilter;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsText = require(_dependencyMap[2]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[3]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[4]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _sharedUiCreateSheet = require(_dependencyMap[5]);
  var _themeTokensColors = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  /**
   * Time Range Filter Component
   * Allows users to select time periods for analytics views
   */

  const TIME_RANGES = [{
    value: 'today',
    label: 'Today',
    shortLabel: '1D'
  }, {
    value: 'yesterday',
    label: 'Yesterday',
    shortLabel: 'YD'
  }, {
    value: 'last_7_days',
    label: 'Last 7 Days',
    shortLabel: '7D'
  }, {
    value: 'last_30_days',
    label: 'Last 30 Days',
    shortLabel: '30D'
  }, {
    value: 'this_week',
    label: 'This Week',
    shortLabel: 'TW'
  }, {
    value: 'last_week',
    label: 'Last Week',
    shortLabel: 'LW'
  }, {
    value: 'this_month',
    label: 'This Month',
    shortLabel: 'TM'
  }, {
    value: 'last_month',
    label: 'Last Month',
    shortLabel: 'LM'
  }, {
    value: 'this_year',
    label: 'This Year',
    shortLabel: 'TY'
  }, {
    value: 'all_time',
    label: 'All Time',
    shortLabel: 'ALL'
  }];
  function TimeRangeFilter({
    selected,
    onChange,
    disabled
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: styles.container,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: styles.label,
        children: "Time Period"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(ScrollView.default, {
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        contentContainerStyle: styles.scrollContent,
        children: TIME_RANGES.map(range => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          style: ({
            pressed
          }) => [styles.chip, selected === range.value && styles.chipActive, disabled && styles.chipDisabled, pressed && !disabled && {
            opacity: 0.8
          }],
          onPress: () => onChange(range.value),
          disabled: disabled,
          accessibilityRole: "button",
          accessibilityLabel: range.label,
          accessibilityState: {
            selected: selected === range.value
          },
          accessibilityHint: "Double tap to select",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [styles.chipText, selected === range.value && styles.chipTextActive, disabled && styles.chipTextDisabled],
            children: range.shortLabel
          })
        }, range.value))
      })]
    });
  }
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      marginVertical: 8
    },
    label: {
      fontSize: 12,
      fontWeight: '500',
      color: _themeTokensColors.lightColors.text.muted,
      marginBottom: 8,
      marginLeft: 4
    },
    scrollContent: {
      paddingHorizontal: 4,
      gap: 8
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: _themeTokensColors.lightColors.surface.button,
      borderWidth: 1,
      borderColor: _themeTokensColors.lightColors.border.light,
      marginRight: 8
    },
    chipActive: {
      backgroundColor: _themeTokensColors.lightColors.semantic.primary,
      borderColor: _themeTokensColors.lightColors.semantic.primary
    },
    chipDisabled: {
      opacity: 0.5
    },
    chipText: {
      fontSize: 12,
      fontWeight: '500',
      color: _themeTokensColors.lightColors.text.muted
    },
    chipTextActive: {
      color: _themeTokensColors.lightColors.text.inverse
    },
    chipTextDisabled: {
      color: _themeTokensColors.lightColors.text.muted
    }
  });
},3577,[12,80,493,1286,171,1678,1465,203]);
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
  exports.DashboardContent = DashboardContent;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsText = require(_dependencyMap[2]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _reactNativeWebDistExportsView = require(_dependencyMap[3]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _eventsEventBus = require(_dependencyMap[4]);
  var _sharedUiPrimitivesEmptyState = require(_dependencyMap[5]);
  var _sharedUiPrimitivesSkeleton = require(_dependencyMap[6]);
  var _Heatmap = require(_dependencyMap[7]);
  var _AnalyticsDashboardHelpers = require(_dependencyMap[8]);
  var _InsightCard = require(_dependencyMap[9]);
  var _TimeSeriesChart = require(_dependencyMap[10]);
  var _AnalyticsDashboardStyles = require(_dependencyMap[11]);
  var _reactJsxRuntime = require(_dependencyMap[12]);
  const MIN_HEATMAP_SESSIONS = 5;
  function InfoCard({
    title,
    subtitle
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: _AnalyticsDashboardStyles.styles.infoCard,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: _AnalyticsDashboardStyles.styles.infoTitle,
        children: title
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: _AnalyticsDashboardStyles.styles.infoSubtitle,
        children: subtitle
      })]
    });
  }
  function HeatmapSection({
    loading,
    error,
    data
  }) {
    if (loading) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_AnalyticsDashboardHelpers.HeatmapSkeleton, {});
    }
    if (error || !data) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(InfoCard, {
        title: "Activity Pattern",
        subtitle: "We couldn't load your session pattern right now."
      });
    }
    if (data.totalSessions < MIN_HEATMAP_SESSIONS) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(InfoCard, {
        title: "Activity Pattern",
        subtitle: "Complete more sessions to see your pattern."
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_Heatmap.Heatmap, {
      title: "Activity Pattern",
      subtitle: "When you're most active throughout the week",
      data: data.buckets,
      colorScheme: "blue"
    });
  }
  function DashboardContent({
    state,
    analyticsData,
    heatmapData,
    heatmapLoading,
    heatmapError,
    error,
    insights,
    userId,
    onInsightPress
  }) {
    const handleStartSession = (0, _react.useCallback)(() => {
      _eventsEventBus.eventBus.publish('session:created', {
        sessionId: `session_${Date.now()}`,
        userId,
        config: {},
        timestamp: Date.now()
      });
    }, [userId]);
    switch (state) {
      case 'loading':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: _AnalyticsDashboardStyles.styles.skeletonContainer,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
            width: "60%",
            height: 24,
            style: _AnalyticsDashboardStyles.styles.skeletonTitle
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: _AnalyticsDashboardStyles.styles.skeletonFilters,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
              width: 100,
              height: 36,
              variant: "rounded"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
              width: 100,
              height: 36,
              variant: "rounded"
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.SkeletonChart, {
            height: 200
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.SkeletonList, {
            count: 3
          })]
        });
      case 'error':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesEmptyState.NetworkError, {
          onRetry: error?.recoverable ? error.action : undefined
        });
      case 'empty':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesEmptyState.EmptyAnalytics, {
          onStartSession: handleStartSession
        });
      case 'partial':
      case 'ready':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: _AnalyticsDashboardStyles.styles.summaryContainer,
            children: analyticsData?.map(data => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
              style: _AnalyticsDashboardStyles.styles.summaryCard,
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
                style: _AnalyticsDashboardStyles.styles.summaryValue,
                children: (0, _AnalyticsDashboardHelpers.formatValue)(data.summary.total, data.metric)
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
                style: _AnalyticsDashboardStyles.styles.summaryLabel,
                children: (0, _AnalyticsDashboardHelpers.formatMetricName)(data.metric)
              }), data.summary.changePercent !== 0 && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
                style: [_AnalyticsDashboardStyles.styles.changeBadge, data.summary.changePercent > 0 ? _AnalyticsDashboardStyles.styles.changePositive : _AnalyticsDashboardStyles.styles.changeNegative],
                children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Text.default, {
                  style: _AnalyticsDashboardStyles.styles.changeText,
                  children: [data.summary.changePercent > 0 ? '+' : '', data.summary.changePercent.toFixed(1), "%"]
                })
              })]
            }, data.metric))
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: _AnalyticsDashboardStyles.styles.chartsContainer,
            children: analyticsData?.map(data => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_TimeSeriesChart.TimeSeriesChart, {
              data: data,
              height: 200
            }, data.metric))
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(HeatmapSection, {
            loading: heatmapLoading,
            error: heatmapError,
            data: heatmapData
          }), insights && insights.length > 0 && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: _AnalyticsDashboardStyles.styles.insightsSection,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
              style: _AnalyticsDashboardStyles.styles.sectionHeader,
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
                style: _AnalyticsDashboardStyles.styles.sectionTitle,
                children: "Insights"
              }), insights.length > 5 && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
                accessibilityLabel: "View all insights",
                accessibilityRole: "button",
                accessibilityHint: "Double tap to select",
                style: ({
                  pressed
                }) => [pressed && {
                  opacity: 0.8
                }],
                children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
                  style: _AnalyticsDashboardStyles.styles.seeAllText,
                  children: "See All"
                })
              })]
            }), insights.slice(0, 5).map(insight => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_InsightCard.InsightCard, {
              insight: insight,
              onPress: () => onInsightPress(insight.id)
            }, insight.id))]
          }), state === 'partial' && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: _AnalyticsDashboardStyles.styles.partialWarning,
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: _AnalyticsDashboardStyles.styles.partialText,
              children: "Some metrics may have limited data for this time period."
            })
          })]
        });
      default:
        return null;
    }
  }
},3578,[12,1286,493,80,1849,3066,3061,3579,3581,3583,3585,3582,203]);
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
  exports.Heatmap = Heatmap;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsText = require(_dependencyMap[2]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[3]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[4]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _sharedUiCreateSheet = require(_dependencyMap[5]);
  var _themeTokensColors = require(_dependencyMap[6]);
  var _HeatmapTypes = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  function Heatmap({
    data,
    title,
    subtitle,
    onCellPress,
    colorScheme = 'blue'
  }) {
    const colors = _HeatmapTypes.COLOR_SCHEMES[colorScheme];
    const getCellValue = (day, hour) => {
      const cell = data.find(d => d.day === day && d.hour === hour);
      return cell?.value ?? 0;
    };
    const getCellColor = value => {
      return colors[Math.min(value, 4)] ?? colors[0];
    };
    const visibleHours = _HeatmapTypes.HOURS.filter(h => h % 3 === 0);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: styles.container,
      children: [(title || subtitle) && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: styles.header,
        children: [title && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: styles.title,
          children: title
        }), subtitle && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: styles.subtitle,
          children: subtitle
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(ScrollView.default, {
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: styles.heatmap,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: styles.row,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
              style: styles.dayLabel
            }), visibleHours.map(hour => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: styles.hourLabel,
              children: (0, _HeatmapTypes.formatHour)(hour)
            }, `header-${hour}`))]
          }), _HeatmapTypes.DAYS.map(day => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: styles.row,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: styles.dayLabel,
              children: day
            }), _HeatmapTypes.HOURS.map(hour => {
              const value = getCellValue(day, hour);
              const isVisible = visibleHours.includes(hour);
              return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
                style: ({
                  pressed
                }) => [styles.cell, {
                  backgroundColor: getCellColor(value)
                }, !isVisible && styles.hiddenCell, value > 0 && styles.activeCell, pressed && {
                  opacity: 0.7
                }],
                onPress: () => onCellPress?.(day, hour, value),
                accessibilityLabel: "Heatmap cell",
                accessibilityRole: "button",
                accessibilityHint: "Double tap to select",
                children: value > 0 && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
                  style: [styles.intensityIndicator, {
                    opacity: value * 0.25
                  }]
                })
              }, `${day}-${hour}`);
            })]
          }, day))]
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: styles.legend,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: styles.legendText,
          children: "Less"
        }), colors.map((color, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: [styles.legendCell, {
            backgroundColor: color
          }]
        }, `color-${color}`)), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: styles.legendText,
          children: "More"
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: styles.stats,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Stat, {
          label: "Peak Day",
          value: (0, _HeatmapTypes.calculatePeakDay)(data)
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Stat, {
          label: "Peak Hour",
          value: (0, _HeatmapTypes.calculatePeakHour)(data)
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Stat, {
          label: "Total",
          value: (0, _HeatmapTypes.calculateTotal)(data).toString()
        })]
      })]
    });
  }
  function Stat({
    label,
    value
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: styles.statItem,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: styles.statValue,
        children: value
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: styles.statLabel,
        children: label
      })]
    });
  }
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      backgroundColor: _themeTokensColors.lightColors.text.inverse,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 12,
      marginVertical: 8
    },
    header: {
      marginBottom: 16
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: _themeTokensColors.lightColors.semantic.backgroundMuted
    },
    subtitle: {
      fontSize: 14,
      color: _themeTokensColors.lightColors.text.muted,
      marginTop: 4
    },
    heatmap: {
      gap: 4
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },
    dayLabel: {
      width: 40,
      fontSize: 12,
      color: _themeTokensColors.lightColors.text.muted,
      fontWeight: '500'
    },
    hourLabel: {
      width: 32,
      fontSize: 10,
      color: _themeTokensColors.lightColors.text.muted,
      textAlign: 'center'
    },
    cell: {
      width: 12,
      height: 28,
      borderRadius: 2,
      marginHorizontal: 1
    },
    hiddenCell: {
      opacity: 0.3
    },
    activeCell: {
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)'
    },
    intensityIndicator: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.2)'
    },
    legend: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      gap: 4
    },
    legendText: {
      fontSize: 12,
      color: _themeTokensColors.lightColors.text.muted,
      marginHorizontal: 8
    },
    legendCell: {
      width: 16,
      height: 16,
      borderRadius: 4
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: _themeTokensColors.lightColors.surface.button
    },
    statItem: {
      alignItems: 'center'
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color: _themeTokensColors.lightColors.semantic.backgroundMuted
    },
    statLabel: {
      fontSize: 12,
      color: _themeTokensColors.lightColors.text.muted,
      marginTop: 4
    }
  });
},3579,[12,80,493,1286,171,1678,1465,3580,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "DAYS", {
    enumerable: true,
    get: function () {
      return DAYS;
    }
  });
  Object.defineProperty(exports, "HOURS", {
    enumerable: true,
    get: function () {
      return HOURS;
    }
  });
  Object.defineProperty(exports, "COLOR_SCHEMES", {
    enumerable: true,
    get: function () {
      return COLOR_SCHEMES;
    }
  });
  exports.formatHour = formatHour;
  exports.calculatePeakDay = calculatePeakDay;
  exports.calculatePeakHour = calculatePeakHour;
  exports.calculateTotal = calculateTotal;
  var _themeTokensColors = require(_dependencyMap[0]);
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const HOURS = Array.from({
    length: 24
  }, (_, i) => i);
  const COLOR_SCHEMES = {
    blue: [_themeTokensColors.lightColors.info[50], _themeTokensColors.lightColors.info[50], _themeTokensColors.lightColors.accent.blue, _themeTokensColors.lightColors.accent.blue, _themeTokensColors.lightColors.accent.blue],
    green: [_themeTokensColors.lightColors.success[50], _themeTokensColors.lightColors.success[50], _themeTokensColors.lightColors.success.light, _themeTokensColors.lightColors.semantic.success, _themeTokensColors.lightColors.semantic.success],
    purple: [_themeTokensColors.lightColors.primary[50], _themeTokensColors.lightColors.primary[50], _themeTokensColors.lightColors.accent.purple, _themeTokensColors.lightColors.accent.purple, _themeTokensColors.lightColors.accent.purple]
  };
  function formatHour(hour) {
    if (hour === 0) {
      return '12am';
    }
    if (hour === 12) {
      return '12pm';
    }
    if (hour < 12) {
      return `${hour}am`;
    }
    return `${hour - 12}pm`;
  }
  function calculatePeakDay(data) {
    const dayTotals = DAYS.map(day => ({
      day,
      total: data.filter(d => d.day === day).reduce((sum, d) => sum + d.value, 0)
    }));
    const peak = dayTotals.reduce((max, curr) => {
      if (!max || curr.total > max.total) return curr;
      return max;
    }, undefined);
    return peak?.day ?? '-';
  }
  function calculatePeakHour(data) {
    const hourTotals = HOURS.map(hour => ({
      hour,
      total: data.filter(d => d.hour === hour).reduce((sum, d) => sum + d.value, 0)
    }));
    const peak = hourTotals.reduce((max, curr) => {
      if (!max || curr.total > max.total) return curr;
      return max;
    }, undefined);
    if (!peak) {
      return '-';
    }
    if (peak.hour === 0) {
      return '12am';
    }
    if (peak.hour === 12) {
      return '12pm';
    }
    if (peak.hour < 12) {
      return `${peak.hour}am`;
    }
    return `${peak.hour - 12}pm`;
  }
  function calculateTotal(data) {
    return data.reduce((sum, d) => sum + d.value, 0);
  }
},3580,[1465]);
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
  exports.HeatmapSkeleton = HeatmapSkeleton;
  exports.timeRangeToWeeks = timeRangeToWeeks;
  exports.formatMetricName = formatMetricName;
  exports.formatValue = formatValue;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _sharedUiPrimitivesSkeleton = require(_dependencyMap[2]);
  var _AnalyticsDashboardStyles = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  function HeatmapSkeleton() {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: _AnalyticsDashboardStyles.styles.heatmapSkeleton,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
        width: "45%",
        height: 20
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.Skeleton, {
        width: "70%",
        height: 14
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiPrimitivesSkeleton.SkeletonChart, {
        height: 180
      })]
    });
  }
  function timeRangeToWeeks(timeRange) {
    switch (timeRange) {
      case 'today':
        return 1;
      case 'last_7_days':
        return 1;
      case 'last_30_days':
        return 4;
      case 'this_month':
        return 4;
    }
  }
  function formatMetricName(metric) {
    return metric.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  function formatValue(value, metric) {
    if (metric.includes('time')) {
      const hours = Math.floor(value / 3600);
      if (hours > 0) {
        return `${hours}h`;
      }
      const minutes = Math.floor(value / 60);
      return `${minutes}m`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(value % 1 === 0 ? 0 : 1);
  }
},3581,[12,80,3061,3582,203]);
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
  /** Default screen width fallback for static style computation. */
  const DEFAULT_SCREEN_WIDTH = 375;

  /** Reactive styles for analytics dashboard — pass `screenWidth` from `useWindowDimensions()` to component for true reactivity. */
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      flex: 1,
      backgroundColor: _themeTokensColors.lightColors.surface.button
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: _themeTokensColors.lightColors.text.inverse,
      borderBottomWidth: 1,
      borderBottomColor: _themeTokensColors.lightColors.border.light
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: _themeTokensColors.lightColors.semantic.backgroundMuted
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8
    },
    iconButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: _themeTokensColors.lightColors.surface.button
    },
    iconButtonText: {
      fontSize: 12,
      fontWeight: '700'
    },
    filtersContainer: {
      backgroundColor: _themeTokensColors.lightColors.text.inverse,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: _themeTokensColors.lightColors.border.light
    },
    scrollView: {
      flex: 1
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32
    },
    summaryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16
    },
    summaryCard: {
      flex: 1,
      minWidth: 159.5,
      backgroundColor: _themeTokensColors.lightColors.text.inverse,
      borderRadius: 12,
      padding: 16,
      shadowColor: _themeTokensColors.lightColors.text.primary,
      shadowOffset: {
        width: 0,
        height: 1
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: '700',
      color: _themeTokensColors.lightColors.semantic.backgroundMuted
    },
    summaryLabel: {
      fontSize: 12,
      color: _themeTokensColors.lightColors.text.muted,
      marginTop: 4,
      textTransform: 'capitalize'
    },
    changeBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 8
    },
    changePositive: {
      backgroundColor: _themeTokensColors.lightColors.success[50]
    },
    changeNegative: {
      backgroundColor: _themeTokensColors.lightColors.error[50]
    },
    changeText: {
      fontSize: 12,
      fontWeight: '600',
      color: _themeTokensColors.lightColors.text.muted
    },
    chartsContainer: {
      marginBottom: 16
    },
    insightsSection: {
      marginTop: 8
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: _themeTokensColors.lightColors.semantic.backgroundMuted
    },
    seeAllText: {
      fontSize: 14,
      color: _themeTokensColors.lightColors.semantic.primary,
      fontWeight: '500'
    },
    partialWarning: {
      backgroundColor: _themeTokensColors.lightColors.warning[50],
      borderRadius: 8,
      padding: 12,
      marginTop: 16
    },
    partialText: {
      fontSize: 12,
      color: _themeTokensColors.lightColors.semantic.warning,
      textAlign: 'center'
    },
    skeletonContainer: {
      padding: 16,
      gap: 16
    },
    skeletonTitle: {
      marginBottom: 8
    },
    skeletonFilters: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8
    },
    heatmapSkeleton: {
      backgroundColor: _themeTokensColors.lightColors.text.inverse,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 12,
      marginVertical: 8,
      gap: 12
    },
    infoCard: {
      backgroundColor: _themeTokensColors.lightColors.text.inverse,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 12,
      marginVertical: 8
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: _themeTokensColors.lightColors.semantic.backgroundMuted,
      marginBottom: 6
    },
    infoSubtitle: {
      fontSize: 14,
      color: _themeTokensColors.lightColors.text.muted,
      lineHeight: 20
    }
  });
},3582,[1678,1465]);
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
  exports.InsightCard = InsightCard;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsText = require(_dependencyMap[2]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[3]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _InsightCardStyles = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function InsightCard({
    insight,
    onPress,
    onAction,
    onDismiss
  }) {
    const severity = _InsightCardStyles.SEVERITY_CONFIG[insight.severity];
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Pressable.default, {
      style: ({
        pressed
      }) => [_InsightCardStyles.styles.container, {
        backgroundColor: severity.bgColor,
        borderColor: severity.color
      }, insight.isRead && _InsightCardStyles.styles.readContainer, pressed && {
        opacity: 0.8
      }],
      onPress: onPress,
      accessibilityRole: "button",
      accessibilityLabel: `Insight: ${insight.title}`,
      accessibilityHint: "Double tap to select",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _InsightCardStyles.styles.header,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: _InsightCardStyles.styles.icon,
          children: severity.icon
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: [_InsightCardStyles.styles.title, {
            color: severity.color
          }],
          children: insight.title
        }), insight.isActioned && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: [_InsightCardStyles.styles.badge, {
            backgroundColor: severity.color
          }],
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: _InsightCardStyles.styles.badgeText,
            children: "Done"
          })
        }), !insight.isRead && !insight.isActioned && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: [_InsightCardStyles.styles.unreadDot, {
            backgroundColor: severity.color
          }]
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: _InsightCardStyles.styles.description,
        children: insight.description
      }), insight.metric && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _InsightCardStyles.styles.tagContainer,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: [_InsightCardStyles.styles.tag, {
            backgroundColor: severity.color + '30'
          }],
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [_InsightCardStyles.styles.tagText, {
              color: severity.color
            }],
            children: (0, _InsightCardStyles.formatMetricName)(insight.metric)
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: _InsightCardStyles.styles.date,
          children: (0, _InsightCardStyles.formatDate)(insight.detectedAt)
        })]
      }), insight.actionType && !insight.isActioned && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _InsightCardStyles.styles.actions,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          style: ({
            pressed
          }) => [_InsightCardStyles.styles.actionButton, {
            backgroundColor: severity.color
          }, pressed && {
            opacity: 0.8
          }],
          onPress: onAction,
          accessibilityRole: "button",
          accessibilityLabel: "Perform action",
          accessibilityHint: "Double tap to select",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: _InsightCardStyles.styles.actionButtonText,
            children: (0, _InsightCardStyles.formatActionLabel)(insight.actionType)
          })
        }), onDismiss && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          style: ({
            pressed
          }) => [_InsightCardStyles.styles.dismissButton, pressed && {
            opacity: 0.8
          }],
          onPress: onDismiss,
          accessibilityRole: "button",
          accessibilityLabel: "Dismiss insight",
          accessibilityHint: "Double tap to select",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [_InsightCardStyles.styles.dismissText, {
              color: severity.color
            }],
            children: "Dismiss"
          })
        })]
      })]
    });
  }
},3583,[12,80,493,1286,3584,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "SEVERITY_CONFIG", {
    enumerable: true,
    get: function () {
      return SEVERITY_CONFIG;
    }
  });
  exports.formatMetricName = formatMetricName;
  exports.formatDate = formatDate;
  exports.formatActionLabel = formatActionLabel;
  Object.defineProperty(exports, "styles", {
    enumerable: true,
    get: function () {
      return styles;
    }
  });
  var _sharedUiCreateSheet = require(_dependencyMap[0]);
  var _themeTokensColors = require(_dependencyMap[1]);
  const SEVERITY_CONFIG = {
    info: {
      color: _themeTokensColors.lightColors.accent.blue,
      bgColor: _themeTokensColors.lightColors.info[50],
      icon: ''
    },
    positive: {
      color: _themeTokensColors.lightColors.accent.green,
      bgColor: _themeTokensColors.lightColors.success[50],
      icon: ''
    },
    warning: {
      color: _themeTokensColors.lightColors.semantic.warning,
      bgColor: _themeTokensColors.lightColors.warning[50],
      icon: ''
    },
    critical: {
      color: _themeTokensColors.lightColors.semantic.danger,
      bgColor: _themeTokensColors.lightColors.error[50],
      icon: ''
    },
    celebration: {
      color: _themeTokensColors.lightColors.accent.purple,
      bgColor: _themeTokensColors.lightColors.primary[50],
      icon: ''
    }
  };
  function formatMetricName(metric) {
    return metric.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (hours < 1) {
      return 'Just now';
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    if (days < 7) {
      return `${days}d ago`;
    }
    return date.toLocaleDateString();
  }
  function formatActionLabel(actionType) {
    const labels = {
      start_session: 'Start Session',
      view_progress: 'View Progress',
      check_challenges: 'Check Challenges',
      invite_friends: 'Invite Friends',
      upgrade_plan: 'Upgrade Plan',
      customize_settings: 'Settings'
    };
    return labels[actionType] || actionType;
  }
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      borderRadius: 12,
      padding: 16,
      marginVertical: 6,
      marginHorizontal: 12,
      borderLeftWidth: 4
    },
    readContainer: {
      opacity: 0.8
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8
    },
    icon: {
      fontSize: 20,
      marginRight: 8
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginLeft: 8
    },
    badgeText: {
      color: _themeTokensColors.lightColors.text.inverse,
      fontSize: 10,
      fontWeight: '600'
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 8
    },
    description: {
      fontSize: 14,
      color: _themeTokensColors.lightColors.text.muted,
      lineHeight: 20,
      marginBottom: 12
    },
    tagContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    tag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8
    },
    tagText: {
      fontSize: 12,
      fontWeight: '500'
    },
    date: {
      fontSize: 12,
      color: _themeTokensColors.lightColors.text.muted
    },
    actions: {
      flexDirection: 'row',
      marginTop: 12,
      gap: 12
    },
    actionButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      flex: 1,
      alignItems: 'center'
    },
    actionButtonText: {
      color: _themeTokensColors.lightColors.text.inverse,
      fontWeight: '600',
      fontSize: 14
    },
    dismissButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      alignItems: 'center'
    },
    dismissText: {
      fontWeight: '500',
      fontSize: 14
    }
  });
},3584,[1678,1465]);
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
  exports.TimeSeriesChart = TimeSeriesChart;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsText = require(_dependencyMap[2]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _sharedUiCreateSheet = require(_dependencyMap[3]);
  var _themeTokensColors = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  /**
   * Time Series Chart Component (Placeholder)
   * Full implementation requires react-native-chart-kit or similar
   * This is a simplified stats display version
   */

  function TimeSeriesChart({
    data,
    height = 220
  }) {
    if (data.points.length === 0) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: [styles.container, {
          height
        }],
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: styles.emptyText,
          children: "No data available for this period"
        })
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: [styles.container, {
        height
      }],
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: styles.title,
        children: formatMetricName(data.metric)
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: styles.stats,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(StatBox, {
          label: "Total",
          value: formatValue(data.summary.total, data.metric)
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(StatBox, {
          label: "Average",
          value: formatValue(data.summary.average, data.metric)
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(StatBox, {
          label: "Peak",
          value: formatValue(data.summary.max, data.metric)
        }), data.summary.changePercent !== 0 && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(StatBox, {
          label: "Change",
          value: `${data.summary.changePercent > 0 ? '+' : ''}${data.summary.changePercent.toFixed(1)}%`,
          highlight: data.summary.changePercent > 0 ? 'positive' : 'negative'
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: styles.dataPreview,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Text.default, {
          style: styles.previewText,
          children: [data.points.length, " data points \u2022 Last updated", ' ', new Date(data.points[data.points.length - 1]?.timestamp ?? 0).toLocaleDateString()]
        })
      })]
    });
  }
  function StatBox({
    label,
    value,
    highlight
  }) {
    const highlightColor = highlight === 'positive' ? _themeTokensColors.lightColors.accent.green : highlight === 'negative' ? _themeTokensColors.lightColors.semantic.danger : undefined;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: styles.statBox,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: styles.statLabel,
        children: label
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: [styles.statValue, highlightColor ? {
          color: highlightColor
        } : null],
        children: value
      })]
    });
  }
  function formatMetricName(metric) {
    return metric.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  function formatValue(value, metric) {
    if (metric.includes('time') || metric.includes('duration')) {
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor(value % 3600 / 60);
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(value % 1 === 0 ? 0 : 1);
  }
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      backgroundColor: _themeTokensColors.lightColors.text.inverse,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      shadowColor: _themeTokensColors.lightColors.text.primary,
      shadowOffset: {
        width: 0,
        height: 1
      },
      shadowOpacity: 0.1,
      elevation: 2
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: _themeTokensColors.lightColors.semantic.backgroundMuted,
      marginBottom: 12
    },
    stats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12
    },
    statBox: {
      backgroundColor: _themeTokensColors.lightColors.surface.button,
      borderRadius: 8,
      padding: 12,
      minWidth: 80
    },
    statLabel: {
      fontSize: 12,
      color: _themeTokensColors.lightColors.text.muted,
      marginBottom: 4
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: _themeTokensColors.lightColors.semantic.backgroundMuted
    },
    dataPreview: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: _themeTokensColors.lightColors.border.light
    },
    previewText: {
      fontSize: 12,
      color: _themeTokensColors.lightColors.text.muted
    },
    emptyText: {
      textAlign: 'center',
      color: _themeTokensColors.lightColors.text.muted,
      padding: 24
    }
  });
},3585,[12,80,493,1678,1465,203]);
//# sourceMappingURL=/_expo/static/js/web/AnalyticsScreen-f4174f0c85b55131b0ccc09e75de2a98.js.map
//# debugId=50bc686f-80a6-4b8b-bac1-b16c2e216d73