
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.11.0";
import { build, stop } from "npm:esbuild@0.24.0";

/** builds and bundles an entrypoint into a single ESM output. */
export async function buildIt() {
    await build({
        plugins: [...denoPlugins({})],
        entryPoints: ["./src/main.ts"],
        outfile: "./dist/bundle.js",
        bundle: true,
        minify: false,
        keepNames: true, 
        banner: { js: `// @ts-nocheck
// deno-lint-ignore-file`},
        format: "esm"
    }).catch((e: Error) => console.info(e));
    stop();
}

buildIt()
console.log('bundle.js was built!')