import * as esbuild from "esbuild";

let ctx = await esbuild.context({
  entryPoints: ["src/index.tsx"],
  outdir: "../../dist/webview-ui/assets",
  bundle: true,
  minify: true,
  sourcemap: "inline",
  platform: "browser",
  define: {
    global: "window",
  },
  logLevel: "info",
});

switch (process.argv[2]) {
  case "watch":
    ctx.watch();
    break;
  case "build" | undefined:
    ctx.rebuild();
  default:
    console.error(`unknown command: ${process.argv[2]}`);
    process.exit(1);
}
