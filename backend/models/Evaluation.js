 const mongoose = require('mongoose');

const MarkSchema = new mongoose.Schema({
  parameter: { type: String, required: true },
  score:     { type: Number, min: 0, default: null },
  maxScore:  { type: Number, default: 10 },
});

const EvaluationSchema = new mongoose.Schema(
  {
    mentorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor',  required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    marks:     [MarkSchema],
    isLocked:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

EvaluationSchema.index({ mentorId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Evaluation', EvaluationSchema);