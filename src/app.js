import express, { json } from 'express'
import { randomUUID } from 'node:crypto'
const app = express()
import cors from 'cors'
import moviesJSON from './movies.json'
import { validateMovie, validatePartialMovie } from './movies'
const PORT = process.env.PORT ?? 3000
app.disable('x-powered-by') // Deshabilitar el header
const pathsCors = [
    'http://localhost:3000',
    'http://localhost:3000/movies/:id',
    'http://localhost:3000/movies',
    'http://localhost:3000',
]

app.use(json())
app.use(cors(() => {
    pathsCors
}))

app.get('/', (req,res) => {
    res.send('<h1>HOME <3</h1>')
})

// Get all movies
app.get('/movies', (req, res) => {
    const { genre } = req.query
    if(genre) {
        const filteredMovies = moviesJSON.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(moviesJSON)
})

// Get movie by ID
app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = moviesJSON.find(movie => movie.id === id)
    if (movie) return res.json(movie)

    res.status(404).json({ message: "404 Movie Not Found" })
})

// Create movie
app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)

    if(result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const {
        title,
        year,
        director,
        duration,
        poster,
        genre,
        rate
    } = req.body

    // db
    const newMovie = {
        id: randomUUID(),
        ...result.data
    }

    moviesJSON.push(newMovie)
    res.status(201).json(newMovie)
})

// Update movie param
app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

    if(!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    
    const { id } = req.params
    const movieIndex = moviesJSON.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return req.status(404).json({ message: "Movie not found!"})
    }

    const updateMovie = {
        ...moviesJSON[movieIndex],
        ...result.data
    }

    moviesJSON[movieIndex] = updateMovie

    return res.json(updateMovie)
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})