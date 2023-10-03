// Gerekli modülleri içe aktarır
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Express uygulamasını oluşturur
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB bağlantısını kurar
mongoose.connect('mongodb://localhost/todo-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB veri modelini tanımlar
const Todo = mongoose.model('Todo', {
  name: String,
  status: {
    type: String,
    enum: ['Backlog', 'In progress', 'Done'],
  },
});

// Middleware'leri kullanır
app.use(bodyParser.json());

// Todo listesini getirme (READ)
app.get('/todo-list', async (req, res) => {
  try {
    const todoList = await Todo.find();
    res.json(todoList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Yeni bir todo eklemek (CREATE)
app.post('/todo-list', async (req, res) => {
  try {
    const newTodo = new Todo(req.body);
    await newTodo.save();
    res.json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Todo'yu güncelleme (UPDATE)
app.put('/todo-list/:id', async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Todo'yu silme (DELETE)
app.delete('/todo-list/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Sunucuyu dinlemeye başlamak
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});