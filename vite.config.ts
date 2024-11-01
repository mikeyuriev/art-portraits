import { join, resolve } from "node:path";
import { readdirSync } from "node:fs";
import { defineConfig } from "vite";
import nunjucksPlugin from "vite-plugin-nunjucks";
import nunjucks from "nunjucks";
import nunjucksMarkdown from "nunjucks-markdown";
import { marked } from "marked";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import imageSize from "image-size";

import * as DATA from "./src/data.json";
import * as ALTS from "./src/gallery.json";

const nunjucksEnv = nunjucks.configure({ noCache: true });
nunjucksMarkdown.register(nunjucksEnv, marked);

interface GalleryImage {
    src: string;
    width: number | undefined;
    height: number | undefined;
    sizeAttrs: string;
    alt: string;
}

function readGalleryImages(key: string): GalleryImage[] {
    const images = [
        ...readdirSync(resolve(__dirname, "src/assets/images/gallery", key)),
    ];
    return images.sort().map((src) => {
        
        const size = imageSize(
            resolve(__dirname, "src/assets/images/gallery", key, src),
        );
        const alt: string =
            key in ALTS && src in ALTS[key]
                ? ALTS[key][src]
                : "Портрет по фото";
        const widthAttr: string = size.width ? `width=${size.width}` : "";
        const heightAttr: string = size.height ? `height=${size.height}` : "";
        return {
            src: join("/assets/images/gallery/", key, src),
            width: size.width,
            height: size.height,
            sizeAttrs: `${widthAttr} ${heightAttr}`,
            alt,
        };
    });
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
                        gallery: {
                            images: {
                                top: readGalleryImages("top"),
                                bottom: readGalleryImages("bottom"),
                            },
                        },
                        workflowImages: readWorkflowImages(),
                    },
                },
            },
        }),
        ViteMinifyPlugin({}),
    ],
});
