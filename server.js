require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
});

const queryDB = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.execute(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form action="/login" method="POST">
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" required><br>
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" required><br>
      <button type="submit">Login</button>
    </form>
  `);
});

/* Forma correcta
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT username FROM users WHERE username = ? AND password = ?;`;

  try {
    const results = await queryDB(query, [username, password]);

    if (results.length > 0) {
      req.session.user = results[0];
      res.redirect('/products');
    } else {
      res.send('Datos incorrectos. <a href="/login">Volver al inicio</a>');
    }
  } catch (err) {
    res.send(`Error: ${err.message}`);
  }
});
*/

// Forma incorrecta
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    const query = `SELECT username FROM users WHERE username = '${username}' AND password = '${password}';`;
  
    try {
      db.query(query, (err, results) => {
        if (err) {
          res.send(`Error: ${err.message}`);
          return;
        }
  
        if (results.length > 0) {
          req.session.user = results[0];
          res.redirect('/products');
        } else {
          res.send('Datos incorrectos. <a href="/login">Volver al inicio</a>');
        }
      });
    } catch (err) {
      res.send(`Error: ${err.message}`);
    }
  });

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/products', isAuthenticated, async (req, res) => {
  const category = req.query.category || '';

  let query = `SELECT * FROM products WHERE released = 1`;

  if (category) {
    query += ` AND category = '${category}'`;
  }

  try {
    db.query(query, (err, results) => {
      if (err) {
        res.send(`Error: ${err.message}`);
        return;
      }

      res.send(`
        <h2>Productos</h2>
        <form method="get" action="/products">
          <label for="category">Selecciona una categoría:</label>
          <select name="category" id="category">
            <option value="">Todos</option>
            <option value="Tops" ${category === 'Tops' ? 'selected' : ''}>Tops</option>
            <option value="Camisetas" ${category === 'Camisetas' ? 'selected' : ''}>Camisetas</option>
            <option value="Pantalones" ${category === 'Pantalones' ? 'selected' : ''}>Pantalones</option>
            <option value="Gorros" ${category === 'Gorros' ? 'selected' : ''}>Gorros</option>
          </select>
          <button type="submit">Buscar</button>
        </form>
        
        <h3>Resultados para la categoría: ${category || 'Todos'}</h3>
        <pre>${JSON.stringify(results, null, 2)}</pre>
        <a href="/sesiones">Logs usuario</a></br>
        <a href="/logout">Logout</a>
      `);
    });
  } catch (err) {
    res.send(`Error: ${err.message}`);
  }
});

app.get('/sesiones', (req, res) => {
  res.send(`
    <h2>¿Aceptar ver sus inicios de sesión?</h2>
    <form action="/mis-logs" method="POST">
      <button type="submit">Ver logs</button>
    </form>
  `);
});

app.post('/mis-logs', (req, res) => {
  const sessionId = '1234567';
  res.cookie('IdSession', sessionId, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 });

  const idSession = req.cookies.IdSession || sessionId;

  const query = `SELECT * FROM sessions WHERE IdSession = '${idSession}'`;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(`SQL Error: ${err.message}`);
      return;
    }

    res.send(`
      <h2>Logs usuario</h2>
      <pre>${JSON.stringify(results, null, 2)}</pre>
      <a href="/logout">Logout</a>
    `);
  });
});


app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
