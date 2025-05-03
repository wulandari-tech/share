const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const { File } = require('./models/file'); // Pastikan model file sudah dibuat
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());


// Koneksi ke MongoDB
const mongoURI = 'mongodb+srv://zanssxploit:pISqUYgJJDfnLW9b@cluster0.fgram.mongodb.net/?retryWrites=true&w=majority';
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// Inisialisasi GridFS Storage
let gfs;
conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});


const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
          });
      });
  }
});

const upload = multer({ storage });


// Endpoint untuk upload file
app.post('/upload', upload.single('file'), async (req, res) => {
    try {  
        const { title, author } = req.body;
        const fileSizeInMB = req.file.size / (1024 * 1024);

    // Simpan metadata file ke MongoDB
    const newFile = new File({
        title: title,
        author: author,
        filename: req.file.filename,
        filetype: req.file.mimetype.split('/')[1],
        size: fileSizeInMB, // Ukuran file dalam MB
        fileId: req.file.id // Simpan fileId dari GridFS
    });

    await newFile.save();
    res.json({ message: 'File uploaded successfully', fileId: req.file.id });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).send("Error uploading file");
    }
});

// Endpoint untuk mengambil file
app.get('/uploads/:filename', (req, res) => {
try {
    gfs.find({ filename: req.params.filename }).toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'no files exist'
            });
        }
    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
} catch (error) {
    console.error("Error downloading file:", error);
        res.status(500).send("Error downloading file");
}
});

// Endpoint untuk menampilkan file dengan filter ukuran
app.get('/files', async (req, res) => {
    try {
        const { type, size } = req.query;

        let query = {};

    if (type) {
            query.filetype = type;
        }

        if (size) {
        const sizeInMB = parseFloat(size);
        if (sizeInMB === 1) {
          query.size = { $lt: 1 };
        } else if (sizeInMB === 5) {
          query.size = { $gte: 1, $lte: 5 };
        } else if (sizeInMB === 10) {
          query.size = { $gt: 5 };
        }
      }


    const files = await File.find(query);
        res.json(files);
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).send("Error fetching files");
  }
});


app.delete('/delete/:id', async (req, res) => {
    try {
      const file = await File.findByIdAndDelete(req.params.id);
        if (file) {          
            await gfs.delete(new mongoose.Types.ObjectId(file.fileId)); // Hapus file dari GridFS menggunakan fileId
            res.status(200).json({ message: 'File dan metadata dihapus' });
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
