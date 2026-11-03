'use strict';
// Strip credentials from anything sent to a client. Never mutates stored data.
const SECRET_KEY = /^(pass|passwd|password|pwd|secret|client_?secret|api_?key|access_?token|refresh_?token|auth_?token|id_?token|bearer|token|session(_?token)?|cookies?|private_?key|secret_?key|signing_?key|seed(_?phrase)?|mnemonic|otp|totp(_?secret)?|recovery_?codes?|webhook_?secret|app_?password)$/i;
const SECRET_SUFFIX = /(password|passwd|secret|privatekey|private_key|apikey|api_key|accesstoken|access_token|refreshtoken|refresh_token|authtoken|auth_token|sessiontoken|mnemonic|seedphrase)$/i;
const SECRET_VALUE = /\b(sk_(live|test)_[A-Za-z0-9]{8,}|rk_live_[A-Za-z0-9]{8,}|whsec_[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AIza[0-9A-Za-z_-]{30,}|xox[abprs]-[A-Za-z0-9-]{10,}|nfp_[A-Za-z0-9]{20,})\b/g;

const SECRET_VALUE_TEST = new RegExp(SECRET_VALUE.source);

function isSecretKey(k) { return SECRET_KEY.test(k) || SECRET_SUFFIX.test(k); }

function redactSecrets(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') {
    return typeof value === 'string' && SECRET_VALUE_TEST.test(value) ? value.replace(SECRET_VALUE, '[redacted]') : value;
  }
  if (seen.has(value)) return seen.get(value);
  if (typeof value.toJSON === 'function' && !(value instanceof Array)) return redactSecrets(value.toJSON(), seen);
  const out = Array.isArray(value) ? [] : {};
  seen.set(value, out);
  for (const k of Object.keys(value)) {
    const v = value[k];
    if (!Array.isArray(value) && isSecretKey(k)) {
      if (v !== undefined && v !== null && v !== '') {
        const flag = 'has' + k.charAt(0).toUpperCase() + k.slice(1);
        if (!(flag in value)) out[flag] = true;
      }
      continue;
    }
    out[k] = redactSecrets(v, seen);
  }
  return out;
}

function safeStringify(value, ...rest) { return JSON.stringify(redactSecrets(value), ...rest); }

module.exports = { redactSecrets, safeStringify, isSecretKey };
