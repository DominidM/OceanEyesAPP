const appJson = require('./app.json');

const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

const isGoogleSignInPlugin = (plugin) => {
  if (typeof plugin === 'string') {
    return plugin === '@react-native-google-signin/google-signin';
  }
  if (Array.isArray(plugin)) {
    return plugin[0] === '@react-native-google-signin/google-signin';
  }
  return !!(plugin && typeof plugin === 'object' && 'iosurlscheme' in plugin);
};

const plugins = (appJson.expo.plugins ?? []).filter((plugin) => !isGoogleSignInPlugin(plugin));

if (googleIosClientId) {
  plugins.push([
    '@react-native-google-signin/google-signin',
    { iosUrlScheme: `com.googleusercontent.apps.${googleIosClientId}` },
  ]);
}

module.exports = {
  expo: {
    ...appJson.expo,
    plugins,
  },
};
