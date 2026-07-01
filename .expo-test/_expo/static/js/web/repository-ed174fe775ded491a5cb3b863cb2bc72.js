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
  exports.getOrCreateWallet = getOrCreateWallet;
  exports.getCurrentUserId = getCurrentUserId;
  exports.spendCurrencyRpc = spendCurrencyRpc;
  exports.grantCurrencyRpc = grantCurrencyRpc;
  exports.addCurrencyRpc = addCurrencyRpc;
  var _configSupabase = require(_dependencyMap[0]);
  var _schemas = require(_dependencyMap[1]);
  var _libRepositoryErrorHandling = require(_dependencyMap[2]);
  var _libRepositoryTableColumns = require(_dependencyMap[3]);
  /**
   * Upsert a wallet row for the given user and return the parsed wallet.
   * This is the canonical data-access layer for wallet creation — moved
   * from service.ts to enforce the repository pattern.
   */
  async function getOrCreateWallet(userId) {
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      data,
      error
    } = await supabase.from('wallets').upsert({
      user_id: userId
    }, {
      onConflict: 'user_id',
      ignoreDuplicates: true
    }).select((0, _libRepositoryTableColumns.tableColumns)('wallets')).single();
    if (error) {
      throw new _libRepositoryErrorHandling.RepositoryError('getOrCreateWallet', error);
    }
    const wallet = _schemas.WalletSchema.parse(data);
    return {
      coins: wallet.coins,
      gems: wallet.gems
    };
  }

  /**
   * Get the current authenticated user's ID from Supabase Auth.
   * Repository-level accessor so service code does not touch the client directly.
   */
  async function getCurrentUserId() {
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  }
  async function spendCurrencyRpc(params) {
    const parsed = _schemas.SpendCurrencyRpcInputSchema.parse(params);
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      data,
      error
    } = await supabase.rpc('spend_currency_idempotent', {
      p_user_id: parsed.userId,
      p_currency: parsed.currency,
      p_amount: parsed.amount,
      p_sink: parsed.sink,
      p_idempotency_key: parsed.idempotencyKey ?? buildCurrencyIdempotencyKey({
        userId: parsed.userId,
        currency: parsed.currency,
        amount: parsed.amount,
        operation: parsed.sink
      })
    });
    if (error) {
      throw new _libRepositoryErrorHandling.RepositoryError('spendCurrencyRpc', error);
    }
    return _schemas.CurrencyRpcResultSchema.parse(data);
  }
  async function grantCurrencyRpc(params) {
    const parsed = _schemas.GrantCurrencyRpcInputSchema.parse(params);
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      data,
      error
    } = await supabase.rpc('grant_currency_idempotent', {
      p_user_id: parsed.userId,
      p_currency: parsed.currency,
      p_amount: parsed.amount,
      p_source: parsed.source,
      p_idempotency_key: parsed.idempotencyKey ?? buildCurrencyIdempotencyKey({
        userId: parsed.userId,
        currency: parsed.currency,
        amount: parsed.amount,
        operation: parsed.source,
        sourceId: parsed.sourceId ?? null
      }),
      p_source_id: parsed.sourceId ?? null,
      p_description: parsed.description ?? null
    });
    if (error) {
      throw new _libRepositoryErrorHandling.RepositoryError('grantCurrencyRpc', error);
    }
    return _schemas.CurrencyRpcResultSchema.parse(data);
  }
  async function addCurrencyRpc(params) {
    const parsed = _schemas.AddCurrencyRpcParamsSchema.parse(params);
    const supabase = (0, _configSupabase.getSupabaseClient)();
    const {
      error
    } = await supabase.rpc('grant_currency_idempotent', {
      p_user_id: parsed.userId,
      p_currency: parsed.currency,
      p_amount: parsed.amount,
      p_source: parsed.source,
      p_idempotency_key: parsed.idempotencyKey ?? buildCurrencyIdempotencyKey({
        userId: parsed.userId,
        currency: parsed.currency,
        amount: parsed.amount,
        operation: parsed.source
      })
    });
    if (error) {
      throw new _libRepositoryErrorHandling.RepositoryError('addCurrencyRpc', error);
    }
  }
  function buildCurrencyIdempotencyKey(input) {
    return ['economy', input.operation, input.userId, input.currency, input.amount.toString(), input.sourceId ?? 'none'].join(':');
  }
},3333,[1726,3586,2064,2068]);
__d(function (global, require, _$$_IMPORT_DEFAULT, _$$_IMPORT_ALL, module, exports, _dependencyMap) {
  "use strict";

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, "CurrencyRpcResultSchema", {
    enumerable: true,
    get: function () {
      return CurrencyRpcResultSchema;
    }
  });
  Object.defineProperty(exports, "WalletSchema", {
    enumerable: true,
    get: function () {
      return WalletSchema;
    }
  });
  Object.defineProperty(exports, "CurrencyTypeSchema", {
    enumerable: true,
    get: function () {
      return CurrencyTypeSchema;
    }
  });
  Object.defineProperty(exports, "SpendInputSchema", {
    enumerable: true,
    get: function () {
      return SpendInputSchema;
    }
  });
  Object.defineProperty(exports, "CurrencyGrantSchema", {
    enumerable: true,
    get: function () {
      return CurrencyGrantSchema;
    }
  });
  Object.defineProperty(exports, "SpendCurrencyRpcInputSchema", {
    enumerable: true,
    get: function () {
      return SpendCurrencyRpcInputSchema;
    }
  });
  Object.defineProperty(exports, "GrantCurrencyRpcInputSchema", {
    enumerable: true,
    get: function () {
      return GrantCurrencyRpcInputSchema;
    }
  });
  Object.defineProperty(exports, "AddCurrencyRpcParamsSchema", {
    enumerable: true,
    get: function () {
      return AddCurrencyRpcParamsSchema;
    }
  });
  var _zod = require(_dependencyMap[0]);
  const CurrencyRpcResultSchema = _zod.z.object({
    success: _zod.z.boolean(),
    new_balance: _zod.z.number().optional()
  });
  const WalletSchema = _zod.z.object({
    id: _zod.z.string().uuid(),
    user_id: _zod.z.string().uuid(),
    coins: _zod.z.number().int().min(0).default(0),
    gems: _zod.z.number().int().min(0).default(0),
    created_at: _zod.z.number(),
    updated_at: _zod.z.number()
  });
  const CurrencyTypeSchema = _zod.z.enum(['COINS', 'GEMS', 'XP', 'SEASONAL', 'FOCUS_POINTS']);
  const SpendInputSchema = _zod.z.object({
    userId: _zod.z.string().uuid(),
    currency: CurrencyTypeSchema,
    amount: _zod.z.number().int().positive(),
    sink: _zod.z.string().min(1),
    description: _zod.z.string().optional(),
    metadata: _zod.z.record(_zod.z.unknown()).optional()
  });
  const CurrencyGrantSchema = _zod.z.object({
    userId: _zod.z.string().uuid(),
    amount: _zod.z.number().int().positive(),
    currency: CurrencyTypeSchema,
    source: _zod.z.string().min(1),
    sourceId: _zod.z.string().nullable().optional(),
    description: _zod.z.string().optional(),
    skipEvents: _zod.z.boolean().optional(),
    metadata: _zod.z.record(_zod.z.unknown()).optional()
  });
  const SpendCurrencyRpcInputSchema = _zod.z.object({
    userId: _zod.z.string().uuid(),
    currency: CurrencyTypeSchema,
    amount: _zod.z.number().int().positive().max(1_000_000),
    sink: _zod.z.string().min(1),
    idempotencyKey: _zod.z.string().min(1).optional()
  });
  const GrantCurrencyRpcInputSchema = _zod.z.object({
    userId: _zod.z.string().uuid(),
    currency: CurrencyTypeSchema,
    amount: _zod.z.number().int().positive().max(1_000_000),
    source: _zod.z.string().min(1),
    sourceId: _zod.z.string().nullable().optional(),
    description: _zod.z.string().nullable().optional(),
    idempotencyKey: _zod.z.string().min(1).optional()
  });
  const AddCurrencyRpcParamsSchema = _zod.z.object({
    userId: _zod.z.string().uuid(),
    currency: CurrencyTypeSchema,
    amount: _zod.z.number().int().positive().max(1_000_000),
    source: _zod.z.string().min(1),
    idempotencyKey: _zod.z.string().min(1).optional()
  });
},3586,[1774]);