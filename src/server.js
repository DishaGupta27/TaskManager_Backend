const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const PORT = process.env.PORT || 3000
const PERSIST = process.env.PERSIST === 'true'
const DATAFILE = path.join(__dirname, '../data/tasks.json')
const app = express()
app.use(cors())
app.use(express.json())
let tasks = []
const generateID = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
if (PERSIST) {
    try {
        if (!fs.existsSync(path.join(__dirname, '../data'))) {
            fs.mkdirSync(path.join(__dirname, '../data'))
        }
        if (fs.existsSync(DATAFILE)) {
            tasks = JSON.parse(fs.readFileSync(DATAFILE, 'utf8')) || []
        } else {
            fs.writeFileSync(DATAFILE, JSON.stringify([], null, 2))
            tasks = []
        }
    } catch (err) {
        console.error('Failed to load:', err)
    }
}
function saveIfNeeded() {
    if (PERSIST) {
        fs.writeFileSync(DATAFILE, JSON.stringify(tasks, null, 2))
    }
}
app.post('/tasks', (req, res) => {
    const { title, description, dueDate } = req.body
    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'required' })
    }
    let due = null
    if (dueDate) {
        const d = new Date(dueDate)
        if (!isNaN(d)) due = d.toISOString()
        else return res.status(400).json({ error: 'invalid' })
    }
    const now = new Date().toISOString()
    const task = {
        id: generateID(),
        title: title.trim(),
        description: description ? description.trim() : '',
        dueDate: due,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
    }
    tasks.push(task)
    saveIfNeeded()
    return res.status(201).json(task);
});
app.get('/tasks/:id', (req, res) => {
    const task = tasks.find((t) => t.id === req.params.id)
    if (!task) return res.status(404).json({ error: 'not found' })
    return res.json(task)
})
app.put('/tasks/:id', (req, res) => {
    const task = tasks.find((t) => t.id === req.params.id)
    if (!task) return res.status(404).json({ error: 'Task not found' })
    const { title, description, dueDate, status } = req.body;
    if (title !== undefined) {
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(404).json({ error: 'Task can not be empty' })
        }
        task.title = title.trim()
    }
})
app.delete('')
