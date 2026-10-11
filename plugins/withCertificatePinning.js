/**
 * Certificate Pinning Config Plugin
 *
 * Adds SSL/TLS certificate pinning configuration for iOS and Android.
 * 
 * Usage in app.json:
 *   ["./plugins/withCertificatePinning", {
 *     "domains": {
 *       "supabase.co": {
 *         "pins": ["sha256/<leaf-cert-hash>", "sha256/<intermediate-cert-hash>"],
 *         "includeSubdomains": true
 *       }
 *     }
 *   }]
 *
 * IMPORTANT: Replace the placeholder pins with actual certificate pins.
 * To get Supabase's certificate pins:
 *   openssl sdb -connect <project>.supabase.co:443 2>/dev/null | openssl x509 -pubkey -noout | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -binary | openssl enc -base64
 *
 * Pin rotation: Update pins BEFORE certificates expire (check cert expiry with openssl s_client).
 */

const {
  withInfoPlist,
  withAndroidManifest,
  withDangerousMod,
  createRunOncePlugin,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const { z } = require('zod');

const pinSchema = z.string().regex(/^sha256\/[A-Za-z0-9+/]{43}=$/);
const domainsSchema = z.record(
  z.string().regex(/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/),
  z.object({
    pins: z.array(pinSchema).min(2),
    caPins: z.array(pinSchema).min(1),
    includeSubdomains: z.boolean().default(true),
  }),
);

function withCertificatePinning(config, props = {}) {
  const domains = domainsSchema.parse(props.domains ?? {});

  // iOS: Configure App Transport Security with certificate pins
  config = withInfoPlist(config, (config) => {
    const ats = config.modResults.NSAppTransportSecurity || {};
    
    ats.NSAllowsArbitraryLoads = false;
    ats.NSAllowsLocalNetworking = true;
    
    const exceptionDomains = ats.NSExceptionDomains || {};
    const pinnedDomains = ats.NSPinnedDomains || {};
    
    for (const [domain, settings] of Object.entries(domains)) {
      exceptionDomains[domain] = {
        NSIncludesSubdomains: settings.includeSubdomains ?? true,
        NSRequiresCertificateTransparency: true,
        NSExceptionAllowsInsecureHTTPLoads: false,
        NSExceptionRequiresForwardSecrecy: true,
      };
      pinnedDomains[domain] = {
        NSIncludesSubdomains: settings.includeSubdomains,
        NSPinnedCAIdentities: settings.caPins.map((pin) => ({
          'SPKI-SHA256-BASE64': pin.replace(/^sha256\//, ''),
        })),
      };
    }
    
    ats.NSExceptionDomains = exceptionDomains;
    ats.NSPinnedDomains = pinnedDomains;
    config.modResults.NSAppTransportSecurity = ats;
    
    return config;
  });

  // Android: Configure network security config with certificate pins
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    if (mainApplication) {
      mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    }
    return config;
  });

  // Android: Create the actual network_security_config.xml resource file
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const resDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'xml',
      );

      // Ensure res/xml directory exists
      if (!fs.existsSync(resDir)) {
        fs.mkdirSync(resDir, { recursive: true });
      }

      // Build <domain-config> entries from the configured pins
      const domainConfigs = Object.entries(domains)
        .map(([domain, settings]) => {
          const pins = (settings.pins || [])
            .map((pin) => {
              // Strip "sha256/" prefix if present and format as base64 hash
              const hash = pin.replace(/^sha256\//, '');
              return `      <pin digest="SHA-256">${hash}</pin>`;
            })
            .join('\n');

          const includeSubdomains = settings.includeSubdomains !== false;

          return [
            '    <domain-config>',
            `      <domain includeSubdomains="${includeSubdomains}">${domain}</domain>`,
            '      <pin-set>',
            pins,
            '      </pin-set>',
            '      <trust-anchors>',
            '        <certificates src="system" />',
            '      </trust-anchors>',
            '    </domain-config>',
          ].join('\n');
        })
        .join('\n\n');

      const xml = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<network-security-config>',
        '  <base-config cleartextTrafficPermitted="false">',
        '    <trust-anchors>',
        '      <certificates src="system" />',
        '    </trust-anchors>',
        '  </base-config>',
        '',
        domainConfigs,
        '</network-security-config>',
      ].join('\n');

      const xmlPath = path.join(resDir, 'network_security_config.xml');
      fs.writeFileSync(xmlPath, xml, 'utf8');

      return config;
    },
  ]);

  return config;
}

module.exports = createRunOncePlugin(withCertificatePinning, 'withCertificatePinning', '1.0.0');
