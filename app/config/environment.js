import Constants from "expo-constants";

const DEFAULT_ENV = "development";

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value, fallback) => {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === "true";
};

const ENV = {
  development: {
    API_BASE_URL:
      process.env.EXPO_PUBLIC_DEV_API_BASE_URL ||
      "https://apiv2.johnsonsacademy.online/v1",
    API_TIMEOUT: 10000,
    DEBUG: true,
  },
  preview: {
    API_BASE_URL:
      process.env.EXPO_PUBLIC_PREVIEW_API_BASE_URL ||
      "https://apiv2.johnsonsacademy.online/v1",
    API_TIMEOUT: 15000,
    DEBUG: false,
  },
  production: {
    API_BASE_URL:
      process.env.EXPO_PUBLIC_PROD_API_BASE_URL ||
      "https://apiv2.johnsonsacademy.online/v1",
    API_TIMEOUT: 20000,
    DEBUG: false,
  },
};

const getEnvironmentConfig = () => {
  const appEnv =
    process.env.EXPO_PUBLIC_APP_ENV ||
    process.env.APP_ENV ||
    Constants.expoConfig?.extra?.releaseChannel ||
    DEFAULT_ENV;

  const normalizedEnv = String(appEnv).toLowerCase();

  let selectedEnv = ENV.development;
  if (normalizedEnv.includes("production")) {
    selectedEnv = ENV.production;
  } else if (normalizedEnv.includes("preview")) {
    selectedEnv = ENV.preview;
  }

  return {
    ...selectedEnv,
    API_BASE_URL:
      process.env.EXPO_PUBLIC_API_BASE_URL || selectedEnv.API_BASE_URL,
    API_TIMEOUT: parseNumber(
      process.env.EXPO_PUBLIC_API_TIMEOUT,
      selectedEnv.API_TIMEOUT,
    ),
    DEBUG: parseBoolean(process.env.EXPO_PUBLIC_DEBUG, selectedEnv.DEBUG),
  };
};

export const config = getEnvironmentConfig();
export default config;
