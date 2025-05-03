const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  filename: { type: String, required: true },
  filetype: { type: String, required: true },
  size: { type: Number, required: true }, // Ukuran dalam MB
});

module.exports.File = mongoose.model('File', fileSchema);
