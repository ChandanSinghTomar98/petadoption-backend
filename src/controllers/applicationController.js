const Application = require('../models/Application');
const Pet = require('../models/Pet');
const { validationResult } = require('express-validator');

// Apply to adopt (authenticated user)
exports.apply = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { petId, message } = req.body;
    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    if (pet.status !== 'available') return res.status(400).json({ message: 'Pet not available for adoption' });

    // prevent duplicate application by same user
    const existing = await Application.findOne({ applicant: req.user._id, pet: petId });
    if (existing) return res.status(400).json({ message: 'You already applied for this pet' });

    const application = new Application({ applicant: req.user._id, pet: petId, message });
    await application.save();

    // Optionally update pet status to pending
    pet.status = 'pending';
    await pet.save();

    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
};

// User: view own applications
exports.myApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ applicant: req.user._id }).populate('pet');
    res.json(apps);
  } catch (err) {
    next(err);
  }
};

// Admin: list all applications
exports.listAll = async (req, res, next) => {
  try {
    const apps = await Application.find().populate('applicant', '-password').populate('pet');
    res.json(apps);
  } catch (err) {
    next(err);
  }
};

// Admin: approve/reject application
// exports.updateStatus = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     console.log("id",id)
//     const { status } = req.body; // 'approved' or 'rejected'
//     if (!['approved','rejected','withdrawn'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

//     const app = await Application.findById(id).populate('pet');
//     if (!app) return res.status(404).json({ message: 'Application not found' });

//     app.status = status;
//     await app.save();

//     // If approved, mark pet as adopted
//     if (status === 'approved') {
//       const pet = await Pet.findById(app.pet._id);
//       pet.status = 'adopted';
//       await pet.save();
//     } else if (status === 'rejected') {
//       const pet = await Pet.findById(app.pet._id);
//       pet.status = 'available';
//       await pet.save();
//     }

//     res.json(app);
//   } catch (err) {
//     next(err);
//   }
// };

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("Updating application:", id, "to:", status);

    const validStatuses = ["approved", "rejected", "withdrawn"];
    if (!validStatuses.includes(status?.toLowerCase())) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const app = await Application.findById(id).populate("pet");
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    app.status = status.toLowerCase();
    await app.save();

    // 🛡️ Safe pet update
    if (app.pet?._id) {
      const pet = await Pet.findById(app.pet._id);

      if (pet) {
        if (status.toLowerCase() === "approved") {
          pet.status = "adopted";
        } else {
          // For rejected/withdrawn, mark pet available
          pet.status = "available";
        }
        await pet.save();
      } else {
        console.warn("⚠️ No pet found for app", id, "— skipping pet update");
      }
    } else {
      console.warn("⚠️ Application has no pet reference", id);
    }

    // Refetch full updated record with pet
    const updatedApp = await Application.findById(app._id).populate("pet");
    res.json({ message: "Application updated successfully", app: updatedApp });
  } catch (err) {
    console.error("Error updating application:", err);
    next(err);
  }
};