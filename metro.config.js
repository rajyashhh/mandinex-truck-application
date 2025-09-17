// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// tell Metro to transform .svg into React components
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...config.resolver,
  // remove svg from assetExts if present
  assetExts: config.resolver.assetExts.filter(ext => ext !== "svg"),
  // add svg to sourceExts so transformer handles them
  sourceExts: [...config.resolver.sourceExts, "svg"],
};

module.exports = config;