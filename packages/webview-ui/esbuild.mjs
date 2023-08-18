import * as esbuild from "esbuild";

let ctx = await esbuild.context({
  entryPoints: ["src/index.tsx"],
  format: "esm", // esm needed for top-level await
  outdir: "../../dist/webview-ui/assets",
  bundle: true,
  minifyWhitespace: true,
  sourcemap: "inline",
  platform: "browser",
  define: {
    global: "window",
  },
  logLevel: "info",
  external: ["web-worker"], // needed because of elkjs
});

switch (process.argv[2]) {
  case "watch":
    ctx.watch();
    break;

  case "build" | undefined:
    ctx.rebuild();
    break;

  default:
    console.error(`unknown command: ${process.argv[2]}`);
    process.exit(1);
}
