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
const fuzzyApiUrl = 'http://127.0.0.1:5000';

app.use(cors());
app.use(express.json()); 

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
}).promise(); 

const mapKetebalanToString = (ketebalanInt) => {
  // Logika ini harus sesuai dengan yang dikirim ESP32
  // Jika ESP32 mengirim nilai mentah (misal 1-10), logika ini perlu disesuaikan
  // Asumsi saat ini: ESP32 mengirim 1, 2, atau 3
  if (ketebalanInt >= 8) return 'Tebal';
  if (ketebalanInt > 2) return 'Sedang';
  return 'Tipis';
};

app.get('/', (req, res) => {
  res.json({ message: 'Selamat datang di API Dashboard Fuzzy Logic!' });
});

app.get('/api/latest', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sensor_data ORDER BY id DESC LIMIT 1');
    if (rows.length === 0) return res.status(404).json({ message: 'Tidak ada data ditemukan.' });

    const rawData = rows[0]; // Gunakan variabel yang benar
    const latestData = { 
      ...rawData, 
      ketebalan: mapKetebalanToString(rawData.ketebalan),
      reasons: JSON.parse(rawData.reasons || '[]')  
    };

    res.json(latestData);
  } catch (error) {
    res.status(500).json({ message: 'Error server.' });
  }
});

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

app.get('/api/sensor-data', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) as total FROM sensor_data';
    let dataQuery = 'SELECT * FROM sensor_data';
    
    const queryParams = [];
    
    if (search) {
      const searchQuery = ' WHERE status LIKE ? OR tekanan LIKE ?';
      countQuery += searchQuery;
      dataQuery += searchQuery;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    dataQuery += ' ORDER BY id DESC LIMIT ? OFFSET ?';

    const [totalRows] = await db.query(countQuery, queryParams);
    const totalData = totalRows[0].total;
    const totalPages = Math.ceil(totalData / limit);
  
    const [data] = await db.query(dataQuery, [...queryParams, limit, offset]);

    res.json({
      data: data,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalData: totalData
      }
    });

  } catch (error) {
    console.error('Error fetching paginated data:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

app.post('/api/sensor-data', async (req, res) => {
  try {
    const { tekanan, suhu, ketebalan } = req.body;

    if (tekanan == null || suhu == null || ketebalan == null) {
      return res.status(400).json({ message: 'Data tidak lengkap.' });
    }

    const fuzzyResponse = await fetch(`${fuzzyApiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tekanan, suhu, ketebalan })
    });

    if (!fuzzyResponse.ok) {
        throw new Error('Gagal mendapatkan prediksi dari service fuzzy.');
    }

    const predictionResult = await fuzzyResponse.json();
    const statusPrediksi = predictionResult.status_prediksi;
    const reasons = predictionResult.reasons;

    const [result] = await db.query(
      'INSERT INTO sensor_data (tekanan, suhu, ketebalan, status, reasons) VALUES (?, ?, ?, ?, ?)',
      [tekanan, suhu, ketebalan, statusPrediksi, JSON.stringify(reasons)]
    );

    const [newDataRows] = await db.query('SELECT * FROM sensor_data WHERE id = ?', [result.insertId]);
    const rawNewData = newDataRows[0];

    const newData = {
        ...rawNewData,
        ketebalan: mapKetebalanToString(rawNewData.ketebalan), // <-- PERBAIKAN DI SINI
        reasons: JSON.parse(rawNewData.reasons || '[]'),
        time: new Date(rawNewData.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };

    io.emit('newData', newData);
    console.log('Data baru diproses & dikirim via Socket.IO:', newData);

    res.status(201).json({ message: 'Data berhasil disimpan dan diproses.', data: newData });
  } catch (error) {
    console.error('Error saat memproses data sensor:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

app.get('/api/weekly-summary', async (req, res) => {
  try {
    // Query untuk mengambil rata-rata dan distribusi status 7 hari terakhir
    const query = `
      SELECT 
        AVG(tekanan) as avgTekanan, 
        AVG(suhu) as avgSuhu,
        status, 
        COUNT(status) as count 
      FROM sensor_data 
      WHERE timestamp >= NOW() - INTERVAL 7 DAY 
      GROUP BY status;
    `;

    const [rows] = await db.query(query);

    if (rows.length === 0) {
      return res.json({
        avgTekanan: 0,
        avgSuhu: 0,
        statusDistribution: []
      });
    }

    // Kalkulasi rata-rata keseluruhan
    const totalCount = rows.reduce((sum, row) => sum + row.count, 0);
    const totalTekanan = rows.reduce((sum, row) => sum + (row.avgTekanan * row.count), 0);
    const totalSuhu = rows.reduce((sum, row) => sum + (row.avgSuhu * row.count), 0);
    
    const overallAvgTekanan = totalCount > 0 ? totalTekanan / totalCount : 0;
    const overallAvgSuhu = totalCount > 0 ? totalSuhu / totalCount : 0;

    // Format data untuk chart di frontend
    const statusDistribution = rows.map(row => ({
      name: row.status,
      value: row.count,
      // Berikan warna yang konsisten untuk chart
      fill: row.status === 'Baik' ? '#22c55e' : (row.status === 'Sedang' ? '#f59e0b' : '#ef4444')
    }));

    res.json({
      avgTekanan: parseFloat(overallAvgTekanan.toFixed(1)),
      avgSuhu: parseFloat(overallAvgSuhu.toFixed(1)),
      statusDistribution: statusDistribution
    });

  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

app.post('/api/simulate', async (req, res) => {
  try {
    const { tekanan, suhu, ketebalan } = req.body;
    const response = await fetch(`${fuzzyApiUrl}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tekanan, suhu, ketebalan })
    });
    if (!response.ok) {
        throw new Error('Gagal mendapatkan hasil simulasi dari service fuzzy.');
    }
    const simulationResult = await response.json();
    res.json(simulationResult);
  } catch (error) {
    console.error('Error pada endpoint simulasi:', error);
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
server.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});