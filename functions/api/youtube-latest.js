// Newest three videos from https://www.youtube.com/@navarreval_
// Channel ID UC-RWOoHTh6z5UDYatL8_6Gg. The uploads playlist id is that
// channel id with the leading UC replaced by UU, so channels.list is skipped.
// playlistItems.list?part=snippet is one quota unit. Live responses are
// cached at the edge for one hour.
// If the key is missing, the API fails, or the request times out,
// /data/youtube-fallback.json (last good list, committed by hand) is served
// with no-store so the failure is never cached.
// The API key is sent only as the X-Goog-Api-Key header. It is not placed
// in the URL (fetch traces record the query string) and is never logged.

const CHANNEL_ID = "UC-RWOoHTh6z5UDYatL8_6Gg";
const UPLOADS_PLAYLIST_ID = CHANNEL_ID.indexOf("UC") === 0 ? "UU" + CHANNEL_ID.slice(2) : "";
const MAX_RESULTS = 3;
const PLAYLIST_URL =
  "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=" +
  MAX_RESULTS +
  "&playlistId=" +
  UPLOADS_PLAYLIST_ID;
const FALLBACK = "/data/youtube-fallback.json";
const HOUR = 3600;
const TIMEOUT_MS = 5000;
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

function videosFromPlaylist(payload) {
  var items = payload && Array.isArray(payload.items) ? payload.items : [];
  var videos = [];
  for (var i = 0; i < items.length && videos.length < MAX_RESULTS; i += 1) {
    var snippet = items[i] && items[i].snippet;
    var resource = snippet && snippet.resourceId;
    var videoId = resource && resource.videoId;
    if (!VIDEO_ID.test(videoId || "")) continue;
    videos.push({
      videoId: videoId,
      title: typeof snippet.title === "string" ? snippet.title : "",
      published: typeof snippet.publishedAt === "string" ? snippet.publishedAt : "",
      thumbnail: "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg"
    });
  }
  return videos;
}

function json(body, status, cacheControl) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cacheControl
    }
  });
}

async function fallbackVideos(context, origin) {
  try {
    var req = new Request(origin + FALLBACK, { method: "GET" });
    var res = context.env && context.env.ASSETS
      ? await context.env.ASSETS.fetch(req)
      : await fetch(req);
    if (!res.ok) return [];
    var data = await res.json();
    return data && Array.isArray(data.videos) ? data.videos.slice(0, MAX_RESULTS) : [];
  } catch (err) {
    return [];
  }
}

async function serveFallback(context, origin) {
  var backup = await fallbackVideos(context, origin);
  if (!backup.length) return json({ ok: false, videos: [] }, 502, "no-store");
  return json({ ok: true, fallback: true, videos: backup }, 200, "no-store");
}

export async function onRequest(context) {
  var method = context.request.method;
  if (method !== "GET" && method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  var url = new URL(context.request.url);
  var cacheKey = new Request(url.origin + "/api/youtube-latest", { method: "GET" });
  var cache = caches.default;
  var hit = await cache.match(cacheKey);
  if (hit) return hit;

  var apiKey = context.env && context.env.YOUTUBE_API_KEY;
  if (typeof apiKey !== "string" || apiKey.length === 0 || !UPLOADS_PLAYLIST_ID) {
    return serveFallback(context, url.origin);
  }

  var videos;
  var timer;
  try {
    var controller = new AbortController();
    timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
    var upstream = await fetch(PLAYLIST_URL, {
      headers: {
        accept: "application/json",
        "x-goog-api-key": apiKey
      },
      signal: controller.signal,
      // Cache a good playlist response at the edge. Never cache API errors.
      // The key is a header, so it is not part of this cache key.
      cf: { cacheEverything: true, cacheTtlByStatus: { "200-299": HOUR, "300-599": 0 } }
    });
    if (!upstream.ok) throw new Error("upstream");
    videos = videosFromPlaylist(await upstream.json());
    if (!videos.length) throw new Error("empty");
  } catch (err) {
    return serveFallback(context, url.origin);
  } finally {
    clearTimeout(timer);
  }

  var response = json(
    { ok: true, videos: videos },
    200,
    "public, max-age=" + HOUR + ", s-maxage=" + HOUR
  );
  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
