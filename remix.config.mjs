import { defineConfig } from "@remix-run/dev";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

export default defineConfig({
  v2_normalizeFormMethod: true,
  ignoredRouteFiles: ["**/.*"],
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  serverDependenciesToBundle: ["geoip-lite", "moment-timezone"],
  webpack: (config) => {
    config.plugins.push(new NodePolyfillPlugin());
    return config;
  },
});