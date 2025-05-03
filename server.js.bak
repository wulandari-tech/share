const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');
const { File } = require('./models/file'); // Pastikan model file sudah dibuat

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());

// Setup penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Koneksi ke MongoDB
mongoose.connect('mongodb+srv://zanssxploit:pISqUYgJJDfnLW9b@cluster0.fgram.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// Endpoint untuk upload file
app.post('/upload', upload.single('file'), async (req, res) => {
  const { title, author } = req.body;
  const file = req.file;
  const fileSizeInMB = file.size / (1024 * 1024); // Convert byte ke MB

  // Simpan file ke MongoDB
  const newFile = new File({
    title: title,
    author: author,
    filename: file.filename,
    filetype: file.mimetype.split('/')[1],
    size: fileSizeInMB, // Ukuran file dalam MB
  });

  await newFile.save();
  res.json({ message: 'File uploaded successfully' });
});

// Endpoint untuk menampilkan file dengan filter ukuran
app.get('/files', async (req, res) => {
  const { type, size } = req.query;

  // Menyaring file berdasarkan query filter
  let query = {};

  // Filter berdasarkan jenis file
  if (type) {
    query.filetype = type;
  }

  // Filter berdasarkan ukuran file (dalam MB)
  if (size) {
    const sizeInMB = parseFloat(size);  // Mengonversi ukuran ke angka
    if (sizeInMB === 1) {
      query.size = { $lt: 1 };  // File yang ukurannya kurang dari 1MB
    } else if (sizeInMB === 5) {
      query.size = { $gte: 1, $lte: 5 };  // File antara 1MB hingga 5MB
    } else if (sizeInMB === 10) {
      query.size = { $gt: 5 };  // File yang lebih besar dari 5MB
    }
  }

  // Ambil file berdasarkan filter
  const files = await File.find(query);
  res.json(files);
});

app.delete('/delete/:id', async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (file) {
      const fs = require('fs');
      const filePath = path.join(__dirname, 'uploads', file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.status(200).json({ message: 'File dihapus' });
    } else {
      res.status(404).json({ error: 'File tidak ditemukan' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus file' });
  }
});

// Endpoint untuk mengakses halaman utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint untuk mengakses halaman admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Menjalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
