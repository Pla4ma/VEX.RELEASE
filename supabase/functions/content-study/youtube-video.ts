const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeVideoId(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const hostname = url.hostname.toLowerCase();
  let videoId: string | null = null;
  if (hostname === "youtu.be" || hostname === "www.youtu.be") {
    videoId = url.pathname.split("/")[1] ?? null;
  } else if (hostname === "youtube.com" || hostname === "www.youtube.com") {
    if (url.pathname === "/watch") videoId = url.searchParams.get("v");
    else {videoId = /^\/(?:shorts|embed)\/([^/]+)$/.exec(url.pathname)?.[1] ??
        null;}
  }
  return videoId && YOUTUBE_VIDEO_ID_PATTERN.test(videoId) ? videoId : null;
}

export function isStudyYouTubeUrl(value: string): boolean {
  return getYouTubeVideoId(value) !== null;
}
