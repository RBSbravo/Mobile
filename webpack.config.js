const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add polyfills
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
    process: require.resolve('process/browser'),
    vm: require.resolve('vm-browserify'),
    '@react-native-vector-icons/material-design-icons': require.resolve('@expo/vector-icons/MaterialCommunityIcons'),
  };

  // Add plugins
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    
    // Define environment variables
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.mode || 'development'),
      'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || 'https://backend-ticketing-system.up.railway.app'),
    }),

    // Optimize chunks
    new webpack.optimize.SplitChunksPlugin({
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    })
  );

  // Add alias for vector icons
  config.resolve.alias = {
    ...config.resolve.alias,
    '@react-native-vector-icons/material-design-icons': '@expo/vector-icons/MaterialCommunityIcons',
  };

  // Performance optimizations
  if (env.mode === 'production') {
    // Enable source maps for production debugging
    config.devtool = 'source-map';
    
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
      minimize: true,
    };

    // Add compression
    config.plugins.push(
      new webpack.BannerPlugin({
        banner: 'MITO Task Manager PWA v2.0',
        raw: false,
        entryOnly: true,
      })
    );
  }

  // Add performance hints
  config.performance = {
    hints: env.mode === 'production' ? 'warning' : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  };

  // Optimize module resolution
  config.resolve.modules = [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'node_modules'),
  ];

  // Ensure proper PWA support
  config.output = {
    ...config.output,
    publicPath: '/',
    clean: true,
  };

  return config;
}; 