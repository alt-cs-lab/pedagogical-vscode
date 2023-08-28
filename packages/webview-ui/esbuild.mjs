import * as esbuild from "esbuild";

const options = {
  entryPoints: ["src/index.tsx"],
  format: "esm", // esm needed for top-level await
  outdir: "../../dist/webview-ui/assets",
  bundle: true,
  minifyWhitespace: true,
  platform: "browser",
  define: {
    global: "window",
  },
  logLevel: "info",
  external: ["web-worker"], // needed because of elkjs
};

switch (process.argv[2]) {
  case "watch":
    const ctx = await esbuild.context({
      ...options,
      sourcemap: "inline",
    });
    await ctx.watch();
    break;

  case "build" || undefined:
    try {
      await esbuild.build({
        ...options,
        minify: true,
      });
    } catch {
      process.exit(1);
    }
    break;

  default:
    console.error(`unknown command: ${process.argv[2]}`);
    process.exit(1);
}
