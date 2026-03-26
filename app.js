const express = require("express");
const { createClient } = require("redis");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const client = createClient({
    url: "redis://default:2oTTtVgGy5rlcFnrlKjHWuXSsT0EJJ5X@redis-11984.crce292.ap-south-1-2.ec2.cloud.redislabs.com:11984"
});

client.connect();

client.on("error", (err) => console.log("Redis Error:", err));

// ➕ Add score
app.get("/add", async (req, res) => {
    const { username, score, game, level } = req.query;

    if (!username || !score || !game || !level) {
        return res.send("Provide username, score, game, level");
    }

    const key = `leaderboard:${game}:${level}`;

    await client.zAdd(key, [
        { score: Number(score), value: username }
    ]);

    res.send("Score added!");
});

// 🏆 Get leaderboard
app.get("/top", async (req, res) => {
    const { game, level } = req.query;

    if (!game || !level) {
        return res.json([]);
    }

    const key = `leaderboard:${game}:${level}`;

    const data = await client.zRangeWithScores(key, 0, 4, {
        REV: true
    });

    res.json(data);
});

// ❌ Delete user
app.get("/delete", async (req, res) => {
    const { username, game, level } = req.query;

    if (!username || !game || !level) {
        return res.send("Provide username, game, level");
    }

    const key = `leaderboard:${game}:${level}`;

    await client.zRem(key, username);

    res.send("User removed");
});

// 🚀 Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});