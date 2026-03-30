 const router  = require('express').Router();
const Student = require('../models/Student');
const Mentor  = require('../models/Mentor');

router.get('/', async (req, res, next) => {
  try {
    const all = await Student.find();

    if (req.query.unassigned === 'true') {
      const mentors = await Mentor.find();
      const assignedIds = mentors.flatMap((m) => m.students.map((s) => s.toString()));
      const unassigned = all.filter((s) => !assignedIds.includes(s._id.toString()));
      return res.json(unassigned);
    }

    res.json(all);
  } catch (err) { next(err); }
});

module.exports = router;
