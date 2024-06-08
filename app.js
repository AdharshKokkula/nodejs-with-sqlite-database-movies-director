const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'moviesData.db')
let database = null

const initializeDatabaseAndServer = async () => {
  try {
    database = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(error)
  }
}

initializeDatabaseAndServer()

const changeNotationOfObjectToOnlyMovieName = object => ({
  movieName: object.movie_name,
})

const changeNotationOfMovieList = list => {
  let newMoviesList = []
  for (let object of list) {
    newMoviesList.push(changeNotationOfObjectToOnlyMovieName(object))
  }
  return newMoviesList
}

const changeNotationOfObject = object => ({
  movieId: object.movie_id,
  directorId: object.director_id,
  movieName: object.movie_name,
  leadActor: object.lead_actor,
})

const changeNotationofDirectorObject = object => ({
  directorId: object.director_id,
  directorName: object.director_name,
})

const changeNotationOfDirectorsList = list => {
  let newDirectorList = []
  for (let object of list) {
    newDirectorList.push(changeNotationofDirectorObject(object))
  }
  return newDirectorList
}

app.get('/movies/', async (request, response) => {
  const sqlGetAllQuery = `SELECT * FROM movie;`
  const results = await database.all(sqlGetAllQuery)
  response.send(changeNotationOfMovieList(results))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const sqlInsertQuery = `INSERT INTO movie (director_id, movie_name, lead_actor) VALUES (${directorId}, '${movieName}', '${leadActor}');`
  await database.run(sqlInsertQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const sqlGetQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`
  const result = await database.get(sqlGetQuery)
  response.send(changeNotationOfObject(result))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const sqlUpdateQuery = `
  UPDATE movie 
  SET 
  director_id = ${directorId}, 
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId};`
  await database.run(sqlUpdateQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const sqlDeleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`
  await database.run(sqlDeleteQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const sqlGetAllQuery = `SELECT * FROM director`
  const results = await database.all(sqlGetAllQuery)
  response.send(changeNotationOfDirectorsList(results))
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const sqlGetQuery = `
  select movie_name from movie where director_id = ${directorId};`
  const results = await database.all(sqlGetQuery)
  response.send(changeNotationOfMovieList(results))
})

module.exports = app
