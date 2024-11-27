
import * as esbuild from "https://deno.land/x/esbuild@v0.20.1/mod.js";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.9.0/mod.ts";

/** builds and bundles an entrypoint into a single ESM output. */
export async function buildIt() {
    await esbuild.build({
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
    esbuild.stop();
}

buildIt()
console.log('bundle.js was built!')