/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["fig-kiwi"],
  webpack: (config, { isServer }) => {
    // experiments.asyncWebAssembly: true
    config.experiments = { ...config.experiments, asyncWebAssembly: true }
    // config.module.rules = [
    //   ...config.module.rules,
    //   {
    //     test: /\.wasm$/,
    //     type: "webassembly/experimental",
    //   },
    // ]
    return config
  },
}

module.exports = nextConfig
