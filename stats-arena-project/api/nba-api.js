import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is running");
});

function getCurrentSeasonStartYear() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  return month >= 10 ? year : year - 1;
}

function safeGet(obj, keys) {
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  return current;
}

function formatPlayer(player) {
  const firstName = player && player.firstname ? player.firstname : "";
  const lastName = player && player.lastname ? player.lastname : "";

  const position = safeGet(player, ["leagues", "standard", "pos"]);
  const teamName = safeGet(player, ["leagues", "standard", "team", "name"]);
  const teamId = safeGet(player, ["leagues", "standard", "team", "id"]);

  return {
    id: player && player.id ? player.id : null,
    full_name: `${firstName} ${lastName}`.trim(),
    first_name: firstName,
    last_name: lastName,
    position: position !== undefined && position !== null ? position : "N/A",
    team: teamName !== undefined && teamName !== null ? teamName : "N/A",
    teamId: teamId !== undefined && teamId !== null ? teamId : null,
  };
}

app.get("/api/players", async (req, res) => {
  const rawSearch = (req.query.search || "").trim();
  if (!rawSearch) return res.json([]);

  const tokens = rawSearch.split(/\s+/).filter(Boolean);

  try {
    let providerSearchTerm = rawSearch;

    if (tokens.length > 1) {
      providerSearchTerm = tokens[tokens.length - 1];
    }

    const apiUrl = `https://v2.nba.api-sports.io/players?search=${encodeURIComponent(
      providerSearchTerm
    )}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-apisports-key": process.env.API_SPORTS_KEY,
      },
    });

    const data = await response.json();
    const providerPlayers =
      data && Array.isArray(data.response) ? data.response : [];

    if (tokens.length === 1) {
      if (!providerPlayers.length) {
        return res.json({
          results: [],
          hint:
            "First name only searches may not be supported by this provider. Try a last name (e.g., 'Durant') or a full name (e.g., 'Kevin Durant').",
        });
      }

      const formatted = providerPlayers.map((p) => formatPlayer(p));
      return res.json(formatted);
    }

    if (!providerPlayers.length) {
      return res.json([]);
    }

    const formatted = providerPlayers.map((p) => formatPlayer(p));

    const normalizedTokens = tokens.map((t) => t.toLowerCase());

    const filtered = formatted.filter((player) => {
      const fullName = String(player.full_name || "").toLowerCase();

      for (const token of normalizedTokens) {
        if (!fullName.includes(token)) return false;
      }
      return true;
    });

    return res.json(filtered);
  } catch (error) {
    console.error("Player search error:", error);
    return res.status(500).json({ error: "Failed to fetch players" });
  }
});

app.get("/api/player-stats/:playerId", async (req, res) => {
  const playerId = req.params.playerId;

  const requestedSeason = Number(req.query.season);
  const currentSeason = getCurrentSeasonStartYear();
  const season = Number.isFinite(requestedSeason) ? requestedSeason : currentSeason;

  const apiUrl = `https://v2.nba.api-sports.io/players/statistics?id=${encodeURIComponent(
    playerId
  )}&season=${encodeURIComponent(season)}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-apisports-key": process.env.API_SPORTS_KEY,
      },
    });

    const data = await response.json();

    const errors = data && data.errors ? data.errors : null;
    if (errors && Object.keys(errors).length > 0) {
      return res.json({
        playerId: String(playerId),
        seasonUsed: season,
        team: "N/A",
        average: { points: 0, assists: 0, rebounds: 0 },
        errors,
      });
    }

    const games = data && Array.isArray(data.response) ? data.response : [];
    if (!games.length) {
      return res.json({
        playerId: String(playerId),
        seasonUsed: season,
        team: "N/A",
        average: { points: 0, assists: 0, rebounds: 0 },
      });
    }

    const firstGame = games[0];
    const teamName =
      firstGame && firstGame.team && firstGame.team.name
        ? firstGame.team.name
        : "N/A";

    let totalPoints = 0;
    let totalAssists = 0;
    let totalRebounds = 0;

    for (const game of games) {
      totalPoints += game && game.points != null ? game.points : 0;
      totalAssists += game && game.assists != null ? game.assists : 0;
      totalRebounds += game && game.totReb != null ? game.totReb : 0;
    }

    const avgPoints = totalPoints / games.length;
    const avgAssists = totalAssists / games.length;
    const avgRebounds = totalRebounds / games.length;

    return res.json({
      playerId: String(playerId),
      seasonUsed: season,
      team: teamName,
      average: {
        points: Number(avgPoints.toFixed(1)),
        assists: Number(avgAssists.toFixed(1)),
        rebounds: Number(avgRebounds.toFixed(1)),
      },
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
