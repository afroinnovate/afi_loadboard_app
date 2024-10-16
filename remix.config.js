/** @type {import('@remix-run/dev').AppConfig} */
export default {
  v2_normalizeFormMethod: true,
  ignoredRouteFiles: ["**/.*"],
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  browserNodeBuiltinsPolyfill: {
    modules: {
      fs: true,
      net: true,
      path: true,
    },
  },
};
