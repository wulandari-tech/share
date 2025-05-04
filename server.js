import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const PORT = process.env.PORT || 3000

mongoose.connect('mongodb+srv://zanssxploit:pISqUYgJJDfnLW9b@cluster0.fgram.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const fileSchema = new mongoose.Schema({
  title: String,
  author: String,
  filename: String,
  filetype: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now }
})

const File = mongoose.model('File', fileSchema)

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})

const upload = multer({ storage })

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})
app.get('/edit', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'edit.html'))
})

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'))
})

app.get('/files', async (req, res) => {
  const files = await File.find().sort({ uploadedAt: -1 })
  res.json(files)
})

app.post('/upload', upload.single('file'), async (req, res) => {
  const { title, author } = req.body
  const file = req.file

  if (!file) return res.status(400).json({ message: 'File tidak ditemukan' })

  const newFile = new File({
    title,
    author,
    filename: file.filename,
    filetype: path.extname(file.originalname).slice(1),
    size: file.size
  })

  await newFile.save()
  res.status(200).json({ message: 'Upload berhasil' })
})

app.delete('/files/:id', async (req, res) => {
  const file = await File.findByIdAndDelete(req.params.id)
  if (file) {
    const filepath = path.join(__dirname, 'uploads', file.filename)
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
    res.status(200).send('Deleted')
  } else {
    res.status(404).send('File not found')
  }
})
app.get('/files/preview/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send('File not found');
    
    const filepath = path.join(__dirname, 'uploads', file.filename);
    if (fs.existsSync(filepath)) {
      const fileContent = fs.readFileSync(filepath, 'utf-8'); // membaca konten file
      res.send(fileContent); // mengirimkan isi file ke client
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    res.status(500).send('Error reading file');
  }
});


app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`)
})
