import assert from "node:assert/strict";
import test from "node:test";
import worker, { steamArt } from "./worker.js";

const ART = "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/";
const ENV = {
  STEAM_WEB_API_KEY: "test-key",
  STEAM_ID: "76561198000000000",
};

const CRIMSON = { appid: 3321460, name: "Crimson Desert", playtime_forever: 90, playtime_2weeks: 40 };
const HALF_LIFE = { appid: 220, name: "Half-Life 2", playtime_forever: 600, playtime_2weeks: 5 };

function expectedArt(appid) {
  const base = ART + appid + "/";
  return {
    img: base + "header.jpg",
    img_fallbacks: [base + "capsule_231x87.jpg", base + "capsule_184x69.jpg"],
  };
}

test("steamArt points img at header.jpg and lists capsule fallbacks", () => {
  assert.deepEqual(steamArt(CRIMSON.appid), expectedArt(CRIMSON.appid));
  assert.deepEqual(steamArt(HALF_LIFE.appid), expectedArt(HALF_LIFE.appid));
});

async function shelf(query, upstreamGames) {
  const calls = [];
  const previous = globalThis.fetch;
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return Response.json({ response: { games: upstreamGames } });
  };
  try {
    const response = await worker.fetch(
      new Request("https://steam-shelves.example/" + query),
      ENV
    );
    const body = await response.json();
    return { response, body, calls };
  } finally {
    globalThis.fetch = previous;
  }
}

function assertMapped(game, source) {
  assert.equal(game.appid, source.appid);
  assert.equal(game.name, source.name);
  assert.equal(game.playtime_forever, source.playtime_forever);
  assert.equal(game.playtime_2weeks, source.playtime_2weeks);
  assert.deepEqual(
    { img: game.img, img_fallbacks: game.img_fallbacks },
    expectedArt(source.appid)
  );
  assert.equal(game.store, "https://store.steampowered.com/app/" + source.appid + "/");
  assert.equal(game.community, "https://steamcommunity.com/app/" + source.appid);
}

test("shelf responses use header.jpg without an extra Steam call per game", async () => {
  const upstream = [CRIMSON, HALF_LIFE];

  const recent = await shelf("?shelf=recent&count=2", upstream);
  assert.equal(recent.response.status, 200);
  assert.equal(recent.response.headers.get("Access-Control-Allow-Origin"), "*");
  assert.equal(recent.response.headers.get("Cache-Control"), "public, max-age=1800");
  assert.equal(recent.body.shelf, "recent");
  assert.equal(recent.body.count, 2);
  assert.equal(recent.calls.length, 1);
  assert.match(recent.calls[0], /GetRecentlyPlayedGames/);
  assert.equal(recent.calls[0].includes("store_item_assets"), false);
  recent.body.games.forEach((game, index) => assertMapped(game, upstream[index]));

  const most = await shelf("?shelf=most-played&count=2", upstream);
  assert.equal(most.response.status, 200);
  assert.equal(most.response.headers.get("Cache-Control"), "public, max-age=1800");
  assert.equal(most.calls.length, 1);
  assert.match(most.calls[0], /GetOwnedGames/);
  assert.equal(most.calls[0].includes("store_item_assets"), false);
  assertMapped(most.body.games[0], HALF_LIFE);
  assertMapped(most.body.games[1], CRIMSON);
});
