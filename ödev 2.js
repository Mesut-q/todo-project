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



//Birim testler
npm install --save-dev jest supertest mongoose

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Express uygulamanız
const Todo = require('../models/todoModel');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/testdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  
  await mongoose.connection.close();
});

describe('Todo CRUD işlemleri', () => {
  // Bir test Todo nesnesini tanımlarız
  const testTodo = {
    name: 'Test Todo',
    status: 'Backlog',
  };

  let oluşturulanTodo;

  it('Yeni bir Todo oluşturmalı', async () => {
    const yanıt = await request(app)
      .post('/api/todos')
      .send(testTodo)
      .expect(201);

    oluşturulanTodo = yanıt.body;
    expect(oluşturulanTodo).toHaveProperty('_id');
    expect(oluşturulanTodo.name).toBe(testTodo.name);
    expect(oluşturulanTodo.status).toBe(testTodo.status);
  });

  it('Todo listesini almalı', async () => {
    const yanıt = await request(app)
      .get('/api/todos')
      .expect(200);

    const todos = yanıt.body;
    expect(Array.isArray(todos)).toBe(true);
  });

  it('Todo güncellenmeli', async () => {
    const güncellenmişTodo = { ...oluşturulanTodo, name: 'Güncellenmiş Todo' };
    const yanıt = await request(app)
      .put(`/api/todos/${oluşturulanTodo._id}`)
      .send(güncellenmişTodo)
      .expect(200);

    expect(yanıt.body.name).toBe(güncellenmişTodo.name);
  });

  it('Todo silinmeli', async () => {
    await request(app)
      .delete(`/api/todos/${oluşturulanTodo._id}`)
      .expect(204);

    const silinenTodo = await Todo.findById(oluşturulanTodo._id);
    expect(silinenTodo).toBeNull();
  });
});
