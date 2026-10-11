import { getYouTubeVideoId, isStudyYouTubeUrl } from "../youtube-video.ts";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

Deno.test("extracts IDs from supported YouTube link forms", () => {
  const id = "dQw4w9WgXcQ";
  const urls = [
    `https://www.youtube.com/watch?v=${id}&feature=share`,
    `https://youtu.be/${id}?si=share`,
    `https://www.youtube.com/shorts/${id}`,
    `https://youtube.com/embed/${id}`,
  ];
  for (const url of urls) {
    assert(
      getYouTubeVideoId(url) === id,
      `Could not extract video ID from ${url}`,
    );
  }
});

Deno.test("rejects non-YouTube hosts and malformed video IDs", () => {
  assert(
    !isStudyYouTubeUrl("https://example.com/watch?v=dQw4w9WgXcQ"),
    "External host was accepted",
  );
  assert(
    !isStudyYouTubeUrl("https://youtube.com/watch?v=short"),
    "Malformed video ID was accepted",
  );
  assert(
    !isStudyYouTubeUrl("javascript:alert(1)"),
    "Non-web protocol was accepted",
  );
});
