import * as esbuild from "esbuild";

const options = {
  entryPoints: ["src/extension.ts"],
  outdir: "../../dist/extension",
  bundle: true,
  platform: "node",
  target: "esnext",
  logLevel: "info",
  external: ["vscode"],
  alias: { shared: "../shared/src" },
};

const watchOptions = {
  ...options,
  sourcemap: true,

  // only minify whitespace when doing watch builds
  // minifying everything will also shorten variable names, making it harder to debug
  minifyWhitespace: true,
};

const buildOptions = {
  ...options,
  minify: true,
};

// valid arguments are `build` (default) or `watch`
switch (process.argv[2]) {
  case undefined:
  case "build":
    try {
      await esbuild.build(buildOptions);
    } catch {
      process.exit(1);
    }
    break;

  case "watch":
    const ctx = await esbuild.context(watchOptions);
    await ctx.watch();
    break;

  default:
    console.error(`unknown command: ${process.argv[2]}`);
    process.exit(1);
}
