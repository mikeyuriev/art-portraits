import { join, resolve } from "node:path";
import { readdirSync } from "node:fs";
import { defineConfig } from "vite";
import nunjucksPlugin from "vite-plugin-nunjucks";
import nunjucks from "nunjucks";
import nunjucksMarkdown from "nunjucks-markdown";
import { marked } from "marked";
import { ViteMinifyPlugin } from "vite-plugin-minify";

import * as DATA from "./src/data.json";
import * as ALTS from "./src/gallery.json";

const nunjucksEnv = nunjucks.configure({ noCache: true });
nunjucksMarkdown.register(nunjucksEnv, marked);

interface GalleryImage {
    src: string;
    alt: string;
}

function readGalleryImages(key: string): GalleryImage[] {
    const images = [
        ...readdirSync(resolve(__dirname, "src/assets/images/gallery", key)),
    ];
    return [...images.filter((src) => !src.endsWith(".min.webp"))]
        .sort()
        .map((src) => ({
            src: join("/assets/images/gallery/", key, src),
            alt:
                key in ALTS && src in ALTS[key]
                    ? ALTS[key][src]
                    : "Портрет по фото",
        }));
}

function readWorkflowImages(): string[] {
    return [...readdirSync(resolve(__dirname, "src/assets/images/workflow"))]
        .sort()
        .map((src) => `/assets/images/workflow/${src}`);
}

export default defineConfig({
    root: "src",
    server: {
        watch: {
            usePolling: true,
        },
    },
    build: {
        outDir: "../build",
        rollupOptions: {
            input: {
                main: resolve(__dirname, "src/index.html"),
            },
        },
    },
    resolve: {
        alias: {
            "~": resolve(__dirname, "src"),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler",
            },
        },
    },
    plugins: [
        nunjucksPlugin({
            templatesDir: resolve(__dirname, "src"),
            nunjucksConfigure: { noCache: true },
            nunjucksEnvironment: nunjucksEnv,
            variables: {
                "index.html": {
                    DATA: {
                        ...DATA,
                        galleryImages: {
                            top: readGalleryImages("top"),
                            bottom: readGalleryImages("bottom"),
                        },
                        workflowImages: readWorkflowImages(),
                    },
                },
            },
        }),
        ViteMinifyPlugin({}),
    ],
});
