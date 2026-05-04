"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const videos_utils_1 = require("./videos.utils");
let VideosService = class VideosService {
    getVideos() {
        try {
            const rutaArchivo = (0, path_1.join)(__dirname, '..', '..', 'data', 'mock-youtube-api.json');
            const { items } = JSON.parse((0, fs_1.readFileSync)(rutaArchivo, 'utf-8'));
            return items
                .map((elemento) => ({
                id: elemento.id,
                thumbnail: elemento.snippet.thumbnails.high.url,
                title: elemento.snippet.title,
                author: elemento.snippet.channelTitle,
                publishedAt: (0, videos_utils_1.relativeTime)(elemento.snippet.publishedAt),
                hype: (0, videos_utils_1.hypeLevel)(elemento),
            }))
                .sort((a, b) => b.hype - a.hype);
        }
        catch (error) {
            console.error('[GET /api/videos]', error);
            throw new common_1.InternalServerErrorException('No se pudieron procesar los videos');
        }
    }
};
exports.VideosService = VideosService;
exports.VideosService = VideosService = __decorate([
    (0, common_1.Injectable)()
], VideosService);
//# sourceMappingURL=videos.service.js.map