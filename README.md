# 🌄 Espíritu de Montaña – Backend API
Backend del proyecto Espíritu de Montaña, una plataforma de turismo en Colombia pensada para viajeros nacionales y extranjeros que buscan recorrer el país.

Este repositorio contiene la API REST desarrollada con Node.js + Express, conectada a una base de datos y a ApostropheCMS para gestionar contenidos dinámicos (textos, imágenes y experiencias turísticas).

## 🚀 Tecnologías usadas

- Node.js + Express.js – Core backend
- MongoDB + Mongoose – Base de datos NoSQL y ORM
- EJS + express-ejs-layouts – Templates dinámicos
- Axios – Consumo de APIs externas
- bcrypt – Encriptación de contraseñas
- jsonwebtoken (JWT) – Autenticación segura
- express-session – Manejo de sesiones
- express-validator – Validación de datos
- cors – Seguridad y acceso cross-origin
- multer – Upload de archivos
- cookie-parser – Manejo de cookies
- connect-mongo – Sesiones en base de datos
- moment – Manejo de fechas
- morgan – Logging de peticiones
- node-cron – Tareas programadas
- passport-local – Autenticación local
- resend – Envío de correos
- dotenv – Variables de entorno
- http-errors – Manejo de errores
- nodemon – Desarrollo en caliente

## 📂 Funcionalidades principales

- CRUD de destinos y experiencias turísticas
- Sistema de usuarios con autenticación (JWT + sesiones)
- Manejo de sesiones con persistencia en MongoDB
- Subida y gestión de archivos con Multer
- Renderizado dinámico de vistas con EJS
- Tareas automáticas programadas con node-cron
- Envío de correos automáticos con Resend
- Seguridad básica con CORS, cookies y validaciones

## 📂 Estructura del proyecto

├── src/

│   ├── config/        # Configuración (db, passport, etc.)

│   ├── controllers/   # Lógica de negocio

│   ├── models/        # Modelos con Mongoose

│   ├── routes/        # Endpoints de la API

│   ├── middlewares/   # Middlewares de seguridad/validación

│   ├── views/         # Templates EJS

│   └── app.js         # Configuración principal de Express

├── .env.example       # Variables de entorno

├── package.json

└── README.md

## 👨‍💻 Autor

Felipe Román
Fullstack Developer (Frontend + Backend)
