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
  exports.VipPaywallScreen = VipPaywallScreen;
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return VipPaywallScreen;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[1]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _reactNavigationNative = require(_dependencyMap[3]);
  var _reactNativeSafeAreaContext = require(_dependencyMap[4]);
  var _componentsPrimitivesButton = require(_dependencyMap[5]);
  var _componentsPrimitivesText = require(_dependencyMap[6]);
  var _analyticsAnalyticsService = require(_dependencyMap[7]);
  var _uiComponentsStatusFeedback = require(_dependencyMap[8]);
  var _themeThemeContext = require(_dependencyMap[9]);
  var _purchaseEvents = require(_dependencyMap[10]);
  var _useRevenuecat = require(_dependencyMap[11]);
  var _paywallData = require(_dependencyMap[12]);
  var _PaywallComponents = require(_dependencyMap[13]);
  var _usePaywallActions = require(_dependencyMap[14]);
  var _VipPaywallSkeleton = require(_dependencyMap[15]);
  var _reactJsxRuntime = require(_dependencyMap[16]);
  function VipPaywallScreen() {
    const navigation = (0, _reactNavigationNative.useNavigation)();
    const route = (0, _reactNavigationNative.useRoute)();
    const insets = (0, _reactNativeSafeAreaContext.useSafeAreaInsets)();
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const {
      offerings,
      packages,
      isLoading,
      error,
      purchase,
      restore,
      retry
    } = (0, _useRevenuecat.usePaywall)();
    const {
      isPremium,
      isLoading: isLoadingPremium,
      refresh
    } = (0, _useRevenuecat.usePremiumStatus)();
    const [selectedPlan, setSelectedPlan] = (0, _react.useState)('annual');
    const source = route.params?.source ?? 'unknown';
    const spacing = theme.spacing;
    const premiumPackages = (0, _react.useMemo)(() => ({
      annual: packages.find(item => item.packageType.toUpperCase() === 'ANNUAL'),
      monthly: packages.find(item => item.packageType.toUpperCase() === 'MONTHLY')
    }), [packages]);
    const {
      statusMessage,
      setStatusMessage,
      handleClose,
      handlePurchase,
      handleRestore
    } = (0, _usePaywallActions.usePaywallActions)({
      navigation,
      source,
      isPremium,
      selectedPlan,
      premiumPackages,
      purchase,
      restore,
      refresh
    });
    (0, _react.useEffect)(() => {
      (0, _analyticsAnalyticsService.capture)(_purchaseEvents.PurchaseEvents.PAYWALL_VIEWED, (0, _purchaseEvents.createPaywallProperties)(offerings?.identifier ?? 'premium-offering', source, packages.map(item => ({
        identifier: item.identifier,
        hasTrial: Boolean(item.product.introPrice)
      }))));
    }, [offerings?.identifier, packages, source]);
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      style: {
        flex: 1,
        backgroundColor: theme.colors.background.primary
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(ScrollView.default, {
        contentContainerStyle: {
          paddingTop: insets.top + spacing[5],
          paddingBottom: insets.bottom + spacing[8],
          paddingHorizontal: spacing[5],
          gap: spacing[4]
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: spacing[4]
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
            style: {
              flex: 1,
              gap: spacing[2]
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "caption",
              color: "text.secondary",
              children: "VEX Premium"
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "h1",
              color: "text.primary",
              children: isPremium ? 'Premium is active' : 'Turn sessions into a system'
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              color: "text.secondary",
              children: isPremium ? 'Your deeper execution tools are active.' : 'Premium adds deeper coach memory, progress intelligence, and advanced work systems. The free focus loop stays useful.'
            })]
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
            variant: "ghost",
            onPress: handleClose,
            size: "sm",
            accessibilityLabel: "Close Premium paywall",
            accessibilityRole: "button",
            accessibilityHint: "Closes this screen.",
            children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              children: "Close"
            })
          })]
        }), statusMessage ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_uiComponentsStatusFeedback.StatusBanner, {
          status: statusMessage.tone === 'warning' ? 'error' : statusMessage.tone === 'celebration' ? 'success' : 'loading',
          message: statusMessage.title,
          description: statusMessage.body,
          onDismiss: () => setStatusMessage(null)
        }) : null, isLoading || isLoadingPremium ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_VipPaywallSkeleton.VipPaywallSkeleton, {}) : error ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_uiComponentsStatusFeedback.StatusBanner, {
          status: "error",
          message: "Could not load Premium options",
          description: "Pricing temporarily unavailable. Try again in a moment.",
          onRetry: retry
        }) : /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            gap: spacing[3]
          },
          children: [!isPremium ? /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_reactJsxRuntime.Fragment, {
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallComponents.PlanCard, {
              plan: "annual",
              isSelected: selectedPlan === 'annual',
              priceString: premiumPackages.annual?.product.priceString,
              onSelect: setSelectedPlan
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallComponents.PlanCard, {
              plan: "monthly",
              isSelected: selectedPlan === 'monthly',
              priceString: premiumPackages.monthly?.product.priceString,
              onSelect: setSelectedPlan
            })]
          }) : null, /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_PaywallComponents.BenefitList, {
            benefits: _paywallData.PREMIUM_BENEFITS
          })]
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          variant: "ghost",
          size: "sm",
          onPress: handleRestore,
          accessibilityLabel: "Restore purchases",
          accessibilityRole: "button",
          accessibilityHint: "Checks the app store for existing VEX Premium entitlements.",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
            children: "Restore purchases"
          })
        }), !isPremium && !isLoading && !error ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesButton.Button, {
          onPress: handlePurchase,
          variant: "primary",
          size: "lg",
          fullWidth: true,
          accessibilityLabel: "Subscribe to selected Premium plan",
          accessibilityRole: "button",
          accessibilityHint: "Starts the store purchase flow for the selected plan.",
          children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
            children: ["Subscribe ", selectedPlan === 'annual' ? 'Annual' : 'Monthly']
          })
        }) : null]
      })
    });
  }
},3327,[12,171,80,1359,719,1680,1489,1491,2378,1463,3118,3115,3558,3559,3560,3561,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "PREMIUM_BENEFITS", {
    enumerable: true,
    get: function () {
      return PREMIUM_BENEFITS;
    }
  });
  const PREMIUM_BENEFITS = [['Deep Coach Memory', 'VEX remembers patterns, comeback style, best focus windows, and preferred push style.'], ['Monthly Focus Report', 'See rhythm, focus risk, recovery plans, and what changed this month.'], ['Progress Intelligence', 'Find when you focus best and which session types actually work for you.'], ['Advanced Study / Deep Work OS', 'Turn study, learning, and projects into review loops and smart next actions.'], ['Visual Identity', 'Shape companion forms, focus worlds, atmospheres, and premium animations.'], ['Premium Session Modes', 'Use Exam Sprint, Deep Work, Calm Reset, Boss Focus, Comeback, and Review modes.']];
},3558,[]);
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
  exports.PlanCard = PlanCard;
  exports.BenefitList = BenefitList;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[1]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsView = require(_dependencyMap[2]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _componentsPrimitivesText = require(_dependencyMap[3]);
  var _theme = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function PlanCard({
    plan,
    isSelected,
    priceString,
    onSelect
  }) {
    const {
      theme
    } = (0, _theme.useTheme)();
    const spacing = theme.spacing;
    const radius = theme.borderRadius;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Pressable.default, {
      onPress: () => onSelect(plan),
      style: {
        minHeight: spacing[12],
        padding: spacing[4],
        borderRadius: radius.md,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? theme.colors.primary[500] : theme.colors.border.DEFAULT,
        backgroundColor: theme.colors.background.secondary
      },
      accessibilityLabel: `Choose ${plan} Premium plan`,
      accessibilityRole: "button",
      accessibilityHint: "Selects this subscription option.",
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "h4",
        color: "text.primary",
        children: plan === 'annual' ? 'Annual Premium' : 'Monthly Premium'
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
        variant: "bodySmall",
        color: "text.secondary",
        children: priceString ?? 'Live pricing loading'
      })]
    });
  }
  function BenefitList({
    benefits
  }) {
    const {
      theme
    } = (0, _theme.useTheme)();
    const spacing = theme.spacing;
    const radius = theme.borderRadius;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
      style: {
        gap: spacing[3]
      },
      children: benefits.map(([title, description]) => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          padding: spacing[4],
          borderRadius: radius.md,
          backgroundColor: theme.colors.background.secondary
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h4",
          color: "text.primary",
          children: title
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "bodySmall",
          color: "text.secondary",
          children: description
        })]
      }, title))
    });
  }
},3559,[12,1286,80,1489,2691,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.usePaywallActions = usePaywallActions;
  var _react = require(_dependencyMap[0]);
  var _analyticsAnalyticsService = require(_dependencyMap[1]);
  var _purchaseEvents = require(_dependencyMap[2]);
  function usePaywallActions({
    navigation,
    source,
    isPremium,
    selectedPlan,
    premiumPackages,
    purchase,
    restore,
    refresh
  }) {
    const [statusMessage, setStatusMessage] = (0, _react.useState)(null);
    const handleClose = () => {
      (0, _analyticsAnalyticsService.capture)(_purchaseEvents.PurchaseEvents.PAYWALL_DISMISSED, {
        paywall_source: source,
        gated_feature: 'premium_subscription'
      });
      navigation.goBack();
    };
    const handlePurchase = async () => {
      const selectedPackage = selectedPlan === 'annual' ? premiumPackages.annual : premiumPackages.monthly;
      if (!selectedPackage) {
        setStatusMessage({
          tone: 'warning',
          title: 'Plans loading',
          body: 'Premium options are still loading. Please wait a moment.'
        });
        return;
      }
      const result = await purchase(selectedPackage);
      if (result.success) {
        await refresh();
        setStatusMessage({
          tone: 'celebration',
          title: 'Premium is active',
          body: 'Deeper coach memory, reports, and progress intelligence are active.'
        });
        navigation.goBack();
        return;
      }
      setStatusMessage({
        tone: 'warning',
        title: 'Purchase not completed',
        body: "Purchase didn't go through. Your card was not charged."
      });
    };
    const handleRestore = async () => {
      setStatusMessage({
        tone: 'info',
        title: 'Restoring purchases',
        body: 'Checking for existing Premium subscription.'
      });
      const result = await restore();
      await refresh();
      setStatusMessage(result.success ? {
        tone: 'celebration',
        title: 'Purchases restored',
        body: isPremium ? 'Your Premium status is active.' : 'No active subscriptions found.'
      } : {
        tone: 'warning',
        title: 'Restore failed',
        body: 'Try again with a stronger connection.'
      });
    };
    return {
      statusMessage,
      setStatusMessage,
      handleClose,
      handlePurchase,
      handleRestore
    };
  }
},3560,[12,1491,3118]);
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
  exports.VipPaywallSkeleton = VipPaywallSkeleton;
  require(_dependencyMap[0]);
  var _reactNativeWebDistExportsView = require(_dependencyMap[1]);
  var View = _interopDefault(_reactNativeWebDistExportsView);
  var _uiComponentsSkeletonItem = require(_dependencyMap[2]);
  var _themeThemeContext = require(_dependencyMap[3]);
  var _paywallData = require(_dependencyMap[4]);
  var _reactJsxRuntime = require(_dependencyMap[5]);
  function VipPaywallSkeleton() {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const spacing = theme.spacing;
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
      style: {
        gap: spacing[3]
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          padding: spacing[4],
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.background.secondary
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_uiComponentsSkeletonItem.SkeletonItem, {
          variant: "title",
          width: "60%",
          style: {
            marginBottom: spacing[2]
          }
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_uiComponentsSkeletonItem.SkeletonItem, {
          variant: "text",
          width: "40%"
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
        style: {
          padding: spacing[4],
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.background.secondary
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_uiComponentsSkeletonItem.SkeletonItem, {
          variant: "title",
          width: "50%",
          style: {
            marginBottom: spacing[2]
          }
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_uiComponentsSkeletonItem.SkeletonItem, {
          variant: "text",
          width: "35%"
        })]
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(View.default, {
        style: {
          gap: spacing[3]
        },
        children: _paywallData.PREMIUM_BENEFITS.map(([title]) => /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(View.default, {
          style: {
            padding: spacing[4],
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.background.secondary
          },
          children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_uiComponentsSkeletonItem.SkeletonItem, {
            variant: "title",
            width: "55%",
            style: {
              marginBottom: spacing[2]
            }
          }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_uiComponentsSkeletonItem.SkeletonItem, {
            variant: "text",
            width: "80%"
          })]
        }, title))
      })]
    });
  }
},3561,[12,80,3125,1463,3558,203]);
//# sourceMappingURL=/_expo/static/js/web/VipPaywallScreen-ae1a72dc826bb1a75c0175790d2fedf6.js.map
//# debugId=090ee519-5b21-44d5-a741-24fde603ba26