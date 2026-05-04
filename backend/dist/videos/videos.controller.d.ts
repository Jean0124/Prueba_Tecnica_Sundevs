import { VideosService } from './videos.service';
export declare class VideosController {
    private readonly videosService;
    constructor(videosService: VideosService);
    getVideos(): {
        id: string;
        thumbnail: string;
        title: string;
        author: string;
        publishedAt: string;
        hype: number;
    }[];
}
