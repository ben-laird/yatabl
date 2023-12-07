import { build, emptyDir } from "https://deno.land/x/dnt@0.39.0/mod.ts";

const outDir = "./build";

await emptyDir(outDir);

await build({
  entryPoints: ["./src/index.ts"],
  outDir,
  package: {
    name: "yatabl",
    version: Deno.args[0],
    description:
      "Yet another tagging and branding library. Safety, dx, and perf conscious!",
    keywords: [
      "yatabl",
      "tagging",
      "branding",
      "validation",
      "safe",
      "safety",
      "schema validation",
      "schema",
    ],
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/ben-laird/yatabl.git",
    },
    bugs: {
      url: "https://github.com/ben-laird/yatabl/issues",
    },
  },
  postBuild() {
    copyToOutDir("LICENSE.md");
    copyToOutDir("README.md");
  },

  scriptModule: "cjs",
  packageManager: "pnpm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
});

function copyToOutDir(path: string) {
  Deno.copyFileSync(path, `${outDir}/${path}`);
}
