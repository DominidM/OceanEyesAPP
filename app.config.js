const appJson = require('./app.json');

const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const withGoogleMapsApiKey = require('./plugins/with-google-maps-api-key.js');

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
    plugins: [...plugins, withGoogleMapsApiKey],
    owner: 'solvegrades',
    extra: {
      ...(appJson.expo.extra ?? {}),
      eas: {
        ...(appJson.expo.extra?.eas ?? {}),
        projectId: '2d52637a-7a67-4895-b090-af2792925e6b',
      },
    },
  },
};
