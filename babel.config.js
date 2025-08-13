module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      '@babel/plugin-transform-export-namespace-from',
      {
        allowComputed: true,
      },
    ],
    [
      'module-resolver',
      {
        alias: {
          'react-native': 'react-native',
          'react-native/Libraries/Utilities/codegenNativeComponent': 'react-native/Libraries/Utilities/codegenNativeComponent',
        },
      },
    ],
    'react-native-reanimated/plugin', // ✅ this should be the last plugin
  ],
};
