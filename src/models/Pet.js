const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  species: { type: String, required: true }, // e.g., Dog, Cat
  breed: { type: String },
  age: { type: Number },
  description: { type: String },
  photos: [{ type: String }], // URLs; can replace with file upload later
  status: { type: String, enum: ['available','pending','adopted','removed'], default: 'available' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pet', PetSchema);
