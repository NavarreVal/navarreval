import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalRedirectTarget,
  collapseLeadingSlashes,
  locationOnOrigin,
  onRequest,
} from "./_middleware.js";

const RETIRED_PHOTO_PATHS = [
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
  "/images/photography/alyssaWhiteShirt.jpg",
];

const APEX = "https://navarreval.com";

function hostOf(url) {
  return new URL(url).hostname;
}

test("collapses leading slashes and backslashes to one", () => {
  assert.equal(collapseLeadingSlashes("//example.com"), "/example.com");
  assert.equal(collapseLeadingSlashes("///example.com"), "/example.com");
  assert.equal(collapseLeadingSlashes("/\\\\example.com"), "/example.com");
  assert.equal(collapseLeadingSlashes("/\\example.com"), "/example.com");
  assert.equal(collapseLeadingSlashes("/%2F%2Fexample.com"), "/example.com");
  assert.equal(collapseLeadingSlashes("/%2f%5c/example.com"), "/example.com");
  assert.equal(collapseLeadingSlashes("/passion/reading"), "/passion/reading");
  assert.equal(collapseLeadingSlashes("/passion/reading/"), "/passion/reading/");
  assert.equal(collapseLeadingSlashes("/"), "/");
});

test("alias //example.com stays on the apex", () => {
  for (const path of ["//example.com", "///example.com", "/%2F%2Fexample.com"]) {
    for (const origin of [
      "https://www.navarreval.com",
      "https://navarreval.pages.dev",
    ]) {
      const loc = canonicalRedirectTarget(origin + path);
      assert.equal(loc, APEX + "/example.com");
      assert.equal(hostOf(loc), "navarreval.com");
    }
  }
});

test("a backslash path cannot become a protocol-relative redirect", () => {
  const loc = canonicalRedirectTarget("https://www.navarreval.com/\\\\example.com");
  assert.equal(loc, APEX + "/example.com");
  assert.equal(hostOf(loc), "navarreval.com");
  assert.equal(
    locationOnOrigin(APEX, "/\\\\example.com", ""),
    APEX + "/example.com"
  );
});

test("normal paths and query strings are preserved on the apex", () => {
  assert.equal(
    canonicalRedirectTarget("https://www.navarreval.com/passion/reading"),
    APEX + "/passion/reading"
  );
  assert.equal(
    canonicalRedirectTarget("https://www.navarreval.com/passion/reading/"),
    APEX + "/passion/reading/"
  );
  assert.equal(
    canonicalRedirectTarget("https://navarreval.pages.dev/index.html"),
    APEX + "/index.html"
  );
  assert.equal(
    canonicalRedirectTarget("https://www.navarreval.com/"),
    APEX + "/"
  );
  assert.equal(
    canonicalRedirectTarget("https://www.navarreval.com/passion/reading?x=1&y=two"),
    APEX + "/passion/reading?x=1&y=two"
  );
  const withForeignQuery = canonicalRedirectTarget(
    "https://www.navarreval.com//example.com/x?next=https://evil.com&ok=1"
  );
  assert.equal(
    withForeignQuery,
    APEX + "/example.com/x?next=https://evil.com&ok=1"
  );
  assert.equal(hostOf(withForeignQuery), "navarreval.com");
});

test("apex and preview hosts are not redirected by this middleware", () => {
  assert.equal(
    canonicalRedirectTarget("https://navarreval.com//example.com"),
    null
  );
  assert.equal(
    canonicalRedirectTarget("https://abc123.navarreval.pages.dev//example.com"),
    null
  );
  assert.equal(
    canonicalRedirectTarget("https://dnd.navarreval.com/"),
    null
  );
});

test("retired photo file names are 410 before the asset lookup", async () => {
  for (const path of RETIRED_PHOTO_PATHS) {
    for (const requestUrl of [
      "https://navarreval.com" + path,
      "https://navarreval.com" + path + "?v=1",
      "https://abc123.navarreval.pages.dev" + path + "?x=1&y=two",
    ]) {
      let nextCalled = false;
      const res = await onRequest({
        request: new Request(requestUrl),
        next() {
          nextCalled = true;
          return new Response("asset", { status: 200 });
        },
      });
      assert.equal(nextCalled, false, requestUrl);
      assert.equal(res.status, 410, requestUrl);
      assert.equal(await res.text(), "Gone");
      assert.equal(res.headers.get("Cache-Control"), "no-store");
      assert.equal(res.headers.get("X-Robots-Tag"), "noindex");
      assert.match(res.headers.get("Content-Type"), /^text\/plain/);
    }
  }
});

test("retired photo matching is an exact, case-sensitive pathname", async () => {
  const misses = [
    "/images/photography/ElleVector.jpg",
    "/images/photography/ellevector.jpg",
    "/images/photography/elleVector.JPG",
    "/images/photography/elleVector.jpg/",
    "/images/photography/elleVector.jpg.html",
    "/elleVector.jpg",
    "/images/photography/boxer.jpg",
    "/images/photography/boxer.jpg/",
  ];
  for (const path of misses) {
    let nextCalled = false;
    const res = await onRequest({
      request: new Request("https://navarreval.com" + path + "?v=1"),
      next() {
        nextCalled = true;
        return new Response("asset", { status: 200 });
      },
    });
    assert.equal(nextCalled, true, path);
    assert.equal(res.status, 200, path);
  }
});

test("alias hosts still redirect a retired photo path to the apex", async () => {
  for (const origin of [
    "https://www.navarreval.com",
    "https://navarreval.pages.dev",
  ]) {
    const res = await onRequest({
      request: new Request(origin + "/images/photography/elleVector.jpg?x=1"),
      next() {
        throw new Error("next should not run");
      },
    });
    assert.equal(res.status, 301);
    assert.equal(
      res.headers.get("Location"),
      APEX + "/images/photography/elleVector.jpg?x=1"
    );
  }
});

test("the dnd host still rewrites instead of answering 410", async () => {
  let fetched = "";
  const res = await onRequest({
    request: new Request(
      "https://dnd.navarreval.com/images/photography/elleVector.jpg?x=1"
    ),
    env: {
      ASSETS: {
        fetch(request) {
          fetched = request.url;
          return new Response("campaign", {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        },
      },
    },
    next() {
      throw new Error("next should not run");
    },
  });
  assert.equal(res.status, 200);
  assert.equal(
    fetched,
    "https://dnd.navarreval.com/dnd/images/photography/elleVector.jpg?x=1"
  );
  assert.equal(await res.text(), "campaign");
});
