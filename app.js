const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();
app.use = express.json();

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
SELECT *
FROM cricket_team`;
  const playersArray = await db.all(getPlayersQuery);

  const convertedPlayersArray = [];
  for (let player of playersArray) {
    convertedPlayersArray.push(convertDbObjectToResponseObject(player));
  }
  response.send(convertedPlayersArray);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const addPlayerQuery = `
INSERT INTO 
cricket_team (player_name,jersey_number,role)
VALUES ("Vishal",17,"Bowler");`;

  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  const convertedPlayer = convertDbObjectToResponseObject(player);
  response.send(convertedPlayer);
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const updatePlayerQuery = `
UPDATE cricket_team
SET
player_name="Maneesh",
jersey_number=54,
role="All-rounder"
WHERE player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
