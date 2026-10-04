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
  return context.env.ASSETS.fetch(request);
}
