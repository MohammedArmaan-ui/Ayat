// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 1. Add support for .wasm files
config.resolver.assetExts.push('wasm');

// 2. Add support for .mjs and .wasm files in sourceExts
config.resolver.sourceExts.push('mjs', 'wasm');

// 3. Add COEP and COOP headers to support SharedArrayBuffer
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless'); // or 'require-corp'
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return middleware(req, res, next);
  };
};

module.exports = config;
