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
  Object.defineProperty(exports, "MemoryConsoleScreen", {
    enumerable: true,
    get: function () {
      return MemoryConsoleScreenWithBoundary;
    }
  });
  Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function () {
      return MemoryConsoleScreen;
    }
  });
  var _react = require(_dependencyMap[0]);
  var _reactNativeWebDistExportsAlert = require(_dependencyMap[1]);
  var Alert = _interopDefault(_reactNativeWebDistExportsAlert);
  var _reactNativeWebDistExportsPressable = require(_dependencyMap[2]);
  var Pressable = _interopDefault(_reactNativeWebDistExportsPressable);
  var _reactNativeWebDistExportsScrollView = require(_dependencyMap[3]);
  var ScrollView = _interopDefault(_reactNativeWebDistExportsScrollView);
  var _reactNativeSafeAreaContext = require(_dependencyMap[4]);
  var _featuresFocusMemoryService = require(_dependencyMap[5]);
  var _featuresFocusMemoryHooks = require(_dependencyMap[6]);
  var _featuresFocusMemoryUseMemoryConsoleVisibility = require(_dependencyMap[7]);
  var _store = require(_dependencyMap[8]);
  var _themeThemeContext = require(_dependencyMap[9]);
  var _componentsPrimitivesBox = require(_dependencyMap[10]);
  var _componentsPrimitivesCard = require(_dependencyMap[11]);
  var _componentsPrimitivesText = require(_dependencyMap[12]);
  var _sharedUiComponentsScreenErrorBoundary = require(_dependencyMap[13]);
  var _componentsEmptyState = require(_dependencyMap[14]);
  var _reactJsxRuntime = require(_dependencyMap[15]);
  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  const MemoryConsoleScreen = () => {
    const {
      theme
    } = (0, _themeThemeContext.useTheme)();
    const insets = (0, _reactNativeSafeAreaContext.useSafeAreaInsets)();
    const {
      user
    } = (0, _store.useAuthStore)();
    const userId = user?.id ?? null;
    const {
      isVisible
    } = (0, _featuresFocusMemoryUseMemoryConsoleVisibility.useMemoryConsoleVisibility)(userId);
    const {
      data: memories,
      refetch
    } = (0, _featuresFocusMemoryHooks.useActiveFocusMemories)(userId);
    const [deleting, setDeleting] = (0, _react.useState)(null);
    const handleDelete = (0, _react.useCallback)(memory => {
      Alert.default.alert('Delete Memory', `Remove "${memory.summary}"? This cannot be undone. VEX will not regenerate this from the same evidence.`, [{
        text: 'Cancel',
        style: 'cancel'
      }, {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!userId) {
            return;
          }
          setDeleting(memory.id);
          try {
            await (0, _featuresFocusMemoryService.deleteMemory)(memory.id, userId);
            await refetch();
          } finally {
            setDeleting(null);
          }
        }
      }]);
    }, [userId, refetch]);
    const confidenceLabel = c => {
      const colors = theme.colors.semantic;
      if (c >= 0.8) {
        return {
          label: 'High',
          color: colors.success
        };
      }
      if (c >= 0.5) {
        return {
          label: 'Medium',
          color: colors.warning
        };
      }
      return {
        label: 'Low',
        color: colors.danger
      };
    };
    if (!isVisible) {
      return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
        flex: 1,
        style: {
          backgroundColor: theme.colors.background.primary,
          paddingTop: insets.top
        },
        children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsEmptyState.EmptyState, {
          iconName: "clock",
          title: "Memory Console",
          body: "VEX needs at least 3 completed sessions before memory insights become available. Keep focusing."
        })
      });
    }
    return /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesBox.Box, {
      flex: 1,
      style: {
        backgroundColor: theme.colors.background.primary
      },
      children: /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(ScrollView.default, {
        contentContainerStyle: {
          paddingTop: insets.top + theme.spacing[4],
          paddingHorizontal: theme.spacing[4],
          paddingBottom: insets.bottom + theme.spacing[4]
        },
        children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
          variant: "h2",
          style: {
            fontWeight: '800',
            marginBottom: 4
          },
          children: "Memory Console"
        }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
          variant: "body",
          color: "text.secondary",
          style: {
            marginBottom: theme.spacing[4]
          },
          children: [memories.length, " memory ", memories.length === 1 ? 'entry' : 'entries', ' ', "\xB7 inspect, edit, or delete"]
        }), memories.length === 0 ? /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsEmptyState.EmptyState, {
          iconName: "activity",
          title: "No memories yet",
          body: "Memories build from completed sessions, reflections, and behavior patterns."
        }) : memories.map(memory => {
          const conf = confidenceLabel(memory.confidence);
          const isDeleting = deleting === memory.id;
          return /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesCard.Card, {
            size: "md",
            style: {
              backgroundColor: theme.colors.background.secondary,
              marginBottom: theme.spacing[3],
              opacity: isDeleting ? 0.5 : 1
            },
            children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                variant: "caption",
                color: "text.tertiary",
                style: {
                  textTransform: 'uppercase'
                },
                children: memory.type
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
                variant: "caption",
                style: {
                  color: conf.color,
                  fontWeight: '700'
                },
                children: [conf.label, " (", memory.confidence.toFixed(2), ")"]
              })]
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
              variant: "body",
              style: {
                fontWeight: '600',
                marginBottom: 4
              },
              children: memory.summary
            }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
              children: [/*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
                variant: "caption",
                color: "text.tertiary",
                children: [memory.source, " \xB7 ", formatDate(memory.createdAt)]
              }), /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesBox.Box, {
                flexDirection: "row",
                gap: 8,
                children: [memory.evidenceHash && /*#__PURE__*/(0, _reactJsxRuntime.jsxs)(_componentsPrimitivesText.Text, {
                  variant: "caption",
                  color: "text.tertiary",
                  children: ["ev:", memory.evidenceHash.slice(0, 8)]
                }), /*#__PURE__*/(0, _reactJsxRuntime.jsx)(Pressable.default, {
                  onPress: () => handleDelete(memory),
                  disabled: isDeleting,
                  accessibilityLabel: `Delete memory: ${memory.summary}`,
                  accessibilityRole: "button",
                  accessibilityHint: "Permanently removes this memory entry",
                  style: {
                    padding: 4
                  },
                  children: /*#__PURE__*/(0, _reactJsxRuntime.jsx)(_componentsPrimitivesText.Text, {
                    variant: "caption",
                    color: "error.DEFAULT",
                    children: "Delete"
                  })
                })]
              })]
            })]
          }, memory.id);
        })]
      })
    });
  };
  const MemoryConsoleScreenWithBoundary = (0, _sharedUiComponentsScreenErrorBoundary.withScreenErrorBoundary)(MemoryConsoleScreen, 'MemoryConsole');
},3341,[12,1259,1286,171,719,3728,3734,3735,1705,1463,1462,2621,1489,2166,2812,203]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "hasEvidenceConflict", {
    enumerable: true,
    get: function () {
      return _memoryOperations.hasEvidenceConflict;
    }
  });
  Object.defineProperty(exports, "createMemoryCandidate", {
    enumerable: true,
    get: function () {
      return _memoryOperations.createMemoryCandidate;
    }
  });
  Object.defineProperty(exports, "acceptMemory", {
    enumerable: true,
    get: function () {
      return _memoryOperations.acceptMemory;
    }
  });
  Object.defineProperty(exports, "deleteMemory", {
    enumerable: true,
    get: function () {
      return _memoryOperations.deleteMemory;
    }
  });
  Object.defineProperty(exports, "listActiveMemories", {
    enumerable: true,
    get: function () {
      return _memoryOperations.listActiveMemories;
    }
  });
  Object.defineProperty(exports, "listDeletedMemoryHashes", {
    enumerable: true,
    get: function () {
      return _memoryOperations.listDeletedMemoryHashes;
    }
  });
  Object.defineProperty(exports, "findMemoriesForRecommendation", {
    enumerable: true,
    get: function () {
      return _memoryOperations.findMemoriesForRecommendation;
    }
  });
  Object.defineProperty(exports, "hashEvidence", {
    enumerable: true,
    get: function () {
      return _evidence.hashEvidence;
    }
  });
  Object.defineProperty(exports, "buildColdStartEvidence", {
    enumerable: true,
    get: function () {
      return _evidence.buildColdStartEvidence;
    }
  });
  Object.defineProperty(exports, "buildMemoryEvidence", {
    enumerable: true,
    get: function () {
      return _evidence.buildMemoryEvidence;
    }
  });
  Object.defineProperty(exports, "generateRecommendationEvidence", {
    enumerable: true,
    get: function () {
      return _evidence.generateRecommendationEvidence;
    }
  });
  Object.defineProperty(exports, "canClaimStrongPattern", {
    enumerable: true,
    get: function () {
      return _evidence.canClaimStrongPattern;
    }
  });
  Object.defineProperty(exports, "scopeMessageForSource", {
    enumerable: true,
    get: function () {
      return _evidence.scopeMessageForSource;
    }
  });
  Object.defineProperty(exports, "isImportSourceMemory", {
    enumerable: true,
    get: function () {
      return _evidence.isImportSourceMemory;
    }
  });
  Object.defineProperty(exports, "filterImportMemories", {
    enumerable: true,
    get: function () {
      return _evidence.filterImportMemories;
    }
  });
  var _memoryOperations = require(_dependencyMap[0]);
  var _evidence = require(_dependencyMap[1]);
},3728,[3729,3733]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.hasEvidenceConflict = hasEvidenceConflict;
  exports.createMemoryCandidate = createMemoryCandidate;
  exports.acceptMemory = acceptMemory;
  exports.deleteMemory = deleteMemory;
  exports.listActiveMemories = listActiveMemories;
  exports.listDeletedMemoryHashes = listDeletedMemoryHashes;
  exports.findMemoriesForRecommendation = findMemoriesForRecommendation;
  var _utilsUuid = require(_dependencyMap[0]);
  var _expiry = require(_dependencyMap[1]);
  var _repository = require(_dependencyMap[2]);
  var _schemas = require(_dependencyMap[3]);
  function isActive(memory, now) {
    if (memory.deletedAt !== null) {
      return false;
    }
    return memory.expiresAt === null || memory.expiresAt > now;
  }
  function shouldAutoAccept(input) {
    return input.confidence >= 0.7 && !(0, _expiry.isSensitiveMemory)(input.type);
  }
  async function hasEvidenceConflict(userId, evidenceHash) {
    if (!evidenceHash) {
      return false;
    }
    const all = await (0, _repository.readMemories)(userId);
    return all.some(m => m.evidenceHash === evidenceHash && m.deletedAt !== null);
  }
  async function createMemoryCandidate(rawInput) {
    const input = _schemas.CreateMemoryCandidateInputSchema.parse(rawInput);
    const createdAt = input.createdAt ?? Date.now();
    if (input.evidenceHash) {
      const conflict = await hasEvidenceConflict(input.userId, input.evidenceHash);
      if (conflict) {
        throw new Error('EvidenceConflict: memory with this evidence was previously deleted');
      }
    }
    const memory = _schemas.FocusMemorySchema.parse({
      id: (0, _utilsUuid.v4)(),
      userId: input.userId,
      type: input.type,
      content: '',
      summary: input.summary,
      source: input.source,
      confidence: input.confidence,
      accepted: shouldAutoAccept(input),
      deletedAt: null,
      expiresAt: (0, _expiry.expiryForType)(input.type, createdAt),
      evidenceHash: input.evidenceHash ?? null,
      createdAt,
      updatedAt: createdAt
    });
    const memories = await (0, _repository.readMemories)(input.userId);
    await (0, _repository.writeMemories)(input.userId, [memory, ...memories]);
    return memory;
  }
  async function acceptMemory(memoryId, userId) {
    const memories = await (0, _repository.readMemories)(userId);
    const updated = memories.map(memory => memory.id === memoryId ? _schemas.FocusMemorySchema.parse(Object.assign({}, memory, {
      accepted: true,
      updatedAt: Date.now()
    })) : memory);
    await (0, _repository.writeMemories)(userId, updated);
    const found = updated.find(memory => memory.id === memoryId);
    if (!found) {
      throw new Error('Memory not found');
    }
    return found;
  }
  async function deleteMemory(memoryId, userId) {
    const memories = await (0, _repository.readMemories)(userId);
    const updated = memories.map(memory => memory.id === memoryId ? _schemas.FocusMemorySchema.parse(Object.assign({}, memory, {
      deletedAt: Date.now(),
      updatedAt: Date.now()
    })) : memory);
    await (0, _repository.writeMemories)(userId, updated);
  }
  async function listActiveMemories(userId) {
    const now = Date.now();
    return (await (0, _repository.readMemories)(userId)).filter(memory => isActive(memory, now));
  }
  async function listDeletedMemoryHashes(userId) {
    const all = await (0, _repository.readMemories)(userId);
    return all.filter(m => m.deletedAt !== null && m.evidenceHash !== null).map(m => m.evidenceHash);
  }
  async function findMemoriesForRecommendation(rawInput) {
    const input = _schemas.MemoryRecommendationInputSchema.parse(rawInput);
    const now = input.now ?? Date.now();
    return (await (0, _repository.readMemories)(input.userId)).filter(memory => {
      const typeAllowed = input.types ? input.types.includes(memory.type) : true;
      return typeAllowed && memory.accepted && memory.confidence >= input.minConfidence && isActive(memory, now);
    });
  }
},3729,[1864,3730,3731,3732]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.expiryForType = expiryForType;
  exports.isSensitiveMemory = isSensitiveMemory;
  exports.contentScopeForSource = contentScopeForSource;
  const DAY_MS = 86400000;
  function expiryForType(type, createdAt) {
    if (type === 'preferred_tone' || type === 'project_continuity' || type === 'friction_preference') {
      return null;
    }
    if (type === 'successful_session_pattern') {
      return createdAt + 3888000000;
    }
    if (type === 'lane_evidence') {
      return createdAt + 5184000000;
    }
    if (type === 'study_deadline') {
      return createdAt + 604800000;
    }
    return createdAt + 2592000000;
  }
  function isSensitiveMemory(type) {
    return type === 'study_deadline' || type === 'project_continuity';
  }
  function contentScopeForSource(source) {
    if (source === 'import') {
      return 'task_only';
    }
    return 'general';
  }
},3730,[]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.readMemories = readMemories;
  exports.writeMemories = writeMemories;
  exports.syncMemoriesToSupabase = syncMemoriesToSupabase;
  exports.fetchMemoriesFromSupabase = fetchMemoriesFromSupabase;
  var _zod = require(_dependencyMap[0]);
  var _storeMmkvStorage = require(_dependencyMap[1]);
  var _configSupabase = require(_dependencyMap[2]);
  var _schemas = require(_dependencyMap[3]);
  const KEY_PREFIX = 'focus-memory:';
  function keyFor(userId) {
    return `${KEY_PREFIX}${userId}`;
  }
  function marshallForUpsert(userId, memories) {
    return memories.map(m => ({
      id: m.id,
      user_id: userId,
      type: m.type,
      content: m.content ?? '',
      summary: m.summary,
      source: m.source,
      confidence: m.confidence,
      accepted: m.accepted,
      deleted_at: m.deletedAt ? new Date(m.deletedAt).toISOString() : null,
      expires_at: m.expiresAt ? new Date(m.expiresAt).toISOString() : null,
      evidence_hash: m.evidenceHash,
      created_at: new Date(m.createdAt).toISOString(),
      updated_at: new Date(m.updatedAt).toISOString()
    }));
  }
  async function readMemories(userId) {
    const raw = _storeMmkvStorage.storage.getString(keyFor(userId));
    if (!raw) {
      return [];
    }
    return _schemas.FocusMemorySchema.array().parse(JSON.parse(raw));
  }
  async function writeMemories(userId, memories) {
    const parsed = _schemas.FocusMemorySchema.array().parse(memories);
    _storeMmkvStorage.storage.set(keyFor(userId), JSON.stringify(parsed));
    return parsed;
  }
  async function syncMemoriesToSupabase(userId) {
    try {
      const memories = await readMemories(userId);
      if (memories.length === 0) {
        return;
      }
      const rows = marshallForUpsert(userId, memories);
      const {
        error
      } = await _configSupabase.supabase.from('focus_memories').upsert(rows, {
        onConflict: 'id',
        ignoreDuplicates: false
      });
      if (error && error.code !== '42P01') {
        throw error;
      }
    } catch (error) {
      const code = error.code;
      if (code === '42P01') {
        return;
      }
      throw error;
    }
  }
  async function fetchMemoriesFromSupabase(userId) {
    try {
      const {
        data,
        error
      } = await _configSupabase.supabase.from('focus_memories').select('id,user_id,type,content,summary,source,confidence,accepted,deleted_at,expires_at,evidence_hash,created_at,updated_at').eq('user_id', userId).order('created_at', {
        ascending: false
      });
      if (error) {
        if (error.code === '42P01') {
          return [];
        }
        throw error;
      }
      const rowSchema = _zod.z.object({
        id: _zod.z.string(),
        user_id: _zod.z.string(),
        type: _zod.z.string(),
        content: _zod.z.string().default(''),
        summary: _zod.z.string(),
        source: _zod.z.string(),
        confidence: _zod.z.number(),
        accepted: _zod.z.boolean(),
        deleted_at: _zod.z.string().nullable(),
        expires_at: _zod.z.string().nullable(),
        evidence_hash: _zod.z.string().nullable(),
        created_at: _zod.z.string(),
        updated_at: _zod.z.string()
      });
      return _zod.z.array(rowSchema).parse(data ?? []).map(row => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        content: row.content ?? '',
        summary: row.summary,
        source: row.source,
        confidence: row.confidence,
        accepted: row.accepted,
        deletedAt: row.deleted_at ? new Date(row.deleted_at).getTime() : null,
        expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : null,
        evidenceHash: row.evidence_hash,
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.updated_at).getTime()
      }));
    } catch (error) {
      const code = error.code;
      if (code === '42P01') {
        return [];
      }
      throw error;
    }
  }
},3731,[1774,2355,1726,3732]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "FocusMemoryTypeSchema", {
    enumerable: true,
    get: function () {
      return FocusMemoryTypeSchema;
    }
  });
  Object.defineProperty(exports, "FocusMemorySchema", {
    enumerable: true,
    get: function () {
      return FocusMemorySchema;
    }
  });
  Object.defineProperty(exports, "ColdStartReasonSchema", {
    enumerable: true,
    get: function () {
      return ColdStartReasonSchema;
    }
  });
  Object.defineProperty(exports, "EvidenceLaneContextSchema", {
    enumerable: true,
    get: function () {
      return EvidenceLaneContextSchema;
    }
  });
  Object.defineProperty(exports, "RecommendationEvidenceSchema", {
    enumerable: true,
    get: function () {
      return RecommendationEvidenceSchema;
    }
  });
  Object.defineProperty(exports, "CreateMemoryCandidateInputSchema", {
    enumerable: true,
    get: function () {
      return CreateMemoryCandidateInputSchema;
    }
  });
  Object.defineProperty(exports, "MemoryRecommendationInputSchema", {
    enumerable: true,
    get: function () {
      return MemoryRecommendationInputSchema;
    }
  });
  var _zod = require(_dependencyMap[0]);
  const FocusMemoryTypeSchema = _zod.z.enum(['best_time_window', 'avoidance_trigger', 'successful_session_pattern', 'failed_session_pattern', 'preferred_tone', 'study_deadline', 'project_continuity', 'friction_preference', 'notification_preference', 'lane_evidence']);
  const FocusMemorySchema = _zod.z.object({
    id: _zod.z.string().min(1),
    userId: _zod.z.string().min(1),
    type: FocusMemoryTypeSchema,
    content: _zod.z.string().default(''),
    summary: _zod.z.string().min(1),
    source: _zod.z.enum(['session_completion', 'reflection', 'behavior', 'import', 'manual']),
    confidence: _zod.z.number().min(0).max(1),
    accepted: _zod.z.boolean(),
    deletedAt: _zod.z.number().int().min(0).nullable(),
    expiresAt: _zod.z.number().int().min(0).nullable(),
    evidenceHash: _zod.z.string().nullable(),
    createdAt: _zod.z.number().int().min(0),
    updatedAt: _zod.z.number().int().min(0)
  }).strict();
  const ColdStartReasonSchema = _zod.z.enum(['cold_start', 'insufficient_data', 'user_override']);
  const EvidenceLaneContextSchema = _zod.z.enum(['student', 'game_like', 'deep_creative', 'minimal_normal']);
  const RecommendationEvidenceSchema = _zod.z.object({
    memoryIds: _zod.z.array(_zod.z.string()).optional(),
    evidenceSummary: _zod.z.string().optional(),
    confidence: _zod.z.number().min(0).max(1).optional(),
    fallbackReason: ColdStartReasonSchema.optional(),
    source: _zod.z.enum(['session_completion', 'reflection', 'behavior', 'rescue_completion', 'cold_start']),
    lane: EvidenceLaneContextSchema,
    mode: _zod.z.string().min(1).optional()
  }).strict();
  const CreateMemoryCandidateInputSchema = _zod.z.object({
    userId: _zod.z.string().min(1),
    type: FocusMemoryTypeSchema,
    summary: _zod.z.string().min(1),
    source: _zod.z.enum(['session_completion', 'reflection', 'behavior', 'import', 'manual']),
    confidence: _zod.z.number().min(0).max(1),
    evidenceHash: _zod.z.string().min(1).optional(),
    createdAt: _zod.z.number().int().min(0).optional()
  }).strict();
  const MemoryRecommendationInputSchema = _zod.z.object({
    userId: _zod.z.string().min(1),
    types: _zod.z.array(FocusMemoryTypeSchema).optional(),
    minConfidence: _zod.z.number().min(0).max(1).optional().default(0.5),
    now: _zod.z.number().int().min(0).optional()
  }).strict();
},3732,[1774]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.hashEvidence = hashEvidence;
  exports.buildColdStartEvidence = buildColdStartEvidence;
  exports.buildMemoryEvidence = buildMemoryEvidence;
  exports.generateRecommendationEvidence = generateRecommendationEvidence;
  exports.canClaimStrongPattern = canClaimStrongPattern;
  exports.scopeMessageForSource = scopeMessageForSource;
  exports.isImportSourceMemory = isImportSourceMemory;
  exports.filterImportMemories = filterImportMemories;
  var _expiry = require(_dependencyMap[0]);
  var _schemas = require(_dependencyMap[1]);
  function hashEvidence(evidence) {
    let hash = 0;
    for (let i = 0; i < evidence.length; i++) {
      const ch = evidence.charCodeAt(i);
      hash = (hash << 5) - hash + ch;
      hash |= 0;
    }
    return `ev-${Math.abs(hash).toString(36)}`;
  }
  function buildColdStartEvidence(reason, lane) {
    const validated = _schemas.ColdStartReasonSchema.parse(reason);
    return _schemas.RecommendationEvidenceSchema.parse({
      fallbackReason: validated,
      source: 'cold_start',
      lane: lane ?? 'minimal_normal'
    });
  }
  function buildMemoryEvidence(memories, lane) {
    if (memories.length === 0) {
      return buildColdStartEvidence('insufficient_data', lane);
    }
    const avgConfidence = memories.reduce((sum, m) => sum + m.confidence, 0) / memories.length;
    return _schemas.RecommendationEvidenceSchema.parse({
      memoryIds: memories.map(m => m.id),
      evidenceSummary: memories.map(m => m.summary).join('; '),
      confidence: Math.round(avgConfidence * 100) / 100,
      fallbackReason: undefined,
      source: 'behavior',
      lane: lane ?? 'minimal_normal'
    });
  }
  function generateRecommendationEvidence(memories, sessionCount, lane, fallbackReason) {
    const resolvedLane = lane ?? 'minimal_normal';
    if (sessionCount < 3) {
      return buildColdStartEvidence('cold_start', resolvedLane);
    }
    if (fallbackReason) {
      return buildColdStartEvidence(fallbackReason, resolvedLane);
    }
    return buildMemoryEvidence(memories, resolvedLane);
  }
  function canClaimStrongPattern(sessionCount) {
    return sessionCount >= 3;
  }
  function scopeMessageForSource(message, source) {
    if (source === 'import') {
      return {
        message: `[From your content] ${message}`,
        scoped: true
      };
    }
    return {
      message,
      scoped: false
    };
  }
  function isImportSourceMemory(memory) {
    return memory.source === 'import';
  }
  function filterImportMemories(memories) {
    const taskScoped = [];
    const excluded = [];
    for (const memory of memories) {
      if ((0, _expiry.contentScopeForSource)(memory.source) === 'task_only') {
        excluded.push(memory);
      } else {
        taskScoped.push(memory);
      }
    }
    return {
      taskScoped,
      excluded
    };
  }
},3733,[3730,3732]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useActiveFocusMemories = useActiveFocusMemories;
  var _tanstackReactQuery = require(_dependencyMap[0]);
  var _service = require(_dependencyMap[1]);
  function useActiveFocusMemories(userId) {
    const {
      data,
      isPending,
      isError,
      error,
      refetch
    } = (0, _tanstackReactQuery.useQuery)({
      queryKey: ['focus-memory', userId],
      queryFn: () => (0, _service.listActiveMemories)(userId ?? ''),
      enabled: Boolean(userId)
    });
    return {
      data: data ?? [],
      isPending: isPending,
      isError: isError,
      error: error,
      refetch: refetch
    };
  }
},3734,[771,3728]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.useMemoryConsoleVisibility = useMemoryConsoleVisibility;
  var _tanstackReactQuery = require(_dependencyMap[0]);
  var _sessionHistoryRepository = require(_dependencyMap[1]);
  const MEMORY_CONSOLE_MIN_SESSIONS = 3;
  function useMemoryConsoleVisibility(userId) {
    const {
      isPending,
      isError,
      error,
      data
    } = (0, _tanstackReactQuery.useQuery)({
      queryKey: ['memory-console-visible', userId],
      queryFn: async () => {
        if (!userId) {
          return false;
        }
        const count = await (0, _sessionHistoryRepository.countCompletedSessions)(userId);
        return count >= MEMORY_CONSOLE_MIN_SESSIONS;
      },
      enabled: Boolean(userId),
      staleTime: 300000
    });
    if (isPending) {
      return {
        isVisible: false,
        isLoading: true,
        error: null
      };
    }
    if (isError) {
      return {
        isVisible: false,
        isLoading: false,
        error: error
      };
    }
    return {
      isVisible: data ?? false,
      isLoading: false,
      error: null
    };
  }
},3735,[771,3319]);