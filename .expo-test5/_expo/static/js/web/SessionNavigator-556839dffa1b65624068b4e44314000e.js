__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "SessionNavigator", {
    enumerable: true,
    get: function () {
      return SessionNavigator;
    }
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return SessionNavigator;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNavigationNativeStack = require(_dependencyMap[1]);
  var _appBootstrap = require(_dependencyMap[2]);
  var _themeTokensColors = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  /**
   * Session Navigator
   *
   * Core Focus Loop navigation stack.
   * Manages the complete session flow: Setup → Active → Complete.
   */

  const Stack = (0, _reactNavigationNativeStack.createNativeStackNavigator)();

  /**
   * Session navigator - Core Focus Loop
   */
  const SessionNavigator = () => {
    (0, _react.useEffect)(() => {
      (0, _appBootstrap.initializeSessionRuntime)();
    }, []);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Stack.Navigator, {
      screenOptions: {
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: _themeTokensColors.lightColors.background.primary
        }
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Stack.Screen, {
        name: "SessionSetup",
        getComponent: () =>
        // SAFETY: require() keeps session screens lazy-loaded for navigation startup performance.
        require(_dependencyMap[5]).SessionSetupScreen
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Stack.Screen, {
        name: "ActiveSession",
        getComponent: () =>
        // SAFETY: require() keeps session screens lazy-loaded for navigation startup performance.
        require(_dependencyMap[6]).ActiveSessionScreen,
        options: {
          gestureEnabled: false
        }
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Stack.Screen, {
        name: "SessionComplete",
        getComponent: () =>
        // SAFETY: require() keeps session screens lazy-loaded for navigation startup performance.
        require(_dependencyMap[7]).SessionCompleteScreen
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Stack.Screen, {
        name: "SessionHistory",
        getComponent: () =>
        // SAFETY: require() keeps session screens lazy-loaded for navigation startup performance.
        require(_dependencyMap[8]).SessionHistoryScreen
      })]
    });
  };
},3325,[12,2074,3287,1465,203,3342,3416,3481,3534]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "SessionSetupScreen", {
    enumerable: true,
    get: function () {
      return SessionSetupScreen;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNavigationNative = require(_dependencyMap[1]);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesButton = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _featuresSessionStartSchemas = require(_dependencyMap[5]);
  var _featuresSessionStartHooks = require(_dependencyMap[6]);
  var _componentsSessionSetupFirstSessionView = require(_dependencyMap[7]);
  var _componentsSessionSetupReturningUserView = require(_dependencyMap[8]);
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[9]);
  var _reactJsxRuntime = require(_dependencyMap[10]);
  function SessionSetupScreenContent() {
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const route = (0, _reactNavigationNative.useRoute)();
    const [contractText, setContractText] = (0, _react.useState)('');
    const [selectedDifficulty, setSelectedDifficulty] = (0, _react.useState)('FOCUSED');
    const controller = (0, _featuresSessionStartHooks.useSessionStartController)({
      navigation,
      routeParams: route.params,
      focusContractText: contractText.trim().length >= 3 ? contractText : null
    });
    const isFirstSessionSetup = route.params?.source === _featuresSessionStartSchemas.SESSION_SETUP_SOURCE_ONBOARDING;
    if (isFirstSessionSetup) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsSessionSetupFirstSessionView.FirstSessionView, {
        navigation: navigation,
        onBack: () => navigation.goBack()
      });
    }
    if (!controller.userId) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flex: 1,
        bg: "background.primary",
        justifyContent: "center",
        alignItems: "center",
        p: "lg",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: "error.DEFAULT",
          mb: "md",
          children: "Not authenticated"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "primary",
          onPress: () => navigation.goBack(),
          accessibilityLabel: "Go back",
          accessibilityRole: "button",
          accessibilityHint: "Returns to the previous screen",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: "Go Back"
          })
        })]
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsSessionSetupReturningUserView.ReturningUserView, {
      controller: controller,
      contractText: contractText,
      setContractText: setContractText,
      selectedDifficulty: selectedDifficulty,
      setSelectedDifficulty: setSelectedDifficulty,
      navigation: navigation,
      route: route
    });
  }
  const SessionSetupScreen = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(SessionSetupScreenContent, 'Session Setup');
},3342,[12,1359,1462,1680,1489,2787,3343,3356,3373,2166,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useSessionStartController = useSessionStartController;
  exports.useSessionStake = useSessionStake;
  var _react = require(_dependencyMap[0]);
  var _tanstackReactQuery = require(_dependencyMap[1]);
  var _themesHooks = require(_dependencyMap[2]);
  var _themesSessionThemes = require(_dependencyMap[3]);
  var _streaksHooks = require(_dependencyMap[4]);
  var _networkUseNetInfo = require(_dependencyMap[5]);
  var _store = require(_dependencyMap[6]);
  var _contentStudyHooks = require(_dependencyMap[7]);
  var _learningExecutionHooks = require(_dependencyMap[8]);
  var _service = require(_dependencyMap[9]);
  var _screensSessionHooksUseSessionSetupState = require(_dependencyMap[10]);
  var _screensSessionHooksUseStartSessionFlow = require(_dependencyMap[11]);
  var _screensSessionUtilsSessionSetup = require(_dependencyMap[12]);
  var _liveopsConfigFeatureFlagService = require(_dependencyMap[13]);
  function useSessionStartController(input) {
    const {
      navigation,
      routeParams,
      focusContractText = null
    } = input;
    const {
      user
    } = (0, _store.useAuthStore)();
    const {
      isOffline
    } = (0, _networkUseNetInfo.useNetInfo)();
    const {
      data: streak
    } = (0, _streaksHooks.useStreak)(user?.id ?? null);
    const activeStudyPlan = (0, _contentStudyHooks.useActiveStudyPlan)();
    const learningExecutionLayer = (0, _learningExecutionHooks.useLearningExecutionLayer)(activeStudyPlan.data ?? null);
    const [shopTheme, setShopTheme] = (0, _react.useState)(null);
    const parsedRoute = (0, _react.useMemo)(() => (0, _service.parseSessionSetupParams)(routeParams), [routeParams]);
    const userId = user?.id ?? '';
    const setupState = (0, _screensSessionHooksUseSessionSetupState.useSessionSetupState)(userId, parsedRoute.params, streak?.currentDays ?? 0);
    const selectableThemesQuery = (0, _themesHooks.useSelectableThemes)(userId || null, streak ?? null);
    const userThemes = selectableThemesQuery.data ?? [];
    const selectedTheme = (0, _react.useMemo)(() => (0, _themesSessionThemes.getSessionThemeById)(setupState.selectedThemeId), [setupState.selectedThemeId]);
    const selectedDurationSeconds = setupState.selectedPreset.id === 'custom' ? setupState.customDuration * 60 : setupState.selectedPreset.duration;
    const filteredPresets = (0, _react.useMemo)(() => _screensSessionUtilsSessionSetup.PRESETS.filter(preset => preset.category === setupState.selectedCategory), [setupState.selectedCategory]);
    const activeChallenges = (0, _react.useMemo)(() => setupState.masteryState?.activeChallenges.filter(challenge => challenge.status === 'ACTIVE' && (challenge.technique === 'durationMastery' || challenge.technique === 'purityMastery')) ?? [], [setupState.masteryState]);
    const selectedThemeOwned = userThemes.find(item => item.id === setupState.selectedThemeId)?.isOwned ?? selectedTheme.isFree;
    const sessionSummary = (0, _react.useMemo)(() => (0, _service.buildSessionStartSummary)({
      currentThemeName: selectedTheme.name,
      durationMinutes: Math.round(selectedDurationSeconds / 60),
      hasCustomizations: setupState.showCustomization
    }), [selectedDurationSeconds, selectedTheme.name, setupState.showCustomization]);
    const sessionHero = (0, _react.useMemo)(() => (0, _service.buildSessionStartHero)({
      durationMinutes: Math.round(selectedDurationSeconds / 60),
      params: parsedRoute.params,
      presetName: setupState.selectedPreset.name,
      smartSuggestionDescription: setupState.smartSuggestion?.confidence && setupState.smartSuggestion.confidence >= 0.75 ? setupState.smartSuggestion.description : null
    }), [parsedRoute.params, selectedDurationSeconds, setupState.selectedPreset.name, setupState.smartSuggestion]);
    const offlineMessage = (0, _react.useMemo)(() => (0, _service.getOfflineSessionStartMessage)(isOffline), [isOffline]);
    const {
      clearStartError,
      handleStartSession,
      isStarting,
      startError
    } = (0, _screensSessionHooksUseStartSessionFlow.useStartSessionFlow)({
      draftGoal: setupState.draftGoal,
      focusContractText,
      navigation,
      params: parsedRoute.params,
      selectedDurationSeconds,
      selectedPreset: setupState.selectedPreset,
      selectedSessionMode: setupState.selectedSessionMode,
      selectedThemeId: setupState.selectedThemeId,
      selectedThemeOwned,
      userId
    });
    const handleThemePress = theme => {
      if (theme.isOwned || theme.isFree) {
        setupState.setSelectedThemeId(theme.id);
        return;
      }
      setShopTheme(theme);
    };
    return {
      activeChallenges,
      activeStudyPlan,
      clearStartError,
      filteredPresets,
      handleStartSession,
      handleThemePress,
      isStarting,
      learningExecutionLayer,
      offlineMessage,
      parsedRoute,
      selectableThemesQuery,
      selectedDurationSeconds,
      selectedTheme,
      selectedThemeOwned,
      sessionHero,
      sessionSummary,
      setupState,
      shopTheme,
      setShopTheme,
      startError,
      streak,
      user,
      userId,
      userThemes
    };
  }

  // ============================================================================
  // Session Stake Hook (Phase 2)
  // ============================================================================

  /**
   * @deprecated Session stakes (boss, challenge, streak economy) are gated
   * behind the final-release feature map. Only available when both
   * boss_tab and challenges are not hidden.
   */
  function useSessionStake(userId, durationSeconds, mode, selectedLoadout) {
    const enabled = !(0, _liveopsConfigFeatureFlagService.isFeatureHidden)('boss_tab') || !(0, _liveopsConfigFeatureFlagService.isFeatureHidden)('challenges');
    return (0, _tanstackReactQuery.useQuery)({
      queryKey: ['session-stake', userId, durationSeconds, mode, selectedLoadout],
      queryFn: () => (0, _service.buildSessionStake)(userId, durationSeconds, mode, selectedLoadout),
      enabled: enabled && !!userId && durationSeconds > 0,
      staleTime: 30000
    });
  }
},3343,[12,771,3344,3347,2261,2173,1705,2581,2753,2785,3348,3353,3349,1963]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "sessionThemeKeys", {
    enumerable: true,
    get: function () {
      return _hooksIndex.sessionThemeKeys;
    }
  });
  var _hooksIndex = require(_dependencyMap[0]);
  Object.keys(_hooksIndex).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) {
      Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
          return _hooksIndex[k];
        }
      });
    }
  });
},3344,[3345]);
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
  Object.defineProperty(exports, "sessionThemeKeys", {
    enumerable: true,
    get: function () {
      return sessionThemeKeys;
    }
  });
  exports.useOwnedSessionThemeIds = useOwnedSessionThemeIds;
  exports.useSelectableThemes = useSelectableThemes;
  exports.usePurchaseTheme = usePurchaseTheme;
  var _tanstackReactQuery = require(_dependencyMap[0]);
  var _sentryReactNative = require(_dependencyMap[1]);
  var Sentry = _interopNamespace(_sentryReactNative);
  var _sharedUiComponentsToast = require(_dependencyMap[2]);
  var _streaksHooks = require(_dependencyMap[3]);
  var _service = require(_dependencyMap[4]);
  const sessionThemeKeys = {
    all: ['session-themes'],
    owned: userId => [...sessionThemeKeys.all, 'owned', userId],
    list: (userId, longestDays) => [...sessionThemeKeys.all, 'list', userId, longestDays]
  };
  function useOwnedSessionThemeIds(userId) {
    return (0, _tanstackReactQuery.useQuery)({
      queryKey: sessionThemeKeys.owned(userId ?? ''),
      queryFn: () => {
        if (!userId) {
          throw new Error('User ID required');
        }
        return (0, _service.getOwnedSessionThemeIds)(userId);
      },
      enabled: !!userId
    });
  }
  function useSelectableThemes(userId, streak) {
    return (0, _tanstackReactQuery.useQuery)({
      queryKey: sessionThemeKeys.list(userId ?? '', streak?.longestDays ?? 0),
      queryFn: () => {
        if (!userId) {
          throw new Error('User ID required');
        }
        return (0, _service.getSelectableThemes)(userId, streak);
      },
      enabled: !!userId
    });
  }
  function usePurchaseTheme() {
    const queryClient = (0, _tanstackReactQuery.useQueryClient)();
    const {
      show
    } = (0, _sharedUiComponentsToast.useToast)();
    return (0, _tanstackReactQuery.useMutation)({
      mutationFn: ({
        userId,
        themeId,
        streak
      }) => (0, _service.purchaseTheme)(userId, themeId, streak),
      onMutate: async variables => {
        const ownedKey = sessionThemeKeys.owned(variables.userId);
        await queryClient.cancelQueries({
          queryKey: ownedKey
        });
        const previousOwned = queryClient.getQueryData(ownedKey);
        if (previousOwned && !previousOwned.includes(variables.themeId)) {
          queryClient.setQueryData(ownedKey, [...previousOwned, variables.themeId]);
        }
        const listKey = sessionThemeKeys.list(variables.userId, variables.streak?.longestDays ?? 0);
        const previousList = queryClient.getQueryData(listKey);
        if (previousList) {
          queryClient.setQueryData(listKey, previousList.map(theme => theme.id === variables.themeId ? Object.assign({}, theme, {
            isOwned: true
          }) : theme));
        }
        return {
          ownedKey,
          listKey,
          previousOwned,
          previousList
        };
      },
      onSuccess: async (_, variables) => {
        await Promise.all([queryClient.invalidateQueries({
          queryKey: sessionThemeKeys.owned(variables.userId)
        }), queryClient.invalidateQueries({
          queryKey: sessionThemeKeys.list(variables.userId, variables.streak?.longestDays ?? 0)
        }), queryClient.invalidateQueries({
          queryKey: ['economy', 'wallet', variables.userId]
        }), queryClient.invalidateQueries({
          queryKey: _streaksHooks.streakKeys.byUser(variables.userId)
        })]);
      },
      onError: (error, _variables, context) => {
        if (context?.previousOwned) {
          queryClient.setQueryData(context.ownedKey, context.previousOwned);
        }
        if (context?.previousList) {
          queryClient.setQueryData(context.listKey, context.previousList);
        }
        Sentry.captureException(error, {
          tags: {
            feature: 'themes',
            operation: 'purchaseTheme'
          }
        });
        show({
          type: 'error',
          title: 'Theme purchase failed',
          message: 'Try again when connection returns.'
        });
      }
    });
  }
},3345,[771,834,2159,2261,3346]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getOwnedSessionThemeIds = getOwnedSessionThemeIds;
  exports.getSelectableThemes = getSelectableThemes;
  exports.canPurchaseTheme = canPurchaseTheme;
  exports.purchaseTheme = purchaseTheme;
  var _sessionThemes = require(_dependencyMap[0]);
  const LEGENDARY_THEME_ID = 'legendary';
  async function getOwnedSessionThemeIds(userId) {
    userId;
    const result = [];
    for (const theme of _sessionThemes.SESSION_THEMES) {
      if (theme.isFree) {
        result.push(theme.id);
      }
    }
    return result;
  }
  async function getSelectableThemes(userId, streak) {
    const ownedIds = await getOwnedSessionThemeIds(userId);
    const longestDays = streak?.longestDays ?? 0;
    return _sessionThemes.SESSION_THEMES.map(theme => Object.assign({}, theme, {
      isOwned: theme.isFree || ownedIds.includes(theme.id),
      description: theme.id === LEGENDARY_THEME_ID && longestDays < 30 ? 'Reach a 30 day streak record to unlock purchase' : theme.description
    }));
  }
  function canPurchaseTheme(themeId, streak) {
    const theme = (0, _sessionThemes.getSessionThemeById)(themeId);
    if (theme.isFree) {
      return {
        allowed: true,
        message: null
      };
    }
    if (theme.id === LEGENDARY_THEME_ID && (streak?.longestDays ?? 0) < 30) {
      return {
        allowed: false,
        message: 'Legendary Focus unlocks after your first 30 day streak record.'
      };
    }
    return {
      allowed: true,
      message: null
    };
  }
  async function purchaseTheme(userId, themeId, streak) {
    const theme = (0, _sessionThemes.getSessionThemeById)(themeId);
    const gate = canPurchaseTheme(themeId, streak);
    if (!gate.allowed) {
      return {
        success: false,
        errorMessage: gate.message
      };
    }
    if (theme.isFree) {
      userId;
      return {
        success: true,
        errorMessage: null
      };
    }
    return {
      success: false,
      errorMessage: 'Theme purchases are not available in this release.'
    };
  }
},3346,[3347]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "SessionThemeSchema", {
    enumerable: true,
    get: function () {
      return SessionThemeSchema;
    }
  });
  Object.defineProperty(exports, "SESSION_THEMES", {
    enumerable: true,
    get: function () {
      return SESSION_THEMES;
    }
  });
  exports.getSessionThemeById = getSessionThemeById;
  var _zod = require(_dependencyMap[0]);
  var _themeTokensColors = require(_dependencyMap[1]);
  /**
   * Colors below are documented game-mechanic config data — not UI styling.
   * Mapped to theme.colors.accent.* and theme.colors.semantic.* where applicable.
   */

  const SessionThemeSchema = _zod.z.object({
    id: _zod.z.string().min(1),
    name: _zod.z.string().min(1),
    description: _zod.z.string().min(1),
    previewColor: _zod.z.string().min(1),
    backgroundTint: _zod.z.string().min(1),
    ambientSoundKey: _zod.z.string().nullable(),
    coinCost: _zod.z.number().int().min(0),
    isFree: _zod.z.boolean(),
    isOwned: _zod.z.boolean().optional()
  }).strict();
  const SESSION_THEMES = [{
    id: 'default',
    name: 'Focus Mode',
    description: 'Clean and minimal',
    previewColor: _themeTokensColors.lightColors.semantic.primary,
    backgroundTint: 'transparent',
    ambientSoundKey: null,
    coinCost: 0,
    isFree: true
  }, {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    description: 'Calm blue waters',
    previewColor: _themeTokensColors.lightColors.accent.teal,
    backgroundTint: _themeTokensColors.lightColors.semantic.backgroundMuted,
    ambientSoundKey: 'ocean',
    coinCost: 500,
    isFree: false
  }, {
    id: 'forest-night',
    name: 'Forest Night',
    description: 'Silent and grounded',
    previewColor: _themeTokensColors.lightColors.semantic.success,
    backgroundTint: _themeTokensColors.lightColors.semantic.backgroundMuted,
    ambientSoundKey: 'forest',
    coinCost: 500,
    isFree: false
  }, {
    id: 'ember',
    name: 'Ember',
    description: 'Warm and intense',
    previewColor: _themeTokensColors.lightColors.accent.orange,
    // Mapped to semantic warm-dark token in lieu of hardcoded hex
    backgroundTint: _themeTokensColors.lightColors.semantic.atmosphereBase1,
    ambientSoundKey: null,
    coinCost: 800,
    isFree: false
  }, {
    id: 'void',
    name: 'The Void',
    description: 'Pure focus, no distractions',
    previewColor: _themeTokensColors.lightColors.accent.purple,
    // Mapped to semantic deep-dark token in lieu of hardcoded hex
    backgroundTint: _themeTokensColors.lightColors.semantic.auroraDarkBase,
    ambientSoundKey: null,
    coinCost: 1200,
    isFree: false
  }, {
    id: 'legendary',
    name: 'Legendary Focus',
    description: 'Unlock after 30 day streak',
    previewColor: _themeTokensColors.lightColors.semantic.warning,
    // Mapped to semantic warm-dark token in lieu of hardcoded hex
    backgroundTint: _themeTokensColors.lightColors.semantic.atmosphereBase3,
    ambientSoundKey: null,
    coinCost: 5000,
    isFree: false
  }];
  function getSessionThemeById(themeId) {
    if (!themeId) {
      return SESSION_THEMES[0];
    }
    return SESSION_THEMES.find(theme => theme.id === themeId) ?? SESSION_THEMES[0];
  }
},3347,[1774,1465]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useSessionSetupState = useSessionSetupState;
  var _react = require(_dependencyMap[0]);
  var _featuresSessionStartService = require(_dependencyMap[1]);
  var _persistenceMMKVStorageAdapter = require(_dependencyMap[2]);
  var _sessionModes = require(_dependencyMap[3]);
  var _utilsSessionSetup = require(_dependencyMap[4]);
  var _sessionSetupHydration = require(_dependencyMap[5]);
  // Lazy-initialized state defaults to avoid recomputing on every render
  function resolveInitialPreset(params) {
    if (params?.presetId) {
      return _utilsSessionSetup.PRESETS.find(preset => preset.id === params.presetId) ?? _utilsSessionSetup.PRESETS[1];
    }
    return _utilsSessionSetup.PRESETS[1];
  }
  function resolveInitialDuration(params) {
    return params?.presetDuration ? Math.max(1, Math.round(params.presetDuration / 60)) : 30;
  }
  function resolveInitialSessionMode(params) {
    return params?.presetMode ? (0, _sessionModes.resolveSessionMode)(params.presetMode) : params?.source === 'content-study' ? _sessionModes.SessionMode.STUDY : _sessionModes.SessionMode.LIGHT_FOCUS;
  }
  function useSessionSetupState(userId, params, currentStreak) {
    const storage = (0, _react.useMemo)(() => (0, _persistenceMMKVStorageAdapter.getDefaultStorageAdapter)(), []);
    const sessionDraftKey = `session_draft_${userId}`;
    const masteryStateKey = `mastery_state_${userId}`;
    const initialPreset = (0, _react.useMemo)(() => resolveInitialPreset(params), [params?.presetId]);
    const [selectedPreset, setSelectedPreset] = (0, _react.useState)(initialPreset // ponytail: initialPreset always set by useMemo
    );
    const [selectedCategory, setSelectedCategory] = (0, _react.useState)(initialPreset?.category ?? 'standard');
    const [showAdvanced, setShowAdvanced] = (0, _react.useState)(false);
    const [customDuration, setCustomDuration] = (0, _react.useState)(() => resolveInitialDuration(params));
    const [draftGoal, setDraftGoal] = (0, _react.useState)(params?.goal);
    const [selectedThemeId, setSelectedThemeId] = (0, _react.useState)(params?.selectedThemeId ?? 'default');
    const [selectedSessionMode, setSelectedSessionMode] = (0, _react.useState)(() => resolveInitialSessionMode(params));
    const [showCustomization, setShowCustomization] = (0, _react.useState)(() => (0, _featuresSessionStartService.shouldOpenCustomizationByDefault)(params ?? {}));
    const [hasHydratedDraft, setHasHydratedDraft] = (0, _react.useState)(false);
    const [hasSavedDraft, setHasSavedDraft] = (0, _react.useState)(false);
    const [hasAutoAppliedSuggestion, setHasAutoAppliedSuggestion] = (0, _react.useState)(false);
    const [masteryState, setMasteryState] = (0, _react.useState)(null);
    const [smartSuggestion, setSmartSuggestion] = (0, _react.useState)(null);

    // SAFETY: params changes require synchronizing derived UI selections;
    // this effect is the single source of truth for parameter-drive state.
    (0, _react.useEffect)(() => {
      if (params?.presetId) {
        const matchedPreset = _utilsSessionSetup.PRESETS.find(preset => preset.id === params.presetId);
        if (matchedPreset) {
          setSelectedPreset(matchedPreset);
          setSelectedCategory(matchedPreset.category ?? 'standard');
        }
      }
      if (params?.selectedThemeId) {
        setSelectedThemeId(params.selectedThemeId);
      }
      if (params?.goal) {
        setDraftGoal(params.goal);
      }
      const routedDurationSeconds = params?.presetDuration ?? params?.suggestedDurationSeconds;
      if (routedDurationSeconds) {
        setSelectedPreset(_utilsSessionSetup.PRESETS[5]);
        setSelectedCategory('custom');
        setCustomDuration(Math.max(1, Math.round(routedDurationSeconds / 60)));
      }
      if (params?.presetMode) {
        setSelectedSessionMode((0, _sessionModes.resolveSessionMode)(params.presetMode));
      }
    }, [params?.goal, params?.presetDuration, params?.presetId, params?.presetMode, params?.selectedThemeId, params?.suggestedDurationSeconds]);

    // SAFETY: restoreSessionDraft performs async I/O (storage reads + master state fetch);
    // must run as effect triggered by user/session identity changes.
    (0, _react.useEffect)(() => {
      let isCancelled = false;
      const run = async () => {
        const result = await (0, _sessionSetupHydration.restoreSessionDraft)(storage, sessionDraftKey, masteryStateKey, userId, currentStreak, params);
        if (isCancelled) {
          return;
        }
        setMasteryState(result.masteryState);
        setSmartSuggestion(result.smartSuggestion);
        setHasSavedDraft(result.hasSavedDraft);
        if (result.presetOverride) {
          setSelectedPreset(result.presetOverride);
        }
        if (result.categoryOverride) {
          setSelectedCategory(result.categoryOverride);
        }
        if (result.customDurationOverride !== null) {
          setCustomDuration(result.customDurationOverride);
        }
        if (result.themeIdOverride) {
          setSelectedThemeId(result.themeIdOverride);
        }
        if (result.goalOverride !== null) {
          setDraftGoal(result.goalOverride);
        }
        if (result.showAdvancedOverride !== null) {
          setShowAdvanced(result.showAdvancedOverride);
        }
        if (result.showCustomizationOverride !== null) {
          setShowCustomization(result.showCustomizationOverride);
        }
      };
      run().finally(() => {
        if (!isCancelled) {
          setHasHydratedDraft(true);
        }
      });
      return () => {
        isCancelled = true;
      };
    }, [currentStreak, masteryStateKey, params, params?.goal, params?.presetDuration, params?.presetId, params?.selectedThemeId, params?.suggestedDurationSeconds, sessionDraftKey, storage, userId]);
    const prevAutoApplyKeyRef = (0, _react.useRef)(`${hasAutoAppliedSuggestion}-${hasHydratedDraft}-${JSON.stringify(params)}-${smartSuggestion?.preset.id ?? ''}`);
    const currentAutoApplyKey = `${hasAutoAppliedSuggestion}-${hasHydratedDraft}-${JSON.stringify(params)}-${smartSuggestion?.preset.id ?? ''}`;
    if (!hasAutoAppliedSuggestion && hasHydratedDraft && currentAutoApplyKey !== prevAutoApplyKeyRef.current) {
      prevAutoApplyKeyRef.current = currentAutoApplyKey;
      if ((0, _featuresSessionStartService.shouldAutoApplySmartSuggestion)({
        hasSavedDraft,
        params: params ?? {},
        smartSuggestionPresetId: smartSuggestion?.preset.id ?? null
      }) && smartSuggestion) {
        setSelectedPreset(smartSuggestion.preset);
        setSelectedCategory(smartSuggestion.preset.category ?? 'standard');
        setHasAutoAppliedSuggestion(true);
      }
    }

    // SAFETY: saveSessionDraft is an async side-effect that persists UI state to storage;
    // must run as an effect triggered by changes to draftable fields.
    (0, _react.useEffect)(() => {
      if (!userId || !hasHydratedDraft) {
        return;
      }
      (0, _sessionSetupHydration.saveSessionDraft)(storage, sessionDraftKey, {
        presetId: selectedPreset.id,
        selectedCategory,
        customDuration,
        selectedThemeId,
        showAdvanced,
        goal: draftGoal
      });
    }, [customDuration, draftGoal, hasHydratedDraft, selectedCategory, selectedPreset.id, selectedThemeId, sessionDraftKey, showAdvanced, storage, userId]);
    return {
      customDuration,
      draftGoal,
      masteryState,
      selectedCategory,
      selectedPreset,
      selectedSessionMode,
      selectedThemeId,
      showAdvanced,
      showCustomization,
      smartSuggestion,
      sessionDraftKey,
      storage,
      setCustomDuration,
      setDraftGoal,
      setSelectedCategory,
      setSelectedPreset,
      setSelectedSessionMode,
      setSelectedThemeId,
      setShowAdvanced,
      setShowCustomization
    };
  }
},3348,[12,2785,1717,1829,3349,3352]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "PRESET_CATEGORIES", {
    enumerable: true,
    get: function () {
      return _sessionSetupPresets.PRESET_CATEGORIES;
    }
  });
  Object.defineProperty(exports, "PRESETS", {
    enumerable: true,
    get: function () {
      return _sessionSetupPresets.PRESETS;
    }
  });
  Object.defineProperty(exports, "SESSION_DRAFT_MAX_AGE_MS", {
    enumerable: true,
    get: function () {
      return _sessionSetupSchemas.SESSION_DRAFT_MAX_AGE_MS;
    }
  });
  Object.defineProperty(exports, "SessionDraftSchema", {
    enumerable: true,
    get: function () {
      return _sessionSetupSchemas.SessionDraftSchema;
    }
  });
  Object.defineProperty(exports, "MasteryStateSchema", {
    enumerable: true,
    get: function () {
      return _sessionSetupSchemas.MasteryStateSchema;
    }
  });
  Object.defineProperty(exports, "getPresetById", {
    enumerable: true,
    get: function () {
      return _sessionSetupSchemas.getPresetById;
    }
  });
  Object.defineProperty(exports, "resolveSmartSuggestion", {
    enumerable: true,
    get: function () {
      return _sessionSetupSchemas.resolveSmartSuggestion;
    }
  });
  Object.defineProperty(exports, "buildPreviewGradient", {
    enumerable: true,
    get: function () {
      return _sessionSetupSchemas.buildPreviewGradient;
    }
  });
  Object.defineProperty(exports, "hydrateMasteryState", {
    enumerable: true,
    get: function () {
      return _sessionSetupSchemas.hydrateMasteryState;
    }
  });
  var _sessionSetupPresets = require(_dependencyMap[0]);
  var _sessionSetupSchemas = require(_dependencyMap[1]);
},3349,[3350,3351]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "PRESET_CATEGORIES", {
    enumerable: true,
    get: function () {
      return PRESET_CATEGORIES;
    }
  });
  Object.defineProperty(exports, "PRESETS", {
    enumerable: true,
    get: function () {
      return PRESETS;
    }
  });
  const PRESET_CATEGORIES = [{
    key: 'quick',
    label: 'Quick',
    icon: 'zap'
  }, {
    key: 'standard',
    label: 'Standard',
    icon: 'target'
  }, {
    key: 'deep',
    label: 'Deep',
    icon: 'brain'
  }, {
    key: 'custom',
    label: 'Custom',
    icon: 'sliders'
  }];
  const PRESETS = [{
    id: 'quick',
    name: 'Quick Focus',
    duration: 900,
    category: 'quick',
    icon: 'zap',
    intervals: 1,
    breakDuration: 300,
    longBreakDuration: 900,
    longBreakInterval: 4,
    isDefault: false,
    tags: [],
    soundEnabled: true,
    vibrationEnabled: true,
    dndEnabled: false,
    strictMode: false,
    autoStartBreaks: false,
    autoStartNextInterval: false,
    createdAt: 0,
    updatedAt: 0
  }, {
    id: 'pomodoro',
    name: 'Pomodoro',
    duration: 1500,
    category: 'standard',
    icon: 'timer',
    intervals: 4,
    breakDuration: 300,
    longBreakDuration: 900,
    longBreakInterval: 4,
    isDefault: true,
    tags: [],
    soundEnabled: true,
    vibrationEnabled: true,
    dndEnabled: false,
    strictMode: false,
    autoStartBreaks: false,
    autoStartNextInterval: false,
    createdAt: 0,
    updatedAt: 0
  }, {
    id: 'deep',
    name: 'Deep Work',
    duration: 3600,
    category: 'deep',
    icon: 'brain',
    intervals: 1,
    breakDuration: 600,
    longBreakDuration: 1800,
    longBreakInterval: 2,
    isDefault: false,
    tags: [],
    soundEnabled: true,
    vibrationEnabled: true,
    dndEnabled: true,
    strictMode: true,
    autoStartBreaks: false,
    autoStartNextInterval: false,
    createdAt: 0,
    updatedAt: 0
  }, {
    id: 'study',
    name: 'Study Session',
    duration: 2700,
    category: 'deep',
    icon: 'book',
    intervals: 2,
    breakDuration: 300,
    longBreakDuration: 900,
    longBreakInterval: 4,
    isDefault: false,
    tags: [],
    soundEnabled: true,
    vibrationEnabled: true,
    dndEnabled: false,
    strictMode: false,
    autoStartBreaks: false,
    autoStartNextInterval: false,
    createdAt: 0,
    updatedAt: 0
  }, {
    id: 'creative',
    name: 'Creative Flow',
    duration: 5400,
    category: 'deep',
    icon: 'palette',
    intervals: 1,
    breakDuration: 0,
    longBreakDuration: 0,
    longBreakInterval: 1,
    isDefault: false,
    tags: [],
    soundEnabled: false,
    vibrationEnabled: false,
    dndEnabled: true,
    strictMode: false,
    autoStartBreaks: false,
    autoStartNextInterval: false,
    createdAt: 0,
    updatedAt: 0
  }, {
    id: 'custom',
    name: 'Custom',
    duration: 1800,
    category: 'custom',
    icon: 'sliders',
    intervals: 1,
    breakDuration: 300,
    longBreakDuration: 900,
    longBreakInterval: 4,
    isDefault: false,
    tags: [],
    soundEnabled: true,
    vibrationEnabled: true,
    dndEnabled: false,
    strictMode: false,
    autoStartBreaks: false,
    autoStartNextInterval: false,
    createdAt: 0,
    updatedAt: 0
  }];
},3350,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "SESSION_DRAFT_MAX_AGE_MS", {
    enumerable: true,
    get: function () {
      return SESSION_DRAFT_MAX_AGE_MS;
    }
  });
  Object.defineProperty(exports, "SessionDraftSchema", {
    enumerable: true,
    get: function () {
      return SessionDraftSchema;
    }
  });
  Object.defineProperty(exports, "MasteryStateSchema", {
    enumerable: true,
    get: function () {
      return MasteryStateSchema;
    }
  });
  exports.getPresetById = getPresetById;
  exports.resolveSmartSuggestion = resolveSmartSuggestion;
  exports.buildPreviewGradient = buildPreviewGradient;
  exports.hydrateMasteryState = hydrateMasteryState;
  var _zod = require(_dependencyMap[0]);
  var _sessionSetupPresets = require(_dependencyMap[1]);
  const SESSION_DRAFT_MAX_AGE_MS = 3600000;
  const SessionDraftSchema = _zod.z.object({
    savedAt: _zod.z.number(),
    presetId: _zod.z.string(),
    selectedCategory: _zod.z.string(),
    customDuration: _zod.z.number().int().min(1),
    selectedThemeId: _zod.z.string(),
    showAdvanced: _zod.z.boolean(),
    goal: _zod.z.string().optional()
  });
  const MasteryStateSchema = _zod.z.object({
    userId: _zod.z.string().optional(),
    totalMasteryPoints: _zod.z.number().optional(),
    rank: _zod.z.enum(['APPRENTICE', 'ADEPT', 'EXPERT', 'MASTER', 'GRANDMASTER']).optional(),
    techniques: _zod.z.object({
      durationMastery: _zod.z.number(),
      purityMastery: _zod.z.number(),
      consistencyMastery: _zod.z.number(),
      comebackMastery: _zod.z.number(),
      bossMastery: _zod.z.number()
    }),
    activeChallenges: _zod.z.array(_zod.z.object({
      id: _zod.z.string(),
      technique: _zod.z.enum(['durationMastery', 'purityMastery', 'consistencyMastery', 'comebackMastery', 'bossMastery']),
      title: _zod.z.string(),
      description: _zod.z.string(),
      difficulty: _zod.z.enum(['EASY', 'MEDIUM', 'HARD', 'ELITE']),
      target: _zod.z.number(),
      current: _zod.z.number(),
      unit: _zod.z.string(),
      masteryPoints: _zod.z.number(),
      status: _zod.z.enum(['ACTIVE', 'COMPLETED', 'CLAIMED']),
      completedAt: _zod.z.number().nullable()
    })),
    unlockedFeatures: _zod.z.array(_zod.z.string()).optional(),
    updatedAt: _zod.z.number().optional()
  });
  function getPresetById(presetId) {
    return _sessionSetupPresets.PRESETS.find(preset => preset.id === presetId) ?? _sessionSetupPresets.PRESETS[1];
  }
  function resolveSmartSuggestion(mastery, currentStreak) {
    if (!mastery) {
      return null;
    }
    if (mastery.techniques.purityMastery < 5) {
      return {
        preset: getPresetById('quick'),
        description: 'Your purity scores suggest shorter sessions build better habits right now',
        confidence: 0.85
      };
    }
    if (mastery.techniques.durationMastery > 15) {
      return {
        preset: getPresetById('deep'),
        description: "You've consistently finished long sessions and you're ready for deep work",
        confidence: 0.82
      };
    }
    if (mastery.techniques.consistencyMastery < 5 && currentStreak > 0) {
      return {
        preset: getPresetById('pomodoro'),
        description: "The Pomodoro keeps streaks alive and it's the most consistent preset",
        confidence: 0.76
      };
    }
    return null;
  }
  function buildPreviewGradient(previewColor) {
    return [previewColor, `${previewColor}99`];
  }
  function hydrateMasteryState(mastery, userId) {
    return {
      userId: mastery.userId ?? userId,
      totalMasteryPoints: mastery.totalMasteryPoints ?? 0,
      rank: mastery.rank ?? 'APPRENTICE',
      techniques: mastery.techniques,
      activeChallenges: mastery.activeChallenges,
      unlockedFeatures: mastery.unlockedFeatures ?? [],
      updatedAt: mastery.updatedAt ?? Date.now()
    };
  }
},3351,[1774,3350]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.restoreSessionDraft = restoreSessionDraft;
  exports.saveSessionDraft = saveSessionDraft;
  var _utilsSilentFailure = require(_dependencyMap[0]);
  var _utilsSessionSetup = require(_dependencyMap[1]);
  const EMPTY_RESTORE = {
    masteryState: null,
    smartSuggestion: null,
    hasSavedDraft: false,
    presetOverride: null,
    categoryOverride: null,
    customDurationOverride: null,
    themeIdOverride: null,
    goalOverride: null,
    showAdvancedOverride: null,
    showCustomizationOverride: null
  };
  async function restoreSessionDraft(storage, sessionDraftKey, masteryStateKey, userId, currentStreak, params) {
    if (!userId) {
      return EMPTY_RESTORE;
    }
    try {
      const rawDraft = await storage.getItem(sessionDraftKey);
      const rawMastery = await storage.getItem(masteryStateKey);
      const parsedMastery = rawMastery ? _utilsSessionSetup.MasteryStateSchema.safeParse(JSON.parse(rawMastery)) : null;
      const masteryState = parsedMastery?.success ? (0, _utilsSessionSetup.hydrateMasteryState)(parsedMastery.data, userId) : null;
      const smartSuggestion = (0, _utilsSessionSetup.resolveSmartSuggestion)(parsedMastery?.success ? parsedMastery.data : null, currentStreak);
      if (!rawDraft) {
        return Object.assign({}, EMPTY_RESTORE, {
          masteryState,
          smartSuggestion
        });
      }
      const parsedDraft = _utilsSessionSetup.SessionDraftSchema.safeParse(JSON.parse(rawDraft));
      if (!parsedDraft.success) {
        await storage.removeItem(sessionDraftKey);
        return Object.assign({}, EMPTY_RESTORE, {
          masteryState,
          smartSuggestion
        });
      }
      if (Date.now() - parsedDraft.data.savedAt > _utilsSessionSetup.SESSION_DRAFT_MAX_AGE_MS) {
        await storage.removeItem(sessionDraftKey);
        return Object.assign({}, EMPTY_RESTORE, {
          masteryState,
          smartSuggestion
        });
      }
      const matchedPreset = _utilsSessionSetup.PRESETS.find(preset => preset.id === parsedDraft.data.presetId);
      const hasRoutedDuration = Boolean(params?.presetDuration ?? params?.suggestedDurationSeconds);
      const presetOverride = matchedPreset && !params?.presetId && !hasRoutedDuration ? matchedPreset : null;
      const categoryOverride = !params?.presetId && !hasRoutedDuration ? parsedDraft.data.selectedCategory : null;
      const customDurationOverride = !params?.presetId && !hasRoutedDuration ? parsedDraft.data.customDuration : null;
      const themeIdOverride = params?.selectedThemeId ? null : parsedDraft.data.selectedThemeId ?? null;
      const goalOverride = params?.goal ? null : parsedDraft.data.goal ?? null;
      const showAdvancedOverride = parsedDraft.data.showAdvanced ?? null;
      const showCustomizationOverride = parsedDraft.data.presetId !== (_utilsSessionSetup.PRESETS[1]?.id ?? '') || parsedDraft.data.selectedThemeId !== 'default' || parsedDraft.data.showAdvanced ? true : null;
      return {
        masteryState,
        smartSuggestion,
        hasSavedDraft: true,
        presetOverride,
        categoryOverride,
        customDurationOverride,
        themeIdOverride,
        goalOverride,
        showAdvancedOverride,
        showCustomizationOverride
      };
    } catch (error) {
      (0, _utilsSilentFailure.captureSilentFailure)(error, {
        feature: 'screens',
        operation: 'network-fallback',
        type: 'network'
      });
      try {
        await storage.removeItem(sessionDraftKey);
      } catch (removeError) {
        (0, _utilsSilentFailure.captureSilentFailure)(removeError, {
          feature: 'screens',
          operation: 'network-fallback',
          type: 'network'
        });
      }
      return EMPTY_RESTORE;
    }
  }
  async function saveSessionDraft(storage, sessionDraftKey, draft) {
    try {
      const draftPayload = _utilsSessionSetup.SessionDraftSchema.parse(Object.assign({
        savedAt: Date.now()
      }, draft));
      await storage.setItem(sessionDraftKey, JSON.stringify(draftPayload));
    } catch (error) {
      (0, _utilsSilentFailure.captureSilentFailure)(error, {
        feature: 'screens',
        operation: 'network-fallback',
        type: 'network'
      });
    }
  }
},3352,[1477,3349]);
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
  exports.useStartSessionFlow = useStartSessionFlow;
  var _utilsSilentFailure = require(_dependencyMap[0]);
  var _react = require(_dependencyMap[1]);
  var _sentryReactNative = require(_dependencyMap[2]);
  var Sentry = _interopNamespace(_sentryReactNative);
  var _featuresSessionSprintChainService = require(_dependencyMap[3]);
  var _featuresStreaksRestoreQuest = require(_dependencyMap[4]);
  var _persistenceMMKVStorageAdapter = require(_dependencyMap[5]);
  var _navigationNavigationHelpers = require(_dependencyMap[6]);
  var _sessionModes = require(_dependencyMap[7]);
  var _sessionHooksUseSession = require(_dependencyMap[8]);
  var _sessionTypesSchemas = require(_dependencyMap[9]);
  var _utilsHaptics = require(_dependencyMap[10]);
  var _featuresFocusContractService = require(_dependencyMap[11]);
  var _buildSessionContext = require(_dependencyMap[12]);
  function useStartSessionFlow({
    draftGoal,
    focusContractText,
    navigation,
    params,
    selectedDurationSeconds,
    selectedPreset,
    selectedSessionMode,
    selectedThemeId,
    selectedThemeOwned,
    userId
  }) {
    const {
      createSession,
      startSession
    } = (0, _sessionHooksUseSession.useSession)(userId);
    const storage = (0, _react.useMemo)(() => (0, _persistenceMMKVStorageAdapter.getMMKVStorageAdapter)(), []);
    const sessionDraftKey = `session_draft_${userId}`;
    const [isStarting, setIsStarting] = (0, _react.useState)(false);
    const [startError, setStartError] = (0, _react.useState)(null);
    const handleStartSession = (0, _react.useCallback)(async () => {
      setIsStarting(true);
      setStartError(null);
      let started = false;
      try {
        const {
          sessionTags,
          notesPayload
        } = (0, _buildSessionContext.buildSessionContext)(params, selectedPreset, selectedSessionMode, draftGoal, selectedThemeId, selectedThemeOwned);
        if (params?.comebackQuest) {
          await (0, _featuresStreaksRestoreQuest.startStreakRestoreQuest)(userId, params.comebackQuest.streakBefore);
        }
        const sprintChainState = selectedSessionMode === _sessionModes.SessionMode.SPRINT ? await (0, _featuresSessionSprintChainService.getSprintChainService)().getState(userId) : null;
        const sprintChainCount = sprintChainState ? Math.min(4, sprintChainState.completedCount + 1) : 1;
        const config = _sessionTypesSchemas.SessionConfigSchema.parse({
          duration: selectedDurationSeconds,
          breakDuration: selectedPreset.breakDuration,
          longBreakDuration: selectedPreset.longBreakDuration,
          intervals: selectedPreset.intervals,
          longBreakInterval: selectedPreset.longBreakInterval,
          category: params?.sessionCategory ?? selectedPreset.category,
          tags: sessionTags,
          soundEnabled: selectedPreset.soundEnabled,
          vibrationEnabled: selectedPreset.vibrationEnabled,
          dndEnabled: selectedPreset.dndEnabled,
          strictMode: selectedPreset.strictMode,
          sessionMode: selectedSessionMode,
          studyPlanId: params?.studyPlanId ?? params?.generationId,
          sprintChainCount,
          autoStartBreaks: selectedPreset.autoStartBreaks,
          autoStartNextInterval: selectedPreset.autoStartNextInterval,
          goal: draftGoal,
          comebackMultiplier: params?.comebackMultiplier,
          warContext: params?.warContext ?? null,
          notes: Object.keys(notesPayload).length > 0 ? JSON.stringify(notesPayload) : undefined
        });
        Sentry.addBreadcrumb({
          category: 'session-start',
          message: 'Creating session from setup flow',
          level: 'info'
        });
        const session = await createSession(config);
        const contractTask = focusContractText?.trim() ?? '';
        try {
          if (contractTask.length >= 3) {
            await (0, _featuresFocusContractService.createContract)({
              sessionId: session.id,
              taskDescription: contractTask
            }, userId);
          } else {
            await (0, _featuresFocusContractService.skipContract)(session.id, userId);
          }
        } catch (error) {
          Sentry.captureException(error, {
            tags: {
              feature: 'focus-contract',
              operation: 'session-start-create'
            }
          });
        }
        await startSession(0);
        started = true;
        await (0, _utilsHaptics.sessionStart)();
        if (selectedSessionMode === _sessionModes.SessionMode.DEEP_WORK) {
          setTimeout(() => {
            (0, _utilsHaptics.sessionStart)();
          }, 120);
        }
        (0, _navigationNavigationHelpers.navigateToSessionStackScreen)(navigation, 'ActiveSession', {
          sessionId: session.id,
          selectedThemeId: selectedThemeOwned ? selectedThemeId : 'default'
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unexpected session start failure';
        setStartError(errorMessage);
        Sentry.captureException(error, {
          tags: {
            feature: 'session-start',
            phase: 'start-flow'
          }
        });
      } finally {
        setIsStarting(false);
        if (started) {
          try {
            await storage.removeItem(sessionDraftKey);
          } catch (error) {
            (0, _utilsSilentFailure.captureSilentFailure)(error, {
              feature: 'screens',
              operation: 'network-fallback',
              type: 'network'
            });
          }
        }
      }
    }, [createSession, draftGoal, focusContractText, navigation, params, selectedDurationSeconds, selectedPreset, selectedSessionMode, selectedThemeId, selectedThemeOwned, sessionDraftKey, startSession, storage, userId]);
    return {
      clearStartError: () => setStartError(null),
      handleStartSession,
      isStarting,
      startError
    };
  }
},3353,[1477,12,834,3354,2072,1717,2052,1829,1957,1854,1683,3300,3355]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "SprintChainService", {
    enumerable: true,
    get: function () {
      return SprintChainService;
    }
  });
  exports.getSprintChainService = getSprintChainService;
  var _zod = require(_dependencyMap[0]);
  var _persistenceMMKVStorageAdapter = require(_dependencyMap[1]);
  var _persistenceSafeJson = require(_dependencyMap[2]);
  const SPRINT_CHAIN_WINDOW_MS = 7200000;
  const SPRINT_CHAIN_COMPLETE_COUNT = 4;
  const SprintChainStateSchema = _zod.z.object({
    completedCount: _zod.z.number().min(0).max(SPRINT_CHAIN_COMPLETE_COUNT),
    lastCompletedAt: _zod.z.number().nullable()
  });
  function getSprintChainKey(userId) {
    return `session:sprint-chain:${userId}`;
  }
  function getInitialState() {
    return {
      completedCount: 0,
      lastCompletedAt: null
    };
  }
  class SprintChainService {
    storage = (0, _persistenceMMKVStorageAdapter.getMMKVStorageAdapter)();
    async getState(userId) {
      const key = getSprintChainKey(userId);
      const raw = await this.storage.getItem(key);
      if (!raw) {
        return getInitialState();
      }
      const parsed = (0, _persistenceSafeJson.parseJsonWithSchema)(raw, SprintChainStateSchema, {
        feature: 'session',
        key
      });
      if (!parsed) {
        await this.reset(userId);
        return getInitialState();
      }
      if (this.isExpired(parsed)) {
        await this.reset(userId);
        return getInitialState();
      }
      return parsed;
    }
    async recordSprintCompleted(userId, completedAt = Date.now()) {
      const current = await this.getState(userId);
      const nextCount = current.completedCount >= SPRINT_CHAIN_COMPLETE_COUNT ? 1 : current.completedCount + 1;
      const nextState = SprintChainStateSchema.parse({
        completedCount: nextCount,
        lastCompletedAt: completedAt
      });
      if (nextCount >= SPRINT_CHAIN_COMPLETE_COUNT) {
        await this.reset(userId);
        return nextState;
      }
      const key = getSprintChainKey(userId);
      const encoded = (0, _persistenceSafeJson.stringifyJsonSafe)(nextState, {
        feature: 'session',
        key
      });
      if (encoded) {
        await this.storage.setItem(key, encoded);
      }
      return nextState;
    }
    async reset(userId) {
      await this.storage.removeItem(getSprintChainKey(userId));
    }
    isExpired(state) {
      if (!state.lastCompletedAt) {
        return false;
      }
      return Date.now() - state.lastCompletedAt > SPRINT_CHAIN_WINDOW_MS;
    }
  }
  let sprintChainService = null;
  function getSprintChainService() {
    if (!sprintChainService) {
      sprintChainService = new SprintChainService();
    }
    return sprintChainService;
  }
},3354,[1774,1717,1718]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.buildSessionContext = buildSessionContext;
  var _sessionModes = require(_dependencyMap[0]);
  function buildSessionContext(params, selectedPreset, selectedSessionMode, draftGoal, selectedThemeId, selectedThemeOwned) {
    const sessionTags = Array.from(new Set([...(selectedPreset.tags || []), ...(params?.sessionTags ?? [])]));
    const notesPayload = {};
    if (params?.source === 'content-study' || params?.source === 'learning-execution') {
      if (!sessionTags.includes('content-study')) {
        sessionTags.push('content-study');
      }
      if (params.source === 'learning-execution' && !sessionTags.includes('learning-execution')) {
        sessionTags.push('learning-execution');
      }
      if (params.studyPlanId && !sessionTags.includes(params.studyPlanId)) {
        sessionTags.push(params.studyPlanId);
      }
      if (params.focusAreas && params.focusAreas.length > 0) {
        sessionTags.push(...params.focusAreas.slice(0, 3));
      }
      notesPayload.source = params.source;
      notesPayload.generationId = params.generationId;
      notesPayload.contentId = params.contentId;
      notesPayload.studyPlanId = params.studyPlanId ?? params.generationId;
      notesPayload.focusAreas = params.focusAreas;
      notesPayload.learningExecutionLabel = params.learningExecutionLabel;
      notesPayload.learningExecutionTaskId = params.learningExecutionTaskId;
    }
    if (selectedThemeId && selectedThemeOwned) {
      notesPayload.selectedThemeId = selectedThemeId;
    }
    if (selectedSessionMode === _sessionModes.SessionMode.STUDY && draftGoal?.trim()) {
      notesPayload.studyTarget = draftGoal.trim();
    }
    if (params?.comebackMultiplier && params.comebackMultiplier > 1) {
      if (!sessionTags.includes('comeback-session')) {
        sessionTags.push('comeback-session');
      }
      notesPayload.comebackMultiplier = params.comebackMultiplier;
      notesPayload.comebackMessage = params.comebackMessage;
    }
    if (params?.comebackQuest) {
      if (!sessionTags.includes('streak-restore-quest')) {
        sessionTags.push('streak-restore-quest');
      }
      notesPayload.comebackQuest = params.comebackQuest;
    }
    return {
      sessionTags,
      notesPayload
    };
  }
},3355,[1829]);
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
  exports.FirstSessionView = FirstSessionView;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsKeyboardAvoidingView = require(_dependencyMap[1]);
  var KeyboardAvoidingView = _interopDefault(_reactNativeWebDistExportsKeyboardAvoidingView);
  require(_dependencyMap[2]);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesButton = require(_dependencyMap[4]);
  var _componentsPrimitivesText = require(_dependencyMap[5]);
  var _featuresSessionStartComponentsSessionStartStatusCard = require(_dependencyMap[6]);
  var _sessionModes = require(_dependencyMap[7]);
  var _featuresModeNativeComponentsModeQuickContract = require(_dependencyMap[8]);
  var _hooksUseFirstSessionPersonalization = require(_dependencyMap[9]);
  var _hooksUseFirstSessionStart = require(_dependencyMap[10]);
  var _store = require(_dependencyMap[11]);
  var _featuresOnboardingStore = require(_dependencyMap[12]);
  var _sharedUiLiquidGlassLiquidGlassScreen = require(_dependencyMap[13]);
  var _reactJsxRuntime = require(_dependencyMap[14]);
  const SESSION_MODE_TO_LANE = {
    [_sessionModes.SessionMode.STUDY]: 'student',
    [_sessionModes.SessionMode.LIGHT_FOCUS]: 'game_like',
    [_sessionModes.SessionMode.DEEP_WORK]: 'deep_creative',
    [_sessionModes.SessionMode.CREATIVE]: 'minimal_normal'
  };
  function sessionModeToLane(mode) {
    return SESSION_MODE_TO_LANE[mode] ?? 'minimal_normal';
  }
  function FirstSessionView({
    navigation,
    onBack
  }) {
    const personalization = (0, _hooksUseFirstSessionPersonalization.useFirstSessionPersonalization)();
    const {
      user
    } = (0, _store.useAuthStore)();
    const userId = user?.id ?? '';
    const markFirstSessionStarted = (0, _featuresOnboardingStore.useOnboardingStore)(s => s.markFirstSessionStarted);
    const [offlineMessage] = (0, _react.useState)(null);
    const [error, setError] = (0, _react.useState)(null);
    const mountedRef = (0, _react.useRef)(true);
    (0, _react.useEffect)(() => {
      return () => {
        mountedRef.current = false;
      };
    }, []);
    const {
      handleFirstSessionStart,
      isStarting
    } = (0, _hooksUseFirstSessionStart.useFirstSessionStart)({
      navigation,
      userId
    });
    const lane = (0, _react.useMemo)(() => sessionModeToLane(personalization.defaultMode), [personalization.defaultMode]);
    const handleContractAnswers = (0, _react.useCallback)(answers => {
      markFirstSessionStarted();
      const goal = Object.values(answers).join(' — ');
      handleFirstSessionStart({
        mode: personalization.defaultMode,
        durationMinutes: personalization.suggestedDurationMinutes,
        goal
      }).catch(err => {
        if (!mountedRef.current) {
          return;
        }
        const message = err instanceof Error ? err.message : 'Unexpected session start failure';
        setError(message);
      });
    }, [handleFirstSessionStart, markFirstSessionStarted, personalization.defaultMode, personalization.suggestedDurationMinutes]);
    if (!userId) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flex: 1,
        bg: "background.primary",
        justifyContent: "center",
        alignItems: "center",
        p: "lg",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: "error.DEFAULT",
          mb: "md",
          children: "Not authenticated"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "primary",
          onPress: onBack,
          accessibilityLabel: "Go back",
          accessibilityRole: "button",
          accessibilityHint: "Returns to the previous screen",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: "Go Back"
          })
        })]
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(KeyboardAvoidingView.default, {
      behavior: 'height',
      style: {
        flex: 1
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_sharedUiLiquidGlassLiquidGlassScreen.LiquidGlassScreen, {
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionStartComponentsSessionStartStatusCard.SessionStartStatusCard, {
          offlineMessage: offlineMessage,
          routeWarningMessage: null,
          startErrorMessage: error,
          onDismissStartError: () => setError(null)
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresModeNativeComponentsModeQuickContract.ModeQuickContract, {
          lane: lane,
          isStarting: isStarting,
          onStart: handleContractAnswers,
          onBack: onBack
        })]
      })
    });
  }
},3356,[12,1278,18,1462,1680,1489,3357,1829,3360,3371,3372,1705,1892,3091,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SessionStartStatusCard = SessionStartStatusCard;
  require(_dependencyMap[0]);
  var _componentsBanner = require(_dependencyMap[1]);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  function SessionStartStatusCard({
    offlineMessage,
    routeWarningMessage,
    startErrorMessage,
    onDismissStartError
  }) {
    if (!offlineMessage && !routeWarningMessage && !startErrorMessage) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      px: "lg",
      mb: "md",
      gap: "sm",
      children: [offlineMessage ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBanner.Banner, {
        variant: "warning",
        title: "Offline mode",
        description: offlineMessage
      }) : null, routeWarningMessage ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBanner.Banner, {
        variant: "info",
        title: "Fresh start applied",
        description: routeWarningMessage
      }) : null, startErrorMessage ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBanner.Banner, {
        variant: "error",
        title: "Could not start session",
        description: startErrorMessage,
        secondaryActionText: "Dismiss",
        onSecondaryAction: onDismissStartError
      }) : null]
    });
  }
},3357,[12,3358,1462,203]);
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
  Object.defineProperty(exports, "Banner", {
    enumerable: true,
    get: function () {
      return Banner;
    }
  });
  var _react = require(_dependencyMap[0]);
  var React = _interopDefault(_react);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[2]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsImage = require(_dependencyMap[3]);
  var Image = _interopDefault(_reactNativeWebDistExportsImage);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _primitivesText = require(_dependencyMap[5]);
  var _iconsComponentsIcon = require(_dependencyMap[6]);
  var _primitivesButton = require(_dependencyMap[7]);
  var _utilsHaptics = require(_dependencyMap[8]);
  var _BannerConfig = require(_dependencyMap[9]);
  var _reactJsxRuntime = require(_dependencyMap[10]);
  const Banner = /*#__PURE__*/React.default.memo(({
    title,
    description,
    variant = 'default',
    size = 'md',
    icon,
    backgroundImage,
    actionText,
    onAction,
    secondaryActionText,
    onSecondaryAction,
    onDismiss,
    fullWidth = true,
    style
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const variantStyles = (0, _BannerConfig.getVariantStyles)(variant, theme.colors);
    const currentSize = _BannerConfig.sizeStyles[size];
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: [_BannerConfig.styles.container, {
        backgroundColor: variantStyles.backgroundColor,
        padding: currentSize.padding,
        borderRadius: currentSize.borderRadius
      }, fullWidth && _BannerConfig.styles.fullWidth, style],
      children: [backgroundImage && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Image.default, {
        source: backgroundImage,
        resizeMode: "cover",
        style: [_BannerConfig.styles.backgroundImage, {
          borderRadius: currentSize.borderRadius
        }]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _BannerConfig.styles.content,
        children: [icon && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: [_BannerConfig.styles.iconContainer, {
            marginRight: currentSize.padding
          }],
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
            name: icon,
            size: currentSize.iconSize,
            color: variantStyles.iconColor
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: _BannerConfig.styles.textContainer,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesText.Text, {
            variant: currentSize.titleSize,
            style: {
              color: variantStyles.textColor,
              fontWeight: '600'
            },
            children: title
          }), description && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesText.Text, {
            variant: currentSize.descSize,
            style: {
              color: variantStyles.textColor,
              opacity: 0.9,
              marginTop: 4
            },
            children: description
          }), (actionText || secondaryActionText) && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: _BannerConfig.styles.actions,
            children: [actionText && onAction && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesButton.Button, {
              variant: variantStyles.buttonVariant,
              size: "sm",
              onPress: onAction,
              style: {
                marginRight: secondaryActionText ? 8 : 0
              },
              accessibilityLabel: actionText ?? 'Perform action',
              accessibilityRole: "button",
              accessibilityHint: "Performs the primary banner action",
              children: actionText
            }), secondaryActionText && onSecondaryAction && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesButton.Button, {
              variant: "ghost",
              size: "sm",
              onPress: onSecondaryAction,
              accessibilityLabel: secondaryActionText ?? 'Perform secondary action',
              accessibilityRole: "button",
              accessibilityHint: "Performs the secondary banner action",
              children: secondaryActionText
            })]
          })]
        }), onDismiss && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          onPress: () => {
            (0, _utilsHaptics.buttonTap)();
            onDismiss();
          },
          style: ({
            pressed
          }) => [_BannerConfig.styles.dismissButton, pressed && {
            opacity: 0.7
          }],
          accessibilityLabel: `Dismiss ${title}`,
          accessibilityRole: "button",
          accessibilityHint: "Double tap to dismiss",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
            name: "close",
            size: 20,
            color: variantStyles.textColor
          })
        })]
      })]
    });
  });
  Banner.displayName = 'Banner';
},3358,[12,80,1286,469,1463,1489,1691,1680,1683,3359,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getVariantStyles = getVariantStyles;
  Object.defineProperty(exports, "sizeStyles", {
    enumerable: true,
    get: function () {
      return sizeStyles;
    }
  });
  Object.defineProperty(exports, "styles", {
    enumerable: true,
    get: function () {
      return styles;
    }
  });
  var _sharedUiCreateSheet = require(_dependencyMap[0]);
  var _themeTokensColors = require(_dependencyMap[1]);
  function getVariantStyles(variant, colors) {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary[500],
          textColor: _themeTokensColors.lightColors.text.inverse,
          iconColor: _themeTokensColors.lightColors.text.inverse,
          buttonVariant: 'secondary'
        };
      case 'success':
        return {
          backgroundColor: colors.success.DEFAULT,
          textColor: _themeTokensColors.lightColors.text.inverse,
          iconColor: _themeTokensColors.lightColors.text.inverse,
          buttonVariant: 'secondary'
        };
      case 'warning':
        return {
          backgroundColor: colors.warning.DEFAULT,
          textColor: colors.text.primary,
          iconColor: colors.text.primary,
          buttonVariant: 'primary'
        };
      case 'error':
        return {
          backgroundColor: colors.error.DEFAULT,
          textColor: _themeTokensColors.lightColors.text.inverse,
          iconColor: _themeTokensColors.lightColors.text.inverse,
          buttonVariant: 'secondary'
        };
      case 'info':
        return {
          backgroundColor: colors.info.DEFAULT,
          textColor: _themeTokensColors.lightColors.text.inverse,
          iconColor: _themeTokensColors.lightColors.text.inverse,
          buttonVariant: 'secondary'
        };
      case 'gradient':
        return {
          backgroundColor: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.accent.premium})`,
          textColor: _themeTokensColors.lightColors.text.inverse,
          iconColor: _themeTokensColors.lightColors.text.inverse,
          buttonVariant: 'secondary'
        };
      default:
        return {
          backgroundColor: colors.background.secondary,
          textColor: colors.text.primary,
          iconColor: colors.primary[500],
          buttonVariant: 'primary'
        };
    }
  }
  const sizeStyles = {
    sm: {
      padding: 12,
      iconSize: 20,
      titleSize: 'h4',
      descSize: 'caption',
      borderRadius: 8
    },
    md: {
      padding: 16,
      iconSize: 24,
      titleSize: 'h3',
      descSize: 'body',
      borderRadius: 12
    },
    lg: {
      padding: 20,
      iconSize: 32,
      titleSize: 'h2',
      descSize: 'body',
      borderRadius: 16
    }
  };
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      overflow: 'hidden',
      position: 'relative'
    },
    fullWidth: {
      width: '100%'
    },
    backgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      resizeMode: 'cover',
      opacity: 0.3
    },
    content: {
      flexDirection: 'row',
      alignItems: 'flex-start'
    },
    iconContainer: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    textContainer: {
      flex: 1
    },
    actions: {
      flexDirection: 'row',
      marginTop: 12,
      alignItems: 'center'
    },
    dismissButton: {
      marginLeft: 8,
      padding: 4
    }
  });
},3359,[1678,1465]);
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
  exports.ModeQuickContract = ModeQuickContract;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsTextInput = require(_dependencyMap[2]);
  var TextInput = _interopDefault(_reactNativeWebDistExportsTextInput);
  var _reactNativeWebDistExportsKeyboardAvoidingView = require(_dependencyMap[3]);
  var KeyboardAvoidingView = _interopDefault(_reactNativeWebDistExportsKeyboardAvoidingView);
  require(_dependencyMap[4]);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[5]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _componentsPrimitivesBox = require(_dependencyMap[6]);
  var _componentsPrimitivesText = require(_dependencyMap[7]);
  var _themeThemeContext = require(_dependencyMap[8]);
  var _hooks = require(_dependencyMap[9]);
  var _reactJsxRuntime = require(_dependencyMap[10]);
  function ModeQuickContract({
    lane,
    isStarting,
    onStart,
    onBack
  }) {
    const contract = (0, _hooks.useModeQuickContract)(lane);
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const [answers, setAnswers] = (0, _react.useState)({});
    const [showAdvanced, setShowAdvanced] = (0, _react.useState)(false);
    const handleAnswer = (0, _react.useCallback)((key, value) => {
      setAnswers(prev => Object.assign({}, prev, {
        [key]: value
      }));
    }, []);
    const allAnswered = contract.questions.every(q => (answers[q.key] ?? '').trim().length >= 3);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(KeyboardAvoidingView.default, {
      behavior: 'height',
      style: {
        flex: 1
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(ScrollView.default, {
        keyboardShouldPersistTaps: "handled",
        contentContainerStyle: {
          flexGrow: 1
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flex: 1,
          bg: "background.primary",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            px: "md",
            pt: "lg",
            pb: "sm",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
              onPress: onBack,
              accessibilityLabel: "Go back",
              accessibilityRole: "button",
              accessibilityHint: "Returns to the home screen",
              style: {
                minHeight: 44,
                minWidth: 44,
                justifyContent: 'center'
              },
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "body",
                color: "text.secondary",
                children: "\u2190 Back"
              })
            })
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flex: 1,
            px: "lg",
            pt: "xl",
            gap: "xl",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
              gap: "xs",
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "h3",
                color: "text.primary",
                children: contract.title
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
                variant: "bodySmall",
                color: "text.secondary",
                children: [contract.durationLabel, " ~", contract.suggestedDurationMinutes, " minutes"]
              })]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
              gap: "lg",
              children: contract.questions.map(q => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
                gap: "xs",
                children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  variant: "label",
                  color: "text.primary",
                  children: q.label
                }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(TextInput.default, {
                  value: answers[q.key] ?? '',
                  onChangeText: text => handleAnswer(q.key, text),
                  placeholder: q.placeholder,
                  placeholderTextColor: theme.colors.text.tertiary,
                  accessibilityLabel: q.label,
                  accessibilityHint: `Enter your ${q.label.toLowerCase()}`,
                  style: {
                    minHeight: 52,
                    paddingHorizontal: theme.spacing[4],
                    paddingVertical: theme.spacing[3],
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.md,
                    borderWidth: 1,
                    borderColor: (answers[q.key] ?? '').trim().length >= 3 ? theme.colors.primary[500] : theme.colors.border.light,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.body.medium.fontSize
                  }
                })]
              }, q.key))
            }), contract.showAdvancedSettings && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
              onPress: () => setShowAdvanced(prev => !prev),
              accessibilityLabel: "Toggle advanced settings",
              accessibilityRole: "button",
              accessibilityHint: "Shows or hides extra session customization options",
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
                minHeight: 44,
                justifyContent: "center",
                alignItems: "center",
                py: "sm",
                children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  variant: "caption",
                  color: "text.tertiary",
                  children: showAdvanced ? 'Hide advanced settings' : 'Advanced settings'
                })
              })
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            px: "lg",
            pb: "xl",
            pt: "md",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
              onPress: () => {
                if (allAnswered && !isStarting) {
                  onStart(answers);
                }
              },
              disabled: !allAnswered || isStarting,
              accessibilityLabel: contract.startLabel,
              accessibilityRole: "button",
              accessibilityHint: allAnswered ? `Starts a ${contract.lane} session` : 'Fill in all questions first',
              style: ({
                pressed
              }) => ({
                opacity: !allAnswered || isStarting ? 0.4 : pressed ? 0.85 : 1
              }),
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
                minHeight: 52,
                borderRadius: "lg",
                bg: "primary.500",
                justifyContent: "center",
                alignItems: "center",
                children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  variant: "button",
                  color: "text.inverse",
                  fontWeight: "600",
                  children: isStarting ? 'Starting...' : contract.startLabel
                })
              })
            })
          })]
        })
      })
    });
  }
},3360,[12,1286,496,1278,18,171,1462,1489,1463,3361,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useModeHomeSurface = useModeHomeSurface;
  exports.useModeQuickContract = useModeQuickContract;
  exports.useModeActiveIndicator = useModeActiveIndicator;
  exports.useModeCompletion = useModeCompletion;
  exports.useModeRescueSurface = useModeRescueSurface;
  exports.useModeWeeklyIntelligence = useModeWeeklyIntelligence;
  var _react = require(_dependencyMap[0]);
  var _tanstackReactQuery = require(_dependencyMap[1]);
  var _service = require(_dependencyMap[2]);
  var _serviceSurface = require(_dependencyMap[3]);
  // ── Mode Home Hook ─────────────────────────────────────────────────────

  function useModeHomeSurface(context) {
    return (0, _react.useMemo)(() => (0, _service.deriveHomeSurface)(context), [context]);
  }

  // ── Quick Contract Hook ────────────────────────────────────────────────

  function useModeQuickContract(laneOverride) {
    return (0, _react.useMemo)(() => (0, _service.deriveQuickContract)(laneOverride), [laneOverride]);
  }

  // ── Active Indicator Hook ──────────────────────────────────────────────

  function useModeActiveIndicator(laneOverride) {
    return (0, _react.useMemo)(() => (0, _service.deriveActiveIndicator)(laneOverride), [laneOverride]);
  }

  // ── Completion Surface Hook ────────────────────────────────────────────

  function useModeCompletion(context) {
    return (0, _react.useMemo)(() => (0, _serviceSurface.deriveCompletionSurface)(context), [context]);
  }

  // ── Rescue Surface Hook ────────────────────────────────────────────────

  function useModeRescueSurface(laneOverride) {
    return (0, _react.useMemo)(() => (0, _service.deriveRescueSurface)(laneOverride), [laneOverride]);
  }

  // ── Weekly Intelligence Hook ───────────────────────────────────────────

  const WEEKLY_INTELLIGENCE_KEY = 'mode-native-weekly-intelligence';
  function useModeWeeklyIntelligence(userId, context) {
    return (0, _tanstackReactQuery.useQuery)({
      queryKey: [WEEKLY_INTELLIGENCE_KEY, userId, context.laneOverride],
      queryFn: () => (0, _serviceSurface.deriveWeeklyIntelligence)(context),
      enabled: Boolean(userId) && Boolean(context.laneOverride),
      staleTime: 300000
    });
  }
},3361,[12,771,3362,3370]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.deriveHomeSurface = deriveHomeSurface;
  exports.deriveQuickContract = deriveQuickContract;
  exports.deriveActiveIndicator = deriveActiveIndicator;
  exports.deriveRescueSurface = deriveRescueSurface;
  var _laneEngineSchemas = require(_dependencyMap[0]);
  var _copy = require(_dependencyMap[1]);
  var _schemas = require(_dependencyMap[2]);
  // ── Helpers ────────────────────────────────────────────────────────────

  function resolveLane(raw) {
    const parsed = _laneEngineSchemas.LaneSchema.safeParse(raw);
    return parsed.success ? parsed.data : 'minimal_normal';
  }

  // ── Home context ───────────────────────────────────────────────────────

  function deriveHomeSurface(context) {
    const lane = context.laneOverride ? resolveLane(context.laneOverride) : 'minimal_normal';
    const hasEvidence = (context.completedSessions ?? 0) >= 3;
    const base = hasEvidence ? _copy.EVIDENCE_HOME_COPY[lane] : _copy.COLD_START_HOME_COPY[lane];
    let body = base.body;

    // Only apply evidence-backed enrichment when evidence exists
    if (hasEvidence) {
      if (lane === 'deep_creative' && context.hasActiveProject && context.nextMove) {
        body = `Next move: ${context.nextMove}. Pick up where you stopped.`;
      }
      if (lane === 'student' && context.recentTopic && context.weakTopicCount !== undefined && context.weakTopicCount > 0) {
        body = `Review "${context.recentTopic}" — ${context.weakTopicCount} topic${context.weakTopicCount === 1 ? '' : 's'} need${context.weakTopicCount === 1 ? 's' : ''} attention. ${base.suggestedDurationMinutes} minutes.`;
      } else if (lane === 'student' && context.recentTopic) {
        body = `Your next study block: "${context.recentTopic}" for ${base.suggestedDurationMinutes} minutes.`;
      }
      if (lane === 'game_like' && context.cleanStartsThisWeek !== undefined && context.cleanStartsThisWeek > 0) {
        body = `${context.cleanStartsThisWeek} clean start${context.cleanStartsThisWeek === 1 ? '' : 's'} this week. Keep the momentum going.`;
      }
    }
    return _schemas.ModeHomeSurfaceSchema.parse(Object.assign({}, base, {
      lane,
      body
    }));
  }

  // ── Quick Contract ─────────────────────────────────────────────────────

  function deriveQuickContract(laneOverride) {
    const lane = resolveLane(laneOverride);
    const base = _copy.QUICK_CONTRACT_COPY[lane];
    return _schemas.ModeQuickContractSchema.parse(Object.assign({}, base, {
      lane
    }));
  }

  // ── Active Indicator ───────────────────────────────────────────────────

  function deriveActiveIndicator(laneOverride) {
    const lane = resolveLane(laneOverride);
    const base = _copy.ACTIVE_INDICATOR_COPY[lane];
    return _schemas.ModeActiveIndicatorSchema.parse(Object.assign({}, base, {
      lane
    }));
  }

  // ── Rescue Surface ─────────────────────────────────────────────────────

  function deriveRescueSurface(laneOverride) {
    const lane = resolveLane(laneOverride);
    const base = _copy.RESCUE_COPY[lane];
    return _schemas.ModeRescueSurfaceSchema.parse(Object.assign({}, base, {
      lane
    }));
  }
},3362,[1889,3363,3369]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "HOME_COPY", {
    enumerable: true,
    get: function () {
      return _copyHome.HOME_COPY;
    }
  });
  Object.defineProperty(exports, "EVIDENCE_HOME_COPY", {
    enumerable: true,
    get: function () {
      return _copyHome.EVIDENCE_HOME_COPY;
    }
  });
  Object.defineProperty(exports, "COLD_START_HOME_COPY", {
    enumerable: true,
    get: function () {
      return _copyHome.COLD_START_HOME_COPY;
    }
  });
  Object.defineProperty(exports, "QUICK_CONTRACT_COPY", {
    enumerable: true,
    get: function () {
      return _copyHome.QUICK_CONTRACT_COPY;
    }
  });
  Object.defineProperty(exports, "ACTIVE_INDICATOR_COPY", {
    enumerable: true,
    get: function () {
      return _copySession.ACTIVE_INDICATOR_COPY;
    }
  });
  Object.defineProperty(exports, "COMPLETION_COPY", {
    enumerable: true,
    get: function () {
      return _copySession.COMPLETION_COPY;
    }
  });
  Object.defineProperty(exports, "EVIDENCE_COMPLETION_COPY", {
    enumerable: true,
    get: function () {
      return _copySession.EVIDENCE_COMPLETION_COPY;
    }
  });
  Object.defineProperty(exports, "COLD_START_COMPLETION_COPY", {
    enumerable: true,
    get: function () {
      return _copySession.COLD_START_COMPLETION_COPY;
    }
  });
  Object.defineProperty(exports, "RESCUE_COPY", {
    enumerable: true,
    get: function () {
      return _copySession.RESCUE_COPY;
    }
  });
  Object.defineProperty(exports, "WEEKLY_INTELLIGENCE_COPY", {
    enumerable: true,
    get: function () {
      return _copySession.WEEKLY_INTELLIGENCE_COPY;
    }
  });
  Object.defineProperty(exports, "EVIDENCE_WEEKLY_INTELLIGENCE_COPY", {
    enumerable: true,
    get: function () {
      return _copySession.EVIDENCE_WEEKLY_INTELLIGENCE_COPY;
    }
  });
  Object.defineProperty(exports, "COLD_START_WEEKLY_INTELLIGENCE_COPY", {
    enumerable: true,
    get: function () {
      return _copySession.COLD_START_WEEKLY_INTELLIGENCE_COPY;
    }
  });
  var _copyHome = require(_dependencyMap[0]);
  var _copySession = require(_dependencyMap[1]);
},3363,[3364,3365]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "EVIDENCE_HOME_COPY", {
    enumerable: true,
    get: function () {
      return EVIDENCE_HOME_COPY;
    }
  });
  Object.defineProperty(exports, "COLD_START_HOME_COPY", {
    enumerable: true,
    get: function () {
      return COLD_START_HOME_COPY;
    }
  });
  Object.defineProperty(exports, "HOME_COPY", {
    enumerable: true,
    get: function () {
      return HOME_COPY;
    }
  });
  Object.defineProperty(exports, "QUICK_CONTRACT_COPY", {
    enumerable: true,
    get: function () {
      return QUICK_CONTRACT_COPY;
    }
  });
  // ── Evidence-backed home copy (shown when user has session data) ────────

  const EVIDENCE_HOME_COPY = {
    student: {
      primaryFeeling: 'VEX knows what I should study next.',
      headline: 'Your next study block is ready',
      body: "Review the topic that needs the most attention. VEX tracks what sticks and what doesn't.",
      primaryAction: 'start_study_block',
      primaryActionLabel: 'Start study block',
      suggestedDurationMinutes: 20,
      secondaryHint: '20 minutes. One topic. No distractions.',
      rhythmLabel: 'Best study rhythm: mornings'
    },
    game_like: {
      primaryFeeling: 'VEX knows how to get me moving.',
      headline: 'Start a quest',
      body: 'Your best momentum comes from naming the task first. No boss today — just forward motion.',
      primaryAction: 'start_clean_run',
      primaryActionLabel: 'Start quest',
      suggestedDurationMinutes: 25,
      secondaryHint: 'Name the one thing. Then move.',
      rhythmLabel: 'Best momentum: after first task'
    },
    deep_creative: {
      primaryFeeling: 'VEX remembers where I left off.',
      headline: 'Your create block is waiting',
      body: 'Pick up right where you stopped. The next move is already saved — just resume.',
      primaryAction: 'resume_project',
      primaryActionLabel: 'Resume create block',
      suggestedDurationMinutes: 30,
      secondaryHint: 'Next move is saved. Open the thread.',
      rhythmLabel: 'Deep work window: afternoons'
    },
    minimal_normal: {
      primaryFeeling: 'VEX gets out of the way.',
      headline: 'One focus action',
      body: 'No dashboard. No noise. Just one thing, 15 minutes, done.',
      primaryAction: 'start_session',
      primaryActionLabel: 'Start',
      suggestedDurationMinutes: 15,
      secondaryHint: "One action. 15 minutes. That's it.",
      rhythmLabel: null
    }
  };

  // ── Cold-start home copy (shown when VEX has no session evidence) ──────

  const COLD_START_HOME_COPY = {
    student: {
      primaryFeeling: 'I want to build a study habit.',
      headline: 'Start your next study block',
      body: 'Start with one named study target. VEX will learn what needs review.',
      primaryAction: 'start_study_block',
      primaryActionLabel: 'Start study block',
      suggestedDurationMinutes: 20,
      secondaryHint: 'Name one topic. One block. No distractions.',
      rhythmLabel: null
    },
    game_like: {
      primaryFeeling: 'I want clean starts to become a pattern.',
      headline: 'Start a quest',
      body: 'Start one small quest. VEX will learn what helps you keep momentum.',
      primaryAction: 'start_clean_run',
      primaryActionLabel: 'Start quest',
      suggestedDurationMinutes: 25,
      secondaryHint: 'Name the one thing. Then move.',
      rhythmLabel: null
    },
    deep_creative: {
      primaryFeeling: 'I want to protect my deep work.',
      headline: 'Start a create block',
      body: 'Name the project and save the next move after this block.',
      primaryAction: 'resume_project',
      primaryActionLabel: 'Start create block',
      suggestedDurationMinutes: 30,
      secondaryHint: 'Save your next move before closing.',
      rhythmLabel: null
    },
    minimal_normal: {
      primaryFeeling: 'I want one clean action.',
      headline: 'One focus action',
      body: 'One clean action. VEX will stay quiet unless you ask for more.',
      primaryAction: 'start_session',
      primaryActionLabel: 'Start',
      suggestedDurationMinutes: 15,
      secondaryHint: "One action. 15 minutes. That's it.",
      rhythmLabel: null
    }
  };

  // ── Default export for backward compat (evidence-backed) ────────────────

  /** @deprecated — use EVIDENCE_HOME_COPY or COLD_START_HOME_COPY explicitly */
  const HOME_COPY = EVIDENCE_HOME_COPY;

  // ── Quick Contract copy (no evidence dependency — user fills fields) ────

  const QUICK_CONTRACT_COPY = {
    student: {
      title: 'Quick contract: Study',
      questions: [{
        key: 'topic',
        label: 'What are you studying?',
        placeholder: 'e.g. "Graph traversal algorithms"'
      }, {
        key: 'done',
        label: 'What will count as done?',
        placeholder: 'e.g. "Understand BFS and DFS with examples"'
      }],
      durationLabel: 'Study for',
      suggestedDurationMinutes: 20,
      startLabel: 'Start study block',
      showAdvancedSettings: false
    },
    game_like: {
      title: 'Quick contract: Quest',
      questions: [{
        key: 'task',
        label: 'What do you want to move through?',
        placeholder: 'e.g. "Ship the onboarding flow"'
      }, {
        key: 'start',
        label: 'What would a clean start look like?',
        placeholder: 'e.g. "Open the file, named the first change"'
      }],
      durationLabel: 'Quest for',
      suggestedDurationMinutes: 25,
      startLabel: 'Start quest',
      showAdvancedSettings: false
    },
    deep_creative: {
      title: 'Quick contract: Create',
      questions: [{
        key: 'project',
        label: 'What are you creating?',
        placeholder: 'e.g. "VEX onboarding redesign"'
      }, {
        key: 'move',
        label: 'What is the next move?',
        placeholder: 'e.g. "Outline the welcome flow"'
      }],
      durationLabel: 'Protect for',
      suggestedDurationMinutes: 30,
      startLabel: 'Start create block',
      showAdvancedSettings: false
    },
    minimal_normal: {
      title: 'Quick contract: Focus',
      questions: [{
        key: 'action',
        label: 'What is the one action?',
        placeholder: 'e.g. "Clear inbox to zero"'
      }],
      durationLabel: 'Focus for',
      suggestedDurationMinutes: 15,
      startLabel: 'Start focus session',
      showAdvancedSettings: false
    }
  };
},3364,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "ACTIVE_INDICATOR_COPY", {
    enumerable: true,
    get: function () {
      return _copyActiveRescue.ACTIVE_INDICATOR_COPY;
    }
  });
  Object.defineProperty(exports, "RESCUE_COPY", {
    enumerable: true,
    get: function () {
      return _copyActiveRescue.RESCUE_COPY;
    }
  });
  Object.defineProperty(exports, "EVIDENCE_COMPLETION_COPY", {
    enumerable: true,
    get: function () {
      return _copyCompletion.EVIDENCE_COMPLETION_COPY;
    }
  });
  Object.defineProperty(exports, "COLD_START_COMPLETION_COPY", {
    enumerable: true,
    get: function () {
      return _copyCompletion.COLD_START_COMPLETION_COPY;
    }
  });
  Object.defineProperty(exports, "COMPLETION_COPY", {
    enumerable: true,
    get: function () {
      return _copyCompletion.COMPLETION_COPY;
    }
  });
  Object.defineProperty(exports, "EVIDENCE_WEEKLY_INTELLIGENCE_COPY", {
    enumerable: true,
    get: function () {
      return _copyWeekly.EVIDENCE_WEEKLY_INTELLIGENCE_COPY;
    }
  });
  Object.defineProperty(exports, "COLD_START_WEEKLY_INTELLIGENCE_COPY", {
    enumerable: true,
    get: function () {
      return _copyWeekly.COLD_START_WEEKLY_INTELLIGENCE_COPY;
    }
  });
  Object.defineProperty(exports, "WEEKLY_INTELLIGENCE_COPY", {
    enumerable: true,
    get: function () {
      return _copyWeekly.WEEKLY_INTELLIGENCE_COPY;
    }
  });
  var _copyActiveRescue = require(_dependencyMap[0]);
  var _copyCompletion = require(_dependencyMap[1]);
  var _copyWeekly = require(_dependencyMap[2]);
},3365,[3366,3367,3368]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "ACTIVE_INDICATOR_COPY", {
    enumerable: true,
    get: function () {
      return ACTIVE_INDICATOR_COPY;
    }
  });
  Object.defineProperty(exports, "RESCUE_COPY", {
    enumerable: true,
    get: function () {
      return RESCUE_COPY;
    }
  });
  // ── Active session indicator copy (no claims, safe for all states) ──────

  const ACTIVE_INDICATOR_COPY = {
    student: {
      targetLabel: 'Studying',
      topLine: 'Stay focused on the material',
      showProgressBar: true,
      showCompanion: false,
      allowNotes: true,
      density: 'medium',
      quiet: true
    },
    game_like: {
      targetLabel: 'Momentum',
      topLine: 'Clean start — keep moving forward',
      showProgressBar: true,
      showCompanion: false,
      allowNotes: false,
      density: 'medium',
      quiet: true
    },
    deep_creative: {
      targetLabel: 'Protecting',
      topLine: 'Next move in progress — thread protected',
      showProgressBar: true,
      showCompanion: false,
      allowNotes: true,
      density: 'medium',
      quiet: true
    },
    minimal_normal: {
      targetLabel: 'One action',
      topLine: 'In progress',
      showProgressBar: true,
      showCompanion: false,
      allowNotes: false,
      density: 'low',
      quiet: true
    }
  };

  // ── Rescue surface copy (no evidence claims — all safe) ─────────────────

  const RESCUE_COPY = {
    student: {
      headline: 'Review one section for 8 minutes',
      body: 'Just open your notes. One section. No quiz, no pressure.',
      suggestedDurationMinutes: 8,
      actionLabel: 'Start review'
    },
    game_like: {
      headline: 'Recovery run: 10 clean minutes',
      body: 'No blockers. No targets. Just 10 minutes of clean focus. Momentum resets after.',
      suggestedDurationMinutes: 10,
      actionLabel: 'Start recovery run'
    },
    deep_creative: {
      headline: 'Re-enter the project and find the next move',
      body: "Just open the project. Find one next move. That's all. VEX saves the thread.",
      suggestedDurationMinutes: 7,
      actionLabel: 'Re-enter project'
    },
    minimal_normal: {
      headline: 'Do 5 minutes. Stop cleanly.',
      body: "One action. Five minutes. That's a win. VEX won't ask for more.",
      suggestedDurationMinutes: 5,
      actionLabel: 'Start'
    }
  };
},3366,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "EVIDENCE_COMPLETION_COPY", {
    enumerable: true,
    get: function () {
      return EVIDENCE_COMPLETION_COPY;
    }
  });
  Object.defineProperty(exports, "COLD_START_COMPLETION_COPY", {
    enumerable: true,
    get: function () {
      return COLD_START_COMPLETION_COPY;
    }
  });
  Object.defineProperty(exports, "COMPLETION_COPY", {
    enumerable: true,
    get: function () {
      return COMPLETION_COPY;
    }
  });
  // ── Evidence-backed completion surface ──────────────────────────────────

  const EVIDENCE_COMPLETION_COPY = {
    student: {
      headline: 'Study block done',
      body: 'You studied {topic}. Tap below to flag what needs review.',
      primaryActionLabel: 'Mark what needs review',
      secondaryHint: 'Next: recall key ideas before they fade',
      insightLabel: 'VEX tracked your weak spots for next block',
      showRewards: false,
      showStreak: false,
      showXp: false
    },
    game_like: {
      headline: 'Run complete',
      body: 'You moved through {task}. Momentum recorded.',
      primaryActionLabel: 'Done',
      secondaryHint: 'Next run: same time tomorrow builds the pattern',
      insightLabel: 'Clean starts are your strongest signal',
      showRewards: false,
      showStreak: false,
      showXp: false
    },
    deep_creative: {
      headline: 'Project block complete',
      body: 'Next move saved for {project}. Thread is intact.',
      primaryActionLabel: 'Save handoff note',
      secondaryHint: 'Stale risk: low — next move is clear',
      insightLabel: 'Project continuity: maintained',
      showRewards: false,
      showStreak: false,
      showXp: false
    },
    minimal_normal: {
      headline: 'Done',
      body: '{action} — complete.',
      primaryActionLabel: 'Close',
      secondaryHint: 'Tomorrow: one clean action, same time',
      insightLabel: null,
      showRewards: false,
      showStreak: false,
      showXp: false
    }
  };

  // ── Cold-start completion surface ───────────────────────────────────────

  const COLD_START_COMPLETION_COPY = {
    student: {
      headline: 'Study block done',
      body: 'You studied {topic}. Tap below to flag what needs review.',
      primaryActionLabel: 'Mark what needs review',
      secondaryHint: 'Next: name one topic for the next block',
      insightLabel: null,
      showRewards: false,
      showStreak: false,
      showXp: false
    },
    game_like: {
      headline: 'Run complete',
      body: 'You moved through {task}. Session recorded.',
      primaryActionLabel: 'Done',
      secondaryHint: 'Same time tomorrow helps VEX find your rhythm',
      insightLabel: null,
      showRewards: false,
      showStreak: false,
      showXp: false
    },
    deep_creative: {
      headline: 'Project block complete',
      body: 'Block finished for {project}. Save a handoff note to pick up later.',
      primaryActionLabel: 'Save handoff note',
      secondaryHint: 'Save your next move before closing',
      insightLabel: null,
      showRewards: false,
      showStreak: false,
      showXp: false
    },
    minimal_normal: {
      headline: 'Done',
      body: '{action} — complete.',
      primaryActionLabel: 'Close',
      secondaryHint: 'Tomorrow: one clean action, same time',
      insightLabel: null,
      showRewards: false,
      showStreak: false,
      showXp: false
    }
  };

  // ── Backward compat ─────────────────────────────────────────────────────

  /** @deprecated — use EVIDENCE_COMPLETION_COPY or COLD_START_COMPLETION_COPY */
  const COMPLETION_COPY = EVIDENCE_COMPLETION_COPY;
},3367,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "EVIDENCE_WEEKLY_INTELLIGENCE_COPY", {
    enumerable: true,
    get: function () {
      return EVIDENCE_WEEKLY_INTELLIGENCE_COPY;
    }
  });
  Object.defineProperty(exports, "COLD_START_WEEKLY_INTELLIGENCE_COPY", {
    enumerable: true,
    get: function () {
      return COLD_START_WEEKLY_INTELLIGENCE_COPY;
    }
  });
  Object.defineProperty(exports, "WEEKLY_INTELLIGENCE_COPY", {
    enumerable: true,
    get: function () {
      return WEEKLY_INTELLIGENCE_COPY;
    }
  });
  // ── Evidence-backed weekly intelligence ─────────────────────────────────

  const EVIDENCE_WEEKLY_INTELLIGENCE_COPY = {
    student: {
      headline: 'Study week in review',
      body: "Your study rhythm is forming. Here's what worked and what to adjust.",
      primaryMetric: 'Review consistency',
      primaryMetricValue: '{completedSessions} of {totalSessions} blocks held',
      adjustment: 'Start by naming the topic — your strongest blocks have a clear focus.',
      nextSessionType: 'Study block'
    },
    game_like: {
      headline: 'Momentum week in review',
      body: 'Your focus patterns are becoming clear.',
      primaryMetric: 'Clean starts',
      primaryMetricValue: '{cleanStarts} clean starts this week',
      adjustment: 'Recovery runs break blocker patterns. Use them when momentum dips.',
      nextSessionType: 'Clean run'
    },
    deep_creative: {
      headline: 'Project week in review',
      body: 'Your deep work threads tell a story.',
      primaryMetric: 'Project continuity',
      primaryMetricValue: '{completedSessions} of {totalSessions} blocks held',
      adjustment: 'Name the next move before closing — stale threads break continuity.',
      nextSessionType: 'Project block'
    },
    minimal_normal: {
      headline: 'Clean week in review',
      body: 'Simple. Quiet. Effective.',
      primaryMetric: 'Sessions completed',
      primaryMetricValue: '{completedSessions} of {totalSessions} sessions this week',
      adjustment: 'Same window this week. No extra nudges unless you ask.',
      nextSessionType: 'Clean session'
    }
  };

  // ── Cold-start weekly intelligence ──────────────────────────────────────

  const COLD_START_WEEKLY_INTELLIGENCE_COPY = {
    student: {
      headline: 'First week of study',
      body: 'VEX is learning how you study best.',
      primaryMetric: 'Sessions started',
      primaryMetricValue: '{completedSessions} blocks completed',
      adjustment: 'Keep naming the topic before each block — it helps VEX find what matters.',
      nextSessionType: 'Study block'
    },
    game_like: {
      headline: 'First week of runs',
      body: 'VEX is learning what keeps your momentum going.',
      primaryMetric: 'Sessions started',
      primaryMetricValue: '{cleanStarts} clean starts this week',
      adjustment: 'Start with a short warm-up. VEX is still learning your rhythm.',
      nextSessionType: 'Clean run'
    },
    deep_creative: {
      headline: 'First week of project work',
      body: 'VEX is learning how you protect deep focus.',
      primaryMetric: 'Sessions started',
      primaryMetricValue: '{completedSessions} blocks completed',
      adjustment: 'Save a next move after each block so VEX can help you resume.',
      nextSessionType: 'Project block'
    },
    minimal_normal: {
      headline: 'First week of clean sessions',
      body: 'VEX is learning your quiet rhythm.',
      primaryMetric: 'Sessions started',
      primaryMetricValue: '{completedSessions} sessions this week',
      adjustment: 'Keep it simple. VEX needs more sessions to suggest adjustments.',
      nextSessionType: 'Clean session'
    }
  };

  // ── Backward compat ─────────────────────────────────────────────────────

  /** @deprecated — use EVIDENCE_WEEKLY_INTELLIGENCE_COPY or COLD_START_WEEKLY_INTELLIGENCE_COPY */
  const WEEKLY_INTELLIGENCE_COPY = EVIDENCE_WEEKLY_INTELLIGENCE_COPY;
},3368,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "SurfaceIdSchema", {
    enumerable: true,
    get: function () {
      return SurfaceIdSchema;
    }
  });
  Object.defineProperty(exports, "PrimaryActionSchema", {
    enumerable: true,
    get: function () {
      return PrimaryActionSchema;
    }
  });
  Object.defineProperty(exports, "ModeHomeSurfaceSchema", {
    enumerable: true,
    get: function () {
      return ModeHomeSurfaceSchema;
    }
  });
  Object.defineProperty(exports, "QuickContractQuestionSchema", {
    enumerable: true,
    get: function () {
      return QuickContractQuestionSchema;
    }
  });
  Object.defineProperty(exports, "ModeQuickContractSchema", {
    enumerable: true,
    get: function () {
      return ModeQuickContractSchema;
    }
  });
  Object.defineProperty(exports, "ModeActiveIndicatorSchema", {
    enumerable: true,
    get: function () {
      return ModeActiveIndicatorSchema;
    }
  });
  Object.defineProperty(exports, "ModeCompletionSurfaceSchema", {
    enumerable: true,
    get: function () {
      return ModeCompletionSurfaceSchema;
    }
  });
  Object.defineProperty(exports, "ModeRescueSurfaceSchema", {
    enumerable: true,
    get: function () {
      return ModeRescueSurfaceSchema;
    }
  });
  Object.defineProperty(exports, "ModeWeeklyIntelligenceSchema", {
    enumerable: true,
    get: function () {
      return ModeWeeklyIntelligenceSchema;
    }
  });
  var _zod = require(_dependencyMap[0]);
  var _laneEngineSchemas = require(_dependencyMap[1]);
  // ── Mode-native surface identifiers ────────────────────────────────────
  const SurfaceIdSchema = _zod.z.enum(['home', 'quick_contract', 'active_session', 'pause', 'completion', 'rescue', 'day3_memory', 'weekly_intelligence', 'premium_trigger']);
  const PrimaryActionSchema = _zod.z.enum(['start_session', 'resume_project', 'review_weak_topics', 'start_study_block', 'start_clean_run', 'start_project_block', 're_enter_project', 'do_mini_session']);

  // ── Home surface content ───────────────────────────────────────────────
  const ModeHomeSurfaceSchema = _zod.z.object({
    lane: _laneEngineSchemas.LaneSchema,
    primaryFeeling: _zod.z.string().min(1),
    headline: _zod.z.string().min(1),
    body: _zod.z.string().min(1),
    primaryAction: PrimaryActionSchema,
    primaryActionLabel: _zod.z.string().min(1),
    suggestedDurationMinutes: _zod.z.number().int().min(5).max(120),
    secondaryHint: _zod.z.string().min(1).nullable(),
    rhythmLabel: _zod.z.string().min(1).nullable()
  }).strict();

  // ── Quick Contract surface content ─────────────────────────────────────
  const QuickContractQuestionSchema = _zod.z.object({
    key: _zod.z.string().min(1),
    label: _zod.z.string().min(1),
    placeholder: _zod.z.string().min(1)
  }).strict();
  const ModeQuickContractSchema = _zod.z.object({
    lane: _laneEngineSchemas.LaneSchema,
    title: _zod.z.string().min(1),
    questions: _zod.z.array(QuickContractQuestionSchema).min(1).max(3),
    durationLabel: _zod.z.string().min(1),
    suggestedDurationMinutes: _zod.z.number().int().min(5).max(120),
    startLabel: _zod.z.string().min(1),
    showAdvancedSettings: _zod.z.boolean()
  }).strict();

  // ── Active session indicator ───────────────────────────────────────────
  const ModeActiveIndicatorSchema = _zod.z.object({
    lane: _laneEngineSchemas.LaneSchema,
    targetLabel: _zod.z.string().min(1).nullable(),
    topLine: _zod.z.string().min(1),
    showProgressBar: _zod.z.boolean(),
    showCompanion: _zod.z.boolean(),
    allowNotes: _zod.z.boolean(),
    density: _zod.z.enum(['low', 'medium', 'medium_high']),
    quiet: _zod.z.boolean()
  }).strict();

  // ── Completion surface content ─────────────────────────────────────────
  const ModeCompletionSurfaceSchema = _zod.z.object({
    lane: _laneEngineSchemas.LaneSchema,
    headline: _zod.z.string().min(1),
    body: _zod.z.string().min(1),
    primaryActionLabel: _zod.z.string().min(1),
    secondaryHint: _zod.z.string().min(1).nullable(),
    insightLabel: _zod.z.string().min(1).nullable(),
    showRewards: _zod.z.boolean(),
    showStreak: _zod.z.boolean(),
    showXp: _zod.z.boolean()
  }).strict();

  // ── Rescue surface content ─────────────────────────────────────────────
  const ModeRescueSurfaceSchema = _zod.z.object({
    lane: _laneEngineSchemas.LaneSchema,
    headline: _zod.z.string().min(1),
    body: _zod.z.string().min(1),
    suggestedDurationMinutes: _zod.z.number().int().min(3).max(15),
    actionLabel: _zod.z.string().min(1)
  }).strict();

  // ── Weekly intelligence surface content ────────────────────────────────
  const ModeWeeklyIntelligenceSchema = _zod.z.object({
    lane: _laneEngineSchemas.LaneSchema,
    headline: _zod.z.string().min(1),
    body: _zod.z.string().min(1),
    primaryMetric: _zod.z.string().min(1),
    primaryMetricValue: _zod.z.string().min(1),
    adjustment: _zod.z.string().min(1),
    nextSessionType: _zod.z.string().min(1).nullable()
  }).strict();

  // ── Inferred types ─────────────────────────────────────────────────────
},3369,[1774,1889]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.deriveCompletionSurface = deriveCompletionSurface;
  exports.deriveWeeklyIntelligence = deriveWeeklyIntelligence;
  var _laneEngineSchemas = require(_dependencyMap[0]);
  var _copy = require(_dependencyMap[1]);
  var _schemas = require(_dependencyMap[2]);
  // ── Helpers ────────────────────────────────────────────────────────────

  function resolveLane(raw) {
    const parsed = _laneEngineSchemas.LaneSchema.safeParse(raw);
    return parsed.success ? parsed.data : 'minimal_normal';
  }
  function fillTemplate(template, values) {
    return template.replace(/\{(\w+)\}/g, (_match, key) => String(values[key] ?? `{${key}}`));
  }

  // ── Completion Surface ─────────────────────────────────────────────────

  function deriveCompletionSurface(context) {
    const lane = resolveLane(context.laneOverride);
    const hasEvidence = (context.completedSessions ?? 0) >= 3;
    const base = hasEvidence ? _copy.EVIDENCE_COMPLETION_COPY[lane] : _copy.COLD_START_COMPLETION_COPY[lane];
    const body = fillTemplate(base.body, {
      topic: context.topic ?? 'your material',
      task: context.task ?? 'your task',
      project: context.project ?? 'your project',
      action: context.action ?? 'your action'
    });
    let enrichedBody = body;
    let enrichedInsight = base.insightLabel;

    // Only apply evidence-backed enrichment when enough history exists
    if (hasEvidence) {
      if (lane === 'student' && context.weakTopicCount !== undefined && context.weakTopicCount > 0) {
        enrichedBody = `${body} ${context.weakTopicCount} topic${context.weakTopicCount === 1 ? '' : 's'} may need review.`;
        enrichedInsight = `VEX found ${context.weakTopicCount} weak ${context.weakTopicCount === 1 ? 'area' : 'areas'}`;
      }
      if (lane === 'game_like') {
        const parts = [];
        if (context.cleanStarts !== undefined && context.cleanStarts > 0) {
          parts.push(`${context.cleanStarts} clean start${context.cleanStarts === 1 ? '' : 's'} confirmed`);
        }
        if (context.blockerDetected) {
          parts.push('blocker signal saved');
        }
        if (context.recoveryWin) {
          parts.push('recovery win');
        }
        if (parts.length > 0) {
          enrichedBody = `${body} ${parts.join(' · ')}.`;
        }
        enrichedInsight = context.blockerDetected ? 'Blocker patterns tracked for next run' : context.recoveryWin ? 'Recovery runs build durable momentum' : 'Clean starts are your strongest pattern';
      }
      if (lane === 'deep_creative') {
        if (context.handoffSaved) {
          enrichedBody = `${body} Handoff note saved.`;
          enrichedInsight = 'Next move is locked for tomorrow';
        }
        if (context.staleRisk && context.staleRisk !== 'none') {
          enrichedBody = `${enrichedBody} Thread at ${context.staleRisk} risk of going stale — protect it soon.`;
        }
      }
    }
    return _schemas.ModeCompletionSurfaceSchema.parse(Object.assign({}, base, {
      lane,
      body: enrichedBody,
      insightLabel: enrichedInsight
    }));
  }

  // ── Weekly Intelligence ────────────────────────────────────────────────

  function deriveWeeklyIntelligence(context) {
    const lane = resolveLane(context.laneOverride);
    const hasEvidence = (context.completedSessions ?? 0) >= 3 && (context.totalSessions ?? 0) >= 5;
    const base = hasEvidence ? _copy.EVIDENCE_WEEKLY_INTELLIGENCE_COPY[lane] : _copy.COLD_START_WEEKLY_INTELLIGENCE_COPY[lane];
    const primaryMetricValue = fillTemplate(base.primaryMetricValue, {
      completedSessions: context.completedSessions ?? 0,
      totalSessions: context.totalSessions ?? 0,
      cleanStarts: context.cleanStarts ?? 0,
      duration: context.duration ?? 15
    });
    let adjustment = base.adjustment;

    // Only apply evidence-backed enrichment when enough history exists
    if (hasEvidence) {
      if (lane === 'student' && context.reviewItemsDue !== undefined && context.reviewItemsDue > 0) {
        adjustment = `${context.reviewItemsDue} review item${context.reviewItemsDue === 1 ? '' : 's'} waiting. ${adjustment}`;
      }
      if (lane === 'game_like' && context.blockerPatternsFound !== undefined && context.blockerPatternsFound > 0) {
        adjustment = `${context.blockerPatternsFound} blocker pattern${context.blockerPatternsFound === 1 ? '' : 's'} surfaced. ${adjustment}`;
      }
      if (lane === 'deep_creative' && context.staleProjects !== undefined && context.activeProjects !== undefined) {
        if (context.staleProjects > 0) {
          adjustment = `${context.staleProjects} project${context.staleProjects === 1 ? '' : 's'} went stale. ${adjustment}`;
        } else if (context.activeProjects > 0) {
          adjustment = `${context.activeProjects} active project${context.activeProjects === 1 ? '' : 's'}. Continuity is holding. ${adjustment}`;
        }
      }
    }
    return _schemas.ModeWeeklyIntelligenceSchema.parse(Object.assign({}, base, {
      lane,
      primaryMetricValue,
      adjustment
    }));
  }
},3370,[1889,3363,3369]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useFirstSessionPersonalization = useFirstSessionPersonalization;
  var _react = require(_dependencyMap[0]);
  var _featuresOnboardingStore = require(_dependencyMap[1]);
  var _sessionModes = require(_dependencyMap[2]);
  const PROFILE_TO_MODE = {
    study_focused: _sessionModes.SessionMode.STUDY,
    student: _sessionModes.SessionMode.STUDY,
    worker: _sessionModes.SessionMode.LIGHT_FOCUS,
    calm: _sessionModes.SessionMode.LIGHT_FOCUS,
    friendly: _sessionModes.SessionMode.LIGHT_FOCUS,
    coach_led: _sessionModes.SessionMode.LIGHT_FOCUS,
    game_like: _sessionModes.SessionMode.LIGHT_FOCUS,
    intense: _sessionModes.SessionMode.DEEP_WORK,
    competitive: _sessionModes.SessionMode.DEEP_WORK,
    creator: _sessionModes.SessionMode.CREATIVE
  };
  const PROFILE_TO_DURATION = {
    calm: 15,
    game_like: 15,
    intense: 25,
    competitive: 25,
    study_focused: 25,
    student: 25,
    worker: 25,
    friendly: 20,
    coach_led: 20,
    creator: 25
  };
  const PROFILE_TO_COACH_LINE = {
    calm: 'Start gentle. No pressure. Just show up.',
    game_like: 'One session. That is all it takes to begin.',
    intense: 'One block. Full intensity. Set the tone.',
    competitive: 'Every session counts. Make this one matter.',
    study_focused: 'Start one study block. Lock in and absorb.',
    student: 'Start your study rhythm now. Build the habit.',
    worker: 'Protect one project block. Give it your full attention.',
    friendly: 'No pressure at all. Just you and the timer.',
    coach_led: 'Your coach believes in this first step.',
    creator: 'Start one clean session. Your presence is all you need.'
  };
  function pickProfileType(primary, _secondary) {
    return primary;
  }
  function useFirstSessionPersonalization() {
    const goal = (0, _featuresOnboardingStore.useOnboardingStore)(s => s.goal);
    const element = (0, _featuresOnboardingStore.useOnboardingStore)(s => s.element);
    const focusDuration = (0, _featuresOnboardingStore.useOnboardingStore)(s => s.focusDuration);
    const motivationProfile = (0, _featuresOnboardingStore.useOnboardingStore)(s => s.motivationProfile);
    return (0, _react.useMemo)(() => {
      const profileType = motivationProfile ? pickProfileType(motivationProfile.primary, motivationProfile.secondary) : goalToProfileType(goal);
      const defaultMode = PROFILE_TO_MODE[profileType] ?? _sessionModes.SessionMode.LIGHT_FOCUS;
      const baseDuration = PROFILE_TO_DURATION[profileType] ?? 25;
      const suggestedDurationMinutes = focusDuration ?? baseDuration;
      const coachLine = PROFILE_TO_COACH_LINE[profileType] ?? 'One session. That is all it takes to begin.';
      const durationLabel = profileType === 'calm' ? 'A gentle start to build your rhythm' : 'Recommended to build momentum';
      return {
        companionElement: element ?? null,
        coachLine,
        defaultMode,
        durationLabel,
        suggestedDurationMinutes
      };
    }, [element, focusDuration, goal, motivationProfile]);
  }
  function goalToProfileType(goal) {
    switch (goal) {
      case 'STUDY':
        return 'study_focused';
      case 'WORK':
        return 'worker';
      case 'CREATIVE':
        return 'creator';
      case 'PERSONAL':
        return 'calm';
      default:
        return 'friendly';
    }
  }
},3371,[12,1892,1829]);
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
  exports.useFirstSessionStart = useFirstSessionStart;
  var _react = require(_dependencyMap[0]);
  var _sentryReactNative = require(_dependencyMap[1]);
  var Sentry = _interopNamespace(_sentryReactNative);
  var _navigationNavigationHelpers = require(_dependencyMap[2]);
  var _sessionHooksUseSession = require(_dependencyMap[3]);
  var _sessionModes = require(_dependencyMap[4]);
  var _sessionTypesSchemas = require(_dependencyMap[5]);
  var _utilsHaptics = require(_dependencyMap[6]);
  const FIRST_SESSION_PRESET = {
    id: 'pomodoro',
    name: 'Pomodoro',
    duration: 1500,
    category: 'standard',
    icon: 'timer',
    intervals: 1,
    breakDuration: 300,
    longBreakDuration: 900,
    longBreakInterval: 4,
    isDefault: true,
    tags: [],
    soundEnabled: true,
    vibrationEnabled: true,
    dndEnabled: false,
    strictMode: false,
    autoStartBreaks: false,
    autoStartNextInterval: false,
    createdAt: 0,
    updatedAt: 0
  };
  function useFirstSessionStart({
    navigation,
    userId
  }) {
    const {
      createSession,
      startSession
    } = (0, _sessionHooksUseSession.useSession)(userId);
    const [isStarting, setIsStarting] = (0, _react.useState)(false);
    const handleFirstSessionStart = (0, _react.useCallback)(async config => {
      setIsStarting(true);
      try {
        const sessionTags = ['first-session', 'onboarding'];
        if (config.goal) {
          sessionTags.push(`goal:${config.goal}`);
        }
        if (config.mode === _sessionModes.SessionMode.STUDY) {
          sessionTags.push('study-session');
        }
        const sessionConfig = _sessionTypesSchemas.SessionConfigSchema.parse({
          duration: config.durationMinutes * 60,
          breakDuration: FIRST_SESSION_PRESET.breakDuration,
          longBreakDuration: FIRST_SESSION_PRESET.longBreakDuration,
          intervals: FIRST_SESSION_PRESET.intervals,
          longBreakInterval: FIRST_SESSION_PRESET.longBreakInterval,
          category: 'standard',
          tags: sessionTags,
          soundEnabled: FIRST_SESSION_PRESET.soundEnabled,
          vibrationEnabled: FIRST_SESSION_PRESET.vibrationEnabled,
          dndEnabled: FIRST_SESSION_PRESET.dndEnabled,
          strictMode: false,
          sessionMode: config.mode,
          autoStartBreaks: FIRST_SESSION_PRESET.autoStartBreaks,
          autoStartNextInterval: FIRST_SESSION_PRESET.autoStartNextInterval,
          goal: config.goal ?? 'First session',
          notes: config.mode === _sessionModes.SessionMode.STUDY && config.goal ? JSON.stringify({
            source: 'direct',
            studyTarget: config.goal
          }) : undefined
        });
        Sentry.addBreadcrumb({
          category: 'session-start',
          message: 'Creating first session from setup flow',
          level: 'info'
        });
        const session = await createSession(sessionConfig);
        await Promise.all([startSession(0), (0, _utilsHaptics.sessionStart)()]);
        if (config.mode === _sessionModes.SessionMode.DEEP_WORK) {
          setTimeout(() => {
            (0, _utilsHaptics.sessionStart)();
          }, 120);
        }
        (0, _navigationNavigationHelpers.navigateToSessionStackScreen)(navigation, 'ActiveSession', {
          sessionId: session.id,
          selectedThemeId: 'default'
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unexpected session start failure';
        Sentry.captureException(error, {
          tags: {
            feature: 'session-start',
            phase: 'first-session-start-flow'
          }
        });
        throw new Error(errorMessage);
      } finally {
        setIsStarting(false);
      }
    }, [createSession, navigation, startSession]);
    return {
      handleFirstSessionStart,
      isStarting
    };
  }
},3372,[12,834,2052,1957,1829,1854,1683]);
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
  exports.ReturningUserView = ReturningUserView;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsKeyboardAvoidingView = require(_dependencyMap[1]);
  var KeyboardAvoidingView = _interopDefault(_reactNativeWebDistExportsKeyboardAvoidingView);
  require(_dependencyMap[2]);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[3]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _componentsPrimitivesBox = require(_dependencyMap[4]);
  var _featuresSessionStartComponentsSessionStartStatusCard = require(_dependencyMap[5]);
  var _sessionModes = require(_dependencyMap[6]);
  var _SessionQuickStartCard = require(_dependencyMap[7]);
  var _SessionContractInput = require(_dependencyMap[8]);
  var _SessionSetupCustomizationSection = require(_dependencyMap[9]);
  var _SessionSetupDifficultyCard = require(_dependencyMap[10]);
  var _SessionSetupFooter = require(_dependencyMap[11]);
  var _SessionSetupHeader = require(_dependencyMap[12]);
  var _SessionSetupStakesCard = require(_dependencyMap[13]);
  var _SessionSetupStudyPlanCard = require(_dependencyMap[14]);
  var _hooksUseSessionSetupStakes = require(_dependencyMap[15]);
  var _featuresLearningExecutionService = require(_dependencyMap[16]);
  var _featuresLiveopsConfigFeatureFlagService = require(_dependencyMap[17]);
  var _sharedUiLiquidGlassLiquidGlassScreen = require(_dependencyMap[18]);
  var _reactJsxRuntime = require(_dependencyMap[19]);
  function ReturningUserView({
    controller,
    contractText,
    setContractText,
    selectedDifficulty,
    setSelectedDifficulty,
    navigation,
    route
  }) {
    const stakes = (0, _hooksUseSessionSetupStakes.useSessionSetupStakes)({
      currentStreakDays: controller.streak?.currentDays ?? null,
      selectedDurationSeconds: controller.selectedDurationSeconds,
      userId: controller.userId || ''
    });
    const showStakes = !(0, _featuresLiveopsConfigFeatureFlagService.isFeatureHidden)('boss_tab') || !(0, _featuresLiveopsConfigFeatureFlagService.isFeatureHidden)('challenges');
    const handleStudyPlanSelect = studyPlan => {
      const target = controller.learningExecutionLayer.target;
      if (target) {
        navigation.setParams((0, _featuresLearningExecutionService.buildLearningSessionParams)(target));
      }
      controller.setupState.setSelectedSessionMode(target?.persona === 'creative' ? _sessionModes.SessionMode.CREATIVE : target?.persona === 'student' || target?.persona === 'learning' ? _sessionModes.SessionMode.STUDY : _sessionModes.SessionMode.DEEP_WORK);
      controller.setupState.setCustomDuration(studyPlan.remainingMinutes);
      controller.setupState.setShowCustomization(true);
    };
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(KeyboardAvoidingView.default, {
      behavior: 'height',
      style: {
        flex: 1
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_sharedUiLiquidGlassLiquidGlassScreen.LiquidGlassScreen, {
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionSetupHeader.SessionSetupHeader, {
          durationSeconds: controller.selectedDurationSeconds,
          mode: controller.setupState.selectedSessionMode,
          onBack: () => navigation.goBack(),
          userId: controller.userId
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(ScrollView.default, {
          showsVerticalScrollIndicator: false,
          keyboardShouldPersistTaps: "handled",
          contentContainerStyle: {
            paddingBottom: 140
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionStartComponentsSessionStartStatusCard.SessionStartStatusCard, {
            offlineMessage: controller.offlineMessage,
            routeWarningMessage: controller.parsedRoute.warningMessage,
            startErrorMessage: controller.startError,
            onDismissStartError: controller.clearStartError
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionSetupStudyPlanCard.SessionSetupStudyPlanCard, {
            copy: controller.learningExecutionLayer.copy,
            studyPlan: controller.activeStudyPlan.data ?? null,
            onSelect: handleStudyPlanSelect
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionQuickStartCard.SessionQuickStartCard, {
            ctaLabel: controller.sessionSummary.ctaLabel,
            customizationLabel: controller.sessionSummary.customizationLabel,
            currentThemeName: controller.selectedTheme.name,
            durationMinutes: Math.round(controller.selectedDurationSeconds / 60),
            heroBody: controller.sessionHero.body,
            heroEyebrow: controller.sessionHero.eyebrow,
            heroTitle: controller.sessionHero.title,
            hasCustomizations: controller.setupState.showCustomization,
            isStarting: controller.isStarting,
            onCustomize: () => controller.setupState.setShowCustomization(current => !current),
            onStart: () => controller.handleStartSession(),
            presetName: controller.setupState.selectedPreset.name,
            smartSuggestion: controller.setupState.smartSuggestion,
            subtitle: controller.sessionSummary.subtitle,
            contractInput: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionContractInput.SessionContractInput, {
              disabled: controller.isStarting,
              onChangeText: setContractText,
              value: contractText
            })
          }), showStakes ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionSetupStakesCard.SessionSetupStakesCard, {
            stakes: stakes
          }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionSetupDifficultyCard.SessionSetupDifficultyCard, {
            disabled: controller.isStarting,
            selected: selectedDifficulty,
            selectedDurationSeconds: controller.selectedDurationSeconds,
            onChange: setSelectedDifficulty
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionSetupCustomizationSection.SessionSetupCustomizationSection, {
            controller: controller,
            routeParams: route.params
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            height: 120
          })]
        }), controller.setupState.showCustomization ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionSetupFooter.SessionSetupFooter, {
          breakDurationSeconds: controller.setupState.selectedPreset.breakDuration,
          durationMinutes: Math.round(controller.selectedDurationSeconds / 60),
          intervalCount: controller.setupState.selectedPreset.intervals,
          isStarting: controller.isStarting,
          onStart: () => controller.handleStartSession(),
          selectedSessionMode: controller.setupState.selectedSessionMode,
          selectedThemeLabel: controller.selectedThemeOwned ? controller.selectedTheme.name : null
        }) : null]
      })
    });
  }
},3373,[12,1278,18,171,1462,3357,1829,3374,3376,3377,3400,3403,3404,3409,3414,3415,2756,1963,3091,203]);
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
  exports.SessionQuickStartCard = SessionQuickStartCard;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsImage = require(_dependencyMap[1]);
  var Image = _interopDefault(_reactNativeWebDistExportsImage);
  var _componentsBanner = require(_dependencyMap[2]);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesButton = require(_dependencyMap[4]);
  var _componentsPrimitivesText = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _sharedUiLiquidGlassLiquidGlassCard = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  function SessionQuickStartCard({
    contractInput,
    ctaLabel,
    customizationLabel,
    currentThemeName,
    durationMinutes,
    heroBody,
    heroEyebrow,
    heroTitle,
    hasCustomizations,
    isStarting,
    onCustomize,
    onStart,
    presetName,
    smartSuggestion,
    subtitle
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      px: "lg",
      mb: "lg",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_sharedUiLiquidGlassLiquidGlassCard.LiquidGlassCard, {
        emphasized: true,
        style: {
          gap: theme.spacing[4]
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          gap: "md",
          alignItems: "center",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flex: 1,
            gap: "xs",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "label",
              color: "primary.500",
              children: heroEyebrow
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "h4",
              color: "text.primary",
              children: heroTitle
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              color: "text.secondary",
              children: heroBody
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Image.default, {
            source: require(_dependencyMap[9]),
            resizeMode: "contain",
            style: {
              height: 108,
              width: 108
            },
            accessibilityLabel: "Liquid glass focus artifact"
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          p: "md",
          bg: "semantic.surfaceGlass",
          borderRadius: 24,
          style: {
            borderWidth: 1,
            borderColor: theme.colors.semantic.liquidGlassBorder,
            gap: theme.spacing[2]
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.tertiary",
            children: "Selected session"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "label",
            color: "text.primary",
            children: presetName
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.secondary",
            children: subtitle
          })]
        }), smartSuggestion && smartSuggestion.confidence >= 0.75 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBanner.Banner, {
          variant: "info",
          title: "Recommended for today",
          description: smartSuggestion.description
        }) : null, contractInput, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "primary",
          size: "lg",
          onPress: onStart,
          isLoading: isStarting,
          fullWidth: true,
          accessibilityLabel: `Start ${durationMinutes} minute session with ${currentThemeName}`,
          accessibilityRole: "button",
          accessibilityHint: "Starts the selected focus session now",
          children: ctaLabel
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: hasCustomizations ? 'outline' : 'ghost',
          onPress: onCustomize,
          accessibilityLabel: hasCustomizations ? 'Hide session customization' : 'Customize session',
          accessibilityRole: "button",
          accessibilityHint: "Opens duration, mode, theme, and advanced session options",
          children: customizationLabel
        })]
      })
    });
  }
},3374,[12,469,3358,1462,1680,1489,1463,3127,203,3375]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  module.exports = {
    uri: "/assets/src/assets/generated/session/focus-artifact.b6eb4a8deec3144c616a13de9cb48052.png",
    width: 1254,
    height: 1254,
    toString() {
      return this.uri;
    }
  };
},3375,[]);
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
  exports.SessionContractInput = SessionContractInput;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsTextInput = require(_dependencyMap[2]);
  var TextInput = _interopDefault(_reactNativeWebDistExportsTextInput);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _iconsComponentsIcon = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _utilsTouchTarget = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  function SessionContractInput({
    value,
    onChangeText,
    disabled
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const trimmedLength = value.trim().length;
    const showCounter = value.length >= 60;
    const showGuidance = trimmedLength > 0 && trimmedLength < 3;
    const handleChange = next => {
      onChangeText(next.replace(/\r?\n/g, '').slice(0, 80));
    };
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      mt: "md",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        bg: "background.elevated",
        borderColor: "border.light",
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        p: "md",
        style: {
          boxShadow: `0px 2px 8px ${theme.colors.semantic.shadow} / 0.08`
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          alignItems: "center",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(TextInput.default, {
            accessibilityHint: "Describe the specific task you will work on during this session",
            accessibilityLabel: "Focus contract - optional task description",
            editable: !disabled,
            maxLength: 80,
            onChangeText: handleChange,
            placeholder: "What will you focus on? (optional)",
            placeholderTextColor: theme.colors.text.tertiary,
            returnKeyType: "done",
            style: {
              color: theme.colors.text.primary,
              flex: 1,
              minHeight: 44,
              padding: 0,
              fontSize: 16
            },
            value: value
          }), value.length > 0 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
            accessibilityHint: "Clears the focus contract field",
            accessibilityLabel: "Clear focus contract",
            accessibilityRole: "button",
            hitSlop: _utilsTouchTarget.StandardHitSlops.ICON,
            onPress: () => onChangeText(''),
            style: (0, _utilsTouchTarget.getMinTouchTargetStyle)(),
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
                name: "x",
                size: "sm",
                color: theme.colors.text.secondary
              })
            })
          }) : null]
        }), showGuidance ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.secondary",
          mt: "xs",
          children: "Add a little more detail, or start without a contract."
        }) : null, showCounter ? /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.tertiary",
          mt: "xs",
          textAlign: "right",
          children: [value.length, "/80"]
        }) : null]
      })
    });
  }
},3376,[12,1286,496,1462,1489,1691,1463,2157,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SessionSetupCustomizationSection = SessionSetupCustomizationSection;
  require(_dependencyMap[0]);
  var _SessionSetupCustomization = require(_dependencyMap[1]);
  var _reactJsxRuntime = require(_dependencyMap[2]);
  function SessionSetupCustomizationSection({
    controller,
    routeParams
  }) {
    if (!controller.setupState.showCustomization) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionSetupCustomization.SessionSetupCustomization, {
      activeChallenges: controller.activeChallenges,
      filteredPresets: controller.filteredPresets,
      hasActiveStudyPlan: routeParams?.source === 'content-study',
      onPressTheme: controller.handleThemePress,
      onSelectPreset: controller.setupState.setSelectedPreset,
      onSelectSessionMode: controller.setupState.setSelectedSessionMode,
      onSelectSmartSuggestion: () => {
        if (!controller.setupState.smartSuggestion) {
          return;
        }
        controller.setupState.setSelectedPreset(controller.setupState.smartSuggestion.preset);
        controller.setupState.setSelectedCategory(controller.setupState.smartSuggestion.preset.category ?? 'standard');
      },
      onToggleAdvanced: () => controller.setupState.setShowAdvanced(current => !current),
      onUpdateCategory: controller.setupState.setSelectedCategory,
      routeSuggestedDifficulty: routeParams?.suggestedDifficulty,
      selectedCategory: controller.setupState.selectedCategory,
      selectedDurationSeconds: controller.selectedDurationSeconds,
      selectedPreset: controller.setupState.selectedPreset,
      selectedSessionMode: controller.setupState.selectedSessionMode,
      selectedTheme: controller.selectedTheme,
      selectedThemeId: controller.setupState.selectedThemeId,
      showAdvanced: controller.setupState.showAdvanced,
      smartSuggestion: controller.setupState.smartSuggestion,
      themeQueryError: controller.selectableThemesQuery.isError,
      themeQueryLoading: controller.selectableThemesQuery.isPending,
      themeQueryRetry: controller.selectableThemesQuery.refetch,
      themes: controller.userThemes
    });
  }
},3377,[12,3378,203]);
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
  exports.SessionSetupCustomization = SessionSetupCustomization;
  require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _iconsComponentsIcon = require(_dependencyMap[4]);
  var _sharedUiComponentsTabBar = require(_dependencyMap[5]);
  var _sharedUiComponentsInteractiveCard = require(_dependencyMap[6]);
  var _featuresSessionStartComponentsModeSelector = require(_dependencyMap[7]);
  var _themeThemeContext = require(_dependencyMap[8]);
  var _utilsSessionSetup = require(_dependencyMap[9]);
  var _SessionAdvancedOptions = require(_dependencyMap[10]);
  var _SessionThemeSelector = require(_dependencyMap[11]);
  var _ActiveChallenges = require(_dependencyMap[12]);
  var _SessionSmartPickCard = require(_dependencyMap[13]);
  var _reactJsxRuntime = require(_dependencyMap[14]);
  function SessionSetupCustomization({
    activeChallenges,
    filteredPresets,
    hasActiveStudyPlan,
    onPressTheme,
    onSelectPreset,
    onSelectSessionMode,
    onSelectSmartSuggestion,
    onToggleAdvanced,
    onUpdateCategory,
    routeSuggestedDifficulty,
    selectedCategory,
    selectedDurationSeconds,
    selectedPreset,
    selectedSessionMode,
    selectedTheme,
    selectedThemeId,
    showAdvanced,
    smartSuggestion,
    themeQueryError,
    themeQueryLoading,
    themeQueryRetry,
    themes
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const tabs = _utilsSessionSetup.PRESET_CATEGORIES.map(category => ({
      id: category.key,
      label: category.label,
      icon: category.icon
    }));
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        px: "lg",
        mb: "md",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsTabBar.TabBar, {
          tabs: tabs,
          activeTab: selectedCategory,
          onChange: onUpdateCategory,
          variant: "pills",
          size: "sm"
        })
      }), routeSuggestedDifficulty ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        px: "lg",
        mb: "md",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          p: "md",
          bg: "background.secondary",
          borderRadius: "lg",
          style: {
            borderWidth: 1,
            borderColor: theme.colors.primary[500]
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "label",
            color: "primary.500",
            mb: "xs",
            children: "Suggested by your coach"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "body",
            color: "text.secondary",
            children: `Difficulty target: ${routeSuggestedDifficulty}`
          })]
        })
      }) : null, smartSuggestion && smartSuggestion.confidence >= 0.75 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        px: "lg",
        mb: "md",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionSmartPickCard.SessionSmartPickCard, {
          description: smartSuggestion.description,
          onSelect: onSelectSmartSuggestion
        })
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        px: "lg",
        mb: "md",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionStartComponentsModeSelector.ModeSelector, {
          hasActiveStudyPlan: hasActiveStudyPlan,
          selectedMode: selectedSessionMode,
          onModeChange: onSelectSessionMode
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        px: "lg",
        children: filteredPresets.map((preset, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeInUp.delay(100 + index * 40),
          style: {
            marginBottom: 8
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsInteractiveCard.InteractiveCard, {
            variant: selectedPreset.id === preset.id ? 'elevated' : 'outlined',
            state: selectedPreset.id === preset.id ? 'selected' : 'default',
            onPress: () => onSelectPreset(preset),
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
              flexDirection: "row",
              alignItems: "center",
              gap: "md",
              px: "md",
              py: "sm",
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
                name: preset.icon,
                size: "md",
                color: theme.colors.primary[500]
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
                flex: 1,
                children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  variant: "label",
                  children: preset.name
                }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  variant: "caption",
                  color: "text.secondary",
                  children: `${Math.round(preset.duration / 60)} min - ${preset.intervals} interval${preset.intervals !== 1 ? 's' : ''}`
                })]
              }), selectedPreset.id === preset.id ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
                name: "check",
                size: "sm",
                color: theme.colors.primary[500]
              }) : null]
            })
          })
        }, preset.id))
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_ActiveChallenges.ActiveChallenges, {
        challenges: activeChallenges
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionThemeSelector.SessionThemeSelector, {
        onPressTheme: onPressTheme,
        selectedDurationSeconds: selectedDurationSeconds,
        selectedTheme: selectedTheme,
        selectedThemeId: selectedThemeId,
        themeQueryError: themeQueryError,
        themeQueryLoading: themeQueryLoading,
        themeQueryRetry: themeQueryRetry,
        themes: themes
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionAdvancedOptions.SessionAdvancedOptions, {
        onToggle: onToggleAdvanced,
        selectedDurationSeconds: selectedDurationSeconds,
        selectedPreset: selectedPreset,
        showAdvanced: showAdvanced
      })]
    });
  }
},3378,[12,226,1462,1489,1691,3379,3385,3389,1463,3349,3394,3395,3397,3398,203]);
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
  Object.defineProperty(exports, "TabBar", {
    enumerable: true,
    get: function () {
      return TabBar;
    }
  });
  Object.defineProperty(exports, "Breadcrumb", {
    enumerable: true,
    get: function () {
      return _Breadcrumb.Breadcrumb;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[1]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[3]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _TabBarStyles = require(_dependencyMap[5]);
  var _TabItemComponent = require(_dependencyMap[6]);
  var _Breadcrumb = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  const _worklet_13210590222863_init_data = {
    code: "function TabBarTsx1(){const{indicatorPosition,indicatorWidth}=this.__closure;return{transform:[{translateX:indicatorPosition.value}],width:indicatorWidth.value};}"
  };
  const TabBar = ({
    tabs,
    activeTab,
    onChange,
    orientation = 'horizontal',
    variant = 'default',
    size = 'md',
    showLabels = true,
    scrollable = false,
    style
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const [tabLayouts, setTabLayouts] = (0, _react.useState)({});
    const indicatorPosition = (0, _reactNativeReanimated.useSharedValue)(0);
    const indicatorWidth = (0, _reactNativeReanimated.useSharedValue)(0);
    (0, _react.useEffect)(() => {
      const layout = tabLayouts[activeTab];
      if (layout) {
        indicatorPosition.value = (0, _reactNativeReanimated.withSpring)(layout.x, {
          damping: 20
        });
        indicatorWidth.value = (0, _reactNativeReanimated.withSpring)(layout.width, {
          damping: 20
        });
      }
    }, [activeTab, indicatorPosition, indicatorWidth, tabLayouts]);
    const handleTabLayout = (0, _react.useCallback)(tabId => event => {
      const {
        x,
        width
      } = event.nativeEvent.layout;
      setTabLayouts(previous => Object.assign({}, previous, {
        [tabId]: {
          x,
          width
        }
      }));
    }, []);
    const handleTabPress = (0, _react.useCallback)(tabId => {
      if (tabs.find(tab => tab.id === tabId)?.disabled) {
        return;
      }
      onChange(tabId);
    }, [onChange, tabs]);
    const isHorizontal = orientation === 'horizontal';
    const indicatorStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function TabBarTsx1Factory({
      _worklet_13210590222863_init_data,
      indicatorPosition,
      indicatorWidth
    }) {
      const TabBarTsx1 = () => ({
        transform: [{
          translateX: indicatorPosition.value
        }],
        width: indicatorWidth.value
      });
      TabBarTsx1.__closure = {
        indicatorPosition,
        indicatorWidth
      };
      TabBarTsx1.__workletHash = 13210590222863;
      TabBarTsx1.__initData = _worklet_13210590222863_init_data;
      return TabBarTsx1;
    }({
      _worklet_13210590222863_init_data,
      indicatorPosition,
      indicatorWidth
    }));
    const renderedTabs = /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [tabs.map(tab => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_TabItemComponent.TabItemComponent, {
        item: tab,
        isActive: tab.id === activeTab,
        onPress: () => handleTabPress(tab.id),
        onLayout: handleTabLayout(tab.id),
        variant: variant,
        size: size,
        showLabels: showLabels
      }, tab.id)), variant === 'underline' && isHorizontal ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        style: [_TabBarStyles.styles.underlineIndicator, {
          backgroundColor: theme.colors.primary[500]
        }, indicatorStyle]
      }) : null]
    });
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      style: [_TabBarStyles.styles.container, style],
      children: scrollable ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(ScrollView.default, {
        horizontal: isHorizontal,
        showsHorizontalScrollIndicator: false,
        showsVerticalScrollIndicator: false,
        style: [_TabBarStyles.styles.tabsContainer, isHorizontal ? _TabBarStyles.styles.horizontal : _TabBarStyles.styles.vertical],
        contentContainerStyle: [_TabBarStyles.styles.scrollContent, !isHorizontal ? _TabBarStyles.styles.scrollContentVertical : undefined],
        children: renderedTabs
      }) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: [_TabBarStyles.styles.tabsContainer, isHorizontal ? _TabBarStyles.styles.horizontal : _TabBarStyles.styles.vertical],
        children: renderedTabs
      })
    });
  };
},3379,[12,171,80,226,1463,3380,3381,3384,203]);
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
  Object.defineProperty(exports, "styles", {
    enumerable: true,
    get: function () {
      return styles;
    }
  });
  var _reactNativeWebDistExportsStyleSheet = require(_dependencyMap[0]);
  var StyleSheet = _interopDefault(_reactNativeWebDistExportsStyleSheet);
  var _sharedUiCreateSheet = require(_dependencyMap[1]);
  var _themeTokensRgbaColors = require(_dependencyMap[2]);
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      width: '100%'
    },
    tabsContainer: {
      flexDirection: 'row'
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    vertical: {
      flexDirection: 'column'
    },
    scrollContent: {
      paddingHorizontal: 4
    },
    scrollContentVertical: {
      paddingVertical: 4
    },
    tabItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    },
    iconWithLabel: {
      marginRight: 8
    },
    badge: {
      position: 'absolute',
      top: 2,
      right: 2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4
    },
    badgeSmall: {
      minWidth: 14,
      height: 14,
      top: 0,
      right: 0
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700'
    },
    badgeTextSmall: {
      fontSize: 8
    },
    disabledOverlay: Object.assign({}, StyleSheet.default.absoluteFill, {
      backgroundColor: _themeTokensRgbaColors.rgbaColors.rgb_0_0_0_0_3,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center'
    }),
    underlineIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: 2,
      borderRadius: 1
    },
    breadcrumb: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    breadcrumbItem: {
      paddingVertical: 4
    },
    breadcrumbItemActive: {
      fontWeight: '600'
    },
    separator: {
      marginHorizontal: 8
    }
  });
},3380,[87,1678,2189]);
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
  Object.defineProperty(exports, "TabItemComponent", {
    enumerable: true,
    get: function () {
      return TabItemComponent;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[3]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _iconsComponentsIcon = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _themeTokensElevation = require(_dependencyMap[7]);
  var _utilsTouchTarget = require(_dependencyMap[8]);
  var _TabBarTypes = require(_dependencyMap[9]);
  var _TabBarStyles = require(_dependencyMap[10]);
  var _TabBarVariants = require(_dependencyMap[11]);
  var _reactJsxRuntime = require(_dependencyMap[12]);
  const _worklet_856142674543_init_data = {
    code: "function TabItemComponentTsx1(){const{reduceMotion,scale,isActive,opacity}=this.__closure;return{transform:[{scale:reduceMotion?1:scale.value}],opacity:reduceMotion?isActive?1:0.7:opacity.value};}"
  };
  const TabItemComponent = ({
    item,
    isActive,
    onPress,
    onLayout,
    variant,
    size,
    showLabels
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const reduceMotion = (0, _reactNativeReanimated.useReducedMotion)();
    const scale = (0, _reactNativeReanimated.useSharedValue)(1);
    const opacity = (0, _reactNativeReanimated.useSharedValue)(isActive ? 1 : 0.7);
    (0, _react.useEffect)(() => {
      opacity.value = (0, _reactNativeReanimated.withTiming)(isActive ? 1 : item.disabled ? 0.4 : 0.7, {
        duration: 200
      });
    }, [isActive, item.disabled, opacity]);
    const handlePressIn = () => {
      if (!item.disabled) {
        scale.value = (0, _reactNativeReanimated.withSpring)(0.95, {
          damping: 15
        });
      }
    };
    const handlePressOut = () => {
      scale.value = (0, _reactNativeReanimated.withSpring)(1, {
        damping: 15
      });
    };
    const animatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function TabItemComponentTsx1Factory({
      _worklet_856142674543_init_data,
      reduceMotion,
      scale,
      isActive,
      opacity
    }) {
      const TabItemComponentTsx1 = () => ({
        transform: [{
          scale: reduceMotion ? 1 : scale.value
        }],
        opacity: reduceMotion ? isActive ? 1 : 0.7 : opacity.value
      });
      TabItemComponentTsx1.__closure = {
        reduceMotion,
        scale,
        isActive,
        opacity
      };
      TabItemComponentTsx1.__workletHash = 856142674543;
      TabItemComponentTsx1.__initData = _worklet_856142674543_init_data;
      return TabItemComponentTsx1;
    }({
      _worklet_856142674543_init_data,
      reduceMotion,
      scale,
      isActive,
      opacity
    }));
    const config = _TabBarTypes.sizeConfig[size];
    const variantStyles = (0, _TabBarVariants.getVariantStyles)(variant, isActive, theme);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
      onPress: onPress,
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      disabled: item.disabled,
      onLayout: onLayout,
      accessibilityRole: "tab",
      accessibilityState: {
        selected: isActive,
        disabled: item.disabled
      },
      accessibilityLabel: item.label,
      accessibilityHint: item.disabled ? item.disabledReason : undefined,
      style: (0, _utilsTouchTarget.getMinTouchTargetStyle)(undefined, showLabels ? undefined : 44),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
        style: [_TabBarStyles.styles.tabItem, {
          paddingVertical: config.paddingVertical,
          paddingHorizontal: config.paddingHorizontal
        }, variantStyles.container, animatedStyle],
        children: [item.icon ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: isActive ? (0, _themeTokensElevation.glow)(variantStyles.icon.color, 'whisper') : undefined,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
            name: item.icon,
            size: size === 'sm' ? 'sm' : 'md',
            color: variantStyles.icon.color,
            variant: isActive ? 'solid' : 'outline',
            style: showLabels ? _TabBarStyles.styles.iconWithLabel : undefined
          })
        }) : null, showLabels ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: size === 'sm' ? 'caption' : 'body',
          style: [{
            fontSize: config.fontSize
          }, variantStyles.text, {
            fontWeight: isActive ? '600' : '400'
          }],
          children: item.label
        }) : null, item.badge !== undefined ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: [_TabBarStyles.styles.badge, {
            backgroundColor: theme.colors.error.DEFAULT
          }, size === 'sm' ? _TabBarStyles.styles.badgeSmall : undefined],
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.inverse",
            style: [_TabBarStyles.styles.badgeText, size === 'sm' ? _TabBarStyles.styles.badgeTextSmall : undefined],
            children: typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge
          })
        }) : null, item.disabled ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: _TabBarStyles.styles.disabledOverlay,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
            name: "lock",
            size: "sm",
            color: theme.colors.text.tertiary
          })
        }) : null]
      })
    });
  };
},3381,[12,1286,80,226,1489,1691,1463,2698,2157,3382,3380,3383,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "sizeConfig", {
    enumerable: true,
    get: function () {
      return sizeConfig;
    }
  });
  const sizeConfig = {
    sm: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      fontSize: 12
    },
    md: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      fontSize: 14
    },
    lg: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      fontSize: 16
    }
  };
},3382,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getVariantStyles = getVariantStyles;
  var _themeTokensColors = require(_dependencyMap[0]);
  function getVariantStyles(variant, isActive, theme) {
    switch (variant) {
      case 'pills':
        return {
          container: {
            backgroundColor: isActive ? theme.colors.primary[500] : 'transparent',
            borderRadius: 999
          },
          text: {
            color: isActive ? _themeTokensColors.lightColors.text.inverse : theme.colors.text.secondary
          },
          icon: {
            color: isActive ? _themeTokensColors.lightColors.text.inverse : theme.colors.text.secondary
          }
        };
      case 'underline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderBottomWidth: 2,
            borderBottomColor: isActive ? theme.colors.primary[500] : 'transparent'
          },
          text: {
            color: isActive ? theme.colors.primary[500] : theme.colors.text.secondary
          },
          icon: {
            color: isActive ? theme.colors.primary[500] : theme.colors.text.secondary
          }
        };
      case 'buttons':
        return {
          container: {
            backgroundColor: isActive ? theme.colors.background.tertiary : theme.colors.background.secondary,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isActive ? theme.colors.primary[500] : theme.colors.border.DEFAULT
          },
          text: {
            color: isActive ? theme.colors.primary[500] : theme.colors.text.secondary
          },
          icon: {
            color: isActive ? theme.colors.primary[500] : theme.colors.text.secondary
          }
        };
      default:
        return {
          container: {
            backgroundColor: isActive ? `${theme.colors.primary[500]}20` : 'transparent',
            borderRadius: 8
          },
          text: {
            color: isActive ? theme.colors.primary[500] : theme.colors.text.secondary
          },
          icon: {
            color: isActive ? theme.colors.primary[500] : theme.colors.text.secondary
          }
        };
    }
  }
},3383,[1465]);
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
  Object.defineProperty(exports, "Breadcrumb", {
    enumerable: true,
    get: function () {
      return Breadcrumb;
    }
  });
  var _react = require(_dependencyMap[0]);
  var React = _interopDefault(_react);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _TabBarStyles = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  const Breadcrumb = ({
    items,
    separator = '/',
    style
  }) => {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      style: [_TabBarStyles.styles.breadcrumb, style],
      children: items.map((item, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(React.default.Fragment, {
        children: [index > 0 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.tertiary",
          style: _TabBarStyles.styles.separator,
          children: separator
        }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          onPress: item.onPress,
          disabled: !item.onPress || index === items.length - 1,
          accessibilityLabel: "Breadcrumb",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: index === items.length - 1 ? 'text.primary' : 'primary.500',
            style: [_TabBarStyles.styles.breadcrumbItem, index === items.length - 1 ? _TabBarStyles.styles.breadcrumbItemActive : undefined],
            children: item.label
          })
        })]
      }, `${item.label}-${index}`))
    });
  };
},3384,[12,1286,80,1489,3380,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  const _excluded = ["children", "onPress", "onLongPress", "variant", "size", "style", "state", "loadingMessage", "disabledReason", "errorMessage", "onRetry", "icon", "badge", "badgeColor", "selected", "selectionIcon", "accessibilityLabel", "accessibilityHint", "hapticOnPress", "scaleOnPress", "fullWidth", "aspectRatio", "disabled"];
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  function _interopDefault(e) {
    return e && e.__esModule ? e : {
      default: e
    };
  }
  Object.defineProperty(exports, "InteractiveCard", {
    enumerable: true,
    get: function () {
      return InteractiveCard;
    }
  });
  var _babelRuntimeHelpersObjectWithoutPropertiesLoose = require(_dependencyMap[0]);
  var _objectWithoutPropertiesLoose = _interopDefault(_babelRuntimeHelpersObjectWithoutPropertiesLoose);
  var _react = require(_dependencyMap[1]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[3]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeReanimated = require(_dependencyMap[4]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesText = require(_dependencyMap[5]);
  var _iconsComponentsIcon = require(_dependencyMap[6]);
  var _themeThemeContext = require(_dependencyMap[7]);
  var _InteractiveCardStyles = require(_dependencyMap[8]);
  var _InteractiveCardOverlays = require(_dependencyMap[9]);
  var _reactJsxRuntime = require(_dependencyMap[10]);
  const variantStyleMap = {
    default: {
      backgroundColor: 'transparent',
      borderWidth: 0
    },
    elevated: {
      backgroundColor: 'transparent',
      borderWidth: 0
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0
    }
  };
  const sizeStyleMap = {
    sm: {
      padding: 12,
      borderRadius: 12
    },
    md: {
      padding: 16,
      borderRadius: 16
    },
    lg: {
      padding: 20,
      borderRadius: 20
    }
  };
  const _worklet_8066360612460_init_data = {
    code: "function InteractiveCardTsx1(){const{scale,opacity}=this.__closure;return{transform:[{scale:scale.value}],opacity:opacity.value};}"
  };
  const InteractiveCard = _ref => {
    let {
        children,
        onPress,
        onLongPress,
        variant = 'default',
        size = 'md',
        style,
        state = 'default',
        loadingMessage,
        disabledReason,
        errorMessage,
        onRetry,
        icon,
        badge,
        badgeColor,
        selected = false,
        selectionIcon,
        accessibilityLabel,
        accessibilityHint,
        hapticOnPress = true,
        scaleOnPress = 0.98,
        fullWidth: isFullWidth = false,
        aspectRatio,
        disabled: propDisabled
      } = _ref,
      pressableProps = (0, _objectWithoutPropertiesLoose.default)(_ref, _excluded);
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const reducedMotion = (0, _reactNativeReanimated.useReducedMotion)();
    const [, setIsPressed] = (0, _react.useState)(false);
    const [, setIsLoading] = (0, _react.useState)(false);
    const scale = (0, _reactNativeReanimated.useSharedValue)(1);
    const opacity = (0, _reactNativeReanimated.useSharedValue)(1);
    const isDisabled = propDisabled || state === 'disabled' || state === 'loading';
    const isError = state === 'error';
    const animatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function InteractiveCardTsx1Factory({
      _worklet_8066360612460_init_data,
      scale,
      opacity
    }) {
      const InteractiveCardTsx1 = () => ({
        transform: [{
          scale: scale.value
        }],
        opacity: opacity.value
      });
      InteractiveCardTsx1.__closure = {
        scale,
        opacity
      };
      InteractiveCardTsx1.__workletHash = 8066360612460;
      InteractiveCardTsx1.__initData = _worklet_8066360612460_init_data;
      return InteractiveCardTsx1;
    }({
      _worklet_8066360612460_init_data,
      scale,
      opacity
    }));
    const handlePress = (0, _react.useCallback)(async () => {
      if (isDisabled || !onPress) {
        return;
      }
      void hapticOnPress;
      setIsLoading(true);
      try {
        await onPress();
      } finally {
        setIsLoading(false);
      }
    }, [onPress, isDisabled, hapticOnPress]);
    const handlePressIn = (0, _react.useCallback)(() => {
      if (!isDisabled && scaleOnPress) {
        scale.value = reducedMotion ? scaleOnPress : (0, _reactNativeReanimated.withSpring)(scaleOnPress, {
          damping: 15,
          stiffness: 300
        });
        setIsPressed(true);
      }
    }, [isDisabled, scaleOnPress, scale, reducedMotion]);
    const handlePressOut = (0, _react.useCallback)(() => {
      scale.value = reducedMotion ? 1 : (0, _reactNativeReanimated.withSpring)(1, {
        damping: 15,
        stiffness: 300
      });
      setIsPressed(false);
    }, [scale, reducedMotion]);
    const vStyle = variantStyleMap[variant];
    const sStyle = sizeStyleMap[size];
    const accessibilityState = {
      disabled: isDisabled,
      selected,
      busy: state === 'loading'
    };
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      style: [animatedStyle, isFullWidth && _InteractiveCardStyles.fullWidth],
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, Object.assign({
        onPress: handlePress,
        onLongPress: onLongPress,
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
        disabled: isDisabled,
        accessibilityRole: "button",
        accessibilityLabel: accessibilityLabel,
        accessibilityHint: accessibilityHint,
        accessibilityState: accessibilityState
      }, pressableProps, {
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: [_InteractiveCardStyles.card, {
            backgroundColor: vStyle.backgroundColor,
            borderWidth: vStyle.borderWidth,
            borderColor: vStyle.borderColor,
            padding: sStyle.padding,
            borderRadius: sStyle.borderRadius
          }, selected && [{
            borderColor: theme.colors.primary[500]
          }], isError && [{
            borderColor: theme.colors.error.DEFAULT
          }], aspectRatio !== undefined ? {
            aspectRatio
          } : undefined, style],
          children: [badge !== undefined && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: [_InteractiveCardStyles.badge, {
              backgroundColor: badgeColor || theme.colors.primary[500]
            }],
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.inverse",
              style: _InteractiveCardStyles.badgeText,
              children: typeof badge === 'number' && badge > 99 ? '99+' : badge
            })
          }), icon && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: _InteractiveCardStyles.iconContainer,
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
              name: icon,
              size: "lg",
              color: theme.colors.primary[500]
            })
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: _InteractiveCardStyles.contentStyle,
            children: children
          }), state === 'loading' && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_InteractiveCardOverlays.LoadingOverlay, {
            message: loadingMessage,
            theme: theme
          }), state === 'disabled' && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_InteractiveCardOverlays.DisabledOverlay, {
            reason: disabledReason,
            theme: theme
          }), state === 'error' && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_InteractiveCardOverlays.ErrorOverlay, {
            message: errorMessage,
            onRetry: onRetry,
            theme: theme
          }), selected && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_InteractiveCardOverlays.SelectedOverlay, {
            icon: selectionIcon,
            theme: theme
          })]
        })
      }))
    });
  };
},3385,[21,12,80,1286,226,1489,1691,1463,3386,3387,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "fullWidth", {
    enumerable: true,
    get: function () {
      return fullWidth;
    }
  });
  Object.defineProperty(exports, "card", {
    enumerable: true,
    get: function () {
      return card;
    }
  });
  Object.defineProperty(exports, "selected", {
    enumerable: true,
    get: function () {
      return selected;
    }
  });
  Object.defineProperty(exports, "errorCard", {
    enumerable: true,
    get: function () {
      return errorCard;
    }
  });
  Object.defineProperty(exports, "badge", {
    enumerable: true,
    get: function () {
      return badge;
    }
  });
  Object.defineProperty(exports, "badgeText", {
    enumerable: true,
    get: function () {
      return badgeText;
    }
  });
  Object.defineProperty(exports, "iconContainer", {
    enumerable: true,
    get: function () {
      return iconContainer;
    }
  });
  Object.defineProperty(exports, "contentStyle", {
    enumerable: true,
    get: function () {
      return contentStyle;
    }
  });
  const fullWidth = {
    width: '100%'
  };
  const card = {
    overflow: 'hidden',
    position: 'relative'
  };
  const selected = {
    borderWidth: 2
  };
  const errorCard = {
    borderWidth: 1
  };
  const badge = {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  };
  const badgeText = {
    fontSize: 10,
    fontWeight: '700'
  };
  const iconContainer = {
    marginBottom: 8
  };
  const contentStyle = {
    flex: 1
  };
},3386,[]);
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
  Object.defineProperty(exports, "LoadingOverlay", {
    enumerable: true,
    get: function () {
      return LoadingOverlay;
    }
  });
  Object.defineProperty(exports, "DisabledOverlay", {
    enumerable: true,
    get: function () {
      return DisabledOverlay;
    }
  });
  Object.defineProperty(exports, "ErrorOverlay", {
    enumerable: true,
    get: function () {
      return ErrorOverlay;
    }
  });
  Object.defineProperty(exports, "SelectedOverlay", {
    enumerable: true,
    get: function () {
      return SelectedOverlay;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[2]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeReanimated = require(_dependencyMap[3]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _iconsComponentsIcon = require(_dependencyMap[5]);
  var _InteractiveCardStyles = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  const LoadingOverlay = ({
    message,
    theme
  }) => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
    style: [_InteractiveCardStyles.cardStyles.overlay, {
      backgroundColor: theme.colors.background.overlay
    }],
    children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      style: [_InteractiveCardStyles.cardStyles.spinner, {
        borderColor: theme.colors.primary[500]
      }]
    }), message && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
      variant: "caption",
      color: "text.secondary",
      style: _InteractiveCardStyles.cardStyles.overlayMessage,
      children: message
    })]
  });
  const DisabledOverlay = ({
    reason,
    theme
  }) => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
    style: [_InteractiveCardStyles.cardStyles.overlay, {
      backgroundColor: theme.colors.background.overlay
    }],
    children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
      name: "lock",
      size: "md",
      color: theme.colors.text.tertiary
    }), reason && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
      variant: "caption",
      color: "text.tertiary",
      style: _InteractiveCardStyles.cardStyles.overlayMessage,
      children: reason
    })]
  });
  const ErrorOverlay = ({
    message,
    onRetry,
    theme
  }) => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
    style: [_InteractiveCardStyles.cardStyles.overlay, {
      backgroundColor: theme.colors.background.overlay
    }],
    children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
      name: "alert-circle",
      size: "lg",
      color: theme.colors.error.DEFAULT
    }), message && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
      variant: "caption",
      color: "error.DEFAULT",
      style: _InteractiveCardStyles.cardStyles.overlayMessage,
      children: message
    }), onRetry && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
      onPress: onRetry,
      style: [_InteractiveCardStyles.cardStyles.retryButton, {
        backgroundColor: theme.colors.error.DEFAULT
      }],
      accessibilityLabel: "Retry loading",
      accessibilityRole: "button",
      accessibilityHint: "Double tap to activate",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "caption",
        color: "text.inverse",
        children: "Retry"
      })
    })]
  });
  const SelectedOverlay = ({
    icon = 'check-circle',
    theme
  }) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
    style: [_InteractiveCardStyles.cardStyles.selectedIndicator, {
      backgroundColor: theme.colors.success.DEFAULT
    }],
    children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
      name: icon,
      size: "sm",
      color: theme.colors.text.inverse
    })
  });
},3387,[12,80,1286,226,1489,1691,3388,203]);
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
  Object.defineProperty(exports, "cardStyles", {
    enumerable: true,
    get: function () {
      return cardStyles;
    }
  });
  var _reactNativeWebDistExportsStyleSheet = require(_dependencyMap[0]);
  var StyleSheet = _interopDefault(_reactNativeWebDistExportsStyleSheet);
  var _sharedUiCreateSheet = require(_dependencyMap[1]);
  const cardStyles = (0, _sharedUiCreateSheet.createSheet)({
    fullWidth: {
      width: '100%'
    },
    card: {
      position: 'relative',
      overflow: 'hidden'
    },
    selected: {
      borderWidth: 2
    },
    error: {
      borderWidth: 2
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
      zIndex: 10
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '700'
    },
    iconContainer: {
      marginBottom: 12
    },
    content: {
      flex: 1
    },
    overlay: Object.assign({}, StyleSheet.default.absoluteFill, {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16
    }),
    overlayMessage: {
      marginTop: 8,
      textAlign: 'center',
      paddingHorizontal: 16
    },
    spinner: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 3,
      borderTopColor: 'transparent'
    },
    retryButton: {
      marginTop: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8
    },
    selectedIndicator: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center'
    },
    skeletonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
    },
    skeletonLines: {
      flex: 1,
      justifyContent: 'center'
    }
  });
},3388,[87,1678]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.ModeSelector = ModeSelector;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _themeThemeContext = require(_dependencyMap[3]);
  var _ModeSelectorData = require(_dependencyMap[4]);
  var _ModeCardItem = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  function ModeSelector({
    hasActiveStudyPlan,
    onModeChange,
    selectedMode,
    userMasteryRank,
    showSessionless = false
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      gap: "sm",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "label",
        color: "text.secondary",
        children: "Session Type"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        gap: "sm",
        children: _ModeSelectorData.FOCUS_MODE_CARDS.map(card => {
          const disabledReason = (0, _ModeSelectorData.getDisabledReason)(card.mode, hasActiveStudyPlan, userMasteryRank);
          const isSelected = selectedMode === card.mode;
          const isDisabled = disabledReason !== null;
          return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_ModeCardItem.ModeCardItem, {
            card: card,
            isSelected: isSelected,
            isDisabled: isDisabled,
            disabledReason: disabledReason,
            onPress: () => onModeChange(card.mode)
          }, card.mode);
        })
      }), showSessionless && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          color: "text.secondary",
          style: {
            marginTop: 8
          },
          children: "Session-less"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          gap: "sm",
          children: _ModeSelectorData.SESSIONLESS_MODE_CARDS.map(card => {
            const isSelected = selectedMode === card.mode;
            return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_ModeCardItem.ModeCardItem, {
              card: card,
              isSelected: isSelected,
              isDisabled: false,
              disabledReason: null,
              onPress: () => onModeChange(card.mode)
            }, card.mode);
          })
        })]
      })]
    });
  }
},3389,[12,1462,1489,1463,3390,3392,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "FOCUS_MODE_CARDS", {
    enumerable: true,
    get: function () {
      return FOCUS_MODE_CARDS;
    }
  });
  Object.defineProperty(exports, "SESSIONLESS_MODE_CARDS", {
    enumerable: true,
    get: function () {
      return SESSIONLESS_MODE_CARDS;
    }
  });
  exports.getDisabledReason = getDisabledReason;
  var _sessionModes = require(_dependencyMap[0]);
  var _masteryComponentsMasteryUnlockGateData = require(_dependencyMap[1]);
  const FOCUS_MODE_CARDS = [{
    description: 'High intensity — for hard, uninterrupted work',
    glyph: 'deep',
    mode: _sessionModes.SessionMode.DEEP_WORK,
    name: 'Deep Work'
  }, {
    description: 'Steady, low-pressure — protect a single thread',
    glyph: 'casual',
    mode: _sessionModes.SessionMode.LIGHT_FOCUS,
    name: 'Light Focus'
  }, {
    description: 'Named study blocks with recall and review built in',
    glyph: 'study',
    mode: _sessionModes.SessionMode.STUDY,
    name: 'Study'
  }, {
    description: 'Open-ended creative flow — no pressure, no timers',
    glyph: 'creative',
    mode: _sessionModes.SessionMode.CREATIVE,
    name: 'Creative'
  }, {
    description: 'Short blocks — chain them for momentum',
    glyph: 'sprint',
    mode: _sessionModes.SessionMode.SPRINT,
    name: 'Sprint'
  }];
  const SESSIONLESS_MODE_CARDS = [{
    description: 'Plan your week, projects, and study blocks',
    glyph: 'deep',
    mode: _sessionModes.SessionMode.PLAN,
    name: 'Plan'
  }, {
    description: 'Review your progress and insights',
    glyph: 'casual',
    mode: _sessionModes.SessionMode.REVIEW,
    name: 'Review'
  }, {
    description: 'Quick capture — voice, photo, link, brain dump',
    glyph: 'creative',
    mode: _sessionModes.SessionMode.CAPTURE,
    name: 'Capture'
  }, {
    description: 'Track habits and micro-commitments',
    glyph: 'sprint',
    mode: _sessionModes.SessionMode.HABIT,
    name: 'Habit'
  }];
  function getDisabledReason(mode, hasActiveStudyPlan, userMasteryRank) {
    if (mode === _sessionModes.SessionMode.STUDY && !hasActiveStudyPlan) {
      return 'Requires an active study plan';
    }
    if (mode === _sessionModes.SessionMode.DEEP_WORK && userMasteryRank) {
      const isUnlocked = (0, _masteryComponentsMasteryUnlockGateData.isFeatureUnlocked)(userMasteryRank, 'DEEP_WORK');
      if (!isUnlocked) {
        return 'Unlocks at Adept mastery rank';
      }
    }
    return null;
  }
},3390,[1829,3391]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "FEATURE_REQUIREMENTS", {
    enumerable: true,
    get: function () {
      return FEATURE_REQUIREMENTS;
    }
  });
  Object.defineProperty(exports, "FEATURE_INFO", {
    enumerable: true,
    get: function () {
      return FEATURE_INFO;
    }
  });
  Object.defineProperty(exports, "RANK_UNLOCKS", {
    enumerable: true,
    get: function () {
      return RANK_UNLOCKS;
    }
  });
  exports.getRequiredRank = getRequiredRank;
  exports.isFeatureUnlocked = isFeatureUnlocked;
  exports.getPointsToUnlock = getPointsToUnlock;
  var _types = require(_dependencyMap[0]);
  const FEATURE_REQUIREMENTS = {
    DEEP_WORK: 'ADEPT',
    NIGHTMARE_MODE: 'EXPERT',
    MASTERY_DUEL: 'MASTER',
    CUSTOM_CHALLENGE: 'GRANDMASTER',
    BOSS_TIER_3_4: 'ADEPT',
    BOSS_TIER_5_6: 'EXPERT'
  };
  const FEATURE_INFO = {
    DEEP_WORK: {
      name: 'Deep Work Mode',
      description: 'Ultra-minimalist 45+ minute sessions with maximum boss damage',
      icon: 'brain',
      benefit: '1.5× boss damage multiplier'
    },
    NIGHTMARE_MODE: {
      name: 'Nightmare Mode',
      description: 'Stricter anti-cheat with 2× XP reward for perfection',
      icon: 'flame',
      benefit: '2× XP on all sessions'
    },
    MASTERY_DUEL: {
      name: 'Mastery Duel',
      description: 'Duels scored on technique quality, not just time',
      icon: 'trophy',
      benefit: 'Skill-based rival competition'
    },
    CUSTOM_CHALLENGE: {
      name: 'Custom Challenges',
      description: 'Define your own daily challenges with custom rewards',
      icon: 'edit',
      benefit: 'Personalized progression'
    },
    BOSS_TIER_3_4: {
      name: 'Tier 3-4 Bosses',
      description: 'Access to stronger bosses with better loot',
      icon: 'skull',
      benefit: 'Rare boss drops'
    },
    BOSS_TIER_5_6: {
      name: 'Tier 5-6 Bosses',
      description: 'The ultimate boss challenges await',
      icon: 'crown',
      benefit: 'Legendary boss drops'
    }
  };
  const RANK_UNLOCKS = {
    APPRENTICE: ['All base session modes', 'Basic boss encounters'],
    ADEPT: ['DEEP_WORK mode unlocked', 'Advanced boss tier 3-4 access'],
    EXPERT: ['Nightmare Mode sessions (2x XP)', 'Boss tier 5-6 access'],
    MASTER: ['Mastery Duel type', 'Custom challenge creation'],
    GRANDMASTER: ['Exclusive Grandmaster badge', 'Priority support access']
  };
  function getRequiredRank(feature) {
    return FEATURE_REQUIREMENTS[feature];
  }
  function isFeatureUnlocked(userRank, feature) {
    const requiredRank = FEATURE_REQUIREMENTS[feature];
    const ranks = ['APPRENTICE', 'ADEPT', 'EXPERT', 'MASTER', 'GRANDMASTER'];
    return ranks.indexOf(userRank) >= ranks.indexOf(requiredRank);
  }
  function getPointsToUnlock(feature, currentPoints) {
    const requiredRank = FEATURE_REQUIREMENTS[feature];
    return Math.max(0, _types.MASTERY_RANK_THRESHOLDS[requiredRank] - currentPoints);
  }
},3391,[2995]);
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
  exports.ModeCardItem = ModeCardItem;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _sharedUiLiquidGlassSessionGlyphs = require(_dependencyMap[5]);
  var _sessionModes = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function ModeCardItem({
    card,
    isSelected,
    isDisabled,
    disabledReason,
    onPress
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
      accessibilityHint: disabledReason ?? `Selects ${card.name} mode`,
      accessibilityLabel: `${card.name} mode`,
      accessibilityRole: "button",
      disabled: isDisabled,
      onPress: onPress,
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        minHeight: 76,
        px: "md",
        py: "md",
        bg: isSelected ? 'surface.selected' : 'semantic.surfaceGlass',
        borderRadius: 24,
        style: {
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? theme.colors.semantic.secondary : theme.colors.semantic.liquidGlassBorder,
          opacity: isDisabled ? 0.55 : 1,
          shadowColor: theme.colors.semantic.shadow,
          shadowOffset: {
            width: 0,
            height: 8
          },
          shadowOpacity: isSelected ? 0.18 : 0.08,
          shadowRadius: isSelected ? 16 : 10
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          alignItems: "center",
          gap: "md",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            width: 56,
            height: 56,
            borderRadius: 20,
            bg: "semantic.surfaceElevated",
            alignItems: "center",
            justifyContent: "center",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiLiquidGlassSessionGlyphs.SessionGlyph, {
              name: card.glyph,
              size: 44
            })
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flex: 1,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "label",
              color: "text.primary",
              children: card.name
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.secondary",
              style: {
                lineHeight: 19
              },
              children: disabledReason ?? card.description
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            alignItems: "center",
            bg: "semantic.backgroundElevated",
            borderRadius: 999,
            px: "sm",
            py: "xs",
            style: {
              borderColor: theme.colors.border.light,
              borderWidth: 1
            },
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.secondary",
              children: (0, _sessionModes.isSessionLessMode)(card.mode) ? 'No timer' : 'Timer'
            })
          })]
        })
      })
    }, card.mode);
  }
},3392,[12,1286,1462,1489,1463,3393,1829,203]);
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
  exports.SessionGlyph = SessionGlyph;
  require(_dependencyMap[0]);
  var _reactNativeSvg = require(_dependencyMap[1]);
  var Svg = _interopDefault(_reactNativeSvg);
  var _themeThemeContext = require(_dependencyMap[2]);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  function SessionGlyph({
    name,
    size = 52
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const teal = theme.colors.semantic.secondary;
    const deep = theme.colors.semantic.primary;
    const amber = theme.colors.semantic.accent;
    const muted = theme.colors.semantic.border;
    const stroke = name === 'deep' || name === 'sprint' ? amber : deep;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Svg.default, {
      width: size,
      height: size,
      viewBox: "0 0 72 72",
      accessibilityRole: "image",
      accessibilityLabel: `${name} session glyph`,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Defs, {
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactNativeSvg.LinearGradient, {
          id: "g",
          x1: "10",
          y1: "6",
          x2: "62",
          y2: "66",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
            offset: "0",
            stopColor: "#FFFFFF",
            stopOpacity: "0.92"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
            offset: "0.55",
            stopColor: teal,
            stopOpacity: "0.22"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
            offset: "1",
            stopColor: amber,
            stopOpacity: "0.18"
          })]
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
        cx: "36",
        cy: "36",
        r: "30",
        fill: "url(#g)",
        stroke: muted
      }), name === 'casual' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Path, {
        d: "M22 42c16 0 24-8 28-22 4 16-1 30-20 34m0-12c2 6 6 10 12 12",
        fill: "none",
        stroke: stroke,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "4"
      }) : null, name === 'focused' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Path, {
        d: "M41 14 24 39h13l-5 19 18-27H36l5-17Z",
        fill: "none",
        stroke: stroke,
        strokeLinejoin: "round",
        strokeWidth: "4"
      }) : null, name === 'deep' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Path, {
        d: "M36 14c8 9 13 16 13 25 0 11-7 18-13 18s-13-7-13-18c0-8 5-14 13-25Zm0 18c-5 6-7 10-7 15 0 5 3 8 7 8s7-3 7-8c0-5-2-9-7-15Z",
        fill: "none",
        stroke: stroke,
        strokeLinejoin: "round",
        strokeWidth: "4"
      }) : null, name === 'study' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Path, {
        d: "M20 20h21c6 0 11 5 11 11v21H31c-6 0-11-5-11-11V20Zm11 10h12M31 40h12",
        fill: "none",
        stroke: stroke,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "4"
      }) : null, name === 'creative' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Path, {
        d: "M22 47c9-21 29-26 30-10 0 9-8 17-19 14m-11-4 8 8",
        fill: "none",
        stroke: stroke,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "4"
      }) : null, name === 'sprint' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Path, {
        d: "M18 42h18L30 58l24-28H36l7-16-25 28Z",
        fill: "none",
        stroke: stroke,
        strokeLinejoin: "round",
        strokeWidth: "4"
      }) : null, name === 'stake' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Path, {
        d: "M36 14 56 26v20L36 58 16 46V26l20-12Zm0 0v44M16 26l20 12 20-12",
        fill: "none",
        stroke: stroke,
        strokeLinejoin: "round",
        strokeWidth: "4"
      }) : null]
    });
  }
},3393,[12,1643,1463,203]);
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
  exports.SessionAdvancedOptions = SessionAdvancedOptions;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _iconsComponentsIcon = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function SessionAdvancedOptions({
    onToggle,
    selectedDurationSeconds,
    selectedPreset,
    showAdvanced
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      px: "lg",
      mt: "lg",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
        onPress: onToggle,
        accessibilityLabel: "Toggle advanced options",
        accessibilityRole: "button",
        accessibilityHint: "Double tap to activate",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          alignItems: "center",
          py: "md",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "label",
            color: "text.secondary",
            children: "Advanced options"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            ml: "sm",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
              name: showAdvanced ? 'chevron-up' : 'chevron-down',
              size: "sm",
              color: theme.colors.text.secondary
            })
          })]
        })
      }), showAdvanced ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        entering: _reactNativeReanimated.FadeInDown.duration(250),
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          p: "lg",
          bg: "background.secondary",
          borderRadius: "lg",
          mb: "lg",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "label",
            mb: "md",
            children: "SESSION DETAILS"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            justifyContent: "space-between",
            mb: "md",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              children: "Duration"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              fontWeight: "600",
              children: `${Math.round(selectedDurationSeconds / 60)} min`
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            justifyContent: "space-between",
            mb: "md",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              children: "Intervals"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              fontWeight: "600",
              children: selectedPreset.intervals
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            justifyContent: "space-between",
            mb: "md",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              children: "Break Duration"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              fontWeight: "600",
              children: `${Math.round(selectedPreset.breakDuration / 60)} min`
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            justifyContent: "space-between",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              children: "Strict Mode"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              fontWeight: "600",
              children: selectedPreset.strictMode ? 'On' : 'Off'
            })]
          })]
        })
      }) : null]
    });
  }
},3394,[12,1286,226,1462,1489,1691,1463,203]);
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
  exports.SessionThemeSelector = SessionThemeSelector;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _shopifyFlashList = require(_dependencyMap[2]);
  var _componentsFocusRing = require(_dependencyMap[3]);
  var _componentsPrimitivesBox = require(_dependencyMap[4]);
  var _componentsPrimitivesButton = require(_dependencyMap[5]);
  var _componentsPrimitivesText = require(_dependencyMap[6]);
  var _themeThemeContext = require(_dependencyMap[7]);
  var _featuresThemesSessionThemes = require(_dependencyMap[8]);
  var _utilsSessionSetup = require(_dependencyMap[9]);
  var _reactJsxRuntime = require(_dependencyMap[10]);
  function SessionThemeSelector({
    onPressTheme,
    selectedDurationSeconds,
    selectedTheme,
    selectedThemeId,
    themeQueryError,
    themeQueryLoading,
    themeQueryRetry,
    themes
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const renderThemeItem = (0, _react.useCallback)(({
      item
    }) => {
      const isSelected = item.id === selectedThemeId;
      const isOwned = item.isOwned || item.isFree;
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
        onPress: () => onPressTheme(item),
        accessibilityLabel: "Theme option",
        accessibilityRole: "button",
        accessibilityHint: "Double tap to activate",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          width: 132,
          mr: "md",
          p: "md",
          borderRadius: 20,
          style: {
            backgroundColor: theme.colors.background.secondary,
            borderWidth: 1,
            borderColor: isSelected ? item.previewColor : theme.colors.border.light
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            alignItems: "center",
            mb: "sm",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
              width: 56,
              height: 56,
              borderRadius: 999,
              style: {
                backgroundColor: item.previewColor
              }
            })
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "label",
            children: item.name
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.secondary",
            mt: "xs",
            children: isOwned ? 'Owned' : `${item.coinCost} coins`
          })]
        })
      });
    }, [selectedThemeId, onPressTheme, theme]);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      px: "lg",
      mt: "lg",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "label",
        mb: "sm",
        children: "Theme"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "caption",
        color: "text.secondary",
        mb: "md",
        children: "Visual environments that make each session feel more personal."
      }), themeQueryLoading ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        p: "md",
        bg: "background.secondary",
        borderRadius: "lg",
        style: {
          borderWidth: 1,
          borderColor: theme.colors.border.light
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: "text.secondary",
          children: "Loading your themes..."
        })
      }) : themeQueryError ? /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        p: "md",
        bg: "background.secondary",
        borderRadius: "lg",
        style: {
          borderWidth: 1,
          borderColor: theme.colors.error.DEFAULT
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: "text.secondary",
          mb: "sm",
          children: "We could not load your themes right now."
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "outline",
          onPress: themeQueryRetry,
          accessibilityLabel: "Retry loading themes",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: "Retry"
          })
        })]
      }) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        height: 152,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_shopifyFlashList.FlashList, {
          horizontal: true,
          data: themes,
          showsHorizontalScrollIndicator: false,
          keyExtractor: item => item.id,
          contentContainerStyle: {
            paddingRight: theme.spacing[5]
          },
          estimatedItemSize: 132,
          renderItem: renderThemeItem
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        mt: "md",
        p: "md",
        borderRadius: "lg",
        style: {
          backgroundColor: selectedTheme.backgroundTint === 'transparent' ? theme.colors.background.secondary : selectedTheme.backgroundTint,
          borderWidth: 1,
          borderColor: theme.colors.border.light
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          children: selectedTheme.name
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.secondary",
          mt: "xs",
          children: selectedTheme.description
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        mt: "md",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.tertiary",
          mb: "sm",
          children: "Preview"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          p: "md",
          borderRadius: "lg",
          alignItems: "center",
          style: {
            backgroundColor: theme.colors.background.secondary,
            borderWidth: 1,
            borderColor: theme.colors.border.light
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsFocusRing.FocusRing, {
            size: 120,
            progressPercent: 72,
            focusMinutes: Math.round(selectedDurationSeconds / 60),
            gradientColors: (0, _utilsSessionSetup.buildPreviewGradient)((0, _featuresThemesSessionThemes.getSessionThemeById)(selectedThemeId).previewColor)
          })
        })]
      })]
    });
  }
},3395,[12,1286,2702,3396,1462,1680,1489,1463,3347,3349,203]);
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
  exports.FocusRing = FocusRing;
  var _react = require(_dependencyMap[0]);
  require(_dependencyMap[1]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeSvg = require(_dependencyMap[3]);
  var Svg = _interopDefault(_reactNativeSvg);
  var _reactNativeReanimated = require(_dependencyMap[4]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _primitivesText = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _sharedUiCreateSheet = require(_dependencyMap[7]);
  var _hooks = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  const AnimatedCircle = Animated.default.createAnimatedComponent(_reactNativeSvg.Circle);
  const _worklet_188285268619_init_data = {
    code: "function FocusRingTsx1(){const{circumference,progress}=this.__closure;return{strokeDashoffset:circumference-circumference*progress.value/100};}"
  };
  function FocusRing({
    progressPercent,
    focusMinutes,
    size = 148,
    gradientColors
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      isReducedMotion
    } = (0, _hooks.useReducedMotion)();
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (0, _reactNativeReanimated.useSharedValue)(0);
    const clamped = Math.max(0, Math.min(100, progressPercent));
    (0, _react.useEffect)(() => {
      progress.value = isReducedMotion ? clamped : (0, _reactNativeReanimated.withTiming)(clamped, {
        duration: 900,
        easing: _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.cubic)
      });
    }, [clamped, progress, isReducedMotion]);
    const animatedProps = (0, _reactNativeReanimated.useAnimatedProps)(function FocusRingTsx1Factory({
      _worklet_188285268619_init_data,
      circumference,
      progress
    }) {
      const FocusRingTsx1 = () => ({
        strokeDashoffset: circumference - circumference * progress.value / 100
      });
      FocusRingTsx1.__closure = {
        circumference,
        progress
      };
      FocusRingTsx1.__workletHash = 188285268619;
      FocusRingTsx1.__initData = _worklet_188285268619_init_data;
      return FocusRingTsx1;
    }({
      _worklet_188285268619_init_data,
      circumference,
      progress
    }));
    const isWeb = true;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      accessibilityLabel: `Daily goal progress ${focusMinutes} minutes, ${Math.round(clamped)} percent`,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Svg.default, {
        width: size,
        height: size,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Defs, {
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactNativeSvg.LinearGradient, {
            id: "focus-ring",
            x1: "0%",
            y1: "0%",
            x2: "100%",
            y2: "100%",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "0%",
              stopColor: gradientColors?.[0] ?? theme.colors.primary[500]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "100%",
              stopColor: gradientColors?.[1] ?? theme.colors.primary[300]
            })]
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          stroke: theme.colors.border.light,
          strokeWidth: strokeWidth,
          fill: "none"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          stroke: "url(#focus-ring)",
          strokeWidth: strokeWidth,
          strokeLinecap: "round",
          strokeDasharray: circumference,
          strokeDashoffset: circumference - circumference * clamped / 100,
          rotation: "-90",
          originX: size / 2,
          originY: size / 2,
          fill: "none"
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        pointerEvents: "none",
        style: [{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }, styles.center],
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_primitivesText.Text, {
          fontSize: 32,
          fontWeight: "800",
          color: theme.colors.text.primary,
          children: [Math.round(clamped), "%"]
        })
      })]
    });
  }
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    center: {
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
},3396,[12,18,80,1643,226,1489,1463,1678,2109,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.ActiveChallenges = ActiveChallenges;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _themeThemeContext = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  function ActiveChallenges({
    challenges
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    if (challenges.length === 0) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      px: "lg",
      mt: "lg",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "label",
        mb: "sm",
        children: "Active Challenges"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        gap: "sm",
        children: challenges.map(challenge => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          p: "md",
          bg: "background.secondary",
          borderRadius: "lg",
          style: {
            borderWidth: 1,
            borderColor: theme.colors.border.light
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "body",
            color: "text.primary",
            children: challenge.title
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.secondary",
            mt: "xs",
            children: "Complete this session to progress"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "label",
            color: "primary.500",
            mt: "sm",
            children: `+${challenge.masteryPoints} XP`
          })]
        }, challenge.id))
      })]
    });
  }
},3397,[12,1462,1489,1463,203]);
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
  exports.SessionSmartPickCard = SessionSmartPickCard;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsImage = require(_dependencyMap[1]);
  var Image = _interopDefault(_reactNativeWebDistExportsImage);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[2]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _themeThemeContext = require(_dependencyMap[5]);
  var _sharedUiLiquidGlassLiquidGlassCard = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function SessionSmartPickCard({
    description,
    onSelect
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_sharedUiLiquidGlassLiquidGlassCard.LiquidGlassCard, {
      emphasized: true,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        gap: "md",
        alignItems: "center",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          width: 64,
          height: 64,
          borderRadius: 24,
          bg: "semantic.surfaceElevated",
          alignItems: "center",
          justifyContent: "center",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Image.default, {
            source: require(_dependencyMap[8]),
            resizeMode: "contain",
            style: {
              height: 72,
              width: 72
            },
            accessibilityLabel: "Liquid glass focus talisman"
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flex: 1,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "label",
            color: "text.primary",
            children: "Smart Pick"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "body",
            color: "text.secondary",
            mt: "xs",
            children: description
          })]
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
        onPress: onSelect,
        style: {
          alignItems: 'center',
          backgroundColor: theme.colors.semantic.primary,
          borderRadius: 999,
          marginTop: theme.spacing[4],
          minHeight: 48,
          justifyContent: 'center'
        },
        accessibilityLabel: "Use smart pick",
        accessibilityRole: "button",
        accessibilityHint: "Applies the recommended session preset",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "button",
          color: "text.inverse",
          children: "Use this"
        })
      })]
    });
  }
},3398,[12,469,1286,1462,1489,1463,3127,203,3399]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  module.exports = {
    uri: "/assets/src/assets/generated/session/focus-talisman.6c2c3ed3f3b7dddfdb0c3a33ded6fab9.png",
    width: 1254,
    height: 1254,
    toString() {
      return this.uri;
    }
  };
},3399,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SessionSetupDifficultyCard = SessionSetupDifficultyCard;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _featuresSessionStartComponentsDifficultySelector = require(_dependencyMap[3]);
  var _sharedUiLiquidGlassLiquidGlassCard = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function getMultiplier(difficulty) {
    if (difficulty === 'CASUAL') {
      return 0.5;
    }
    if (difficulty === 'DEEP_WORK') {
      return 1.5;
    }
    return 1;
  }
  function getBonusLabel(difficulty) {
    if (difficulty === 'DEEP_WORK') {
      return '(1.5x Deep Work bonus)';
    }
    if (difficulty === 'CASUAL') {
      return '(0.5x Casual)';
    }
    return '';
  }
  function SessionSetupDifficultyCard({
    disabled,
    selected,
    selectedDurationSeconds,
    onChange
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      px: "lg",
      mt: "md",
      mb: "md",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_sharedUiLiquidGlassLiquidGlassCard.LiquidGlassCard, {
        compact: true,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          mb: "md",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "label",
            color: "text.secondary",
            children: "Intensity"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.tertiary",
            children: ["Estimated XP:", ' ', Math.round(selectedDurationSeconds / 60 * getMultiplier(selected)), ' ', getBonusLabel(selected)]
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionStartComponentsDifficultySelector.DifficultySelector, {
          selected: selected,
          onChange: onChange,
          disabled: disabled
        })]
      })
    });
  }
},3400,[12,1462,1489,3401,3127,203]);
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
  exports.DifficultySelector = DifficultySelector;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[2]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeReanimated = require(_dependencyMap[3]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _componentsPrimitivesText = require(_dependencyMap[5]);
  var _utilsHaptics = require(_dependencyMap[6]);
  var _eventsEventBus = require(_dependencyMap[7]);
  var _configSentry = require(_dependencyMap[8]);
  var _sharedUiLiquidGlassSessionGlyphs = require(_dependencyMap[9]);
  var _DifficultySelectorTypes = require(_dependencyMap[10]);
  var _reactJsxRuntime = require(_dependencyMap[11]);
  /**
   * DifficultySelector Component
   *
   * Three difficulty options for session stakes:
   * - CASUAL: Unlimited pauses, 50% XP
   * - FOCUSED: 2 max pauses, 100% XP (default)
   * - DEEP_WORK: 0 pauses, 150% XP
   *
   * @phase 4
   */

  function DifficultySelector({
    selected,
    onChange,
    disabled = false
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const haptics = (0, _utilsHaptics.useHaptics)();
    const handleSelect = difficulty => {
      if (disabled) {
        return;
      }
      haptics.light();
      (0, _configSentry.addBreadcrumb)('Difficulty selected', 'session', {
        difficulty,
        xpMultiplier: _DifficultySelectorTypes.DIFFICULTY_OPTIONS.find(d => d.id === difficulty)?.xpMultiplier
      });
      _eventsEventBus.eventBus.publish('session:difficulty_selected', {
        difficulty,
        timestamp: Date.now()
      });
      onChange(difficulty);
    };
    const containerStyle = {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing[3]
    };
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      style: containerStyle,
      children: _DifficultySelectorTypes.DIFFICULTY_OPTIONS.map(option => {
        const isSelected = selected === option.id;
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(DifficultyCard, {
          option: option,
          isSelected: isSelected,
          disabled: disabled,
          onPress: () => handleSelect(option.id)
        }, option.id);
      })
    });
  }
  const _worklet_15412687755843_init_data = {
    code: "function DifficultySelectorTsx1(){const{withSpring,isSelected}=this.__closure;return{transform:[{scale:withSpring(isSelected?1.05:1.0,{damping:15,stiffness:150})}]};}"
  };
  function DifficultyCard({
    option,
    isSelected,
    disabled,
    onPress
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const scale = (0, _reactNativeReanimated.useAnimatedStyle)(function DifficultySelectorTsx1Factory({
      _worklet_15412687755843_init_data,
      withSpring,
      isSelected
    }) {
      const DifficultySelectorTsx1 = () => ({
        transform: [{
          scale: withSpring(isSelected ? 1.05 : 1.0, {
            damping: 15,
            stiffness: 150
          })
        }]
      });
      DifficultySelectorTsx1.__closure = {
        withSpring,
        isSelected
      };
      DifficultySelectorTsx1.__workletHash = 15412687755843;
      DifficultySelectorTsx1.__initData = _worklet_15412687755843_init_data;
      return DifficultySelectorTsx1;
    }({
      _worklet_15412687755843_init_data,
      withSpring: _reactNativeReanimated.withSpring,
      isSelected
    }));
    const borderColor = isSelected ? option.color : theme.colors.semantic.liquidGlassBorder;
    const backgroundColor = isSelected ? `${option.color}18` : theme.colors.semantic.surfaceGlass;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      style: [{
        flex: 1
      }, scale],
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Pressable.default, {
        onPress: onPress,
        disabled: disabled,
        style: [{
          flex: 1,
          minHeight: 178,
          overflow: 'hidden',
          padding: theme.spacing[3],
          borderRadius: theme.borderRadius['2xl'],
          borderWidth: isSelected ? 2 : 1,
          borderColor,
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
          boxShadow: '0px 10px isSelected ? 18 : 10px theme.colors.semantic.shadow / isSelected ? 0.2 : 0.08'
        }],
        accessibilityLabel: `${option.name} difficulty: ${option.pauseLimit} pauses, ${option.xpMultiplier} XP. ${option.description}`,
        accessibilityRole: "button",
        accessibilityHint: `Selects ${option.name} difficulty`,
        accessibilityState: {
          selected: isSelected
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiLiquidGlassSessionGlyphs.SessionGlyph, {
          name: option.glyph,
          size: 48
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: theme.colors.text.primary,
          style: {
            fontWeight: '800',
            marginBottom: theme.spacing[1],
            marginTop: theme.spacing[2]
          },
          children: option.name
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            marginBottom: theme.spacing[2]
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: theme.colors.text.secondary,
            children: [option.pauseLimit, " pauses"]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: option.color,
            style: {
              fontWeight: '600'
            },
            children: [option.xpMultiplier, " XP"]
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: theme.colors.text.tertiary,
          style: {
            lineHeight: 17
          },
          children: option.description
        })]
      })
    });
  }
},3401,[12,80,1286,226,1463,1489,1683,1849,833,3393,3402,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "DIFFICULTY_OPTIONS", {
    enumerable: true,
    get: function () {
      return DIFFICULTY_OPTIONS;
    }
  });
  var _themeTokensColors = require(_dependencyMap[0]);
  const DIFFICULTY_OPTIONS = [{
    id: 'CASUAL',
    glyph: 'casual',
    name: 'Casual',
    pauseLimit: 'Unlimited',
    xpMultiplier: '50%',
    description: 'Good for maintenance',
    color: _themeTokensColors.lightColors.semantic.primary
  }, {
    id: 'FOCUSED',
    glyph: 'focused',
    name: 'Focused',
    pauseLimit: '2 max',
    xpMultiplier: '100%',
    description: 'Standard mode',
    color: _themeTokensColors.lightColors.semantic.secondary
  }, {
    id: 'DEEP_WORK',
    glyph: 'deep',
    name: 'Deep Work',
    pauseLimit: '0 pauses',
    xpMultiplier: '150%',
    description: 'Maximum impact',
    color: _themeTokensColors.lightColors.semantic.accent
  }];
},3402,[1465]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SessionSetupFooter = SessionSetupFooter;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesButton = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _sessionModes = require(_dependencyMap[4]);
  var _themeThemeContext = require(_dependencyMap[5]);
  var _themeTokensElevation = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function SessionSetupFooter({
    breakDurationSeconds,
    durationMinutes,
    intervalCount,
    isStarting,
    onStart,
    selectedSessionMode,
    selectedThemeLabel
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      px: "lg",
      py: "md",
      pb: "xl",
      bg: "background.primary",
      style: [{
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light
      }, _themeTokensElevation.glassEdge],
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
        variant: "caption",
        color: "text.secondary",
        textAlign: "center",
        mb: "sm",
        children: [`${durationMinutes} min focus`, breakDurationSeconds > 0 ? ` · ${Math.round(breakDurationSeconds / 60)} min break` : '', intervalCount > 1 ? ` · ${intervalCount} intervals` : '', selectedSessionMode === _sessionModes.SessionMode.SPRINT ? ' · Sprint chain active' : '', selectedThemeLabel ? ` · ${selectedThemeLabel}` : '']
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
        variant: "primary",
        size: "lg",
        onPress: onStart,
        isLoading: isStarting,
        fullWidth: true,
        accessibilityLabel: `Start ${durationMinutes} minute session`,
        accessibilityRole: "button",
        accessibilityHint: "Starts this customized focus session",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          children: "Start Session"
        })
      })]
    });
  }
},3403,[12,1462,1680,1489,1829,1463,2698,203]);
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
  exports.SessionSetupHeader = SessionSetupHeader;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsUiSkeleton = require(_dependencyMap[4]);
  var _featuresPersonalBestsHooks = require(_dependencyMap[5]);
  var _componentsPrimitivesText = require(_dependencyMap[6]);
  var _iconsComponentsIcon = require(_dependencyMap[7]);
  var _themeThemeContext = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  function SessionSetupHeader({
    durationSeconds,
    mode,
    onBack,
    userId
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const preview = (0, _featuresPersonalBestsHooks.usePersonalBestPreview)(userId, mode, durationSeconds);
    const previewCopy = preview.data ? `Your best: ${Math.round(preview.data.bestPurityScore)} purity · ${preview.data.bestGrade}` : 'First time at this length. Focus clean.';
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        p: "lg",
        pb: "xl",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          onPress: onBack,
          accessibilityLabel: "Go back",
          accessibilityRole: "button",
          accessibilityHint: "Returns to the previous screen without starting a session",
          hitSlop: theme.spacing[2],
          style: {
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 44,
            minWidth: 44
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
            name: "arrow-left",
            size: "lg",
            color: theme.colors.text.primary
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          children: "New Session"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          width: 40
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        entering: _reactNativeReanimated.FadeInUp.delay(100),
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          p: "lg",
          pt: "sm",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "h2",
            color: "primary.500",
            mb: "sm",
            children: "Start fast, customize only if needed"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "body",
            color: "text.secondary",
            children: "The default path is one tap. Open customization only when you want to tune the session."
          }), preview.isPending ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            mt: "md",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
              width: "56%",
              height: 14,
              borderRadius: theme.borderRadius.sm
            })
          }) : preview.isError ? null : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.tertiary",
            mt: "md",
            children: previewCopy
          })]
        })
      })]
    });
  }
},3404,[12,1286,226,1462,1676,3405,1489,1691,1463,203]);
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
  Object.defineProperty(exports, "personalBestKeys", {
    enumerable: true,
    get: function () {
      return personalBestKeys;
    }
  });
  exports.usePersonalBestPreview = usePersonalBestPreview;
  exports.usePersonalBests = usePersonalBests;
  var _tanstackReactQuery = require(_dependencyMap[0]);
  var _service = require(_dependencyMap[1]);
  var service = _interopNamespace(_service);
  const personalBestKeys = {
    all: ['personal-bests'],
    preview: (userId, mode, durationSeconds) => [...personalBestKeys.all, 'preview', userId, mode, durationSeconds],
    profile: userId => [...personalBestKeys.all, 'profile', userId]
  };
  function usePersonalBestPreview(userId, mode, durationSeconds) {
    const {
      refetch,
      data,
      isPending,
      isError,
      error
    } = (0, _tanstackReactQuery.useQuery)({
      queryKey: personalBestKeys.preview(userId ?? 'none', mode, durationSeconds),
      queryFn: () => userId ? service.getBestPreview(userId, mode, durationSeconds) : null,
      enabled: Boolean(userId && durationSeconds > 0)
    });
    const refresh = refetch;
    return {
      data: data ?? null,
      isPending: isPending,
      isError: isError,
      error: error instanceof Error ? error : null,
      refetch: () => {
        refresh();
      }
    };
  }
  function usePersonalBests(userId) {
    const {
      refetch,
      data,
      isPending,
      isError,
      error
    } = (0, _tanstackReactQuery.useQuery)({
      queryKey: personalBestKeys.profile(userId ?? 'none'),
      queryFn: () => userId ? service.getUserPersonalBests(userId) : [],
      enabled: Boolean(userId)
    });
    const refresh = refetch;
    return {
      data: data ?? [],
      isPending: isPending,
      isError: isError,
      error: error instanceof Error ? error : null,
      refetch: () => {
        refresh();
      }
    };
  }
},3405,[771,3406]);
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
  exports.getDurationBucket = getDurationBucket;
  exports.checkAndUpdatePersonalBest = checkAndUpdatePersonalBest;
  exports.getBestPreview = getBestPreview;
  exports.getUserPersonalBests = getUserPersonalBests;
  var _zod = require(_dependencyMap[0]);
  var _sessionModes = require(_dependencyMap[1]);
  var _sessionCompletionSchemas = require(_dependencyMap[2]);
  var _schemas = require(_dependencyMap[3]);
  var _repository = require(_dependencyMap[4]);
  var repository = _interopNamespace(_repository);
  const UserIdSchema = _zod.z.string().uuid();
  const DurationSecondsSchema = _zod.z.number().int().min(0);
  const PurityScoreSchema = _zod.z.number().min(0).max(100);
  function getDurationBucket(durationSeconds) {
    const seconds = DurationSecondsSchema.parse(durationSeconds);
    if (seconds < 750) {
      return '10';
    }
    if (seconds < 1200) {
      return '15';
    }
    if (seconds < 2100) {
      return '25';
    }
    if (seconds < 3300) {
      return '45';
    }
    return '60+';
  }
  async function checkAndUpdatePersonalBest(userId, mode, durationSeconds, purityScore, grade) {
    const parsedUserId = UserIdSchema.parse(userId);
    const parsedMode = _sessionModes.SessionModeSchema.parse(mode);
    const bucket = getDurationBucket(durationSeconds);
    const parsedPurity = PurityScoreSchema.parse(purityScore);
    const parsedGrade = _sessionCompletionSchemas.SessionCompletionGradeSchema.parse(grade);
    const current = await repository.getPersonalBest(parsedUserId, parsedMode, bucket);
    if (current && parsedPurity <= current.bestPurityScore) {
      return _schemas.PersonalBestComparisonSchema.parse({
        current,
        isNewRecord: false,
        previousBest: current.bestPurityScore,
        margin: null
      });
    }
    const updated = await repository.upsertPersonalBest({
      userId: parsedUserId,
      sessionMode: parsedMode,
      durationBucket: bucket,
      bestPurityScore: parsedPurity,
      bestGrade: parsedGrade
    });
    return _schemas.PersonalBestComparisonSchema.parse({
      current: updated,
      isNewRecord: true,
      previousBest: current?.bestPurityScore ?? null,
      margin: current ? parsedPurity - current.bestPurityScore : null
    });
  }
  async function getBestPreview(userId, mode, durationSeconds) {
    return repository.getPersonalBest(UserIdSchema.parse(userId), _sessionModes.SessionModeSchema.parse(mode), getDurationBucket(durationSeconds));
  }
  async function getUserPersonalBests(userId) {
    return repository.getUserPersonalBests(UserIdSchema.parse(userId));
  }
},3406,[1774,1829,1926,3407,3408]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "DurationBucketSchema", {
    enumerable: true,
    get: function () {
      return DurationBucketSchema;
    }
  });
  Object.defineProperty(exports, "PersonalBestKeySchema", {
    enumerable: true,
    get: function () {
      return PersonalBestKeySchema;
    }
  });
  Object.defineProperty(exports, "PersonalBestSchema", {
    enumerable: true,
    get: function () {
      return PersonalBestSchema;
    }
  });
  Object.defineProperty(exports, "PersonalBestComparisonSchema", {
    enumerable: true,
    get: function () {
      return PersonalBestComparisonSchema;
    }
  });
  Object.defineProperty(exports, "PersonalBestCandidateSchema", {
    enumerable: true,
    get: function () {
      return PersonalBestCandidateSchema;
    }
  });
  Object.defineProperty(exports, "PersonalBestRowSchema", {
    enumerable: true,
    get: function () {
      return PersonalBestRowSchema;
    }
  });
  var _zod = require(_dependencyMap[0]);
  var _sessionModes = require(_dependencyMap[1]);
  var _sessionCompletionSchemas = require(_dependencyMap[2]);
  const DurationBucketSchema = _zod.z.enum(['10', '15', '25', '45', '60+']);
  const PersonalBestKeySchema = _zod.z.object({
    userId: _zod.z.string().uuid(),
    sessionMode: _sessionModes.SessionModeSchema,
    durationBucket: DurationBucketSchema
  }).strict();
  const PersonalBestSchema = PersonalBestKeySchema.extend({
    id: _zod.z.string().uuid(),
    bestPurityScore: _zod.z.number().min(0).max(100),
    bestGrade: _sessionCompletionSchemas.SessionCompletionGradeSchema,
    totalSessions: _zod.z.number().int().min(1),
    achievedAt: _zod.z.string().datetime(),
    updatedAt: _zod.z.string().datetime()
  }).strict();
  const PersonalBestComparisonSchema = _zod.z.object({
    current: PersonalBestSchema.nullable(),
    isNewRecord: _zod.z.boolean(),
    previousBest: _zod.z.number().min(0).max(100).nullable(),
    margin: _zod.z.number().nullable()
  }).strict();
  const PersonalBestCandidateSchema = PersonalBestKeySchema.extend({
    bestPurityScore: _zod.z.number().min(0).max(100),
    bestGrade: _sessionCompletionSchemas.SessionCompletionGradeSchema
  }).strict();
  const PersonalBestRowSchema = _zod.z.object({
    id: _zod.z.string().uuid(),
    user_id: _zod.z.string().uuid(),
    session_mode: _sessionModes.SessionModeSchema,
    duration_bucket: DurationBucketSchema,
    best_purity_score: _zod.z.coerce.number().min(0).max(100),
    best_grade: _sessionCompletionSchemas.SessionCompletionGradeSchema,
    total_sessions: _zod.z.number().int().min(1),
    achieved_at: _zod.z.string().datetime(),
    updated_at: _zod.z.string().datetime()
  }).strict();
},3407,[1774,1829,1926]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "PersonalBestsRepositoryError", {
    enumerable: true,
    get: function () {
      return PersonalBestsRepositoryError;
    }
  });
  exports.getPersonalBest = getPersonalBest;
  exports.upsertPersonalBest = upsertPersonalBest;
  exports.getUserPersonalBests = getUserPersonalBests;
  var _zod = require(_dependencyMap[0]);
  var _configSupabase = require(_dependencyMap[1]);
  var _schemas = require(_dependencyMap[2]);
  class PersonalBestsRepositoryError extends Error {
    constructor(operation, cause) {
      super(`PersonalBestsRepository ${operation} failed`);
      this.cause = cause;
      this.name = 'PersonalBestsRepositoryError';
    }
  }
  function mapRow(row) {
    const parsed = _schemas.PersonalBestRowSchema.parse(row);
    return {
      id: parsed.id,
      userId: parsed.user_id,
      sessionMode: parsed.session_mode,
      durationBucket: parsed.duration_bucket,
      bestPurityScore: parsed.best_purity_score,
      bestGrade: parsed.best_grade,
      totalSessions: parsed.total_sessions,
      achievedAt: parsed.achieved_at,
      updatedAt: parsed.updated_at
    };
  }
  async function getPersonalBest(userId, sessionMode, durationBucket) {
    try {
      const {
        data,
        error
      } = await (0, _configSupabase.getSupabaseClient)().from('personal_bests').select('id,user_id,session_mode,duration_bucket,best_purity_score,best_grade,total_sessions,achieved_at,updated_at').eq('user_id', userId).eq('session_mode', sessionMode).eq('duration_bucket', durationBucket).maybeSingle();
      if (error) {
        throw new PersonalBestsRepositoryError('getPersonalBest', error);
      }
      return data ? mapRow(data) : null;
    } catch (error) {
      if (error instanceof PersonalBestsRepositoryError) {
        throw error;
      }
      throw new PersonalBestsRepositoryError('getPersonalBest', error);
    }
  }
  async function upsertPersonalBest(candidate) {
    try {
      const parsed = _schemas.PersonalBestCandidateSchema.parse(candidate);
      const current = await getPersonalBest(parsed.userId, parsed.sessionMode, parsed.durationBucket);
      if (current && parsed.bestPurityScore <= current.bestPurityScore) {
        return current;
      }
      const now = new Date().toISOString();
      if (!current) {
        const row = toInsert(parsed, now);
        const {
          data,
          error
        } = await (0, _configSupabase.getSupabaseClient)().from('personal_bests').insert(row).select('id,user_id,session_mode,duration_bucket,best_purity_score,best_grade,total_sessions,achieved_at,updated_at').single();
        if (error) {
          throw new PersonalBestsRepositoryError('upsertPersonalBest', error);
        }
        return mapRow(data);
      }
      const patch = {
        achieved_at: now,
        best_grade: parsed.bestGrade,
        best_purity_score: parsed.bestPurityScore,
        total_sessions: current.totalSessions + 1,
        updated_at: now
      };
      const {
        data,
        error
      } = await (0, _configSupabase.getSupabaseClient)().from('personal_bests').update(patch).eq('id', current.id).select('id,user_id,session_mode,duration_bucket,best_purity_score,best_grade,total_sessions,achieved_at,updated_at').single();
      if (error) {
        throw new PersonalBestsRepositoryError('upsertPersonalBest', error);
      }
      return mapRow(data);
    } catch (error) {
      if (error instanceof PersonalBestsRepositoryError) {
        throw error;
      }
      throw new PersonalBestsRepositoryError('upsertPersonalBest', error);
    }
  }
  async function getUserPersonalBests(userId) {
    try {
      const {
        data,
        error
      } = await (0, _configSupabase.getSupabaseClient)().from('personal_bests').select('id,user_id,session_mode,duration_bucket,best_purity_score,best_grade,total_sessions,achieved_at,updated_at').eq('user_id', userId).order('updated_at', {
        ascending: false
      });
      if (error) {
        throw new PersonalBestsRepositoryError('getUserPersonalBests', error);
      }
      return _zod.z.array(_schemas.PersonalBestRowSchema).parse(data ?? []).map(mapRow);
    } catch (error) {
      if (error instanceof PersonalBestsRepositoryError) {
        throw error;
      }
      throw new PersonalBestsRepositoryError('getUserPersonalBests', error);
    }
  }
  function toInsert(candidate, now) {
    return {
      achieved_at: now,
      best_grade: candidate.bestGrade,
      best_purity_score: candidate.bestPurityScore,
      duration_bucket: candidate.durationBucket,
      session_mode: candidate.sessionMode,
      total_sessions: 1,
      updated_at: now,
      user_id: candidate.userId
    };
  }
},3408,[1774,1726,3407]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SessionSetupStakesCard = SessionSetupStakesCard;
  require(_dependencyMap[0]);
  var _reactNavigationNative = require(_dependencyMap[1]);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _featuresSessionStartComponentsSessionStakesBriefing = require(_dependencyMap[3]);
  var _featuresLiveopsConfig = require(_dependencyMap[4]);
  var _featuresLiveopsConfigFeatureFlagService = require(_dependencyMap[5]);
  var _navigationNavigationHelpers = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function SessionSetupStakesCard({
    stakes
  }) {
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const disclosure = (0, _featuresLiveopsConfig.useFeatureAccess)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      px: "lg",
      mt: "md",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionStartComponentsSessionStakesBriefing.SessionStakesBriefing, {
        bossStake: stakes.bossStake,
        streakStake: stakes.streakStake,
        challengeStake: stakes.challengeStake,
        rivalStake: stakes.rivalStake,
        onStakePress: stakeId => {
          if (stakeId === 'boss' && (0, _featuresLiveopsConfigFeatureFlagService.isFeatureAvailableForNavigation)((0, _featuresLiveopsConfigFeatureFlagService.getFeatureAvailability)(disclosure.features.boss_tab))) {
            (0, _navigationNavigationHelpers.navigateToMainStackScreen)(navigation, 'Boss');
          }
          if (stakeId === 'streak') {
            (0, _navigationNavigationHelpers.navigateToRootScreen)(navigation, 'Main', {
              screen: 'Progress'
            });
          }
          if (stakeId === 'challenge' && (0, _featuresLiveopsConfigFeatureFlagService.isFeatureAvailableForNavigation)((0, _featuresLiveopsConfigFeatureFlagService.getFeatureAvailability)(disclosure.features.challenges))) {
            (0, _navigationNavigationHelpers.navigateToMainStackScreen)(navigation, 'Challenges');
          }
          if (stakeId === 'rival') {
            (0, _navigationNavigationHelpers.navigateToRootScreen)(navigation, 'Main', {
              screen: 'Home'
            });
          }
        }
      })
    });
  }
},3409,[12,1359,1462,3410,1956,1963,2052,203]);
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
  exports.SessionStakesBriefing = SessionStakesBriefing;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _StakeCard = require(_dependencyMap[5]);
  var _EmptyStakesMessage = require(_dependencyMap[6]);
  var _buildStakes = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  function SessionStakesBriefing({
    bossStake,
    streakStake,
    challengeStake,
    rivalStake,
    squadWarStake,
    onStakePress
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const topStakes = (0, _buildStakes.buildStakes)({
      bossStake,
      streakStake,
      challengeStake,
      rivalStake,
      squadWarStake
    }, theme);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeInUp.duration(400).delay(200),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          gap: theme.spacing[2]
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[2]
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            fontSize: 16,
            children: "\uD83C\uDFAF"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "label",
            color: "text.tertiary",
            children: "WHAT'S AT STAKE"
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: {
            gap: theme.spacing[2]
          },
          children: topStakes.length > 0 ? topStakes.map(stake => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_StakeCard.StakeCard, {
            icon: stake.icon,
            title: stake.title,
            subtitle: stake.subtitle,
            urgency: stake.urgency,
            accentColor: stake.accentColor,
            onPress: onStakePress ? () => onStakePress(stake.id) : undefined
          }, stake.id)) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_EmptyStakesMessage.EmptyStakesMessage, {})
        })]
      })
    });
  }
},3410,[12,80,226,1489,1463,3411,3412,3413,203]);
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
  exports.StakeCard = StakeCard;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[2]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _sharedUiLiquidGlassSessionGlyphs = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  function StakeCard({
    icon,
    title,
    subtitle,
    urgency,
    accentColor,
    onPress
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const getUrgencyStyles = () => {
      switch (urgency) {
        case 'critical':
          return {
            borderColor: theme.colors.error[500],
            bgColor: `${theme.colors.error[500]}15`,
            iconBg: theme.colors.error[500]
          };
        case 'high':
          return {
            borderColor: theme.colors.warning[500],
            bgColor: `${theme.colors.warning[500]}10`,
            iconBg: theme.colors.warning[500]
          };
        case 'medium':
          return {
            borderColor: accentColor || theme.colors.primary[500],
            bgColor: `${accentColor || theme.colors.primary[500]}10`,
            iconBg: accentColor || theme.colors.primary[500]
          };
        default:
          return {
            borderColor: theme.colors.border.DEFAULT,
            bgColor: theme.colors.background.primary,
            iconBg: theme.colors.text.tertiary
          };
      }
    };
    const styles = getUrgencyStyles();
    const CardWrapper = onPress ? Pressable.default : View.default;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(CardWrapper, {
      onPress: onPress,
      accessibilityLabel: title,
      accessibilityRole: onPress ? 'button' : undefined,
      accessibilityHint: onPress ? `View details for ${title}` : undefined,
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing[3],
          padding: theme.spacing[3],
          backgroundColor: styles.bgColor,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: styles.borderColor
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: {
            width: 44,
            height: 44,
            borderRadius: theme.borderRadius['2xl'],
            backgroundColor: theme.colors.semantic.surfaceElevated,
            justifyContent: 'center',
            alignItems: 'center'
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiLiquidGlassSessionGlyphs.SessionGlyph, {
            name: icon,
            size: 36
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flex: 1
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "body",
            fontWeight: "600",
            color: "text.primary",
            children: title
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.secondary",
            children: subtitle
          })]
        })]
      })
    });
  }
},3411,[12,80,1286,1489,1463,3393,203]);
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
  exports.EmptyStakesMessage = EmptyStakesMessage;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _themeThemeContext = require(_dependencyMap[3]);
  var _sharedUiLiquidGlassSessionGlyphs = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function EmptyStakesMessage() {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing[4],
        gap: theme.spacing[3],
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.background.secondary,
        borderWidth: 1,
        borderColor: theme.colors.semantic.border
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiLiquidGlassSessionGlyphs.SessionGlyph, {
        name: "stake",
        size: 36
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          flex: 1
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          fontWeight: "500",
          color: "text.primary",
          children: "Every session builds your streak"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.secondary",
          children: "Start focusing and create momentum"
        })]
      })]
    });
  }
},3412,[12,80,1489,1463,3393,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.buildStakes = buildStakes;
  function buildStakes(input, theme) {
    const stakes = [];
    const {
      bossStake,
      streakStake,
      challengeStake,
      rivalStake,
      squadWarStake
    } = input;
    if (bossStake) {
      const isCritical = bossStake.healthPercent <= 15;
      stakes.push({
        id: 'boss',
        priority: isCritical ? 1 : 2,
        icon: 'stake',
        title: bossStake.isFinalStrike ? `Final strike: ${bossStake.bossName}` : `${bossStake.bossName} at ${bossStake.healthPercent.toFixed(0)}%`,
        subtitle: bossStake.wouldDefeat ? 'This session defeats the boss!' : `Est. damage: ~${bossStake.estimatedDamage} HP`,
        urgency: isCritical ? 'critical' : bossStake.healthPercent <= 50 ? 'high' : 'medium',
        accentColor: theme.colors.primary[500]
      });
    }
    if (streakStake) {
      const isCritical = streakStake.isAtRisk && streakStake.hoursUntilDeadline !== null && streakStake.hoursUntilDeadline <= 6;
      stakes.push({
        id: 'streak',
        priority: isCritical ? 1 : 3,
        icon: 'deep',
        title: streakStake.isAtRisk && streakStake.hoursUntilDeadline !== null ? `Streak at risk — ${streakStake.hoursUntilDeadline}h left` : `Day ${streakStake.currentDays} of your streak`,
        subtitle: streakStake.isAtRisk ? 'Complete this session to save it!' : `Session ${streakStake.sessionNumberInStreak} • ${streakStake.multiplier.toFixed(1)}× multiplier`,
        urgency: isCritical ? 'critical' : streakStake.isAtRisk ? 'high' : 'low',
        accentColor: theme.colors.warning[500]
      });
    }
    if (challengeStake) {
      stakes.push({
        id: 'challenge',
        priority: challengeStake.canComplete ? 2 : 4,
        icon: 'focused',
        title: `'${challengeStake.challengeName}'`,
        subtitle: challengeStake.canComplete ? `This session completes it! (${challengeStake.current}/${challengeStake.target})` : `Progress: ${challengeStake.current}/${challengeStake.target}`,
        urgency: challengeStake.canComplete ? 'high' : 'medium',
        accentColor: theme.colors.primary[500]
      });
    }
    if (rivalStake) {
      const isBehind = rivalStake.gapMinutes > 0;
      stakes.push({
        id: 'rival',
        priority: isBehind ? 3 : 5,
        icon: 'sprint',
        title: `${rivalStake.rivalName}`,
        subtitle: isBehind ? `${rivalStake.gapMinutes} min behind — catch up?` : `You're ${Math.abs(rivalStake.gapMinutes)} min ahead`,
        urgency: isBehind ? 'medium' : 'low',
        accentColor: theme.colors.error[500]
      });
    }
    if (squadWarStake) {
      const isUrgent = squadWarStake.hoursRemaining <= 12;
      stakes.push({
        id: 'squadwar',
        priority: isUrgent ? 3 : 5,
        icon: 'stake',
        title: `Squad War ends in ${squadWarStake.hoursRemaining}h`,
        subtitle: `Squad needs ${squadWarStake.squadMinutesNeeded} more min`,
        urgency: isUrgent ? 'high' : 'medium',
        accentColor: theme.colors.primary[500]
      });
    }
    return stakes.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }
},3413,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SessionSetupStudyPlanCard = SessionSetupStudyPlanCard;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _featuresContentStudyComponentsStudyPlanSuggestionCard = require(_dependencyMap[2]);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  function SessionSetupStudyPlanCard({
    copy,
    studyPlan,
    onSelect
  }) {
    if (!studyPlan) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      px: "lg",
      mt: "md",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresContentStudyComponentsStudyPlanSuggestionCard.StudyPlanSuggestionCard, {
        copy: copy,
        studyPlan: studyPlan,
        onSelect: onSelect
      })
    });
  }
},3414,[12,1462,2672,203]);
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
  exports.useSessionSetupStakes = useSessionSetupStakes;
  var _react = require(_dependencyMap[0]);
  var React = _interopDefault(_react);
  var _featuresBossHooks = require(_dependencyMap[1]);
  var _featuresChallengesHooksChallengeQueries = require(_dependencyMap[2]);
  var _featuresStreaksHooks = require(_dependencyMap[3]);
  var _featuresLiveopsConfigFeatureFlagService = require(_dependencyMap[4]);
  function useSessionSetupStakes({
    currentStreakDays,
    selectedDurationSeconds,
    userId
  }) {
    const economyEnabled = !(0, _featuresLiveopsConfigFeatureFlagService.isFeatureHidden)('boss_tab') && !(0, _featuresLiveopsConfigFeatureFlagService.isFeatureHidden)('challenges');
    const {
      data: activeBoss
    } = (0, _featuresBossHooks.useActiveBoss)(economyEnabled ? userId : '');
    const {
      data: activeChallenges
    } = (0, _featuresChallengesHooksChallengeQueries.useActiveChallenges)(economyEnabled ? userId : '');
    const {
      data: streakSummary
    } = (0, _featuresStreaksHooks.useStreakSummary)(userId);
    const bossStake = React.default.useMemo(() => {
      if (!activeBoss || activeBoss.status !== 'ACTIVE') {
        return null;
      }
      const healthPercent = activeBoss.healthRemaining / activeBoss.maxHealth * 100;
      return {
        bossName: activeBoss.bossName || 'The Procrastinator',
        estimatedDamage: Math.floor(selectedDurationSeconds / 60 * 0.8),
        healthPercent,
        isFinalStrike: healthPercent <= 15,
        wouldDefeat: healthPercent <= 15
      };
    }, [activeBoss, selectedDurationSeconds]);
    const streakStake = React.default.useMemo(() => {
      if (currentStreakDays === null || !streakSummary) {
        return null;
      }
      const hoursUntilDeadline = streakSummary.nextDeadline ? Math.max(0, Math.floor((streakSummary.nextDeadline - Date.now()) / 3600000)) : null;
      return {
        currentDays: currentStreakDays,
        hoursUntilDeadline,
        isAtRisk: streakSummary.isAtRisk ?? false,
        multiplier: 1 + currentStreakDays * 0.1,
        sessionNumberInStreak: 1
      };
    }, [currentStreakDays, streakSummary]);
    const challengeStake = React.default.useMemo(() => {
      const detail = activeChallenges?.[0];
      if (!detail) {
        return null;
      }
      const current = detail.userChallenge.currentValue || 0;
      const target = detail.challenge.targetValue || 1;
      return {
        canComplete: current >= target - 1,
        challengeName: detail.challenge.title,
        current,
        target
      };
    }, [activeChallenges]);
    const rivalStake = null;
    return {
      bossStake,
      challengeStake,
      rivalStake,
      streakStake
    };
  }
},3415,[12,2768,2524,2261,1963]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "ActiveSessionScreen", {
    enumerable: true,
    get: function () {
      return ActiveSessionScreen;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _sessionModes = require(_dependencyMap[1]);
  var _featuresFocusContractHooks = require(_dependencyMap[2]);
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[3]);
  var _componentsActiveSessionGuardStates = require(_dependencyMap[4]);
  var _hooksUseActiveSessionController = require(_dependencyMap[5]);
  var _hooksUseStudyQuizBreak = require(_dependencyMap[6]);
  var _hooksUseActiveSessionDisplay = require(_dependencyMap[7]);
  var _ActiveSessionContent = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  const SESSION_MODE_TO_LANE = {
    [_sessionModes.SessionMode.STUDY]: 'student',
    [_sessionModes.SessionMode.LIGHT_FOCUS]: 'game_like',
    [_sessionModes.SessionMode.DEEP_WORK]: 'deep_creative',
    [_sessionModes.SessionMode.CREATIVE]: 'minimal_normal'
  };
  const ActiveSessionScreen = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(function ActiveSessionScreen() {
    const controller = (0, _hooksUseActiveSessionController.useActiveSessionController)();
    const {
      actions,
      isDegradedSession,
      metrics,
      navigation,
      sessionQuery,
      showInterruption,
      streak,
      theme,
      themeBackgroundColor,
      userId
    } = controller;
    const {
      contract
    } = (0, _featuresFocusContractHooks.useContractForSession)(controller.sessionQuery.session?.id ?? null);
    const currentMode = (0, _sessionModes.resolveSessionMode)(sessionQuery.session?.config.sessionMode);
    const lane = (0, _react.useMemo)(() => SESSION_MODE_TO_LANE[currentMode] ?? 'minimal_normal', [currentMode]);
    const {
      displayPolicy,
      heroViewModel
    } = (0, _hooksUseActiveSessionDisplay.useActiveSessionDisplay)({
      dailyProgress: metrics.dailyProgress,
      elapsedSeconds: sessionQuery.elapsedSeconds,
      completionPercentage: sessionQuery.completionPercentage,
      momentumScores: metrics.momentumScores,
      perfectFocusActive: metrics.perfectFocusActive,
      phaseAccent: metrics.phaseAccent,
      phaseIcon: metrics.phaseInfo.icon,
      phaseLabel: metrics.phaseInfo.label,
      purityLabel: metrics.purityLabel,
      purityScore: metrics.purityScore,
      remainingSeconds: sessionQuery.remainingSeconds,
      streakMultiplier: metrics.streakMultiplier,
      todayFocusSeconds: metrics.todayFocusSeconds,
      isPaused: sessionQuery.isPaused,
      showInterruption,
      sessionConfigSessionMode: sessionQuery.session?.config.sessionMode
    });
    const outerStrokeDashoffset = 2 * Math.PI * (metrics.RADIUS + 16) * (1 - metrics.dailyProgress / 100);
    const plannedQuizBreakOptedIn = false;
    const focusStage = showInterruption ? 'interruption' : sessionQuery.isPaused ? 'paused' : 'active';
    const studyQuizBreak = (0, _hooksUseStudyQuizBreak.useStudyQuizBreak)({
      currentMode,
      plannedQuizBreakOptedIn,
      sessionQuery
    });
    const shouldShowGuardState = !userId || sessionQuery.isLoading || !controller.companion.isLoaded || Boolean(sessionQuery.error) || !sessionQuery.session || isDegradedSession;
    if (shouldShowGuardState) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsActiveSessionGuardStates.ActiveSessionGuardStates, {
        companionLoaded: controller.companion.isLoaded,
        error: sessionQuery.error,
        isDegradedSession: isDegradedSession,
        isLoading: sessionQuery.isLoading,
        session: sessionQuery.session,
        userId: userId,
        onBrowsePresets: () => navigation.goBack(),
        onContinueDegraded: () => actions.setDismissDegradedState(true),
        onCreateSession: () => navigation.navigate({
          name: 'SessionSetup',
          params: {}
        }),
        onEndSession: () => actions.setShowInterruption(true),
        onGoBack: () => navigation.goBack(),
        onRetry: sessionQuery.refresh
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_ActiveSessionContent.ActiveSessionContent, {
      controller: controller,
      contract: contract,
      currentMode: currentMode,
      lane: lane,
      displayPolicy: displayPolicy,
      heroViewModel: heroViewModel,
      outerStrokeDashoffset: outerStrokeDashoffset,
      focusStage: focusStage,
      studyQuizBreak: studyQuizBreak,
      plannedQuizBreakOptedIn: plannedQuizBreakOptedIn
    });
  }, 'Active Session');
},3416,[12,1829,3417,2166,3418,3426,3436,3437,3444,203]);
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
  Object.defineProperty(exports, "focusContractKeys", {
    enumerable: true,
    get: function () {
      return focusContractKeys;
    }
  });
  exports.useContractForSession = useContractForSession;
  exports.useCreateContract = useCreateContract;
  exports.useReflectOnContract = useReflectOnContract;
  exports.useContractCompletionRate = useContractCompletionRate;
  var _sentryReactNative = require(_dependencyMap[0]);
  var Sentry = _interopNamespace(_sentryReactNative);
  var _tanstackReactQuery = require(_dependencyMap[1]);
  var _store = require(_dependencyMap[2]);
  var _sharedUiComponentsToast = require(_dependencyMap[3]);
  var _service = require(_dependencyMap[4]);
  var service = _interopNamespace(_service);
  const focusContractKeys = {
    all: ['focus-contract'],
    session: sessionId => [...focusContractKeys.all, 'session', sessionId],
    rate: (userId, windowDays) => [...focusContractKeys.all, 'rate', userId, windowDays]
  };
  function useContractForSession(sessionId) {
    const userId = (0, _store.useAuthStore)(state => state.user?.id ?? null);
    const {
      refetch,
      data,
      isPending,
      isError,
      error
    } = (0, _tanstackReactQuery.useQuery)({
      queryKey: focusContractKeys.session(sessionId ?? 'none'),
      queryFn: () => {
        if (!sessionId || !userId) {
          return null;
        }
        return service.getContractForSession(sessionId, userId);
      },
      enabled: Boolean(sessionId && userId)
    });
    const refresh = refetch;
    return {
      contract: data ?? null,
      isPending: isPending,
      isError: isError,
      error: error instanceof Error ? error : null,
      refetch: () => {
        refresh();
      }
    };
  }
  function useCreateContract() {
    const queryClient = (0, _tanstackReactQuery.useQueryClient)();
    const userId = (0, _store.useAuthStore)(state => state.user?.id ?? null);
    const {
      show
    } = (0, _sharedUiComponentsToast.useToast)();
    return (0, _tanstackReactQuery.useMutation)({
      mutationFn: input => {
        if (!userId) {
          throw new Error('User is required to create a focus contract.');
        }
        return service.createContract(input, userId);
      },
      onSuccess: contract => {
        queryClient.setQueryData(focusContractKeys.session(contract.sessionId), contract);
        queryClient.invalidateQueries({
          queryKey: focusContractKeys.session(contract.sessionId)
        });
      },
      onError: error => {
        Sentry.captureException(error, {
          tags: {
            feature: 'focus-contract',
            operation: 'create'
          }
        });
        show({
          type: 'error',
          title: 'Contract saved locally failed',
          message: 'Your session can still start.'
        });
      }
    });
  }
  function useReflectOnContract() {
    const queryClient = (0, _tanstackReactQuery.useQueryClient)();
    const userId = (0, _store.useAuthStore)(state => state.user?.id ?? null);
    const {
      show
    } = (0, _sharedUiComponentsToast.useToast)();
    return (0, _tanstackReactQuery.useMutation)({
      mutationFn: ({
        contract,
        status
      }) => {
        if (!userId) {
          throw new Error('User is required to reflect on a focus contract.');
        }
        return service.reflectOnContract(contract.id, status, userId);
      },
      onMutate: async ({
        contract,
        status
      }) => {
        const key = focusContractKeys.session(contract.sessionId);
        await queryClient.cancelQueries({
          queryKey: key
        });
        const previous = queryClient.getQueryData(key) ?? null;
        queryClient.setQueryData(key, Object.assign({}, contract, {
          completionStatus: status,
          reflectionAt: new Date().toISOString()
        }));
        return {
          key,
          previous
        };
      },
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: focusContractKeys.session(variables.contract.sessionId)
        });
        if (userId) {
          queryClient.invalidateQueries({
            queryKey: ['focus-score', userId]
          });
        }
      },
      onError: (error, _variables, context) => {
        if (context?.previous) {
          queryClient.setQueryData(context.key, context.previous);
        }
        Sentry.captureException(error, {
          tags: {
            feature: 'focus-contract',
            operation: 'reflect'
          }
        });
        show({
          type: 'error',
          title: 'Reflection did not save',
          message: 'Retry when connection returns.'
        });
      }
    });
  }
  function useContractCompletionRate(userId, windowDays) {
    const {
      data,
      isPending,
      isError,
      error,
      refetch
    } = (0, _tanstackReactQuery.useQuery)({
      queryKey: focusContractKeys.rate(userId ?? 'none', windowDays),
      queryFn: () => userId ? service.getCompletionRate(userId, windowDays) : 0.5,
      enabled: Boolean(userId)
    });
    const refresh = refetch;
    return {
      rate: data ?? 0.5,
      isPending: isPending,
      isError: isError,
      error: error instanceof Error ? error : null,
      refetch: () => {
        refresh();
      }
    };
  }
},3417,[834,771,1705,2159,3300]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.ActiveSessionGuardStates = ActiveSessionGuardStates;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesButton = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _sessionComponentsStatesSessionDegradedState = require(_dependencyMap[4]);
  var _sessionComponentsStatesSessionEmptyState = require(_dependencyMap[5]);
  var _sessionComponentsStatesSessionErrorState = require(_dependencyMap[6]);
  var _sessionComponentsStatesSessionLoadingState = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  function ActiveSessionGuardStates({
    companionLoaded,
    error,
    isDegradedSession,
    isLoading,
    onBrowsePresets,
    onContinueDegraded,
    onCreateSession,
    onEndSession,
    onGoBack,
    onRetry,
    session,
    userId
  }) {
    if (!userId) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flex: 1,
        bg: "background.primary",
        justifyContent: "center",
        alignItems: "center",
        p: "lg",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: "error.DEFAULT",
          mb: "md",
          children: "Not authenticated"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "primary",
          onPress: onGoBack,
          accessibilityLabel: "Go back to the previous screen",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: "Go Back"
          })
        })]
      });
    }
    if (isLoading || !companionLoaded) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sessionComponentsStatesSessionLoadingState.SessionLoadingState, {
        message: "Loading focus session..."
      });
    }
    if (error) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sessionComponentsStatesSessionErrorState.SessionErrorState, {
        error: error,
        onRetry: onRetry,
        onGoBack: onGoBack
      });
    }
    if (!session) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sessionComponentsStatesSessionEmptyState.SessionEmptyState, {
        onCreateSession: onCreateSession,
        onBrowsePresets: onBrowsePresets
      });
    }
    if (!isDegradedSession) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sessionComponentsStatesSessionDegradedState.SessionDegradedState, {
      reason: "Realtime purity tracking or persistence is temporarily limited.",
      features: [{
        name: 'Core timer',
        available: true
      }, {
        name: 'Purity updates',
        available: true
      }, {
        name: 'Full persistence sync',
        available: session.storageStatus !== 'DEGRADED',
        reason: 'Storage is currently in degraded mode.'
      }, {
        name: 'Recovery safeguards',
        available: Boolean(session.canRecover),
        reason: session.canRecover ? undefined : 'Recovery is not currently available.'
      }],
      onRetryFullMode: onRetry,
      onContinueAnyway: onContinueDegraded,
      onEndSession: onEndSession
    });
  }
},3418,[12,1462,1680,1489,3419,3421,3422,3425,203]);
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
  Object.defineProperty(exports, "SessionDegradedState", {
    enumerable: true,
    get: function () {
      return SessionDegradedState;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsText = require(_dependencyMap[2]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[3]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _SessionDegradedStateStyles = require(_dependencyMap[4]);
  var _themeThemeContext = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  const SessionDegradedState = ({
    reason,
    features,
    onContinueAnyway,
    onRetryFullMode,
    onEndSession
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const semantic = theme.colors.semantic;
    const availableCount = features.filter(f => f.available).length;
    const totalCount = features.length;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: [_SessionDegradedStateStyles.styles.container, {
        backgroundColor: semantic.background
      }],
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: [_SessionDegradedStateStyles.styles.warningBanner, {
          backgroundColor: semantic.warning
        }],
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: [_SessionDegradedStateStyles.styles.warningIcon, {
            color: semantic.background
          }],
          children: "!"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: [_SessionDegradedStateStyles.styles.warningText, {
            color: semantic.background
          }],
          children: "Limited Mode"
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: [_SessionDegradedStateStyles.styles.title, {
          color: semantic.textPrimary
        }],
        children: "Session Degraded"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: [_SessionDegradedStateStyles.styles.reason, {
          color: semantic.textMuted
        }],
        children: reason
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: [_SessionDegradedStateStyles.styles.featuresContainer, {
          backgroundColor: semantic.surfaceElevated
        }],
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Text.default, {
          style: [_SessionDegradedStateStyles.styles.featuresTitle, {
            color: semantic.textMuted
          }],
          children: ["Features (", availableCount, "/", totalCount, " available):"]
        }), features.map((feature, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: [_SessionDegradedStateStyles.styles.featureRow, {
            borderBottomColor: semantic.border
          }],
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [_SessionDegradedStateStyles.styles.featureIcon, {
              color: feature.available ? semantic.success : semantic.danger
            }],
            children: feature.available ? '●' : '○'
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: _SessionDegradedStateStyles.styles.featureInfo,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: [_SessionDegradedStateStyles.styles.featureName, {
                color: semantic.textPrimary
              }, !feature.available && [_SessionDegradedStateStyles.styles.featureUnavailable, {
                color: semantic.textMuted
              }]],
              children: feature.name
            }), !feature.available && feature.reason && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: [_SessionDegradedStateStyles.styles.featureReason, {
                color: semantic.warning
              }],
              children: feature.reason
            })]
          })]
        }, feature.name))]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _SessionDegradedStateStyles.styles.actions,
        children: [onRetryFullMode && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          style: ({
            pressed
          }) => [_SessionDegradedStateStyles.styles.primaryButton, {
            backgroundColor: semantic.danger
          }, pressed && {
            opacity: 0.8
          }],
          onPress: onRetryFullMode,
          accessibilityLabel: "Retry full mode",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [_SessionDegradedStateStyles.styles.primaryButtonText, {
              color: semantic.textPrimary
            }],
            children: "Retry Full Mode"
          })
        }), onContinueAnyway && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          style: ({
            pressed
          }) => [_SessionDegradedStateStyles.styles.secondaryButton, {
            borderColor: semantic.borderStrong
          }, pressed && {
            opacity: 0.8
          }],
          onPress: onContinueAnyway,
          accessibilityLabel: "Continue in limited mode",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [_SessionDegradedStateStyles.styles.secondaryButtonText, {
              color: semantic.textSecondary
            }],
            children: "Continue in Limited Mode"
          })
        }), onEndSession && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          style: ({
            pressed
          }) => [_SessionDegradedStateStyles.styles.endButton, pressed && {
            opacity: 0.8
          }],
          onPress: onEndSession,
          accessibilityLabel: "End session",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [_SessionDegradedStateStyles.styles.endButtonText, {
              color: semantic.danger
            }],
            children: "End Session"
          })
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: [_SessionDegradedStateStyles.styles.explanation, {
          backgroundColor: `${semantic.warning}10`,
          borderColor: `${semantic.warning}30`
        }],
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: [_SessionDegradedStateStyles.styles.explanationTitle, {
            color: semantic.warning
          }],
          children: "What does this mean?"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: [_SessionDegradedStateStyles.styles.explanationText, {
            color: semantic.textMuted
          }],
          children: "Your session is still running, but some features are temporarily unavailable. Your progress is still being tracked and will sync once full service is restored."
        })]
      })]
    });
  };
},3419,[12,80,493,1286,3420,1463,203]);
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
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      flex: 1,
      padding: 24
    },
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 24
    },
    warningIcon: {
      fontSize: 20,
      marginRight: 8,
      fontWeight: '700'
    },
    warningText: {
      fontSize: 16,
      fontWeight: '700'
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 8
    },
    reason: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 24
    },
    featuresContainer: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 24
    },
    featuresTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 12,
      textTransform: 'uppercase'
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 8,
      borderBottomWidth: 1
    },
    featureIcon: {
      fontSize: 16,
      marginRight: 12,
      marginTop: 2,
      fontWeight: '700'
    },
    featureInfo: {
      flex: 1
    },
    featureName: {
      fontSize: 15
    },
    featureUnavailable: {
      textDecorationLine: 'line-through'
    },
    featureReason: {
      fontSize: 12,
      marginTop: 2
    },
    actions: {
      gap: 12,
      marginBottom: 24
    },
    primaryButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center'
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '600'
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center'
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600'
    },
    endButton: {
      paddingVertical: 12,
      alignItems: 'center'
    },
    endButtonText: {
      fontSize: 14
    },
    explanation: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 1
    },
    explanationTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8
    },
    explanationText: {
      fontSize: 13,
      lineHeight: 18
    }
  });
},3420,[1678]);
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
  Object.defineProperty(exports, "SessionEmptyState", {
    enumerable: true,
    get: function () {
      return SessionEmptyState;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsText = require(_dependencyMap[2]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[3]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _sharedUiCreateSheet = require(_dependencyMap[4]);
  var _themeThemeContext = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  /**
   * Session Empty State
   *
   * Displayed when no sessions exist yet.
   * Provides CTAs to create first session.
   */

  const SessionEmptyState = ({
    onCreateSession,
    onBrowsePresets
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const semantic = theme.colors.semantic;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: [styles.container, {
        backgroundColor: semantic.background
      }],
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: {
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: `${semantic.primary}18`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: {
            fontSize: 24,
            fontWeight: '800',
            color: semantic.primary
          },
          children: "V"
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: [styles.title, {
          color: semantic.textPrimary
        }],
        children: "Your First Session Awaits"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: [styles.description, {
          color: semantic.textMuted
        }],
        children: "The first session is the hardest. Everything after that is momentum. Build your rhythm, earn proof, return tomorrow."
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: styles.actions,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          style: ({
            pressed
          }) => [styles.primaryButton, {
            backgroundColor: semantic.primary
          }, pressed && {
            opacity: 0.8
          }],
          onPress: onCreateSession,
          accessibilityLabel: "Start first session",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [styles.primaryButtonText, {
              color: semantic.textPrimary
            }],
            children: "Start First Session"
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          style: ({
            pressed
          }) => [styles.secondaryButton, {
            backgroundColor: 'transparent',
            borderColor: semantic.borderStrong
          }, pressed && {
            opacity: 0.8
          }],
          onPress: onBrowsePresets,
          accessibilityLabel: "Browse presets",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [styles.secondaryButtonText, {
              color: semantic.textSecondary
            }],
            children: "Browse Presets"
          })
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: [styles.tipsContainer, {
          backgroundColor: semantic.surfaceElevated
        }],
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: [styles.tipsTitle, {
            color: semantic.textPrimary
          }],
          children: "Pro Tips"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: [styles.tip, {
            color: semantic.textMuted
          }],
          children: "\u2022 Start with 25-minute focused blocks"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: [styles.tip, {
            color: semantic.textMuted
          }],
          children: "\u2022 Keep your phone face-down during focus"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: [styles.tip, {
            color: semantic.textMuted
          }],
          children: "\u2022 Build a daily rhythm for compound returns"
        })]
      })]
    });
  };
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 12
    },
    description: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 22
    },
    actions: {
      width: '100%',
      gap: 12,
      marginBottom: 40
    },
    primaryButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center'
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '600'
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center'
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600'
    },
    tipsContainer: {
      borderRadius: 12,
      padding: 20,
      width: '100%'
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12
    },
    tip: {
      fontSize: 14,
      marginBottom: 8,
      lineHeight: 20
    }
  });
},3421,[12,80,493,1286,1678,1463,203]);
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
  Object.defineProperty(exports, "SessionErrorState", {
    enumerable: true,
    get: function () {
      return SessionErrorState;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsText = require(_dependencyMap[2]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _themeThemeContext = require(_dependencyMap[3]);
  var _utilsErrorSanitizer = require(_dependencyMap[4]);
  var _SessionErrorActions = require(_dependencyMap[5]);
  var _SessionErrorStateStyles = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  /**
   * Session Error State
   *
   * Displays when a session encounters an unexpected error.
   */

  function getErrorMessage(err) {
    const message = err.message.toLowerCase();
    if (message.includes('network')) {
      return 'VEX lost connection. Your session is saved. Try again?';
    }
    if (message.includes('timeout')) {
      return "Couldn't start your session. The servers are taking longer than expected.";
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'Session expired. Log back in and your progress is safe.';
    }
    if (message.includes('not found')) {
      return 'Session not found. It may have ended or been cleared.';
    }
    if (message.includes('sync') || message.includes('conflict')) {
      return 'Session sync failed. Your focus data is safe, but we need to resolve a conflict.';
    }
    return (0, _utilsErrorSanitizer.sanitizeErrorMessage)(err);
  }
  const SessionErrorState = ({
    error,
    onRetry,
    onGoBack,
    onContactSupport
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const semantic = theme.colors.semantic;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: [_SessionErrorStateStyles.styles.container, {
        backgroundColor: semantic.background
      }],
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: {
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: `${semantic.danger}18`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: {
            fontSize: 28,
            fontWeight: '700',
            color: semantic.danger
          },
          children: "\xD7"
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: [_SessionErrorStateStyles.styles.title, {
          color: semantic.danger
        }],
        children: "Something went wrong"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: [_SessionErrorStateStyles.styles.message, {
          color: semantic.textPrimary
        }],
        children: getErrorMessage(error)
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: [_SessionErrorStateStyles.styles.errorDetails, {
          backgroundColor: semantic.surfaceElevated
        }],
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Text.default, {
          style: [_SessionErrorStateStyles.styles.errorCode, {
            color: semantic.danger
          }],
          children: ["Error: ", error.name]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: [_SessionErrorStateStyles.styles.errorHint, {
            color: semantic.textMuted
          }],
          children: (0, _utilsErrorSanitizer.sanitizeErrorMessage)(error)
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionErrorActions.SessionErrorActions, {
        onRetry: onRetry,
        onGoBack: onGoBack,
        onContactSupport: onContactSupport
      })]
    });
  };
},3422,[12,80,493,1463,3058,3423,3424,203]);
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
  Object.defineProperty(exports, "SessionErrorActions", {
    enumerable: true,
    get: function () {
      return SessionErrorActions;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsText = require(_dependencyMap[2]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[3]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _SessionErrorStateStyles = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  const SessionErrorActions = ({
    onRetry,
    onGoBack,
    onContactSupport
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const semantic = theme.colors.semantic;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _SessionErrorStateStyles.styles.actions,
        children: [onRetry && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          style: ({
            pressed
          }) => [_SessionErrorStateStyles.styles.primaryButton, {
            backgroundColor: semantic.danger
          }, pressed && {
            opacity: 0.8
          }],
          onPress: onRetry,
          accessibilityLabel: "Try again",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [_SessionErrorStateStyles.styles.primaryButtonText, {
              color: semantic.textPrimary
            }],
            children: "Try Again"
          })
        }), onGoBack && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          style: ({
            pressed
          }) => [_SessionErrorStateStyles.styles.secondaryButton, {
            borderColor: semantic.borderStrong
          }, pressed && {
            opacity: 0.8
          }],
          onPress: onGoBack,
          accessibilityLabel: "Go back",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [_SessionErrorStateStyles.styles.secondaryButtonText, {
              color: semantic.textSecondary
            }],
            children: "Go Back"
          })
        }), onContactSupport && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          style: ({
            pressed
          }) => [_SessionErrorStateStyles.styles.supportButton, pressed && {
            opacity: 0.8
          }],
          onPress: onContactSupport,
          accessibilityLabel: "Contact support",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [_SessionErrorStateStyles.styles.supportButtonText, {
              color: semantic.textMuted
            }],
            children: "Contact Support"
          })
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: [_SessionErrorStateStyles.styles.recoveryInfo, {
          backgroundColor: `${semantic.success}10`,
          borderColor: `${semantic.success}20`
        }],
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: [_SessionErrorStateStyles.styles.recoveryTitle, {
            color: semantic.success
          }],
          children: "Your Progress is Safe"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
          style: [_SessionErrorStateStyles.styles.recoveryText, {
            color: semantic.textMuted
          }],
          children: "Your session data is protected. Any focus time will be restored once service is back."
        })]
      })]
    });
  };
},3423,[12,80,493,1286,1463,3424,203]);
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
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 12
    },
    message: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 22
    },
    errorDetails: {
      borderRadius: 8,
      padding: 12,
      marginBottom: 24,
      width: '100%'
    },
    errorCode: {
      fontSize: 12,
      fontWeight: '600'
    },
    errorHint: {
      fontSize: 12,
      marginTop: 4
    },
    actions: {
      width: '100%',
      gap: 12,
      marginBottom: 32
    },
    primaryButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center'
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '600'
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center'
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600'
    },
    supportButton: {
      paddingVertical: 12,
      alignItems: 'center'
    },
    supportButtonText: {
      fontSize: 14
    },
    recoveryInfo: {
      borderRadius: 12,
      padding: 16,
      width: '100%',
      borderWidth: 1
    },
    recoveryTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4
    },
    recoveryText: {
      fontSize: 13,
      lineHeight: 18
    }
  });
},3424,[1678]);
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
  Object.defineProperty(exports, "SessionLoadingState", {
    enumerable: true,
    get: function () {
      return SessionLoadingState;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsText = require(_dependencyMap[2]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _componentsUiSkeleton = require(_dependencyMap[3]);
  var _sharedUiCreateSheet = require(_dependencyMap[4]);
  var _themeThemeContext = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  /**
   * Session Loading State
   *
   * Skeleton/loading screen for session operations.
   */

  const SessionLoadingState = ({
    message = 'Loading session...'
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const semantic = theme.colors.semantic;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: [styles.container, {
        backgroundColor: semantic.background
      }],
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
        width: 40,
        height: 40,
        variant: "circular"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
        style: [styles.message, {
          color: semantic.textMuted
        }],
        children: message
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: styles.skeletonContainer,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: [styles.skeletonTimer, {
            backgroundColor: semantic.surfaceElevated
          }]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: styles.skeletonStats,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: [styles.skeletonStat, {
              backgroundColor: semantic.surfaceElevated
            }]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: [styles.skeletonStat, {
              backgroundColor: semantic.surfaceElevated
            }]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: [styles.skeletonStat, {
              backgroundColor: semantic.surfaceElevated
            }]
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: [styles.skeletonButton, {
            backgroundColor: semantic.surfaceElevated
          }]
        })]
      })]
    });
  };
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24
    },
    message: {
      marginTop: 16,
      fontSize: 16
    },
    skeletonContainer: {
      width: '100%',
      marginTop: 40,
      gap: 16
    },
    skeletonTimer: {
      width: '60%',
      height: 60,
      borderRadius: 8,
      alignSelf: 'center'
    },
    skeletonStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 16
    },
    skeletonStat: {
      width: '25%',
      height: 50,
      borderRadius: 8
    },
    skeletonButton: {
      width: '50%',
      height: 48,
      borderRadius: 12,
      alignSelf: 'center',
      marginTop: 16
    }
  });
},3425,[12,80,493,1676,1678,1463,203]);
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
  exports.useActiveSessionController = useActiveSessionController;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsAppState = require(_dependencyMap[1]);
  var AppState = _interopDefault(_reactNativeWebDistExportsAppState);
  var _reactNativeWebDistExportsBackHandler = require(_dependencyMap[2]);
  var BackHandler = _interopDefault(_reactNativeWebDistExportsBackHandler);
  var _sentryReactNative = require(_dependencyMap[3]);
  var Sentry = _interopNamespace(_sentryReactNative);
  var _reactNavigationNative = require(_dependencyMap[4]);
  var _featuresProgressionHooks = require(_dependencyMap[5]);
  var _featuresStreaksHooks = require(_dependencyMap[6]);
  var _featuresThemesSessionThemes = require(_dependencyMap[7]);
  var _sessionHooksUseSession = require(_dependencyMap[8]);
  var _sessionModes = require(_dependencyMap[9]);
  var _store = require(_dependencyMap[10]);
  var _themeThemeContext = require(_dependencyMap[11]);
  var _useActiveSessionMetrics = require(_dependencyMap[12]);
  var _useCompanionSession = require(_dependencyMap[13]);
  var _useActiveSessionHandlers = require(_dependencyMap[14]);
  function useActiveSessionController() {
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const route = (0, _reactNavigationNative.useRoute)();
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      user
    } = (0, _store.useAuthStore)();
    const {
      sessionId,
      selectedThemeId
    } = route.params;
    const userId = user?.id ?? '';
    const [dismissDegradedState, setDismissDegradedState] = (0, _react.useState)(false);
    const [showInterruption, setShowInterruption] = (0, _react.useState)(false);
    const [isExiting, setIsExiting] = (0, _react.useState)(false);
    const [showMultiplierInfo, setShowMultiplierInfo] = (0, _react.useState)(false);
    const [creativeMood, setCreativeMood] = (0, _react.useState)(null);
    const [controlFailure, setControlFailure] = (0, _react.useState)(null);
    const sessionTheme = (0, _react.useMemo)(() => (0, _featuresThemesSessionThemes.getSessionThemeById)(selectedThemeId), [selectedThemeId]);
    const {
      data: progressionSummary
    } = (0, _featuresProgressionHooks.useProgressionSummary)(userId || null);
    const {
      data: streak
    } = (0, _featuresStreaksHooks.useStreak)(userId || null);
    const {
      history
    } = (0, _sessionHooksUseSession.useSessionHistory)(userId || '', 100);
    const sessionQuery = (0, _sessionHooksUseSession.useSession)(userId || '');
    const totalSeconds = Math.max(sessionQuery.session?.config.duration ?? sessionQuery.elapsedSeconds + sessionQuery.remainingSeconds, 1);
    const currentMode = (0, _sessionModes.resolveSessionMode)(sessionQuery.session?.config.sessionMode);
    const companion = (0, _useCompanionSession.useCompanionSession)({
      currentMode,
      elapsedSeconds: sessionQuery.elapsedSeconds,
      isPaused: sessionQuery.isPaused,
      purityScore: sessionQuery.getAntiCheatScore(),
      sessionId,
      totalSeconds,
      userId
    });
    const isDegradedSession = (sessionQuery.session?.status === 'DEGRADED' || sessionQuery.session?.storageStatus === 'DEGRADED') && !dismissDegradedState;
    const metrics = (0, _useActiveSessionMetrics.useActiveSessionMetrics)({
      completionPercentage: sessionQuery.completionPercentage,
      elapsedSeconds: sessionQuery.elapsedSeconds,
      getAntiCheatLabel: sessionQuery.getAntiCheatLabel,
      getAntiCheatScore: sessionQuery.getAntiCheatScore,
      history,
      isActive: sessionQuery.isActive,
      isPaused: sessionQuery.isPaused,
      phase: sessionQuery.session?.phase,
      sessionId: sessionQuery.session?.id,
      sessionTheme,
      streakDays: streak?.currentDays ?? 0
    });
    (0, _react.useEffect)(() => {
      const backHandler = BackHandler.default.addEventListener('hardwareBackPress', () => {
        if (isExiting) {
          return false;
        }
        setShowInterruption(true);
        return true;
      });
      return () => backHandler.remove();
    }, [isExiting]);
    (0, _react.useEffect)(() => {
      const subscription = AppState.default.addEventListener('change', nextState => {
        if (!sessionQuery.session?.id || !sessionQuery.isActive) {
          return;
        }
        const action = nextState === 'background' || nextState === 'inactive' ? sessionQuery.backgroundSession : nextState === 'active' ? sessionQuery.foregroundSession : null;
        action?.().catch(caught => {
          Sentry.captureException(caught, {
            tags: {
              feature: nextState === 'active' ? 'session-foreground' : 'session-background'
            }
          });
        });
      });
      return () => subscription.remove();
    }, [sessionQuery]);
    (0, _react.useEffect)(() => {
      let cancelled = false;
      return () => {
        if (!sessionQuery.session?.id || !sessionQuery.isActive) {
          return;
        }
        sessionQuery.backgroundSession().catch(caught => {
          if (cancelled) {
            return;
          }
          Sentry.captureException(caught, {
            tags: {
              feature: 'session-background-unmount'
            }
          });
        });
        cancelled = true;
      };
    }, [sessionQuery]);
    const handlers = (0, _useActiveSessionHandlers.useActiveSessionHandlers)({
      sessionQuery,
      companion,
      currentMode,
      userId,
      sessionId,
      navigation,
      progressionLevel: progressionSummary?.level,
      creativeMood,
      setCreativeMood,
      setControlFailure,
      setIsExiting,
      setShowInterruption
    });
    return {
      actions: {
        clearControlFailure: handlers.clearControlFailure,
        handleAbandon: handlers.handleAbandon,
        handleComplete: handlers.handleComplete,
        handleCreativeMoodSelected: handlers.handleCreativeMoodSelected,
        handlePauseResume: handlers.handlePauseResume,
        handleSkipCreativeMood: handlers.handleSkipCreativeMood,
        retryControlFailure: () => handlers.retryControlFailure(controlFailure),
        setDismissDegradedState,
        setShowInterruption,
        setShowMultiplierInfo
      },
      companion,
      controlFailure,
      isDegradedSession,
      metrics,
      navigation,
      sessionQuery,
      showInterruption,
      showMultiplierInfo,
      streak,
      theme,
      themeBackgroundColor: sessionTheme.backgroundTint === 'transparent' ? theme.colors.background.primary : sessionTheme.backgroundTint,
      userId
    };
  }
},3426,[12,821,1261,834,1359,2266,2261,3347,1957,1829,1705,1463,3427,3431,3434]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useActiveSessionMetrics = useActiveSessionMetrics;
  var _react = require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var _featuresStreaksService = require(_dependencyMap[2]);
  var _themeThemeContext = require(_dependencyMap[3]);
  var _useSessionAnimations = require(_dependencyMap[4]);
  var _useSessionPurity = require(_dependencyMap[5]);
  var _utilsActiveSession = require(_dependencyMap[6]);
  const _worklet_14506340358362_init_data = {
    code: "function useActiveSessionMetricsTs1(){const{visualState}=this.__closure;return visualState.value;}"
  };
  const _worklet_7956098368025_init_data = {
    code: "function useActiveSessionMetricsTs2(value,previousValue){const{runOnJS,updateGradientState}=this.__closure;if(value===previousValue){return;}runOnJS(updateGradientState)(value);}"
  };
  function useActiveSessionMetrics({
    completionPercentage,
    elapsedSeconds,
    getAntiCheatLabel,
    getAntiCheatScore,
    history,
    isActive,
    isPaused,
    phase,
    sessionId,
    sessionTheme,
    streakDays,
    heroDensity
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const streakMultiplier = (0, _featuresStreaksService.getStreakMultiplier)(streakDays);
    const {
      momentumScores,
      perfectFocusActive,
      perfectFocusBurst,
      purityLabel,
      purityScore,
      rotatingPerfectFocusStyle
    } = (0, _useSessionPurity.useSessionPurity)({
      completionPercentage,
      getAntiCheatLabel,
      getAntiCheatScore,
      heroDensity,
      sessionId,
      streakMultiplier
    });
    const phaseAccent = phase === 'SHORT_BREAK' || phase === 'LONG_BREAK' ? theme.colors.success.DEFAULT : purityLabel === 'Distracted' || purityLabel === 'Okay' ? theme.colors.warning.DEFAULT : purityLabel === 'Good' ? theme.colors.success.DEFAULT : sessionTheme.previewColor;
    const labelColor = purityLabel === 'Elite' ? theme.colors.primary[500] : purityLabel === 'Good' ? theme.colors.success.DEFAULT : purityLabel === 'Okay' ? theme.colors.warning.DEFAULT : theme.colors.error.DEFAULT;
    const glowStyle = (0, _react.useMemo)(() => ({
      shadowColor: phaseAccent,
      shadowOpacity: purityScore >= 90 ? 0.6 : purityScore < 45 ? 0.1 : 0.3,
      shadowRadius: purityScore >= 90 ? 25 : purityScore < 45 ? 5 : 14,
      elevation: purityScore >= 90 ? 12 : 4
    }), [phaseAccent, purityScore]);
    const todayFocusSeconds = (0, _react.useMemo)(() => {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      const historical = (history || []).reduce((total, entry) => entry.startedAt >= dayStart.getTime() ? total + (entry.summary?.effectiveDuration ?? 0) : total, 0);
      return (historical || 0) + (phase === 'FOCUS' ? elapsedSeconds || 0 : 0);
    }, [elapsedSeconds, history, phase]);
    const animations = (0, _useSessionAnimations.useSessionAnimations)({
      completionPercentage,
      purityScore,
      isActive,
      isPaused
    });
    const [gradientState, setGradientState] = (0, _react.useState)({
      top: theme.colors.background.primary,
      middle: theme.colors.background.secondary,
      bottom: theme.colors.background.primary
    });
    const visualState = (0, _reactNativeReanimated.useSharedValue)(2);
    (0, _react.useEffect)(() => {
      if (heroDensity === 'minimal') {
        return;
      }
      visualState.value = (0, _reactNativeReanimated.withTiming)((0, _utilsActiveSession.getVisualStateIndex)(phase, purityLabel), {
        duration: 450,
        easing: _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.cubic)
      });
    }, [phase, purityLabel, visualState, heroDensity]);
    const updateGradientState = (0, _react.useCallback)(value => {
      setGradientState((0, _utilsActiveSession.getGradientPalette)(value));
    }, []);
    (0, _reactNativeReanimated.useAnimatedReaction)(function useActiveSessionMetricsTs1Factory({
      _worklet_14506340358362_init_data,
      visualState
    }) {
      const useActiveSessionMetricsTs1 = () => visualState.value;
      useActiveSessionMetricsTs1.__closure = {
        visualState
      };
      useActiveSessionMetricsTs1.__workletHash = 14506340358362;
      useActiveSessionMetricsTs1.__initData = _worklet_14506340358362_init_data;
      return useActiveSessionMetricsTs1;
    }({
      _worklet_14506340358362_init_data,
      visualState
    }), function useActiveSessionMetricsTs2Factory({
      _worklet_7956098368025_init_data,
      runOnJS,
      updateGradientState
    }) {
      const useActiveSessionMetricsTs2 = function (value, previousValue) {
        if (value === previousValue) {
          return;
        }
        runOnJS(updateGradientState)(value);
      };
      useActiveSessionMetricsTs2.__closure = {
        runOnJS,
        updateGradientState
      };
      useActiveSessionMetricsTs2.__workletHash = 7956098368025;
      useActiveSessionMetricsTs2.__initData = _worklet_7956098368025_init_data;
      return useActiveSessionMetricsTs2;
    }({
      _worklet_7956098368025_init_data,
      runOnJS: _reactNativeReanimated.runOnJS,
      updateGradientState
    }));
    return Object.assign({
      dailyProgress: (0, _utilsActiveSession.clamp)((todayFocusSeconds || 0) / (_utilsActiveSession.DAILY_GOAL_SECONDS || 7200) * 100, 0, 100),
      glowStyle,
      gradientState,
      labelColor,
      momentumScores,
      perfectFocusActive,
      perfectFocusBurst,
      phaseAccent,
      phaseInfo: (0, _utilsActiveSession.getPhaseInfo)(phase),
      purityLabel,
      purityScore,
      rotatingPerfectFocusStyle,
      streakMultiplier,
      todayFocusSeconds,
      withAlpha: _utilsActiveSession.withAlpha
    }, animations);
  }
},3427,[12,226,2062,1463,3428,3429,3430]);
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
  exports.useSessionAnimations = useSessionAnimations;
  Object.defineProperty(exports, "AnimatedCircle", {
    enumerable: true,
    get: function () {
      return AnimatedCircle;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _reactNativeSvg = require(_dependencyMap[2]);
  var _themeThemeContext = require(_dependencyMap[3]);
  /**
   * useSessionAnimations Hook
   * Manages all animation values and effects for the Active Session screen
   */

  const AnimatedCircle = Animated.default.createAnimatedComponent(_reactNativeSvg.Circle);
  const _worklet_4750603476639_init_data = {
    code: "function useSessionAnimationsTs1(){const{CIRCUMFERENCE,progressValue}=this.__closure;return CIRCUMFERENCE*(1-progressValue.value);}"
  };
  const _worklet_4804724290812_init_data = {
    code: "function useSessionAnimationsTs2(){const{animatedStrokeDashoffset}=this.__closure;return{strokeDashoffset:animatedStrokeDashoffset.value};}"
  };
  const _worklet_15869861736244_init_data = {
    code: "function useSessionAnimationsTs3(){const{pulseValue}=this.__closure;return{transform:[{scale:pulseValue.value}]};}"
  };
  function useSessionAnimations({
    completionPercentage,
    purityScore,
    isActive,
    isPaused
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const progressValue = (0, _reactNativeReanimated.useSharedValue)(0);
    const pulseValue = (0, _reactNativeReanimated.useSharedValue)(1);
    const purityColorValue = (0, _reactNativeReanimated.useSharedValue)(100);
    const purityColorMap = {
      elite: theme.colors.success.DEFAULT,
      good: theme.colors.primary[500],
      okay: theme.colors.warning.DEFAULT,
      distracted: theme.colors.error.DEFAULT
    };
    const targetColor = purityScore >= 90 ? purityColorMap.elite : purityScore >= 70 ? purityColorMap.good : purityScore >= 45 ? purityColorMap.okay : purityColorMap.distracted;
    const [timerAccentColor, setTimerAccentColor] = (0, _react.useState)(purityColorMap.elite);
    (0, _react.useEffect)(() => {
      const timeout = setTimeout(() => setTimerAccentColor(targetColor), 1000);
      return () => clearTimeout(timeout);
    }, [targetColor]);

    // Sync progress animation with session
    (0, _react.useEffect)(() => {
      progressValue.value = (0, _reactNativeReanimated.withTiming)(completionPercentage / 100, {
        duration: 1000,
        easing: _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.ease)
      });
    }, [completionPercentage, progressValue]);
    (0, _react.useEffect)(() => {
      purityColorValue.value = (0, _reactNativeReanimated.withTiming)(purityScore, {
        duration: 1000,
        easing: _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.cubic)
      });
    }, [purityColorValue, purityScore]);

    // Pulse animation when active
    (0, _react.useEffect)(() => {
      if (isActive && !isPaused) {
        pulseValue.value = (0, _reactNativeReanimated.withRepeat)((0, _reactNativeReanimated.withTiming)(1.05, {
          duration: 1000,
          easing: _reactNativeReanimated.Easing.inOut(_reactNativeReanimated.Easing.ease)
        }), -1, true);
      } else {
        pulseValue.value = (0, _reactNativeReanimated.withSpring)(1);
      }
    }, [isActive, isPaused, pulseValue]);

    // Progress ring constants
    const RING_SIZE = 280;
    const STROKE_WIDTH = 10;
    const RADIUS = 135;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    // Animated stroke-dashoffset via Reanimated
    const animatedStrokeDashoffset = (0, _reactNativeReanimated.useDerivedValue)(function useSessionAnimationsTs1Factory({
      _worklet_4750603476639_init_data,
      CIRCUMFERENCE,
      progressValue
    }) {
      const useSessionAnimationsTs1 = function () {
        return CIRCUMFERENCE * (1 - progressValue.value);
      };
      useSessionAnimationsTs1.__closure = {
        CIRCUMFERENCE,
        progressValue
      };
      useSessionAnimationsTs1.__workletHash = 4750603476639;
      useSessionAnimationsTs1.__initData = _worklet_4750603476639_init_data;
      return useSessionAnimationsTs1;
    }({
      _worklet_4750603476639_init_data,
      CIRCUMFERENCE,
      progressValue
    }));
    const animatedCircleProps = (0, _reactNativeReanimated.useAnimatedProps)(function useSessionAnimationsTs2Factory({
      _worklet_4804724290812_init_data,
      animatedStrokeDashoffset
    }) {
      const useSessionAnimationsTs2 = () => ({
        strokeDashoffset: animatedStrokeDashoffset.value
      });
      useSessionAnimationsTs2.__closure = {
        animatedStrokeDashoffset
      };
      useSessionAnimationsTs2.__workletHash = 4804724290812;
      useSessionAnimationsTs2.__initData = _worklet_4804724290812_init_data;
      return useSessionAnimationsTs2;
    }({
      _worklet_4804724290812_init_data,
      animatedStrokeDashoffset
    }));

    // Pulse animation style
    const pulseStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function useSessionAnimationsTs3Factory({
      _worklet_15869861736244_init_data,
      pulseValue
    }) {
      const useSessionAnimationsTs3 = function () {
        return {
          transform: [{
            scale: pulseValue.value
          }]
        };
      };
      useSessionAnimationsTs3.__closure = {
        pulseValue
      };
      useSessionAnimationsTs3.__workletHash = 15869861736244;
      useSessionAnimationsTs3.__initData = _worklet_15869861736244_init_data;
      return useSessionAnimationsTs3;
    }({
      _worklet_15869861736244_init_data,
      pulseValue
    }));
    return {
      progressValue,
      pulseValue,
      purityColorValue,
      timerAccentColor,
      animatedCircleProps,
      pulseStyle,
      RING_SIZE,
      STROKE_WIDTH,
      RADIUS,
      CIRCUMFERENCE
    };
  }
},3428,[12,226,1643,1463]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useSessionPurity = useSessionPurity;
  var _react = require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var _eventsEventBus = require(_dependencyMap[2]);
  const _worklet_3162049274035_init_data = {
    code: "function useSessionPurityTs1(){const{perfectFocusRotation}=this.__closure;return{transform:[{rotate:perfectFocusRotation.value*360+\"deg\"}]};}"
  };
  function useSessionPurity({
    completionPercentage,
    getAntiCheatLabel,
    getAntiCheatScore,
    heroDensity,
    sessionId,
    streakMultiplier
  }) {
    const [purityScore, setPurityScore] = (0, _react.useState)(100);
    const [purityLabel, setPurityLabel] = (0, _react.useState)('Elite');
    const [perfectFocusEligible, setPerfectFocusEligible] = (0, _react.useState)(true);
    const [momentumScores, setMomentumScores] = (0, _react.useState)([]);
    const previousPurityLabelRef = (0, _react.useRef)('Elite');
    const perfectFocusTrackedRef = (0, _react.useRef)(false);
    const perfectFocusBurstRef = (0, _react.useRef)(false);
    const momentumScoresRef = (0, _react.useRef)([]);
    const perfectFocusRotation = (0, _reactNativeReanimated.useSharedValue)(0);
    const perfectFocusBurst = (0, _reactNativeReanimated.useSharedValue)(0);
    const [prevSessionId, setPrevSessionId] = (0, _react.useState)(sessionId);
    if (sessionId !== prevSessionId) {
      setPrevSessionId(sessionId);
      setPerfectFocusEligible(true);
      setPurityScore(100);
      setPurityLabel('Elite');
      setMomentumScores([]);
      momentumScoresRef.current = [];
      previousPurityLabelRef.current = 'Elite';
      perfectFocusTrackedRef.current = false;
      perfectFocusBurstRef.current = false;
    }
    const perfectFocusActive = completionPercentage >= 100 && perfectFocusEligible;
    (0, _react.useEffect)(() => {
      if (heroDensity === 'minimal') {
        return;
      }
      const syncPurity = () => {
        const nextScore = getAntiCheatScore();
        const nextLabel = getAntiCheatLabel();
        setPurityScore(nextScore);
        setPurityLabel(nextLabel);
        momentumScoresRef.current = [...momentumScoresRef.current, nextScore].slice(-10);
        setMomentumScores(momentumScoresRef.current);
        if (nextScore < 90) {
          setPerfectFocusEligible(false);
        }
      };
      syncPurity();
      const intervalId = setInterval(syncPurity, 5000);
      return () => clearInterval(intervalId);
    }, [getAntiCheatLabel, getAntiCheatScore, heroDensity]);
    (0, _react.useEffect)(() => {
      if (!sessionId || previousPurityLabelRef.current === purityLabel) {
        return;
      }
      _eventsEventBus.eventBus.publish('analytics:track', {
        event: 'session_purity_changed',
        properties: {
          sessionId,
          purityScore,
          purityLabel,
          previousPurityLabel: previousPurityLabelRef.current,
          streakMultiplier
        }
      });
      previousPurityLabelRef.current = purityLabel;
    }, [purityLabel, purityScore, sessionId, streakMultiplier]);
    (0, _react.useEffect)(() => {
      if (!sessionId || !perfectFocusActive || perfectFocusTrackedRef.current) {
        return;
      }
      perfectFocusTrackedRef.current = true;
      _eventsEventBus.eventBus.publish('analytics:track', {
        event: 'session_perfect_focus_earned',
        properties: {
          sessionId,
          purityScore,
          streakMultiplier
        }
      });
    }, [perfectFocusActive, purityScore, sessionId, streakMultiplier]);
    (0, _react.useEffect)(() => {
      if (!perfectFocusActive) {
        perfectFocusBurstRef.current = false;
        (0, _reactNativeReanimated.cancelAnimation)(perfectFocusRotation);
        perfectFocusRotation.value = 0;
        return;
      }
      perfectFocusRotation.value = 0;
      perfectFocusRotation.value = (0, _reactNativeReanimated.withRepeat)((0, _reactNativeReanimated.withTiming)(1, {
        duration: 5000,
        easing: _reactNativeReanimated.Easing.linear
      }), -1, false);
      if (!perfectFocusBurstRef.current) {
        perfectFocusBurstRef.current = true;
        perfectFocusBurst.value = (0, _reactNativeReanimated.withSequence)((0, _reactNativeReanimated.withTiming)(1, {
          duration: 500,
          easing: _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.quad)
        }), (0, _reactNativeReanimated.withTiming)(0, {
          duration: 350,
          easing: _reactNativeReanimated.Easing.in(_reactNativeReanimated.Easing.quad)
        }));
      }
    }, [perfectFocusActive, perfectFocusBurst, perfectFocusRotation]);
    const rotatingPerfectFocusStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function useSessionPurityTs1Factory({
      _worklet_3162049274035_init_data,
      perfectFocusRotation
    }) {
      const useSessionPurityTs1 = () => ({
        transform: [{
          rotate: `${perfectFocusRotation.value * 360}deg`
        }]
      });
      useSessionPurityTs1.__closure = {
        perfectFocusRotation
      };
      useSessionPurityTs1.__workletHash = 3162049274035;
      useSessionPurityTs1.__initData = _worklet_3162049274035_init_data;
      return useSessionPurityTs1;
    }({
      _worklet_3162049274035_init_data,
      perfectFocusRotation
    }));
    return {
      momentumScores,
      perfectFocusActive,
      perfectFocusBurst,
      purityLabel,
      purityScore,
      rotatingPerfectFocusStyle
    };
  }
},3429,[12,226,1849]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "DAILY_GOAL_SECONDS", {
    enumerable: true,
    get: function () {
      return DAILY_GOAL_SECONDS;
    }
  });
  Object.defineProperty(exports, "PERFECT_PARTICLE_COUNT", {
    enumerable: true,
    get: function () {
      return PERFECT_PARTICLE_COUNT;
    }
  });
  Object.defineProperty(exports, "formatTime", {
    enumerable: true,
    get: function () {
      return formatTime;
    }
  });
  Object.defineProperty(exports, "formatMultiplier", {
    enumerable: true,
    get: function () {
      return formatMultiplier;
    }
  });
  Object.defineProperty(exports, "clamp", {
    enumerable: true,
    get: function () {
      return clamp;
    }
  });
  Object.defineProperty(exports, "withAlpha", {
    enumerable: true,
    get: function () {
      return withAlpha;
    }
  });
  Object.defineProperty(exports, "getVisualStateIndex", {
    enumerable: true,
    get: function () {
      return getVisualStateIndex;
    }
  });
  Object.defineProperty(exports, "getGradientPalette", {
    enumerable: true,
    get: function () {
      return getGradientPalette;
    }
  });
  Object.defineProperty(exports, "getPhaseInfo", {
    enumerable: true,
    get: function () {
      return getPhaseInfo;
    }
  });
  var _themeTokensColors = require(_dependencyMap[0]);
  const DAILY_GOAL_SECONDS = 7200;
  const PERFECT_PARTICLE_COUNT = 8;
  const WARNING_GRADIENT = [_themeTokensColors.lightColors.semantic.backgroundMuted, _themeTokensColors.lightColors.semantic.backgroundMuted, _themeTokensColors.lightColors.semantic.backgroundMuted];
  const FOCUS_GRADIENT = [_themeTokensColors.lightColors.semantic.backgroundMuted, _themeTokensColors.lightColors.semantic.backgroundElevated, _themeTokensColors.lightColors.semantic.backgroundMuted];
  const ELITE_GRADIENT = [_themeTokensColors.lightColors.semantic.backgroundMuted, _themeTokensColors.lightColors.semantic.backgroundMuted, _themeTokensColors.lightColors.semantic.backgroundMuted];
  const BREAK_GRADIENT = [_themeTokensColors.lightColors.semantic.breakGradientDark, _themeTokensColors.lightColors.semantic.breakGradientMid, _themeTokensColors.lightColors.semantic.backgroundMuted];
  const formatTime = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.max(seconds % 60, 0).toString().padStart(2, '0')}`;
  const formatMultiplier = value => value.toFixed(value % 1 === 0 ? 1 : 2).replace(/\.0$/, '');
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const withAlpha = (color, alpha) => color.startsWith('#') ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${alpha})` : color;
  const getVisualStateIndex = (phase, label) => phase === 'SHORT_BREAK' || phase === 'LONG_BREAK' ? 3 : label === 'Distracted' ? 0 : label === 'Okay' ? 1 : 2;
  const getGradientPalette = value => {
    if (value >= 2.5) {
      return {
        top: BREAK_GRADIENT[0],
        middle: BREAK_GRADIENT[1],
        bottom: BREAK_GRADIENT[2]
      };
    }
    if (value >= 1.5) {
      return {
        top: ELITE_GRADIENT[0],
        middle: ELITE_GRADIENT[1],
        bottom: ELITE_GRADIENT[2]
      };
    }
    if (value >= 0.5) {
      return {
        top: FOCUS_GRADIENT[0],
        middle: FOCUS_GRADIENT[1],
        bottom: FOCUS_GRADIENT[2]
      };
    }
    return {
      top: WARNING_GRADIENT[0],
      middle: WARNING_GRADIENT[1],
      bottom: WARNING_GRADIENT[2]
    };
  };
  const getPhaseInfo = phase => phase === 'SHORT_BREAK' ? {
    label: 'Reset Window',
    icon: 'clock'
  } : phase === 'LONG_BREAK' ? {
    label: 'Long Reset',
    icon: 'clock'
  } : {
    label: 'Locked In',
    icon: 'target'
  };
},3430,[1465]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useCompanionSession = useCompanionSession;
  var _react = require(_dependencyMap[0]);
  var _sharedUiComponentsToast = require(_dependencyMap[1]);
  var _utilsHaptics = require(_dependencyMap[2]);
  var _featuresCompanionService = require(_dependencyMap[3]);
  var _featuresCompanionSessionStorage = require(_dependencyMap[4]);
  var _milestoneHelpers = require(_dependencyMap[5]);
  var _completionHelper = require(_dependencyMap[6]);
  // Empty ref function factory — avoids re-creating the Set on every render
  function createEmptySet() {
    return new Set();
  }
  function useCompanionSession(input) {
    const {
      currentMode,
      elapsedSeconds,
      isPaused,
      purityScore,
      sessionId,
      totalSeconds,
      userId
    } = input;
    const {
      show
    } = (0, _sharedUiComponentsToast.useToast)();
    const serviceRef = (0, _react.useRef)(null);
    const showRef = (0, _react.useRef)(show);
    const activeSessionRef = (0, _react.useRef)(null);
    const triggeredMilestonesRef = (0, _react.useRef)(createEmptySet());
    const dangerActiveRef = (0, _react.useRef)(false);
    const pureFocusStartedAtRef = (0, _react.useRef)(null);
    const pureBurstTriggeredRef = (0, _react.useRef)(false);
    const [state, setState] = (0, _react.useState)(null);
    const [isLoaded, setIsLoaded] = (0, _react.useState)(false);
    const [eventLabel, setEventLabel] = (0, _react.useState)(null);
    const hasCompanionState = state !== null;
    const sessionProgress = Math.round(elapsedSeconds / Math.max(totalSeconds, 1) * 100);
    showRef.current = show;
    const flashEvent = (0, _react.useCallback)(label => {
      setEventLabel(label);
      setTimeout(() => setEventLabel(null), 1400);
    }, []);
    const [prevUserId, setPrevUserId] = (0, _react.useState)(userId);
    if (userId !== prevUserId) {
      setPrevUserId(userId);
      if (!userId) {
        setState(null);
        setIsLoaded(true);
      } else {
        setIsLoaded(false);
      }
    }

    // SAFETY: loadCompanionState is async I/O (reads from storage); must live in an effect
    // because it's a side effect triggered by userId changes, not a computation.
    (0, _react.useEffect)(() => {
      if (!userId) {
        return;
      }
      let mounted = true;
      (0, _featuresCompanionSessionStorage.loadCompanionState)(userId).then(loaded => {
        if (!mounted) {
          return;
        }
        serviceRef.current = (0, _featuresCompanionService.getCompanionService)(loaded);
        setState(loaded);
      }).finally(() => {
        if (mounted) {
          setIsLoaded(true);
        }
      });
      return () => {
        mounted = false;
      };
    }, [userId]);
    const prevSessionStartIdRef = (0, _react.useRef)(sessionId);
    if (serviceRef.current && hasCompanionState && activeSessionRef.current !== sessionId && sessionId !== prevSessionStartIdRef.current) {
      prevSessionStartIdRef.current = sessionId;
      serviceRef.current.startSession(totalSeconds / 60);
      activeSessionRef.current = sessionId;
      triggeredMilestonesRef.current = new Set();
      dangerActiveRef.current = false;
      pureFocusStartedAtRef.current = null;
      pureBurstTriggeredRef.current = false;
      setState(current => current ? Object.assign({}, current, {
        currentMood: 'SLEEPY',
        sessionProgress: 0,
        updatedAt: Date.now()
      }) : current);
    }
    // SAFETY: tick() mutates companion service state and reads multiple reactive inputs
    // (elapsedSeconds, purityScore, isPaused); must run as an effect to stay in sync.
    // State updates from tick results are batched into a single setState call.
    (0, _react.useEffect)(() => {
      const service = serviceRef.current;
      if (!service || !hasCompanionState) {
        return;
      }
      service.tick(elapsedSeconds, totalSeconds, purityScore, isPaused);
      const nextState = service.getState();
      // Batch all state mutations from this tick cycle into one update
      let updatedState = null;
      if (nextState) {
        updatedState = Object.assign({}, nextState, {
          sessionProgress
        });
      }
      for (const milestone of _milestoneHelpers.MILESTONES) {
        if (sessionProgress >= milestone && !triggeredMilestonesRef.current.has(milestone)) {
          triggeredMilestonesRef.current.add(milestone);
          const label = (0, _milestoneHelpers.getMilestoneLabel)(milestone, currentMode);
          flashEvent(label);
          (0, _utilsHaptics.triggerHaptic)((0, _milestoneHelpers.getMilestoneHaptic)(milestone));
        }
      }
      if (purityScore < 60 && !dangerActiveRef.current) {
        dangerActiveRef.current = true;
        flashEvent('Struggling');
        showRef.current({
          type: 'warning',
          title: 'Struggling',
          duration: 1400,
          priority: 'normal'
        });
        if (updatedState) {
          updatedState = Object.assign({}, updatedState, {
            currentMood: 'STRUGGLING',
            updatedAt: Date.now()
          });
        }
        (0, _utilsHaptics.triggerHaptic)('warning');
      }
      if (purityScore >= 60) {
        dangerActiveRef.current = false;
      }
      if (purityScore > 90 && !isPaused) {
        pureFocusStartedAtRef.current ??= elapsedSeconds;
        const pureSeconds = elapsedSeconds - pureFocusStartedAtRef.current;
        if (pureSeconds >= 300 && !pureBurstTriggeredRef.current) {
          pureBurstTriggeredRef.current = true;
          flashEvent('On fire!');
          showRef.current({
            type: 'success',
            title: 'On fire!',
            duration: 1400,
            priority: 'normal'
          });
          if (updatedState) {
            updatedState = Object.assign({}, updatedState, {
              currentMood: 'ECSTATIC',
              updatedAt: Date.now()
            });
          }
          (0, _utilsHaptics.triggerHaptic)('success');
        }
      } else {
        pureFocusStartedAtRef.current = null;
        pureBurstTriggeredRef.current = false;
      }
      // Single setState call batches all mutations from this tick cycle
      if (updatedState) {
        setState(updatedState);
      }
    }, [currentMode, elapsedSeconds, flashEvent, hasCompanionState, isPaused, purityScore, sessionProgress, totalSeconds]);
    const completeCompanionSession = (0, _react.useCallback)(async summary => {
      const saved = await (0, _completionHelper.completeCompanionSessionImpl)(serviceRef.current, state, userId, sessionId, summary);
      if (saved) {
        setState(saved);
      }
    }, [sessionId, state, userId]);
    return {
      completeCompanionSession,
      eventLabel,
      isLoaded,
      sessionProgress,
      state
    };
  }
},3431,[12,2159,1683,3308,3541,3432,3433]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "MILESTONES", {
    enumerable: true,
    get: function () {
      return MILESTONES;
    }
  });
  exports.getMilestoneLabel = getMilestoneLabel;
  exports.getMilestoneHaptic = getMilestoneHaptic;
  var _sessionModes = require(_dependencyMap[0]);
  const MILESTONES = [25, 50, 75, 90];
  function getMilestoneLabel(milestone, mode) {
    switch (milestone) {
      case 25:
        switch (mode) {
          case _sessionModes.SessionMode.DEEP_WORK:
            return 'Hold the line.';
          case _sessionModes.SessionMode.SPRINT:
            return 'Sprint 1 complete.';
          case _sessionModes.SessionMode.CREATIVE:
            return 'Keep the flow.';
          case _sessionModes.SessionMode.STUDY:
            return '¼ done. Stay sharp.';
          default:
            return 'Quarter way!';
        }
      case 50:
        switch (mode) {
          case _sessionModes.SessionMode.DEEP_WORK:
            return "Halfway. Don't break now.";
          case _sessionModes.SessionMode.SPRINT:
            return 'Sprint 2 complete. Chain active.';
          case _sessionModes.SessionMode.CREATIVE:
            return "You're in it. Keep going.";
          case _sessionModes.SessionMode.STUDY:
            return 'Halfway. Quiz break soon.';
          default:
            return 'Halfway there!';
        }
      case 75:
        switch (mode) {
          case _sessionModes.SessionMode.DEEP_WORK:
            return 'Final stretch. Almost there.';
          case _sessionModes.SessionMode.SPRINT:
            return 'Sprint 3 done. One more.';
          case _sessionModes.SessionMode.CREATIVE:
            return 'Almost done. Great mood today.';
          case _sessionModes.SessionMode.STUDY:
            return 'Final quiz coming up.';
          default:
            return 'Almost there!';
        }
      case 90:
        switch (mode) {
          case _sessionModes.SessionMode.DEEP_WORK:
            return "Final 10%. Don't you dare pause.";
          case _sessionModes.SessionMode.SPRINT:
            return 'Last sprint. Chain bonus on the line.';
          default:
            return "Final stretch! Don't break now.";
        }
      default:
        return 'Keep going.';
    }
  }
  function getMilestoneHaptic(milestone) {
    if (milestone === 75) {
      return 'impactHeavy';
    }
    if (milestone === 50) {
      return 'impactMedium';
    }
    return 'impactLight';
  }
},3432,[1829]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.completeCompanionSessionImpl = completeCompanionSessionImpl;
  var _featuresCompanionSessionStorage = require(_dependencyMap[0]);
  async function completeCompanionSessionImpl(service, state, userId, sessionId, summary) {
    if (!service || !state || !userId) {
      return null;
    }
    const previousLevel = state.level;
    const minutes = Math.max(0, summary.effectiveDuration / 60000);
    const mood = (0, _featuresCompanionSessionStorage.getMoodForSessionSummary)(summary);
    const outcome = service.completeSession(minutes, summary.focusPurityScore ?? summary.focusQuality ?? 0);
    const nextState = service.getState();
    if (!nextState) {
      return null;
    }
    const saved = await (0, _featuresCompanionSessionStorage.saveCompanionState)(Object.assign({}, nextState, {
      currentMood: mood
    }));
    await (0, _featuresCompanionSessionStorage.saveCompanionGrowth)(userId, {
      sessionId,
      mood,
      level: saved.level,
      phase: saved.phase,
      progressToEvolution: (0, _featuresCompanionSessionStorage.getEvolutionProgress)(saved),
      totalFocusMinutes: saved.totalFocusMinutes,
      leveledUp: outcome.evolved || saved.level > previousLevel,
      evolved: outcome.evolved,
      updatedAt: Date.now()
    });
    return saved;
  }
},3433,[3541]);
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
  exports.useActiveSessionHandlers = useActiveSessionHandlers;
  var _react = require(_dependencyMap[0]);
  var _sentryReactNative = require(_dependencyMap[1]);
  var Sentry = _interopNamespace(_sentryReactNative);
  var _featuresSessionSprintChainService = require(_dependencyMap[2]);
  var _navigationNavigationHelpers = require(_dependencyMap[3]);
  var _sessionTypesSchemas = require(_dependencyMap[4]);
  var _sessionModes = require(_dependencyMap[5]);
  var _utilsActiveSessionControlFailure = require(_dependencyMap[6]);
  function useActiveSessionHandlers({
    sessionQuery,
    companion,
    currentMode,
    userId,
    sessionId,
    navigation,
    progressionLevel,
    creativeMood,
    setCreativeMood,
    setControlFailure,
    setIsExiting,
    setShowInterruption
  }) {
    const handlePauseResume = (0, _react.useCallback)(async () => {
      try {
        if (sessionQuery.isPaused) {
          await sessionQuery.resumeSession();
          setControlFailure(null);
          Sentry.addBreadcrumb({
            category: 'session',
            message: 'Session resumed',
            level: 'info'
          });
          return;
        }
        await sessionQuery.pauseSession('user');
        setControlFailure(null);
        Sentry.addBreadcrumb({
          category: 'session',
          message: 'Session paused',
          level: 'info'
        });
      } catch (caught) {
        setControlFailure((0, _utilsActiveSessionControlFailure.buildActiveSessionControlFailure)('pause'));
        Sentry.captureException(caught, {
          tags: {
            feature: 'session-control'
          }
        });
      }
    }, [sessionQuery, setControlFailure]);
    const handleComplete = (0, _react.useCallback)(async () => {
      try {
        const finalPurityScore = sessionQuery.getAntiCheatScore();
        const result = await sessionQuery.endSession();
        let sprintChainCount = sessionQuery.session?.config.sprintChainCount ?? 1;
        if (currentMode === _sessionModes.SessionMode.SPRINT) {
          const sprintState = await (0, _featuresSessionSprintChainService.getSprintChainService)().recordSprintCompleted(userId);
          sprintChainCount = sprintState.completedCount;
        }
        await companion.completeCompanionSession(Object.assign({}, result, {
          focusPurityScore: finalPurityScore
        }));
        setControlFailure(null);
        Sentry.addBreadcrumb({
          category: 'session',
          message: 'Session completed',
          level: 'info'
        });
        (0, _navigationNavigationHelpers.navigateToSessionStackScreen)(navigation, 'SessionComplete', {
          sessionId,
          summary: _sessionTypesSchemas.SessionSummarySchema.parse(Object.assign({}, result, {
            focusPurityScore: finalPurityScore,
            sprintChainCount,
            userLevel: progressionLevel ?? result.userLevel ?? 1,
            creativeMood: creativeMood ?? undefined
          }))
        });
      } catch (caught) {
        setControlFailure((0, _utilsActiveSessionControlFailure.buildActiveSessionControlFailure)('complete'));
        Sentry.captureException(caught, {
          tags: {
            feature: 'session-complete'
          }
        });
      }
    }, [companion, creativeMood, currentMode, navigation, progressionLevel, sessionId, sessionQuery, userId, setControlFailure]);
    const handleCreativeMoodSelected = (0, _react.useCallback)(mood => setCreativeMood(mood), [setCreativeMood]);
    const handleSkipCreativeMood = (0, _react.useCallback)(() => setCreativeMood(null), [setCreativeMood]);
    const handleAbandon = (0, _react.useCallback)(async () => {
      setIsExiting(true);
      setShowInterruption(false);
      try {
        await sessionQuery.abandonSession('user');
        setControlFailure(null);
        Sentry.addBreadcrumb({
          category: 'session',
          message: 'Session abandoned',
          level: 'warning'
        });
        navigation.goBack();
      } catch (caught) {
        setControlFailure((0, _utilsActiveSessionControlFailure.buildActiveSessionControlFailure)('abandon'));
        Sentry.captureException(caught, {
          tags: {
            feature: 'session-abandon'
          }
        });
        setIsExiting(false);
      }
    }, [navigation, sessionQuery, setControlFailure, setIsExiting, setShowInterruption]);
    const retryControlFailure = (0, _react.useCallback)(async controlFailure => {
      if (!controlFailure) {
        return;
      }
      if (controlFailure.action === 'complete') {
        await handleComplete();
        return;
      }
      if (controlFailure.action === 'abandon') {
        await handleAbandon();
        return;
      }
      await handlePauseResume();
    }, [handleAbandon, handleComplete, handlePauseResume]);
    const clearControlFailure = (0, _react.useCallback)(() => setControlFailure(null), [setControlFailure]);
    return {
      clearControlFailure,
      handleAbandon,
      handleComplete,
      handleCreativeMoodSelected,
      handlePauseResume,
      handleSkipCreativeMood,
      retryControlFailure
    };
  }
},3434,[12,834,3354,2052,1854,1829,3435]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.buildActiveSessionControlFailure = buildActiveSessionControlFailure;
  const FAILURE_COPY = {
    abandon: {
      message: 'Quit did not finish cleanly. Retry so VEX can close this session without leaving it stranded.',
      supportHint: 'Your latest local session state is still saved; support can inspect it if retry keeps failing.',
      title: 'Quit needs one more try'
    },
    complete: {
      message: 'Completion did not confirm. Retry before leaving so this focused work can count toward rewards and history.',
      supportHint: 'Your latest local session state is still saved; support can inspect it if retry keeps failing.',
      title: 'Your win is not banked yet'
    },
    pause: {
      message: 'Pause or resume did not confirm. Retry to keep the timer and focus record aligned.',
      supportHint: 'Your latest local session state is still saved; support can inspect it if retry keeps failing.',
      title: 'Session control did not land'
    }
  };
  function buildActiveSessionControlFailure(action) {
    return Object.assign({
      action
    }, FAILURE_COPY[action]);
  }
},3435,[]);
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
  exports.useStudyQuizBreak = useStudyQuizBreak;
  var _react = require(_dependencyMap[0]);
  var _sentryReactNative = require(_dependencyMap[1]);
  var Sentry = _interopNamespace(_sentryReactNative);
  var _sessionModes = require(_dependencyMap[2]);
  function useStudyQuizBreak(input) {
    const {
      currentMode,
      plannedQuizBreakOptedIn,
      sessionQuery
    } = input;
    const [quizBreakKey, setQuizBreakKey] = (0, _react.useState)(null);
    const [completedQuizBreaks, setCompletedQuizBreaks] = (0, _react.useState)([]);
    (0, _react.useEffect)(() => {
      if (!plannedQuizBreakOptedIn || currentMode !== _sessionModes.SessionMode.STUDY || !sessionQuery.isActive || sessionQuery.isPaused) {
        return;
      }
      const nextBreak = sessionQuery.completionPercentage >= 90 ? '90' : sessionQuery.completionPercentage >= 50 ? '50' : null;
      if (!nextBreak || quizBreakKey === nextBreak || completedQuizBreaks.includes(nextBreak)) {
        return;
      }
      setQuizBreakKey(nextBreak);
      sessionQuery.pauseSession('study_quiz').catch(caught => {
        Sentry.captureException(caught, {
          tags: {
            feature: 'study-quiz-break'
          }
        });
      });
    }, [completedQuizBreaks, currentMode, plannedQuizBreakOptedIn, quizBreakKey, sessionQuery]);
    const finishQuizBreak = correctAnswers => {
      if (typeof correctAnswers === 'number') {
        sessionQuery.applyStudyQuizBonus(correctAnswers);
      }
      if (quizBreakKey) {
        setCompletedQuizBreaks(current => [...current, quizBreakKey]);
      }
      setQuizBreakKey(null);
      sessionQuery.resumeSession();
    };
    return {
      finishQuizBreak,
      quizBreakKey
    };
  }
},3436,[12,834,1829]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useActiveSessionDisplay = useActiveSessionDisplay;
  var _react = require(_dependencyMap[0]);
  var _sessionModes = require(_dependencyMap[1]);
  var _featuresLaneEnginePresentation = require(_dependencyMap[2]);
  var _featuresOnboardingStore = require(_dependencyMap[3]);
  var _utilsActiveSessionDisplayPolicy = require(_dependencyMap[4]);
  var _utilsActiveSessionHeroViewModel = require(_dependencyMap[5]);
  function useActiveSessionDisplay(input) {
    const motivationStyle = (0, _featuresOnboardingStore.useOnboardingStore)(state => state.explicitMotivationStyle);
    const primaryGoal = (0, _featuresOnboardingStore.useOnboardingStore)(state => state.goal);
    const chosenLane = (0, _featuresOnboardingStore.useOnboardingStore)(state => state.chosenLane);
    const {
      isReducedMotion
    } = (0, _featuresLaneEnginePresentation.useReducedMotion)();
    const observedAtRef = (0, _react.useRef)(Date.now());
    const currentMode = (0, _sessionModes.resolveSessionMode)(input.sessionConfigSessionMode);
    const laneProfile = (0, _featuresLaneEnginePresentation.useInitialLane)({
      primaryGoal: (0, _utilsActiveSessionDisplayPolicy.normalizeActiveSessionGoal)(primaryGoal),
      motivationStyle: (0, _utilsActiveSessionDisplayPolicy.normalizeActiveSessionMotivationStyle)(motivationStyle),
      manualOverride: chosenLane ?? null,
      observedAt: observedAtRef.current,
      sessionMode: (0, _utilsActiveSessionDisplayPolicy.toLaneSessionMode)(currentMode)
    });
    return (0, _react.useMemo)(() => {
      const focusStage = input.showInterruption ? 'interruption' : input.isPaused ? 'paused' : 'active';
      const displayPolicy = (0, _utilsActiveSessionDisplayPolicy.resolveActiveSessionDisplayPolicy)({
        bossIntensity: undefined,
        firstWeekStage: undefined,
        focusStage,
        laneProfile,
        motivationStyle: (0, _utilsActiveSessionDisplayPolicy.normalizeActiveSessionMotivationStyle)(motivationStyle),
        plannedQuizBreakOptedIn: false,
        primaryGoal: (0, _utilsActiveSessionDisplayPolicy.normalizeActiveSessionGoal)(primaryGoal),
        sessionMode: currentMode,
        studyLayerLabel: (0, _utilsActiveSessionDisplayPolicy.getActiveSessionTargetLabel)(primaryGoal, currentMode)
      });
      const lanePresentation = (0, _featuresLaneEnginePresentation.getLanePresentationPolicy)({
        lane: laneProfile.primaryLane,
        reducedMotion: isReducedMotion
      });
      const heroViewModel = (0, _utilsActiveSessionHeroViewModel.buildActiveSessionHeroViewModel)({
        completionPercentage: input.completionPercentage,
        dailyProgress: input.dailyProgress,
        displayPolicy,
        elapsedSeconds: input.elapsedSeconds,
        isReducedMotion,
        lanePresentation,
        momentumScores: input.momentumScores,
        perfectFocusActive: input.perfectFocusActive,
        phaseAccent: input.phaseAccent,
        phaseIcon: input.phaseIcon,
        phaseLabel: input.phaseLabel,
        purityLabel: input.purityLabel,
        purityScore: input.purityScore,
        remainingSeconds: input.remainingSeconds,
        streakMultiplier: input.streakMultiplier,
        studyTargetLabel: (0, _utilsActiveSessionDisplayPolicy.getActiveSessionTargetLabel)(primaryGoal, currentMode),
        todayFocusSeconds: input.todayFocusSeconds
      });
      return {
        displayPolicy,
        heroViewModel
      };
    }, [input, motivationStyle, primaryGoal, currentMode, laneProfile, isReducedMotion]);
  }
},3437,[12,1829,3438,1892,3440,3443]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "useInitialLane", {
    enumerable: true,
    get: function () {
      return _hooks.useInitialLane;
    }
  });
  Object.defineProperty(exports, "useReducedMotion", {
    enumerable: true,
    get: function () {
      return _hooksUseReducedMotion.useReducedMotion;
    }
  });
  exports.getLanePresentationPolicy = getLanePresentationPolicy;
  var _hooks = require(_dependencyMap[0]);
  var _hooksUseReducedMotion = require(_dependencyMap[1]);
  var _presentationSchemas = require(_dependencyMap[2]);
  const POLICY_BY_LANE = {
    deep_creative: {
      animation: 'low_medium',
      copyTone: 'reflective_continuity',
      density: 'medium',
      emptyStateCta: 'Resume a project thread',
      errorStateHint: 'Keep the thread intact and retry.',
      icon: 'pen-tool',
      lane: 'deep_creative',
      loadingState: 'project_thread_skeleton',
      visualFeeling: 'studio_workbench'
    },
    game_like: {
      animation: 'medium_high',
      copyTone: 'strategic_energetic',
      density: 'medium_high',
      emptyStateCta: 'Start a clean encounter',
      errorStateHint: 'Keep the run safe and retry.',
      icon: 'shield',
      lane: 'game_like',
      loadingState: 'run_board_skeleton',
      visualFeeling: 'focused_roguelite_overlay'
    },
    minimal_normal: {
      animation: 'minimal',
      copyTone: 'concise_factual',
      density: 'low',
      emptyStateCta: 'Start one clean session',
      errorStateHint: 'Stay quiet; offer one retry.',
      icon: 'check-circle',
      lane: 'minimal_normal',
      loadingState: 'today_strip_skeleton',
      visualFeeling: 'quiet_planner'
    },
    student: {
      animation: 'low_medium',
      copyTone: 'precise_supportive',
      density: 'medium',
      emptyStateCta: 'Start a study block',
      errorStateHint: 'Keep the study plan visible and retry.',
      icon: 'book-open',
      lane: 'student',
      loadingState: 'study_plan_skeleton',
      visualFeeling: 'academic_command_center'
    }
  };
  function getLanePresentationPolicy(input) {
    const base = POLICY_BY_LANE[input.lane];
    const animation = input.reducedMotion ? 'none' : base.animation;
    return _presentationSchemas.LanePresentationPolicySchema.parse(Object.assign({}, base, {
      animation,
      shouldRenderSkeleton: !input.hiddenFeatureKeys?.includes(base.loadingState)
    }));
  }
},3438,[2507,1681,3439]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "LaneDensitySchema", {
    enumerable: true,
    get: function () {
      return LaneDensitySchema;
    }
  });
  Object.defineProperty(exports, "LaneAnimationPolicySchema", {
    enumerable: true,
    get: function () {
      return LaneAnimationPolicySchema;
    }
  });
  Object.defineProperty(exports, "LaneCopyToneSchema", {
    enumerable: true,
    get: function () {
      return LaneCopyToneSchema;
    }
  });
  Object.defineProperty(exports, "LanePresentationPolicySchema", {
    enumerable: true,
    get: function () {
      return LanePresentationPolicySchema;
    }
  });
  var _zod = require(_dependencyMap[0]);
  var _schemas = require(_dependencyMap[1]);
  const LaneDensitySchema = _zod.z.enum(['low', 'medium', 'medium_high']);
  const LaneAnimationPolicySchema = _zod.z.enum(['none', 'minimal', 'low_medium', 'medium_high']);
  const LaneCopyToneSchema = _zod.z.enum(['precise_supportive', 'strategic_energetic', 'reflective_continuity', 'concise_factual']);
  const LanePresentationPolicySchema = _zod.z.object({
    animation: LaneAnimationPolicySchema,
    copyTone: LaneCopyToneSchema,
    density: LaneDensitySchema,
    emptyStateCta: _zod.z.string().min(1),
    errorStateHint: _zod.z.string().min(1),
    icon: _zod.z.string().min(1),
    lane: _schemas.LaneSchema,
    loadingState: _zod.z.enum(['study_plan_skeleton', 'run_board_skeleton', 'project_thread_skeleton', 'today_strip_skeleton']),
    shouldRenderSkeleton: _zod.z.boolean().default(true),
    visualFeeling: _zod.z.enum(['academic_command_center', 'focused_roguelite_overlay', 'studio_workbench', 'quiet_planner'])
  }).strict();
},3439,[1774,1889]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "ActiveSessionDisplayPolicyInputSchema", {
    enumerable: true,
    get: function () {
      return _displayPolicySchemas.ActiveSessionDisplayPolicyInputSchema;
    }
  });
  Object.defineProperty(exports, "ActiveSessionDisplayPolicySchema", {
    enumerable: true,
    get: function () {
      return _displayPolicySchemas.ActiveSessionDisplayPolicySchema;
    }
  });
  Object.defineProperty(exports, "COMPLETION_REWARD_EFFECTS", {
    enumerable: true,
    get: function () {
      return _displayPolicySchemas.COMPLETION_REWARD_EFFECTS;
    }
  });
  Object.defineProperty(exports, "normalizeActiveSessionGoal", {
    enumerable: true,
    get: function () {
      return _displayPolicySchemas.normalizeActiveSessionGoal;
    }
  });
  Object.defineProperty(exports, "normalizeActiveSessionMotivationStyle", {
    enumerable: true,
    get: function () {
      return _displayPolicySchemas.normalizeActiveSessionMotivationStyle;
    }
  });
  Object.defineProperty(exports, "getActiveSessionTargetLabel", {
    enumerable: true,
    get: function () {
      return _displayPolicySchemas.getActiveSessionTargetLabel;
    }
  });
  Object.defineProperty(exports, "toLaneSessionMode", {
    enumerable: true,
    get: function () {
      return _displayPolicySchemas.toLaneSessionMode;
    }
  });
  Object.defineProperty(exports, "resolveActiveSessionDisplayPolicy", {
    enumerable: true,
    get: function () {
      return _displayPolicyResolver.resolveActiveSessionDisplayPolicy;
    }
  });
  var _displayPolicySchemas = require(_dependencyMap[0]);
  var _displayPolicyResolver = require(_dependencyMap[1]);
},3440,[3441,3442]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "ActiveSessionDisplayPolicyInputSchema", {
    enumerable: true,
    get: function () {
      return ActiveSessionDisplayPolicyInputSchema;
    }
  });
  Object.defineProperty(exports, "ActiveSessionDisplayPolicySchema", {
    enumerable: true,
    get: function () {
      return ActiveSessionDisplayPolicySchema;
    }
  });
  Object.defineProperty(exports, "COMPLETION_REWARD_EFFECTS", {
    enumerable: true,
    get: function () {
      return COMPLETION_REWARD_EFFECTS;
    }
  });
  exports.normalizeActiveSessionGoal = normalizeActiveSessionGoal;
  exports.normalizeActiveSessionMotivationStyle = normalizeActiveSessionMotivationStyle;
  exports.getActiveSessionTargetLabel = getActiveSessionTargetLabel;
  exports.toLaneSessionMode = toLaneSessionMode;
  var _zod = require(_dependencyMap[0]);
  var _sessionModes = require(_dependencyMap[1]);
  var _featuresLaneEngineSchemas = require(_dependencyMap[2]);
  const MotivationStyleSchema = _zod.z.enum(['calm', 'friendly', 'coach_led', 'study_focused', 'game_like', 'intense']);
  const PrimaryGoalSchema = _zod.z.enum(['focus', 'study', 'work', 'creative', 'personal', 'learning', 'personal_growth']);
  const BossIntensitySchema = _zod.z.enum(['hidden', 'subtle', 'tiny_tease', 'visible']);
  const FocusStageSchema = _zod.z.enum(['active', 'paused', 'interruption', 'completion']);
  const HeroDensitySchema = _zod.z.enum(['minimal', 'standard', 'rich']);
  const ActiveSessionDisplayPolicyInputSchema = _zod.z.object({
    bossIntensity: BossIntensitySchema.nullish(),
    firstWeekStage: _zod.z.string().nullish(),
    focusStage: FocusStageSchema,
    laneProfile: _featuresLaneEngineSchemas.LaneProfileSchema.nullish(),
    motivationStyle: MotivationStyleSchema.nullish(),
    plannedQuizBreakOptedIn: _zod.z.boolean().optional(),
    primaryGoal: PrimaryGoalSchema.nullish(),
    sessionMode: _zod.z.nativeEnum(_sessionModes.SessionMode),
    studyLayerLabel: _zod.z.string().nullish()
  }).strict();
  const ActiveSessionDisplayPolicySchema = _zod.z.object({
    heroDensity: HeroDensitySchema,
    showBossHUD: _zod.z.boolean(),
    showBossTinyIndicator: _zod.z.boolean(),
    showCoachBanner: _zod.z.boolean(),
    showCompanionLayer: _zod.z.boolean(),
    showContractReminder: _zod.z.boolean(),
    showDailyProgress: _zod.z.boolean(),
    showModeOverlay: _zod.z.boolean(),
    showMomentumScore: _zod.z.boolean(),
    showPurityScore: _zod.z.boolean(),
    showStudyTarget: _zod.z.boolean()
  }).strict();
  const COMPLETION_REWARD_EFFECTS = ['boss_damage_reveal', 'xp_explosion', 'chest_reward_animation', 'coach_reflection'];
  function normalizeActiveSessionGoal(goal) {
    switch (goal) {
      case 'STUDY':
        return 'study';
      case 'WORK':
        return 'work';
      case 'CREATIVE':
        return 'creative';
      case 'PERSONAL':
        return 'personal';
      case 'LEARNING':
        return 'learning';
      default:
        return 'focus';
    }
  }
  function normalizeActiveSessionMotivationStyle(style) {
    switch (style) {
      case 'friendly':
      case 'coach_led':
      case 'study_focused':
      case 'game_like':
      case 'intense':
        return style;
      case 'student':
        return 'study_focused';
      case 'competitive':
        return 'game_like';
      case 'worker':
        return 'coach_led';
      default:
        return 'calm';
    }
  }
  function getActiveSessionTargetLabel(goal, currentMode) {
    if (currentMode === _sessionModes.SessionMode.STUDY || goal === 'STUDY') {
      return 'Study target';
    }
    if (goal === 'LEARNING') {
      return 'Learning target';
    }
    return 'Session target';
  }

  /**
   * Maps VEX SessionMode enum to lane-engine's string-based session mode
   * for lane profile resolution. Only the 6 modes lane-engine understands.
   */
  function toLaneSessionMode(mode) {
    switch (mode) {
      case _sessionModes.SessionMode.STUDY:
        return 'STUDY';
      case _sessionModes.SessionMode.DEEP_WORK:
        return 'DEEP_WORK';
      case _sessionModes.SessionMode.SPRINT:
        return 'SPRINT';
      case _sessionModes.SessionMode.CREATIVE:
        return 'CREATIVE';
      case _sessionModes.SessionMode.RECOVERY:
        return 'RECOVERY';
      default:
        return 'FOCUS';
    }
  }
},3441,[1774,1829,1889]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.resolveActiveSessionDisplayPolicy = resolveActiveSessionDisplayPolicy;
  var _sessionModes = require(_dependencyMap[0]);
  var _displayPolicySchemas = require(_dependencyMap[1]);
  function isStudyInput(input) {
    if (input.laneProfile) {
      return input.laneProfile.primaryLane === 'student';
    }
    return input.sessionMode === _sessionModes.SessionMode.STUDY || input.motivationStyle === 'study_focused' || input.primaryGoal === 'study' || input.primaryGoal === 'learning';
  }
  function isGameLikeInput(input) {
    if (input.laneProfile) {
      return input.laneProfile.primaryLane === 'game_like';
    }
    return input.motivationStyle === 'game_like' || input.motivationStyle === 'intense';
  }
  function isCleanInput(input) {
    if (input.laneProfile) {
      return input.laneProfile.primaryLane === 'minimal_normal';
    }
    return input.motivationStyle === 'calm' && input.primaryGoal !== 'study' && input.primaryGoal !== 'learning';
  }
  function isProjectInput(input) {
    if (input.laneProfile) {
      return input.laneProfile.primaryLane === 'deep_creative';
    }
    return input.sessionMode === _sessionModes.SessionMode.CREATIVE && input.motivationStyle !== 'game_like' && input.motivationStyle !== 'intense';
  }
  function resolveActiveSessionDisplayPolicy(rawInput) {
    const input = _displayPolicySchemas.ActiveSessionDisplayPolicyInputSchema.parse(rawInput);
    const isPausedOrInterrupted = input.focusStage === 'paused' || input.focusStage === 'interruption';
    const isActiveFocus = input.focusStage === 'active';
    const isStudy = isStudyInput(input);
    const isGameLike = isGameLikeInput(input);
    const isClean = isCleanInput(input);
    const isProject = isProjectInput(input);
    const bossVisible = input.bossIntensity !== 'hidden';
    const plannedQuizBreakVisible = isStudy && input.plannedQuizBreakOptedIn === true && isPausedOrInterrupted;
    return _displayPolicySchemas.ActiveSessionDisplayPolicySchema.parse({
      heroDensity: isPausedOrInterrupted ? 'standard' : isClean ? 'minimal' : isProject ? 'minimal' : isGameLike ? 'standard' : 'minimal',
      showBossHUD: false,
      showBossTinyIndicator: isGameLike && bossVisible && isActiveFocus,
      showCoachBanner: isPausedOrInterrupted && (input.motivationStyle === 'coach_led' || isClean),
      showCompanionLayer: isPausedOrInterrupted && !isStudy && !isClean,
      showContractReminder: isPausedOrInterrupted && !isClean,
      showDailyProgress: isPausedOrInterrupted && !isClean,
      showModeOverlay: plannedQuizBreakVisible,
      showMomentumScore: isGameLike && isPausedOrInterrupted,
      showPurityScore: false,
      showStudyTarget: isStudy && isActiveFocus
    });
  }
},3442,[1829,3441]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "ActiveSessionHeroViewModelSchema", {
    enumerable: true,
    get: function () {
      return ActiveSessionHeroViewModelSchema;
    }
  });
  exports.buildActiveSessionHeroViewModel = buildActiveSessionHeroViewModel;
  var _zod = require(_dependencyMap[0]);
  const SignalPillSchema = _zod.z.object({
    type: _zod.z.enum(['boss', 'focus']),
    label: _zod.z.string()
  });
  const ActiveSessionHeroViewModelSchema = _zod.z.object({
    phaseIcon: _zod.z.enum(['clock', 'target']),
    phaseLabel: _zod.z.string(),
    phaseAccent: _zod.z.string(),
    studyTargetLabel: _zod.z.string().nullable(),
    completionPercentage: _zod.z.number(),
    elapsedSeconds: _zod.z.number(),
    remainingSeconds: _zod.z.number(),
    signalPill: SignalPillSchema.nullable(),
    momentumScores: _zod.z.array(_zod.z.number()).nullable(),
    dailyProgress: _zod.z.number().nullable(),
    todayFocusSeconds: _zod.z.number().nullable(),
    showPurityScore: _zod.z.boolean(),
    perfectFocusActive: _zod.z.boolean(),
    purityScore: _zod.z.number(),
    purityLabel: _zod.z.enum(['Elite', 'Good', 'Okay', 'Distracted']),
    streakMultiplier: _zod.z.number(),
    heroDensity: _zod.z.enum(['minimal', 'standard', 'rich']),
    laneAccent: _zod.z.string(),
    secondaryInfo: _zod.z.string().nullable(),
    isReducedMotion: _zod.z.boolean()
  });
  function buildSignalPill(displayPolicy, perfectFocusActive) {
    if (displayPolicy.showBossTinyIndicator) {
      return {
        type: 'boss',
        label: 'Challenge waiting'
      };
    }
    if (perfectFocusActive && displayPolicy.heroDensity !== 'minimal') {
      return {
        type: 'focus',
        label: 'Clean focus'
      };
    }
    return null;
  }
  function buildActiveSessionHeroViewModel(input) {
    const secondaryInfo = buildSecondaryInfo(input.lanePresentation);
    return {
      phaseIcon: input.phaseIcon,
      phaseLabel: input.phaseLabel,
      phaseAccent: input.phaseAccent,
      studyTargetLabel: input.displayPolicy.showStudyTarget ? input.studyTargetLabel : null,
      completionPercentage: input.completionPercentage,
      elapsedSeconds: input.elapsedSeconds,
      remainingSeconds: input.remainingSeconds,
      signalPill: buildSignalPill(input.displayPolicy, input.perfectFocusActive),
      momentumScores: input.displayPolicy.showMomentumScore ? input.momentumScores : null,
      dailyProgress: input.displayPolicy.showDailyProgress ? input.dailyProgress : null,
      todayFocusSeconds: input.displayPolicy.showDailyProgress ? input.todayFocusSeconds : null,
      showPurityScore: input.displayPolicy.showPurityScore,
      perfectFocusActive: input.displayPolicy.showPurityScore ? input.perfectFocusActive : false,
      purityScore: input.purityScore,
      purityLabel: input.purityLabel,
      streakMultiplier: input.streakMultiplier,
      heroDensity: input.displayPolicy.heroDensity,
      laneAccent: input.lanePresentation?.visualFeeling ?? 'quiet_planner',
      secondaryInfo,
      isReducedMotion: input.isReducedMotion
    };
  }
  function buildSecondaryInfo(lanePresentation) {
    if (!lanePresentation) {
      return null;
    }
    switch (lanePresentation.lane) {
      case 'deep_creative':
        return 'Next move';
      case 'student':
        return null;
      case 'game_like':
        return null;
      case 'minimal_normal':
        return null;
      default:
        return null;
    }
  }
},3443,[1774]);
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
  Object.defineProperty(exports, "ActiveSessionContent", {
    enumerable: true,
    get: function () {
      return ActiveSessionContent;
    }
  });
  var _react = require(_dependencyMap[0]);
  var React = _interopDefault(_react);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _sessionComponentsCompanionSessionLayer = require(_dependencyMap[2]);
  var _sessionComponentsDeepWorkVignette = require(_dependencyMap[3]);
  var _sessionModes = require(_dependencyMap[4]);
  var _componentsActiveSessionBackground = require(_dependencyMap[5]);
  var _componentsActiveSessionHeader = require(_dependencyMap[6]);
  var _componentsActiveSessionHero = require(_dependencyMap[7]);
  var _componentsActiveSessionModeOverlays = require(_dependencyMap[8]);
  var _componentsCoachSessionBannerLazy = require(_dependencyMap[9]);
  var _ActiveSessionBottomControls = require(_dependencyMap[10]);
  var _featuresModeNativeComponentsModeRescueSurface = require(_dependencyMap[11]);
  var _networkUseNetInfo = require(_dependencyMap[12]);
  var _ActiveSessionContentTypes = require(_dependencyMap[13]);
  var _useSessionControlHandlers = require(_dependencyMap[14]);
  var _SessionNotices = require(_dependencyMap[15]);
  var _reactJsxRuntime = require(_dependencyMap[16]);
  function ActiveSessionContentRaw({
    controller,
    contract,
    currentMode,
    lane,
    displayPolicy,
    heroViewModel,
    outerStrokeDashoffset,
    focusStage,
    studyQuizBreak,
    plannedQuizBreakOptedIn
  }) {
    const {
      actions,
      companion,
      controlFailure,
      metrics,
      sessionQuery,
      showInterruption,
      showMultiplierInfo,
      streak,
      theme,
      themeBackgroundColor,
      userId
    } = controller;
    const {
      isOffline
    } = (0, _networkUseNetInfo.useNetInfo)();
    const activeSession = sessionQuery.session;
    const handlers = (0, _useSessionControlHandlers.useSessionControlHandlers)(actions, showMultiplierInfo, studyQuizBreak);
    if (!activeSession) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        flex: 1,
        bg: "background.primary"
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      bg: "background.primary",
      style: {
        backgroundColor: themeBackgroundColor
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsActiveSessionBackground.ActiveSessionBackground, {
        accentOverlay: metrics.withAlpha(metrics.phaseAccent, 0.06),
        accentColor: metrics.phaseAccent,
        colors: [metrics.gradientState.top, metrics.gradientState.middle, metrics.gradientState.bottom]
      }), currentMode === _sessionModes.SessionMode.DEEP_WORK && focusStage !== 'active' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sessionComponentsDeepWorkVignette.DeepWorkVignette, {}) : null, _ActiveSessionContentTypes.ENABLE_SESSION_COMPANION_LAYER && displayPolicy.showCompanionLayer && companion.state && currentMode !== _sessionModes.SessionMode.DEEP_WORK ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sessionComponentsCompanionSessionLayer.CompanionSessionLayer, {
        companionState: companion.state,
        elapsedSeconds: sessionQuery.elapsedSeconds,
        eventLabel: companion.eventLabel,
        isPaused: sessionQuery.isPaused,
        purityScore: metrics.purityScore,
        sessionProgress: companion.sessionProgress,
        totalSeconds: Math.max(activeSession.config.duration, sessionQuery.elapsedSeconds + sessionQuery.remainingSeconds, 1)
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsActiveSessionHeader.ActiveSessionHeader, {
        isPaused: sessionQuery.isPaused,
        theme: theme,
        onInterrupt: () => actions.setShowInterruption(true)
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresModeNativeComponentsModeRescueSurface.ModeActiveIndicatorBar, {
        lane: lane,
        completionPercentage: sessionQuery.completionPercentage
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionNotices.SessionNotices, {
        isOffline: isOffline,
        showContractReminder: displayPolicy.showContractReminder,
        contract: contract,
        completionPercentage: sessionQuery.completionPercentage
      }), _ActiveSessionContentTypes.ENABLE_SESSION_MODE_OVERLAYS && displayPolicy.showModeOverlay ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsActiveSessionModeOverlays.ActiveSessionModeOverlays, {
        allowStudyQuizBreak: plannedQuizBreakOptedIn,
        chainCount: activeSession.config.sprintChainCount ?? 0,
        completionPercentage: sessionQuery.completionPercentage,
        currentMode: currentMode,
        displayPolicy: displayPolicy,
        isPaused: sessionQuery.isPaused,
        quizBreakKey: studyQuizBreak.quizBreakKey,
        remainingSeconds: sessionQuery.remainingSeconds,
        studyPlanId: activeSession.config.studyPlanId,
        onCloseQuiz: correctAnswers => {
          studyQuizBreak.finishQuizBreak(correctAnswers);
        },
        onCreativeMoodSelected: actions.handleCreativeMoodSelected,
        onSkipCreativeMood: actions.handleSkipCreativeMood,
        onSkipQuiz: () => {
          studyQuizBreak.finishQuizBreak();
        }
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsCoachSessionBannerLazy.CoachSessionBannerLazy, {
        userId: userId,
        showCoachBanner: _ActiveSessionContentTypes.ENABLE_SESSION_COACH_BANNER && displayPolicy.showCoachBanner,
        elapsedSeconds: sessionQuery.elapsedSeconds,
        isPaused: sessionQuery.isPaused
      }), _ActiveSessionContentTypes.ENABLE_SESSION_HERO && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsActiveSessionHero.ActiveSessionHero, {
        viewModel: heroViewModel,
        progressRingProps: {
          CIRCUMFERENCE: metrics.CIRCUMFERENCE,
          RADIUS: metrics.RADIUS,
          RING_SIZE: metrics.RING_SIZE,
          STROKE_WIDTH: metrics.STROKE_WIDTH,
          animatedCircleProps: metrics.animatedCircleProps,
          glowStyle: metrics.glowStyle,
          outerStrokeDashoffset,
          perfectFocusBurst: metrics.perfectFocusBurst,
          pulseStyle: metrics.pulseStyle,
          rotatingPerfectFocusStyle: metrics.rotatingPerfectFocusStyle,
          labelColor: metrics.labelColor,
          withAlpha: metrics.withAlpha
        },
        themeColors: {
          error: theme.colors.error.DEFAULT,
          inverse: theme.colors.text.inverse,
          primary300: theme.colors.primary[300],
          success: theme.colors.success.DEFAULT,
          warning: theme.colors.warning.light
        },
        isReducedMotion: heroViewModel.isReducedMotion
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_ActiveSessionBottomControls.ActiveSessionBottomControls, {
        controlFailure: controlFailure,
        completionPercentage: sessionQuery.completionPercentage,
        isPaused: sessionQuery.isPaused,
        multiplierDays: streak?.currentDays ?? 0,
        phaseAccent: metrics.phaseAccent,
        showMultiplierInfo: showMultiplierInfo,
        streakMultiplier: metrics.streakMultiplier,
        showInterruption: showInterruption,
        elapsedSeconds: sessionQuery.elapsedSeconds,
        theme: theme,
        onClearControlFailure: handlers.onClearControlFailure,
        onRetryControlFailure: handlers.onRetryControlFailure,
        onComplete: handlers.onComplete,
        onEnd: handlers.onEnd,
        onPauseResume: handlers.onPauseResume,
        onToggleMultiplierInfo: handlers.onToggleMultiplierInfo,
        onResume: handlers.onResume,
        onAbandon: handlers.onAbandon
      })]
    });
  }
  const ActiveSessionContent = /*#__PURE__*/React.default.memo(ActiveSessionContentRaw);
},3444,[12,1462,3445,3453,1829,3454,3455,3456,3463,3467,3469,3475,2173,3476,3477,3478,203]);
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
  exports.CompanionSessionLayer = CompanionSessionLayer;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _featuresCompanionComponentsLivingCompanion = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _themeThemeContext = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  function CompanionSessionLayer({
    companionState,
    elapsedSeconds,
    eventLabel,
    isPaused,
    purityScore,
    sessionProgress,
    totalSeconds
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      pointerEvents: "none",
      style: {
        alignItems: 'center',
        bottom: theme.spacing[24],
        justifyContent: 'center',
        left: 0,
        opacity: 0.55,
        position: 'absolute',
        right: 0,
        top: theme.spacing[16],
        zIndex: 0
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: {
          transform: [{
            scale: 1.12
          }]
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresCompanionComponentsLivingCompanion.LivingCompanion, {
          companionState: companionState,
          elapsedSeconds: elapsedSeconds,
          isPaused: isPaused,
          purityScore: purityScore,
          sessionProgress: sessionProgress,
          totalSeconds: totalSeconds
        })
      }), eventLabel ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        entering: _reactNativeReanimated.FadeIn.duration(140),
        exiting: _reactNativeReanimated.FadeOut.duration(180),
        style: {
          backgroundColor: theme.colors.background.overlay,
          borderColor: theme.colors.border.light,
          borderRadius: theme.spacing[6],
          borderWidth: 1,
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[2],
          position: 'absolute',
          top: theme.spacing[10]
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          color: theme.colors.text.inverse,
          children: eventLabel
        })
      }) : null]
    });
  }
},3445,[12,80,226,3446,1489,1463,203]);
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
  Object.defineProperty(exports, "COMPANION_SIZE", {
    enumerable: true,
    get: function () {
      return _LivingCompanionStyles.COMPANION_SIZE;
    }
  });
  Object.defineProperty(exports, "PARTICLE_COUNT", {
    enumerable: true,
    get: function () {
      return _LivingCompanionStyles.PARTICLE_COUNT;
    }
  });
  Object.defineProperty(exports, "companionStyles", {
    enumerable: true,
    get: function () {
      return _LivingCompanionStyles.companionStyles;
    }
  });
  Object.defineProperty(exports, "LivingCompanion", {
    enumerable: true,
    get: function () {
      return LivingCompanion;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _reactNativeSvg = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _types = require(_dependencyMap[5]);
  var _serviceInstance = require(_dependencyMap[6]);
  var _CompanionBody = require(_dependencyMap[7]);
  var _CompanionParticles = require(_dependencyMap[8]);
  var _MoodIndicator = require(_dependencyMap[9]);
  var _LivingCompanionStyles = require(_dependencyMap[10]);
  var _reactJsxRuntime = require(_dependencyMap[11]);
  const PHASE_MULTIPLIERS = {
    EGG: 0.5,
    HATCHING: 0.7,
    YOUNG: 0.85,
    MATURE: 1,
    AWAKENED: 1.2,
    TRANSCENDENT: 1.5
  };
  const _worklet_943299141064_init_data = {
    code: "function LivingCompanionTsx1(){const{interpolate,pulsePhase,energy,scale}=this.__closure;const breathing=interpolate(pulsePhase.value,[0,1],[0.98,1.02]);const energyPulse=interpolate(energy.value,[0,1],[0.95,1.1]);return{transform:[{scale:scale.value*breathing*energyPulse}],opacity:interpolate(energy.value,[0,0.2],[0.3,1])};}"
  };
  const _worklet_4651265416619_init_data = {
    code: "function LivingCompanionTsx2(){const{interpolate,glowIntensity,pulsePhase}=this.__closure;return{opacity:interpolate(glowIntensity.value,[0,1],[0.2,0.8]),transform:[{scale:interpolate(pulsePhase.value,[0,1],[1,1.2])}]};}"
  };
  const _worklet_247968501570_init_data = {
    code: "function LivingCompanionTsx3(){const{particlePhase}=this.__closure;return{transform:[{rotate:particlePhase.value*360+\"deg\"}]};}"
  };
  const LivingCompanion = ({
    companionState,
    sessionProgress,
    purityScore,
    elapsedSeconds,
    totalSeconds,
    isPaused,
    onMilestone
  }) => {
    const serviceRef = (0, _react.useRef)(null);
    const progress = (0, _reactNativeReanimated.useSharedValue)(0);
    const energy = (0, _reactNativeReanimated.useSharedValue)(0);
    const scale = (0, _reactNativeReanimated.useSharedValue)(1);
    const pulsePhase = (0, _reactNativeReanimated.useSharedValue)(0);
    const glowIntensity = (0, _reactNativeReanimated.useSharedValue)(0.5);
    const particlePhase = (0, _reactNativeReanimated.useSharedValue)(0);
    (0, _react.useEffect)(() => {
      serviceRef.current = (0, _serviceInstance.getCompanionService)(companionState);
      serviceRef.current.startSession(totalSeconds / 60);
      const unsubscribe = serviceRef.current.onEvent(event => {
        if (event.type === 'MILESTONE' && event.data.progressDelta && onMilestone) {
          onMilestone(event.data.progressDelta);
        }
        if (event.type === 'PURE_FOCUS_BURST') {
          scale.value = (0, _reactNativeReanimated.withSequence)((0, _reactNativeReanimated.withSpring)(1.3, {
            damping: 10
          }), (0, _reactNativeReanimated.withSpring)(1, {
            damping: 15
          }));
          glowIntensity.value = (0, _reactNativeReanimated.withSequence)((0, _reactNativeReanimated.withTiming)(1, {
            duration: 200
          }), (0, _reactNativeReanimated.withTiming)(0.7, {
            duration: 1000
          }));
        }
        if (event.type === 'DANGER_WARN') {
          scale.value = (0, _reactNativeReanimated.withRepeat)((0, _reactNativeReanimated.withSequence)((0, _reactNativeReanimated.withSpring)(0.95, {
            damping: 5
          }), (0, _reactNativeReanimated.withSpring)(1.05, {
            damping: 5
          })), 3);
        }
      });
      return () => {
        unsubscribe();
      };
    }, [companionState, glowIntensity, onMilestone, scale, totalSeconds]);
    (0, _react.useEffect)(() => {
      if (serviceRef.current && !isPaused) {
        serviceRef.current.tick(elapsedSeconds, totalSeconds, purityScore, isPaused);
      }
    }, [elapsedSeconds, isPaused, purityScore, totalSeconds]);
    (0, _react.useEffect)(() => {
      progress.value = (0, _reactNativeReanimated.withSpring)(sessionProgress / 100, {
        damping: 20
      });
      energy.value = (0, _reactNativeReanimated.withSpring)(purityScore / 100, {
        damping: 15
      });
    }, [energy, progress, purityScore, sessionProgress]);
    (0, _react.useEffect)(() => {
      pulsePhase.value = (0, _reactNativeReanimated.withRepeat)((0, _reactNativeReanimated.withTiming)(1, {
        duration: 3000,
        easing: _reactNativeReanimated.Easing.inOut(_reactNativeReanimated.Easing.sin)
      }), -1, true);
      particlePhase.value = (0, _reactNativeReanimated.withRepeat)((0, _reactNativeReanimated.withTiming)(1, {
        duration: 10000,
        easing: _reactNativeReanimated.Easing.linear
      }), -1, false);
    }, [particlePhase, pulsePhase]);
    const theme = _types.ELEMENT_THEMES[companionState.element];
    const phaseMultiplier = PHASE_MULTIPLIERS[companionState.phase];
    const companionStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function LivingCompanionTsx1Factory({
      _worklet_943299141064_init_data,
      interpolate,
      pulsePhase,
      energy,
      scale
    }) {
      const LivingCompanionTsx1 = function () {
        const breathing = interpolate(pulsePhase.value, [0, 1], [0.98, 1.02]);
        const energyPulse = interpolate(energy.value, [0, 1], [0.95, 1.1]);
        return {
          transform: [{
            scale: scale.value * breathing * energyPulse
          }],
          opacity: interpolate(energy.value, [0, 0.2], [0.3, 1])
        };
      };
      LivingCompanionTsx1.__closure = {
        interpolate,
        pulsePhase,
        energy,
        scale
      };
      LivingCompanionTsx1.__workletHash = 943299141064;
      LivingCompanionTsx1.__initData = _worklet_943299141064_init_data;
      return LivingCompanionTsx1;
    }({
      _worklet_943299141064_init_data,
      interpolate: _reactNativeReanimated.interpolate,
      pulsePhase,
      energy,
      scale
    }));
    const glowStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function LivingCompanionTsx2Factory({
      _worklet_4651265416619_init_data,
      interpolate,
      glowIntensity,
      pulsePhase
    }) {
      const LivingCompanionTsx2 = () => ({
        opacity: interpolate(glowIntensity.value, [0, 1], [0.2, 0.8]),
        transform: [{
          scale: interpolate(pulsePhase.value, [0, 1], [1, 1.2])
        }]
      });
      LivingCompanionTsx2.__closure = {
        interpolate,
        glowIntensity,
        pulsePhase
      };
      LivingCompanionTsx2.__workletHash = 4651265416619;
      LivingCompanionTsx2.__initData = _worklet_4651265416619_init_data;
      return LivingCompanionTsx2;
    }({
      _worklet_4651265416619_init_data,
      interpolate: _reactNativeReanimated.interpolate,
      glowIntensity,
      pulsePhase
    }));
    const particleContainerStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function LivingCompanionTsx3Factory({
      _worklet_247968501570_init_data,
      particlePhase
    }) {
      const LivingCompanionTsx3 = () => ({
        transform: [{
          rotate: `${particlePhase.value * 360}deg`
        }]
      });
      LivingCompanionTsx3.__closure = {
        particlePhase
      };
      LivingCompanionTsx3.__workletHash = 247968501570;
      LivingCompanionTsx3.__initData = _worklet_247968501570_init_data;
      return LivingCompanionTsx3;
    }({
      _worklet_247968501570_init_data,
      particlePhase
    }));
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: _LivingCompanionStyles.companionStyles.container,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        style: [_LivingCompanionStyles.companionStyles.glowContainer, glowStyle, {
          backgroundColor: theme.glow,
          width: _LivingCompanionStyles.COMPANION_SIZE * 1.5,
          height: _LivingCompanionStyles.COMPANION_SIZE * 1.5,
          borderRadius: _LivingCompanionStyles.COMPANION_SIZE * 0.75
        }]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_CompanionParticles.CompanionParticles, {
        count: _LivingCompanionStyles.PARTICLE_COUNT,
        companionSize: _LivingCompanionStyles.COMPANION_SIZE,
        theme: theme,
        particleContainerStyle: particleContainerStyle
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        style: [_LivingCompanionStyles.companionStyles.companionContainer, companionStyle],
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Svg, {
          width: _LivingCompanionStyles.COMPANION_SIZE,
          height: _LivingCompanionStyles.COMPANION_SIZE,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactNativeSvg.G, {
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_CompanionBody.CompanionBody, {
              phase: companionState.phase,
              theme: theme,
              size: _LivingCompanionStyles.COMPANION_SIZE
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
              cx: _LivingCompanionStyles.COMPANION_SIZE / 2,
              cy: _LivingCompanionStyles.COMPANION_SIZE / 2,
              r: _LivingCompanionStyles.COMPANION_SIZE * 0.15 * phaseMultiplier,
              fill: theme.primary,
              opacity: 0.9
            })]
          })
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _LivingCompanionStyles.companionStyles.statusContainer,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_MoodIndicator.MoodIndicator, {
          mood: companionState.currentMood
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "caption",
          style: _LivingCompanionStyles.companionStyles.phaseText,
          children: [companionState.phase, " Level ", companionState.level]
        })]
      })]
    });
  };
},3446,[12,80,226,1643,1489,3542,3447,3448,3449,3450,3452,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getCompanionService = getCompanionService;
  exports.clearCompanionService = clearCompanionService;
  var _service = require(_dependencyMap[0]);
  let activeCompanionService = null;
  function getCompanionService(state) {
    if (!activeCompanionService || state) {
      activeCompanionService = new _service.CompanionService(state);
    }
    return activeCompanionService;
  }
  function clearCompanionService() {
    activeCompanionService = null;
  }
},3447,[3308]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "CompanionBody", {
    enumerable: true,
    get: function () {
      return CompanionBody;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeSvg = require(_dependencyMap[1]);
  var _reactJsxRuntime = require(_dependencyMap[2]);
  const CompanionBody = ({
    phase,
    theme,
    size
  }) => {
    const radius = size * 0.4;
    const center = size / 2;
    switch (phase) {
      case 'EGG':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactNativeSvg.RadialGradient, {
            id: "eggGradient",
            cx: center,
            cy: center,
            rx: radius,
            ry: radius * 1.2,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "0%",
              stopColor: theme.primary,
              stopOpacity: "0.8"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "100%",
              stopColor: theme.secondary,
              stopOpacity: "0.3"
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
            cx: center,
            cy: center,
            r: radius,
            fill: "url(#eggGradient)"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
            cx: center,
            cy: center,
            r: radius * 0.35,
            fill: theme.glow,
            opacity: "0.5"
          })]
        });
      case 'HATCHING':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactNativeSvg.RadialGradient, {
            id: "hatchGradient",
            cx: center,
            cy: center,
            rx: radius,
            ry: radius,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "0%",
              stopColor: theme.glow,
              stopOpacity: "0.9"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "60%",
              stopColor: theme.primary,
              stopOpacity: "0.6"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "100%",
              stopColor: theme.secondary,
              stopOpacity: "0.2"
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
            cx: center,
            cy: center,
            r: radius,
            fill: "url(#hatchGradient)"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
            cx: center - radius * 0.3,
            cy: center - radius * 0.2,
            r: 2,
            fill: theme.primary
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
            cx: center + radius * 0.2,
            cy: center + radius * 0.3,
            r: 1.5,
            fill: theme.primary
          })]
        });
      case 'YOUNG':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactNativeSvg.RadialGradient, {
            id: "youngGradient",
            cx: center,
            cy: center,
            rx: radius * 0.8,
            ry: radius * 0.8,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "0%",
              stopColor: theme.glow,
              stopOpacity: "1"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "100%",
              stopColor: theme.primary,
              stopOpacity: "0.4"
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
            cx: center,
            cy: center,
            r: radius * 0.8,
            fill: "url(#youngGradient)"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
            cx: center - 8,
            cy: center - 5,
            r: 3,
            fill: theme.glow,
            opacity: 0.9
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
            cx: center + 8,
            cy: center - 5,
            r: 3,
            fill: theme.glow,
            opacity: 0.9
          })]
        });
      case 'MATURE':
      case 'AWAKENED':
      case 'TRANSCENDENT':
        return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactNativeSvg.RadialGradient, {
            id: "matureGradient",
            cx: center,
            cy: center,
            rx: radius,
            ry: radius,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "0%",
              stopColor: theme.glow,
              stopOpacity: "1"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "30%",
              stopColor: theme.primary,
              stopOpacity: "0.8"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "70%",
              stopColor: theme.secondary,
              stopOpacity: "0.4"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "100%",
              stopColor: theme.primary,
              stopOpacity: "0.1"
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
            cx: center,
            cy: center,
            r: radius,
            fill: "url(#matureGradient)"
          }), phase !== 'MATURE' && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
              cx: center - radius * 0.5,
              cy: center - radius * 0.3,
              r: 4,
              fill: theme.glow
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
              cx: center + radius * 0.5,
              cy: center - radius * 0.3,
              r: 4,
              fill: theme.glow
            })]
          })]
        });
    }
  };
},3448,[12,1643,203]);
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
  Object.defineProperty(exports, "CompanionParticles", {
    enumerable: true,
    get: function () {
      return CompanionParticles;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  const CompanionParticles = ({
    count,
    companionSize,
    theme,
    particleContainerStyle
  }) => {
    const particles = (0, _react.useMemo)(() => {
      return Array.from({
        length: count
      }, (_, index) => {
        const angle = index / count * Math.PI * 2;
        const distance = companionSize * 0.6 + index % 3 * 20;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const size = 4 + index % 4 * 2;
        return {
          key: index,
          size,
          left: companionSize / 2 + x - size / 2,
          top: companionSize / 2 + y - size / 2,
          opacity: 0.6 + index % 3 * 0.15
        };
      });
    }, [count, companionSize]);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      style: [{
        position: 'absolute',
        width: '100%',
        height: '100%'
      }, particleContainerStyle],
      children: particles.map(p => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: {}
      }, p.key))
    });
  };
},3449,[12,80,226,203]);
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
  exports.MoodIndicator = MoodIndicator;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _hooksUseReducedMotion = require(_dependencyMap[4]);
  var _themeThemeContext = require(_dependencyMap[5]);
  var _themeTokensElevation = require(_dependencyMap[6]);
  var _themeTokensMotion = require(_dependencyMap[7]);
  var _moodVisual = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  const _worklet_5596594620030_init_data = {
    code: "function MoodIndicatorTsx1(){const{animated,interpolate,phase,restOpacity}=this.__closure;return{opacity:animated?interpolate(phase.value,[0,1],[restOpacity*0.7,1]):restOpacity,transform:[{scale:animated?interpolate(phase.value,[0,1],[0.9,1.12]):1}]};}"
  };
  const _worklet_6167572041094_init_data = {
    code: "function MoodIndicatorTsx2(){const{visual,interpolate,phase}=this.__closure;return{opacity:visual.shape==='alert'||visual.shape==='radiant'?interpolate(phase.value,[0,1],[0.2,0.55]):0.28,transform:[{scale:interpolate(phase.value,[0,1],[1.2,1.7])}]};}"
  };
  function MoodIndicator({
    mood,
    size = 24,
    showLabel = true
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      isReducedMotion
    } = (0, _hooksUseReducedMotion.useReducedMotion)();
    const phase = (0, _reactNativeReanimated.useSharedValue)(0);
    const visual = (0, _moodVisual.getMoodVisual)(mood);
    const color = (0, _moodVisual.resolveMoodColor)(mood, theme.colors.semantic);
    const animated = visual.shape === 'pulse' || visual.shape === 'radiant';
    const restOpacity = visual.shape === 'dim' ? 0.45 : 0.85;
    (0, _react.useEffect)(() => {
      if (isReducedMotion || !animated) {
        (0, _reactNativeReanimated.cancelAnimation)(phase);
        phase.value = 0.5;
        return;
      }
      phase.value = (0, _reactNativeReanimated.withRepeat)((0, _reactNativeReanimated.withTiming)(1, {
        duration: visual.shape === 'radiant' ? 1800 : _themeTokensMotion.ambientLoop.breathing,
        easing: _reactNativeReanimated.Easing.inOut(_reactNativeReanimated.Easing.sin)
      }), -1, true);
      return () => (0, _reactNativeReanimated.cancelAnimation)(phase);
    }, [animated, isReducedMotion, phase, visual.shape]);
    const orbStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function MoodIndicatorTsx1Factory({
      _worklet_5596594620030_init_data,
      animated,
      interpolate,
      phase,
      restOpacity
    }) {
      const MoodIndicatorTsx1 = () => ({
        opacity: animated ? interpolate(phase.value, [0, 1], [restOpacity * 0.7, 1]) : restOpacity,
        transform: [{
          scale: animated ? interpolate(phase.value, [0, 1], [0.9, 1.12]) : 1
        }]
      });
      MoodIndicatorTsx1.__closure = {
        animated,
        interpolate,
        phase,
        restOpacity
      };
      MoodIndicatorTsx1.__workletHash = 5596594620030;
      MoodIndicatorTsx1.__initData = _worklet_5596594620030_init_data;
      return MoodIndicatorTsx1;
    }({
      _worklet_5596594620030_init_data,
      animated,
      interpolate: _reactNativeReanimated.interpolate,
      phase,
      restOpacity
    }));
    const ringStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function MoodIndicatorTsx2Factory({
      _worklet_6167572041094_init_data,
      visual,
      interpolate,
      phase
    }) {
      const MoodIndicatorTsx2 = () => ({
        opacity: visual.shape === 'alert' || visual.shape === 'radiant' ? interpolate(phase.value, [0, 1], [0.2, 0.55]) : 0.28,
        transform: [{
          scale: interpolate(phase.value, [0, 1], [1.2, 1.7])
        }]
      });
      MoodIndicatorTsx2.__closure = {
        visual,
        interpolate,
        phase
      };
      MoodIndicatorTsx2.__workletHash = 6167572041094;
      MoodIndicatorTsx2.__initData = _worklet_6167572041094_init_data;
      return MoodIndicatorTsx2;
    }({
      _worklet_6167572041094_init_data,
      visual,
      interpolate: _reactNativeReanimated.interpolate,
      phase
    }));
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[2]
      },
      accessibilityLabel: `Companion mood: ${visual.label}`,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center'
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          style: [{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: color
          }, ringStyle]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          style: [Object.assign({
            width: size * 0.62,
            height: size * 0.62,
            borderRadius: size * 0.31,
            backgroundColor: color
          }, (0, _themeTokensElevation.glow)(color, visual.glowTier)), orbStyle]
        })]
      }), showLabel ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "label",
        style: {
          color
        },
        children: visual.label
      }) : null]
    });
  }
},3450,[12,80,226,1489,1681,1463,2698,1682,3451,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getMoodVisual = getMoodVisual;
  exports.resolveMoodColor = resolveMoodColor;
  const MOOD_VISUALS = {
    SLEEPY: {
      label: 'Resting',
      shape: 'dim',
      glowTier: 'whisper',
      toneKey: 'textMuted'
    },
    CONTENT: {
      label: 'Settled',
      shape: 'soft',
      glowTier: 'whisper',
      toneKey: 'info'
    },
    FOCUSED: {
      label: 'Focused',
      shape: 'steady',
      glowTier: 'soft',
      toneKey: 'primary'
    },
    DETERMINED: {
      label: 'Determined',
      shape: 'pulse',
      glowTier: 'soft',
      toneKey: 'warning'
    },
    ECSTATIC: {
      label: 'Thriving',
      shape: 'radiant',
      glowTier: 'vivid',
      toneKey: 'success'
    },
    STRUGGLING: {
      label: 'Straining',
      shape: 'pulse',
      glowTier: 'soft',
      toneKey: 'warning'
    },
    DANGER: {
      label: 'At risk',
      shape: 'alert',
      glowTier: 'vivid',
      toneKey: 'danger'
    }
  };
  function getMoodVisual(mood) {
    return MOOD_VISUALS[mood];
  }
  function resolveMoodColor(mood, semantic) {
    return semantic[MOOD_VISUALS[mood].toneKey];
  }
},3451,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "COMPANION_SIZE", {
    enumerable: true,
    get: function () {
      return COMPANION_SIZE;
    }
  });
  Object.defineProperty(exports, "PARTICLE_COUNT", {
    enumerable: true,
    get: function () {
      return PARTICLE_COUNT;
    }
  });
  Object.defineProperty(exports, "companionStyles", {
    enumerable: true,
    get: function () {
      return companionStyles;
    }
  });
  var _sharedUiCreateSheet = require(_dependencyMap[0]);
  const COMPANION_SIZE = 260;
  const PARTICLE_COUNT = 12;
  const companionStyles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      width: COMPANION_SIZE,
      height: 320,
      alignItems: 'center',
      justifyContent: 'center'
    },
    glowContainer: {
      position: 'absolute',
      opacity: 0.3
    },
    companionContainer: {
      zIndex: 10
    },
    statusContainer: {
      position: 'absolute',
      bottom: 0,
      alignItems: 'center'
    },
    phaseText: {
      opacity: 0.6,
      marginTop: 4
    }
  });
},3452,[1678]);
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
  exports.DeepWorkVignette = DeepWorkVignette;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _expoLinearGradient = require(_dependencyMap[2]);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  /**
   * DeepWorkVignette
   * Full-screen dark edge overlay for DEEP_WORK mode.
   * Creates a tunnel-vision effect that signals "serious mode."
   * Pointer-events: none — does not intercept touches.
   */
  function DeepWorkVignette() {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      pointerEvents: "none",
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_expoLinearGradient.LinearGradient, {
        colors: ['rgba(0,0,0,0.45)', 'transparent', 'transparent', 'rgba(0,0,0,0.35)'],
        locations: [0, 0.25, 0.75, 1],
        style: {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }
      })
    });
  }
},3453,[12,80,2144,203]);
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
  exports.ActiveSessionBackground = ActiveSessionBackground;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsUseWindowDimensions = require(_dependencyMap[1]);
  var useWindowDimensions = _interopDefault(_reactNativeWebDistExportsUseWindowDimensions);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _expoLinearGradient = require(_dependencyMap[3]);
  var _reactNativeReanimated = require(_dependencyMap[4]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _hooksUseReducedMotion = require(_dependencyMap[5]);
  var _themeTokensColors = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  const _worklet_14673149378403_init_data = {
    code: "function ActiveSessionBackgroundTsx1(){const{isReducedMotion,drift}=this.__closure;return{transform:[{translateX:isReducedMotion?0:(drift.value-0.5)*16},{translateY:isReducedMotion?0:(drift.value-0.5)*12}]};}"
  };
  function ActiveSessionBackground({
    accentOverlay,
    colors,
    accentColor
  }) {
    const {
      width,
      height
    } = (0, useWindowDimensions.default)();
    const {
      isReducedMotion
    } = (0, _hooksUseReducedMotion.useReducedMotion)();
    const drift = (0, _reactNativeReanimated.useSharedValue)(0);
    (0, _react.useEffect)(() => {
      if (isReducedMotion) {
        return;
      }
      drift.value = (0, _reactNativeReanimated.withRepeat)((0, _reactNativeReanimated.withTiming)(1, {
        duration: 20000
      }), -1, true);
    }, [isReducedMotion, drift]);
    const orbStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function ActiveSessionBackgroundTsx1Factory({
      _worklet_14673149378403_init_data,
      isReducedMotion,
      drift
    }) {
      const ActiveSessionBackgroundTsx1 = () => ({
        transform: [{
          translateX: isReducedMotion ? 0 : (drift.value - 0.5) * 16
        }, {
          translateY: isReducedMotion ? 0 : (drift.value - 0.5) * 12
        }]
      });
      ActiveSessionBackgroundTsx1.__closure = {
        isReducedMotion,
        drift
      };
      ActiveSessionBackgroundTsx1.__workletHash = 14673149378403;
      ActiveSessionBackgroundTsx1.__initData = _worklet_14673149378403_init_data;
      return ActiveSessionBackgroundTsx1;
    }({
      _worklet_14673149378403_init_data,
      isReducedMotion,
      drift
    }));
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeIn.duration(300),
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_expoLinearGradient.LinearGradient, {
        colors: colors,
        start: {
          x: 0.15,
          y: 0
        },
        end: {
          x: 0.85,
          y: 1
        },
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }
      }), accentColor ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        style: [{
          position: 'absolute',
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: width * 0.8 / 2,
          backgroundColor: `${accentColor || _themeTokensColors.lightColors.semantic.vexCyan}10`,
          top: height * 0.15,
          left: width * 0.1
        }, orbStyle],
        pointerEvents: "none"
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: accentOverlay
        }
      })]
    });
  }
},3454,[12,1304,80,2144,226,1681,1465,203]);
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
  exports.ActiveSessionHeader = ActiveSessionHeader;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _iconsComponentsIcon = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function ActiveSessionHeader({
    isPaused,
    onInterrupt,
    theme
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      p: "lg",
      pt: "xl",
      style: {
        zIndex: 2
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
        accessibilityHint: "Opens the quit session confirmation before leaving.",
        accessibilityLabel: "Quit focus session",
        accessibilityRole: "button",
        onPress: onInterrupt,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          alignItems: "center",
          style: {
            minHeight: 44,
            borderRadius: theme.borderRadius.full,
            borderWidth: 1,
            borderColor: theme.colors.semantic.borderStrong,
            paddingHorizontal: theme.spacing[3],
            backgroundColor: theme.colors.semantic.surfaceGlass
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
            name: "chevron-left",
            size: "lg",
            color: theme.colors.text.primary
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "label",
            color: "text.primary",
            style: {
              marginLeft: theme.spacing[1]
            },
            children: "Quit"
          })]
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        alignItems: "center",
        gap: "sm",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          width: 8,
          height: 8,
          borderRadius: "full",
          bg: isPaused ? 'warning.DEFAULT' : 'success.DEFAULT'
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.secondary",
          children: isPaused ? 'Paused' : 'In Session'
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        width: 72
      })]
    });
  }
},3455,[12,1286,1462,1489,1691,203]);
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
  Object.defineProperty(exports, "ActiveSessionHero", {
    enumerable: true,
    get: function () {
      return ActiveSessionHero;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _iconsComponentsIcon = require(_dependencyMap[4]);
  var _ActiveSessionProgressRing = require(_dependencyMap[5]);
  var _ActiveSessionHeroSecondary = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  const ActiveSessionHero = ({
    viewModel,
    progressRingProps,
    themeColors,
    isReducedMotion
  }) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    px: "lg",
    children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      alignItems: "center",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(SessionTargetBadge, {
        phaseIcon: viewModel.phaseIcon,
        phaseLabel: viewModel.phaseLabel,
        phaseAccent: viewModel.phaseAccent,
        studyTargetLabel: viewModel.studyTargetLabel,
        isReducedMotion: isReducedMotion,
        withAlpha: progressRingProps.withAlpha
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(FocusSignalPill, {
        signalPill: viewModel.signalPill,
        themeColors: themeColors,
        isReducedMotion: isReducedMotion,
        withAlpha: progressRingProps.withAlpha
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_ActiveSessionProgressRing.ActiveSessionProgressRing, {
        CIRCUMFERENCE: progressRingProps.CIRCUMFERENCE,
        RADIUS: progressRingProps.RADIUS,
        RING_SIZE: progressRingProps.RING_SIZE,
        STROKE_WIDTH: progressRingProps.STROKE_WIDTH,
        animatedCircleProps: progressRingProps.animatedCircleProps,
        completionPercentage: viewModel.completionPercentage,
        glowStyle: progressRingProps.glowStyle,
        outerStrokeDashoffset: progressRingProps.outerStrokeDashoffset,
        perfectFocusActive: viewModel.perfectFocusActive,
        perfectFocusBurst: progressRingProps.perfectFocusBurst,
        phaseAccent: viewModel.phaseAccent,
        pulseStyle: progressRingProps.pulseStyle,
        purityLabel: viewModel.purityLabel,
        purityScore: viewModel.purityScore,
        remainingSeconds: viewModel.remainingSeconds,
        rotatingPerfectFocusStyle: progressRingProps.rotatingPerfectFocusStyle,
        showPurityScore: viewModel.showPurityScore,
        streakMultiplier: viewModel.streakMultiplier,
        themeColors: {
          inverse: themeColors.inverse,
          primary300: themeColors.primary300,
          warning: themeColors.warning
        },
        withAlpha: progressRingProps.withAlpha
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_ActiveSessionHeroSecondary.MomentumDots, {
        viewModel: viewModel,
        themeColors: themeColors
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_ActiveSessionHeroSecondary.DailyProgress, {
        viewModel: viewModel
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_ActiveSessionHeroSecondary.SessionStats, {
        viewModel: viewModel,
        labelColor: progressRingProps.labelColor
      })]
    })
  });
  function SessionTargetBadge(props) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        alignItems: "center",
        gap: "sm",
        mb: "lg",
        px: "md",
        py: "sm",
        borderRadius: "full",
        style: {
          backgroundColor: props.withAlpha(props.phaseAccent, 0.12),
          borderWidth: 1,
          borderColor: props.withAlpha(props.phaseAccent, 0.22)
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
          name: props.phaseIcon,
          size: "sm",
          color: props.phaseAccent
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          style: {
            color: props.phaseAccent
          },
          children: props.phaseLabel
        })]
      }), props.studyTargetLabel ? props.isReducedMotion ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "body",
        color: "text.primary",
        textAlign: "center",
        mb: "md",
        children: props.studyTargetLabel
      }) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        entering: _reactNativeReanimated.FadeIn.duration(200),
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: "text.primary",
          textAlign: "center",
          mb: "md",
          children: props.studyTargetLabel
        })
      }) : null]
    });
  }
  function FocusSignalPill(props) {
    if (!props.signalPill) {
      return null;
    }
    const color = props.signalPill.type === 'boss' ? props.themeColors.error : props.themeColors.warning;
    const content = /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      alignSelf: "center",
      mb: "md",
      px: "md",
      py: "xs",
      borderRadius: "full",
      style: {
        backgroundColor: props.withAlpha(color, 0.12),
        borderWidth: 1,
        borderColor: props.withAlpha(color, 0.28)
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "caption",
        style: {
          color,
          fontWeight: '700'
        },
        children: props.signalPill.label
      })
    });
    if (props.isReducedMotion) {
      return content;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeIn.duration(150),
      children: content
    });
  }
},3456,[12,226,1462,1489,1691,3457,3462,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "ActiveSessionProgressRing", {
    enumerable: true,
    get: function () {
      return _ActiveSessionProgressRingInner.ActiveSessionProgressRing;
    }
  });
  var _ActiveSessionProgressRingInner = require(_dependencyMap[0]);
},3457,[3458]);
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
  Object.defineProperty(exports, "ActiveSessionProgressRing", {
    enumerable: true,
    get: function () {
      return ActiveSessionProgressRing;
    }
  });
  var _themeTokensColors = require(_dependencyMap[0]);
  require(_dependencyMap[1]);
  var _reactNativeSvg = require(_dependencyMap[2]);
  var Svg = _interopDefault(_reactNativeSvg);
  var _reactNativeReanimated = require(_dependencyMap[3]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[4]);
  var _componentsPrimitivesText = require(_dependencyMap[5]);
  var _sessionComponentsPurityHUD = require(_dependencyMap[6]);
  var _hooksUseSessionAnimations = require(_dependencyMap[7]);
  var _utilsActiveSession = require(_dependencyMap[8]);
  var _PerfectFocusBurstParticle = require(_dependencyMap[9]);
  var _progressRingTypes = require(_dependencyMap[10]);
  var _reactJsxRuntime = require(_dependencyMap[11]);
  const ActiveSessionProgressRing = ({
    CIRCUMFERENCE,
    RADIUS,
    RING_SIZE,
    STROKE_WIDTH,
    animatedCircleProps,
    completionPercentage,
    glowStyle,
    outerStrokeDashoffset,
    perfectFocusActive,
    perfectFocusBurst,
    phaseAccent,
    pulseStyle,
    purityLabel,
    purityScore,
    remainingSeconds,
    rotatingPerfectFocusStyle,
    showPurityScore,
    streakMultiplier,
    themeColors,
    withAlpha
  }) => {
    const outerRadius = RADIUS + 16;
    const outerCircumference = 2 * Math.PI * outerRadius;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      style: [pulseStyle, {
        alignItems: 'center',
        justifyContent: 'center'
      }],
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        style: Object.assign({
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999
        }, glowStyle),
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Svg.default, {
          width: RING_SIZE + 34,
          height: RING_SIZE + 34,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
            cx: (RING_SIZE + 34) / 2,
            cy: (RING_SIZE + 34) / 2,
            r: outerRadius,
            stroke: withAlpha(themeColors.inverse, 0.08),
            strokeWidth: 4,
            fill: "none"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
            cx: (RING_SIZE + 34) / 2,
            cy: (RING_SIZE + 34) / 2,
            r: outerRadius,
            stroke: withAlpha(phaseAccent, 0.42),
            strokeWidth: 4,
            fill: "none",
            strokeDasharray: outerCircumference,
            strokeDashoffset: outerStrokeDashoffset,
            strokeLinecap: "round",
            transform: `rotate(-90 ${(RING_SIZE + 34) / 2} ${(RING_SIZE + 34) / 2})`
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
            cx: (RING_SIZE + 34) / 2,
            cy: (RING_SIZE + 34) / 2,
            r: RADIUS,
            stroke: withAlpha(themeColors.inverse, 0.08),
            strokeWidth: STROKE_WIDTH,
            fill: "none"
          }), _progressRingTypes.USE_SAFE_PROGRESS_RING ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
            cx: (RING_SIZE + 34) / 2,
            cy: (RING_SIZE + 34) / 2,
            r: RADIUS,
            stroke: phaseAccent,
            strokeWidth: STROKE_WIDTH,
            fill: "none",
            strokeDasharray: CIRCUMFERENCE,
            strokeDashoffset: CIRCUMFERENCE * (1 - Math.max(0, Math.min(100, completionPercentage)) / 100),
            strokeLinecap: "round",
            transform: `rotate(-90 ${(RING_SIZE + 34) / 2} ${(RING_SIZE + 34) / 2})`
          }) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_hooksUseSessionAnimations.AnimatedCircle, {
            cx: (RING_SIZE + 34) / 2,
            cy: (RING_SIZE + 34) / 2,
            r: RADIUS,
            stroke: phaseAccent,
            strokeWidth: STROKE_WIDTH,
            fill: "none",
            strokeDasharray: CIRCUMFERENCE,
            animatedProps: animatedCircleProps,
            strokeLinecap: "round",
            transform: `rotate(-90 ${(RING_SIZE + 34) / 2} ${(RING_SIZE + 34) / 2})`
          })]
        }), perfectFocusActive ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          style: [{
            position: 'absolute'
          }, rotatingPerfectFocusStyle],
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Svg.default, {
            width: RING_SIZE + 34,
            height: RING_SIZE + 34,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Defs, {
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactNativeSvg.LinearGradient, {
                id: "perfect-focus-gradient",
                x1: "0%",
                y1: "0%",
                x2: "100%",
                y2: "100%",
                children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
                  offset: "0%",
                  stopColor: _themeTokensColors.lightColors.warning.light
                }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
                  offset: "35%",
                  stopColor: _themeTokensColors.lightColors.semantic.warning
                }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
                  offset: "68%",
                  stopColor: _themeTokensColors.lightColors.accent.pink
                }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
                  offset: "100%",
                  stopColor: _themeTokensColors.lightColors.accent.blue
                })]
              })
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
              cx: (RING_SIZE + 34) / 2,
              cy: (RING_SIZE + 34) / 2,
              r: RADIUS + 7,
              stroke: "url(#perfect-focus-gradient)",
              strokeWidth: 3,
              fill: "none",
              strokeLinecap: "round",
              strokeDasharray: "14 18"
            })]
          })
        }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          position: "absolute",
          width: RING_SIZE,
          height: RING_SIZE,
          justifyContent: "center",
          alignItems: "center",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "hero",
            color: "text.primary",
            textAlign: "center",
            children: (0, _utilsActiveSession.formatTime)(remainingSeconds)
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.secondary",
            textAlign: "center",
            mt: "xs",
            children: "remaining"
          }), showPurityScore ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sessionComponentsPurityHUD.PurityHUD, {
            purityScore: purityScore,
            purityLabel: purityLabel,
            streakMultiplier: streakMultiplier,
            compact: true
          }) : null]
        }), Array.from({
          length: _utilsActiveSession.PERFECT_PARTICLE_COUNT
        }).map((_, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PerfectFocusBurstParticle.PerfectFocusBurstParticle, {
          index: index,
          color: index % 2 === 0 ? themeColors.warning : themeColors.primary300,
          progress: perfectFocusBurst
        }, `burst-${index}`))]
      })
    });
  };
},3458,[1465,12,1643,226,1462,1489,3459,3428,3430,3460,3461,203]);
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
  Object.defineProperty(exports, "PurityHUD", {
    enumerable: true,
    get: function () {
      return PurityHUD;
    }
  });
  var _react = require(_dependencyMap[0]);
  var React = _interopDefault(_react);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[3]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _utilsHaptics = require(_dependencyMap[4]);
  var _componentsPrimitivesText = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _sharedUiCreateSheet = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  const formatMultiplier = value => value.toFixed(value % 1 === 0 ? 1 : 2).replace(/\.0$/, '');
  const withAlpha = (color, alpha) => color.startsWith('#') ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${alpha})` : color;
  const PurityHUD = /*#__PURE__*/React.default.memo(function PurityHUD({
    purityScore,
    purityLabel,
    streakMultiplier,
    compact = false,
    onMultiplierPress
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const display = (0, _react.useMemo)(() => {
      if (purityLabel === 'Elite') {
        return {
          icon: '\uD83D\uDD25',
          color: theme.colors.primary[500],
          text: 'ELITE FOCUS'
        };
      }
      if (purityLabel === 'Good') {
        return {
          icon: '\u2728',
          color: theme.colors.success.DEFAULT,
          text: 'GOOD FLOW'
        };
      }
      if (purityLabel === 'Okay') {
        return {
          icon: '\u26A1',
          color: theme.colors.warning.DEFAULT,
          text: 'STAY SHARP'
        };
      }
      return {
        icon: '\u2022',
        color: theme.colors.error.DEFAULT,
        text: 'DISTRACTED'
      };
    }, [purityLabel, theme.colors.error.DEFAULT, theme.colors.primary, theme.colors.success.DEFAULT, theme.colors.warning.DEFAULT]);
    if (compact) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: styles.compactWrap,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeIn.duration(200),
          style: styles.compactRow,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "label",
            style: {
              color: display.color
            },
            children: `${display.icon} ${display.text}`
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.secondary",
            children: '\u2022'
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
            disabled: !onMultiplierPress,
            onPress: () => {
              (0, _utilsHaptics.buttonTap)();
              onMultiplierPress?.();
            },
            accessibilityLabel: `${formatMultiplier(streakMultiplier)}x multiplier`,
            accessibilityRole: "button",
            accessibilityHint: "Double tap to view multiplier details",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
              style: [styles.multiplierPill, {
                backgroundColor: withAlpha(display.color, 0.14),
                borderColor: withAlpha(display.color, 0.24)
              }],
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "caption",
                style: {
                  color: theme.colors.text.primary
                },
                children: `${formatMultiplier(streakMultiplier)}x`
              })
            })
          })]
        }, `${purityLabel}-${Math.round(purityScore)}`)
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: [styles.card, {
        backgroundColor: theme.colors.background.secondary,
        borderColor: theme.colors.border.light
      }],
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
        entering: _reactNativeReanimated.FadeIn.duration(200),
        style: styles.defaultRow,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          style: {
            color: display.color
          },
          children: `${display.icon} ${display.text}`
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          color: "text.primary",
          children: `${Math.round(purityScore)}%`
        })]
      }, `${purityLabel}-${Math.round(purityScore)}`), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
        disabled: !onMultiplierPress,
        onPress: () => {
          (0, _utilsHaptics.buttonTap)();
          onMultiplierPress?.();
        },
        accessibilityLabel: `${formatMultiplier(streakMultiplier)}x streak multiplier`,
        accessibilityRole: "button",
        accessibilityHint: "Double tap to view streak multiplier details",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: [styles.multiplierPill, {
            backgroundColor: withAlpha(theme.colors.primary[500], 0.12),
            borderColor: withAlpha(theme.colors.primary[500], 0.24)
          }],
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.primary",
            children: `${formatMultiplier(streakMultiplier)}x streak`
          })
        })
      })]
    });
  }, (prev, next) => prev.purityScore === next.purityScore && prev.purityLabel === next.purityLabel && prev.streakMultiplier === next.streakMultiplier && prev.compact === next.compact);
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    compactWrap: {
      marginTop: 18,
      alignItems: 'center'
    },
    compactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    card: {
      marginHorizontal: 20,
      marginTop: 8,
      marginBottom: 18,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    },
    defaultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10
    },
    multiplierPill: {
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 6
    }
  });
},3459,[12,1286,80,226,1683,1489,1463,1678,203]);
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
  Object.defineProperty(exports, "PerfectFocusBurstParticle", {
    enumerable: true,
    get: function () {
      return PerfectFocusBurstParticle;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _utilsActiveSession = require(_dependencyMap[2]);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  const _worklet_15604395004499_init_data = {
    code: "function PerfectFocusBurstParticleTsx1(){const{progress,angle}=this.__closure;return{opacity:1-progress.value,transform:[{translateX:Math.cos(angle)*54*progress.value},{translateY:Math.sin(angle)*54*progress.value},{scale:progress.value}]};}"
  };
  const PerfectFocusBurstParticle = ({
    color,
    index,
    progress
  }) => {
    const angle = Math.PI * 2 * index / _utilsActiveSession.PERFECT_PARTICLE_COUNT;
    const style = (0, _reactNativeReanimated.useAnimatedStyle)(function PerfectFocusBurstParticleTsx1Factory({
      _worklet_15604395004499_init_data,
      progress,
      angle
    }) {
      const PerfectFocusBurstParticleTsx1 = () => ({
        opacity: 1 - progress.value,
        transform: [{
          translateX: Math.cos(angle) * 54 * progress.value
        }, {
          translateY: Math.sin(angle) * 54 * progress.value
        }, {
          scale: progress.value
        }]
      });
      PerfectFocusBurstParticleTsx1.__closure = {
        progress,
        angle
      };
      PerfectFocusBurstParticleTsx1.__workletHash = 15604395004499;
      PerfectFocusBurstParticleTsx1.__initData = _worklet_15604395004499_init_data;
      return PerfectFocusBurstParticleTsx1;
    }({
      _worklet_15604395004499_init_data,
      progress,
      angle
    }));
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      style: [{
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 999
      }, {
        backgroundColor: color
      }, style]
    });
  };
},3460,[12,226,3430,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "USE_SAFE_PROGRESS_RING", {
    enumerable: true,
    get: function () {
      return USE_SAFE_PROGRESS_RING;
    }
  });
  const USE_SAFE_PROGRESS_RING = true;
},3461,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.MomentumDots = MomentumDots;
  exports.DailyProgress = DailyProgress;
  exports.SessionStats = SessionStats;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _utilsActiveSession = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  function MomentumDots({
    viewModel,
    themeColors
  }) {
    if (!viewModel.momentumScores) {
      return null;
    }
    const scores = viewModel.momentumScores;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: "sm",
      mt: "lg",
      children: scores.length > 0 ? scores.map((score, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        width: 8,
        height: 8,
        borderRadius: "full",
        style: {
          backgroundColor: score >= 70 ? themeColors.success : score >= 45 ? themeColors.warning : themeColors.error,
          opacity: 0.85 + (index + 1) / scores.length * 0.55
        }
      }, `momentum-${index}-${score}`)) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "caption",
        color: "text.secondary",
        children: "Calibrating momentum..."
      })
    });
  }
  function DailyProgress({
    viewModel
  }) {
    if (viewModel.dailyProgress === null || viewModel.todayFocusSeconds === null) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
      variant: "caption",
      color: "text.secondary",
      textAlign: "center",
      mt: "sm",
      children: `${(0, _utilsActiveSession.formatTime)(viewModel.todayFocusSeconds)} today - ${Math.round(viewModel.dailyProgress)}% of 2h goal`
    });
  }
  function SessionStats({
    viewModel,
    labelColor
  }) {
    if (viewModel.heroDensity === 'minimal') {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flexDirection: "row",
      justifyContent: "center",
      gap: "xl",
      mt: "xl",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Stat, {
        label: "Elapsed",
        value: (0, _utilsActiveSession.formatTime)(viewModel.elapsedSeconds)
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Stat, {
        label: "Complete",
        value: `${Math.round(viewModel.completionPercentage)}%`,
        color: labelColor
      })]
    });
  }
  function Stat(props) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      alignItems: "center",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "h4",
        color: props.color ? undefined : 'text.primary',
        style: props.color ? {
          color: props.color
        } : undefined,
        children: props.value
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "caption",
        color: "text.secondary",
        children: props.label
      })]
    });
  }
},3462,[12,1462,1489,3430,203]);
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
  exports.ActiveSessionModeOverlays = ActiveSessionModeOverlays;
  require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _featuresSessionStudyQuizBreak = require(_dependencyMap[4]);
  var _sessionComponentsCreativeMoodLogger = require(_dependencyMap[5]);
  var _sessionComponentsModeIndicatorBadge = require(_dependencyMap[6]);
  var _sessionModes = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  function ActiveSessionModeOverlays(props) {
    if (!props.displayPolicy.showModeOverlay) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactJsxRuntime.Fragment, {});
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(ModeOverlay, Object.assign({}, props)), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionStudyQuizBreak.StudyQuizBreak, {
        isVisible: props.allowStudyQuizBreak && props.quizBreakKey !== null && props.isPaused,
        studyPlanId: props.studyPlanId,
        onSkip: props.onSkipQuiz,
        onClose: props.onCloseQuiz
      })]
    });
  }
  function ModeOverlay(props) {
    if (props.currentMode === _sessionModes.SessionMode.SPRINT) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(SprintOverlay, {
        chainCount: props.chainCount
      });
    }
    if (props.currentMode === _sessionModes.SessionMode.STUDY) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(StudyOverlay, {
        completionPercentage: props.completionPercentage
      });
    }
    if (props.currentMode === _sessionModes.SessionMode.CREATIVE) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sessionComponentsCreativeMoodLogger.CreativeMoodLogger, {
        isVisible: props.remainingSeconds <= 120 && !props.isPaused,
        onMoodSelected: props.onCreativeMoodSelected ?? (() => {}),
        onSkip: props.onSkipCreativeMood ?? (() => {})
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sessionComponentsModeIndicatorBadge.ModeIndicatorBadge, {
      mode: props.currentMode,
      chainCount: props.chainCount
    });
  }
  function SprintOverlay({
    chainCount
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      position: "absolute",
      top: 104,
      left: 16,
      right: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: "xs",
      style: {
        zIndex: 20
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        gap: "xs",
        children: [1, 2, 3, 4].map(item => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          width: 10,
          height: 10,
          borderRadius: "full",
          bg: item <= chainCount ? 'primary.500' : 'background.tertiary'
        }, item))
      }), chainCount > 1 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        entering: _reactNativeReanimated.ZoomIn.duration(200),
        style: {
          marginLeft: 8
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          weight: "semibold",
          color: "primary.500",
          children: `${(1 + (chainCount - 1) * 0.05).toFixed(2)}x chain bonus`
        })
      }) : null]
    });
  }
  function StudyOverlay({
    completionPercentage
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      position: "absolute",
      top: 104,
      left: 16,
      right: 16,
      style: {
        zIndex: 20
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "caption",
        color: "text.secondary",
        children: completionPercentage < 50 ? 'Planned quiz break at 50%' : 'Final planned quiz check at 90%'
      })
    });
  }
},3463,[12,226,1462,1489,3464,3465,3466,1829,203]);
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
  exports.StudyQuizBreak = StudyQuizBreak;
  var _react = require(_dependencyMap[0]);
  var _sentryReactNative = require(_dependencyMap[1]);
  var Sentry = _interopNamespace(_sentryReactNative);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesButton = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _contentStudyService = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  function StudyQuizBreak({
    isVisible,
    onClose,
    onSkip,
    studyPlanId
  }) {
    const [answers, setAnswers] = (0, _react.useState)({});
    const [error, setError] = (0, _react.useState)(null);
    const [isLoading, setIsLoading] = (0, _react.useState)(false);
    const [quizItems, setQuizItems] = (0, _react.useState)([]);
    (0, _react.useEffect)(() => {
      if (!isVisible || !studyPlanId) {
        return;
      }
      let isCancelled = false;
      setIsLoading(true);
      setError(null);
      (0, _contentStudyService.getQuizForStudyPlan)(studyPlanId).then(items => {
        if (!isCancelled) {
          setQuizItems(items);
        }
      }).catch(caught => {
        if (!isCancelled) {
          setError("Couldn't load the study quiz. You can keep the session moving.");
        }
        Sentry.captureException(caught, {
          tags: {
            feature: 'study-quiz-break'
          }
        });
      }).finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });
      return () => {
        isCancelled = true;
      };
    }, [isVisible, studyPlanId]);
    const correctAnswers = (0, _react.useMemo)(() => quizItems.filter(item => {
      const answer = answers[item.id];
      return answer?.trim().toLowerCase() === item.answer.trim().toLowerCase();
    }).length, [answers, quizItems]);
    if (!isVisible) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 120,
      p: "lg",
      bg: "background.elevated",
      borderRadius: "xl",
      style: {
        zIndex: 30
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "h4",
        color: "text.primary",
        mb: "xs",
        children: "Study check"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "body",
        color: "text.secondary",
        mb: "md",
        children: "Answer up to three questions for a score bonus, or skip and keep moving."
      }), isLoading ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        minHeight: 88,
        borderRadius: "lg",
        bg: "background.tertiary"
      }) : null, error ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "body",
        color: "error.DEFAULT",
        mb: "md",
        children: error
      }) : null, quizItems.map((item, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        mb: "sm",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          color: "text.primary",
          children: `${index + 1}. ${item.question}`
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          gap: "sm",
          flexWrap: "wrap",
          mt: "xs",
          children: (item.options ?? [item.answer]).slice(0, 4).map(option => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
            accessibilityLabel: `Answer ${option}`,
            accessibilityHint: "Selects this quiz answer",
            variant: answers[item.id] === option ? 'primary' : 'secondary',
            size: "sm",
            onPress: () => setAnswers(current => Object.assign({}, current, {
              [item.id]: option
            })),
            accessibilityRole: "button",
            children: option
          }, option))
        })]
      }, item.id)), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        gap: "sm",
        mt: "sm",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "secondary",
          onPress: onSkip,
          accessibilityLabel: "Skip study quiz",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: "Skip"
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "primary",
          onPress: () => onClose(correctAnswers),
          accessibilityLabel: "Submit study quiz",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: `Continue +${correctAnswers * 5}`
          })
        })]
      })]
    });
  }
},3464,[12,834,1462,1680,1489,2567,203]);
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
  exports.CreativeMoodLogger = CreativeMoodLogger;
  Object.defineProperty(exports, "MOODS", {
    enumerable: true,
    get: function () {
      return MOODS;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _themeThemeContext = require(_dependencyMap[5]);
  var _utilsHaptics = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  /**
   * CreativeMoodLogger
   *
   * Appears in the final 2 minutes of a CREATIVE mode session.
   * User picks a mood emoji — stored in session payload as +5 score bonus.
   * Designed to be gentle — always has a skip option.
   */const MOODS = [{
    emoji: '🔥',
    label: 'On fire',
    bonus: 10
  }, {
    emoji: '💡',
    label: 'Inspired',
    bonus: 8
  }, {
    emoji: '😌',
    label: 'Calm',
    bonus: 5
  }, {
    emoji: '😤',
    label: 'Frustrated',
    bonus: 3
  }, {
    emoji: '🤔',
    label: 'Exploring',
    bonus: 5
  }];
  function CreativeMoodLogger({
    isVisible,
    onMoodSelected,
    onSkip
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const [selected, setSelected] = (0, _react.useState)(null);
    if (!isVisible) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
      entering: _reactNativeReanimated.SlideInDown.duration(400).springify(),
      exiting: _reactNativeReanimated.FadeOut.duration(200),
      style: {
        position: 'absolute',
        bottom: theme.spacing[24],
        left: theme.spacing[4],
        right: theme.spacing[4],
        backgroundColor: theme.colors.background.elevated,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing[4],
        zIndex: 30
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        mb: "sm",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          weight: "semibold",
          children: "How's the creative energy?"
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        gap: "sm",
        flexWrap: "wrap",
        children: MOODS.map(mood => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Pressable.default, {
          onPress: () => {
            (0, _utilsHaptics.selection)();
            setSelected(mood);
            setTimeout(() => onMoodSelected(mood), 400);
          },
          style: {
            padding: theme.spacing[2],
            borderRadius: theme.borderRadius.lg,
            backgroundColor: selected?.emoji === mood.emoji ? theme.colors.primary[500] + '30' : theme.colors.background.tertiary,
            borderWidth: 1,
            borderColor: selected?.emoji === mood.emoji ? theme.colors.primary[500] : 'transparent',
            alignItems: 'center'
          },
          accessibilityLabel: `${mood.label} mood`,
          accessibilityRole: "button",
          accessibilityHint: `Select ${mood.label.toLowerCase()} as your creative mood`,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            fontSize: 24,
            children: mood.emoji
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.secondary",
            children: mood.label
          })]
        }, mood.emoji))
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
        onPress: onSkip,
        style: {
          marginTop: theme.spacing[3],
          alignSelf: 'flex-end'
        },
        accessibilityLabel: "Skip mood logging",
        accessibilityRole: "button",
        accessibilityHint: "Skips the mood selection step",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.tertiary",
          children: "Skip"
        })
      })]
    });
  }
},3465,[12,1286,226,1462,1489,1463,1683,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.ModeIndicatorBadge = ModeIndicatorBadge;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _modes = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  const MODE_LABELS = {
    [_modes.SessionMode.DEEP_WORK]: 'DEEP WORK',
    [_modes.SessionMode.CHALLENGE]: 'CHALLENGE',
    [_modes.SessionMode.LIGHT_FOCUS]: 'LIGHT FOCUS',
    [_modes.SessionMode.FLOW]: 'FLOW',
    [_modes.SessionMode.STUDY]: 'STUDY',
    [_modes.SessionMode.CREATIVE]: 'CREATIVE',
    [_modes.SessionMode.SPRINT]: 'SPRINT',
    [_modes.SessionMode.RECOVERY]: 'RECOVERY',
    [_modes.SessionMode.STARTER]: 'STARTER',
    [_modes.SessionMode.PLAN]: 'PLAN',
    [_modes.SessionMode.REVIEW]: 'REVIEW',
    [_modes.SessionMode.CAPTURE]: 'CAPTURE',
    [_modes.SessionMode.HABIT]: 'HABIT'
  };
  function ModeIndicatorBadge({
    chainCount,
    mode
  }) {
    const suffix = mode === _modes.SessionMode.SPRINT && chainCount ? ` ${chainCount}/4` : '';
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      position: "absolute",
      top: 54,
      left: 16,
      minHeight: 44,
      px: "md",
      borderRadius: "full",
      bg: "background.elevated",
      alignItems: "center",
      justifyContent: "center",
      style: {
        zIndex: 20
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "caption",
        color: "text.primary",
        children: `${MODE_LABELS[mode]}${suffix}`
      })
    });
  }
},3466,[12,1462,1489,1829,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.CoachSessionBannerLazy = CoachSessionBannerLazy;
  require(_dependencyMap[0]);
  var _featuresAiCoachComponentsCoachSessionBanner = require(_dependencyMap[1]);
  var _featuresAiCoachHooksUseCoachState = require(_dependencyMap[2]);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  function CoachSessionBannerLazy({
    userId,
    showCoachBanner,
    elapsedSeconds,
    isPaused
  }) {
    if (!showCoachBanner || !userId) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(CoachBannerInternal, {
      userId: userId,
      elapsedSeconds: elapsedSeconds,
      isPaused: isPaused
    });
  }
  function CoachBannerInternal({
    userId,
    elapsedSeconds,
    isPaused
  }) {
    const {
      data: coachState
    } = (0, _featuresAiCoachHooksUseCoachState.useCoachState)(userId);
    if (!coachState) {
      return null;
    }
    const personaStyle = coachState.currentState === 'OVERLOAD_PROTECTION' ? 'DRILL_SERGEANT' : 'MENTOR';
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresAiCoachComponentsCoachSessionBanner.CoachSessionBanner, {
      coachName: "Coach",
      personaStyle: personaStyle,
      elapsedSeconds: elapsedSeconds,
      isPaused: isPaused
    });
  }
},3467,[12,3468,3268,203]);
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
  exports.CoachSessionBanner = CoachSessionBanner;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _themeThemeContext = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  /**
   * CoachSessionBanner
   *
   * Shows coach's name and rotating encouraging message during active session.
   * Displays below the mode indicator badge.
   * Messages rotate every 5 minutes (max 3 messages per session).
   *
   * @phase 6
   */

  // Mid-session encouragement messages by persona (3 per persona = 9 total)
  const ENCOURAGEMENT_MESSAGES = {
    MENTOR: ["You're halfway there. Stay consistent.", 'Your focus is building momentum. Keep going.', 'Every minute of focus compounds into real progress.'],
    CHEERLEADER: ["You're doing amazing. Keep going.", "You're crushing this session.", "Look at you focus. You're unstoppable."],
    DRILL_SERGEANT: ["Eyes on the clock. Don't you dare pause.", "You're not done yet. Keep pushing.", 'Weakness is temporary. Focus is forever. Move.']
  };

  // Message rotation interval: 5 minutes = 300 seconds
  const MESSAGE_ROTATION_SECONDS = 300;
  const MAX_MESSAGES_PER_SESSION = 3;
  function CoachSessionBanner({
    coachName,
    personaStyle,
    elapsedSeconds,
    isPaused
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const [currentMessageIndex, setCurrentMessageIndex] = (0, _react.useState)(0);
    const [hasStarted, setHasStarted] = (0, _react.useState)(false);

    // Get messages for this persona (computed, not stored in state)
    const messages = ENCOURAGEMENT_MESSAGES[personaStyle] || ENCOURAGEMENT_MESSAGES.MENTOR;

    // SAFETY: message rotation depends on elapsedSeconds, which is a prop updated
    // every tick by the parent timer effect. Computing the index in an effect keeps
    // it in sync without causing extra re-renders.
    (0, _react.useEffect)(() => {
      if (isPaused) {
        return;
      }
      const minutesElapsed = Math.floor(elapsedSeconds / 60);
      const newMessageIndex = Math.min(Math.floor(minutesElapsed / 5), 2);
      if (newMessageIndex !== currentMessageIndex && newMessageIndex < MAX_MESSAGES_PER_SESSION) {
        setCurrentMessageIndex(newMessageIndex);
      }
      if (elapsedSeconds > 0 && !hasStarted) {
        setHasStarted(true);
      }
    }, [elapsedSeconds, isPaused, currentMessageIndex, hasStarted]);

    // Don't show until session has started (after 30 seconds)
    if (!hasStarted || elapsedSeconds < 30) {
      return null;
    }

    // Don't show if we've shown all 3 messages and 15 minutes have passed
    const totalShowTime = 900;
    if (elapsedSeconds > 930) {
      return null;
    }
    const currentMessage = messages[currentMessageIndex];

    // Memoize the banner style to avoid re-creating the large inline object every render
    const bannerStyle = (0, _react.useMemo)(() => ({
      position: 'absolute',
      top: 140,
      left: theme.spacing[4],
      right: theme.spacing[4],
      backgroundColor: theme.colors.background.elevated + 'E6',
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      boxShadow: `0px 2px 4px ${theme.colors.text.primary}20`,
      elevation: 3,
      zIndex: 10
    }), [theme]);
    const avatarStyle = (0, _react.useMemo)(() => ({
      width: 28,
      height: 28,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary[500] + '20',
      justifyContent: 'center',
      alignItems: 'center'
    }), [theme]);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeIn.duration(500),
      exiting: _reactNativeReanimated.FadeOut.duration(300),
      style: bannerStyle,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: avatarStyle,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          fontSize: 14
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          flex: 1
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "secondary",
          weight: "semibold",
          style: {
            marginBottom: 2
          },
          children: coachName
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "bodySmall",
          color: "primary",
          numberOfLines: 1,
          ellipsizeMode: "tail",
          children: currentMessage
        })]
      })]
    });
  }
},3468,[12,80,226,1463,1489,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.ActiveSessionBottomControls = ActiveSessionBottomControls;
  require(_dependencyMap[0]);
  var _sessionComponentsInterruptionWarning = require(_dependencyMap[1]);
  var _componentsActiveSessionControlDock = require(_dependencyMap[2]);
  var _componentsActiveSessionControlRecovery = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  function ActiveSessionBottomControls({
    controlFailure,
    completionPercentage,
    isPaused,
    multiplierDays,
    phaseAccent,
    showMultiplierInfo,
    streakMultiplier,
    showInterruption,
    elapsedSeconds,
    theme,
    onClearControlFailure,
    onRetryControlFailure,
    onComplete,
    onEnd,
    onPauseResume,
    onToggleMultiplierInfo,
    onResume,
    onAbandon
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [controlFailure ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsActiveSessionControlRecovery.ActiveSessionControlRecovery, {
        failure: controlFailure,
        onDismiss: onClearControlFailure,
        onRetry: () => {
          onRetryControlFailure();
        }
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsActiveSessionControlDock.ActiveSessionControlDock, {
        completionPercentage: completionPercentage,
        isPaused: isPaused,
        multiplierDays: multiplierDays,
        phaseAccent: phaseAccent,
        showMultiplierInfo: showMultiplierInfo,
        streakMultiplier: streakMultiplier,
        themeColors: {
          backgroundElevated: theme.colors.background.elevated,
          border: theme.colors.border.light,
          error: theme.colors.error.DEFAULT,
          info: theme.colors.info.DEFAULT,
          inverse: theme.colors.text.inverse,
          success: theme.colors.success.DEFAULT
        },
        onComplete: onComplete,
        onEnd: onEnd,
        onPauseResume: onPauseResume,
        onToggleMultiplierInfo: onToggleMultiplierInfo
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sessionComponentsInterruptionWarning.InterruptionWarning, {
        isVisible: showInterruption,
        severity: elapsedSeconds > 300 ? 'MAJOR' : 'MINOR',
        countdownSeconds: 30,
        interruptionType: "User Initiated",
        onResume: onResume,
        onAbandon: onAbandon,
        hasStreakSave: false
      })]
    });
  }
},3469,[12,3470,3473,3474,203]);
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
  Object.defineProperty(exports, "InterruptionWarning", {
    enumerable: true,
    get: function () {
      return InterruptionWarning;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsModal = require(_dependencyMap[1]);
  var Modal = _interopDefault(_reactNativeWebDistExportsModal);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[2]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsText = require(_dependencyMap[3]);
  var Text = _interopDefault(_reactNativeWebDistExportsText);
  var _reactNativeWebDistExportsView = require(_dependencyMap[4]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[5]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _InterruptionWarningStyles = require(_dependencyMap[6]);
  var _InterruptionWarningHelpers = require(_dependencyMap[7]);
  var _utilsHaptics = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  const _worklet_15619769550355_init_data = {
    code: "function InterruptionWarningTsx1(){const{pulseAnim}=this.__closure;return{transform:[{scale:pulseAnim.value}]};}"
  };
  const InterruptionWarning = ({
    countdownSeconds,
    hasStreakSave = false,
    interruptionType,
    isVisible,
    onAbandon,
    onResume,
    onUseStreakSave,
    severity
  }) => {
    const [remainingSeconds, setRemainingSeconds] = (0, _react.useState)(countdownSeconds);
    const pulseAnim = (0, _reactNativeReanimated.useSharedValue)(1);
    const severityColor = (0, _InterruptionWarningHelpers.getSeverityColor)(severity);
    (0, _react.useEffect)(() => {
      if (isVisible) {
        setRemainingSeconds(countdownSeconds);
      }
    }, [isVisible, countdownSeconds]);
    (0, _react.useEffect)(() => {
      if (!isVisible || remainingSeconds <= 0) {
        return;
      }
      const interval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }, [isVisible, remainingSeconds]);
    (0, _react.useEffect)(() => {
      if (isVisible && remainingSeconds <= 10) {
        pulseAnim.value = (0, _reactNativeReanimated.withRepeat)((0, _reactNativeReanimated.withSequence)((0, _reactNativeReanimated.withTiming)(1.1, {
          duration: 500
        }), (0, _reactNativeReanimated.withTiming)(1, {
          duration: 500
        })), -1, true);
      } else {
        pulseAnim.value = (0, _reactNativeReanimated.withTiming)(1, {
          duration: 120
        });
      }
      return () => {
        (0, _reactNativeReanimated.cancelAnimation)(pulseAnim);
      };
    }, [isVisible, remainingSeconds, pulseAnim]);
    const pulseStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function InterruptionWarningTsx1Factory({
      _worklet_15619769550355_init_data,
      pulseAnim
    }) {
      const InterruptionWarningTsx1 = () => ({
        transform: [{
          scale: pulseAnim.value
        }]
      });
      InterruptionWarningTsx1.__closure = {
        pulseAnim
      };
      InterruptionWarningTsx1.__workletHash = 15619769550355;
      InterruptionWarningTsx1.__initData = _worklet_15619769550355_init_data;
      return InterruptionWarningTsx1;
    }({
      _worklet_15619769550355_init_data,
      pulseAnim
    }));
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Modal.default, {
      visible: isVisible,
      transparent: true,
      animationType: "fade",
      onRequestClose: () => {},
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: _InterruptionWarningStyles.styles.overlay,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
          style: [_InterruptionWarningStyles.styles.container, pulseStyle],
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: [_InterruptionWarningStyles.styles.iconContainer, {
              backgroundColor: severityColor
            }],
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: _InterruptionWarningStyles.styles.warningIcon,
              children: "!"
            })
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: _InterruptionWarningStyles.styles.title,
            children: "Focus paused"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: _InterruptionWarningStyles.styles.interruptionType,
            children: interruptionType
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: [_InterruptionWarningStyles.styles.message, {
              color: severityColor
            }],
            children: (0, _InterruptionWarningHelpers.getSeverityMessage)(severity)
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: _InterruptionWarningStyles.styles.countdownContainer,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: [_InterruptionWarningStyles.styles.countdown, {
                color: severityColor
              }],
              children: (0, _InterruptionWarningHelpers.formatTime)(remainingSeconds)
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
              style: _InterruptionWarningStyles.styles.countdownLabel,
              children: "reserved for your return"
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: _InterruptionWarningStyles.styles.progressBarContainer,
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
              style: [_InterruptionWarningStyles.styles.progressBar, {
                width: `${remainingSeconds / countdownSeconds * 100}%`,
                backgroundColor: severityColor
              }]
            })
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: _InterruptionWarningStyles.styles.actions,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
              style: ({
                pressed
              }) => [_InterruptionWarningStyles.styles.button, _InterruptionWarningStyles.styles.resumeButton, pressed && {
                opacity: 0.8
              }],
              onPress: () => {
                (0, _utilsHaptics.buttonTap)();
                onResume();
              },
              accessibilityLabel: "Resume focus session",
              accessibilityRole: "button",
              accessibilityHint: "Returns to the active focus timer",
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
                style: _InterruptionWarningStyles.styles.buttonText,
                children: "Resume Focus"
              })
            }), hasStreakSave && onUseStreakSave ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
              style: ({
                pressed
              }) => [_InterruptionWarningStyles.styles.button, _InterruptionWarningStyles.styles.streakSaveButton, pressed && {
                opacity: 0.8
              }],
              onPress: () => {
                (0, _utilsHaptics.buttonTap)();
                onUseStreakSave();
              },
              accessibilityLabel: "Use streak save",
              accessibilityRole: "button",
              accessibilityHint: "Uses a streak save before ending this session",
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
                style: _InterruptionWarningStyles.styles.buttonText,
                children: "Use Streak Save"
              })
            }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
              style: ({
                pressed
              }) => [_InterruptionWarningStyles.styles.button, _InterruptionWarningStyles.styles.abandonButton, pressed && {
                opacity: 0.8
              }],
              onPress: () => {
                (0, _utilsHaptics.buttonTap)();
                onAbandon();
              },
              accessibilityLabel: "End focus session",
              accessibilityRole: "button",
              accessibilityHint: "Ends this session and moves to recovery",
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
                style: _InterruptionWarningStyles.styles.abandonButtonText,
                children: "End Session"
              })
            })]
          }), severity === 'CRITICAL' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Text.default, {
            style: _InterruptionWarningStyles.styles.penaltyWarning,
            children: "Ending now may affect your streak and rewards."
          }) : null]
        })
      })
    });
  };
},3470,[12,1279,1286,493,80,226,3471,3472,1683,203]);
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
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24
    },
    container: {
      backgroundColor: _themeTokensColors.lightColors.semantic.background,
      borderRadius: 20,
      padding: 32,
      width: '100%',
      maxWidth: 400,
      alignItems: 'center'
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20
    },
    warningIcon: {
      fontSize: 40
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: _themeTokensColors.lightColors.text.inverse,
      marginBottom: 8
    },
    interruptionType: {
      fontSize: 16,
      color: _themeTokensColors.lightColors.text.muted,
      marginBottom: 16,
      textTransform: 'capitalize'
    },
    message: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 24
    },
    countdownContainer: {
      alignItems: 'center',
      marginBottom: 16
    },
    countdown: {
      fontSize: 48,
      fontWeight: '700',
      fontVariant: ['tabular-nums']
    },
    countdownLabel: {
      fontSize: 14,
      color: _themeTokensColors.lightColors.text.muted,
      marginTop: 4
    },
    progressBarContainer: {
      width: '100%',
      height: 8,
      backgroundColor: _themeTokensColors.lightColors.semantic.backgroundElevated,
      borderRadius: 4,
      marginBottom: 32,
      overflow: 'hidden'
    },
    progressBar: {
      height: '100%',
      borderRadius: 4
    },
    actions: {
      width: '100%',
      gap: 12
    },
    button: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center'
    },
    resumeButton: {
      backgroundColor: _themeTokensColors.lightColors.semantic.success
    },
    streakSaveButton: {
      backgroundColor: _themeTokensColors.lightColors.semantic.warning
    },
    abandonButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: _themeTokensColors.lightColors.semantic.danger
    },
    buttonText: {
      color: _themeTokensColors.lightColors.text.inverse,
      fontSize: 16,
      fontWeight: '600'
    },
    abandonButtonText: {
      color: _themeTokensColors.lightColors.semantic.danger,
      fontSize: 16,
      fontWeight: '600'
    },
    penaltyWarning: {
      marginTop: 16,
      fontSize: 12,
      color: _themeTokensColors.lightColors.semantic.danger,
      textAlign: 'center'
    }
  });
},3471,[1678,1465]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getSeverityColor = getSeverityColor;
  exports.getSeverityMessage = getSeverityMessage;
  exports.formatTime = formatTime;
  var _themeTokensColors = require(_dependencyMap[0]);
  function getSeverityColor(severity) {
    switch (severity) {
      case 'CRITICAL':
        return _themeTokensColors.lightColors.semantic.danger;
      case 'MAJOR':
        return _themeTokensColors.lightColors.semantic.warning;
      case 'MODERATE':
        return _themeTokensColors.lightColors.semantic.warning;
      case 'MINOR':
        return _themeTokensColors.lightColors.semantic.warning;
      default:
        return _themeTokensColors.lightColors.text.muted;
    }
  }
  function getSeverityMessage(severity) {
    switch (severity) {
      case 'CRITICAL':
        return 'Resume now to keep this session intact.';
      case 'MAJOR':
        return 'Big pause. You can still return cleanly.';
      case 'MODERATE':
        return 'Take a breath, then come back.';
      case 'MINOR':
        return 'Small pause. Keep the thread.';
      default:
        return 'Focus paused.';
    }
  }
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
},3472,[1465]);
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
  Object.defineProperty(exports, "ActiveSessionControlDock", {
    enumerable: true,
    get: function () {
      return ActiveSessionControlDock;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _componentsPremiumStyles = require(_dependencyMap[5]);
  var _iconsComponentsIcon = require(_dependencyMap[6]);
  var _utilsActiveSession = require(_dependencyMap[7]);
  var _themeTokensColors = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  const ActiveSessionControlDock = ({
    completionPercentage,
    isPaused,
    multiplierDays,
    phaseAccent,
    showMultiplierInfo,
    streakMultiplier,
    themeColors,
    onComplete,
    onEnd,
    onPauseResume,
    onToggleMultiplierInfo
  }) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
    entering: _reactNativeReanimated.FadeIn.delay(300),
    children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      px: "lg",
      pb: "xl",
      children: [completionPercentage >= 80 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
        onPress: onComplete,
        accessibilityLabel: completionPercentage >= 100 ? 'Complete focus session' : 'Finish focus session early',
        accessibilityRole: "button",
        accessibilityHint: "Ends this session and opens the completion reward screen",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          mb: "md",
          px: "lg",
          py: "md",
          borderRadius: "full",
          alignItems: "center",
          style: {
            backgroundColor: 'rgba(0,229,255,0.12)',
            borderWidth: 1,
            borderColor: 'rgba(0,229,255,0.25)'
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "label",
            style: {
              color: _themeTokensColors.lightColors.semantic.vexCyan
            },
            children: completionPercentage >= 100 ? 'Complete Session' : 'Finish Early'
          })
        })
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        style: Object.assign({}, (0, _componentsPremiumStyles.getPremiumCardStyle)('large'), {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          paddingHorizontal: 14,
          paddingVertical: 12,
          backgroundColor: (0, _utilsActiveSession.withAlpha)(themeColors.backgroundElevated, 0.88),
          borderColor: (0, _utilsActiveSession.withAlpha)(themeColors.border, 0.7)
        }),
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          onPress: onEnd,
          accessibilityLabel: "Quit focus session",
          accessibilityRole: "button",
          accessibilityHint: "Opens the confirmation to quit this focus session",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            style: {
              minWidth: 104,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 18,
              borderWidth: 1,
              paddingHorizontal: 18,
              paddingVertical: 14,
              backgroundColor: (0, _utilsActiveSession.withAlpha)(themeColors.error, 0.14),
              borderColor: (0, _utilsActiveSession.withAlpha)(themeColors.error, 0.32)
            },
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "label",
              style: {
                color: themeColors.error
              },
              children: "Quit"
            })
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          onPress: onPauseResume,
          accessibilityLabel: isPaused ? 'Resume session' : 'Pause session',
          accessibilityRole: "button",
          accessibilityHint: isPaused ? 'Restarts the active session' : 'Pauses the active session',
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            style: {
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: _themeTokensColors.lightColors.semantic.vexCyan
            },
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
              name: isPaused ? 'play' : 'minus',
              size: "lg",
              color: themeColors.inverse
            })
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          style: {
            position: 'relative'
          },
          children: [showMultiplierInfo ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
            entering: _reactNativeReanimated.FadeIn.duration(180),
            style: {
              position: 'absolute',
              right: 0,
              bottom: 72,
              width: 190,
              borderRadius: 16,
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: themeColors.backgroundElevated,
              borderColor: (0, _utilsActiveSession.withAlpha)(themeColors.border, 0.9)
            },
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.primary",
              children: `Your ${(0, _utilsActiveSession.formatMultiplier)(streakMultiplier)}x multiplier comes from your current ${multiplierDays}-day streak and applies to session rewards.`
            })
          }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
            onPress: onToggleMultiplierInfo,
            accessibilityLabel: "Show streak multiplier details",
            accessibilityRole: "button",
            accessibilityHint: "Explains how your current streak changes session rewards",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
              style: {},
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "label",
                style: {
                  color: _themeTokensColors.lightColors.semantic.vexCyan
                },
                children: `${(0, _utilsActiveSession.formatMultiplier)(streakMultiplier)}x`
              })
            })
          })]
        })]
      })]
    })
  });
},3473,[12,1286,226,1462,1489,3543,1691,3430,1465,203]);
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
  exports.ActiveSessionControlRecovery = ActiveSessionControlRecovery;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitives = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _iconsComponentsIcon = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  function ActiveSessionControlRecovery({
    failure,
    onDismiss,
    onRetry
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      px: "lg",
      pb: "md",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitives.Card, {
        size: "md",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
            name: "alert-circle",
            size: 20,
            color: "warning.DEFAULT"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flex: 1,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "h4",
              color: "text.primary",
              children: failure.title
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.secondary",
              style: {
                marginTop: 6
              },
              children: failure.message
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.tertiary",
              style: {
                marginTop: 6
              },
              children: failure.supportHint
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
              flexDirection: "row",
              gap: 10,
              mt: 12,
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
                onPress: onRetry,
                accessibilityLabel: `Retry ${failure.action} session action`,
                accessibilityRole: "button",
                accessibilityHint: "Attempts the failed session control again",
                children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
                  px: 14,
                  py: 10,
                  borderRadius: "lg",
                  bg: "primary.500",
                  children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                    variant: "label",
                    color: "text.inverse",
                    children: "Retry"
                  })
                })
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
                onPress: onDismiss,
                accessibilityLabel: "Dismiss session recovery warning",
                accessibilityRole: "button",
                accessibilityHint: "Keeps the session open and hides this recovery message",
                children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
                  px: 14,
                  py: 10,
                  borderRadius: "lg",
                  bg: "background.tertiary",
                  children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                    variant: "label",
                    color: "text.secondary",
                    children: "Keep focusing"
                  })
                })
              })]
            })]
          })]
        })
      })
    });
  }
},3474,[12,1286,1462,3048,1489,1691,203]);
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
  exports.ModeRescueSurface = ModeRescueSurface;
  exports.ModeActiveIndicatorBar = ModeActiveIndicatorBar;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _hooks = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function ModeRescueSurface({
    lane,
    onStart,
    onDismiss
  }) {
    const surface = (0, _hooks.useModeRescueSurface)(lane);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      mx: "md",
      my: "sm",
      p: "md",
      borderRadius: "lg",
      bg: "background.elevated",
      borderWidth: 1,
      borderColor: "border.light",
      gap: "sm",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "label",
        color: "text.primary",
        fontWeight: "600",
        children: surface.headline
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "caption",
        color: "text.secondary",
        children: surface.body
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        gap: "sm",
        mt: "xs",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          onPress: onStart,
          accessibilityLabel: surface.actionLabel,
          accessibilityRole: "button",
          accessibilityHint: `Starts a ${surface.suggestedDurationMinutes}-minute rescue session`,
          style: ({
            pressed
          }) => ({
            flex: 1,
            opacity: pressed ? 0.85 : 1
          }),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            minHeight: 44,
            borderRadius: "md",
            bg: "primary.500",
            justifyContent: "center",
            alignItems: "center",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
              variant: "label",
              color: "text.inverse",
              fontWeight: "600",
              children: [surface.actionLabel, " (", surface.suggestedDurationMinutes, "m)"]
            })
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          onPress: onDismiss,
          accessibilityLabel: "Dismiss rescue suggestion",
          accessibilityRole: "button",
          accessibilityHint: "Hides the rescue banner",
          style: ({
            pressed
          }) => ({
            paddingHorizontal: 16,
            minHeight: 44,
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1
          }),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.tertiary",
            children: "Not now"
          })
        })]
      })]
    });
  }

  // ── ModeActiveIndicator ────────────────────────────────────────────────

  function ModeActiveIndicatorBar({
    lane,
    completionPercentage
  }) {
    const indicator = (0, _hooks.useModeActiveIndicator)(lane);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      px: "md",
      py: "sm",
      gap: "xs",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          alignItems: "center",
          gap: "sm",
          children: [indicator.targetLabel ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.secondary",
            children: indicator.targetLabel
          }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.primary",
            fontWeight: "600",
            children: indicator.topLine
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.tertiary",
          children: [Math.round(completionPercentage), "%"]
        })]
      }), indicator.showProgressBar ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        height: 3,
        borderRadius: "full",
        bg: "background.secondary",
        overflow: "hidden",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          height: "100%",
          width: `${Math.min(100, completionPercentage)}%`,
          borderRadius: "full",
          bg: "primary.500"
        })
      }) : null]
    });
  }
},3475,[12,1286,1462,1489,3361,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "ENABLE_SESSION_COMPANION_LAYER", {
    enumerable: true,
    get: function () {
      return ENABLE_SESSION_COMPANION_LAYER;
    }
  });
  Object.defineProperty(exports, "ENABLE_SESSION_COACH_BANNER", {
    enumerable: true,
    get: function () {
      return ENABLE_SESSION_COACH_BANNER;
    }
  });
  Object.defineProperty(exports, "ENABLE_SESSION_MODE_OVERLAYS", {
    enumerable: true,
    get: function () {
      return ENABLE_SESSION_MODE_OVERLAYS;
    }
  });
  Object.defineProperty(exports, "ENABLE_SESSION_HERO", {
    enumerable: true,
    get: function () {
      return ENABLE_SESSION_HERO;
    }
  });
  const ENABLE_SESSION_COMPANION_LAYER = true;
  const ENABLE_SESSION_COACH_BANNER = true;
  const ENABLE_SESSION_MODE_OVERLAYS = true;
  const ENABLE_SESSION_HERO = true;
},3476,[]);
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
  exports.useSessionControlHandlers = useSessionControlHandlers;
  var _sentryReactNative = require(_dependencyMap[0]);
  var Sentry = _interopNamespace(_sentryReactNative);
  function useSessionControlHandlers(actions, showMultiplierInfo, _studyQuizBreak) {
    return {
      onClearControlFailure: actions.clearControlFailure,
      onRetryControlFailure: () => {
        actions.retryControlFailure().catch(error => {
          Sentry.captureException(error, {
            tags: {
              feature: 'session-controls'
            }
          });
        });
      },
      onComplete: () => {
        actions.handleComplete().catch(error => {
          Sentry.captureException(error, {
            tags: {
              feature: 'session-controls'
            }
          });
        });
      },
      onEnd: () => actions.setShowInterruption(true),
      onPauseResume: () => {
        actions.handlePauseResume().catch(error => {
          Sentry.captureException(error, {
            tags: {
              feature: 'session-controls'
            }
          });
        });
      },
      onToggleMultiplierInfo: () => actions.setShowMultiplierInfo(!showMultiplierInfo),
      onResume: () => actions.setShowInterruption(false),
      onAbandon: () => {
        actions.handleAbandon().catch(error => {
          Sentry.captureException(error, {
            tags: {
              feature: 'session-controls'
            }
          });
        });
      }
    };
  }
},3477,[834]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SessionNotices = SessionNotices;
  require(_dependencyMap[0]);
  var _componentsSessionContractReminder = require(_dependencyMap[1]);
  var _OfflineBanner = require(_dependencyMap[2]);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  function SessionNotices({
    isOffline,
    showContractReminder,
    contract,
    completionPercentage
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [isOffline ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_OfflineBanner.OfflineBanner, {}) : null, showContractReminder ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsSessionContractReminder.SessionContractReminder, {
        contract: contract,
        progressPercentage: completionPercentage
      }) : null]
    });
  }
},3478,[12,3479,3480,203]);
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
  exports.SessionContractReminder = SessionContractReminder;
  var _react = require(_dependencyMap[0]);
  var React = _interopDefault(_react);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _iconsComponentsIcon = require(_dependencyMap[4]);
  var _themeThemeContext = require(_dependencyMap[5]);
  var _utilsHaptics = require(_dependencyMap[6]);
  var _utilsTouchTarget = require(_dependencyMap[7]);
  var _featuresFocusContractService = require(_dependencyMap[8]);
  var _hooksUseReducedMotion = require(_dependencyMap[9]);
  var _reactJsxRuntime = require(_dependencyMap[10]);
  function SessionContractReminder({
    contract,
    progressPercentage
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      isReducedMotion
    } = (0, _hooksUseReducedMotion.useReducedMotion)();
    const [dismissedStages, setDismissedStages] = React.default.useState([]);
    const stage = (0, _featuresFocusContractService.getContractReminderStage)(contract, progressPercentage);
    if (!contract || !stage || dismissedStages.includes(stage)) {
      return null;
    }
    const handleDismiss = () => {
      setDismissedStages(current => Array.from(new Set([...current, stage])));
      if (!isReducedMotion) {
        (0, _utilsHaptics.triggerHaptic)('impactLight');
      }
    };
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      px: "lg",
      mt: "sm",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        bg: "background.elevated",
        borderColor: "border.light",
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        p: "sm",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.secondary",
          numberOfLines: 2,
          flex: 1,
          children: [stage === 'early' ? 'You chose ' : 'Final stretch for ', contract.taskDescription]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          accessibilityHint: "Hides the focus contract reminder for this session",
          accessibilityLabel: "Dismiss focus contract reminder",
          accessibilityRole: "button",
          hitSlop: _utilsTouchTarget.StandardHitSlops.ICON,
          onPress: handleDismiss,
          style: (0, _utilsTouchTarget.getMinTouchTargetStyle)(),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
              name: "x",
              size: "sm",
              color: theme.colors.text.secondary
            })
          })
        })]
      })
    });
  }
},3479,[12,1286,1462,1489,1691,1463,1683,2157,3300,1681,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.OfflineBanner = OfflineBanner;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  function OfflineBanner() {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      bg: "warning.light",
      px: "sm",
      py: "xs",
      alignItems: "center",
      accessibilityLabel: "You are offline. Data will sync when connection returns.",
      accessibilityRole: "alert",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "caption",
        color: "text.primary",
        children: "You are offline. Data will sync when connection returns."
      })
    });
  }
},3480,[12,1462,1489,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "SessionCompleteScreen", {
    enumerable: true,
    get: function () {
      return SessionCompleteScreen;
    }
  });
  require(_dependencyMap[0]);
  var _featuresSessionCompletionRoute = require(_dependencyMap[1]);
  var _featuresSessionCompletionHooks = require(_dependencyMap[2]);
  var _componentsSessionCompleteContent = require(_dependencyMap[3]);
  var _componentsSessionCompleteSkeleton = require(_dependencyMap[4]);
  var _componentsSessionSummaryUnavailable = require(_dependencyMap[5]);
  var _store = require(_dependencyMap[6]);
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  const SessionCompleteScreen = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(function SessionCompleteScreen() {
    const {
      navigation,
      parsedRoute
    } = (0, _featuresSessionCompletionRoute.useSessionCompletionRouteState)();
    const recoveredCompletion = (0, _featuresSessionCompletionHooks.useRecoveredSessionCompletion)(parsedRoute.recoverySessionId);
    if (!parsedRoute.params) {
      if (recoveredCompletion.isPending && parsedRoute.recoverySessionId) {
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsSessionCompleteSkeleton.SessionCompleteSkeleton, {});
      }
      if (recoveredCompletion.data) {
        return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(SessionCompleteResolved, {
          params: recoveredCompletion.data
        });
      }
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsSessionSummaryUnavailable.SessionSummaryUnavailable, {
        message: recoveredCompletion.isPending && parsedRoute.recoverySessionId ? 'VEX is rebuilding this win from your saved completion record.' : parsedRoute.warningMessage ?? undefined,
        onDone: () => navigation.navigate({
          name: 'Main',
          params: {}
        }),
        onRetry: parsedRoute.recoverySessionId && recoveredCompletion.isError ? () => {
          recoveredCompletion.refetch();
        } : undefined
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(SessionCompleteResolved, {
      params: parsedRoute.params
    });
  }, 'Session Complete');
  function SessionCompleteResolved({
    params
  }) {
    const {
      user
    } = (0, _store.useAuthStore)();
    const userId = user?.id ?? null;
    const consequences = (0, _featuresSessionCompletionHooks.useSessionCompletionConsequences)({
      summary: params.summary,
      userId
    });
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsSessionCompleteContent.SessionCompleteContent, {
      sessionId: params.sessionId,
      summary: params.summary,
      consequences: consequences
    });
  }
},3481,[12,3323,2450,3482,3532,3533,1705,2166,203]);
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
  exports.SessionCompleteContent = SessionCompleteContent;
  var _react = require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _reactNativeSafeAreaContext = require(_dependencyMap[2]);
  var _utilsHaptics = require(_dependencyMap[3]);
  var _featuresSessionCompletionCompletionExperiencePolicy = require(_dependencyMap[4]);
  var _featuresSessionCompletionHooks = require(_dependencyMap[5]);
  var _featuresHomeSpineHooks = require(_dependencyMap[6]);
  var _featuresFocusContractHooks = require(_dependencyMap[7]);
  var _featuresHomeSpineTomorrowPreviewService = require(_dependencyMap[8]);
  var _featuresLiveopsConfig = require(_dependencyMap[9]);
  var _featuresOnboardingStore = require(_dependencyMap[10]);
  var _sharedMonetizationUseRevenuecat = require(_dependencyMap[11]);
  var _featuresSessionCompletionComponentsFeatureUnlockCelebration = require(_dependencyMap[12]);
  var _SessionCompleteOverlays = require(_dependencyMap[13]);
  var _SessionCompleteScrollView = require(_dependencyMap[14]);
  var _SessionCompleteContentTypes = require(_dependencyMap[15]);
  var _reactJsxRuntime = require(_dependencyMap[16]);
  function SessionCompleteContent({
    sessionId,
    summary,
    consequences
  }) {
    const insets = (0, _reactNativeSafeAreaContext.useSafeAreaInsets)();
    const bottomSheetRef = (0, _react.useRef)(null);
    const [gradeRevealed, setGradeRevealed] = (0, _react.useState)(false);
    const [unlockFeatureIndex, setUnlockFeatureIndex] = (0, _react.useState)(0);
    const [showUnlockCelebration, setShowUnlockCelebration] = (0, _react.useState)(false);
    const controller = (0, _featuresSessionCompletionHooks.useSessionCompleteController)({
      sessionId,
      summary
    });
    const contractQuery = (0, _featuresFocusContractHooks.useContractForSession)(sessionId);
    const featureAccess = (0, _featuresLiveopsConfig.useFeatureAccess)();
    const motivationProfile = (0, _featuresOnboardingStore.useOnboardingStore)(state => state.motivationProfile);
    const primaryGoal = (0, _featuresOnboardingStore.useOnboardingStore)(state => state.goal);
    const premiumStatus = (0, _sharedMonetizationUseRevenuecat.usePremiumStatus)();
    const reflectContract = (0, _featuresFocusContractHooks.useReflectOnContract)();
    const newlyUnlockedFeatures = consequences?.newlyUnlockedFeatures ?? [];
    (0, _react.useEffect)(() => {
      if (gradeRevealed && newlyUnlockedFeatures.length > 0) {
        const timer = setTimeout(() => {
          setUnlockFeatureIndex(0);
          setShowUnlockCelebration(true);
        }, 400);
        return () => clearTimeout(timer);
      }
      return undefined;
    }, [gradeRevealed, newlyUnlockedFeatures.length]);
    const policy = (0, _featuresSessionCompletionCompletionExperiencePolicy.resolveCompletionExperiencePolicy)({
      consequences,
      featureAvailability: {
        boss: featureAccess.features.boss_tab.isVisible,
        challenges: featureAccess.features.challenges.isVisible,
        contractUsed: Boolean(contractQuery.contract),
        progress: featureAccess.features.progress_view.isVisible,
        study: featureAccess.features.content_study.isVisible
      },
      firstWeekStage: featureAccess.stage,
      motivationStyle: motivationProfile?.primary ?? 'calm',
      premiumState: premiumStatus.isPremium ? 'premium' : 'free',
      primaryGoal,
      sessionMode: summary.sessionMode,
      summary
    });
    const revealedGradeLetter = controller.grade.letter === 'F' ? 'D' : controller.grade.letter;
    const tomorrowPreview = (0, _featuresHomeSpineHooks.useTomorrowPreviewForSession)(controller.userId ?? '', {
      userId: controller.userId ?? '',
      currentStreakDays: summary.streakDays ?? 0,
      streakWillContinue: summary.streakMaintained,
      bossData: consequences?.boss ? {
        bossName: consequences.boss.bossName,
        healthPercent: consequences.boss.healthAfter,
        canDefeatTomorrow: consequences.boss.healthAfter <= 25
      } : null
    });
    (0, _react.useEffect)(() => {
      if (tomorrowPreview && controller.userId) {
        (0, _featuresHomeSpineTomorrowPreviewService.saveTomorrowPreview)(controller.userId, tomorrowPreview);
      }
    }, [tomorrowPreview, controller.userId]);
    (0, _react.useEffect)(() => {
      (0, _utilsHaptics.sessionComplete)();
    }, []);
    const lane = (0, _react.useMemo)(() => _SessionCompleteContentTypes.SESSION_MODE_TO_LANE[summary.sessionMode] ?? 'minimal_normal', [summary.sessionMode]);
    const handleGradeRevealComplete = (0, _react.useCallback)(() => {
      setGradeRevealed(true);
    }, []);
    const handleReflectContract = (0, _react.useCallback)(status => {
      if (!contractQuery.contract) return;
      reflectContract.mutate({
        contract: contractQuery.contract,
        status
      });
    }, [contractQuery.contract, reflectContract]);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeIn.duration(250),
      style: {
        backgroundColor: controller.theme.colors.background.primary,
        flex: 1
      },
      children: [gradeRevealed ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionCompleteScrollView.SessionCompleteScrollView, {
        controller: controller,
        summary: summary,
        sessionId: sessionId,
        policy: policy,
        consequences: consequences,
        contract: contractQuery.contract,
        isContractPending: reflectContract.isPending,
        lane: lane,
        tomorrowPreview: tomorrowPreview,
        insets: insets,
        onReflectContract: handleReflectContract,
        onOpenReflection: () => bottomSheetRef.current?.snapToIndex(0)
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionCompleteOverlays.SessionCompleteOverlays, {
        controller: controller,
        summary: summary,
        gradeRevealed: gradeRevealed,
        revealedGradeLetter: revealedGradeLetter,
        onGradeRevealComplete: handleGradeRevealComplete,
        bottomSheetRef: bottomSheetRef
      }), showUnlockCelebration && newlyUnlockedFeatures.length > 0 && newlyUnlockedFeatures[unlockFeatureIndex] ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionCompletionComponentsFeatureUnlockCelebration.FeatureUnlockCelebration, {
        featureKey: newlyUnlockedFeatures[unlockFeatureIndex],
        onDismiss: () => {
          const nextIndex = unlockFeatureIndex + 1;
          if (nextIndex < newlyUnlockedFeatures.length) {
            setUnlockFeatureIndex(nextIndex);
          } else {
            setShowUnlockCelebration(false);
          }
        }
      }) : null]
    });
  }
},3482,[12,226,719,1683,3291,2450,2306,3417,2351,1956,1892,3115,3483,3494,3502,3531,203]);
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
  exports.FeatureUnlockCelebration = FeatureUnlockCelebration;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _hooksUseReducedMotion = require(_dependencyMap[3]);
  var _themeTokensMotion = require(_dependencyMap[4]);
  var _utilsHaptics = require(_dependencyMap[5]);
  var _unlockExplainerService = require(_dependencyMap[6]);
  var _CelebrationOverlay = require(_dependencyMap[7]);
  var _featureUnlockHelpers = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  const _worklet_17114515397031_init_data = {
    code: "function FeatureUnlockCelebrationTsx1(){const{overlayOpacity}=this.__closure;return{opacity:overlayOpacity.value};}"
  };
  function FeatureUnlockCelebration({
    featureKey,
    onDismiss
  }) {
    const {
      isReducedMotion
    } = (0, _hooksUseReducedMotion.useReducedMotion)();
    const overlayOpacity = (0, _reactNativeReanimated.useSharedValue)(isReducedMotion ? 1 : 0);
    const gate = (0, _react.useMemo)(() => (0, _featureUnlockHelpers.findGate)(featureKey), [featureKey]);
    const display = (0, _react.useMemo)(() => (0, _featureUnlockHelpers.resolveFeatureDisplay)(featureKey, gate), [featureKey, gate]);
    const decision = (0, _react.useMemo)(() => (0, _unlockExplainerService.createUnlockDecision)({
      featureKey,
      sessionCount: 1,
      isPremium: false,
      hasRelatedBehavior: false
    }), [featureKey]);
    (0, _react.useEffect)(() => {
      void (0, _utilsHaptics.featureUnlocked)();
      if (isReducedMotion) {
        return;
      }
      overlayOpacity.value = (0, _reactNativeReanimated.withTiming)(1, {
        duration: 200,
        easing: _reactNativeReanimated.Easing.bezier(..._themeTokensMotion.timingPresets.microFade.easing)
      });
    }, [isReducedMotion, overlayOpacity]);
    const overlayStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function FeatureUnlockCelebrationTsx1Factory({
      _worklet_17114515397031_init_data,
      overlayOpacity
    }) {
      const FeatureUnlockCelebrationTsx1 = () => ({
        opacity: overlayOpacity.value
      });
      FeatureUnlockCelebrationTsx1.__closure = {
        overlayOpacity
      };
      FeatureUnlockCelebrationTsx1.__workletHash = 17114515397031;
      FeatureUnlockCelebrationTsx1.__initData = _worklet_17114515397031_init_data;
      return FeatureUnlockCelebrationTsx1;
    }({
      _worklet_17114515397031_init_data,
      overlayOpacity
    }));
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
      style: [{
        alignItems: 'center',
        backgroundColor: 'rgba(10, 53, 43, 0.62)',
        bottom: 0,
        justifyContent: 'center',
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1000
      }, overlayStyle],
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
        onPress: onDismiss,
        accessibilityLabel: "Dismiss feature unlock",
        accessibilityRole: "button",
        accessibilityHint: "Closes this feature unlock celebration",
        style: {
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0
        }
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_CelebrationOverlay.CelebrationOverlay, {
        featureColor: display.color,
        featureIcon: display.icon,
        featureName: display.name,
        featureDescription: display.description,
        decision: decision,
        onDismiss: onDismiss
      })]
    });
  }
},3483,[12,1286,226,1681,1682,1683,3484,3488,3493,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "createUnlockDecision", {
    enumerable: true,
    get: function () {
      return _unlockDecision.createUnlockDecision;
    }
  });
  exports.getUnlockExplainerCopy = getUnlockExplainerCopy;
  exports.isFeatureVisible = isFeatureVisible;
  var _unlockDecision = require(_dependencyMap[0]);
  function getUnlockExplainerCopy(decision) {
    const base = {
      body: decision.userFacingReason,
      cta: decision.canHide ? 'Got it' : null,
      title: decision.decision === 'unlocked' ? `${decision.featureKey} unlocked` : decision.decision === 'teased' ? `${decision.featureKey} coming soon` : decision.decision === 'blocked' ? `${decision.featureKey} unavailable` : ''
    };
    return base;
  }
  function isFeatureVisible(decision) {
    return decision.decision !== 'hidden';
  }
},3484,[3485]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.createUnlockDecision = createUnlockDecision;
  var _schemas = require(_dependencyMap[0]);
  var _laneFit = require(_dependencyMap[1]);
  function createUnlockDecision(rawInput) {
    const input = _schemas.UnlockExplainerInputSchema.parse(rawInput);
    const now = Date.now();
    const laneFit = (0, _laneFit.resolveLaneFit)(input.featureKey, input.laneProfile);
    if (_laneFit.NEVER_UNLOCK.has(input.featureKey)) {
      return _schemas.UnlockDecisionSchema.parse({
        featureKey: input.featureKey,
        decision: 'hidden',
        reasonCode: 'final_release_deactivated',
        userFacingReason: (0, _schemas.buildUserFacingReason)('never_unlock_baseline', {
          featureKey: input.featureKey,
          lane: input.laneProfile,
          sessionCount: input.sessionCount,
          minSessions: 0,
          laneFit: 'blocked',
          isPremium: input.isPremium,
          hasRelatedBehavior: input.hasRelatedBehavior
        }),
        evidence: [],
        laneFit: _schemas.LaneFitSchema.options[3],
        canHide: false,
        canReconsiderAtSessionCount: null
      });
    }
    if (input.manualOverride) {
      return _schemas.UnlockDecisionSchema.parse({
        featureKey: input.featureKey,
        decision: input.manualOverride,
        reasonCode: 'manual_override',
        userFacingReason: 'You chose this setting.',
        evidence: [{
          source: 'manual_override',
          detail: input.manualOverride,
          observedAt: now
        }],
        laneFit,
        canHide: input.manualOverride !== 'hidden',
        canReconsiderAtSessionCount: null
      });
    }
    if (input.sessionCount === 0) {
      if (laneFit === 'blocked') {
        return _schemas.UnlockDecisionSchema.parse({
          featureKey: input.featureKey,
          decision: 'blocked',
          reasonCode: 'lane_blocked',
          userFacingReason: (0, _schemas.buildUserFacingReason)('lane_blocked', {
            featureKey: input.featureKey,
            lane: input.laneProfile,
            sessionCount: input.sessionCount,
            minSessions: 3,
            laneFit: 'blocked',
            isPremium: input.isPremium,
            hasRelatedBehavior: input.hasRelatedBehavior
          }),
          evidence: [{
            source: 'lane_profile',
            detail: `lane:${input.laneProfile ?? 'unknown'}`,
            observedAt: now
          }],
          laneFit: 'blocked',
          canHide: false,
          canReconsiderAtSessionCount: input.sessionCount + 3
        });
      }
      const isCoreFeature = ['focus_session', 'home_tab', 'profile_tab', 'focus_tab'].includes(input.featureKey);
      const reasonCode = isCoreFeature ? 'day_zero_core' : 'day_zero_tease';
      return _schemas.UnlockDecisionSchema.parse({
        featureKey: input.featureKey,
        decision: isCoreFeature ? 'unlocked' : 'teased',
        reasonCode,
        userFacingReason: (0, _schemas.buildUserFacingReason)(reasonCode, {
          featureKey: input.featureKey,
          lane: input.laneProfile,
          sessionCount: input.sessionCount,
          minSessions: 1,
          laneFit,
          isPremium: input.isPremium,
          hasRelatedBehavior: input.hasRelatedBehavior
        }),
        evidence: [{
          source: 'cold_start',
          detail: `sessionCount:${input.sessionCount}`,
          observedAt: now
        }],
        laneFit,
        canHide: !isCoreFeature,
        canReconsiderAtSessionCount: isCoreFeature ? null : 1
      });
    }
    if (laneFit === 'blocked') {
      return _schemas.UnlockDecisionSchema.parse({
        featureKey: input.featureKey,
        decision: 'blocked',
        reasonCode: 'lane_blocked',
        userFacingReason: (0, _schemas.buildUserFacingReason)('lane_blocked', {
          featureKey: input.featureKey,
          lane: input.laneProfile,
          sessionCount: input.sessionCount,
          minSessions: 3,
          laneFit: 'blocked',
          isPremium: input.isPremium,
          hasRelatedBehavior: input.hasRelatedBehavior
        }),
        evidence: [{
          source: 'lane_profile',
          detail: `lane:${input.laneProfile ?? 'unknown'}`,
          observedAt: now
        }],
        laneFit: 'blocked',
        canHide: false,
        canReconsiderAtSessionCount: input.sessionCount + 3
      });
    }
    const minSessions = (0, _laneFit.resolveMinSessions)(laneFit, input.laneProfile);
    const isUnlocked = input.sessionCount >= minSessions;
    const reasonCode = isUnlocked ? 'unlocked_after_sessions' : 'teased_before_sessions';
    return _schemas.UnlockDecisionSchema.parse({
      featureKey: input.featureKey,
      decision: isUnlocked ? 'unlocked' : 'teased',
      reasonCode,
      userFacingReason: (0, _schemas.buildUserFacingReason)(reasonCode, {
        featureKey: input.featureKey,
        lane: input.laneProfile,
        sessionCount: input.sessionCount,
        minSessions,
        laneFit,
        isPremium: input.isPremium,
        hasRelatedBehavior: input.hasRelatedBehavior
      }),
      evidence: [{
        source: 'session_count',
        detail: `sessions:${input.sessionCount}`,
        observedAt: now
      }, {
        source: 'lane_profile',
        detail: `lane:${input.laneProfile ?? 'unknown'}`,
        observedAt: now
      }],
      laneFit,
      canHide: input.sessionCount >= minSessions,
      canReconsiderAtSessionCount: isUnlocked ? null : minSessions
    });
  }
},3485,[3486,3487]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "UnlockDecisionTypeSchema", {
    enumerable: true,
    get: function () {
      return UnlockDecisionTypeSchema;
    }
  });
  Object.defineProperty(exports, "LaneFitSchema", {
    enumerable: true,
    get: function () {
      return LaneFitSchema;
    }
  });
  Object.defineProperty(exports, "UnlockEvidenceSchema", {
    enumerable: true,
    get: function () {
      return UnlockEvidenceSchema;
    }
  });
  Object.defineProperty(exports, "UnlockDecisionSchema", {
    enumerable: true,
    get: function () {
      return UnlockDecisionSchema;
    }
  });
  Object.defineProperty(exports, "UnlockExplainerInputSchema", {
    enumerable: true,
    get: function () {
      return UnlockExplainerInputSchema;
    }
  });
  Object.defineProperty(exports, "UnlockReasonCodeSchema", {
    enumerable: true,
    get: function () {
      return UnlockReasonCodeSchema;
    }
  });
  exports.buildUserFacingReason = buildUserFacingReason;
  var _zod = require(_dependencyMap[0]);
  var _laneEngineSchemas = require(_dependencyMap[1]);
  const UnlockDecisionTypeSchema = _zod.z.enum(['hidden', 'teased', 'unlocked', 'blocked', 'degraded']);
  const LaneFitSchema = _zod.z.enum(['strong', 'medium', 'weak', 'blocked']);
  const UnlockEvidenceSchema = _zod.z.object({
    source: _zod.z.enum(['onboarding', 'session_count', 'behavior', 'lane_profile', 'manual_override', 'cold_start']),
    detail: _zod.z.string().min(1),
    observedAt: _zod.z.number().int().min(0)
  }).strict();
  const UnlockDecisionSchema = _zod.z.object({
    featureKey: _zod.z.string().min(1),
    decision: UnlockDecisionTypeSchema,
    reasonCode: _zod.z.string().min(1),
    userFacingReason: _zod.z.string().min(1),
    evidence: _zod.z.array(UnlockEvidenceSchema),
    laneFit: LaneFitSchema,
    canHide: _zod.z.boolean(),
    canReconsiderAtSessionCount: _zod.z.number().int().min(0).nullable()
  }).strict();
  const UnlockExplainerInputSchema = _zod.z.object({
    featureKey: _zod.z.string().min(1),
    laneProfile: _laneEngineSchemas.LaneSchema.optional(),
    sessionCount: _zod.z.number().int().min(0),
    isPremium: _zod.z.boolean().optional().default(false),
    hasRelatedBehavior: _zod.z.boolean().optional().default(false),
    manualOverride: _zod.z.enum(['hidden', 'teased', 'unlocked', 'blocked', 'degraded']).optional()
  }).strict();
  const UnlockReasonCodeSchema = _zod.z.enum(['day_zero_core', 'day_zero_tease', 'final_release_deactivated', 'lane_blocked', 'manual_override', 'teased_before_sessions', 'unlocked_after_sessions', 'degraded_premium_blocked', 'hidden_by_user', 'never_unlock_baseline', 'minimal_lane_fewer_unlocks']);
  /**
   * Evidence-based, lane-aware, non-manipulative user-facing reason text.
   *
   * Rules:
   * - No FOMO copy.
   * - Cites actual evidence (session count, behavior, lane fit).
   * - Blocked features explain why they're not shown.
   * - Degraded premium does not tease.
   */
  function buildUserFacingReason(reasonCode, context) {
    const {
      featureKey,
      lane,
      sessionCount,
      minSessions,
      laneFit
    } = context;
    const featureNames = {
      boss_tab: 'Boss encounters',
      focus_session: 'Focus sessions',
      home_tab: 'Home tab',
      profile_tab: 'Profile tab',
      focus_tab: 'Focus tab',
      project_thread: 'Project Thread',
      rescue_cta: 'Rescue mode',
      run_board: 'Run Board',
      study_os: 'Study tools',
      today_strip: 'Today Strip'
    };
    const name = featureNames[featureKey] ?? featureKey;
    switch (reasonCode) {
      case 'day_zero_core':
        return `Because ${name} are essential, VEX opened them from your first session.`;
      case 'day_zero_tease':
        return 'Available after your first session. You are not locked out — just warming up.';
      case 'final_release_deactivated':
        return 'This feature is not available in the current version.';
      case 'lane_blocked':
        if (lane === 'minimal_normal') {
          return `Because you prefer a clean, distraction-free experience, VEX kept ${name} away from your Home. You can change this in settings.`;
        }
        return 'Not available for your current experience style. You can change this in settings.';
      case 'manual_override':
        return 'You chose this setting.';
      case 'teased_before_sessions':
        {
          if (lane === 'student' && featureKey === 'study_os') {
            return `Because you have completed ${sessionCount} of ${minSessions} study blocks, VEX will open Study tools after ${minSessions - sessionCount} more.`;
          }
          if (lane === 'game_like' && featureKey === 'run_board') {
            return `Because momentum builds with each encounter, VEX will open Run Board after ${minSessions - sessionCount} more sessions.`;
          }
          if (lane === 'deep_creative' && featureKey === 'project_thread') {
            return `Because you keep returning to the same project, VEX will open Project Thread after ${minSessions - sessionCount} more sessions.`;
          }
          if (lane === 'minimal_normal') {
            return `Because you dismiss extra systems, VEX kept your Home clean. ${name} available after ${minSessions - sessionCount} more sessions if you want it.`;
          }
          return `Available after ${minSessions} completed sessions.`;
        }
      case 'unlocked_after_sessions':
        {
          if (lane === 'student' && featureKey === 'study_os') {
            return `Because you completed ${sessionCount} study blocks, VEX opened Study tools.`;
          }
          if (lane === 'game_like' && featureKey === 'run_board') {
            return 'Because you respond well to momentum, VEX opened Run Mode.';
          }
          if (lane === 'deep_creative' && featureKey === 'project_thread') {
            return 'Because you keep returning to the same project, VEX opened Project Thread.';
          }
          if (lane === 'minimal_normal') {
            return `Because you dismiss extra systems, VEX kept your Home clean. ${name} is open if you want it.`;
          }
          if (laneFit === 'strong') {
            return `Because ${name} fits how you work, VEX opened it after ${sessionCount} sessions.`;
          }
          return `Because of your progress, VEX opened ${name}.`;
        }
      case 'degraded_premium_blocked':
        return 'This feature requires premium. It is not teasing you — it stays quiet until you upgrade.';
      case 'hidden_by_user':
        return 'You chose to hide this. Reconsider from Settings at any time.';
      case 'never_unlock_baseline':
        return `${name} will never unlock — VEX does not push monetization, gamble, or store mechanics.`;
      case 'minimal_lane_fewer_unlocks':
        return 'Because you prefer a clean experience, VEX shows fewer new features.';
      default:
        return 'Available when it helps you most.';
    }
  }
},3486,[1774,1889]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "LANE_FEATURE_FIT", {
    enumerable: true,
    get: function () {
      return LANE_FEATURE_FIT;
    }
  });
  Object.defineProperty(exports, "NEVER_UNLOCK", {
    enumerable: true,
    get: function () {
      return NEVER_UNLOCK;
    }
  });
  exports.resolveLaneFit = resolveLaneFit;
  exports.resolveMinSessions = resolveMinSessions;
  /**
   * Lane-fit feature matrix and session threshold lookup.
   * Extracted from service.ts to keep file under 200 lines.
   */

  const LANE_FEATURE_FIT = {
    study_os: {
      student: 'strong',
      deep_creative: 'medium',
      game_like: 'weak',
      minimal_normal: 'weak'
    },
    run_board: {
      game_like: 'strong',
      student: 'weak',
      deep_creative: 'weak',
      minimal_normal: 'blocked'
    },
    project_thread: {
      deep_creative: 'strong',
      student: 'medium',
      game_like: 'weak',
      minimal_normal: 'weak'
    },
    today_strip: {
      minimal_normal: 'strong',
      deep_creative: 'medium',
      student: 'medium',
      game_like: 'weak'
    },
    boss_tab: {
      game_like: 'strong',
      student: 'weak',
      deep_creative: 'weak',
      minimal_normal: 'blocked'
    },
    rescue_cta: {
      student: 'strong',
      deep_creative: 'strong',
      game_like: 'medium',
      minimal_normal: 'medium'
    }
  };
  const NEVER_UNLOCK = new Set(['shop', 'inventory', 'wagers', 'battle_pass', 'premium_currency', 'streak_insurance', 'gems_prominent', 'economy_advanced', 'economy_basic']);
  function resolveLaneFit(featureKey, lane) {
    const map = LANE_FEATURE_FIT[featureKey];
    if (!map) {
      return 'medium';
    }
    if (!lane) {
      return 'weak';
    }
    return map[lane] ?? 'medium';
  }
  function resolveMinSessions(laneFit, lane) {
    if (laneFit === 'strong') {
      return 1;
    }
    if (laneFit === 'medium') {
      return 3;
    }
    // minimal_normal: fewer unlocks — higher threshold
    if (lane === 'minimal_normal') {
      return 7;
    }
    return 5;
  }
},3487,[]);
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
  exports.CelebrationOverlay = CelebrationOverlay;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeWebDistExportsUseWindowDimensions = require(_dependencyMap[3]);
  var useWindowDimensions = _interopDefault(_reactNativeWebDistExportsUseWindowDimensions);
  var _reactNativeReanimated = require(_dependencyMap[4]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsGlassGlassCard = require(_dependencyMap[5]);
  var _componentsGlassLiquidButton = require(_dependencyMap[6]);
  var _componentsPrimitivesText = require(_dependencyMap[7]);
  var _iconsComponentsIcon = require(_dependencyMap[8]);
  var _hooksUseReducedMotion = require(_dependencyMap[9]);
  var _themeTokensMotion = require(_dependencyMap[10]);
  var _themeTokensVexLightGlass = require(_dependencyMap[11]);
  var _themeTokensSpacing = require(_dependencyMap[12]);
  var _utilsHaptics = require(_dependencyMap[13]);
  var _EvidenceRow = require(_dependencyMap[14]);
  var _CelebrationHeader = require(_dependencyMap[15]);
  var _UnlockIconBurst = require(_dependencyMap[16]);
  var _GlowParticle = require(_dependencyMap[17]);
  var _featureUnlockHelpers = require(_dependencyMap[18]);
  var _reactJsxRuntime = require(_dependencyMap[19]);
  const CARD_WIDTH_OFFSET = 48;
  const CARD_MAX_WIDTH = 380;
  const _worklet_9172240172847_init_data = {
    code: "function CelebrationOverlayTsx1(){const{cardOpacity,cardTranslateY}=this.__closure;return{opacity:cardOpacity.value,transform:[{translateY:cardTranslateY.value}]};}"
  };
  function CelebrationOverlay({
    featureColor,
    featureIcon,
    featureName,
    featureDescription,
    decision,
    onDismiss
  }) {
    const {
      isReducedMotion
    } = (0, _hooksUseReducedMotion.useReducedMotion)();
    const {
      width: SCREEN_WIDTH
    } = (0, useWindowDimensions.default)();
    const [showEvidence, setShowEvidence] = (0, _react.useState)(false);
    const cardTranslateY = (0, _reactNativeReanimated.useSharedValue)(isReducedMotion ? 0 : 120);
    const cardOpacity = (0, _reactNativeReanimated.useSharedValue)(isReducedMotion ? 1 : 0);
    (0, _react.useEffect)(() => {
      if (isReducedMotion) {
        return;
      }
      cardTranslateY.value = (0, _reactNativeReanimated.withDelay)(180, (0, _reactNativeReanimated.withSpring)(0, {
        damping: _themeTokensMotion.springPresets.settle.damping,
        stiffness: _themeTokensMotion.springPresets.settle.stiffness,
        mass: _themeTokensMotion.springPresets.settle.mass
      }));
      cardOpacity.value = (0, _reactNativeReanimated.withTiming)(1, {
        duration: _themeTokensMotion.timingPresets.cinematicReveal.duration,
        easing: _reactNativeReanimated.Easing.bezier(..._themeTokensMotion.timingPresets.cinematicReveal.easing)
      });
    }, [isReducedMotion, cardTranslateY, cardOpacity]);
    const cardStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function CelebrationOverlayTsx1Factory({
      _worklet_9172240172847_init_data,
      cardOpacity,
      cardTranslateY
    }) {
      const CelebrationOverlayTsx1 = () => ({
        opacity: cardOpacity.value,
        transform: [{
          translateY: cardTranslateY.value
        }]
      });
      CelebrationOverlayTsx1.__closure = {
        cardOpacity,
        cardTranslateY
      };
      CelebrationOverlayTsx1.__workletHash = 9172240172847;
      CelebrationOverlayTsx1.__initData = _worklet_9172240172847_init_data;
      return CelebrationOverlayTsx1;
    }({
      _worklet_9172240172847_init_data,
      cardOpacity,
      cardTranslateY
    }));
    const handleDismiss = (0, _react.useCallback)(() => {
      (0, _utilsHaptics.triggerHaptic)('impactLight');
      onDismiss();
    }, [onDismiss]);
    const toggleLabel = showEvidence ? 'Hide details' : 'Why am I seeing this?';
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
      style: [{
        width: SCREEN_WIDTH - CARD_WIDTH_OFFSET,
        maxWidth: CARD_MAX_WIDTH
      }, cardStyle],
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          alignItems: 'center',
          marginBottom: _themeTokensSpacing.spacing[4]
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_UnlockIconBurst.UnlockIconBurst, {
          icon: featureIcon,
          color: featureColor
        }), Array.from({
          length: _featureUnlockHelpers.GLOW_PARTICLES
        }).map((_, i) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_GlowParticle.GlowParticle, {
          color: _featureUnlockHelpers.GLOW_COLORS[i % _featureUnlockHelpers.GLOW_COLORS.length],
          index: i
        }, `glow-${i}`))]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsGlassGlassCard.GlassCard, {
        variant: "hero",
        glowMint: true,
        padding: 24,
        radius: 28,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            alignItems: 'center',
            gap: _themeTokensSpacing.spacing[3],
            zIndex: 2
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_CelebrationHeader.CelebrationHeader, {
            featureColor: featureColor,
            featureName: featureName,
            featureDescription: featureDescription
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: {
              backgroundColor: _themeTokensVexLightGlass.vexLightGlass.background.atmosphericMint,
              borderRadius: 16,
              padding: _themeTokensSpacing.spacing[3],
              width: '100%'
            },
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              style: {
                color: _themeTokensVexLightGlass.vexLightGlass.text.onMint,
                fontSize: 13,
                lineHeight: 18
              },
              children: decision.userFacingReason
            })
          }), decision.evidence.length > 0 && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Pressable.default, {
            onPress: () => setShowEvidence(v => !v),
            accessibilityLabel: "Why am I seeing this",
            accessibilityRole: "button",
            accessibilityHint: "Shows or hides evidence for this celebration",
            style: {
              alignItems: 'center',
              flexDirection: 'row',
              gap: _themeTokensSpacing.spacing[1],
              width: '100%'
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
              color: _themeTokensVexLightGlass.vexLightGlass.mint[500],
              name: showEvidence ? 'chevronDown' : 'chevronRight',
              size: "xs"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              style: {
                color: _themeTokensVexLightGlass.vexLightGlass.mint[500],
                fontSize: 12,
                fontWeight: '700'
              },
              children: toggleLabel
            })]
          }), showEvidence && decision.evidence.length > 0 && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: {
              backgroundColor: _themeTokensVexLightGlass.vexLightGlass.background.atmosphericPearl,
              borderRadius: 16,
              borderColor: _themeTokensVexLightGlass.vexLightGlass.glass.borderSubtle,
              borderWidth: 1,
              padding: _themeTokensSpacing.spacing[3],
              width: '100%'
            },
            children: decision.evidence.map((item, i) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_EvidenceRow.EvidenceRow, {
              label: `${item.source}: ${item.detail}`,
              index: i,
              emoji: "\u22EE"
            }, `${item.source}-${i}`))
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsGlassLiquidButton.LiquidButton, {
            label: "Got it",
            variant: "primary",
            size: "md",
            fullWidth: true,
            onPress: handleDismiss,
            accessibilityHint: "Dismisses the unlock celebration",
            accessibilityLabel: "Got it \u2014 dismiss feature unlock"
          })]
        })
      })]
    });
  }
},3488,[12,1286,80,1304,226,2368,2382,1489,1691,1681,1682,1690,1470,1683,3489,3490,3491,3492,3493,203]);
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
  exports.EvidenceRow = EvidenceRow;
  require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _hooksUseReducedMotion = require(_dependencyMap[3]);
  var _themeTokensVexLightGlass = require(_dependencyMap[4]);
  var _themeTokensSpacing = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  function EvidenceRow({
    label,
    emoji,
    index
  }) {
    const {
      isReducedMotion
    } = (0, _hooksUseReducedMotion.useReducedMotion)();
    const entering = isReducedMotion ? undefined : _reactNativeReanimated.FadeIn.delay(200 + index * 80).duration(300);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
      entering: entering,
      style: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: _themeTokensSpacing.spacing[2],
        paddingVertical: _themeTokensSpacing.spacing[1]
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        style: {
          fontSize: 13
        },
        children: emoji
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        style: {
          color: _themeTokensVexLightGlass.vexLightGlass.text.secondary,
          fontSize: 12,
          flex: 1,
          lineHeight: 17
        },
        children: label
      })]
    });
  }
},3489,[12,226,1489,1681,1690,1470,203]);
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
  exports.CelebrationHeader = CelebrationHeader;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _themeTokensVexLightGlass = require(_dependencyMap[3]);
  var _themeTokensSpacing = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function CelebrationHeader({
    featureColor,
    featureName,
    featureDescription
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: {
          backgroundColor: `${featureColor}22`,
          borderColor: `${featureColor}55`,
          borderRadius: 999,
          borderWidth: 1,
          paddingHorizontal: _themeTokensSpacing.spacing[3],
          paddingVertical: _themeTokensSpacing.spacing[1]
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          style: {
            color: featureColor,
            fontSize: 12,
            fontWeight: '900',
            letterSpacing: 2
          },
          children: "NEW FEATURE UNLOCKED"
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        style: {
          color: _themeTokensVexLightGlass.vexLightGlass.text.primary,
          fontSize: 26,
          fontWeight: '900',
          letterSpacing: -0.5,
          textAlign: 'center'
        },
        children: featureName
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        style: {
          color: _themeTokensVexLightGlass.vexLightGlass.text.secondary,
          fontSize: 14,
          lineHeight: 20,
          textAlign: 'center'
        },
        children: featureDescription
      })]
    });
  }
},3490,[12,80,1489,1690,1470,203]);
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
  exports.UnlockIconBurst = UnlockIconBurst;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _hooksUseReducedMotion = require(_dependencyMap[4]);
  var _themeTokensMotion = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  const _worklet_5742712982153_init_data = {
    code: "function UnlockIconBurstTsx1(){const{burstOpacity,burstScale}=this.__closure;return{opacity:burstOpacity.value,transform:[{scale:burstScale.value}]};}"
  };
  function UnlockIconBurst({
    icon,
    color
  }) {
    const {
      isReducedMotion
    } = (0, _hooksUseReducedMotion.useReducedMotion)();
    const burstScale = (0, _reactNativeReanimated.useSharedValue)(0);
    const burstOpacity = (0, _reactNativeReanimated.useSharedValue)(0);
    (0, _react.useEffect)(() => {
      if (isReducedMotion) {
        burstScale.value = 1;
        burstOpacity.value = 1;
        return;
      }
      burstScale.value = (0, _reactNativeReanimated.withSpring)(1, {
        damping: _themeTokensMotion.springPresets.lively.damping,
        stiffness: _themeTokensMotion.springPresets.lively.stiffness,
        mass: _themeTokensMotion.springPresets.lively.mass
      });
      burstOpacity.value = (0, _reactNativeReanimated.withTiming)(1, {
        duration: _themeTokensMotion.timingPresets.enter.duration,
        easing: _reactNativeReanimated.Easing.bezier(..._themeTokensMotion.timingPresets.enter.easing)
      });
    }, [isReducedMotion, burstScale, burstOpacity]);
    const burstStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function UnlockIconBurstTsx1Factory({
      _worklet_5742712982153_init_data,
      burstOpacity,
      burstScale
    }) {
      const UnlockIconBurstTsx1 = () => ({
        opacity: burstOpacity.value,
        transform: [{
          scale: burstScale.value
        }]
      });
      UnlockIconBurstTsx1.__closure = {
        burstOpacity,
        burstScale
      };
      UnlockIconBurstTsx1.__workletHash = 5742712982153;
      UnlockIconBurstTsx1.__initData = _worklet_5742712982153_init_data;
      return UnlockIconBurstTsx1;
    }({
      _worklet_5742712982153_init_data,
      burstOpacity,
      burstScale
    }));
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: {
        alignItems: 'center',
        justifyContent: 'center'
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        style: [{
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute'
        }, burstStyle],
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: {
            backgroundColor: `${color}22`,
            borderRadius: 999,
            height: 120,
            width: 120
          }
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        entering: _reactNativeReanimated.FadeIn.delay(150).duration(400),
        style: {},
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          style: {
            fontSize: 40
          },
          children: icon
        })
      })]
    });
  }
},3491,[12,80,226,1489,1681,1682,203]);
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
  exports.GlowParticle = GlowParticle;
  var _react = require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _hooksUseReducedMotion = require(_dependencyMap[2]);
  var _themeTokensMotion = require(_dependencyMap[3]);
  var _themeTokensRadius = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  const _worklet_10598122895670_init_data = {
    code: "function GlowParticleTsx1(){const{particleOpacity,particleX,particleY,particleScale}=this.__closure;return{opacity:particleOpacity.value,transform:[{translateX:particleX.value},{translateY:particleY.value},{scale:particleScale.value}]};}"
  };
  function GlowParticle({
    color,
    index
  }) {
    const {
      isReducedMotion
    } = (0, _hooksUseReducedMotion.useReducedMotion)();
    const size = 6 + index % 3 * 3;
    const angle = (index * 72 + 15) * (Math.PI / 180);
    const distance = 40 + index * 12;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const particleX = (0, _reactNativeReanimated.useSharedValue)(0);
    const particleY = (0, _reactNativeReanimated.useSharedValue)(0);
    const particleOpacity = (0, _reactNativeReanimated.useSharedValue)(0);
    const particleScale = (0, _reactNativeReanimated.useSharedValue)(0);
    (0, _react.useEffect)(() => {
      if (isReducedMotion) {
        particleOpacity.value = 0;
        return;
      }
      particleOpacity.value = (0, _reactNativeReanimated.withDelay)(200 + index * 120, (0, _reactNativeReanimated.withSequence)((0, _reactNativeReanimated.withTiming)(0.9, {
        duration: _themeTokensMotion.timingPresets.enter.duration,
        easing: _reactNativeReanimated.Easing.bezier(..._themeTokensMotion.timingPresets.enter.easing)
      }), (0, _reactNativeReanimated.withTiming)(0, {
        duration: 1800,
        easing: _reactNativeReanimated.Easing.bezier(0.4, 0, 0.2, 1)
      })));
      particleX.value = (0, _reactNativeReanimated.withDelay)(200 + index * 100, (0, _reactNativeReanimated.withTiming)(tx, {
        duration: 2000,
        easing: _reactNativeReanimated.Easing.bezier(0.22, 1, 0.36, 1)
      }));
      particleY.value = (0, _reactNativeReanimated.withDelay)(200 + index * 100, (0, _reactNativeReanimated.withTiming)(ty - 20, {
        duration: 2000,
        easing: _reactNativeReanimated.Easing.bezier(0.16, 1, 0.3, 1)
      }));
      particleScale.value = (0, _reactNativeReanimated.withDelay)(200 + index * 120, (0, _reactNativeReanimated.withSequence)((0, _reactNativeReanimated.withTiming)(1, {
        duration: 400
      }), (0, _reactNativeReanimated.withTiming)(0, {
        duration: 1400
      })));
    }, [isReducedMotion, particleOpacity, particleX, particleY, particleScale, index, tx, ty]);
    const particleStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function GlowParticleTsx1Factory({
      _worklet_10598122895670_init_data,
      particleOpacity,
      particleX,
      particleY,
      particleScale
    }) {
      const GlowParticleTsx1 = () => ({
        opacity: particleOpacity.value,
        transform: [{
          translateX: particleX.value
        }, {
          translateY: particleY.value
        }, {
          scale: particleScale.value
        }]
      });
      GlowParticleTsx1.__closure = {
        particleOpacity,
        particleX,
        particleY,
        particleScale
      };
      GlowParticleTsx1.__workletHash = 10598122895670;
      GlowParticleTsx1.__initData = _worklet_10598122895670_init_data;
      return GlowParticleTsx1;
    }({
      _worklet_10598122895670_init_data,
      particleOpacity,
      particleX,
      particleY,
      particleScale
    }));
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      style: [{
        backgroundColor: color,
        borderRadius: _themeTokensRadius.borderRadius.full,
        height: size,
        position: 'absolute',
        width: size
      }, particleStyle]
    });
  }
},3492,[12,226,1681,1682,1471,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "GLOW_COLORS", {
    enumerable: true,
    get: function () {
      return GLOW_COLORS;
    }
  });
  Object.defineProperty(exports, "GLOW_PARTICLES", {
    enumerable: true,
    get: function () {
      return GLOW_PARTICLES;
    }
  });
  exports.findGate = findGate;
  exports.mapLiveopsFeatureName = mapLiveopsFeatureName;
  exports.resolveFeatureDisplay = resolveFeatureDisplay;
  var _onboardingOnboardingGates = require(_dependencyMap[0]);
  var _themeTokensVexLightGlass = require(_dependencyMap[1]);
  const GLOW_COLORS = [_themeTokensVexLightGlass.vexLightGlass.mint[300], _themeTokensVexLightGlass.vexLightGlass.mint[200], _themeTokensVexLightGlass.vexLightGlass.semantic.success, _themeTokensVexLightGlass.vexLightGlass.background.atmosphericMint, 'rgba(255, 255, 255, 0.8)'];
  const GLOW_PARTICLES = 5;
  function findGate(featureKey) {
    return _onboardingOnboardingGates.FEATURE_UNLOCK_GATES.find(g => g.featureId === featureKey);
  }
  function mapLiveopsFeatureName(featureKey) {
    const names = {
      companion_detail: 'Companion Detail',
      challenges: 'Challenges',
      boss_tab: 'Boss Encounters',
      ai_coach_advanced: 'AI Coach Advanced',
      content_study: 'Study Mode',
      content_study_advanced: 'Advanced Study',
      memory_console: 'Memory Console',
      economy_basic: 'Progress Economy',
      quiz_review_mode: 'Quiz Review',
      achievements: 'Achievements',
      advanced_settings: 'Advanced Settings',
      premium_paywall: 'Premium'
    };
    return names[featureKey] ?? featureKey.replace(/_/g, ' ');
  }
  function resolveFeatureDisplay(featureKey, gate) {
    return {
      name: gate?.featureName ?? mapLiveopsFeatureName(featureKey),
      color: gate?.color ?? _themeTokensVexLightGlass.vexLightGlass.mint[500],
      icon: gate?.icon ?? '🔓',
      description: gate?.description ?? 'A new layer has opened.'
    };
  }
},3493,[1953,1690]);
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
  exports.SessionCompleteOverlays = SessionCompleteOverlays;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsModal = require(_dependencyMap[1]);
  var Modal = _interopDefault(_reactNativeWebDistExportsModal);
  var _componentsLevelUpCelebration = require(_dependencyMap[2]);
  var _featuresSessionCompletionComponentsGradeRevealAnimation = require(_dependencyMap[3]);
  var _SessionReflectionSheet = require(_dependencyMap[4]);
  var _featuresSessionCompletionComponentsGradeRevealHelpers = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  function SessionCompleteOverlays({
    controller,
    summary,
    gradeRevealed,
    revealedGradeLetter,
    onGradeRevealComplete,
    bottomSheetRef
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [!gradeRevealed ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionCompletionComponentsGradeRevealAnimation.GradeRevealAnimation, {
        gradeColor: _featuresSessionCompletionComponentsGradeRevealHelpers.GRADE_REVEAL_COLORS[revealedGradeLetter] ?? controller.grade.color,
        gradeLetter: revealedGradeLetter,
        onComplete: onGradeRevealComplete
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Modal.default, {
        transparent: true,
        animationType: "fade",
        statusBarTranslucent: true,
        visible: Boolean(controller.rewards.levelUpCelebration),
        onRequestClose: () => controller.rewards.actions.setLevelUpCelebration(null),
        children: controller.rewards.levelUpCelebration ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsLevelUpCelebration.LevelUpCelebration, {
          oldLevel: controller.rewards.levelUpCelebration.oldLevel,
          newLevel: controller.rewards.levelUpCelebration.newLevel,
          rewards: controller.rewards.levelUpCelebration.rewards,
          onDismiss: () => controller.rewards.actions.setLevelUpCelebration(null)
        }) : null
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionReflectionSheet.SessionReflectionSheet, {
        bottomSheetRef: bottomSheetRef,
        onFinish: () => controller.finishSession(false),
        onSkip: () => controller.finishSession(true),
        reflection: controller.reflection,
        selectedMood: controller.selectedMood,
        setReflection: controller.setReflection,
        setSelectedMood: controller.setSelectedMood
      })]
    });
  }
},3494,[12,1279,3495,3496,3499,3497,203]);
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
  Object.defineProperty(exports, "LevelUpCelebration", {
    enumerable: true,
    get: function () {
      return LevelUpCelebration;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _primitivesBox = require(_dependencyMap[3]);
  var _primitivesText = require(_dependencyMap[4]);
  var _themeThemeContext = require(_dependencyMap[5]);
  var _hooks = require(_dependencyMap[6]);
  var _utilsHaptics = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  const _worklet_461830511687_init_data = {
    code: "function LevelUpCelebrationTsx1(){const{levelScale}=this.__closure;return{transform:[{scale:levelScale.value}]};}"
  };
  const LevelUpCelebration = ({
    oldLevel,
    newLevel,
    rewards,
    onDismiss
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      isReducedMotion
    } = (0, _hooks.useReducedMotion)();
    const levelScale = (0, _reactNativeReanimated.useSharedValue)(0.7);
    (0, _react.useEffect)(() => {
      levelScale.value = isReducedMotion ? 1 : (0, _reactNativeReanimated.withSpring)(1, {
        damping: 10,
        stiffness: 150
      });
      const timeoutId = setTimeout(onDismiss, 3500);
      return () => clearTimeout(timeoutId);
    }, [levelScale, onDismiss, isReducedMotion]);
    const levelStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function LevelUpCelebrationTsx1Factory({
      _worklet_461830511687_init_data,
      levelScale
    }) {
      const LevelUpCelebrationTsx1 = () => ({
        transform: [{
          scale: levelScale.value
        }]
      });
      LevelUpCelebrationTsx1.__closure = {
        levelScale
      };
      LevelUpCelebrationTsx1.__workletHash = 461830511687;
      LevelUpCelebrationTsx1.__initData = _worklet_461830511687_init_data;
      return LevelUpCelebrationTsx1;
    }({
      _worklet_461830511687_init_data,
      levelScale
    }));

    // Guard: don't render if no actual level up occurred
    if (newLevel <= oldLevel) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
      onPress: () => {
        (0, _utilsHaptics.buttonTap)();
        onDismiss();
      },
      style: {
        flex: 1
      },
      accessibilityLabel: `Dismiss level ${newLevel} celebration`,
      accessibilityRole: "button",
      accessibilityHint: "Double tap to dismiss",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        entering: _reactNativeReanimated.FadeIn.duration(220),
        style: {
          flex: 1
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesBox.Box, {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          px: 24,
          style: {
            backgroundColor: `${theme.colors.background.primary}EE`
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_primitivesBox.Box, {
            width: "100%",
            p: 24,
            borderRadius: 28,
            alignItems: "center",
            style: {
              backgroundColor: theme.colors.background.secondary,
              borderWidth: 2,
              borderColor: theme.colors.primary[500]
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesText.Text, {
              variant: "label",
              color: theme.colors.primary[500],
              children: "LEVEL UP"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
              style: levelStyle,
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesText.Text, {
                variant: "hero",
                color: theme.colors.primary[500],
                style: {
                  fontSize: 84,
                  lineHeight: 92
                },
                children: newLevel
              })
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_primitivesText.Text, {
              variant: "body",
              color: theme.colors.text.secondary,
              style: {
                marginTop: 4
              },
              children: ["Level ", oldLevel, " to Level ", newLevel]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesBox.Box, {
              width: "100%",
              mt: 20,
              gap: 10,
              children: rewards.map((reward, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
                entering: _reactNativeReanimated.FadeInUp.delay(index * 150).duration(260),
                children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesBox.Box, {
                  p: 14,
                  borderRadius: 18,
                  style: {
                    backgroundColor: theme.colors.background.primary
                  },
                  children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesText.Text, {
                    variant: "body",
                    color: theme.colors.text.primary,
                    children: reward
                  })
                })
              }, `${reward}-${index}`))
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_primitivesText.Text, {
              variant: "caption",
              color: theme.colors.text.tertiary,
              style: {
                marginTop: 18
              },
              children: "Tap anywhere to continue"
            })]
          })
        })
      })
    });
  };
},3495,[12,1286,226,1462,1489,1463,2109,1683,203]);
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
  exports.GradeRevealAnimation = GradeRevealAnimation;
  var _themeTokensColors = require(_dependencyMap[0]);
  require(_dependencyMap[1]);
  var _reactNativeWebDistExportsUseWindowDimensions = require(_dependencyMap[2]);
  var useWindowDimensions = _interopDefault(_reactNativeWebDistExportsUseWindowDimensions);
  var _reactNativeWebDistExportsView = require(_dependencyMap[3]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[4]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesText = require(_dependencyMap[5]);
  var _hooksUseReducedMotion = require(_dependencyMap[6]);
  var _themeThemeContext = require(_dependencyMap[7]);
  var _gradeRevealHelpers = require(_dependencyMap[8]);
  var _gradeRevealLogic = require(_dependencyMap[9]);
  var _reactJsxRuntime = require(_dependencyMap[10]);
  function GradeRevealAnimation({
    chainCount,
    creativeMoodLabel,
    gradeColor,
    gradeLetter,
    onComplete,
    sessionMode
  }) {
    const {
      height
    } = (0, useWindowDimensions.default)();
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      isReducedMotion
    } = (0, _hooksUseReducedMotion.useReducedMotion)();
    const {
      overlayStyle,
      flashStyle,
      letterStyle,
      particleProgress,
      modeMessage
    } = (0, _gradeRevealLogic.useGradeRevealSequence)({
      chainCount,
      creativeMoodLabel,
      gradeColor,
      gradeLetter,
      height,
      isReducedMotion,
      onComplete,
      sessionMode
    });
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
      pointerEvents: "none",
      style: [{
        alignItems: 'center',
        backgroundColor: _themeTokensColors.lightColors.text.primary,
        bottom: 0,
        justifyContent: 'center',
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: theme.zIndex.modal
      }, overlayStyle],
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        style: [{
          backgroundColor: (0, _gradeRevealHelpers.hexToRgba)(gradeColor, 1),
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0
        }, flashStyle]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          alignItems: 'center',
          justifyContent: 'center'
        },
        children: [gradeLetter === 'S' ? Array.from({
          length: _gradeRevealHelpers.PARTICLE_COUNT
        }).map((_, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_gradeRevealHelpers.BurstParticle, {
          color: index % 2 === 0 ? gradeColor : theme.colors.text.inverse,
          index: index,
          progress: particleProgress
        }, `grade-reveal-particle-${index}`)) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
          style: letterStyle,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            color: gradeColor,
            style: {
              fontSize: 156,
              fontVariant: ['tabular-nums'],
              fontWeight: theme.fontWeights.heavy,
              lineHeight: 168,
              textAlign: 'center'
            },
            children: gradeLetter
          }), modeMessage && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            color: theme.colors.text.inverse,
            style: {
              fontSize: 16,
              fontWeight: theme.fontWeights.medium,
              marginTop: theme.spacing[2],
              textAlign: 'center'
            },
            children: modeMessage
          })]
        })]
      })]
    });
  }
},3496,[1465,12,1304,80,226,1489,1681,1463,3497,3498,203]);
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
  Object.defineProperty(exports, "PARTICLE_COUNT", {
    enumerable: true,
    get: function () {
      return PARTICLE_COUNT;
    }
  });
  Object.defineProperty(exports, "GRADE_REVEAL_COLORS", {
    enumerable: true,
    get: function () {
      return GRADE_REVEAL_COLORS;
    }
  });
  exports.hexToRgba = hexToRgba;
  exports.BurstParticle = BurstParticle;
  var _themeTokensColors = require(_dependencyMap[0]);
  require(_dependencyMap[1]);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  const PARTICLE_COUNT = 12;
  const GRADE_REVEAL_COLORS = {
    A: _themeTokensColors.lightColors.semantic.success,
    B: _themeTokensColors.lightColors.accent.blue,
    C: _themeTokensColors.lightColors.text.disabled,
    D: _themeTokensColors.lightColors.semantic.danger,
    S: _themeTokensColors.lightColors.semantic.vexGold
  };
  function hexToRgba(color, alpha) {
    if (!color.startsWith('#')) {
      return color;
    }
    const raw = color.length === 4 ? color.slice(1).split('').map(part => `${part}${part}`).join('') : color.slice(1);
    const red = parseInt(raw.slice(0, 2), 16);
    const green = parseInt(raw.slice(2, 4), 16);
    const blue = parseInt(raw.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }
  const _worklet_4879840056626_init_data = {
    code: "function gradeRevealHelpersTsx1(){const{progress,angle}=this.__closure;return{opacity:1-progress.value,transform:[{translateX:Math.cos(angle)*130*progress.value},{translateY:Math.sin(angle)*130*progress.value},{scale:0.4+progress.value}]};}"
  };
  function BurstParticle({
    color,
    index,
    progress
  }) {
    const reduceMotion = (0, _reactNativeReanimated.useReducedMotion)();
    const angle = Math.PI * 2 * index / PARTICLE_COUNT;
    const style = (0, _reactNativeReanimated.useAnimatedStyle)(function gradeRevealHelpersTsx1Factory({
      _worklet_4879840056626_init_data,
      progress,
      angle
    }) {
      const gradeRevealHelpersTsx1 = () => ({
        opacity: 1 - progress.value,
        transform: [{
          translateX: Math.cos(angle) * 130 * progress.value
        }, {
          translateY: Math.sin(angle) * 130 * progress.value
        }, {
          scale: 0.4 + progress.value
        }]
      });
      gradeRevealHelpersTsx1.__closure = {
        progress,
        angle
      };
      gradeRevealHelpersTsx1.__workletHash = 4879840056626;
      gradeRevealHelpersTsx1.__initData = _worklet_4879840056626_init_data;
      return gradeRevealHelpersTsx1;
    }({
      _worklet_4879840056626_init_data,
      progress,
      angle
    }));
    if (reduceMotion) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      style: [{
        backgroundColor: color,
        borderRadius: 9999,
        height: 10,
        position: 'absolute',
        width: 10
      }, style]
    });
  }
},3497,[1465,12,226,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useGradeRevealSequence = useGradeRevealSequence;
  var _react = require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  function buildModeMessage(sessionMode, creativeMoodLabel, chainCount) {
    if (creativeMoodLabel) {
      return creativeMoodLabel;
    }
    if (chainCount && chainCount > 1) {
      return `${chainCount} session chain`;
    }
    return sessionMode ? `${sessionMode} complete` : null;
  }
  const _worklet_1246060616459_init_data = {
    code: "function gradeRevealLogicTs1(){const{overlay}=this.__closure;return{opacity:overlay.value};}"
  };
  const _worklet_11310222214632_init_data = {
    code: "function gradeRevealLogicTs2(){const{flash}=this.__closure;return{opacity:flash.value};}"
  };
  const _worklet_6443036185822_init_data = {
    code: "function gradeRevealLogicTs3(){const{letterScale}=this.__closure;return{transform:[{scale:letterScale.value}]};}"
  };
  function useGradeRevealSequence({
    chainCount,
    creativeMoodLabel,
    height,
    isReducedMotion,
    onComplete,
    sessionMode
  }) {
    const overlay = (0, _reactNativeReanimated.useSharedValue)(1);
    const flash = (0, _reactNativeReanimated.useSharedValue)(0.28);
    const letterScale = (0, _reactNativeReanimated.useSharedValue)(isReducedMotion ? 1 : 0.82);
    const particleProgress = (0, _reactNativeReanimated.useSharedValue)(0);
    (0, _react.useEffect)(() => {
      letterScale.value = (0, _reactNativeReanimated.withTiming)(1, {
        duration: isReducedMotion ? 0 : 280
      });
      flash.value = (0, _reactNativeReanimated.withTiming)(0, {
        duration: isReducedMotion ? 0 : 520
      });
      particleProgress.value = (0, _reactNativeReanimated.withTiming)(1, {
        duration: isReducedMotion ? 0 : 700
      });
      const timeout = setTimeout(onComplete, isReducedMotion ? 80 : 900);
      return () => clearTimeout(timeout);
    }, [flash, isReducedMotion, letterScale, onComplete, particleProgress]);
    const overlayStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function gradeRevealLogicTs1Factory({
      _worklet_1246060616459_init_data,
      overlay
    }) {
      const gradeRevealLogicTs1 = () => ({
        opacity: overlay.value
      });
      gradeRevealLogicTs1.__closure = {
        overlay
      };
      gradeRevealLogicTs1.__workletHash = 1246060616459;
      gradeRevealLogicTs1.__initData = _worklet_1246060616459_init_data;
      return gradeRevealLogicTs1;
    }({
      _worklet_1246060616459_init_data,
      overlay
    }));
    const flashStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function gradeRevealLogicTs2Factory({
      _worklet_11310222214632_init_data,
      flash
    }) {
      const gradeRevealLogicTs2 = () => ({
        opacity: flash.value
      });
      gradeRevealLogicTs2.__closure = {
        flash
      };
      gradeRevealLogicTs2.__workletHash = 11310222214632;
      gradeRevealLogicTs2.__initData = _worklet_11310222214632_init_data;
      return gradeRevealLogicTs2;
    }({
      _worklet_11310222214632_init_data,
      flash
    }));
    const letterStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function gradeRevealLogicTs3Factory({
      _worklet_6443036185822_init_data,
      letterScale
    }) {
      const gradeRevealLogicTs3 = () => ({
        transform: [{
          scale: letterScale.value
        }]
      });
      gradeRevealLogicTs3.__closure = {
        letterScale
      };
      gradeRevealLogicTs3.__workletHash = 6443036185822;
      gradeRevealLogicTs3.__initData = _worklet_6443036185822_init_data;
      return gradeRevealLogicTs3;
    }({
      _worklet_6443036185822_init_data,
      letterScale
    }));
    const modeMessage = (0, _react.useMemo)(() => buildModeMessage(sessionMode, creativeMoodLabel, chainCount), [chainCount, creativeMoodLabel, sessionMode]);
    return {
      flashStyle,
      letterStyle,
      modeMessage,
      overlayStyle,
      particleProgress
    };
  }
},3498,[12,226]);
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
  exports.SessionReflectionSheet = SessionReflectionSheet;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsTextInput = require(_dependencyMap[2]);
  var TextInput = _interopDefault(_reactNativeWebDistExportsTextInput);
  var _gorhomBottomSheet = require(_dependencyMap[3]);
  var BottomSheet = _interopDefault(_gorhomBottomSheet);
  var _componentsGlassNativeGlassSheetBackground = require(_dependencyMap[4]);
  var _componentsPrimitivesBox = require(_dependencyMap[5]);
  var _componentsPrimitivesButton = require(_dependencyMap[6]);
  var _componentsPrimitivesText = require(_dependencyMap[7]);
  var _themeThemeContext = require(_dependencyMap[8]);
  var _utils = require(_dependencyMap[9]);
  var _reactJsxRuntime = require(_dependencyMap[10]);
  function SessionReflectionSheet({
    bottomSheetRef,
    onFinish,
    onSkip,
    reflection,
    selectedMood,
    setReflection,
    setSelectedMood
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(BottomSheet.default, {
      ref: bottomSheetRef,
      index: -1,
      snapPoints: ['52%'],
      enablePanDownToClose: true,
      backdropComponent: props => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_gorhomBottomSheet.BottomSheetBackdrop, Object.assign({}, props, {
        appearsOnIndex: 0,
        disappearsOnIndex: -1
      })),
      backgroundComponent: _componentsGlassNativeGlassSheetBackground.GlassSheetBackground,
      backgroundStyle: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden'
      },
      handleIndicatorStyle: {
        backgroundColor: theme.colors.text.tertiary
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flex: 1,
        px: 24,
        py: 12,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h3",
          color: theme.colors.text.primary,
          children: "How did that session feel?"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: theme.colors.text.secondary,
          mt: 8,
          children: "Optional reflection before you head out."
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          justifyContent: "space-between",
          mt: 20,
          children: _utils.MOODS.map(mood => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
            onPress: () => setSelectedMood(mood.key),
            style: {
              width: 52,
              height: 52,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              backgroundColor: selectedMood === mood.key ? theme.colors.primary[500] : theme.colors.background.primary,
              borderColor: selectedMood === mood.key ? theme.colors.primary[500] : theme.colors.border.light
            },
            accessibilityLabel: "Session reflection",
            accessibilityRole: "button",
            accessibilityHint: "Double tap to activate",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "h4",
              children: mood.emoji
            })
          }, mood.key))
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          mt: 20,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(TextInput.default, {
            style: {
              minHeight: 110,
              borderRadius: 18,
              borderWidth: 1,
              padding: 16,
              textAlignVertical: 'top',
              backgroundColor: theme.colors.background.primary,
              borderColor: theme.colors.border.light,
              color: theme.colors.text.primary
            },
            multiline: true,
            numberOfLines: 4,
            placeholder: "What did you accomplish? Any notes for next time?",
            placeholderTextColor: theme.colors.text.tertiary,
            value: reflection,
            onChangeText: setReflection
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          mt: 20,
          gap: 12,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
            variant: "primary",
            size: "lg",
            fullWidth: true,
            onPress: onFinish,
            accessibilityLabel: "Finish reflection",
            accessibilityRole: "button",
            accessibilityHint: "Double tap to activate",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              children: "Finish"
            })
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
            variant: "ghost",
            size: "md",
            fullWidth: true,
            onPress: onSkip,
            accessibilityLabel: "Skip reflection",
            accessibilityRole: "button",
            accessibilityHint: "Double tap to activate",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              children: "Skip"
            })
          })]
        })]
      })
    });
  }
},3499,[12,1286,496,2853,2845,1462,1680,1489,1463,3500,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "MOODS", {
    enumerable: true,
    get: function () {
      return _sessionCompleteUtils.MOODS;
    }
  });
  Object.defineProperty(exports, "formatDuration", {
    enumerable: true,
    get: function () {
      return _sessionCompleteUtils.formatDuration;
    }
  });
  Object.defineProperty(exports, "getGrade", {
    enumerable: true,
    get: function () {
      return _sessionCompleteUtils.getGrade;
    }
  });
  Object.defineProperty(exports, "isSameLocalDay", {
    enumerable: true,
    get: function () {
      return _sessionCompleteUtils.isSameLocalDay;
    }
  });
  Object.defineProperty(exports, "resolveIsFirstSessionToday", {
    enumerable: true,
    get: function () {
      return _sessionCompleteUtils.resolveIsFirstSessionToday;
    }
  });
  var _sessionCompleteUtils = require(_dependencyMap[0]);
},3500,[3501]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "MOODS", {
    enumerable: true,
    get: function () {
      return MOODS;
    }
  });
  exports.isSameLocalDay = isSameLocalDay;
  exports.resolveIsFirstSessionToday = resolveIsFirstSessionToday;
  exports.formatDuration = formatDuration;
  exports.getGrade = getGrade;
  var _utilsSilentFailure = require(_dependencyMap[0]);
  var _sessionSessionOrchestrator = require(_dependencyMap[1]);
  var _themeTokensColors = require(_dependencyMap[2]);
  /**
   * Session Complete Utils
   * Helper functions for the session complete screen
   */

  const MOODS = [{
    key: 'GREAT',
    emoji: 'A',
    label: 'Great'
  }, {
    key: 'GOOD',
    emoji: 'B',
    label: 'Good'
  }, {
    key: 'NEUTRAL',
    emoji: 'C',
    label: 'Okay'
  }, {
    key: 'BAD',
    emoji: 'D',
    label: 'Bad'
  }, {
    key: 'TERRIBLE',
    emoji: 'F',
    label: 'Terrible'
  }];
  function isSameLocalDay(first, second) {
    const a = new Date(first);
    const b = new Date(second);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  async function resolveIsFirstSessionToday(userId, sessionId, summaryTimestamp) {
    try {
      const orchestrator = (0, _sessionSessionOrchestrator.getSessionOrchestrator)();
      orchestrator.setUserId(userId);
      const history = await orchestrator.getSessionHistory(50);
      const priorSessionsToday = history.filter(entry => {
        if (entry.sessionId === sessionId) {
          return false;
        }
        const referenceTime = entry.endedAt ?? entry.startedAt ?? entry.createdAt;
        return isSameLocalDay(referenceTime, summaryTimestamp);
      });
      return priorSessionsToday.length === 0;
    } catch (error) {
      (0, _utilsSilentFailure.captureSilentFailure)(error, {
        feature: 'screens',
        operation: 'ui-fallback',
        type: 'ui'
      });
      return false;
    }
  }
  function formatDuration(durationMs) {
    const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
  function getGrade(score) {
    if (score >= 900) {
      return {
        letter: 'S',
        color: _themeTokensColors.lightColors.semantic.vexGold,
        label: 'Legendary!'
      };
    }
    if (score >= 800) {
      return {
        letter: 'A',
        color: _themeTokensColors.lightColors.semantic.success,
        label: 'Excellent!'
      };
    }
    if (score >= 700) {
      return {
        letter: 'B',
        color: _themeTokensColors.lightColors.semantic.success,
        label: 'Great Job!'
      };
    }
    if (score >= 600) {
      return {
        letter: 'C',
        color: _themeTokensColors.lightColors.semantic.warning,
        label: 'Good Effort!'
      };
    }
    if (score >= 500) {
      return {
        letter: 'D',
        color: _themeTokensColors.lightColors.semantic.warning,
        label: 'Keep Going!'
      };
    }
    return {
      letter: 'F',
      color: _themeTokensColors.lightColors.semantic.danger,
      label: 'Try Again!'
    };
  }
},3501,[1477,1824,1465]);
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
  exports.SessionCompleteScrollView = SessionCompleteScrollView;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[1]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _featuresModeNativeComponentsModeCompletionSurface = require(_dependencyMap[2]);
  var _SessionCompleteHeroSection = require(_dependencyMap[3]);
  var _SessionCompleteRewardsPhase = require(_dependencyMap[4]);
  var _SessionCompleteNextSteps = require(_dependencyMap[5]);
  var _SessionContractReflectionCard = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function SessionCompleteScrollView({
    controller,
    sessionId,
    summary,
    consequences,
    policy,
    contract,
    isContractPending,
    lane,
    tomorrowPreview,
    insets,
    onReflectContract,
    onOpenReflection
  }) {
    const isHidden = surface => policy.hiddenCompletionSurfaces.includes(surface);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(ScrollView.default, {
      ref: controller.scrollRef,
      contentContainerStyle: {
        paddingBottom: controller.theme.spacing[20] + controller.theme.spacing[12],
        paddingTop: insets.top + controller.theme.spacing[5]
      },
      showsVerticalScrollIndicator: false,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionCompleteHeroSection.SessionCompleteHeroSection, {
        controller: controller,
        summary: summary
      }), !isHidden('contract_reflection_card') ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionContractReflectionCard.SessionContractReflectionCard, {
        contract: contract,
        isPending: isContractPending,
        onReflect: onReflectContract
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresModeNativeComponentsModeCompletionSurface.ModeCompletionSurface, {
        lane: lane,
        topic: contract?.taskDescription,
        task: contract?.taskDescription,
        project: contract?.taskDescription,
        action: contract?.taskDescription,
        onPrimaryAction: () => {
          controller.navigation.navigate({
            name: 'Home',
            params: {}
          });
        }
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionCompleteRewardsPhase.SessionCompleteRewardsPhase, {
        controller: controller,
        summary: summary,
        sessionId: sessionId,
        policy: policy,
        consequences: consequences
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionCompleteNextSteps.SessionCompleteNextSteps, {
        controller: controller,
        tomorrowPreview: tomorrowPreview,
        bottomInset: Math.max(insets.bottom, controller.theme.spacing[4]),
        onShare: undefined,
        onOpenReflection: onOpenReflection
      })]
    });
  }
},3502,[12,171,3503,3504,3507,3523,3530,203]);
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
  exports.ModeCompletionSurface = ModeCompletionSurface;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _hooks = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function ModeCompletionSurface({
    lane,
    topic,
    task,
    project,
    action,
    onPrimaryAction,
    onSecondaryAction
  }) {
    const surface = (0, _hooks.useModeCompletion)({
      laneOverride: lane,
      topic,
      task,
      project,
      action
    });
    const handleSecondary = (0, _react.useCallback)(() => {
      onSecondaryAction?.();
    }, [onSecondaryAction]);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      px: "lg",
      gap: "xl",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        alignItems: "center",
        gap: "sm",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h2",
          color: "text.primary",
          textAlign: "center",
          children: surface.headline
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: "text.secondary",
          textAlign: "center",
          children: surface.body
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
        onPress: onPrimaryAction,
        accessibilityLabel: surface.primaryActionLabel,
        accessibilityRole: "button",
        accessibilityHint: "Continue to the next step",
        style: ({
          pressed
        }) => ({
          opacity: pressed ? 0.85 : 1
        }),
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          minHeight: 52,
          borderRadius: "lg",
          bg: "primary.500",
          justifyContent: "center",
          alignItems: "center",
          px: "xl",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "button",
            color: "text.inverse",
            fontWeight: "600",
            children: surface.primaryActionLabel
          })
        })
      }), surface.secondaryHint ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
        onPress: handleSecondary,
        accessibilityLabel: surface.secondaryHint,
        accessibilityRole: "button",
        accessibilityHint: "Tap for next action suggestion",
        style: {
          minHeight: 44,
          justifyContent: 'center'
        },
        disabled: !onSecondaryAction,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          alignItems: "center",
          gap: "xs",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.tertiary",
            children: surface.secondaryHint
          }), surface.insightLabel ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.tertiary",
            children: surface.insightLabel
          }) : null]
        })
      }) : null]
    });
  }
},3503,[12,1286,1462,1489,3361,203]);
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
  exports.SessionCompleteHeroSection = SessionCompleteHeroSection;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsUseWindowDimensions = require(_dependencyMap[1]);
  var useWindowDimensions = _interopDefault(_reactNativeWebDistExportsUseWindowDimensions);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _VexProofRing = require(_dependencyMap[4]);
  var _featuresSessionCompletionComponentsPerfectSessionBanner = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  function SessionCompleteHeroSection({
    controller,
    summary
  }) {
    const {
      width: _width
    } = (0, useWindowDimensions.default)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        px: 6,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          color: "vexCyan",
          children: controller.hero.eyebrow
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h2",
          color: controller.theme.colors.text.primary,
          mt: 2,
          children: controller.hero.title
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: controller.theme.colors.text.secondary,
          mt: 2,
          children: controller.hero.body
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        alignItems: "center",
        mt: 6,
        mb: 4,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_VexProofRing.VexProofRing, {
          grade: controller.grade.letter === 'F' ? 'D' : controller.grade.letter,
          size: 180,
          delay: 400
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionCompletionComponentsPerfectSessionBanner.PerfectSessionBanner, {
        isPerfect: summary.isPerfect ?? false
      })]
    });
  }
},3504,[12,1304,1462,1489,3505,3506,203]);
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
  exports.VexProofRing = VexProofRing;
  var _react = require(_dependencyMap[0]);
  require(_dependencyMap[1]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeSvg = require(_dependencyMap[3]);
  var Svg = _interopDefault(_reactNativeSvg);
  var _reactNativeReanimated = require(_dependencyMap[4]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesText = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _hooksUseReducedMotion = require(_dependencyMap[7]);
  var _themeTokensColors = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  const GRADE_COLORS = {
    S: _themeTokensColors.lightColors.semantic.vexGold,
    A: _themeTokensColors.lightColors.semantic.vexCyan,
    B: _themeTokensColors.lightColors.surface.button,
    C: _themeTokensColors.lightColors.surface.button,
    D: _themeTokensColors.lightColors.semantic.gradeMuted
  };
  const _AnimatedSvg = Animated.default.createAnimatedComponent(Svg.default);
  const AnimatedCircle = Animated.default.createAnimatedComponent(_reactNativeSvg.Circle);
  const _worklet_9542377042425_init_data = {
    code: "function VexProofRingTsx1(){const{circumference,ringProgress}=this.__closure;return{strokeDashoffset:circumference*(1-ringProgress.value)};}"
  };
  const _worklet_3499471280847_init_data = {
    code: "function VexProofRingTsx2(){const{gradeScale}=this.__closure;return{transform:[{scale:gradeScale.value}],opacity:gradeScale.value};}"
  };
  function VexProofRing({
    grade,
    size = 200,
    delay = 400,
    testID
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      isReducedMotion
    } = (0, _hooksUseReducedMotion.useReducedMotion)();
    const ringProgress = (0, _reactNativeReanimated.useSharedValue)(0);
    const gradeScale = (0, _reactNativeReanimated.useSharedValue)(0);
    const s = size;
    const strokeWidth = 8;
    const radius = (s - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const cx = s / 2;
    const cy = s / 2;
    const gradeColor = GRADE_COLORS[grade] ?? theme.colors.semantic.textPrimary;
    (0, _react.useEffect)(() => {
      if (isReducedMotion) {
        ringProgress.value = 1;
        gradeScale.value = 1;
        return;
      }
      ringProgress.value = (0, _reactNativeReanimated.withTiming)(1, {
        duration: 800
      });
      gradeScale.value = (0, _reactNativeReanimated.withDelay)(delay, (0, _reactNativeReanimated.withSpring)(1, {
        damping: 12,
        stiffness: 200
      }));
    }, [isReducedMotion, ringProgress, gradeScale, delay]);
    const ringAnimatedProps = (0, _reactNativeReanimated.useAnimatedProps)(function VexProofRingTsx1Factory({
      _worklet_9542377042425_init_data,
      circumference,
      ringProgress
    }) {
      const VexProofRingTsx1 = () => ({
        strokeDashoffset: circumference * (1 - ringProgress.value)
      });
      VexProofRingTsx1.__closure = {
        circumference,
        ringProgress
      };
      VexProofRingTsx1.__workletHash = 9542377042425;
      VexProofRingTsx1.__initData = _worklet_9542377042425_init_data;
      return VexProofRingTsx1;
    }({
      _worklet_9542377042425_init_data,
      circumference,
      ringProgress
    }));
    const gradeStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function VexProofRingTsx2Factory({
      _worklet_3499471280847_init_data,
      gradeScale
    }) {
      const VexProofRingTsx2 = () => ({
        transform: [{
          scale: gradeScale.value
        }],
        opacity: gradeScale.value
      });
      VexProofRingTsx2.__closure = {
        gradeScale
      };
      VexProofRingTsx2.__workletHash = 3499471280847;
      VexProofRingTsx2.__initData = _worklet_3499471280847_init_data;
      return VexProofRingTsx2;
    }({
      _worklet_3499471280847_init_data,
      gradeScale
    }));
    const isWeb = true;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      testID: testID,
      accessibilityLabel: `Grade ${grade}`,
      style: {
        width: s,
        height: s,
        alignItems: 'center',
        justifyContent: 'center'
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Svg.default, {
        width: s,
        height: s,
        style: {
          position: 'absolute',
          left: 0,
          top: 0
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Defs, {
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactNativeSvg.LinearGradient, {
            id: "proof-grad",
            x1: "0%",
            y1: "0%",
            x2: "100%",
            y2: "100%",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "0%",
              stopColor: gradeColor,
              stopOpacity: "0.6"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Stop, {
              offset: "100%",
              stopColor: gradeColor,
              stopOpacity: "0.2"
            })]
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
          cx: cx,
          cy: cy,
          r: radius,
          stroke: "rgba(240,240,245,0.06)",
          strokeWidth: strokeWidth,
          fill: "none"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_reactNativeSvg.Circle, {
          cx: cx,
          cy: cy,
          r: radius,
          stroke: "url(#proof-grad)",
          strokeWidth: strokeWidth,
          fill: "none",
          strokeLinecap: "round",
          strokeDasharray: circumference,
          strokeDashoffset: 0,
          transform: `rotate(-90 ${cx} ${cy})`
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        style: [{
          alignItems: 'center'
        }, undefined],
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "display",
          style: {
            fontSize: s * 0.35,
            fontWeight: '800',
            color: gradeColor,
            textShadowColor: gradeColor,
            textShadowOffset: {
              width: 0,
              height: 0
            },
            textShadowRadius: 20
          },
          children: grade
        })
      })]
    });
  }
},3505,[12,18,80,1643,226,1489,1463,1681,1465,203]);
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
  exports.PerfectSessionBanner = PerfectSessionBanner;
  require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _expoLinearGradient = require(_dependencyMap[2]);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _themeThemeContext = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  /**
   * PerfectSessionBanner
   *
   * Shown when session is perfect: S grade + no pauses + 30min+
   * Renders BETWEEN GradeRevealAnimation settling and ChestReveal
   */

  function PerfectSessionBanner({
    isPerfect
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    if (!isPerfect) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: _reactNativeReanimated.ZoomIn.delay(300).duration(400).springify(),
      style: {
        marginHorizontal: theme.spacing[6],
        marginTop: theme.spacing[6]
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        borderRadius: "xl",
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "warning.500",
        style: {
          boxShadow: `0px 4px 8px ${theme.colors.warning.DEFAULT} / 0.3`
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_expoLinearGradient.LinearGradient, {
          colors: [theme.colors.warning.DEFAULT + '40',
          // 25% opacity
          theme.colors.warning.light + '20',
          // 12% opacity
          theme.colors.background.elevated],
          locations: [0, 0.3, 1],
          style: {
            padding: theme.spacing[5]
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            alignItems: "center",
            gap: "xs",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              style: {
                fontSize: 28,
                fontWeight: theme.fontWeights.bold
              },
              children: "\uD83C\uDF1F"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "h3",
              color: "warning.DEFAULT",
              weight: "bold",
              style: {
                textAlign: 'center'
              },
              children: "PERFECT SESSION"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              color: "text.secondary",
              style: {
                textAlign: 'center',
                marginTop: theme.spacing[2]
              },
              children: "Flawless block. Zero interruptions. VEX will carry this pattern forward."
            })]
          })
        })
      })
    });
  }
},3506,[12,226,2144,1462,1489,1463,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SessionCompleteRewardsPhase = SessionCompleteRewardsPhase;
  var _react = require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _featuresSessionCompletionComponentsXPEarnAnimation = require(_dependencyMap[2]);
  var _SessionCompletionRewardsSection = require(_dependencyMap[3]);
  var _CompanionGrowthSection = require(_dependencyMap[4]);
  var _SessionCompletionFollowThrough = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  function SessionCompleteRewardsPhase({
    controller,
    consequences,
    summary,
    sessionId,
    policy
  }) {
    const hidden = policy.hiddenCompletionSurfaces;
    const advancedRef = (0, _react.useRef)(false);
    (0, _react.useEffect)(() => {
      if (controller.rewards.completionStage === 1 && !advancedRef.current) {
        advancedRef.current = true;
        controller.rewards.actions.handleRevealComplete();
      }
    }, [controller.rewards.completionStage, controller.rewards.actions]);
    if (controller.rewards.completionStage < 1) {
      return null;
    }
    const showXpAnimation = controller.rewards.completionStage >= 1;
    const showRewards = controller.rewards.completionStage >= 2;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [showXpAnimation ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        px: 6,
        pt: 7,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionCompletionComponentsXPEarnAnimation.XPEarnAnimation, {
          levelProgress: controller.levelMetric?.progress ?? null,
          summary: summary,
          totalXp: summary.xpEarned ?? 0
        })
      }) : null, showRewards ? /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionCompletionRewardsSection.SessionCompletionRewardsSection, {
          levelMetric: controller.levelMetric,
          masteryState: controller.masteryState,
          consequences: consequences,
          nextActionLabel: controller.nextAction?.ctaLabel ?? null,
          policy: policy,
          progressionError: controller.progressionError,
          progressionLoading: controller.progressionLoading,
          rewards: controller.rewards,
          hiddenSurfaces: hidden,
          setMasteryState: controller.setMasteryState,
          studyProgress: hidden.includes('study_progress_card') ? null : controller.studyProgress,
          summary: summary,
          userId: controller.userId,
          onStartNewSession: () => controller.navigation.navigate({
            name: 'SessionSetup',
            params: {}
          })
        }), !hidden.includes('companion_growth_card') ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          px: 6,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_CompanionGrowthSection.CompanionGrowthSection, {
            sessionId: sessionId,
            summary: summary,
            theme: controller.theme,
            userId: controller.userId
          })
        }) : null, !hidden.includes('follow_through_cards') ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionCompletionFollowThrough.SessionCompletionFollowThrough, {
          summary: summary
        }) : null]
      }) : null]
    });
  }
},3507,[12,1462,3508,3511,3520,3522,203]);
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
  exports.XPEarnAnimation = XPEarnAnimation;
  var _react = require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _componentsPremiumStyles = require(_dependencyMap[4]);
  var _sharedUiComponentsAnimatedCounter = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function getBonusAmount(summary, keyword) {
    return (summary.bonuses || []).filter(bonus => bonus.type.toLowerCase().includes(keyword)).reduce((total, bonus) => total + bonus.amount, 0);
  }
  function buildXpLineItems(summary, totalXp) {
    const qualityBonus = (summary.finalScore ?? 0) >= 800 ? Math.max(0, Math.round(totalXp * 0.08)) : 0;
    const squadBonus = getBonusAmount(summary, 'squad');
    const knownBonuses = (summary.streakBonus ?? 0) + summary.modeBonus + qualityBonus + squadBonus;
    const baseXp = Math.max(0, totalXp - knownBonuses);
    const items = [{
      amount: baseXp,
      id: 'base',
      label: 'Session progress'
    }];
    if ((summary.streakBonus ?? 0) > 0) {
      items.push({
        amount: summary.streakBonus ?? 0,
        id: 'streak',
        label: 'Consistency bonus'
      });
    }
    if (summary.modeBonus > 0) {
      items.push({
        amount: summary.modeBonus,
        id: 'mode',
        label: 'Mode Bonus'
      });
    }
    if (qualityBonus > 0) {
      items.push({
        amount: qualityBonus,
        id: 'quality',
        label: 'Quality Bonus'
      });
    }
    if (squadBonus > 0) {
      items.push({
        amount: squadBonus,
        id: 'squad',
        label: 'Squad Bonus'
      });
    }
    return items;
  }
  const _worklet_8473108626525_init_data = {
    code: "function XPEarnAnimationTsx1(){const{reduceMotion,targetProgress,progress}=this.__closure;return{width:reduceMotion?targetProgress*100+\"%\":progress.value*100+\"%\"};}"
  };
  function XPEarnAnimation({
    levelProgress,
    summary,
    totalXp
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const reduceMotion = (0, _reactNativeReanimated.useReducedMotion)();
    const progress = (0, _reactNativeReanimated.useSharedValue)(0);
    const items = (0, _react.useMemo)(() => buildXpLineItems(summary, totalXp), [summary, totalXp]);
    const targetProgress = Math.max(0, Math.min(1, levelProgress ?? 0));
    (0, _react.useEffect)(() => {
      progress.value = (0, _reactNativeReanimated.withTiming)(targetProgress, {
        duration: 1100,
        easing: _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.cubic)
      });
    }, [progress, targetProgress]);
    const fillStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function XPEarnAnimationTsx1Factory({
      _worklet_8473108626525_init_data,
      reduceMotion,
      targetProgress,
      progress
    }) {
      const XPEarnAnimationTsx1 = () => ({
        width: reduceMotion ? `${targetProgress * 100}%` : `${progress.value * 100}%`
      });
      XPEarnAnimationTsx1.__closure = {
        reduceMotion,
        targetProgress,
        progress
      };
      XPEarnAnimationTsx1.__workletHash = 8473108626525;
      XPEarnAnimationTsx1.__initData = _worklet_8473108626525_init_data;
      return XPEarnAnimationTsx1;
    }({
      _worklet_8473108626525_init_data,
      reduceMotion,
      targetProgress,
      progress
    }));
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeInUp.duration(420),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        p: 20,
        style: Object.assign({
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.light,
          borderWidth: 1
        }, (0, _componentsPremiumStyles.getPremiumCardStyle)('large')),
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          color: theme.colors.primary[400],
          children: "PROGRESS BREAKDOWN"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h3",
          color: theme.colors.text.primary,
          mt: 2,
          children: "Your run is being counted."
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          mt: 5,
          gap: 3,
          children: items.map((item, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
            entering: _reactNativeReanimated.FadeInUp.delay(index * 80).duration(260),
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "body",
                color: theme.colors.text.secondary,
                children: item.label
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
                variant: "body",
                color: theme.colors.text.primary,
                fontWeight: "800",
                children: ["+", item.amount]
              })]
            })
          }, item.id))
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          mt: 6,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: theme.colors.text.secondary,
            children: "Progress total"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsAnimatedCounter.AnimatedCounter, {
            animateOnMount: true,
            color: theme.colors.warning.light,
            duration: 1200,
            previousValue: 0,
            prefix: "+",
            size: "xl",
            value: totalXp
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          height: 12,
          mt: 5,
          overflow: "hidden",
          borderRadius: theme.borderRadius.full,
          style: {
            backgroundColor: theme.colors.background.primary
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
            style: [{
              backgroundColor: theme.colors.primary[500],
              borderRadius: theme.borderRadius.full,
              height: '100%'
            }, fillStyle]
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: theme.colors.text.secondary,
          mt: 3,
          children: "Progression depth locks in before any milestone celebration fires."
        })]
      })
    });
  }
},3508,[12,226,1462,1489,3543,3509,1463,203]);
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
  Object.defineProperty(exports, "AnimatedCounter", {
    enumerable: true,
    get: function () {
      return AnimatedCounter;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _sharedUiCreateSheet = require(_dependencyMap[5]);
  var _AnimatedCounterHelpers = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  const TrendIndicator = ({
    direction,
    size,
    color
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const trendColor = color || (direction === 'up' ? theme.colors.success.DEFAULT : direction === 'down' ? theme.colors.error.DEFAULT : theme.colors.text.tertiary);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      style: [styles.trendIndicator, {
        width: size,
        height: size
      }],
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        style: [styles.trendArrow, {
          color: trendColor,
          fontSize: size
        }],
        children: direction === 'up' ? '▲' : direction === 'down' ? '▼' : '—'
      })
    });
  };
  const _worklet_13247547432158_init_data = {
    code: "function AnimatedCounterTsx1(){const{colorProgress,withTiming}=this.__closure;colorProgress.value=withTiming(0,{duration:500});}"
  };
  const _worklet_5050485998635_init_data = {
    code: "function AnimatedCounterTsx2(finished){const{runOnJS,setDisplayValue,to}=this.__closure;if(finished){runOnJS(setDisplayValue)(to);}}"
  };
  const _worklet_14505011076618_init_data = {
    code: "function AnimatedCounterTsx3(finished){const{runOnJS,setDisplayValue,to}=this.__closure;if(finished){runOnJS(setDisplayValue)(to);}}"
  };
  const _worklet_11379294289234_init_data = {
    code: "function AnimatedCounterTsx4(){const{interpolateColor,colorProgress,effectiveColor,trend,effectiveIncreaseColor,effectiveDecreaseColor}=this.__closure;return{color:interpolateColor(colorProgress.value,[0,0.5,1],[effectiveColor,trend==='up'?effectiveIncreaseColor:trend==='down'?effectiveDecreaseColor:effectiveColor,effectiveColor])};}"
  };
  const AnimatedCounter = ({
    value,
    previousValue,
    variant = 'default',
    currency,
    prefix,
    suffix,
    decimals = 0,
    size = 'md',
    color,
    increaseColor,
    decreaseColor,
    style,
    textStyle,
    duration = 800,
    useSpring = false,
    springConfig = {
      damping: 15,
      stiffness: 150
    },
    animateOnMount = true,
    showTrendIndicator = false,
    compactThreshold = 1000000,
    locale = 'en-US'
  }) => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const reducedMotion = (0, _reactNativeReanimated.useReducedMotion)();
    const [displayValue, setDisplayValue] = (0, _react.useState)(value);
    const previousRef = (0, _react.useRef)(previousValue ?? value);
    const animatedValue = (0, _reactNativeReanimated.useSharedValue)(animateOnMount ? 0 : value);
    const colorProgress = (0, _reactNativeReanimated.useSharedValue)(0);
    const effectiveColor = color || theme.colors.text.primary;
    const effectiveIncreaseColor = increaseColor || theme.colors.success.DEFAULT;
    const effectiveDecreaseColor = decreaseColor || theme.colors.error.DEFAULT;
    const trend = value > previousRef.current ? 'up' : value < previousRef.current ? 'down' : 'neutral';
    (0, _react.useEffect)(() => {
      const from = previousRef.current;
      const to = value;
      previousRef.current = value;
      if (reducedMotion) {
        animatedValue.value = to;
        setDisplayValue(to);
        return;
      }
      animatedValue.value = from;
      if (trend !== 'neutral') {
        colorProgress.value = 0;
        colorProgress.value = (0, _reactNativeReanimated.withTiming)(1, {
          duration: 300
        }, function AnimatedCounterTsx1Factory({
          _worklet_13247547432158_init_data,
          colorProgress,
          withTiming
        }) {
          const AnimatedCounterTsx1 = function () {
            colorProgress.value = withTiming(0, {
              duration: 500
            });
          };
          AnimatedCounterTsx1.__closure = {
            colorProgress,
            withTiming
          };
          AnimatedCounterTsx1.__workletHash = 13247547432158;
          AnimatedCounterTsx1.__initData = _worklet_13247547432158_init_data;
          return AnimatedCounterTsx1;
        }({
          _worklet_13247547432158_init_data,
          colorProgress,
          withTiming: _reactNativeReanimated.withTiming
        }));
      }
      if (useSpring) {
        animatedValue.value = (0, _reactNativeReanimated.withSpring)(to, springConfig, function AnimatedCounterTsx2Factory({
          _worklet_5050485998635_init_data,
          runOnJS,
          setDisplayValue,
          to
        }) {
          const AnimatedCounterTsx2 = function (finished) {
            if (finished) {
              runOnJS(setDisplayValue)(to);
            }
          };
          AnimatedCounterTsx2.__closure = {
            runOnJS,
            setDisplayValue,
            to
          };
          AnimatedCounterTsx2.__workletHash = 5050485998635;
          AnimatedCounterTsx2.__initData = _worklet_5050485998635_init_data;
          return AnimatedCounterTsx2;
        }({
          _worklet_5050485998635_init_data,
          runOnJS: _reactNativeReanimated.runOnJS,
          setDisplayValue,
          to
        }));
      } else {
        animatedValue.value = (0, _reactNativeReanimated.withTiming)(to, {
          duration,
          easing: _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.cubic)
        }, function AnimatedCounterTsx3Factory({
          _worklet_14505011076618_init_data,
          runOnJS,
          setDisplayValue,
          to
        }) {
          const AnimatedCounterTsx3 = function (finished) {
            if (finished) {
              runOnJS(setDisplayValue)(to);
            }
          };
          AnimatedCounterTsx3.__closure = {
            runOnJS,
            setDisplayValue,
            to
          };
          AnimatedCounterTsx3.__workletHash = 14505011076618;
          AnimatedCounterTsx3.__initData = _worklet_14505011076618_init_data;
          return AnimatedCounterTsx3;
        }({
          _worklet_14505011076618_init_data,
          runOnJS: _reactNativeReanimated.runOnJS,
          setDisplayValue,
          to
        }));
      }
    }, [value, duration, useSpring, springConfig, animatedValue, colorProgress, trend, reducedMotion]);
    const animatedTextStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function AnimatedCounterTsx4Factory({
      _worklet_11379294289234_init_data,
      interpolateColor,
      colorProgress,
      effectiveColor,
      trend,
      effectiveIncreaseColor,
      effectiveDecreaseColor
    }) {
      const AnimatedCounterTsx4 = () => ({
        color: interpolateColor(colorProgress.value, [0, 0.5, 1], [effectiveColor, trend === 'up' ? effectiveIncreaseColor : trend === 'down' ? effectiveDecreaseColor : effectiveColor, effectiveColor])
      });
      AnimatedCounterTsx4.__closure = {
        interpolateColor,
        colorProgress,
        effectiveColor,
        trend,
        effectiveIncreaseColor,
        effectiveDecreaseColor
      };
      AnimatedCounterTsx4.__workletHash = 11379294289234;
      AnimatedCounterTsx4.__initData = _worklet_11379294289234_init_data;
      return AnimatedCounterTsx4;
    }({
      _worklet_11379294289234_init_data,
      interpolateColor: _reactNativeReanimated.interpolateColor,
      colorProgress,
      effectiveColor,
      trend,
      effectiveIncreaseColor,
      effectiveDecreaseColor
    }));
    const sizeConfig = (0, _AnimatedCounterHelpers.getSizeConfig)(size);
    const currencySymbol = currency ? (0, _AnimatedCounterHelpers.getCurrencySymbol)(currency) : null;
    const getDisplayString = () => {
      const parts = [];
      if (prefix) {
        parts.push(prefix);
      }
      if (currencySymbol) {
        parts.push(currencySymbol);
      }
      parts.push((0, _AnimatedCounterHelpers.formatNumber)(displayValue, variant, decimals, compactThreshold, locale));
      if (suffix) {
        parts.push(suffix);
      }
      return parts.join('');
    };
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: [styles.container, style],
      children: [showTrendIndicator && trend !== 'neutral' && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(TrendIndicator, {
        direction: trend,
        size: sizeConfig.trendSize,
        color: trend === 'up' ? effectiveIncreaseColor : effectiveDecreaseColor
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.Text, {
        style: [styles.counter, {
          fontSize: sizeConfig.fontSize,
          fontWeight: sizeConfig.fontWeight
        }, animatedTextStyle, textStyle],
        children: getDisplayString()
      })]
    });
  };
  const styles = (0, _sharedUiCreateSheet.createSheet)({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },
    counter: {
      fontVariant: ['tabular-nums']
    },
    trendIndicator: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    trendArrow: {
      lineHeight: undefined
    }
  });
},3509,[12,80,226,1489,1463,1678,3510,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "formatNumber", {
    enumerable: true,
    get: function () {
      return formatNumber;
    }
  });
  exports.getCurrencySymbol = getCurrencySymbol;
  exports.getSizeConfig = getSizeConfig;
  const _worklet_6966684499473_init_data = {
    code: "function formatNumber_AnimatedCounterHelpersTs1(value,variant,decimals,compactThreshold,locale){if(variant==='compact'||variant==='currency'&&Math.abs(value)>=compactThreshold){return Intl.NumberFormat(locale,{notation:'compact',maximumFractionDigits:1}).format(value);}if(variant==='percentage'){return value.toFixed(decimals)+\"%\";}return value.toLocaleString(locale,{minimumFractionDigits:decimals,maximumFractionDigits:decimals});}"
  };
  const formatNumber = function formatNumber_AnimatedCounterHelpersTs1Factory({
    _worklet_6966684499473_init_data
  }) {
    const formatNumber = function (value, variant, decimals, compactThreshold, locale) {
      if (variant === 'compact' || variant === 'currency' && Math.abs(value) >= compactThreshold) {
        return Intl.NumberFormat(locale, {
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(value);
      }
      if (variant === 'percentage') {
        return `${value.toFixed(decimals)}%`;
      }
      return value.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    };
    formatNumber.__closure = {};
    formatNumber.__workletHash = 6966684499473;
    formatNumber.__initData = _worklet_6966684499473_init_data;
    return formatNumber;
  }({
    _worklet_6966684499473_init_data
  });
  function getCurrencySymbol(currency) {
    const symbols = {
      coins: '🪙',
      gems: '💎',
      xp: '⭐',
      usd: '$',
      eur: '€',
      gbp: '£'
    };
    return symbols[currency] || currency;
  }
  function getSizeConfig(size) {
    const configs = {
      xs: {
        fontSize: 12,
        fontWeight: '500',
        trendSize: 8
      },
      sm: {
        fontSize: 14,
        fontWeight: '600',
        trendSize: 10
      },
      md: {
        fontSize: 18,
        fontWeight: '700',
        trendSize: 12
      },
      lg: {
        fontSize: 24,
        fontWeight: '700',
        trendSize: 14
      },
      xl: {
        fontSize: 32,
        fontWeight: '800',
        trendSize: 16
      },
      hero: {
        fontSize: 48,
        fontWeight: '900',
        trendSize: 20
      }
    };
    return configs[size];
  }
},3510,[]);
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
  exports.SessionCompletionRewardsSection = SessionCompletionRewardsSection;
  require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsBanner = require(_dependencyMap[2]);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _featuresMasteryComponentsMasteryCard = require(_dependencyMap[4]);
  var _SessionAdaptivePayoffCard = require(_dependencyMap[5]);
  var _SessionProgressionCard = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function SessionCompletionRewardsSection({
    consequences,
    hiddenSurfaces,
    levelMetric,
    masteryState,
    nextActionLabel,
    policy,
    progressionError,
    progressionLoading,
    rewards,
    setMasteryState,
    studyProgress,
    summary,
    userId,
    onStartNewSession
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeInUp.duration(420),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        px: 6,
        pt: 7,
        children: [rewards.rewardCreditStatus === 'failed' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          mb: 4,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBanner.Banner, {
            title: "Rewards couldn't save right now - we'll retry automatically",
            variant: "warning",
            actionText: "Retry",
            onAction: () => rewards.actions.applyCompletionRewards()
          })
        }) : rewards.rewardCreditStatus === 'crediting' || rewards.rewardCreditStatus === 'retrying' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          mb: 4,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsBanner.Banner, {
            title: "Saving rewards",
            description: rewards.rewardCreditStatus === 'retrying' ? 'We are retrying the reward sync in the background.' : 'Your XP and streak updates are being locked in.',
            variant: "info"
          })
        }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionProgressionCard.SessionProgressionCard, {
          isRewardSyncing: rewards.rewardCreditStatus === 'crediting' || rewards.rewardCreditStatus === 'retrying' || progressionLoading,
          levelMetric: progressionError ? null : levelMetric,
          rewardCreditStatus: rewards.rewardCreditStatus,
          rewardError: rewards.rewardCreditError,
          streakIncreased: summary.streakIncreased,
          streakLabel: `${summary.streakDays} Day Streak`,
          studyProgress: null,
          onRetryRewards: () => rewards.actions.applyCompletionRewards(),
          onStartNewSession: onStartNewSession
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionAdaptivePayoffCard.SessionAdaptivePayoffCard, {
          consequences: consequences,
          nextActionLabel: nextActionLabel,
          policy: policy,
          studyProgress: studyProgress,
          summary: summary
        }), masteryState && !hiddenSurfaces.includes('mastery_card') ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          entering: _reactNativeReanimated.FadeInUp.delay(500).duration(420),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            pt: 5,
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresMasteryComponentsMasteryCard.MasteryCard, {
              userId: userId,
              state: masteryState,
              onStateChange: setMasteryState
            })
          })
        }) : null]
      })
    });
  }
},3511,[12,226,3358,1462,3512,3515,3517,203]);
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
  exports.MasteryCard = MasteryCard;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesButton = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _componentsPremiumStyles = require(_dependencyMap[4]);
  var _themeThemeContext = require(_dependencyMap[5]);
  var _hooks = require(_dependencyMap[6]);
  var _MasteryRankBadge = require(_dependencyMap[7]);
  var _TechniqueBar = require(_dependencyMap[8]);
  var _masteryCardConstants = require(_dependencyMap[9]);
  var _reactJsxRuntime = require(_dependencyMap[10]);
  function MasteryCard({
    userId,
    state,
    onStateChange
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      claimChallenge,
      getMasteryState
    } = (0, _hooks.useMasteryActions)();

    // Use prop directly instead of mirroring into state via useEffect

    const handleClaim = challengeId => {
      const updatedState = claimChallenge(userId, challengeId);
      if (!updatedState) {
        return;
      }
      onStateChange?.(updatedState);
    };
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: Object.assign({
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing[4],
        gap: theme.spacing[4]
      }, (0, _componentsPremiumStyles.getPremiumCardStyle)('medium')),
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          gap: theme.spacing[2]
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_MasteryRankBadge.MasteryRankBadge, {
          rank: state.rank,
          totalPoints: state.totalMasteryPoints,
          size: "md"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "bodySmall",
          color: theme.colors.text.secondary,
          children: [state.totalMasteryPoints, " mastery points"]
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: {
          gap: theme.spacing[3]
        },
        children: _masteryCardConstants.TECHNIQUES.map(item => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_TechniqueBar.TechniqueBar, {
          label: item.label,
          value: state.techniques[item.key],
          color: item.key === 'durationMastery' ? theme.colors.primary[500] : item.color
        }, item.key))
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          gap: theme.spacing[3]
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: theme.colors.text.primary,
          children: "Active Challenges"
        }), state.activeChallenges.slice(0, 3).map(challenge => {
          const badgeColor = _masteryCardConstants.difficultyColors[challenge.difficulty];
          const progress = challenge.target > 0 ? Math.max(0, Math.min(1, challenge.current / challenge.target)) : 0;
          return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: {
              borderWidth: 1,
              borderColor: theme.colors.border.light,
              borderRadius: 16,
              padding: theme.spacing[3],
              gap: theme.spacing[2],
              backgroundColor: theme.colors.background.primary
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
              style: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: theme.spacing[2]
              },
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
                style: {
                  flex: 1,
                  gap: theme.spacing[1]
                },
                children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  variant: "body",
                  color: theme.colors.text.primary,
                  fontWeight: "700",
                  children: challenge.title
                }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  variant: "bodySmall",
                  color: theme.colors.text.secondary,
                  children: challenge.description
                })]
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
                style: {
                  borderRadius: 999,
                  paddingHorizontal: theme.spacing[2],
                  paddingVertical: theme.spacing[1],
                  backgroundColor: (0, _componentsPremiumStyles.withAlpha)(badgeColor, 0.14)
                },
                children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  variant: "caption",
                  color: badgeColor,
                  children: challenge.difficulty
                })
              })]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
              style: {
                gap: theme.spacing[1]
              },
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
                style: {
                  height: 6,
                  borderRadius: 3,
                  overflow: 'hidden',
                  backgroundColor: theme.colors.background.tertiary
                },
                children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
                  style: {
                    width: `${progress * 100}%`,
                    height: 6,
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
                  color: theme.colors.text.secondary,
                  children: [challenge.current, "/", challenge.target, " ", challenge.unit]
                }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
                  variant: "caption",
                  color: theme.colors.primary[400],
                  children: ["+", challenge.masteryPoints, " mastery"]
                })]
              })]
            }), challenge.status === 'COMPLETED' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
              size: "sm",
              variant: "outline",
              onPress: () => handleClaim(challenge.id),
              accessibilityLabel: "Claim reward",
              accessibilityRole: "button",
              accessibilityHint: "Double tap to activate",
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                children: "Claim"
              })
            }) : null]
          }, challenge.id);
        })]
      })]
    });
  }
},3512,[12,80,1680,1489,3543,1463,3513,3544,3545,3514,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useMasteryActions = useMasteryActions;
  var _react = require(_dependencyMap[0]);
  var _service = require(_dependencyMap[1]);
  function useMasteryActions() {
    const claimChallenge = (0, _react.useCallback)((userId, challengeId) => {
      if (!userId) {
        return null;
      }
      const success = _service.MasteryService.claimChallenge(userId, challengeId);
      if (!success) {
        return null;
      }
      return _service.MasteryService.getOrCreateMasteryState(userId);
    }, []);
    const getMasteryState = (0, _react.useCallback)(userId => {
      if (!userId) {
        return null;
      }
      return _service.MasteryService.getOrCreateMasteryState(userId);
    }, []);
    return {
      claimChallenge,
      getMasteryState
    };
  }
},3513,[12,2996]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "TECHNIQUES", {
    enumerable: true,
    get: function () {
      return TECHNIQUES;
    }
  });
  Object.defineProperty(exports, "difficultyColors", {
    enumerable: true,
    get: function () {
      return difficultyColors;
    }
  });
  var _themeTokensColors = require(_dependencyMap[0]);
  const TECHNIQUES = [{
    key: 'durationMastery',
    label: 'Duration Focus'
  }, {
    key: 'purityMastery',
    label: 'Purity',
    color: _themeTokensColors.lightColors.accent.green
  }, {
    key: 'consistencyMastery',
    label: 'Consistency',
    color: _themeTokensColors.lightColors.semantic.warning
  }, {
    key: 'comebackMastery',
    label: 'Comeback',
    color: _themeTokensColors.lightColors.semantic.danger
  }, {
    key: 'bossMastery',
    label: 'Boss Damage',
    color: _themeTokensColors.lightColors.accent.purple
  }];
  const difficultyColors = {
    EASY: _themeTokensColors.lightColors.accent.green,
    MEDIUM: _themeTokensColors.lightColors.accent.blue,
    HARD: _themeTokensColors.lightColors.semantic.warning,
    ELITE: _themeTokensColors.lightColors.accent.purple
  };
},3514,[1465]);
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
  exports.SessionAdaptivePayoffCard = SessionAdaptivePayoffCard;
  var _react = require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _componentsPremiumStyles = require(_dependencyMap[4]);
  var _featuresSessionCompletionAdaptivePayoffService = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function SessionAdaptivePayoffCard({
    consequences,
    nextActionLabel,
    policy,
    studyProgress,
    summary
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const payoff = (0, _react.useMemo)(() => (0, _featuresSessionCompletionAdaptivePayoffService.buildCompletionAdaptivePayoff)({
      adaptivePayoff: policy.adaptivePayoff,
      bossDamage: consequences?.boss?.damageDealt ?? summary.damage?.totalDamage ?? null,
      coachActionLabel: nextActionLabel,
      study: studyProgress ? {
        nextTopic: studyProgress.nextSessionGoal?.topic ?? null,
        progressLabel: studyProgress.progressLabel,
        title: studyProgress.planTitle
      } : null,
      summary
    }), [consequences?.boss?.damageDealt, nextActionLabel, policy.adaptivePayoff, studyProgress, summary]);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeInUp.delay(220).duration(360),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        mt: 5,
        p: 18,
        style: Object.assign({
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.primary[500],
          borderWidth: 1
        }, (0, _componentsPremiumStyles.getPremiumCardStyle)('medium')),
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          color: theme.colors.primary[400],
          children: payoff.label
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h3",
          color: theme.colors.text.primary,
          mt: 2,
          children: payoff.title
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: theme.colors.primary[500],
          mt: 3,
          children: payoff.value
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: theme.colors.text.secondary,
          mt: 2,
          children: payoff.body
        })]
      })
    });
  }
},3515,[12,226,1462,1489,3543,3516,1463,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.buildCompletionAdaptivePayoff = buildCompletionAdaptivePayoff;
  exports.countFinalReleaseCompletionBeats = countFinalReleaseCompletionBeats;
  var _zod = require(_dependencyMap[0]);
  var _sessionTypesSchemas = require(_dependencyMap[1]);
  const CompletionPayoffSchema = _zod.z.object({
    body: _zod.z.string().min(1),
    label: _zod.z.string().min(1),
    title: _zod.z.string().min(1),
    value: _zod.z.string().min(1)
  }).strict();
  const BuildCompletionPayoffInputSchema = _zod.z.object({
    adaptivePayoff: _zod.z.enum(['study_progress', 'boss_damage', 'coach_next_action', 'progress_insight']),
    bossDamage: _zod.z.number().nonnegative().nullable(),
    coachActionLabel: _zod.z.string().min(1).nullable(),
    study: _zod.z.object({
      nextTopic: _zod.z.string().min(1).nullable(),
      progressLabel: _zod.z.string().min(1),
      title: _zod.z.string().min(1)
    }).nullable(),
    summary: _sessionTypesSchemas.SessionSummarySchema
  }).strict();
  function buildCompletionAdaptivePayoff(rawInput) {
    const input = BuildCompletionPayoffInputSchema.parse(rawInput);
    if (input.adaptivePayoff === 'study_progress' && input.study) {
      return CompletionPayoffSchema.parse({
        body: input.study.nextTopic ? `Next review: ${input.study.nextTopic}` : 'Your study plan is ready for the next focused review.',
        label: 'STUDY PROGRESS',
        title: input.study.title,
        value: input.study.progressLabel
      });
    }
    if (input.adaptivePayoff === 'boss_damage') {
      const damage = input.bossDamage ?? input.summary.damage?.totalDamage ?? 0;
      return CompletionPayoffSchema.parse({
        body: damage > 0 ? 'That focus landed as visible pressure.' : 'Boss pressure stays queued for the next focused run.',
        label: 'BOSS DAMAGE',
        title: 'Focus hit the boss.',
        value: damage > 0 ? `${damage} damage` : 'Pressure banked'
      });
    }
    if (input.adaptivePayoff === 'coach_next_action') {
      return CompletionPayoffSchema.parse({
        body: 'Use the next move while this session is still fresh.',
        label: 'COACH NEXT ACTION',
        title: input.coachActionLabel ?? 'Start the next clean block.',
        value: 'Next action set'
      });
    }
    return CompletionPayoffSchema.parse({
      body: input.summary.focusPurityScore ? `${input.summary.focusPurityScore}% purity with ${input.summary.completionPercentage}% completion.` : 'Your session progress is saved and ready to compound.',
      label: 'PROGRESS INSIGHT',
      title: 'Progress moved forward.',
      value: `+${input.summary.xpEarned ?? 0} focus progress`
    });
  }
  function countFinalReleaseCompletionBeats(policy) {
    return new Set([policy.heroBeat.kind, policy.progressBeat.kind, policy.reflectionBeat.kind, policy.adaptivePayoff]).size;
  }
},3516,[1774,1854]);
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
  exports.SessionProgressionCard = SessionProgressionCard;
  require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesButton = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _componentsPremiumStyles = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _MetricRow = require(_dependencyMap[7]);
  var _StudyProgressPanel = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  function SessionProgressionCard({
    isRewardSyncing,
    levelMetric,
    rewardCreditStatus,
    rewardError,
    streakLabel,
    streakIncreased,
    studyProgress,
    onRetryRewards,
    onStartNewSession: _onStartNewSession
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const metrics = [levelMetric].filter(_MetricRow.isProgressMetric);
    const rewardStatusMessage = rewardCreditStatus === 'crediting' ? 'Saving progress...' : rewardCreditStatus === 'retrying' ? 'Retrying progress sync...' : rewardCreditStatus === 'success' ? 'Progress saved' : rewardCreditStatus === 'failed' ? 'Progress is waiting to sync' : null;
    const rewardStatusColor = rewardCreditStatus === 'success' ? theme.colors.success.DEFAULT : rewardCreditStatus === 'failed' ? theme.colors.warning.DEFAULT : theme.colors.text.secondary;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      gap: 16,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Animated.default.View, {
        entering: _reactNativeReanimated.FadeInUp.springify(),
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          color: theme.colors.primary[400],
          children: "SESSION SUMMARY"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h2",
          color: theme.colors.text.primary,
          mt: 8,
          children: "The run paid off."
        }), rewardStatusMessage ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: rewardStatusColor,
          mt: 8,
          children: rewardStatusMessage
        }) : null]
      }), metrics.length > 0 ? metrics.map((metric, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_MetricRow.MetricRow, {
        metric: metric,
        delay: index * 150
      }, metric.id)) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        entering: _reactNativeReanimated.FadeInUp.delay(150).springify(),
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          p: 18,
          style: Object.assign({
            backgroundColor: theme.colors.background.secondary,
            borderWidth: 1,
            borderColor: theme.colors.border.light
          }, (0, _componentsPremiumStyles.getPremiumCardStyle)('medium')),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "body",
            color: theme.colors.text.secondary,
            children: "Progression data is syncing. Your progress is still safe."
          })
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        entering: _reactNativeReanimated.FadeInUp.delay(150).springify(),
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          p: 18,
          style: Object.assign({
            backgroundColor: theme.colors.background.secondary,
            borderWidth: 1,
            borderColor: theme.colors.border.light
          }, (0, _componentsPremiumStyles.getPremiumCardStyle)('medium')),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
              variant: "h4",
              color: theme.colors.text.primary,
              children: ["Consistency ", streakLabel]
            }), streakIncreased ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
              px: 10,
              py: 4,
              borderRadius: 999,
              style: {
                backgroundColor: theme.colors.warning.DEFAULT
              },
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "caption",
                color: theme.colors.text.inverse,
                children: "+1"
              })
            }) : null]
          })
        })
      }), studyProgress ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_StudyProgressPanel.StudyProgressPanel, {
        studyProgress: studyProgress
      }) : null, isRewardSyncing || rewardError ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        entering: _reactNativeReanimated.FadeInUp.delay(750).springify(),
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          alignItems: "center",
          gap: 8,
          children: [isRewardSyncing ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: theme.colors.text.secondary,
            children: "Applying progress..."
          }) : null, rewardError ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: theme.colors.error.DEFAULT,
            children: rewardError
          }) : null, rewardError ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
            variant: "outline",
            size: "sm",
            onPress: onRetryRewards,
            accessibilityLabel: "Retry loading progress",
            accessibilityRole: "button",
            accessibilityHint: "Double tap to activate",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              children: "Retry"
            })
          }) : null]
        })
      }) : null]
    });
  }
},3517,[12,226,1462,1680,1489,3543,1463,3518,3519,203]);
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
  exports.isProgressMetric = isProgressMetric;
  exports.MetricRow = MetricRow;
  require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _componentsPremiumStyles = require(_dependencyMap[4]);
  var _iconsComponentsIcon = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function isProgressMetric(metric) {
    return metric !== null;
  }
  function MetricRow({
    metric,
    delay
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeInUp.delay(delay).springify(),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        p: 18,
        style: Object.assign({
          backgroundColor: theme.colors.background.secondary,
          borderWidth: 1,
          borderColor: theme.colors.border.light
        }, (0, _componentsPremiumStyles.getPremiumCardStyle)('medium')),
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 10,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            children: [metric.icon ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
              name: metric.icon,
              size: 18,
              color: metric.accent
            }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "label",
              color: theme.colors.text.secondary,
              children: metric.label
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "body",
            color: theme.colors.text.primary,
            fontWeight: "700",
            children: metric.value
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          height: 10,
          borderRadius: 999,
          overflow: "hidden",
          style: {
            backgroundColor: theme.colors.background.primary
          },
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            height: "100%",
            width: `${Math.max(0, Math.min(1, metric.progress)) * 100}%`,
            borderRadius: 999,
            style: {
              backgroundColor: metric.accent
            }
          })
        }), metric.reward ? /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 10,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: theme.colors.text.secondary,
            children: metric.reward
          }), metric.showPlusBadge ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            px: 10,
            py: 4,
            borderRadius: 999,
            style: {
              backgroundColor: theme.colors.primary[500]
            },
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: theme.colors.text.inverse,
              children: "+1"
            })
          }) : null]
        }) : null]
      })
    });
  }
},3518,[12,226,1462,1489,3543,1691,1463,203]);
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
  exports.StudyProgressPanel = StudyProgressPanel;
  require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesButton = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _componentsPremiumStyles = require(_dependencyMap[5]);
  var _iconsComponentsIcon = require(_dependencyMap[6]);
  var _themeThemeContext = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  function StudyProgressPanel({
    studyProgress
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeInUp.delay(600).springify(),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        p: 18,
        style: Object.assign({
          backgroundColor: `${theme.colors.primary[500]}08`,
          borderWidth: 1,
          borderColor: theme.colors.primary[500]
        }, (0, _componentsPremiumStyles.getPremiumCardStyle)('medium')),
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 12,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
              name: "book",
              size: 20,
              color: theme.colors.primary[500]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "label",
              color: "primary.500",
              children: "STUDY PROGRESS"
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.secondary",
            children: studyProgress.progressLabel
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: "text.primary",
          mb: 12,
          children: studyProgress.planTitle
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          height: 10,
          borderRadius: 999,
          overflow: "hidden",
          style: {
            backgroundColor: theme.colors.background.primary
          },
          mb: 12,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            height: "100%",
            width: `${Math.max(0, Math.min(1, studyProgress.progress)) * 100}%`,
            borderRadius: 999,
            style: {
              backgroundColor: theme.colors.primary[500]
            }
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          gap: 12,
          mb: 14,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flex: 1,
            p: 12,
            borderRadius: 8,
            style: {
              backgroundColor: theme.colors.background.tertiary
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.tertiary",
              children: "Chapters"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
              variant: "body",
              color: "text.primary",
              fontWeight: "600",
              children: [studyProgress.chaptersCompleted, "/", studyProgress.totalChapters]
            })]
          }), studyProgress.quizAccuracy !== null && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flex: 1,
            p: 12,
            borderRadius: 8,
            style: {
              backgroundColor: theme.colors.background.tertiary
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.tertiary",
              children: "Quiz Accuracy"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
              variant: "body",
              color: "success.DEFAULT",
              fontWeight: "600",
              children: [studyProgress.quizAccuracy, "%"]
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flex: 1,
            p: 12,
            borderRadius: 8,
            style: {
              backgroundColor: theme.colors.background.tertiary
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.tertiary",
              children: "Study Time"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
              variant: "body",
              color: "text.primary",
              fontWeight: "600",
              children: [studyProgress.totalStudyTimeMinutes, "m"]
            })]
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: "text.primary",
          children: studyProgress.taskLabel
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "bodySmall",
          color: "text.secondary",
          mt: 4,
          mb: 12,
          children: studyProgress.taskTitle
        }), studyProgress.nextSessionGoal && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          p: 12,
          borderRadius: 8,
          mb: 14,
          style: {
            backgroundColor: `${theme.colors.info.DEFAULT}15`,
            borderLeftWidth: 3,
            borderLeftColor: theme.colors.info.DEFAULT
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "info.DEFAULT",
            fontWeight: "600",
            children: "Next Session Goal"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "bodySmall",
            color: "text.primary",
            mt: 4,
            children: studyProgress.nextSessionGoal.topic
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: "text.tertiary",
            mt: 4,
            children: ["Suggested:", ' ', studyProgress.nextSessionGoal.suggestedDurationMinutes, " min"]
          })]
        }), studyProgress.error ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: theme.colors.error.DEFAULT,
          mt: 10,
          children: studyProgress.error
        }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          gap: 12,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
            size: "sm",
            onPress: studyProgress.onMarkComplete,
            isLoading: studyProgress.isCompleting,
            accessibilityLabel: "Mark complete",
            accessibilityRole: "button",
            accessibilityHint: "Double tap to activate",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              children: "Mark Complete"
            })
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
            variant: "outline",
            size: "sm",
            onPress: studyProgress.onSkip,
            accessibilityLabel: "Skip task",
            accessibilityRole: "button",
            accessibilityHint: "Double tap to activate",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              children: "Skip"
            })
          })]
        })]
      })
    });
  }
},3519,[12,226,1462,1680,1489,3543,1691,1463,203]);
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
  exports.CompanionGrowthSection = CompanionGrowthSection;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesButton = require(_dependencyMap[4]);
  var _componentsPrimitivesText = require(_dependencyMap[5]);
  var _hooksUseReducedMotion = require(_dependencyMap[6]);
  var _featuresCompanionSessionStorage = require(_dependencyMap[7]);
  var _CompanionGrowthSectionHelpers = require(_dependencyMap[8]);
  var _reactJsxRuntime = require(_dependencyMap[9]);
  function CompanionGrowthSection({
    sessionId,
    summary,
    theme,
    userId
  }) {
    const {
      isReducedMotion
    } = (0, _hooksUseReducedMotion.useReducedMotion)();
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
      (0, _featuresCompanionSessionStorage.loadCompanionGrowth)(userId, sessionId).then(growth => growth ?? (0, _CompanionGrowthSectionHelpers.buildFallbackGrowth)(sessionId, summary, userId)).then(growth => {
        if (!mountedRef.current) {
          return;
        }
        setLoadState({
          status: 'success',
          growth
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
    }, [sessionId, summary, userId]);
    (0, _react.useEffect)(() => {
      load();
    }, [load]);
    if (loadState.status === 'loading') {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        mt: 6,
        p: 4,
        borderRadius: "lg",
        bg: theme.colors.background.secondary,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          width: 160,
          height: 16,
          borderRadius: "sm",
          bg: theme.colors.background.tertiary
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          mt: 3,
          width: "100%",
          height: 10,
          borderRadius: "full",
          bg: theme.colors.background.tertiary
        })]
      });
    }
    if (loadState.status === 'error') {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        mt: 6,
        p: 4,
        borderRadius: "lg",
        bg: theme.colors.background.secondary,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          color: theme.colors.error.DEFAULT,
          children: "Companion sync stumbled."
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: theme.colors.text.secondary,
          mt: 1,
          children: "Your session is safe. Retry the companion growth sync."
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "secondary",
          onPress: load,
          style: {
            marginTop: theme.spacing[3]
          },
          accessibilityLabel: "Retry loading",
          accessibilityRole: "button",
          accessibilityHint: "Double tap to activate",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: "Retry"
          })
        })]
      });
    }
    if (loadState.status === 'empty') {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        mt: 6,
        p: 4,
        borderRadius: "lg",
        bg: theme.colors.background.secondary,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          color: theme.colors.text.primary,
          children: "Companion is waiting for a profile."
        })
      });
    }
    const {
      growth
    } = loadState;
    const progressPercent = Math.round(growth.progressToEvolution * 100);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: isReducedMotion ? undefined : _reactNativeReanimated.FadeIn.duration(260),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        mt: 6,
        p: 4,
        borderRadius: "lg",
        bg: theme.colors.background.secondary,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "label",
              color: theme.colors.primary[400],
              children: "Companion grew with you"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "h4",
              color: theme.colors.text.primary,
              mt: 1,
              children: growth.mood
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
            variant: "caption",
            color: theme.colors.text.secondary,
            children: [growth.phase, " - LVL ", growth.level]
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          mt: 4,
          height: 10,
          borderRadius: "full",
          bg: theme.colors.background.tertiary,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: {
              backgroundColor: theme.colors.primary[500],
              borderRadius: theme.spacing[2],
              height: theme.spacing[2],
              width: `${progressPercent}%`
            }
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: theme.colors.text.secondary,
          mt: 2,
          children: [progressPercent, "% toward the next evolution."]
        }), growth.leveledUp ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          entering: isReducedMotion ? undefined : _reactNativeReanimated.ZoomIn.duration(300),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "label",
            color: theme.colors.success.DEFAULT,
            mt: 3,
            children: growth.evolved ? 'Evolution burst unlocked.' : 'Companion level up.'
          })
        }) : null]
      })
    });
  }
},3520,[12,80,226,1462,1680,1489,1681,3541,3521,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.buildFallbackGrowth = buildFallbackGrowth;
  var _featuresCompanionSessionStorage = require(_dependencyMap[0]);
  async function buildFallbackGrowth(sessionId, summary, userId) {
    const state = await (0, _featuresCompanionSessionStorage.loadCompanionState)(userId);
    return {
      sessionId,
      mood: (0, _featuresCompanionSessionStorage.getMoodForSessionSummary)(summary),
      level: state.level,
      phase: state.phase,
      progressToEvolution: (0, _featuresCompanionSessionStorage.getEvolutionProgress)(state),
      totalFocusMinutes: state.totalFocusMinutes,
      leveledUp: false,
      evolved: false,
      updatedAt: Date.now()
    };
  }
},3521,[3541]);
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
  exports.SessionCompletionFollowThrough = SessionCompletionFollowThrough;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _componentsPremiumStyles = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function buildChallengeLines(summary) {
    const lines = [];
    if (summary.tasksPlanned && summary.tasksCompleted !== undefined) {
      lines.push({
        id: 'tasks',
        label: 'Planned work',
        value: `${summary.tasksCompleted}/${summary.tasksPlanned}`
      });
    }
    if (summary.streakIncreased) {
      lines.push({
        id: 'streak',
        label: 'Streak challenge',
        value: '+1 day'
      });
    }
    if (summary.completionPercentage >= 100) {
      lines.push({
        id: 'completion',
        label: 'Completion challenge',
        value: 'Cleared'
      });
    }
    return lines;
  }
  function FollowThroughCard({
    children,
    delay,
    title
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeInUp.delay(delay).duration(360),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        p: 18,
        style: Object.assign({
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.light,
          borderWidth: 1
        }, (0, _componentsPremiumStyles.getPremiumCardStyle)('medium')),
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "label",
          color: theme.colors.primary[400],
          children: title
        }), children]
      })
    });
  }
  function SessionCompletionFollowThrough({
    summary
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const [challengesExpanded, setChallengesExpanded] = (0, _react.useState)(false);
    const challengeLines = (0, _react.useMemo)(() => buildChallengeLines(summary), [summary]);
    const bossDamage = summary.damage?.totalDamage ?? 0;
    const tomorrowFocusMinutes = Math.max(15, Math.floor(summary.effectiveDuration / 120));
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      px: 6,
      pt: 5,
      gap: 4,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(FollowThroughCard, {
        delay: 120,
        title: "CHALLENGE PROGRESS",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
          accessibilityHint: "Expands or collapses compact challenge progress.",
          accessibilityLabel: "Toggle session challenge progress",
          accessibilityRole: "button",
          onPress: () => setChallengesExpanded(current => !current),
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 3,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              color: theme.colors.text.primary,
              fontWeight: "700",
              children: challengeLines.length > 0 ? `${challengeLines.length} updates ready` : 'No challenge changes from this run'
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: theme.colors.text.secondary,
              children: challengesExpanded ? 'Collapse' : 'Review'
            })]
          })
        }), challengesExpanded ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          mt: 4,
          gap: 3,
          children: challengeLines.length > 0 ? challengeLines.map(line => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "bodySmall",
              color: theme.colors.text.secondary,
              children: line.label
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "bodySmall",
              color: theme.colors.text.primary,
              fontWeight: "800",
              children: line.value
            })]
          }, line.id)) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "bodySmall",
            color: theme.colors.text.secondary,
            children: "Finish another focused run to push active challenges forward."
          })
        }) : null]
      }), bossDamage > 0 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(FollowThroughCard, {
        delay: 220,
        title: "BOSS DAMAGE",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 3,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "body",
            color: theme.colors.text.secondary,
            children: "Pressure applied"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "h3",
            color: theme.colors.error.DEFAULT,
            children: bossDamage
          })]
        })
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(FollowThroughCard, {
        delay: 320,
        title: "TOMORROW PREVIEW",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: theme.colors.text.primary,
          mt: 3,
          children: ["Bank one ", tomorrowFocusMinutes, "-minute run."]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: theme.colors.text.secondary,
          mt: 2,
          children: "Your streak momentum is warm. Tomorrow's first win should be short, clean, and early."
        })]
      })]
    });
  }
},3522,[12,1286,226,1462,1489,3543,1463,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SessionCompleteNextSteps = SessionCompleteNextSteps;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _SessionCompleteFooter = require(_dependencyMap[2]);
  var _SessionReturnReasonCard = require(_dependencyMap[3]);
  var _featuresHomeSpineComponentsTomorrowPreview = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function SessionCompleteNextSteps({
    controller,
    tomorrowPreview,
    bottomInset,
    onShare,
    onOpenReflection
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [tomorrowPreview && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        px: 6,
        mt: 8,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresHomeSpineComponentsTomorrowPreview.TomorrowPreviewSession, {
          preview: tomorrowPreview,
          onPress: () => {
            controller.navigation.navigate({
              name: 'Home',
              params: {}
            });
          }
        })
      }), controller.rewards.showCtas ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        px: 6,
        mt: 8,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionReturnReasonCard.SessionReturnReasonCard, {
          body: controller.returnPlan.returnReasonBody,
          theme: controller.theme,
          title: controller.returnPlan.returnReasonTitle
        })
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_SessionCompleteFooter.SessionCompleteFooter, {
        bottomInset: bottomInset,
        homeCtaLabel: controller.returnPlan.homeCtaLabel,
        nextSessionLabel: controller.nextAction?.ctaLabel ?? controller.returnPlan.nextSessionLabel,
        onOpenReflection: onOpenReflection,
        onStartNextSession: () => controller.navigation.navigate({
          name: 'SessionSetup',
          params: controller.nextAction?.routeParams ?? {}
        }),
        onShare: onShare,
        showCtas: controller.rewards.showCtas,
        theme: controller.theme
      })]
    });
  }
},3523,[12,1462,3524,3525,3526,203]);
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
  exports.SessionCompleteFooter = SessionCompleteFooter;
  require(_dependencyMap[0]);
  var _reactNativeReanimated = require(_dependencyMap[1]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesButton = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function SessionCompleteFooter({
    bottomInset,
    homeCtaLabel,
    nextSessionLabel,
    onOpenReflection,
    onStartNextSession,
    onShare,
    showCtas,
    theme
  }) {
    if (!showCtas) {
      return null;
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeInUp.delay(120).duration(320),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        px: 6,
        pt: 4,
        pb: bottomInset,
        style: {
          backgroundColor: `${theme.colors.background.primary}F2`,
          borderTopColor: theme.colors.border.light,
          borderTopWidth: 1
        },
        children: [onShare && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
          mb: 3,
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
            variant: "ghost",
            size: "md",
            fullWidth: true,
            onPress: onShare,
            accessibilityLabel: "Share session",
            accessibilityRole: "button",
            accessibilityHint: "Double tap to activate",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              children: "Share Your Session"
            })
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          gap: 3,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            flex: 1,
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
              size: "lg",
              fullWidth: true,
              onPress: onStartNextSession,
              accessibilityLabel: nextSessionLabel,
              accessibilityRole: "button",
              accessibilityHint: "Opens setup with the recommended next focus session",
              children: nextSessionLabel
            })
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            flex: 1,
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
              variant: "outline",
              size: "lg",
              fullWidth: true,
              onPress: onOpenReflection,
              accessibilityLabel: homeCtaLabel,
              accessibilityRole: "button",
              accessibilityHint: "Opens the completion reflection and return options",
              children: homeCtaLabel
            })
          })]
        })]
      })
    });
  }
},3524,[12,226,1462,1680,1489,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SessionReturnReasonCard = SessionReturnReasonCard;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  function SessionReturnReasonCard({
    body,
    theme,
    title
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      mt: 5,
      p: 5,
      borderRadius: "xl",
      style: {
        backgroundColor: theme.colors.background.secondary,
        borderColor: theme.colors.border.light,
        borderWidth: 1
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "label",
        color: theme.colors.primary[400],
        children: "Return Reason"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "h4",
        color: theme.colors.text.primary,
        mt: 2,
        children: title
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "body",
        color: theme.colors.text.secondary,
        mt: 2,
        children: body
      })]
    });
  }
},3525,[12,1462,1489,203]);
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
  Object.defineProperty(exports, "TomorrowPreviewCompact", {
    enumerable: true,
    get: function () {
      return _TomorrowPreviewCompact.TomorrowPreviewCompact;
    }
  });
  Object.defineProperty(exports, "TomorrowPreviewSession", {
    enumerable: true,
    get: function () {
      return _TomorrowPreviewSession.TomorrowPreviewSession;
    }
  });
  exports.TomorrowPreview = TomorrowPreview;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _iconsComponentsIcon = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _TomorrowPreviewPersonalized = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  var _TomorrowPreviewCompact = require(_dependencyMap[9]);
  var _TomorrowPreviewSession = require(_dependencyMap[10]);
  function EventIcon({
    type
  }) {
    const iconName = type === 'double_xp' ? 'fire' : type === 'squad_war' ? 'target' : type === 'boss_rush' ? 'bolt' : 'star';
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
      name: iconName,
      size: "sm",
      color: "secondary",
      variant: "solid"
    });
  }
  function TomorrowPreview(props) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const hasEvents = props.events.length > 0;
    const hasChallenges = props.challengesResetting.length > 0;
    const streakStatus = props.streakWillContinue ? {
      iconName: 'fire',
      text: `Streak continues (${props.currentStreak + 1} days)`,
      color: theme.colors.accent.orange
    } : {
      iconName: 'exclamation-triangle',
      text: 'Streak at risk - focus today!',
      color: theme.colors.error.DEFAULT
    };
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeInUp.duration(500).delay(400),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
        onPress: props.onPress,
        accessibilityLabel: "Tomorrow preview",
        accessibilityRole: "button",
        accessibilityHint: "Double tap to view details",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          m: "lg",
          p: "lg",
          borderRadius: "xl",
          bg: "background.secondary",
          borderWidth: 2,
          borderColor: "border.light",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            mb: "md",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
              flexDirection: "row",
              alignItems: "center",
              gap: "sm",
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
                name: "arrow-right",
                size: "md",
                color: "primary",
                variant: "solid"
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "h4",
                color: "text.primary",
                children: "Tomorrow"
              })]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.tertiary",
              children: "View calendar \u203A"
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            alignItems: "center",
            gap: "sm",
            mb: hasEvents || hasChallenges ? 'md' : undefined,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
              name: streakStatus.iconName,
              size: "md",
              color: streakStatus.color,
              variant: "solid"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              color: streakStatus.color,
              fontWeight: "600",
              children: streakStatus.text
            })]
          }), hasChallenges ? /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            mb: hasEvents ? 'md' : undefined,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
              flexDirection: "row",
              alignItems: "center",
              gap: "sm",
              mb: "xs",
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
                name: "bolt",
                size: "sm",
                color: "tertiary",
                variant: "solid"
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "caption",
                color: "text.tertiary",
                children: "CHALLENGES RESET"
              })]
            }), props.challengesResetting.map(challenge => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
              variant: "bodySmall",
              color: "text.secondary",
              ml: "lg",
              children: ["\u2022 ", challenge]
            }, challenge))]
          }) : null, hasEvents ? /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
              flexDirection: "row",
              alignItems: "center",
              gap: "sm",
              mb: "xs",
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
                name: "calendar",
                size: "sm",
                color: "tertiary",
                variant: "solid"
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "caption",
                color: "text.tertiary",
                children: "EVENTS"
              })]
            }), props.events.map(event => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
              flexDirection: "row",
              alignItems: "center",
              gap: "sm",
              ml: "lg",
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(EventIcon, {
                type: event.type
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
                variant: "bodySmall",
                color: "text.secondary",
                children: [event.name, event.time ? ` (${event.time})` : '']
              })]
            }, `${event.type}:${event.name}`))]
          }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_TomorrowPreviewPersonalized.TomorrowPreviewPersonalized, {
            bossPreview: props.bossPreview,
            dailyChallengesIncomplete: props.dailyChallengesIncomplete,
            hasChallenges: hasChallenges,
            hasEvents: hasEvents,
            powerHourPreview: props.powerHourPreview,
            rivalPreview: props.rivalPreview,
            streakMilestonePreview: props.streakMilestonePreview,
            streakWillContinue: props.streakWillContinue,
            xpAvailableTomorrow: props.xpAvailableTomorrow
          })]
        })
      })
    });
  }
},3526,[12,1286,226,1462,1489,1691,1463,3527,203,3528,3529]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.TomorrowPreviewPersonalized = TomorrowPreviewPersonalized;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  function PreviewLine({
    icon,
    label,
    text
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      mb: "md",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        alignItems: "center",
        gap: "sm",
        mb: "xs",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          fontSize: 16
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.tertiary",
          children: label
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        alignItems: "center",
        gap: "sm",
        ml: "lg",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "bodySmall",
          color: "text.secondary",
          children: text
        })
      })]
    });
  }
  function TomorrowPreviewPersonalized(props) {
    if (props.bossPreview) {
      const boss = props.bossPreview;
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(PreviewLine, {
        icon: "",
        label: "BOSS ALERT",
        text: boss.canDefeatTomorrow ? `One good session defeats ${boss.bossName}. Drops: ${boss.rewardName}` : `${boss.bossName} at ${boss.healthPercent.toFixed(0)}% - squad needs your help!`
      });
    }
    if (props.streakMilestonePreview) {
      const streak = props.streakMilestonePreview;
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(PreviewLine, {
        icon: "",
        label: "STREAK MILESTONE",
        text: `${streak.days}-day streak. Claim your ${streak.badgeName}`
      });
    }
    if (props.powerHourPreview) {
      const powerHour = props.powerHourPreview;
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(PreviewLine, {
        icon: "",
        label: "POWER HOUR TOMORROW",
        text: `${powerHour.day} at ${powerHour.time} - Triple XP for 1 hour`
      });
    }
    if (props.rivalPreview) {
      const rival = props.rivalPreview;
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(PreviewLine, {
        icon: "",
        label: "RIVAL ALERT",
        text: `${rival.rivalName} is ${rival.gap} min ahead. Close the gap`
      });
    }
    if (props.dailyChallengesIncomplete) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(PreviewLine, {
        icon: "",
        label: "CHALLENGES",
        text: `New challenges reset at midnight (+${props.xpAvailableTomorrow ?? 50} more XP available)`
      });
    }
    if (!props.hasEvents && !props.hasChallenges && props.streakWillContinue) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        alignItems: "center",
        gap: "sm",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          fontSize: 16
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "bodySmall",
          color: "text.tertiary",
          children: "Quiet day - perfect for building that streak"
        })]
      });
    }
    return null;
  }
},3527,[12,1462,1489,203]);
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
  exports.TomorrowPreviewCompact = TomorrowPreviewCompact;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  function TomorrowPreviewCompact({
    streakWillContinue,
    events,
    onPress
  }) {
    const firstEvent = events[0];
    const eventMark = firstEvent ? firstEvent.type === 'double_xp' ? '2x' : firstEvent.type === 'squad_war' ? 'SW' : firstEvent.type === 'boss_rush' ? 'BR' : 'EV' : null;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
      onPress: onPress,
      accessibilityLabel: "Tomorrow preview",
      accessibilityRole: "button",
      accessibilityHint: "Double tap to view details",
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        p: "md",
        borderRadius: "lg",
        bg: "background.secondary",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          flexDirection: "row",
          alignItems: "center",
          gap: "sm",
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            fontSize: 16
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "body",
            color: "text.secondary",
            children: "Tomorrow:"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            variant: "body",
            color: streakWillContinue ? 'text.primary' : 'error.DEFAULT',
            fontWeight: "600",
            children: streakWillContinue ? 'Streak continues' : 'Streak at risk'
          }), eventMark && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            fontSize: 16,
            children: eventMark
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.tertiary",
          children: "\u203A"
        })]
      })
    });
  }
},3528,[12,1286,1462,1489,203]);
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
  exports.TomorrowPreviewSession = TomorrowPreviewSession;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[3]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[4]);
  var _componentsPrimitivesText = require(_dependencyMap[5]);
  var _themeThemeContext = require(_dependencyMap[6]);
  var _themeTokensColors = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  function TomorrowPreviewSession({
    preview,
    onPress
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const getTypeColor = () => {
      switch (preview.type) {
        case 'STREAK_MILESTONE':
          return theme.colors.warning[500];
        case 'BOSS_NEAR_DEATH':
          return theme.colors.error[500];
        case 'RIVAL_GAP':
          return theme.colors.primary[500];
        case 'POWER_HOUR':
          return _themeTokensColors.lightColors.semantic.warning;
        case 'CHALLENGE_RESET':
          return _themeTokensColors.lightColors.accent.green;
        default:
          return theme.colors.primary[500];
      }
    };
    const accentColor = getTypeColor();
    const CardWrapper = onPress ? Pressable.default : View.default;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeInUp.duration(500).delay(800),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(CardWrapper, {
        onPress: onPress,
        accessibilityLabel: preview.headline,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          m: "lg",
          p: "lg",
          borderRadius: "xl",
          bg: theme.colors.background.secondary,
          borderWidth: 2,
          borderColor: accentColor,
          style: {
            boxShadow: `0px 2px 8px ${accentColor} / 0.2`
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            alignItems: "center",
            gap: "sm",
            mb: "md",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              fontSize: 20
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "label",
              color: "text.tertiary",
              children: "TOMORROW"
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: "md",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
              style: {
                width: 48,
                height: 48,
                borderRadius: theme.borderRadius.full,
                backgroundColor: `${accentColor}20`,
                justifyContent: 'center',
                alignItems: 'center'
              },
              children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                fontSize: 24
              })
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
              style: {
                flex: 1
              },
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "h4",
                color: "text.primary",
                fontWeight: "700",
                style: {
                  marginBottom: theme.spacing[1]
                },
                children: preview.headline
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "body",
                color: "text.secondary",
                children: preview.subtext
              }), preview.actionPrompt && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
                mt: "sm",
                px: "sm",
                py: "xs",
                borderRadius: "md",
                bg: `${accentColor}15`,
                children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  variant: "caption",
                  color: accentColor,
                  fontWeight: "600",
                  children: preview.actionPrompt
                })
              })]
            })]
          })]
        })
      })
    });
  }
},3529,[12,1286,80,226,1462,1489,1463,1465,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SessionContractReflectionCard = SessionContractReflectionCard;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesButton = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _utilsHaptics = require(_dependencyMap[5]);
  var _featuresFocusContractService = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  const options = [{
    status: 'done',
    label: 'Done',
    hint: 'Marks your focus contract as completed'
  }, {
    status: 'partial',
    label: 'Partial',
    hint: 'Marks your focus contract as partly completed'
  }, {
    status: 'not_done',
    label: 'Not this time',
    hint: 'Marks your focus contract as not completed'
  }];
  function SessionContractReflectionCard({
    contract,
    onReflect,
    isPending
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const reflectedStatus = contract?.completionStatus && contract.completionStatus !== 'skipped' ? contract.completionStatus : null;
    if (!contract) {
      return null;
    }
    const handleReflect = status => {
      (0, _utilsHaptics.triggerHaptic)(status === 'done' ? 'success' : 'impactLight');
      onReflect(status);
    };
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      mx: "lg",
      mb: "md",
      bg: "background.elevated",
      borderRadius: theme.borderRadius.lg,
      p: "lg",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "h4",
        mb: "sm",
        children: "Did you do it?"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        borderLeftWidth: 2,
        borderLeftColor: "primary.500",
        pl: "md",
        mb: "md",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: "text.secondary",
          children: contract.taskDescription
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        children: options.map(option => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          accessibilityHint: option.hint,
          accessibilityLabel: `Focus contract reflection: ${option.label}`,
          disabled: isPending || Boolean(reflectedStatus),
          haptic: "none",
          mb: "sm",
          onPress: () => handleReflect(option.status),
          variant: reflectedStatus === option.status ? 'primary' : 'outline',
          children: option.label
        }, option.status))
      }), reflectedStatus ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "caption",
        color: "text.secondary",
        mt: "md",
        children: (0, _featuresFocusContractService.getReflectionCopy)(reflectedStatus)
      }) : null]
    });
  }
},3530,[12,1462,1680,1489,1463,1683,3300,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "SESSION_MODE_TO_LANE", {
    enumerable: true,
    get: function () {
      return SESSION_MODE_TO_LANE;
    }
  });
  var _sessionModes = require(_dependencyMap[0]);
  const SESSION_MODE_TO_LANE = {
    [_sessionModes.SessionMode.STUDY]: 'student',
    [_sessionModes.SessionMode.LIGHT_FOCUS]: 'game_like',
    [_sessionModes.SessionMode.DEEP_WORK]: 'deep_creative',
    [_sessionModes.SessionMode.CREATIVE]: 'minimal_normal'
  };
},3531,[1829]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SessionCompleteSkeleton = SessionCompleteSkeleton;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsUiSkeleton = require(_dependencyMap[2]);
  var _themeThemeContext = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  function SessionCompleteSkeleton() {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      px: "xl",
      py: "2xl",
      style: {
        backgroundColor: theme.colors.background.primary
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
        width: "35%",
        height: theme.spacing[3]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        mt: "md",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
          width: "72%",
          height: theme.spacing[8]
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        mt: "sm",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
          width: "88%",
          height: theme.spacing[4]
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        mt: "xl",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.SkeletonCard, {
          lines: 3,
          height: theme.spacing[24]
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        mt: "lg",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.SkeletonCard, {
          lines: 4,
          height: theme.spacing[24]
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        mt: "lg",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.SkeletonCard, {
          lines: 2,
          height: theme.spacing[20]
        })
      })]
    });
  }
},3532,[12,1462,1676,1463,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.SessionSummaryUnavailable = SessionSummaryUnavailable;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesButton = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function SessionSummaryUnavailable({
    message,
    onDone,
    onRetry
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      px: 24,
      style: {
        backgroundColor: theme.colors.background.primary
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "h3",
        color: theme.colors.text.primary,
        textAlign: "center",
        children: "Session summary unavailable"
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "body",
        color: theme.colors.text.secondary,
        textAlign: "center",
        mt: 12,
        children: message ?? 'This victory screen could not load the completed session.'
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        width: "100%",
        mt: 24,
        children: onRetry ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "secondary",
          size: "lg",
          fullWidth: true,
          onPress: onRetry,
          accessibilityLabel: "Retry session summary recovery",
          accessibilityRole: "button",
          accessibilityHint: "Attempts to rebuild this completion summary from the saved session record",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: "Retry recovery"
          })
        }) : null
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        width: "100%",
        mt: onRetry ? 12 : 24,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "primary",
          size: "lg",
          fullWidth: true,
          onPress: onDone,
          accessibilityLabel: "Return to home",
          accessibilityRole: "button",
          accessibilityHint: "Leaves this unavailable completion summary and opens the home screen",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: "Done"
          })
        })
      })]
    });
  }
},3533,[12,1462,1680,1489,1463,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "SessionHistoryScreen", {
    enumerable: true,
    get: function () {
      return SessionHistoryScreenWithBoundary;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _shopifyFlashList = require(_dependencyMap[1]);
  var _reactNavigationNative = require(_dependencyMap[2]);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesFeatureScreen = require(_dependencyMap[4]);
  var _componentsPrimitivesText = require(_dependencyMap[5]);
  var _componentsStatesErrorState = require(_dependencyMap[6]);
  var _featuresSessionHistoryComponentsHistoryFilterTabs = require(_dependencyMap[7]);
  var _featuresSessionHistoryComponentsHistoryItem = require(_dependencyMap[8]);
  var _featuresSessionHistoryComponentsHistoryStats = require(_dependencyMap[9]);
  var _featuresSessionHistoryComponentsHistoryStates = require(_dependencyMap[10]);
  var _featuresSessionHistoryHooks = require(_dependencyMap[11]);
  var _navigationNavigationHelpers = require(_dependencyMap[12]);
  var _networkUseNetInfo = require(_dependencyMap[13]);
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[14]);
  var _store = require(_dependencyMap[15]);
  var _themeThemeContext = require(_dependencyMap[16]);
  var _themeTokensSizing = require(_dependencyMap[17]);
  var _reactJsxRuntime = require(_dependencyMap[18]);
  function useFilteredHistory(items, filter) {
    return (0, _react.useMemo)(() => {
      return items.filter(entry => {
        if (filter === 'completed') {
          return entry.status === 'COMPLETED';
        }
        if (filter === 'unfinished') {
          return entry.status !== 'COMPLETED';
        }
        return true;
      });
    }, [filter, items]);
  }
  function SessionHistoryScreen() {
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      isOffline
    } = (0, _networkUseNetInfo.useNetInfo)();
    const {
      user
    } = (0, _store.useAuthStore)();
    const userId = user?.id ?? null;
    const [filter, setFilter] = (0, _react.useState)('all');
    const history = (0, _featuresSessionHistoryHooks.useSessionHistoryRecords)(userId);
    const filteredHistory = useFilteredHistory(history.data.items, filter);
    const handleItemPress = (0, _react.useCallback)(entry => {
      if (entry.summary) {
        (0, _navigationNavigationHelpers.navigateToSessionStackScreen)(navigation, 'SessionComplete', {
          sessionId: entry.sessionId,
          summary: entry.summary
        });
      }
    }, [navigation]);
    const renderItem = (0, _react.useCallback)(({
      item,
      index
    }) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionHistoryComponentsHistoryItem.HistoryItem, {
      entry: item,
      index: index,
      onPress: handleItemPress
    }), [handleItemPress]);
    if (!userId) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsStatesErrorState.ErrorState, {
        title: "Your focus record is locked",
        description: "Sign in again and VEX will load the sessions tied to your account."
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesFeatureScreen.FeatureScreen, {
      title: "Session History",
      showBackButton: true,
      children: [isOffline && /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        bg: "warning.DEFAULT",
        p: "sm",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.inverse",
          textAlign: "center",
          children: "Offline. VEX will refresh your focus record when the connection returns."
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        p: "lg",
        pb: "sm",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionHistoryComponentsHistoryFilterTabs.HistoryFilterTabs, {
          filter: filter,
          onChange: setFilter
        })
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        p: "lg",
        pt: "sm",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionHistoryComponentsHistoryStats.HistoryStats, {
          stats: history.data.stats
        })
      }), history.isPending ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionHistoryComponentsHistoryStates.HistorySkeleton, {}) : null, history.isError ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsStatesErrorState.ErrorState, {
        title: "VEX could not load your record yet",
        description: "Your sessions are still yours. Retry in a moment and VEX will pull the latest history.",
        retryLabel: "Retry History",
        onRetry: history.refetch
      }) : null, !history.isPending && !history.isError && filteredHistory.length === 0 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_featuresSessionHistoryComponentsHistoryStates.HistoryEmptyState, {
        onStart: () => navigation.navigate({
          name: 'SessionSetup',
          params: {}
        })
      }) : null, !history.isPending && !history.isError && filteredHistory.length > 0 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        flex: 1,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_shopifyFlashList.FlashList, {
          contentContainerStyle: {
            padding: theme.spacing[4]
          },
          data: filteredHistory,
          estimatedItemSize: _themeTokensSizing.sizing.height['2xl'] + theme.spacing[6],
          keyExtractor: item => item.sessionId,
          renderItem: renderItem,
          showsVerticalScrollIndicator: false
        })
      }) : null]
    });
  }
  const SessionHistoryScreenWithBoundary = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(SessionHistoryScreen, 'SessionHistory');
},3534,[12,2702,1359,1462,3056,1489,2813,3535,3536,3537,3538,3539,2052,2173,2166,1705,1463,2697,203]);
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
  exports.HistoryFilterTabs = HistoryFilterTabs;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesButton = require(_dependencyMap[2]);
  var _themeTokensSpacing = require(_dependencyMap[3]);
  var _reactJsxRuntime = require(_dependencyMap[4]);
  const FILTERS = ['all', 'completed', 'unfinished'];
  function HistoryFilterTabs({
    filter,
    onChange
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      style: {
        flexDirection: 'row',
        gap: _themeTokensSpacing.spacing[2]
      },
      children: FILTERS.map(item => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
        accessibilityHint: `Shows ${item} session records`,
        accessibilityLabel: `Show ${item} sessions`,
        accessibilityRole: "button",
        onPress: () => onChange(item),
        size: "sm",
        variant: filter === item ? 'primary' : 'ghost',
        children: item
      }, item))
    });
  }
},3535,[12,80,1680,1470,203]);
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
  exports.HistoryItem = HistoryItem;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesBox = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _themeTokensOpacity = require(_dependencyMap[5]);
  var _themeTokensSpacing = require(_dependencyMap[6]);
  var _themeTokensSizing = require(_dependencyMap[7]);
  var _utilsTouchTarget = require(_dependencyMap[8]);
  var _utilsFormatDuration = require(_dependencyMap[9]);
  var _reactJsxRuntime = require(_dependencyMap[10]);
  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  function HistoryItem({
    entry,
    index,
    onPress
  }) {
    const isDisabled = entry.summary === null;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: isDisabled ? undefined : _reactNativeReanimated.FadeInUp.delay(index * _themeTokensSpacing.spacing[2]),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
        accessibilityHint: isDisabled ? 'Completion story is not available for this synced record' : 'Opens the saved completion story for this session',
        accessibilityLabel: `Open ${entry.title} from ${formatDate(entry.startedAtMs)}`,
        accessibilityRole: "button",
        accessibilityState: {
          disabled: isDisabled
        },
        disabled: isDisabled,
        hitSlop: _utilsTouchTarget.StandardHitSlops.TEXT_BUTTON,
        onPress: () => onPress(entry),
        style: ({
          pressed
        }) => ({
          opacity: pressed || isDisabled ? _themeTokensOpacity.semanticOpacity.disabled : _themeTokensOpacity.semanticOpacity.hover
        }),
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
          alignItems: "center",
          bg: "background.secondary",
          borderRadius: "lg",
          flexDirection: "row",
          mb: "sm",
          p: "md",
          style: (0, _utilsTouchTarget.getMinTouchTargetStyle)(),
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
            alignItems: "center",
            bg: "background.primary",
            borderRadius: "full",
            height: _themeTokensSizing.sizing.avatar.lg,
            justifyContent: "center",
            mr: "md",
            width: _themeTokensSizing.sizing.avatar.lg,
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "h4",
              color: "primary.500",
              children: entry.grade
            })
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            flex: 1,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              fontWeight: "600",
              color: "text.primary",
              children: entry.title
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.secondary",
              children: formatDate(entry.startedAtMs)
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
            alignItems: "flex-end",
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              fontWeight: "600",
              color: "text.primary",
              children: (0, _utilsFormatDuration.formatDuration)(entry.effectiveDurationSeconds)
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.secondary",
              children: [entry.finalScore, " pts"]
            })]
          })]
        })
      })
    });
  }
},3536,[12,1286,226,1462,1489,1475,1470,2697,2157,2633,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.HistoryStats = HistoryStats;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _reactJsxRuntime = require(_dependencyMap[3]);
  function HistoryStats({
    stats
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flexDirection: "row",
      bg: "background.secondary",
      borderRadius: "lg",
      p: "md",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flex: 1,
        alignItems: "center",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: "primary.500",
          children: stats.completedSessions
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.secondary",
          children: "Completed"
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flex: 1,
        alignItems: "center",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: "warning.DEFAULT",
          children: Math.floor(stats.totalFocusSeconds / 3600)
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.secondary",
          children: "Hours"
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
        flex: 1,
        alignItems: "center",
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: "success.DEFAULT",
          children: stats.averageScore ?? 'Not yet'
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: "text.secondary",
          children: "Avg Score"
        })]
      })]
    });
  }
},3537,[12,1462,1489,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.HistorySkeleton = HistorySkeleton;
  exports.HistoryEmptyState = HistoryEmptyState;
  require(_dependencyMap[0]);
  var _componentsPrimitivesBox = require(_dependencyMap[1]);
  var _componentsPrimitivesButton = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _themeTokensSizing = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function HistorySkeleton() {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      p: "lg",
      children: [0, 1, 2].map(key => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        bg: "background.secondary",
        borderRadius: "lg",
        height: _themeTokensSizing.sizing.height['2xl'],
        mb: "sm"
      }, key))
    });
  }
  function HistoryEmptyState({
    onStart
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      p: "xl",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "h3",
        color: "text.primary",
        textAlign: "center",
        mb: "md",
        children: "Your record starts with one real session."
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "body",
        color: "text.secondary",
        textAlign: "center",
        mb: "lg",
        children: "Finish a focus block and VEX will track the rhythm you actually built."
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
        accessibilityHint: "Starts setup for a new focus session",
        accessibilityLabel: "Start a focus session",
        accessibilityRole: "button",
        onPress: onStart,
        variant: "primary",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          children: "Start Focus"
        })
      })]
    });
  }
},3538,[12,1462,1680,1489,2697,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useSessionHistoryRecords = useSessionHistoryRecords;
  var _tanstackReactQuery = require(_dependencyMap[0]);
  var _service = require(_dependencyMap[1]);
  const EMPTY_HISTORY = {
    items: [],
    stats: {
      totalSessions: 0,
      completedSessions: 0,
      totalFocusSeconds: 0,
      averageScore: null
    }
  };
  function useSessionHistoryRecords(userId, limit = 50) {
    const {
      refetch,
      data,
      isPending,
      isError,
      error
    } = (0, _tanstackReactQuery.useQuery)({
      queryKey: ['session-history', userId, limit],
      enabled: Boolean(userId),
      queryFn: async () => {
        if (!userId) {
          return EMPTY_HISTORY;
        }
        return (0, _service.getSessionHistoryViewModel)(userId, limit);
      }
    });
    const retryHistory = refetch;
    return {
      data: data ?? EMPTY_HISTORY,
      isPending: isPending,
      isError: isError,
      error: error instanceof Error ? error : null,
      refetch: () => {
        retryHistory();
      }
    };
  }
},3539,[771,3540]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.mapSessionRowToHistoryItem = mapSessionRowToHistoryItem;
  exports.buildSessionHistoryViewModel = buildSessionHistoryViewModel;
  exports.getSessionHistoryViewModel = getSessionHistoryViewModel;
  var _sessionModes = require(_dependencyMap[0]);
  var _sessionTypesEnums = require(_dependencyMap[1]);
  var _repository = require(_dependencyMap[2]);
  var _schemas = require(_dependencyMap[3]);
  function parseTimestamp(value, fallback) {
    const parsed = Date.parse(value ?? fallback);
    return Number.isNaN(parsed) ? Date.parse(fallback) : parsed;
  }
  function normalizeStatus(status) {
    const parsed = _sessionTypesEnums.SessionStatusSchema.safeParse(status.toUpperCase());
    return parsed.success ? parsed.data : 'DEGRADED';
  }
  function titleForMode(mode) {
    switch (mode) {
      case _sessionModes.SessionMode.DEEP_WORK:
        return 'Deep work';
      case _sessionModes.SessionMode.STUDY:
        return 'Study focus';
      case _sessionModes.SessionMode.CREATIVE:
        return 'Creative focus';
      case _sessionModes.SessionMode.SPRINT:
        return 'Sprint focus';
      case _sessionModes.SessionMode.RECOVERY:
        return 'Recovery focus';
      case _sessionModes.SessionMode.STARTER:
        return 'Starter focus';
      default:
        return 'Focus session';
    }
  }
  function scoreFromQuality(qualityScore) {
    if (qualityScore === null) {
      return 0;
    }
    return qualityScore <= 100 ? Math.round(qualityScore * 10) : qualityScore;
  }
  function gradeFromScore(score) {
    if (score >= 900) {
      return 'S';
    }
    if (score >= 800) {
      return 'A';
    }
    if (score >= 700) {
      return 'B';
    }
    if (score >= 600) {
      return 'C';
    }
    if (score >= 500) {
      return 'D';
    }
    return 'F';
  }
  function mapSessionRowToHistoryItem(row) {
    const metadata = _schemas.SessionHistoryMetadataSchema.parse(row.metadata ?? {});
    const mode = metadata.summary?.sessionMode ?? (0, _sessionModes.resolveSessionMode)(row.mode);
    const summary = metadata.summary ?? null;
    const finalScore = summary?.finalScore ?? scoreFromQuality(row.quality_score);
    return {
      sessionId: row.id,
      userId: row.user_id,
      title: metadata.name ?? titleForMode(mode),
      status: normalizeStatus(row.status),
      mode,
      startedAtMs: parseTimestamp(row.started_at, row.created_at),
      completedAtMs: row.completed_at ? parseTimestamp(row.completed_at, row.created_at) : null,
      plannedDurationSeconds: row.duration,
      effectiveDurationSeconds: summary?.effectiveDuration ?? row.effective_duration ?? row.duration,
      finalScore,
      grade: gradeFromScore(finalScore),
      streakMaintained: summary?.streakMaintained ?? metadata.streakMaintained ?? false,
      summary
    };
  }
  function buildStats(items) {
    const completed = items.filter(item => item.status === 'COMPLETED');
    const totalScore = items.reduce((sum, item) => sum + item.finalScore, 0);
    return {
      totalSessions: items.length,
      completedSessions: completed.length,
      totalFocusSeconds: items.reduce((sum, item) => sum + item.effectiveDurationSeconds, 0),
      averageScore: items.length > 0 ? Math.round(totalScore / items.length) : null
    };
  }
  function buildSessionHistoryViewModel(rows) {
    const items = rows.map(mapSessionRowToHistoryItem);
    return _schemas.SessionHistoryViewModelSchema.parse({
      items,
      stats: buildStats(items)
    });
  }
  async function getSessionHistoryViewModel(userId, limit = 50) {
    const rows = await (0, _repository.fetchSessionHistoryRows)(userId, limit);
    return buildSessionHistoryViewModel(rows);
  }
},3540,[1829,1855,3319,3320]);
//# sourceMappingURL=/_expo/static/js/web/SessionNavigator-556839dffa1b65624068b4e44314000e.js.map
//# debugId=dbdd1c7c-22ae-46d7-8ad4-3c402e161d47