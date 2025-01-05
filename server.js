require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Conexión a la base de datos
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
});

// Función para consultar la base de datos
const queryDB = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.execute(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Middleware para proteger rutas
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Ruta: Página de login (predeterminada)
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Ruta: Página de login
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
      res.send('Invalid credentials. <a href="/login">Try again</a>');
    }
  } catch (err) {
    res.send(`Error: ${err.message}`);
  }
});
*/

// Forma incorrecta
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    // Consulta insegura que concatena directamente los valores proporcionados por el usuario
    const query = `SELECT username FROM users WHERE username = '${username}' AND password = '${password}';`;
  
    try {
      // Ejecuta la consulta
      db.query(query, (err, results) => {
        if (err) {
          res.send(`Error: ${err.message}`);
          return;
        }
  
        if (results.length > 0) {
          req.session.user = results[0]; // Guardar el usuario en la sesión
          res.redirect('/products');
        } else {
          res.send('Invalid credentials. <a href="/login">Try again</a>');
        }
      });
    } catch (err) {
      res.send(`Error: ${err.message}`);
    }
  });

// Ruta: Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Ruta: Buscar productos
app.get('/products', isAuthenticated, async (req, res) => {
  const category = req.query.category || ''; // Obtener categoría desde los parámetros de la URL

  // Consulta vulnerable sin parametrización (inseguro)
  let query = `SELECT * FROM products WHERE released = 1`;

  // Concatenamos la categoría directamente (esto es vulnerable a inyección SQL)
  if (category) {
    query += ` AND category = '${category}'`; // Inyección SQL posible aquí
  }

  try {
    db.query(query, (err, results) => {
      if (err) {
        res.send(`Error: ${err.message}`);
        return;
      }

      // Respuesta HTML mostrando los productos de la categoría seleccionada
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
        <a href="/logout">Logout</a>
      `);
    });
  } catch (err) {
    res.send(`Error: ${err.message}`);
  }
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
