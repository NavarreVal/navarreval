import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalRedirectTarget,
  collapseLeadingSlashes,
  locationOnOrigin,
} from "./_middleware.js";

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
