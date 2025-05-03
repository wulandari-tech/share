const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.json());
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Tidak ada file yang diunggah');
  }
  res.status(200).json({
    message: 'File berhasil diunggah',
    file: req.file
  });
});
app.get('/files', (req, res) => {
  const fs = require('fs');
  const directoryPath = path.join(__dirname, 'uploads');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send('Tidak dapat membaca folder uploads');
    }
    const fileDetails = files.map(file => ({
      name: file,
      type: path.extname(file)
    }));

    res.json(fileDetails);
  });
});
  const files = await File.find(query);
  res.json(files);
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
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

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
