import { resolve, basename } from "node:path";
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
    srcMin: string;
}

function readGalleryImages(): GalleryImage[] {
    const images = [
        ...readdirSync(resolve(__dirname, "src/assets/images/gallery")),
    ];
    return [...images.filter((src) => !src.endsWith(".min.webp"))]
        .sort()
        .map((src) => ({
            src: `/assets/images/gallery/${src}`,
            alt: ALTS[src],
            srcMin: `/assets/images/gallery/${basename(src, ".webp")}.min.webp`,
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
    plugins: [
        nunjucksPlugin({
            templatesDir: resolve(__dirname, "src"),
            nunjucksConfigure: { noCache: true },
            nunjucksEnvironment: nunjucksEnv,
            variables: {
                "index.html": {
                    DATA: {
                        ...DATA,
                        galleryImages: readGalleryImages(),
                        workflowImages: readWorkflowImages(),
                    },
                },
            },
        }),
        ViteMinifyPlugin({}),
    ],
});
