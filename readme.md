# 🚗 Dashboard Fuzzy – Sistem Monitoring Data Sensor

Sistem dashboard berbasis web untuk menampilkan dan memantau data sensor seperti tekanan, suhu, dan ketebalan menggunakan logika fuzzy. Dibuat dengan stack **React.js**, **Tailwind CSS**, **Express.js**, dan **MySQL**.

---

## 🧱 Teknologi yang Digunakan

### Frontend
- [React.js](https://reactjs.org/)
- [Vite](https://vitejs.dev/) – Bundler modern
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
- [Recharts](https://recharts.org/) – Chart visualisation
- [Axios](https://axios-http.com/) – HTTP client
- [React Router DOM](https://reactrouter.com/)

### Backend
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MySQL2](https://www.npmjs.com/package/mysql2) – Koneksi ke database
- [dotenv](https://www.npmjs.com/package/dotenv) – Konfigurasi environment

---

## 📁 Struktur Folder

```
dashboard-fuzzy/
├── backend/              # Backend Express API
│   ├── index.js
│   ├── db.js
│   └── .env
├── frontend/             # Frontend React App
│   ├── src/
│   ├── public/
│   └── vite.config.js
├── logic/                # Logika Fuzzy
|   ├── app.py
└── README.md
```

---

## ⚙️ Cara Menjalankan Proyek

### 1. Clone Repositori
```bash
git clone https://github.com/ReftitoMuhammad/dashboard-fuzzy.git
cd dashboard-fuzzy
```

### 2. Jalankan Backend
```bash
cd backend
npm install
cp .env.example .env # lalu isi sesuai konfigurasi MySQL kamu
node index.js
```

### 3. Jalankan Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Contoh Format `.env` untuk Backend

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dashboard
PORT=5000
```

---

## 📊 Fitur Utama

- Visualisasi data tekanan, suhu, dan ketebalan
- Pengambilan data dari database MySQL
- Pengolahan data dengan fuzzy logic (opsional)
- UI modern dan responsif dengan Tailwind CSS
- Routing halaman menggunakan React Router

---

## 🔐 To Do (Roadmap)
- [ ] Autentikasi login dengan JWT
- [ ] Role-based dashboard (admin/user)
- [ ] Fuzzy logic processing di backend
- [ ] Export data ke CSV/Excel
- [ ] Realtime update menggunakan WebSocket

---

## 🙌 Kontribusi

Pull request sangat diterima! Silakan fork proyek ini dan ajukan PR jika ingin menambahkan fitur atau perbaikan bug.

---

## 👨‍💼 Author

Made with ❤️ by [Reftito Muhammad](https://github.com/ReftitoMuhammad)

---

## 📄 License

MIT License

