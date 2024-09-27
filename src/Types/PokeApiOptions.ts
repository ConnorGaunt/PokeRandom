export type PokeApiOptions = {
    protocol?: "https" | "http" | undefined;
    hostName?: string | undefined;
    versionPath?: string | undefined;
    offset?: number | undefined;
    limit?: number | undefined;
    timeout?: number | undefined;
    cache?: boolean | undefined;
    cacheImages?: boolean | undefined;
};
