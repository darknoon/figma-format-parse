// @ts-check
const { build } = require("esbuild");
// @ts-ignore
const { dependencies, peerDependencies } = require("./package.json");
const { Generator, ELogLevel } = require("npm-dts");

// Following this guide https://souporserious.com/bundling-typescript-with-esbuild-for-npm/

new Generator(
  {
    entry: "index.ts",
    output: "dist/index.d.ts",
    logLevel: ELogLevel.warn,
  },
  true,
  true
)
  .generate()
  .then(() => console.log("Finished gen"));

const external = Object.keys(dependencies ?? {}).concat(
  Object.keys(peerDependencies ?? {})
);

const shared = {
  entryPoints: ["index.ts"],
  external,
  bundle: true,
};

build({
  ...shared,
  outfile: "dist/index.js",
});
build({ ...shared, format: "esm", outfile: "dist/index.esm.js" });
