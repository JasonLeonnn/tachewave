const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://jasonleonnn:anjason@twcluster.wzfj8qn.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const taskSchema = new mongoose.Schema({
  taskName: String,
  dueDate: Date,
  isChecked: Boolean,
});

const eventSchema = new mongoose.Schema({
  eventName: String,
  eventDate: Date,
});

const Task = mongoose.model('Task', taskSchema);
const Event = mongoose.model('Event', eventSchema);

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { taskName, dueDate, isChecked } = req.body;
    const newTask = new Task({ taskName, dueDate, isChecked });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update task isChecked property by ID
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { isChecked } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { isChecked },
      { new: true }
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a task by ID
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    await Task.findByIdAndDelete(taskId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get events by specific date
app.get('/api/events', async (req, res) => {
    try {
        const { date } = req.query;
        let events;

        if (date) {
            events = await Event.find({ eventDate: date });
        } else {
            events = await Event.find();
        }

        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to retrieve events' });
    }
});

// Create a new event
app.post('/api/events', async (req, res) => {
  try {
    const { eventName, eventDate } = req.body;
    const newEvent = new Event({ eventName, eventDate });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an event by ID
app.delete('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    await Event.findByIdAndDelete(eventId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
