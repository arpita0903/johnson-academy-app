import Constants from "expo-constants";

// for andriod
// http://10.0.2.2:8000/v1

const ENV = {
  development: {
    API_BASE_URL: "https://johnson-academy-be-latest-1.onrender.com/v1",
    API_TIMEOUT: 10000,
    DEBUG: true,
  },
  preview: {
    API_BASE_URL: "https://johnson-academy-be-latest-1.onrender.com/v1",
    API_TIMEOUT: 15000,
    DEBUG: false,
  },
  production: {
    API_BASE_URL: "https://johnson-academy-be-latest-1.onrender.com/v1",
    API_TIMEOUT: 20000,
    DEBUG: false,
  },
};

const getEnvironmentConfig = () => {
  const releaseChannel =
    Constants.expoConfig?.extra?.releaseChannel || "development";

  if (releaseChannel.includes("production")) {
    return ENV.production;
  } else if (releaseChannel.includes("preview")) {
    return ENV.preview;
  } else {
    return ENV.development;
  }
};

export const config = getEnvironmentConfig();
export default config;
