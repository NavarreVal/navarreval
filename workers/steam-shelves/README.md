# steam-shelves

Cloudflare Worker that feeds the Steam shelves on navarreval.com. The games page (`passion/video-games.html`) and the recently played line on the personal page both request it. This is a module worker: the deployed script is `worker.js`.

## Endpoints

`GET /` accepts:

- `shelf` — `recent` (default) or `most-played`
- `count` — an integer from 1 to 50 (default 20)

`recent` calls Steam `IPlayerService/GetRecentlyPlayedGames`. `most-played` calls `IPlayerService/GetOwnedGames` and returns the games with the highest `playtime_forever`.

Any other `shelf` returns HTTP 400 and `{ "error": "Unknown shelf" }`. `OPTIONS` is allowed for CORS. Any other method returns 405.

Successful responses are cached with `Cache-Control: public, max-age=1800`. Upstream and worker failures use `Cache-Control: no-store`.

## Artwork

Each game includes `appid`, `name`, `playtime_forever`, `playtime_2weeks`, `img`, `img_fallbacks`, `store`, and `community`. `img` is the header on the public Steam CDN:

`https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/<appid>/header.jpg`

`img_fallbacks` is that same directory's `capsule_231x87.jpg`, then `capsule_184x69.jpg`. Newer apps 404 on those unhashed capsules (the files moved under a hashed path). `header.jpg` on the unhashed path still resolves, for example for Crimson Desert. The Worker builds these URLs locally. It does not call Steam again for each game.

The games page already uses `img` first and then falls back to the capsule and the header, so the extra `img_fallbacks` field does not change that page.

Check the mapping with:

```sh
node --test workers/steam-shelves/worker.test.mjs
```

## Secrets

The Worker reads these bindings from the environment. Names only; do not commit values, and do not put them in `wrangler.toml`.

- `STEAM_WEB_API_KEY` — required. If it is missing, the Worker returns HTTP 500.
- `STEAM_ID` — optional. If it is unset, the Worker uses the profile id built into `worker.js`.

From this directory, Wrangler prompts for the value. `wrangler secret put` uploads a new Worker version and deploys it immediately:

```sh
npx wrangler secret put STEAM_WEB_API_KEY
npx wrangler secret put STEAM_ID
```

## Deploy

From this directory, with Wrangler authenticated to the account that owns the `steam-shelves` Worker:

```sh
npx wrangler deploy
```

Leave the account id out of `wrangler.toml`. Wrangler uses the account you are logged in to.
