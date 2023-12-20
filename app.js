const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/players/', async (request, response) => {
  const query = `
    SELECT
      *
    FROM
      cricket_team`
  const res = await db.all(query)
  const ans = res => {
    return {
      playerId: res.player_id,
      playerName: res.player_name,
      jerseyNumber: res.jersey_number,
      role: res.role,
    }
  }
  response.send(res.map(eachPlayer => ans(eachPlayer)))
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const addQuery = `insert into 
  cricket_team (player_name,jersey_number,role) 
  values(
    '${playerName}',
  ${jerseyNumber},
  '${role}'
  );`

  await db.run(addQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const addQuery = `select * from cricket_team where player_id=${playerId}`
  const res = await db.get(addQuery)
  const ans = {
    playerId: res.player_id,
    playerName: res.player_name,
    jerseyNumber: res.jersey_number,
    role: res.role,
  }
  response.send(ans)
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addQuery = `update   cricket_team 
    set 
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}';
    where player_id= ${playerId};`
  await db.run(addQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const query = `DELETE FROM cricket_team where player_id=${playerId};`
  await db.run(query)
  response.send('Player Removed')
})

module.exports = app
