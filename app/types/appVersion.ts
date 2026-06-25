export interface VersionCheckResponse {
  updateType: "none" | "soft" | "hard" | "maintenance";
  latestVersion: string;
  minSupportedVersion: string;
  storeUrl: string;
  title: string;
  message: string;
}
