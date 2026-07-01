__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.ContentStudyNavigator = ContentStudyNavigator;
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return ContentStudyNavigator;
    }
  });
  require(_dependencyMap[0]);
  var _reactNavigationNativeStack = require(_dependencyMap[1]);
  var _featuresContentStudyScreensContentInputScreen = require(_dependencyMap[2]);
  var _featuresContentStudyScreensContentReviewScreen = require(_dependencyMap[3]);
  var _featuresContentStudyScreensStudyPlanScreen = require(_dependencyMap[4]);
  var _featuresContentStudyScreensStudyLibraryScreen = require(_dependencyMap[5]);
  var _reactJsxRuntime = require(_dependencyMap[6]);
  const Stack = (0, _reactNavigationNativeStack.createNativeStackNavigator)();
  function ContentStudyNavigator() {
    return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(Stack.Navigator, {
      screenOptions: {
        headerShown: false
      },
      children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(Stack.Screen, {
        name: "ContentInput",
        component: _featuresContentStudyScreensContentInputScreen.ContentInputScreen
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Stack.Screen, {
        name: "ContentReview",
        component: _featuresContentStudyScreensContentReviewScreen.ContentReviewScreen
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Stack.Screen, {
        name: "StudyPlan",
        component: _featuresContentStudyScreensStudyPlanScreen.StudyPlanScreen
      }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Stack.Screen, {
        name: "ContentHistory",
        component: _featuresContentStudyScreensStudyLibraryScreen.StudyLibraryScreen
      })]
    });
  }
},3340,[12,2074,2684,2685,2688,2701,203]);