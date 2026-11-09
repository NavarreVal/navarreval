# steam-shelves

Cloudflare Worker that feeds the Steam shelves on navarreval.com. The games page (`passion/video-games.html`) and the recently played line on the personal page both request it. This is a module worker: the deployed script is `worker.js`.

## Endpoints

`GET /` accepts:

- `shelf` — `recent` (default) or `most-played`
- `count` — an integer from 1 to 50 (default 20)

`recent` calls Steam `IPlayerService/GetRecentlyPlayedGames`. `most-played` calls `IPlayerService/GetOwnedGames` and returns the games with the highest `playtime_forever`.

Any other `shelf` returns HTTP 400 and `{ "error": "Unknown shelf" }`. `OPTIONS` is allowed for CORS. Any other method returns 405.

Successful responses are cached with `Cache-Control: public, max-age=1800`. Upstream and worker failures use `Cache-Control: no-store`.

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
