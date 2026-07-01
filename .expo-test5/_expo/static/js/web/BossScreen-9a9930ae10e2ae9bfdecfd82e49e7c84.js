__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "BossScreen", {
    enumerable: true,
    get: function () {
      return BossScreenWithBoundary;
    }
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return BossScreen;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNavigationNative = require(_dependencyMap[1]);
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[2]);
  var _featuresLiveopsConfig = require(_dependencyMap[3]);
  var _featuresLiveopsConfigFeatureAccessStore = require(_dependencyMap[4]);
  var _featuresPersonalizationHooks = require(_dependencyMap[5]);
  var _featuresStreaksHooks = require(_dependencyMap[6]);
  var _featuresBossAnalytics = require(_dependencyMap[7]);
  var _featuresBossBossEngagementSignals = require(_dependencyMap[8]);
  var _navigationNavigationHelpers = require(_dependencyMap[9]);
  var _BossScreenContent = require(_dependencyMap[10]);
  var _store = require(_dependencyMap[11]);
  var _themeThemeContext = require(_dependencyMap[12]);
  var _bossScreenHelpers = require(_dependencyMap[13]);
  var _reactJsxRuntime = require(_dependencyMap[14]);
  /**
   * BossScreen — Progressive unlock & product intensity.
   *
   * Queries only run when FeatureAvailability allows.
   * Intensity comes from the canonical VexExperience — no duplicate resolution.
   * Squad content removed for final release.
   * Boss damage maps directly to focus/study sessions — no economy/shop dependency.
   */

  const BossScreen = () => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const disclosure = (0, _featuresLiveopsConfig.useFeatureAccess)();
    const userId = (0, _store.useAuthStore)(state => state.user?.id ?? null);
    const streakQuery = (0, _featuresStreaksHooks.useStreakSummary)(userId);
    const completionStreak = streakQuery.data?.currentStreak ?? 0;
    const degradedFeatures = (0, _featuresLiveopsConfigFeatureAccessStore.getDegradedFeatures)();
    const bossIgnored = degradedFeatures.has('boss_tab');
    const bossEngagementInputs = {
      bossIgnored,
      bossUnlocked: disclosure.features.boss_tab.isUnlocked,
      canQueryBoss: false,
      bossRouteOpenedCount: 0,
      bossCTAClickedCount: 0,
      bossDamageEventsCount: 0,
      recentSessionsWithBossProgress: 0
    };
    const _bossEngagement = (0, _featuresBossBossEngagementSignals.useBossEngagementSignals)(bossEngagementInputs);
    const resolved = (0, _featuresPersonalizationHooks.useResolvedVexExperienceRuntime)({
      behaviorStats: {
        abandonedSessionDurations: [],
        bossChallengeEngagement: 'low',
        coachInteractions: 0,
        comebackSessions: 0,
        completedSessionDurations: [],
        completionStreak,
        ignoredFeatures: bossIgnored ? ['boss_tab'] : [],
        mostSuccessfulTimeOfDay: null,
        preferredSessionMode: null,
        premiumFeatureAttempts: [],
        studyUsageRatio: 0,
        totalCompletedSessions: disclosure.inputs.totalCompletedSessions
      },
      featureAvailability: {
        boss: disclosure.features.boss_tab.isUnlocked,
        challenges: disclosure.features.challenges.isUnlocked,
        premium: disclosure.features.premium_paywall.isUnlocked,
        study: disclosure.features.content_study.isUnlocked
      }
    });
    const bossIntensity = resolved.bossIntensity;
    const bossAvailability = (0, _featuresLiveopsConfig.getFeatureAvailability)(disclosure.features.boss_tab);
    const canQueryBoss = bossAvailability.canQuery && bossAvailability.canUseBackend;
    const canNavigateBoss = (0, _featuresLiveopsConfig.isFeatureAvailableForNavigation)(bossAvailability);
    const [resetLabel, setResetLabel] = (0, _react.useState)((0, _bossScreenHelpers.nextResetLabel)());
    (0, _react.useEffect)(() => {
      const id = setInterval(() => setResetLabel((0, _bossScreenHelpers.nextResetLabel)()), 60000);
      return () => clearInterval(id);
    }, []);
    const trackedOpenRef = (0, _react.useRef)(false);
    (0, _react.useEffect)(() => {
      if (!userId) {
        return;
      }
      if (trackedOpenRef.current) {
        return;
      }
      trackedOpenRef.current = true;
      (0, _featuresBossAnalytics.trackBossRouteOpened)(userId, bossIntensity, canQueryBoss);
    }, [userId, bossIntensity, canQueryBoss]);
    if (!canNavigateBoss || disclosure.features.boss_tab.releaseState === 'final_release_deactivated') {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_bossScreenHelpers.BossFallback, {
        intensity: (0, _bossScreenHelpers.toScreenIntensity)(bossIntensity),
        onStartSession: () => (0, _navigationNavigationHelpers.navigateToRootScreen)(navigation, 'SessionStack', {
          screen: 'SessionSetup',
          params: {}
        }),
        unlockReason: disclosure.features.boss_tab.unlockReason,
        stage: disclosure.stage,
        resetLabel: resetLabel
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_BossScreenContent.BossScreenContent, {
      canQueryBoss: canQueryBoss,
      bossIntensity: (0, _bossScreenHelpers.toScreenIntensity)(bossIntensity),
      userId: userId,
      navigation: navigation,
      resetLabel: resetLabel,
      theme: theme
    });
  };
  const BossScreenWithBoundary = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(BossScreen, 'Boss');
},3336,[12,1359,2166,1956,1969,2485,2261,3693,3694,2052,3695,1705,1463,3700,203]);
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
  Object.defineProperty(exports, "BOSS_ANALYTICS_EVENTS", {
    enumerable: true,
    get: function () {
      return BOSS_ANALYTICS_EVENTS;
    }
  });
  exports.trackBossEvent = trackBossEvent;
  exports.trackBossRouteOpened = trackBossRouteOpened;
  exports.trackBossCTAClicked = trackBossCTAClicked;
  exports.trackCombatAbilityActivated = trackCombatAbilityActivated;
  var _sentryReactNative = require(_dependencyMap[0]);
  var Sentry = _interopNamespace(_sentryReactNative);
  var _utilsSentryPrivacy = require(_dependencyMap[1]);
  const BOSS_ANALYTICS_EVENTS = ['boss_route_opened', 'boss_cta_clicked', 'combat_ability_activated'];
  function trackBossEvent() {
    try {
      Sentry.addBreadcrumb({
        category: 'boss',
        message: 'boss_event',
        level: 'info'
      });
    } catch {
      // analytics failure must not break app flow
    }
  }
  function trackBossRouteOpened(userId, intensity, canQuery) {
    try {
      Sentry.addBreadcrumb({
        category: 'boss',
        message: 'boss_route_opened',
        data: {
          userId: (0, _utilsSentryPrivacy.hashUserId)(userId ?? ''),
          intensity,
          canQuery
        },
        level: 'info'
      });
    } catch {
      // analytics failure must not break app flow
    }
  }
  function trackBossCTAClicked(userId, minutes, intensity) {
    try {
      Sentry.addBreadcrumb({
        category: 'boss',
        message: 'boss_cta_clicked',
        data: {
          userId: (0, _utilsSentryPrivacy.hashUserId)(userId ?? ''),
          minutes,
          intensity
        },
        level: 'info'
      });
    } catch {
      // analytics failure must not break app flow
    }
  }
  function trackCombatAbilityActivated(userId, encounterId, abilityId, damage, hadCombo) {
    try {
      Sentry.addBreadcrumb({
        category: 'boss',
        message: 'combat_ability_activated',
        data: {
          userId: (0, _utilsSentryPrivacy.hashUserId)(userId ?? ''),
          encounterId,
          abilityId,
          damage,
          hadCombo
        },
        level: 'info'
      });
    } catch {
      // analytics failure must not break app flow
    }
  }
},3693,[834,1983]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getBossEngagementSignals = getBossEngagementSignals;
  exports.useBossEngagementSignals = useBossEngagementSignals;
  exports.deriveBossEngagementLevel = deriveBossEngagementLevel;
  function getBossEngagementSignals(_inputs) {
    return [];
  }
  function useBossEngagementSignals(inputs) {
    return Object.assign({
      signals: []
    }, inputs);
  }
  function deriveBossEngagementLevel(_inputs) {
    return 'none';
  }
},3694,[]);
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
  exports.BossScreenContent = BossScreenContent;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[1]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _reactNativeSafeAreaContext = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _componentsUiSkeleton = require(_dependencyMap[4]);
  var _featuresBossComponentsBossBattleHud = require(_dependencyMap[5]);
  var _featuresBossHooks = require(_dependencyMap[6]);
  var _featuresProgressionHooks = require(_dependencyMap[7]);
  var _featuresStreaksHooks = require(_dependencyMap[8]);
  var _navigationNavigationHelpers = require(_dependencyMap[9]);
  var _BossScreenSections = require(_dependencyMap[10]);
  var _reactJsxRuntime = require(_dependencyMap[11]);
  function BossScreenContent({
    bossIntensity,
    canQueryBoss,
    navigation,
    resetLabel,
    theme,
    userId
  }) {
    const bossQuery = (0, _featuresBossHooks.useActiveBoss)(canQueryBoss ? userId : null);
    const templatesQuery = (0, _featuresBossHooks.useBossTemplates)(canQueryBoss ? userId : null);
    const progressionQuery = (0, _featuresProgressionHooks.useProgressionSummary)(userId);
    const streakQuery = (0, _featuresStreaksHooks.useStreakMultiplier)(userId);
    if (bossQuery.isPending || canQueryBoss && templatesQuery.isPending) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSafeAreaContext.SafeAreaView, {
        style: {
          flex: 1,
          backgroundColor: theme.colors.background.primary
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(ScrollView.default, {
          contentContainerStyle: {
            padding: theme.spacing[5],
            gap: theme.spacing[4]
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
            height: 320,
            variant: "rounded"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
            height: 150,
            variant: "rounded"
          })]
        })
      });
    }
    const encounter = bossQuery.data;
    const templates = templatesQuery.data ?? [];
    const template = encounter ? templates.find(item => item.id === encounter.bossId) : undefined;
    const level = progressionQuery.data?.level ?? 1;
    const levelLocked = Boolean(template && level < template.minLevel);
    const userDamage = encounter ? Math.max(0, encounter.maxHealth - encounter.healthRemaining) : 0;
    const streakMultiplier = streakQuery.data?.multiplier ?? 1;
    if (!encounter) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSafeAreaContext.SafeAreaView, {
        style: {
          flex: 1,
          backgroundColor: theme.colors.background.primary
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(ScrollView.default, {
          contentContainerStyle: {
            padding: theme.spacing[5]
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "h3",
            color: theme.colors.text.primary,
            children: `Next momentum marker opens in ${resetLabel}.`
          })
        })
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSafeAreaContext.SafeAreaView, {
      style: {
        flex: 1,
        backgroundColor: theme.colors.background.primary
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(ScrollView.default, {
        contentContainerStyle: {
          padding: theme.spacing[5],
          gap: theme.spacing[4],
          paddingBottom: theme.spacing[10]
        },
        showsVerticalScrollIndicator: false,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresBossComponentsBossBattleHud.BossBattleHUD, {}), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_BossScreenSections.BossScreenSections, {
          bossIntensity: bossIntensity,
          encounter: encounter,
          onLaunchAttack: minutes => {
            if (levelLocked) {
              return;
            }
            (0, _navigationNavigationHelpers.navigateToRootScreen)(navigation, 'SessionStack', {
              screen: 'SessionSetup',
              params: {
                presetId: minutes === 15 ? 'quick' : minutes === 25 ? 'pomodoro' : 'deep'
              }
            });
          },
          progressionLevel: level,
          streakMultiplier: streakMultiplier,
          template: template ?? {
            id: encounter.bossId,
            name: encounter.bossName,
            tier: 1,
            minLevel: 1
          },
          userDamage: userDamage,
          userId: userId ?? ''
        })]
      })
    });
  }
},3695,[12,171,719,1489,1676,3696,2768,2266,2261,2052,3697,203]);
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
  exports.BossBattleHUD = BossBattleHUD;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsText = require(_dependencyMap[2]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _themeTokensColors = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  // Boss battle HUD stub

  function BossBattleHUD() {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      accessibilityLabel: "Boss battle",
      style: {
        padding: 16
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: {
          color: _themeTokensColors.lightColors.text.disabled,
          fontSize: 13
        },
        children: "Boss battles have been moved."
      })
    });
  }
},3696,[12,80,493,1465,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "BossScreenSections", {
    enumerable: true,
    get: function () {
      return _BossScreenSectionsInner.BossScreenSections;
    }
  });
  Object.defineProperty(exports, "getBossScreenCopy", {
    enumerable: true,
    get: function () {
      return _bossScreenUtils.getBossScreenCopy;
    }
  });
  Object.defineProperty(exports, "estimateDamage", {
    enumerable: true,
    get: function () {
      return _bossScreenUtils.estimateDamage;
    }
  });
  Object.defineProperty(exports, "formatDuration", {
    enumerable: true,
    get: function () {
      return _bossScreenUtils.formatDuration;
    }
  });
  Object.defineProperty(exports, "ATTACK_PRESETS", {
    enumerable: true,
    get: function () {
      return _bossScreenUtils.ATTACK_PRESETS;
    }
  });
  var _BossScreenSectionsInner = require(_dependencyMap[0]);
  var _bossScreenUtils = require(_dependencyMap[1]);
},3697,[3698,3699]);
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
  Object.defineProperty(exports, "BossScreenSections", {
    enumerable: true,
    get: function () {
      return BossScreenSections;
    }
  });
  var _react = require(_dependencyMap[0]);
  var React = _interopDefault(_react);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _featuresBossAnalytics = require(_dependencyMap[4]);
  var _sessionHooksUseSession = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _bossScreenUtils = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  function cardStyle(theme) {
    return {
      backgroundColor: theme.colors.background.secondary,
      borderColor: theme.colors.border.light,
      borderRadius: theme.borderRadius['2xl'],
      borderWidth: 1,
      gap: theme.spacing[3],
      padding: theme.spacing[5]
    };
  }
  function BossScreenSectionsRaw({
    bossIntensity = 'subtle',
    onLaunchAttack,
    streakMultiplier,
    userDamage,
    userId
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const historyQuery = (0, _sessionHooksUseSession.useSessionHistory)(userId, 5);
    const [selectedMinutes, setSelectedMinutes] = (0, _react.useState)(25);
    const copy = (0, _bossScreenUtils.getBossScreenCopy)(bossIntensity);
    const handleLaunchAttack = (0, _react.useCallback)(minutes => {
      (0, _featuresBossAnalytics.trackBossCTAClicked)(userId, minutes, bossIntensity);
      onLaunchAttack(minutes);
    }, [onLaunchAttack, userId, bossIntensity]);
    const recentSessions = (0, _react.useMemo)(() => historyQuery.history.filter(entry => entry.endedAt && entry.startedAt).slice(0, 3).map(entry => ({
      duration: Math.max(0, (entry.endedAt ?? 0) - entry.startedAt),
      endedAt: entry.endedAt ?? entry.startedAt,
      quality: entry.summary?.focusPurityScore ?? entry.summary?.focusQuality ?? 75
    })), [historyQuery.history]);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: cardStyle(theme),
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: theme.colors.text.primary,
          children: copy.title
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "bodySmall",
          color: theme.colors.text.secondary,
          children: copy.intro
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flexDirection: 'row',
            justifyContent: 'space-between'
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: theme.colors.text.secondary,
              children: copy.metricLabel
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "h3",
              color: theme.colors.text.primary,
              children: userDamage.toLocaleString()
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: {
              alignItems: 'flex-end'
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: theme.colors.text.secondary,
              children: "Focus multiplier"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "h3",
              color: theme.colors.primary[500],
              children: `x${streakMultiplier.toFixed(2)}`
            })]
          })]
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: cardStyle(theme),
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: theme.colors.text.primary,
          children: copy.historyTitle
        }), historyQuery.isLoading ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "bodySmall",
          color: theme.colors.text.secondary,
          children: "Loading recent sessions..."
        }) : null, historyQuery.error ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "bodySmall",
          color: theme.colors.error.DEFAULT,
          children: "Recent session proof is unavailable right now."
        }) : null, !historyQuery.isLoading && !historyQuery.error && recentSessions.length === 0 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "bodySmall",
          color: theme.colors.text.secondary,
          children: "Complete a focus session to move this forward."
        }) : null, recentSessions.map(entry => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flexDirection: 'row',
            justifyContent: 'space-between'
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "body",
            color: theme.colors.text.primary,
            children: (0, _bossScreenUtils.formatDuration)(entry.duration)
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "bodySmall",
            color: theme.colors.text.secondary,
            children: `Purity ${entry.quality}`
          })]
        }, `${entry.endedAt}-${entry.duration}`))]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: cardStyle(theme),
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: theme.colors.text.primary,
          children: copy.actionLabel
        }), _bossScreenUtils.ATTACK_PRESETS.map(preset => {
          const selected = preset.minutes === selectedMinutes;
          return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Pressable.default, {
            onPress: () => selected ? handleLaunchAttack(preset.minutes) : setSelectedMinutes(preset.minutes),
            accessibilityLabel: preset.label,
            accessibilityRole: "button",
            accessibilityHint: "Starts a focus session with this duration.",
            style: {
              backgroundColor: selected ? theme.colors.primary[500] : theme.colors.background.primary,
              borderRadius: theme.borderRadius.xl,
              minHeight: 44,
              padding: theme.spacing[4]
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              color: selected ? theme.colors.text.inverse : theme.colors.text.primary,
              children: preset.label
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "bodySmall",
              color: selected ? theme.colors.text.inverse : theme.colors.text.secondary,
              children: `${(0, _bossScreenUtils.estimateDamage)(preset.minutes, streakMultiplier)} ${bossIntensity === 'subtle' ? 'momentum' : 'damage'}`
            })]
          }, preset.minutes);
        })]
      })]
    });
  }
  const BossScreenSections = /*#__PURE__*/React.default.memo(BossScreenSectionsRaw);
  BossScreenSections.displayName = 'BossScreenSections';
},3698,[12,1286,80,1489,3693,1957,1463,3699,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "ATTACK_PRESETS", {
    enumerable: true,
    get: function () {
      return ATTACK_PRESETS;
    }
  });
  exports.getBossScreenCopy = getBossScreenCopy;
  exports.estimateDamage = estimateDamage;
  exports.formatDuration = formatDuration;
  const ATTACK_PRESETS = [{
    minutes: 15,
    label: '15m focused block'
  }, {
    minutes: 25,
    label: '25m focus block'
  }, {
    minutes: 60,
    label: '60m deep block'
  }];
  function getBossScreenCopy(intensity) {
    if (intensity === 'subtle') {
      return {
        actionLabel: 'Start focus block',
        historyTitle: 'Momentum history',
        intro: 'Each completed session moves this marker forward. Just proof that you returned.',
        metricLabel: 'Momentum earned',
        title: 'Focus Momentum'
      };
    }
    if (intensity === 'intense') {
      return {
        actionLabel: 'Start focused push',
        historyTitle: 'Recent pressure',
        intro: 'Your completed sessions reduce boss health. Strong focus hits harder, but the work stays the center.',
        metricLabel: 'Total damage',
        title: 'Boss Focus'
      };
    }
    return {
      actionLabel: 'Start boss focus',
      historyTitle: 'Recent hits',
      intro: 'Focus sessions chip boss health down one clean block at a time.',
      metricLabel: 'Total damage',
      title: 'Boss Health'
    };
  }
  function estimateDamage(minutes, streakMultiplier) {
    return Math.max(1, Math.round(minutes * streakMultiplier * 1.5));
  }
  function formatDuration(seconds) {
    return `${Math.max(1, Math.round(seconds / 60))} min`;
  }
},3699,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getBossCopy = getBossCopy;
  exports.toScreenIntensity = toScreenIntensity;
  Object.defineProperty(exports, "nextResetLabel", {
    enumerable: true,
    get: function () {
      return nextResetLabel;
    }
  });
  Object.defineProperty(exports, "BossFallback", {
    enumerable: true,
    get: function () {
      return BossFallback;
    }
  });
  require(_dependencyMap[0]);
  var _componentsLockedFeatureScreen = require(_dependencyMap[1]);
  var _themeThemeContext = require(_dependencyMap[2]);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  const BOSS_COPY = {
    subtle: {
      title: 'Focus Momentum',
      description: 'Each session you complete adds to your momentum. A quiet marker tracks the focus you have already earned.'
    },
    'game-like': {
      title: 'Boss Battle',
      description: 'Your focus sessions push the creature back, one block at a time. Every minute focused counts as damage.'
    },
    intense: {
      title: 'Boss Battle — Full Assault',
      description: 'Every session hits harder. Longer sessions deal critical damage. Your streak multiplies everything. Press the attack.'
    }
  };
  function getBossCopy(bossIntensity) {
    return BOSS_COPY[bossIntensity] ?? BOSS_COPY.subtle;
  }
  function toScreenIntensity(intensity) {
    if (intensity === 'game-like' || intensity === 'intense' || intensity === 'subtle') {
      return intensity;
    }
    return 'subtle';
  }
  const nextResetLabel = () => {
    const now = new Date();
    const day = now.getUTCDay();
    const days = (8 - day) % 7 || 7;
    const diff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days, 0, 0, 0) - Date.now();
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000) % 24;
    return `${d}d ${h}h`;
  };
  const BossFallback = ({
    intensity,
    onStartSession,
    unlockReason,
    stage,
    resetLabel
  }) => {
    (0, _themeThemeContext.useTheme)();
    const copy = getBossCopy(intensity);
    const isSubtle = intensity === 'subtle';
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsLockedFeatureScreen.LockedFeatureScreen, {
      ctaLabel: "Start a focus session",
      description: copy.description,
      feature: "boss_tab",
      icon: isSubtle ? '\u{1F4CA}' : '\u{1F409}',
      onPress: onStartSession,
      progressLabel: resetLabel,
      stage: stage,
      title: copy.title,
      unlockLabel: unlockReason,
      whyItMatters: "Boss progress moves only when you complete focus sessions. No shop items, no premium boosts \u2014 just real focus time."
    });
  };
},3700,[12,3701,1463,203]);
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
  exports.LockedFeatureScreen = LockedFeatureScreen;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[1]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeSafeAreaContext = require(_dependencyMap[3]);
  var _premiumStyles = require(_dependencyMap[4]);
  var _primitivesButton = require(_dependencyMap[5]);
  var _primitivesText = require(_dependencyMap[6]);
  var _themeThemeContext = require(_dependencyMap[7]);
  var _UnlockRequirementRow = require(_dependencyMap[8]);
  var _utilsHaptics = require(_dependencyMap[9]);
  var _featuresLiveopsConfig = require(_dependencyMap[10]);
  var _reactJsxRuntime = require(_dependencyMap[11]);
  function LockedFeatureScreen(props) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const analytics = (0, _featuresLiveopsConfig.useDisclosureAnalytics)();
    (0, _react.useEffect)(() => {
      analytics.trackLockedFeatureScreenViewed(props.feature, props.stage);
    }, [analytics, props.feature, props.stage]);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSafeAreaContext.SafeAreaView, {
      style: {
        flex: 1,
        backgroundColor: theme.colors.background.primary
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(ScrollView.default, {
        contentContainerStyle: {
          padding: theme.spacing[5],
          gap: theme.spacing[4],
          justifyContent: 'center',
          flexGrow: 1
        },
        showsVerticalScrollIndicator: false,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: Object.assign({
            borderWidth: 1,
            borderColor: theme.colors.primary[100],
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius['3xl'],
            padding: theme.spacing[5],
            gap: theme.spacing[4]
          }, (0, _premiumStyles.getPremiumCardStyle)('large')),
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: {
              gap: theme.spacing[2]
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesText.Text, {
              variant: "label",
              color: theme.colors.primary[500],
              children: `${props.icon} ${props.title}`
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesText.Text, {
              variant: "h2",
              color: theme.colors.text.primary,
              children: props.description
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesText.Text, {
              variant: "body",
              color: theme.colors.text.secondary,
              children: props.whyItMatters
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_UnlockRequirementRow.UnlockRequirementRow, {
            label: props.unlockLabel,
            progressLabel: props.progressLabel
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesButton.Button, {
            onPress: () => {
              (0, _utilsHaptics.buttonTap)();
              analytics.trackTeaserCtaPressed(props.feature, props.ctaLabel, props.stage);
              props.onPress();
            },
            accessibilityLabel: props.ctaLabel,
            accessibilityRole: "button",
            accessibilityHint: "Double tap to learn more",
            children: props.ctaLabel
          })]
        })
      })
    });
  }
},3701,[12,171,80,719,3543,1680,1489,1463,3702,1683,1956,203]);
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
  exports.UnlockRequirementRow = UnlockRequirementRow;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _primitivesText = require(_dependencyMap[2]);
  var _themeThemeContext = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  function UnlockRequirementRow({
    label,
    progressLabel
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.xl,
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[3],
        gap: theme.spacing[3]
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesText.Text, {
        variant: "bodySmall",
        color: theme.colors.text.primary,
        style: {
          flex: 1
        },
        children: label
      }), progressLabel ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesText.Text, {
        variant: "label",
        color: theme.colors.primary[500],
        children: progressLabel
      }) : null]
    });
  }
},3702,[12,80,1489,1463,203]);
//# sourceMappingURL=/_expo/static/js/web/BossScreen-9a9930ae10e2ae9bfdecfd82e49e7c84.js.map
//# debugId=3ed95cd0-204d-4cde-9907-6adc240e8bf3