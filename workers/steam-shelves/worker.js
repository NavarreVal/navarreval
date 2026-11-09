const STEAM_ART = "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/";

export function steamArt(appid) {
  const base = STEAM_ART + appid + "/";
  return {
    img: base + "header.jpg",
    img_fallbacks: [
      base + "capsule_231x87.jpg",
      base + "capsule_184x69.jpg"
    ]
  };
}

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    const url = new URL(request.url);
    const shelf = url.searchParams.get("shelf") || "recent";
    const count = Math.min(Math.max(parseInt(url.searchParams.get("count") || "20", 10) || 20, 1), 50);
    const allowed = ["recent", "most-played"];
    if (!allowed.includes(shelf)) {
      return new Response(JSON.stringify({ error: "Unknown shelf" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    const key = env.STEAM_WEB_API_KEY;
    const steamid = env.STEAM_ID || "76561198008495949";
    if (!key) {
      return new Response(JSON.stringify({ error: "Worker misconfigured" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    try {
      let games = [];
      if (shelf === "recent") {
        const api =
          "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/" +
          `?key=${encodeURIComponent(key)}&steamid=${encodeURIComponent(steamid)}&count=${count}`;
        const upstream = await fetch(api);
        if (!upstream.ok) {
          return new Response(JSON.stringify({ error: "Steam upstream error", status: upstream.status }), {
            status: 502,
            headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" }
          });
        }
        const data = await upstream.json();
        games = (data.response && data.response.games) || [];
      } else {
        const api =
          "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/" +
          `?key=${encodeURIComponent(key)}&steamid=${encodeURIComponent(steamid)}` +
          "&include_appinfo=1&include_played_free_games=1";
        const upstream = await fetch(api);
        if (!upstream.ok) {
          return new Response(JSON.stringify({ error: "Steam upstream error", status: upstream.status }), {
            status: 502,
            headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" }
          });
        }
        const data = await upstream.json();
        const all = (data.response && data.response.games) || [];
        games = all
          .slice()
          .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
          .slice(0, count);
      }

      const out = games.map((g) => {
        const art = steamArt(g.appid);
        return {
          appid: g.appid,
          name: g.name || `App ${g.appid}`,
          playtime_forever: g.playtime_forever || 0,
          playtime_2weeks: g.playtime_2weeks || 0,
          img: art.img,
          img_fallbacks: art.img_fallbacks,
          store: "https://store.steampowered.com/app/" + g.appid + "/",
          community: "https://steamcommunity.com/app/" + g.appid
        };
      });

      return new Response(JSON.stringify({ shelf, count: out.length, games: out }), {
        headers: {
          ...cors,
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=1800"
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Worker failure" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    }
  }
};
