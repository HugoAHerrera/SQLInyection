# Proyecto sobre Inyección SQL - SPD

## 🚀 Pasos para la instalación y configuración
### 1. Instalar dependencias
- Ejecuta el siguiente comando en el terminal dentro de la raíz del proyecto: npm install

### 2. Configurar la base de datos
- Crea una base de datos MySQL en Azure
- Configura un archivo .env en la raíz del proyecto con los valores necesarios
- Schema de la base de datos:
  CREATE DATABASE tienda_online;
  USE tienda_online;
  
  CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE
  );
  
  INSERT INTO users (username, password, email) VALUES
  ('admin', 'micontraseña1234', 'adminSPD@gmail.com'),
  ('user1', 'password1', 'user1SPD@gmail.com'),
  ('user2', 'password2', 'user2SPD@gmail.com');
  
  CREATE TABLE products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(255),
      price DECIMAL(10, 2),
      released TINYINT(1) DEFAULT 0
  );
  
  INSERT INTO products (name, description, category, price, released) VALUES
  ('Top Básico', 'Top sencillo y cómodo, ideal para cualquier ocasión.', 'Tops', 19.99, 1),
  ('Camiseta de Algodón', 'Camiseta de algodón suave con un diseño minimalista.', 'Camisetas', 15.99, 1),
  ('Pantalón de Lona', 'Pantalón de lona resistente, perfecto para el día a día.', 'Pantalones', 39.99, 1),
  ('Gorro de Lana', 'Gorro de lana, ideal para los días fríos de invierno.', 'Gorros', 12.99, 1),
  ('Top Deportivo', 'Top deportivo de alta calidad para entrenamientos intensos.', 'Tops', 25.99, 1),
  ('Camiseta de Manga Larga', 'Camiseta de manga larga, ideal para climas frescos.', 'Camisetas', 22.99, 1),
  ('Pantalón de Chándal', 'Pantalón de chándal cómodo para actividades deportivas.', 'Pantalones', 29.99, 1),
  ('Gorro de Béisbol', 'Gorro tipo béisbol, perfecto para el verano.', 'Gorros', 18.99, 1),
  ('Top de Encaje', 'Top de encaje elegante, ideal para una salida nocturna.', 'Tops', 34.99, 0),
  ('Camiseta Estampada', 'Camiseta con estampado moderno y fresco.', 'Camisetas', 21.99, 0);
  
  CREATE TABLE sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      IdSession VARCHAR(50) NOT NULL,
      log_date DATE NOT NULL
  );
  
  INSERT INTO sessions (IdSession, log_date) VALUES
  ('1234567', '2024-11-01'),
  ('1234567', '2024-11-15'),
  ('1234567', '2024-11-30'),
  ('1234567', '2024-12-01'),
  ('1234567', '2024-12-15'),
  ('1234567', '2024-12-31');

### 3. Ejecutar el servidor:
- npm run server.js

# Miembros: Hugo Andrés Herrera de Miguel y Álvaro Sanz Cortés
