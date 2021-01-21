'use strict'

const mysql = require('mysql2')
const { promisify } = require('util')

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
})

pool.getConnection((error, connection) => {
  if (error) {
    if (error.code == 'PROTOCOL_CONNECTION_LOST') {
      console.error('La conexión a la base de datos fue cerrada')
    }
    if (error.code == 'ER_CON_COUNT_ERROR') {
      console.error('La base de datos tiene demasiadas conexiones')
    }
    if (error.code == 'ECONNREFUSED') {
      console.error('La conexión a la base de datos fue rechazada')
    }
  }
  if (connection) connection.release()
  console.log('La conexión a la base de datos fue realizada con éxito')
  return
})

pool.query = promisify(pool.query)

module.exports = pool