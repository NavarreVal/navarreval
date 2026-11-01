// dnd.navarreval.com serves the campaign reference at the host root.
// The same files stay at /dnd/ on navarreval.com and on Pages preview URLs.
// Attaching the hostname in Cloudflare is enough; this rewrite does the rest.

var DND_HOST = "dnd.navarreval.com";

// Pages _redirects cannot match on hostname. These two hosts are the only
// ones that should 301 to the apex. Branch and hash preview hosts
// (*.navarreval.pages.dev) are not listed, so a pull-request preview stays
// on its own host. Every other host, including /api/*, falls through.
var APEX_ORIGIN = "https://navarreval.com";
var APEX_REDIRECT_HOSTS = {
  "www.navarreval.com": true,
  "navarreval.pages.dev": true
};

// Retired photo file names. Pages can still serve a deleted file at its
// exact path after a zone purge, and this middleware runs before the asset
// lookup. The Set is built once; each request is one lookup.
var RETIRED_PHOTO_PATHS = new Set([
  "/images/photography/elleVector.jpg",
  "/images/photography/jacen.jpg",
  "/images/photography/johyevening.jpg",
  "/images/photography/marekFuzzyHat.jpg",
  "/images/photography/bAndM.jpg",
  "/images/photography/marlinGreenRiver.jpg",
  "/images/photography/marekShields.jpg",
  "/images/photography/porterPilot.jpg",
  "/images/photography/2014Marek.jpg",
  "/images/photography/2021Marek.jpg",
  "/images/photography/porterShields.jpg",
  "/images/photography/marekStudy.jpg",
  "/images/photography/donPorterUtahLake.jpg",
  "/images/photography/alyssaWhiteShirt.jpg"
]);

// A leading run of "/", "\", "%2F", or "%5C" is one slash. `new URL("//host", origin)`
// is a protocol-relative URL, so the path has to be collapsed before it is
// assigned onto the fixed origin.
export function collapseLeadingSlashes(pathname) {
  var path = pathname || "/";
  var i = 0;
  while (i < path.length) {
    var c = path.charAt(i);
    if (c === "/" || c === "\\") {
      i++;
      continue;
    }
    var enc = path.slice(i, i + 3).toLowerCase();
    if (enc === "%2f" || enc === "%5c") {
      i += 3;
      continue;
    }
    break;
  }
  return "/" + path.slice(i);
}

export function locationOnOrigin(origin, pathname, search) {
  var dest = new URL(origin);
  dest.pathname = collapseLeadingSlashes(pathname);
  dest.search = search || "";
  var fixed = new URL(origin);
  if (dest.protocol !== "https:" || dest.hostname !== fixed.hostname) {
    return fixed.origin + "/";
  }
  return dest.href;
}

// Null means serve this request as-is. Alias hosts always 301 to the apex.
// Apex and branch previews are not alias hosts. Pages' .html and trailing-slash
// redirects on those hosts use a root-relative Location (for example
// "/passion/reading"), including for a path that starts with //. A preview
// host returns 404 for //example.com and 308 to /passion/reading for
// //passion/reading.html, so that normalization does not leave the host.
export function canonicalRedirectTarget(requestUrl) {
  var url = new URL(requestUrl);
  var host = url.hostname.toLowerCase();
  if (!APEX_REDIRECT_HOSTS[host]) return null;
  return locationOnOrigin(APEX_ORIGIN, url.pathname, url.search);
}

export async function onRequest(context) {
  var url = new URL(context.request.url);
  var host = url.hostname.toLowerCase();
  var dest = canonicalRedirectTarget(url.toString());
  if (dest) {
    return new Response(null, {
      status: 301,
      headers: { Location: dest }
    });
  }

  if (host !== DND_HOST) {
    // After the alias-host 301, and before the asset lookup. The dnd host
    // keeps its own rewrite below.
    if (RETIRED_PHOTO_PATHS.has(url.pathname)) {
      return new Response("Gone", {
        status: 410,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex"
        }
      });
    }
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
