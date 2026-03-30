const router  = require('express').Router();
const Mentor  = require('../models/Mentor');

router.get('/', async (req, res, next) => {
  try {
    const mentors = await Mentor.find().populate('students');
    res.json(mentors);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate('students');
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    res.json(mentor);
  } catch (err) { next(err); }
});

router.post('/:id/assign', async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    if (mentor.isSubmitted) return res.status(400).json({ message: 'Marks already submitted' });

    if (mentor.students.length >= 4)
      return res.status(400).json({ message: 'Cannot assign more than 4 students' });

    const { studentId } = req.body;

    const conflict = await Mentor.findOne({ students: studentId });
    if (conflict)
      return res.status(400).json({ message: 'Student already assigned to another mentor' });

    if (mentor.students.map(s => s.toString()).includes(studentId))
      return res.status(400).json({ message: 'Student already assigned to you' });

    mentor.students.push(studentId);
    await mentor.save();

    const Evaluation = require('../models/Evaluation');
    await Evaluation.create({
      mentorId:  mentor._id,
      studentId,
      marks: [
        { parameter: 'Ideation',   maxScore: 10 },
        { parameter: 'Execution',  maxScore: 10 },
        { parameter: 'Viva/Pitch', maxScore: 10 },
      ],
    });

    res.json(await Mentor.findById(mentor._id).populate('students'));
  } catch (err) { next(err); }
});

router.delete('/:id/remove/:studentId', async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    if (mentor.isSubmitted) return res.status(400).json({ message: 'Marks already submitted' });

    mentor.students = mentor.students.filter(
      (s) => s.toString() !== req.params.studentId
    );
    await mentor.save();

    const Evaluation = require('../models/Evaluation');
    await Evaluation.deleteOne({ mentorId: mentor._id, studentId: req.params.studentId });

    res.json(await Mentor.findById(mentor._id).populate('students'));
  } catch (err) { next(err); }
});

module.exports = router;