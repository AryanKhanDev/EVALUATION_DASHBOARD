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
  const session = await Mentor.startSession();
  session.startTransaction();
  
  try {
    const mentor = await Mentor.findById(req.params.id).session(session);
    if (!mentor) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    if (mentor.isSubmitted) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Marks already submitted' });
    }

    if (mentor.students.length >= 4) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cannot assign more than 4 students' });
    }

    const { studentId } = req.body;

    // Check within transaction (atomic)
    const conflict = await Mentor.findOne({ students: studentId }).session(session);
    if (conflict) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Student already assigned to another mentor' });
    }

    if (mentor.students.map(s => s.toString()).includes(studentId)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Student already assigned to you' });
    }

    // Assign student
    mentor.students.push(studentId);
    await mentor.save({ session });

    // Create evaluation in same transaction
    const Evaluation = require('../models/Evaluation');
    await Evaluation.create([{
      mentorId:  mentor._id,
      studentId,
      marks: [
        { parameter: 'Ideation',   maxScore: 10 },
        { parameter: 'Execution',  maxScore: 10 },
        { parameter: 'Viva/Pitch', maxScore: 10 },
      ],
    }], { session });

    await session.commitTransaction();
    res.json(await Mentor.findById(mentor._id).populate('students'));
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
});

router.delete('/:id/remove/:studentId', async (req, res, next) => {
  const session = await Mentor.startSession();
  session.startTransaction();
  
  try {
    const mentor = await Mentor.findById(req.params.id).session(session);
    if (!mentor) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    if (mentor.isSubmitted) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Marks already submitted' });
    }

    // Remove student from array
    mentor.students = mentor.students.filter(
      (s) => s.toString() !== req.params.studentId
    );
    await mentor.save({ session });

    // Delete evaluation in same transaction
    const Evaluation = require('../models/Evaluation');
    await Evaluation.deleteOne(
      { mentorId: mentor._id, studentId: req.params.studentId },
      { session }
    );

    await session.commitTransaction();
    res.json(await Mentor.findById(mentor._id).populate('students'));
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
});

module.exports = router;