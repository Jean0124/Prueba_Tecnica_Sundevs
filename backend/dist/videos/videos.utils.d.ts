export interface Statistics {
    viewCount: string;
    likeCount: string;
    commentCount?: string;
}
export interface YoutubeItem {
    snippet: {
        title: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails: {
            high: {
                url: string;
            };
        };
    };
    statistics: Statistics;
}
export declare function relativeTime(fechaISO: string, ahora?: Date): string;
export declare function hypeLevel(elemento: YoutubeItem): number;
