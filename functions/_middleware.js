// dnd.navarreval.com serves the campaign reference at the host root.
// The same files stay at /dnd/ on navarreval.com and on Pages preview URLs.
// Attaching the hostname in Cloudflare is enough; this rewrite does the rest.

var DND_HOST = "dnd.navarreval.com";

export async function onRequest(context) {
  var url = new URL(context.request.url);
  if (url.hostname !== DND_HOST) {
    return context.next();
  }

  if (url.pathname === "/dnd" || url.pathname.startsWith("/dnd/")) {
    return context.next();
  }

  url.pathname = "/dnd" + (url.pathname === "/" ? "/" : url.pathname);
  var request = new Request(url.toString(), context.request);
  var response = await context.env.ASSETS.fetch(request);
  var headers = new Headers(response.headers);
  // Function responses otherwise keep a multi-hour browser TTL, so a new
  // list can render against a cached stylesheet that still blows the icons up.
  headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  if (!headers.has("X-Robots-Tag")) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
}
