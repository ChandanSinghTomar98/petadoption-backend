const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  message: { type: String },
  status: { type: String, enum: ['applied','approved','rejected','withdrawn'], default: 'applied' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

ApplicationSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);
