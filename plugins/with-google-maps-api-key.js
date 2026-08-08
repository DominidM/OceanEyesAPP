const {
  withAndroidManifest,
} = require('@expo/config-plugins');

const MAPS_API_KEY_ENV = 'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY';

const withGoogleMapsApiKey = (config) =>
  withAndroidManifest(config, (configWithManifest) => {
    const apiKey = process.env[MAPS_API_KEY_ENV];

    if (!apiKey) {
      return configWithManifest;
    }

    const manifest = configWithManifest.modResults;
    const application = manifest.manifest.application?.[0];

    if (!application) {
      return configWithManifest;
    }

    const metaData = Array.isArray(application['meta-data']) ? application['meta-data'] : [];
    const existingIndex = metaData.findIndex(
      (item) =>
        item.$?.['android:name'] === 'com.google.android.geo.API_KEY',
    );

    const entry = {
      $: {
        'android:name': 'com.google.android.geo.API_KEY',
        'android:value': apiKey,
      },
    };

    if (existingIndex >= 0) {
      metaData[existingIndex] = entry;
    } else {
      metaData.push(entry);
    }

    application['meta-data'] = metaData;

    return configWithManifest;
  });

module.exports = withGoogleMapsApiKey;
