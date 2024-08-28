import { resolve, basename } from "node:path";
import { readdirSync } from "node:fs";
import { defineConfig } from "vite";
import nunjucksPlugin from "vite-plugin-nunjucks";
import nunjucks from "nunjucks";
import nunjucksMarkdown from "nunjucks-markdown";
import { marked } from "marked";
import { ViteMinifyPlugin } from "vite-plugin-minify";

import * as DATA from "./src/data.json";

const nunjucksEnv = nunjucks.configure({ noCache: true });
nunjucksMarkdown.register(nunjucksEnv, marked);

interface GalleryImage {
    src: string;
    srcMin: string;
}

function readGalleryImages(): GalleryImage[] {
    const galleryImages = [
        ...readdirSync(resolve(__dirname, "src/assets/images/gallery")),
    ];
    return [...galleryImages.filter((src) => !src.endsWith(".min.webp"))]
        .sort()
        .map((src) => ({
            src: `/assets/images/gallery/${src}`,
            srcMin: `/assets/images/gallery/${basename(src, ".webp")}.min.webp`,
        }));
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
                    DATA: { ...DATA, galleryImages: readGalleryImages() },
                },
            },
        }),
        ViteMinifyPlugin({}),
    ],
});
