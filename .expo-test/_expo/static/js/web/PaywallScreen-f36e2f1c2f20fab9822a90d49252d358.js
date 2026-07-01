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
  Object.defineProperty(exports, "PaywallScreen", {
    enumerable: true,
    get: function () {
      return PaywallScreen;
    }
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return PaywallScreen;
    }
  });
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[1]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _reactNativeSafeAreaContext = require(_dependencyMap[2]);
  var _sharedUiComponentsEnterAnimation = require(_dependencyMap[3]);
  var _themeThemeContext = require(_dependencyMap[4]);
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[5]);
  var _usePaywallScreen = require(_dependencyMap[6]);
  var _PaywallHero = require(_dependencyMap[7]);
  var _PaywallPlans = require(_dependencyMap[8]);
  var _PaywallStates = require(_dependencyMap[9]);
  var _paywallStyles = require(_dependencyMap[10]);
  var _sharedUiLiquidGlassLiquidGlassScreen = require(_dependencyMap[11]);
  var _reactJsxRuntime = require(_dependencyMap[12]);
  const PaywallScreen = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(function PaywallScreen() {
    const insets = (0, _reactNativeSafeAreaContext.useSafeAreaInsets)();
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      isPremium,
      isLoading,
      error,
      hasLivePackages,
      statusMessage,
      contextBody,
      contextHeadline,
      lane,
      featureHighlight,
      packageSelection,
      setStatusMessage,
      handleClose,
      handlePurchase,
      handleRestore,
      retry
    } = (0, _usePaywallScreen.usePaywallScreen)();
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiLiquidGlassLiquidGlassScreen.LiquidGlassScreen, {
      style: _paywallStyles.paywallStyles.screen,
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(ScrollView.default, {
        contentContainerStyle: {
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 32
        },
        showsVerticalScrollIndicator: false,
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_sharedUiComponentsEnterAnimation.StaggeredEnter, {
          direction: "up",
          speed: "normal",
          staggerDelay: 80,
          containerStyle: _paywallStyles.paywallStyles.content,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallHero.PaywallHero, {
            contextBody: contextBody,
            contextHeadline: contextHeadline,
            featureHighlight: featureHighlight,
            isPremium: isPremium,
            lane: lane,
            showBoundary: !isLoading && !error,
            theme: theme,
            onClose: handleClose
          }), statusMessage ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallStates.PaywallStatusMessageBanner, {
            statusMessage: statusMessage,
            onDismiss: () => setStatusMessage(null)
          }) : null, isLoading ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallStates.PaywallLoadingState, {}) : error ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallStates.PaywallErrorState, {
            theme: theme,
            onRestore: handleRestore,
            onRetry: retry
          }) : !hasLivePackages ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallStates.PaywallUnavailableState, {
            onRestore: handleRestore,
            onRetry: retry
          }) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallPlans.PaywallPlanList, {
            plans: packageSelection,
            theme: theme,
            onPurchase: handlePurchase
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallPlans.PaywallFooterActions, {
            hasLivePackages: hasLivePackages,
            isLoading: isLoading,
            isPremium: isPremium,
            plans: packageSelection,
            onPurchase: handlePurchase,
            onRestore: handleRestore
          })]
        })
      })
    });
  }, 'Paywall');
},3326,[12,171,719,2168,1463,2166,3546,3548,3555,3557,3551,3091,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.usePaywallScreen = usePaywallScreen;
  var _react = require(_dependencyMap[0]);
  var _reactNavigationNative = require(_dependencyMap[1]);
  var _sharedAnalyticsAnalyticsService = require(_dependencyMap[2]);
  var _sharedMonetizationUseRevenuecat = require(_dependencyMap[3]);
  var _sharedMonetizationPurchaseEvents = require(_dependencyMap[4]);
  var _paywallCopy = require(_dependencyMap[5]);
  function isPlanSelection(value) {
    return Boolean(value && 'packageInfo' in value);
  }
  function usePaywallScreen() {
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const route = (0, _reactNavigationNative.useRoute)();
    const {
      offerings,
      packages,
      isLoading,
      error,
      purchase,
      restore,
      retry
    } = (0, _sharedMonetizationUseRevenuecat.usePaywall)();
    const {
      isPremium,
      refresh
    } = (0, _sharedMonetizationUseRevenuecat.usePremiumStatus)();
    const [statusMessage, setStatusMessage] = (0, _react.useState)(null);
    const source = route.params?.source ?? 'unknown';
    const gatedFeature = route.params?.gatedFeature ?? 'premium_access';
    const contextBody = route.params?.contextBody;
    const contextCta = route.params?.contextCta;
    const contextHeadline = route.params?.contextHeadline;
    const lane = route.params?.lane;
    const featureHighlight = _paywallCopy.FEATURE_HIGHLIGHT_MAP[gatedFeature];
    const hasLivePackages = packages.length > 0;
    const packageSelection = (0, _react.useMemo)(() => (0, _paywallCopy.buildPackageSelection)(packages), [packages]);
    (0, _react.useEffect)(() => {
      (0, _sharedAnalyticsAnalyticsService.capture)(_sharedMonetizationPurchaseEvents.PurchaseEvents.PAYWALL_VIEWED, (0, _sharedMonetizationPurchaseEvents.createPaywallProperties)(offerings?.identifier ?? 'fallback-offering', source, packages.map(item => ({
        identifier: item.identifier,
        hasTrial: Boolean(item.product.introPrice)
      }))));
    }, [offerings?.identifier, packages, source]);
    const handleClose = () => {
      (0, _sharedAnalyticsAnalyticsService.capture)(_sharedMonetizationPurchaseEvents.PurchaseEvents.PAYWALL_DISMISSED, {
        paywall_source: source,
        gated_feature: gatedFeature
      });
      navigation.goBack();
    };
    const handlePurchase = async planOrPackage => {
      setStatusMessage(null);
      const packageInfo = isPlanSelection(planOrPackage) ? planOrPackage.packageInfo : planOrPackage;
      if (!packageInfo) {
        setStatusMessage({
          tone: 'warning',
          title: 'Plans are still loading',
          body: 'Live purchase options are still being prepared. Give it a moment, then try again.'
        });
        return;
      }
      const result = await purchase(packageInfo);
      if (result.success) {
        await refresh();
        setStatusMessage({
          tone: 'celebration',
          title: 'Premium is active',
          body: 'Your strongest coaching, continuity support, and deeper insights are ready.'
        });
        navigation.goBack();
        return;
      }
      setStatusMessage({
        tone: 'warning',
        title: 'Purchase did not go through',
        body: 'Nothing was charged here in VEX. Please try again, or restore if you already subscribed.'
      });
    };
    const handleRestore = async () => {
      setStatusMessage({
        tone: 'info',
        title: 'Checking your purchases',
        body: 'We are refreshing your entitlements now.'
      });
      const result = await restore();
      await refresh();
      setStatusMessage(result.success ? {
        tone: 'celebration',
        title: 'Purchases restored',
        body: 'Your premium entitlements have been refreshed on this device.'
      } : {
        tone: 'warning',
        title: 'Restore did not complete',
        body: 'If you already subscribed, try again on a stronger connection or sign in with the same store account.'
      });
    };
    return {
      isPremium,
      isLoading,
      error,
      hasLivePackages,
      statusMessage,
      source,
      gatedFeature,
      contextBody,
      contextCta,
      contextHeadline,
      lane,
      featureHighlight,
      packageSelection,
      offerings,
      setStatusMessage,
      handleClose,
      handlePurchase,
      handleRestore,
      retry
    };
  }
},3546,[12,1359,1491,3115,3118,3547]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "VALUE_PROPOSITION", {
    enumerable: true,
    get: function () {
      return VALUE_PROPOSITION;
    }
  });
  Object.defineProperty(exports, "FREE_BOUNDARY_COPY", {
    enumerable: true,
    get: function () {
      return FREE_BOUNDARY_COPY;
    }
  });
  Object.defineProperty(exports, "PREMIUM_BOUNDARY_COPY", {
    enumerable: true,
    get: function () {
      return PREMIUM_BOUNDARY_COPY;
    }
  });
  Object.defineProperty(exports, "PREMIUM_FEATURES", {
    enumerable: true,
    get: function () {
      return PREMIUM_FEATURES;
    }
  });
  Object.defineProperty(exports, "FEATURE_HIGHLIGHT_MAP", {
    enumerable: true,
    get: function () {
      return FEATURE_HIGHLIGHT_MAP;
    }
  });
  exports.buildPackageSelection = buildPackageSelection;
  var _themeTokensColors = require(_dependencyMap[0]);
  const VALUE_PROPOSITION = 'Your VEX. Smarter over time. Deeper where it matters.';
  const FREE_BOUNDARY_COPY = 'Sessions, progress, and Rescue stay free forever. Premium adds personalized intelligence that grows with your rhythm.';
  const PREMIUM_BOUNDARY_COPY = 'Premium unlocks lane-specific intelligence: deeper memory, weekly patterns, smarter planning, and advanced controls. Free sessions always work.';
  const FALLBACK_PRICING = {
    monthly: 'Live pricing unavailable',
    annual: 'Live pricing unavailable'
  };
  const PREMIUM_FEATURES = [{
    iconName: 'check',
    title: 'Deep Coach Memory',
    description: 'VEX remembers patterns, comeback style, best focus windows, and preferred push style'
  }, {
    iconName: 'book-open',
    title: 'Advanced Study / Deep Work OS',
    description: 'Turn sessions into review loops, project breakdowns, quizzes, and smart next actions'
  }, {
    iconName: 'bar-chart-3',
    title: 'Progress Intelligence',
    description: 'See rhythm, focus risk, recovery plans, and consistency forecasts'
  }, {
    iconName: 'brain',
    title: 'Memory Console & Controls',
    description: 'View, edit, and manage memory with source, confidence, and expiry. Control what VEX remembers.'
  }, {
    iconName: 'zap',
    title: 'Advanced Friction Modes',
    description: 'Lane-matched depth: Exam Sprint, Boss Focus, Deep Work, and Quiet Planning per lane'
  }];
  const FEATURE_HIGHLIGHT_MAP = {
    deep_coach_memory: {
      title: 'Deep Coach Memory',
      benefit: 'VEX remembers patterns, comeback style, best focus windows, and preferred push intensity across all sessions.',
      iconName: 'brain',
      gradient: [_themeTokensColors.lightColors.semantic.primary, _themeTokensColors.lightColors.accent.purple]
    },
    progress_intelligence: {
      title: 'Weekly Focus Intelligence',
      benefit: 'See your best rhythm, focus risk, recovery plan, consistency forecast, and calendar-aware planning.',
      iconName: 'bar-chart-3',
      gradient: [_themeTokensColors.lightColors.accent.teal, _themeTokensColors.lightColors.accent.teal]
    },
    advanced_study_os: {
      title: 'Advanced Study & Deep Work',
      benefit: 'Advanced import, review intelligence, deadline risk, weak-topic plan, and smart next actions from your material.',
      iconName: 'book-open',
      gradient: [_themeTokensColors.lightColors.semantic.warning, _themeTokensColors.lightColors.semantic.warning]
    },
    recovery_planning: {
      title: 'Recovery & Continuity',
      benefit: 'Build a recovery plan without shame. Long project memory and context restoration keep flow alive across sessions.',
      iconName: 'shield',
      gradient: [_themeTokensColors.lightColors.semantic.success, _themeTokensColors.lightColors.accent.green]
    },
    premium_session_modes: {
      title: 'Advanced Friction Modes',
      benefit: 'Custom modifiers, personal blocker depth, advanced run recap — no currency, no gimmicks.',
      iconName: 'zap',
      gradient: [_themeTokensColors.lightColors.semantic.primary, _themeTokensColors.lightColors.accent.purple]
    },
    visual_identity: {
      title: 'Memory Console & Identity',
      benefit: 'Editable long memory with source, confidence, and expiry. Shape companion forms and focus worlds.',
      iconName: 'award',
      gradient: [_themeTokensColors.lightColors.accent.teal, _themeTokensColors.lightColors.accent.teal]
    }
  };
  function buildPackageSelection(packages) {
    const annual = packages.find(item => item.packageType.toUpperCase() === 'ANNUAL');
    const monthly = packages.find(item => item.packageType.toUpperCase() === 'MONTHLY');
    return [{
      id: 'annual',
      title: 'Annual',
      subtitle: 'Best value for committed users',
      displayPrice: annual?.product.priceString ?? FALLBACK_PRICING.annual,
      badge: 'Best value',
      packageInfo: annual
    }, {
      id: 'monthly',
      title: 'Monthly',
      subtitle: 'Flexible entry point',
      displayPrice: monthly?.product.priceString ?? FALLBACK_PRICING.monthly,
      badge: 'Most flexible',
      packageInfo: monthly
    }];
  }
},3547,[1465]);
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
  exports.PaywallHero = PaywallHero;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesButton = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _paywallCopy = require(_dependencyMap[4]);
  var _laneHeroCopy = require(_dependencyMap[5]);
  var _PaywallFeatureList = require(_dependencyMap[6]);
  var _paywallStyles = require(_dependencyMap[7]);
  var _PaywallHeroDefaults = require(_dependencyMap[8]);
  var _PaywallHeroFeatureHighlight = require(_dependencyMap[9]);
  var _PaywallHeroLanes = require(_dependencyMap[10]);
  var _reactJsxRuntime = require(_dependencyMap[11]);
  function resolveLane(lane) {
    if (!lane) {
      return null;
    }
    const lower = lane.toLowerCase();
    if (lower.includes('study') || lower.includes('student')) {
      return 'study';
    }
    if (lower.includes('game') || lower.includes('run')) {
      return 'run';
    }
    if (lower.includes('deep') || lower.includes('creative') || lower.includes('project')) {
      return 'project';
    }
    if (lower.includes('minimal') || lower.includes('clean') || lower.includes('normal')) {
      return 'clean';
    }
    return null;
  }
  function PaywallHero({
    contextBody,
    contextHeadline,
    featureHighlight,
    isPremium,
    lane,
    showBoundary,
    theme,
    onClose
  }) {
    const premiumLane = resolveLane(lane);
    const laneCopy = premiumLane ? _laneHeroCopy.LANE_PREMIUM_HERO_COPY[premiumLane] : null;
    const heroHeadline = contextHeadline ?? laneCopy?.headline ?? 'VEX remembers more. Adapts deeper.';
    const heroBody = contextBody ?? laneCopy?.body ?? 'Free sessions, basic progress, and Rescue stay free forever. Premium adds memory, weekly intelligence, and mode-matched depth.';
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _paywallStyles.paywallStyles.headerRow,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: _paywallStyles.paywallStyles.headerCopy,
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            style: [_paywallStyles.paywallStyles.eyebrow, {
              color: theme.colors.primary[500]
            }],
            children: "VEX Premium"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            style: [_paywallStyles.paywallStyles.title, {
              color: theme.colors.text.primary
            }],
            children: isPremium ? 'Premium is active' : _paywallCopy.VALUE_PROPOSITION
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "ghost",
          onPress: onClose,
          accessibilityLabel: "Close paywall",
          accessibilityRole: "button",
          accessibilityHint: "Returns to the previous screen.",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: "Close"
          })
        })]
      }), contextHeadline && contextBody ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallHeroDefaults.DefaultHero, {
        body: contextBody,
        headline: contextHeadline,
        theme: theme
      }) : featureHighlight ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallHeroFeatureHighlight.FeatureHighlightHero, {
        featureHighlight: featureHighlight,
        theme: theme
      }) : premiumLane === 'study' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallHeroLanes.StudyLaneHero, {
        body: heroBody,
        headline: heroHeadline,
        theme: theme
      }) : premiumLane === 'run' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallHeroLanes.RunLaneHero, {
        body: heroBody,
        headline: heroHeadline,
        theme: theme
      }) : premiumLane === 'project' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallHeroDefaults.ProjectLaneHero, {
        body: heroBody,
        headline: heroHeadline,
        theme: theme
      }) : premiumLane === 'clean' ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallHeroDefaults.CleanLaneHero, {
        body: heroBody,
        headline: heroHeadline,
        theme: theme
      }) : /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallHeroDefaults.DefaultHero, {
        body: heroBody,
        headline: heroHeadline,
        theme: theme
      }), !featureHighlight ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallFeatureList.PaywallFeatureList, {
        theme: theme
      }) : null, showBoundary ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallFeatureList.FreeBoundaryCard, {
        theme: theme
      }) : null]
    });
  }
},3548,[12,80,1680,1489,3547,3549,3550,3551,3552,3553,3554,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "LANE_PREMIUM_HERO_COPY", {
    enumerable: true,
    get: function () {
      return LANE_PREMIUM_HERO_COPY;
    }
  });
  exports.mapLaneToPremiumLane = mapLaneToPremiumLane;
  const LANE_PREMIUM_HERO_COPY = {
    study: {
      headline: 'Your Study Intelligence gets deeper',
      body: 'Review plans, weak-topic focus, and smarter next blocks — built from your material.',
      benefits: ['Advanced import and material processing', 'Review intelligence and spaced repetition', 'Weak topic detection and exam prep planning']
    },
    run: {
      headline: 'Your Run Intelligence gets sharper',
      body: 'Personal boss insights, custom modifiers, and weekly run recaps — purely from your data.',
      benefits: ['Personal boss depth and behavior modifiers', 'Weekly run recap with mastery insights', 'No coins, gems, or shop power — pure performance intelligence']
    },
    project: {
      headline: 'Your Project Memory keeps more context',
      body: 'Longer memory, context restoration, and flow windows across project blocks.',
      benefits: ['Long project memory across sessions', 'Context restoration and next-move detection', 'Flow window intelligence for creative continuity']
    },
    clean: {
      headline: 'Your Focus Intelligence works quietly',
      body: 'Weekly patterns, best windows, and smarter planning without adding noise.',
      benefits: ['Weekly focus intelligence reports', 'Calendar-aware planning windows', 'Private memory console controls']
    }
  };
  function mapLaneToPremiumLane(lane) {
    if (lane === 'student') {
      return 'study';
    }
    if (lane === 'game_like') {
      return 'run';
    }
    if (lane === 'deep_creative') {
      return 'project';
    }
    return 'clean';
  }
},3549,[]);
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
  exports.PaywallFeatureList = PaywallFeatureList;
  exports.FreeBoundaryCard = FreeBoundaryCard;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNativeReanimated = require(_dependencyMap[2]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _iconsComponentsIcon = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _sharedUiComponentsEnterAnimation = require(_dependencyMap[5]);
  var _paywallCopy = require(_dependencyMap[6]);
  var _paywallStyles = require(_dependencyMap[7]);
  var _reactJsxRuntime = require(_dependencyMap[8]);
  function PaywallFeatureList({
    theme
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      style: _paywallStyles.paywallStyles.featuresList,
      children: _paywallCopy.PREMIUM_FEATURES.map((feature, index) => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
        entering: _reactNativeReanimated.FadeInDown.duration(350).delay(index * 80),
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: [_paywallStyles.paywallStyles.featureRow, {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.border.DEFAULT,
            borderWidth: 1
          }],
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: [_paywallStyles.paywallStyles.featureIconShell, {
              backgroundColor: theme.colors.background.tertiary
            }],
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
              name: feature.iconName,
              size: 16,
              color: theme.colors.success.DEFAULT
            })
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: _paywallStyles.paywallStyles.featureTextContainer,
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              style: [_paywallStyles.paywallStyles.featureRowTitle, {
                color: theme.colors.text.primary
              }],
              children: feature.title
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              style: [_paywallStyles.paywallStyles.featureRowDescription, {
                color: theme.colors.text.secondary
              }],
              children: feature.description
            })]
          })]
        })
      }, feature.title))
    });
  }
  function FreeBoundaryCard({
    theme
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsEnterAnimation.CardEnterAnimation, {
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: [_paywallStyles.paywallStyles.boundaryCard, {
          backgroundColor: theme.colors.background.tertiary,
          borderColor: theme.colors.border.DEFAULT
        }],
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
          name: "shield",
          size: 20,
          color: theme.colors.text.secondary
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          style: [_paywallStyles.paywallStyles.boundaryText, {
            color: theme.colors.text.secondary
          }],
          children: _paywallCopy.FREE_BOUNDARY_COPY
        })]
      })
    });
  }
},3550,[12,80,226,1691,1489,2168,3547,3551,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "paywallStyles", {
    enumerable: true,
    get: function () {
      return paywallStyles;
    }
  });
  var _sharedUiCreateSheet = require(_dependencyMap[0]);
  const paywallStyles = (0, _sharedUiCreateSheet.createSheet)({
    screen: {
      flex: 1
    },
    content: {
      paddingHorizontal: 20,
      gap: 20
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
      alignItems: 'flex-start'
    },
    headerCopy: {
      flex: 1,
      gap: 6
    },
    eyebrow: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      lineHeight: 38
    },
    featureCard: {
      borderRadius: 24,
      padding: 20,
      gap: 10
    },
    featureIconBadge: {
      alignItems: 'center',
      borderRadius: 18,
      height: 36,
      justifyContent: 'center',
      width: 36
    },
    featureTitle: {
      fontSize: 22,
      fontWeight: '800'
    },
    featureBenefit: {
      fontSize: 15,
      lineHeight: 22
    },
    heroCard: {
      borderRadius: 24,
      padding: 18,
      gap: 12
    },
    heroTitle: {
      fontSize: 24,
      fontWeight: '800'
    },
    heroCopy: {
      fontSize: 15,
      lineHeight: 22
    },
    planList: {
      gap: 12
    },
    planCard: {
      borderRadius: 22,
      padding: 18,
      gap: 10
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16
    },
    planTitle: {
      fontSize: 22,
      fontWeight: '800'
    },
    planSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      marginTop: 2
    },
    planPrice: {
      fontSize: 28,
      fontWeight: '800'
    },
    footerActions: {
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap'
    },
    boundaryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1
    },
    boundaryText: {
      fontSize: 14,
      lineHeight: 20,
      flex: 1
    },
    errorContainer: {
      gap: 16
    },
    supportSection: {
      alignItems: 'center',
      gap: 8
    },
    supportText: {
      fontSize: 13,
      textAlign: 'center'
    },
    badgeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },
    trialBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12
    },
    trialBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase'
    },
    planBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12
    },
    planBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase'
    },
    trialText: {
      fontSize: 13,
      fontWeight: '600',
      marginTop: 4
    },
    featuresList: {
      gap: 10
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 16
    },
    featureIconShell: {
      alignItems: 'center',
      borderRadius: 14,
      height: 28,
      justifyContent: 'center',
      width: 28
    },
    featureTextContainer: {
      flex: 1,
      gap: 2
    },
    featureRowTitle: {
      fontSize: 16,
      fontWeight: '700'
    },
    featureRowDescription: {
      fontSize: 13,
      lineHeight: 18
    },
    skeletonContainer: {
      gap: 20,
      paddingHorizontal: 20
    },
    skeletonHeader: {
      gap: 12,
      marginTop: 20
    },
    skeletonFeatures: {
      gap: 12,
      marginTop: 20
    }
  });
},3551,[1678]);
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
  exports.ProjectLaneHero = ProjectLaneHero;
  exports.CleanLaneHero = CleanLaneHero;
  exports.DefaultHero = DefaultHero;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _expoLinearGradient = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _sharedUiComponentsEnterAnimation = require(_dependencyMap[4]);
  var _paywallStyles = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  function ProjectLaneHero({
    body,
    headline,
    theme
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsEnterAnimation.CardEnterAnimation, {
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: [_paywallStyles.paywallStyles.heroCard, {
          backgroundColor: theme.colors.semantic.obsidian,
          borderRadius: 24
        }],
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flexDirection: 'row',
            gap: 16
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: {
              width: 4,
              borderRadius: 4,
              backgroundColor: theme.colors.accent.premium
            },
            accessibilityElementsHidden: true,
            importantForAccessibility: "no"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: {
              flex: 1,
              gap: 8
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              style: [_paywallStyles.paywallStyles.eyebrow, {
                color: theme.colors.accent.premium
              }],
              children: "Project Lane"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              style: [_paywallStyles.paywallStyles.heroTitle, {
                color: theme.colors.text.inverse
              }],
              children: headline
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
              style: {
                flexDirection: 'row',
                gap: 12,
                marginTop: 4,
                flexWrap: 'wrap'
              },
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
                style: {
                  flex: 1,
                  minWidth: 140,
                  gap: 4
                },
                children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  style: {
                    color: theme.colors.text.inverse,
                    fontSize: 13,
                    fontWeight: '700'
                  },
                  children: "Long memory"
                }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  style: {
                    color: theme.colors.text.inverse,
                    fontSize: 12,
                    opacity: 0.85
                  },
                  children: "Across project sessions"
                })]
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
                style: {
                  flex: 1,
                  minWidth: 140,
                  gap: 4
                },
                children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  style: {
                    color: theme.colors.text.inverse,
                    fontSize: 13,
                    fontWeight: '700'
                  },
                  children: "Flow windows"
                }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                  style: {
                    color: theme.colors.text.inverse,
                    fontSize: 12,
                    opacity: 0.85
                  },
                  children: "For creative continuity"
                })]
              })]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              style: [_paywallStyles.paywallStyles.heroCopy, {
                color: theme.colors.text.inverse,
                marginTop: 4
              }],
              children: body
            })]
          })]
        })
      })
    });
  }
  function CleanLaneHero({
    body,
    headline,
    theme
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsEnterAnimation.CardEnterAnimation, {
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: [_paywallStyles.paywallStyles.heroCard, {
          backgroundColor: theme.colors.semantic.obsidian,
          borderRadius: 24
        }],
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            gap: 12,
            alignItems: 'flex-start'
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: {
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.accent.settled,
              marginBottom: 2
            },
            accessibilityElementsHidden: true,
            importantForAccessibility: "no"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            style: [_paywallStyles.paywallStyles.eyebrow, {
              color: theme.colors.accent.settled
            }],
            children: "Clean Lane"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            style: [_paywallStyles.paywallStyles.heroTitle, {
              color: theme.colors.text.inverse,
              fontSize: 22,
              lineHeight: 30
            }],
            children: headline
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            style: [_paywallStyles.paywallStyles.heroCopy, {
              color: theme.colors.text.inverse,
              opacity: 0.85,
              fontSize: 14
            }],
            children: body
          })]
        })
      })
    });
  }
  function DefaultHero({
    body,
    headline,
    theme
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsEnterAnimation.CardEnterAnimation, {
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_expoLinearGradient.LinearGradient, {
        colors: [theme.colors.semantic.obsidian, theme.colors.accent.editorial],
        style: _paywallStyles.paywallStyles.heroCard,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          style: [_paywallStyles.paywallStyles.heroTitle, {
            color: theme.colors.text.inverse
          }],
          children: headline
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          style: [_paywallStyles.paywallStyles.heroCopy, {
            color: theme.colors.text.inverse
          }],
          children: body
        })]
      })
    });
  }
},3552,[12,80,2144,1489,2168,3551,203]);
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
  exports.FeatureHighlightHero = FeatureHighlightHero;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _expoLinearGradient = require(_dependencyMap[2]);
  var _reactNativeReanimated = require(_dependencyMap[3]);
  var Animated = _interopDefault(_reactNativeReanimated);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _iconsComponentsIcon = require(_dependencyMap[5]);
  var _paywallStyles = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function FeatureHighlightHero({
    featureHighlight,
    theme
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Animated.default.View, {
      entering: _reactNativeReanimated.FadeInDown.duration(320),
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_expoLinearGradient.LinearGradient, {
        colors: [...featureHighlight.gradient],
        style: _paywallStyles.paywallStyles.featureCard,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: [_paywallStyles.paywallStyles.featureIconBadge, {
            backgroundColor: theme.colors.background.primary
          }],
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
            name: featureHighlight.iconName,
            size: 20,
            color: theme.colors.primary[500]
          })
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          style: [_paywallStyles.paywallStyles.featureTitle, {
            color: theme.colors.text.inverse
          }],
          children: featureHighlight.title
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          style: [_paywallStyles.paywallStyles.featureBenefit, {
            color: theme.colors.text.inverse
          }],
          children: featureHighlight.benefit
        })]
      })
    });
  }
},3553,[12,80,2144,226,1489,1691,3551,203]);
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
  exports.HeroShell = HeroShell;
  exports.StudyLaneHero = StudyLaneHero;
  exports.RunLaneHero = RunLaneHero;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesText = require(_dependencyMap[2]);
  var _iconsComponentsIcon = require(_dependencyMap[3]);
  var _sharedUiComponentsEnterAnimation = require(_dependencyMap[4]);
  var _paywallStyles = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  function HeroShell({
    children,
    theme
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsEnterAnimation.CardEnterAnimation, {
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: [_paywallStyles.paywallStyles.heroCard, {
          backgroundColor: theme.colors.semantic.obsidian,
          borderRadius: 24
        }],
        children: children
      })
    });
  }
  function StudyLaneHero({
    body,
    headline,
    theme
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(HeroShell, {
      theme: theme,
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          flexDirection: 'row',
          gap: 16,
          alignItems: 'flex-start'
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flex: 1,
            gap: 6
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            style: [_paywallStyles.paywallStyles.eyebrow, {
              color: theme.colors.accent.editorial
            }],
            children: "Study Lane"
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            style: [_paywallStyles.paywallStyles.heroTitle, {
              color: theme.colors.text.inverse
            }],
            children: headline
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            style: [_paywallStyles.paywallStyles.heroCopy, {
              color: theme.colors.text.inverse
            }],
            children: body
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: {
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: theme.colors.accent.editorial,
            alignItems: 'center',
            justifyContent: 'center'
          },
          accessibilityElementsHidden: true,
          importantForAccessibility: "no",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
            name: "book",
            size: 28,
            color: theme.colors.semantic.obsidian
          })
        })]
      })
    });
  }
  function RunLaneHero({
    body,
    headline,
    theme
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(HeroShell, {
      theme: theme,
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          gap: 10
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_iconsComponentsIcon.Icon, {
            name: "flame",
            size: 20,
            color: theme.colors.accent.rescue
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            style: [_paywallStyles.paywallStyles.eyebrow, {
              color: theme.colors.accent.rescue
            }],
            children: "Run Lane"
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          style: [_paywallStyles.paywallStyles.heroTitle, {
            color: theme.colors.text.inverse,
            fontSize: 28
          }],
          children: headline
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
          style: {
            flexDirection: 'row',
            gap: 8,
            flexWrap: 'wrap',
            marginTop: 4
          },
          children: ['Personal boss depth', 'Weekly recaps', 'No shop power'].map(label => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: {
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.colors.text.inverse
            },
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              style: {
                color: theme.colors.text.inverse,
                fontSize: 12,
                fontWeight: '700'
              },
              children: label
            })
          }, label))
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          style: [_paywallStyles.paywallStyles.heroCopy, {
            color: theme.colors.text.inverse,
            marginTop: 4
          }],
          children: body
        })]
      })
    });
  }
},3554,[12,80,1489,1691,2168,3551,203]);
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
  Object.defineProperty(exports, "PaywallFooterActions", {
    enumerable: true,
    get: function () {
      return _PaywallFooterActions.PaywallFooterActions;
    }
  });
  exports.PaywallPlanList = PaywallPlanList;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _sharedUiComponentsEnterAnimation = require(_dependencyMap[4]);
  var _paywallStyles = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  var _PaywallFooterActions = require(_dependencyMap[7]);
  function PaywallPlanList({
    plans,
    theme,
    onPurchase
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      style: _paywallStyles.paywallStyles.planList,
      children: plans.map(plan => /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsEnterAnimation.CardEnterAnimation, {
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(PaywallPlanCard, {
          plan: plan,
          theme: theme,
          onPurchase: onPurchase
        })
      }, plan.id))
    });
  }
  function PaywallPlanCard({
    plan,
    theme,
    onPurchase
  }) {
    const hasTrial = Boolean(plan.packageInfo?.product.introPrice);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Pressable.default, {
      onPress: () => onPurchase(plan),
      style: [_paywallStyles.paywallStyles.planCard, {
        backgroundColor: theme.colors.background.secondary,
        borderColor: plan.id === 'annual' ? theme.colors.primary[500] : theme.colors.border.DEFAULT,
        borderWidth: plan.id === 'annual' ? 2 : 1
      }],
      accessibilityLabel: `Choose ${plan.title} Premium plan`,
      accessibilityRole: "button",
      accessibilityHint: "Starts the store purchase flow for this plan.",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _paywallStyles.paywallStyles.planHeader,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            style: [_paywallStyles.paywallStyles.planTitle, {
              color: theme.colors.text.primary
            }],
            children: plan.title
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            style: [_paywallStyles.paywallStyles.planSubtitle, {
              color: theme.colors.text.secondary
            }],
            children: plan.subtitle
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: _paywallStyles.paywallStyles.badgeContainer,
          children: [hasTrial ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(TrialBadge, {
            theme: theme
          }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
            style: [_paywallStyles.paywallStyles.planBadge, {
              backgroundColor: plan.id === 'annual' ? theme.colors.primary[500] : theme.colors.background.tertiary
            }],
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              style: [_paywallStyles.paywallStyles.planBadgeText, {
                color: plan.id === 'annual' ? theme.colors.text.inverse : theme.colors.text.secondary
              }],
              children: plan.badge
            })
          })]
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        style: [_paywallStyles.paywallStyles.planPrice, {
          color: theme.colors.text.primary
        }],
        children: plan.displayPrice
      }), hasTrial && plan.packageInfo?.product.introPrice ? /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
        style: [_paywallStyles.paywallStyles.trialText, {
          color: theme.colors.success[500]
        }],
        children: [plan.packageInfo.product.introPrice.periodNumberOfUnits, ' ', plan.packageInfo.product.introPrice.periodUnit?.toLowerCase(), " free, then ", plan.displayPrice.toLowerCase()]
      }) : null]
    });
  }
  function TrialBadge({
    theme
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      style: [_paywallStyles.paywallStyles.trialBadge, {
        backgroundColor: theme.colors.success[500]
      }],
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        style: [_paywallStyles.paywallStyles.trialBadgeText, {
          color: theme.colors.text.inverse
        }],
        children: "Free trial"
      })
    });
  }
},3555,[12,1286,80,1489,2168,3551,203,3556]);
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
  exports.PaywallFooterActions = PaywallFooterActions;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesButton = require(_dependencyMap[2]);
  var _paywallStyles = require(_dependencyMap[3]);
  var _componentsPrimitivesText = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function PaywallFooterActions({
    hasLivePackages,
    isLoading,
    isPremium,
    primaryCtaLabel,
    plans,
    onPurchase,
    onRestore
  }) {
    const annual = plans[0];
    const introPrice = annual?.packageInfo?.product.introPrice;
    const ctaLabel = introPrice ? `Try Free for ${introPrice.periodNumberOfUnits} ${introPrice.periodUnit?.toLowerCase() === 'day' ? 'Days' : introPrice.periodUnit}` : 'Continue with Annual';
    const primaryLabel = primaryCtaLabel ?? ctaLabel;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: _paywallStyles.paywallStyles.footerActions,
      children: [!isLoading && !isPremium && hasLivePackages ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
        onPress: () => onPurchase(annual),
        fullWidth: true,
        size: "lg",
        accessibilityLabel: "Continue with Annual Premium",
        accessibilityRole: "button",
        accessibilityHint: "Starts the store purchase flow for the annual plan.",
        children: primaryLabel
      }) : null, isPremium ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
        variant: "secondary",
        size: "lg",
        fullWidth: true,
        isDisabled: true,
        accessibilityLabel: "Already Premium",
        accessibilityRole: "button",
        accessibilityHint: "Confirms this account already has VEX Premium.",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          children: "Already Premium"
        })
      }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
        variant: "ghost",
        size: "sm",
        onPress: onRestore,
        accessibilityLabel: "Restore purchases",
        accessibilityRole: "button",
        accessibilityHint: "Checks the app store for existing VEX Premium entitlements.",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          children: "Restore Purchases"
        })
      })]
    });
  }
},3556,[12,80,1680,3551,1489,203]);
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
  exports.PaywallStatusMessageBanner = PaywallStatusMessageBanner;
  exports.PaywallLoadingState = PaywallLoadingState;
  exports.PaywallErrorState = PaywallErrorState;
  exports.PaywallUnavailableState = PaywallUnavailableState;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesButton = require(_dependencyMap[2]);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _componentsUiSkeleton = require(_dependencyMap[4]);
  var _sharedUiComponentsStatusFeedback = require(_dependencyMap[5]);
  var _paywallStyles = require(_dependencyMap[6]);
  var _reactJsxRuntime = require(_dependencyMap[7]);
  function PaywallStatusMessageBanner({
    statusMessage,
    onDismiss
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsStatusFeedback.StatusBanner, {
      status: statusMessage.tone === 'celebration' ? 'success' : statusMessage.tone === 'warning' ? 'error' : 'loading',
      message: statusMessage.title,
      description: statusMessage.body,
      onDismiss: onDismiss
    });
  }
  function PaywallLoadingState() {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: _paywallStyles.paywallStyles.skeletonContainer,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _paywallStyles.paywallStyles.skeletonHeader,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
          width: "60%",
          height: 32
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
          width: "80%",
          height: 16
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.SkeletonCard, {
        lines: 2,
        height: 120
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.SkeletonCard, {
        lines: 2,
        height: 120
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _paywallStyles.paywallStyles.skeletonFeatures,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
          width: "90%",
          height: 16
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
          width: "85%",
          height: 16
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsUiSkeleton.Skeleton, {
          width: "70%",
          height: 16
        })]
      })]
    });
  }
  function PaywallErrorState({
    theme,
    onRestore,
    onRetry
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: _paywallStyles.paywallStyles.errorContainer,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsStatusFeedback.StatusBanner, {
        status: "error",
        message: "Couldn't load offers - try again",
        description: "Pricing is temporarily unavailable. Your progress is safe.",
        onRetry: onRetry
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: _paywallStyles.paywallStyles.supportSection,
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "bodySmall",
          color: theme.colors.text.tertiary,
          style: _paywallStyles.paywallStyles.supportText,
          children: "Having trouble? Try again or contact support"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "ghost",
          size: "sm",
          onPress: onRestore,
          accessibilityLabel: "Restore purchases",
          accessibilityRole: "button",
          accessibilityHint: "Checks the app store for existing VEX Premium entitlements.",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: "Restore purchases"
          })
        })]
      })]
    });
  }
  function PaywallUnavailableState({
    onRestore,
    onRetry
  }) {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: _paywallStyles.paywallStyles.errorContainer,
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_sharedUiComponentsStatusFeedback.StatusBanner, {
        status: "error",
        message: "Live plans are not available yet",
        description: "Premium is not purchasable from this screen until RevenueCat offerings load. The free focus loop still works.",
        onRetry: onRetry
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
        variant: "ghost",
        size: "sm",
        onPress: onRestore,
        accessibilityLabel: "Restore purchases",
        accessibilityRole: "button",
        accessibilityHint: "Checks the app store for existing VEX Premium entitlements.",
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          children: "Restore purchases"
        })
      })]
    });
  }
},3557,[12,80,1680,1489,1676,2378,3551,203]);