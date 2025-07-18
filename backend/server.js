const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const http = require('http'); 
const { Server } = require("socket.io");
require('dotenv').config(); 

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Izinkan koneksi dari React dev server
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3001; 
const fuzzyApiUrl = 'http://127.0.0.1:5000/predict';

app.use(cors()); // Mengizinkan Cross-Origin Resource Sharing
app.use(express.json()); // Mem-parsing body request sebagai JSON

// Konfigurasi koneksi database menggunakan connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
}).promise(); // Menggunakan .promise() untuk memakai async/await

// --- Helper Function ---
// Fungsi untuk memetakan integer 'ketebalan' dari DB ke string yang mudah dibaca
const mapKetebalanToString = (ketebalanInt) => {
  // Disesuaikan dengan pemetaan di ESP32
  if (ketebalanInt === 1) return 'Tebal';
  if (ketebalanInt === 2) return 'Sedang';
  if (ketebalanInt === 3) return 'Tipis';
  return 'Tidak Diketahui';
};

// --- API Endpoints ---

// Endpoint dasar untuk mengecek apakah server berjalan
app.get('/', (req, res) => {
  res.json({ message: 'Selamat datang di API Dashboard Fuzzy Logic!' });
});

// Endpoint untuk mendapatkan data sensor TERAKHIR
app.get('/api/latest', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sensor_data ORDER BY id DESC LIMIT 1');
    if (rows.length === 0) return res.status(404).json({ message: 'Tidak ada data ditemukan.' });
    const latestData = { ...rows[0], ketebalan: mapKetebalanToString(rows[0].ketebalan) };
    res.json(latestData);
  } catch (error) {
    res.status(500).json({ message: 'Error server.' });
  }
});

// Endpoint untuk mendapatkan data HISTORIS (misal: 5 data terakhir)
app.get('/api/historical', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sensor_data ORDER BY id DESC LIMIT 5');
    const formattedData = rows.map(row => ({
      ...row,
      ketebalan: mapKetebalanToString(row.ketebalan),
      time: new Date(row.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    })).reverse();
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Error server.' });
  }
});

app.post('/api/sensor-data', async (req, res) => {
  try {
    const { tekanan, suhu, ketebalan } = req.body;

    if (tekanan == null || suhu == null || ketebalan == null) {
      return res.status(400).json({ message: 'Data tidak lengkap.' });
    }

    // --- Panggil API Fuzzy Logic Python ---
    const fuzzyResponse = await fetch(fuzzyApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tekanan, suhu, ketebalan })
    });

    if (!fuzzyResponse.ok) {
        throw new Error('Gagal mendapatkan prediksi dari service fuzzy.');
    }

    const predictionResult = await fuzzyResponse.json();
    const statusPrediksi = predictionResult.status_prediksi;
    // ------------------------------------

    // Masukkan data DAN hasil prediksi ke database
    const [result] = await db.query(
      'INSERT INTO sensor_data (tekanan, suhu, ketebalan, status) VALUES (?, ?, ?, ?)',
      [tekanan, suhu, ketebalan, statusPrediksi]
    );

    const [newDataRows] = await db.query('SELECT * FROM sensor_data WHERE id = ?', [result.insertId]);
    const newData = {
        ...newDataRows[0],
        ketebalan: mapKetebalanToString(newDataRows[0].ketebalan),
        time: new Date(newDataRows[0].timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };

    io.emit('newData', newData);
    console.log('Data baru diproses & dikirim via Socket.IO:', newData);

    res.status(201).json({ message: 'Data berhasil disimpan dan diproses.', data: newData });
  } catch (error) {
    console.error('Error saat memproses data sensor:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

io.on('connection', (socket) => {
  console.log('User terhubung:', socket.id);
  socket.on('disconnect', () => {
    console.log('User terputus:', socket.id);
  });
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
