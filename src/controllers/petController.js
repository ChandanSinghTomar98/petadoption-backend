const Pet = require('../models/Pet');
const { validationResult } = require('express-validator');

// Create pet (admin)
exports.createPet = async (req, res, next) => {
  try {
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const pet = new Pet(req.body);
    // if files uploaded before creation, req.files may contain photos
    if (req.files && req.files.length) {
      pet.photos = req.files.map(f => `/uploads/${f.filename}`);
    }
    await pet.save();
    res.status(201).json(pet);
  } catch (err) {
    next(err);
  }
};

// Upload photos for existing pet (admin)
exports.uploadPhotos = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    if (!req.files || !req.files.length) return res.status(400).json({ message: 'No files uploaded' });

    const urls = req.files.map(f => `/uploads/${f.filename}`);
    pet.photos = pet.photos.concat(urls);
    await pet.save();
    res.json({ pet });
  } catch (err) {
    next(err);
  }
};

// Update pet (admin)
// exports.updatePet = async (req, res, next) => {
//   try {
//     const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!pet) return res.status(404).json({ message: 'Pet not found' });
//     res.json(pet);
//   } catch (err) {
//     next(err);
//   }
// };


exports.updatePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    // Update body fields
    Object.assign(pet, req.body);

    // Handle new photo uploads
    if (req.files && req.files.length > 0) {
      const urls = req.files.map(f => `/uploads/${f.filename}`);
      pet.photos = urls; // or pet.photos.concat(urls) to keep old ones
    }

    await pet.save();
    res.json(pet);
  } catch (err) {
    next(err);
  }
};

// Delete pet (admin)
exports.deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    res.json({ message: 'Pet removed' });
  } catch (err) {
    next(err);
  }
};

// Get single pet (public)
exports.getPet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    res.json(pet);
  } catch (err) {
    next(err);
  }
};

// List pets with search/filter/pagination
exports.listPets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, q, species, breed, minAge, maxAge, status = 'available' } = req.query;
    const filter = {};

    // if (status) filter.status = status;
    // if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { breed: new RegExp(q, 'i') }];
    // if (species) filter.species = species;
    // if (breed) filter.breed = breed;
        if (status) filter.status = new RegExp(`^${status}$`, 'i');
    if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { species: new RegExp(q, 'i') }];
    if (species) filter.species = new RegExp(`^${species}$`, 'i');
    if (breed) filter.breed = new RegExp(`^${breed}$`, 'i');
   
    if (minAge !== undefined) filter.age = { ...filter.age, $gte: Number(minAge) };
    if (maxAge !== undefined) filter.age = { ...filter.age, $lte: Number(maxAge) };

    const skip = (Number(page) - 1) * Number(limit);
    const [pets, total] = await Promise.all([
      Pet.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Pet.countDocuments(filter)
    ]);

    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
      data: pets
    });
  } catch (err) {
    next(err);
  }
};
