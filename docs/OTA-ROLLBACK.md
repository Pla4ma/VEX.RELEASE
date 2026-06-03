# OTA Update & Rollback Procedure

## Channels
| Channel | Purpose | Build Profile |
|---------|---------|---------------|
| `development` | Local dev builds | `development` / `development-simulator` |
| `preview` | Staging / internal test | `preview` |
| `production` | App Store release | `production` |

## Pushing an Update
```bash
# Staging
eas update --branch preview --message "Fix: description of fix"

# Production
eas update --branch production --message "Fix: description of fix"
```

## Rolling Back
```bash
# List recent updates for the channel
eas update:list --channel production

# Roll back to a specific update
eas update --branch production --republish --message "rollback to <update-id>" --input-dir "<update-id>"

# Or republish a specific known-good update
eas update --branch production --republish
```

## Force Update (Minimum Version)
In `app.json`, set a minimum runtime version when critical fixes ship:
```json
"runtimeVersion": { "policy": "nativeVersion" }
```
Users on older native builds will be prompted to update from the App Store.

## Testing Rollback
1. Push an update to `preview`
2. Verify it loads on a preview build
3. Roll back the `preview` channel
4. Verify the previous version loads
5. Never test rollback on `production` directly
