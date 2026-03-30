const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');
const Mentor   = require('./models/Mentor');
const Student  = require('./models/Student');

const students = [
  { name: 'Alice Johnson', email: 'aryankhan7847@gmail.com', rollNo: 'CS001' },
  { name: 'Bob Smith',     email: 'bob@college.edu',   rollNo: 'CS002' },
  { name: 'Carol White',   email: 'carol@college.edu', rollNo: 'CS003' },
  { name: 'David Brown',   email: 'david@college.edu', rollNo: 'CS004' },
  { name: 'Eva Martinez',  email: 'eva@college.edu',   rollNo: 'CS005' },
  { name: 'Frank Lee',     email: 'frank@college.edu', rollNo: 'CS006' },
  { name: 'Grace Kim',     email: 'grace@college.edu', rollNo: 'CS007' },
  { name: 'Henry Wilson',  email: 'henry@college.edu', rollNo: 'CS008' },
];

const mentors = [
  { name: 'Dr. Priya Sharma', email: 'priya@college.edu' },
  { name: 'Prof. Raj Mehta',  email: 'raj@college.edu'   },
  { name: 'Dr. Sara Khan',    email: 'sara@college.edu'  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');
  await Student.deleteMany();
  await Mentor.deleteMany();
  await Student.insertMany(students);
  await Mentor.insertMany(mentors);
  console.log('Seeded 8 students and 3 mentors');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });