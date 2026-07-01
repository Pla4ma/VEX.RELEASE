__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "companionStateSchema", {
    enumerable: true,
    get: function () {
      return _companionSchemas.companionStateSchema;
    }
  });
  Object.defineProperty(exports, "companionGrowthSchema", {
    enumerable: true,
    get: function () {
      return _companionSchemas.companionGrowthSchema;
    }
  });
  Object.defineProperty(exports, "createDefaultCompanion", {
    enumerable: true,
    get: function () {
      return _companionSchemas.createDefaultCompanion;
    }
  });
  exports.loadCompanionState = loadCompanionState;
  exports.saveCompanionState = saveCompanionState;
  exports.saveCompanionGrowth = saveCompanionGrowth;
  exports.loadCompanionGrowth = loadCompanionGrowth;
  exports.getMoodForSessionSummary = getMoodForSessionSummary;
  exports.getEvolutionProgress = getEvolutionProgress;
  exports.loadRecentSessionMoods = loadRecentSessionMoods;
  var _utilsSilentFailure = require(_dependencyMap[0]);
  var _persistenceMMKVStorageAdapter = require(_dependencyMap[1]);
  var _persistenceSafeJson = require(_dependencyMap[2]);
  var _types = require(_dependencyMap[3]);
  var _companionSchemas = require(_dependencyMap[4]);
  const storage = (0, _persistenceMMKVStorageAdapter.getDefaultStorageAdapter)();
  function stateKey(userId) {
    return `companion_state_${userId}`;
  }
  function growthKey(userId, sessionId) {
    return `companion_growth_${userId}_${sessionId}`;
  }
  async function loadCompanionState(userId) {
    const key = stateKey(userId);
    const raw = await storage.getItem(key);
    if (!raw) {
      return (0, _companionSchemas.createDefaultCompanion)(userId);
    }
    return (0, _persistenceSafeJson.parseJsonWithSchema)(raw, _companionSchemas.companionStateSchema, {
      feature: 'companion',
      key
    }) ?? (0, _companionSchemas.createDefaultCompanion)(userId);
  }
  async function saveCompanionState(state) {
    const next = Object.assign({}, state, {
      updatedAt: Date.now()
    });
    const key = stateKey(state.userId);
    const encoded = (0, _persistenceSafeJson.stringifyJsonSafe)(next, {
      feature: 'companion',
      key
    });
    if (encoded) {
      await storage.setItem(key, encoded);
    }
    return next;
  }
  async function saveCompanionGrowth(userId, growth) {
    const key = growthKey(userId, growth.sessionId);
    const encoded = (0, _persistenceSafeJson.stringifyJsonSafe)(growth, {
      feature: 'companion',
      key
    });
    if (encoded) {
      await storage.setItem(key, encoded);
    }
  }
  async function loadCompanionGrowth(userId, sessionId) {
    const key = growthKey(userId, sessionId);
    const raw = await storage.getItem(key);
    if (!raw) {
      return null;
    }
    return (0, _persistenceSafeJson.parseJsonWithSchema)(raw, _companionSchemas.companionGrowthSchema, {
      feature: 'companion',
      key
    });
  }
  function getMoodForSessionSummary(summary) {
    const purity = summary.focusPurityScore ?? summary.focusQuality ?? 0;
    const finalScore = summary.finalScore ?? 0;
    if (finalScore && finalScore >= 95 || purity && purity >= 95) {
      return 'ECSTATIC';
    }
    if (finalScore && finalScore >= 70 || purity && purity >= 70) {
      return 'CONTENT';
    }
    return 'SLEEPY';
  }
  function getEvolutionProgress(state) {
    const threshold = _types.EVOLUTION_THRESHOLDS[state.phase];
    if (!Number.isFinite(threshold) || threshold <= 0) {
      return 1;
    }
    return Math.max(0, Math.min(1, state.totalFocusMinutes / threshold));
  }

  /**
   * Load recent session moods for companion history display
   * PHASE 13.1 - Returns last N session moods for history dots
   */
  async function loadRecentSessionMoods(userId, limit = 5) {
    // Search for all companion growth keys for this user
    const allKeys = await storage.getAllKeys();
    const growthKeys = allKeys.filter(k => k.startsWith(`companion_growth_${userId}_`));

    // Load all growth records
    const growthRecords = await Promise.all(growthKeys.map(async key => {
      const raw = await storage.getItem(key);
      if (!raw) {
        return null;
      }
      try {
        const decoded = JSON.parse(raw);
        const parsed = _companionSchemas.companionGrowthSchema.safeParse(decoded);
        if (parsed.success) {
          return {
            mood: parsed.data.mood,
            timestamp: parsed.data.updatedAt,
            sessionId: parsed.data.sessionId
          };
        }
        return null;
      } catch (error) {
        (0, _utilsSilentFailure.captureSilentFailure)(error, {
          feature: 'companion',
          operation: 'safe-fallback',
          type: 'data'
        });
        return null;
      }
    }));

    // Filter valid records, sort by timestamp desc, take limit
    return growthRecords.filter(r => r !== null).sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }
},3541,[1477,1717,1718,3542,3736]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "EVOLUTION_THRESHOLDS", {
    enumerable: true,
    get: function () {
      return EVOLUTION_THRESHOLDS;
    }
  });
  Object.defineProperty(exports, "MOOD_RULES", {
    enumerable: true,
    get: function () {
      return MOOD_RULES;
    }
  });
  Object.defineProperty(exports, "ELEMENT_THEMES", {
    enumerable: true,
    get: function () {
      return ELEMENT_THEMES;
    }
  });
  var _themeTokensColors = require(_dependencyMap[0]);
  var _themeTokensDecorative = require(_dependencyMap[1]);
  /**
   * Living Companion System - Core Types
   *
   * The companion is a living entity that evolves in real-time during focus sessions.
   * It provides immediate visual feedback and emotional connection during the core loop.
   *
   * Colors below are documented game-mechanic color data — not UI styling.
   * These map to theme tokens where possible: theme.colors.accent.*, theme.colors.semantic.*
   */

  // Evolution requirements
  const EVOLUTION_THRESHOLDS = {
    EGG: 0,
    HATCHING: 60,
    // 1 hour to hatch
    YOUNG: 300,
    // 5 hours to mature
    MATURE: 1000,
    // 16 hours to awaken
    AWAKENED: 5000,
    // 83 hours to transcend
    TRANSCENDENT: Infinity
  };

  // Mood transitions based on session state
  const MOOD_RULES = {
    SLEEPY: {
      minProgress: 0,
      maxProgress: 10,
      minEnergy: 0
    },
    CONTENT: {
      minProgress: 10,
      maxProgress: 30,
      minEnergy: 30
    },
    FOCUSED: {
      minProgress: 30,
      maxProgress: 70,
      minEnergy: 50,
      minPurity: 70
    },
    DETERMINED: {
      minProgress: 70,
      maxProgress: 95,
      minEnergy: 60
    },
    ECSTATIC: {
      minProgress: 95,
      minEnergy: 80,
      minPurity: 90
    },
    STRUGGLING: {
      maxEnergy: 30
    },
    DANGER: {
      maxPurity: 30,
      maxEnergy: 20
    }
  };

  // Element visual themes
  const ELEMENT_THEMES = {
    FLAME: {
      primary: _themeTokensColors.lightColors.semantic.warning,
      secondary: _themeTokensColors.lightColors.semantic.warning,
      glow: _themeTokensColors.lightColors.semantic.danger,
      particle: _themeTokensColors.lightColors.semantic.vexGold,
      ambience: 'warm'
    },
    WAVE: {
      primary: _themeTokensColors.lightColors.accent.teal,
      secondary: _themeTokensColors.lightColors.accent.teal,
      glow: _themeTokensDecorative.companionDecorative.waveGlow,
      particle: _themeTokensDecorative.companionDecorative.waveParticle,
      ambience: 'cool'
    },
    TERRA: {
      primary: _themeTokensColors.lightColors.text.muted,
      secondary: _themeTokensColors.lightColors.semantic.success,
      glow: _themeTokensColors.lightColors.semantic.success,
      particle: _themeTokensDecorative.companionDecorative.terraParticle,
      ambience: 'earthy'
    },
    ZEPHYR: {
      primary: _themeTokensColors.lightColors.border.light,
      secondary: _themeTokensDecorative.companionDecorative.zephyrSecondary,
      glow: _themeTokensColors.lightColors.text.inverse,
      particle: _themeTokensColors.lightColors.info[50],
      ambience: 'ethereal'
    },
    VOID: {
      primary: _themeTokensColors.lightColors.accent.purple,
      secondary: _themeTokensColors.lightColors.accent.purple,
      glow: _themeTokensColors.lightColors.accent.purple,
      particle: _themeTokensColors.lightColors.primary[50],
      ambience: 'mysterious'
    },
    LUMINA: {
      primary: _themeTokensColors.lightColors.semantic.vexGold,
      secondary: _themeTokensColors.lightColors.semantic.warning,
      glow: _themeTokensColors.lightColors.warning[50],
      particle: _themeTokensColors.lightColors.text.inverse,
      ambience: 'divine'
    }
  };
},3542,[1465,2700]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "premiumCardShadow", {
    enumerable: true,
    get: function () {
      return premiumCardShadow;
    }
  });
  exports.getPremiumCardStyle = getPremiumCardStyle;
  exports.withAlpha = withAlpha;
  var _themeTokensColors = require(_dependencyMap[0]);
  const PREMIUM_RADII = {
    small: 16,
    medium: 20,
    large: 24,
    hero: 32
  };
  const premiumCardShadow = {
    shadowColor: _themeTokensColors.lightColors.text.primary,
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6
  };
  function getPremiumCardStyle(size) {
    return Object.assign({
      borderRadius: PREMIUM_RADII[size]
    }, premiumCardShadow);
  }
  function withAlpha(hexColor, alpha) {
    if (!hexColor.startsWith('#') || hexColor.length !== 7) {
      return hexColor;
    }
    const red = Number.parseInt(hexColor.slice(1, 3), 16);
    const green = Number.parseInt(hexColor.slice(3, 5), 16);
    const blue = Number.parseInt(hexColor.slice(5, 7), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }
},3543,[1465]);
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
  exports.MasteryRankBadge = MasteryRankBadge;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesBox = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _themeTokensColors = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  const rankConfig = {
    APPRENTICE: {
      icon: '',
      color: _themeTokensColors.lightColors.text.muted,
      label: 'Apprentice'
    },
    ADEPT: {
      icon: '',
      color: _themeTokensColors.lightColors.accent.blue,
      label: 'Adept'
    },
    EXPERT: {
      icon: '',
      color: _themeTokensColors.lightColors.accent.purple,
      label: 'Expert'
    },
    MASTER: {
      icon: '',
      color: _themeTokensColors.lightColors.semantic.primary,
      label: 'Master'
    },
    GRANDMASTER: {
      icon: '',
      color: _themeTokensColors.lightColors.semantic.warning,
      label: 'Grandmaster'
    }
  };
  function MasteryRankBadge({
    rank,
    totalPoints,
    size = 'md'
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const config = rankConfig[rank];
    const sizeMap = {
      sm: {
        icon: 14,
        title: 'caption',
        points: 'caption',
        px: theme.spacing[2],
        py: theme.spacing[1],
        radius: 999
      },
      md: {
        icon: 18,
        title: 'body',
        points: 'bodySmall',
        px: theme.spacing[3],
        py: theme.spacing[3],
        radius: 18
      },
      lg: {
        icon: 28,
        title: 'h3',
        points: 'body',
        px: theme.spacing[5],
        py: theme.spacing[4],
        radius: 24
      }
    };
    const current = sizeMap[size];
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
      flexDirection: "row",
      alignItems: "center",
      gap: size === 'sm' ? 6 : 10,
      px: current.px,
      py: current.py,
      borderRadius: current.radius,
      style: {
        backgroundColor: theme.colors.background.secondary,
        borderWidth: size === 'lg' ? 2 : 1,
        borderColor: `${config.color}${size === 'lg' ? 'AA' : '55'}`,
        boxShadow: `0px 0px 0px ${size === 'lg' ? config.color : undefined}`
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        fontSize: current.icon,
        children: config.icon
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          flex: size === 'sm' ? 0 : 1
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: current.title,
          color: theme.colors.text.primary,
          fontWeight: "700",
          children: config.label
        }), size !== 'sm' ? /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: current.points,
          color: config.color,
          children: [totalPoints, " points"]
        }) : null]
      }), size === 'sm' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "caption",
        color: config.color,
        children: totalPoints
      }) : null]
    });
  }
},3544,[12,80,1462,1489,1463,1465,203]);
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
  exports.TechniqueBar = TechniqueBar;
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  const _worklet_7497420303093_init_data = {
    code: "function TechniqueBarTsx1(){const{trackWidth,progress}=this.__closure;return{width:trackWidth*progress.value};}"
  };
  function TechniqueBar({
    label,
    value,
    max = 25,
    color
  }) {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const [trackWidth, setTrackWidth] = (0, _react.useState)(0);
    const progress = (0, _reactNativeReanimated.useSharedValue)(0);
    (0, _react.useEffect)(() => {
      progress.value = (0, _reactNativeReanimated.withTiming)(Math.max(0, Math.min(1, value / max)), {
        duration: 700
      });
    }, [max, progress, value]);
    const fillStyle = (0, _reactNativeReanimated.useAnimatedStyle)(function TechniqueBarTsx1Factory({
      _worklet_7497420303093_init_data,
      trackWidth,
      progress
    }) {
      const TechniqueBarTsx1 = () => ({
        width: trackWidth * progress.value
      });
      TechniqueBarTsx1.__closure = {
        trackWidth,
        progress
      };
      TechniqueBarTsx1.__workletHash = 7497420303093;
      TechniqueBarTsx1.__initData = _worklet_7497420303093_init_data;
      return TechniqueBarTsx1;
    }({
      _worklet_7497420303093_init_data,
      trackWidth,
      progress
    }));
    const onLayout = event => setTrackWidth(event.nativeEvent.layout.width);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: {
        gap: theme.spacing[2]
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "bodySmall",
          color: theme.colors.text.secondary,
          children: label
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "caption",
          color: theme.colors.text.primary,
          children: [value, "/", max]
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        onLayout: onLayout,
        style: {
          height: 6,
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: theme.colors.background.tertiary
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
          style: [{
            height: 6,
            borderRadius: 3,
            backgroundColor: color
          }, fillStyle]
        })
      })]
    });
  }
},3545,[12,80,226,1489,1463,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "companionStateSchema", {
    enumerable: true,
    get: function () {
      return companionStateSchema;
    }
  });
  Object.defineProperty(exports, "companionGrowthSchema", {
    enumerable: true,
    get: function () {
      return companionGrowthSchema;
    }
  });
  exports.createDefaultCompanion = createDefaultCompanion;
  var _zod = require(_dependencyMap[0]);
  var _types = require(_dependencyMap[1]);
  const companionStateSchema = _zod.z.object({
    id: _zod.z.string(),
    userId: _zod.z.string(),
    phase: _zod.z.enum(['EGG', 'HATCHING', 'YOUNG', 'MATURE', 'AWAKENED', 'TRANSCENDENT']),
    level: _zod.z.number(),
    totalFocusMinutes: _zod.z.number(),
    element: _zod.z.enum(['FLAME', 'WAVE', 'TERRA', 'ZEPHYR', 'VOID', 'LUMINA']),
    elementAffinity: _zod.z.number(),
    currentMood: _zod.z.enum(['SLEEPY', 'CONTENT', 'FOCUSED', 'DETERMINED', 'ECSTATIC', 'STRUGGLING', 'DANGER']),
    sessionProgress: _zod.z.number(),
    purityScore: _zod.z.number(),
    energyLevel: _zod.z.number(),
    visualSeed: _zod.z.number(),
    colorHue: _zod.z.number(),
    particleDensity: _zod.z.number(),
    sessionCount: _zod.z.number(),
    perfectSessions: _zod.z.number(),
    longestFocusStreak: _zod.z.number(),
    nextEvolutionAt: _zod.z.number(),
    updatedAt: _zod.z.number()
  }).strict();
  const companionGrowthSchema = _zod.z.object({
    sessionId: _zod.z.string(),
    mood: _zod.z.enum(['SLEEPY', 'CONTENT', 'FOCUSED', 'DETERMINED', 'ECSTATIC', 'STRUGGLING', 'DANGER']),
    level: _zod.z.number(),
    phase: _zod.z.enum(['EGG', 'HATCHING', 'YOUNG', 'MATURE', 'AWAKENED', 'TRANSCENDENT']),
    progressToEvolution: _zod.z.number().min(0).max(1),
    totalFocusMinutes: _zod.z.number(),
    leveledUp: _zod.z.boolean(),
    evolved: _zod.z.boolean(),
    updatedAt: _zod.z.number()
  }).strict();
  function createDefaultCompanion(userId, options) {
    const element = options?.element ?? 'FLAME';
    const hueMap = {
      FLAME: 15,
      WAVE: 170,
      TERRA: 100,
      ZEPHYR: 200,
      VOID: 270,
      LUMINA: 45
    };
    return {
      id: `companion_${userId}`,
      userId,
      phase: 'EGG',
      level: 1,
      totalFocusMinutes: 0,
      element,
      elementAffinity: 75,
      currentMood: 'SLEEPY',
      sessionProgress: 0,
      purityScore: 85,
      energyLevel: 50,
      visualSeed: 42,
      colorHue: hueMap[element],
      particleDensity: 0.8,
      sessionCount: 0,
      perfectSessions: 0,
      longestFocusStreak: 0,
      nextEvolutionAt: _types.EVOLUTION_THRESHOLDS.EGG,
      updatedAt: Date.now()
    };
  }
},3736,[1774,3542]);