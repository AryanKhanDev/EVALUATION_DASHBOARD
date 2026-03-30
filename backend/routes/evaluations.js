 
const router     = require('express').Router();
const Evaluation = require('../models/Evaluation');
const Mentor     = require('../models/Mentor');
const nodemailer = require('nodemailer');

router.get('/mentor/:mentorId', async (req, res, next) => {
  try {
    const evals = await Evaluation.find({ mentorId: req.params.mentorId })
      .populate('studentId');
    res.json(evals);
  } catch (err) { next(err); }
});

router.put('/:id/marks', async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) return res.status(404).json({ message: 'Evaluation not found' });
    if (evaluation.isLocked) return res.status(400).json({ message: 'Marks are locked' });

    evaluation.marks = req.body.marks;
    await evaluation.save();
    res.json(evaluation);
  } catch (err) { next(err); }
});

router.post('/submit/:mentorId', async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId);
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

    if (mentor.students.length < 3)
      return res.status(400).json({ message: 'You need at least 3 students to submit' });

    const evals = await Evaluation.find({ mentorId: req.params.mentorId });

    const hasUngraded = evals.some((e) =>
      e.marks.some((m) => m.score === null || m.score === undefined)
    );
    if (hasUngraded)
      return res.status(400).json({ message: 'All marks must be filled before submitting' });

    await Evaluation.updateMany({ mentorId: req.params.mentorId }, { isLocked: true });
    mentor.isSubmitted = true;
    await mentor.save();

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      const populated = await Mentor.findById(req.params.mentorId).populate('students');
      for (const student of populated.students) {
        await transporter.sendMail({
          from:    process.env.EMAIL_USER,
          to:      student.email,
          subject: 'Your evaluation has been completed',
          text:    `Hi ${student.name},\n\nYour mentor ${mentor.name} has completed your evaluation.\n\nRegards,\nEvaluation System`,
        });
      }
    } catch (mailErr) {
      console.error('Email error:', mailErr.message);
    }

    res.json({ message: 'Submitted and locked successfully' });
  } catch (err) { next(err); }
});

module.exports = router;