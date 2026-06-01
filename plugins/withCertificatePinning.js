/**
 * Certificate Pinning Config Plugin
 *
 * Adds SSL/TLS certificate pinning configuration for iOS and Android.
 * 
 * Usage in app.json:
 *   ["./plugins/withCertificatePinning", {
 *     "domains": {
 *       "supabase.co": {
 *         "pins": ["sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
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

const { withInfoPlist, withAndroidManifest, createRunOncePlugin } = require('@expo/config-plugins');

function withCertificatePinning(config, props = {}) {
  const { domains = {} } = props;

  // iOS: Configure App Transport Security with certificate pins
  config = withInfoPlist(config, (config) => {
    const ats = config.modResults.NSAppTransportSecurity || {};
    
    ats.NSAllowsArbitraryLoads = false;
    ats.NSAllowsLocalNetworking = true;
    
    const exceptionDomains = ats.NSExceptionDomains || {};
    
    for (const [domain, settings] of Object.entries(domains)) {
      exceptionDomains[domain] = {
        NSIncludesSubdomains: settings.includeSubdomains ?? true,
        NSRequiresCertificateTransparency: true,
        NSExceptionAllowsInsecureHTTPLoads: false,
        NSExceptionRequiresForwardSecrecy: true,
      };
    }
    
    ats.NSExceptionDomains = exceptionDomains;
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

  return config;
}

module.exports = createRunOncePlugin(withCertificatePinning, 'withCertificatePinning', '1.0.0');
