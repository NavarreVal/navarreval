// Newest three videos from https://www.youtube.com/@navarreval_
// Channel ID UC-RWOoHTh6z5UDYatL8_6Gg. Parsed result is cached for 7 days.

const CHANNEL_ID = "UC-RWOoHTh6z5UDYatL8_6Gg";
const FEED = "https://www.youtube.com/feeds/videos.xml?channel_id=" + CHANNEL_ID;
const WEEK = 604800;

function decodeXml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, function (_, n) {
      return String.fromCodePoint(Number(n));
    })
    .replace(/&#x([0-9a-fA-F]+);/g, function (_, n) {
      return String.fromCodePoint(parseInt(n, 16));
    })
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function tag(chunk, name) {
  var match = chunk.match(new RegExp("<" + name + ">([\\s\\S]*?)</" + name + ">"));
  return match ? decodeXml(match[1]).trim() : "";
}

function latestVideos(xml) {
  var parts = String(xml || "").split(/<entry\b[^>]*>/i).slice(1);
  var videos = [];
  for (var i = 0; i < parts.length && videos.length < 3; i += 1) {
    var videoId = tag(parts[i], "yt:videoId");
    if (!videoId) continue;
    videos.push({
      videoId: videoId,
      title: tag(parts[i], "title"),
      published: tag(parts[i], "published"),
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

async function lastGood(context, url) {
  try {
    var res = context.env && context.env.ASSETS
      ? await context.env.ASSETS.fetch(new Request(url.origin + "/data/youtube-fallback.json"))
      : await fetch(url.origin + "/data/youtube-fallback.json");
    if (!res.ok) return null;
    var data = await res.json();
    if (!data || !Array.isArray(data.videos) || !data.videos.length) return null;
    return { ok: true, stale: true, videos: data.videos.slice(0, 3) };
  } catch (err) {
    return null;
  }
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

  var videos;
  try {
    var upstream = await fetch(FEED, {
      headers: {
        accept: "application/atom+xml, application/xml, text/xml",
        "user-agent": "navarreval-pages"
      },
      // Cache only successful upstream responses; a cached 404/500 from YouTube
      // would otherwise pin this colo to the error for a week.
      cf: { cacheTtlByStatus: { "200-299": 3600, "300-599": 0 }, cacheEverything: true }
    });
    if (!upstream.ok) throw new Error(String(upstream.status));
    videos = latestVideos(await upstream.text());
    if (!videos.length) throw new Error("empty");
  } catch (err) {
    // YouTube's feed intermittently fails for Cloudflare egress IPs. Serve the
    // last-good copy committed in the repo instead of an empty error; never cache it.
    var fallback = await lastGood(context, url);
    if (fallback) return json(fallback, 200, "no-store");
    return json({ ok: false, videos: [] }, 502, "no-store");
  }

  var response = json(
    { ok: true, videos: videos },
    200,
    "public, max-age=604800, stale-while-revalidate=86400"
  );
  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
