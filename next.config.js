const path = require('path');
const { withExpo } = require("@expo/next-adapter");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer(
  withExpo({
    reactStrictMode: true,
    swcMinify: true,
    transpilePackages: [
      "react-native",
      "react-native-web",
      "expo",
      "expo-font",
      "expo-asset",
      "react-native-vector-icons",
      "@expo/vector-icons",
      "@react-native/assets-registry",
      "expo-modules-core",
      "react-native-super-grid",
      "@expo/next-adapter",
      "react-image-gallery"
    ],
    experimental: {
      forceSwcTransforms: true,
      optimizePackageImports: [
        "react-native-vector-icons",
        "@expo/vector-icons",
        "@react-native/assets-registry",
        "expo-modules-core"
      ],
    },
    eslint: {
      // Specify directories to lint
      dirs: ['pages', 'components', 'lib'], // Add your directories here
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
    webpack: (config, { isServer }) => {
      // Handle .ttf files for fonts
      config.module.rules.push({
        test: /\.ttf$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192,
            fallback: 'file-loader',
            publicPath: `/_next/static/fonts/`,
            outputPath: `${isServer ? "../" : ""}static/fonts/`,
            name: '[name]-[hash].[ext]',
          },
        },
      });

      // Babel loader for @react-native/assets-registry
      config.module.rules.push({
        test: /\.js$/,
        include: /node_modules[\\\/]@react-native[\\\/]assets-registry/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['module:metro-react-native-babel-preset'],
            plugins: ['@babel/plugin-transform-flow-strip-types'],
          },
        },
      });

      // Alias the native file to your stub
      config.resolve.alias = {
        ...config.resolve.alias,
        "expo-asset/build/Asset.fx": path.resolve(__dirname, "stubs/Asset.fx.js"),
      };

      return config;
    },
  })
);

module.exports = nextConfig;
