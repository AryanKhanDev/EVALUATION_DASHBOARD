import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Mentors
export const getMentors       = ()           => API.get('/mentors');
export const getMentor        = (id)         => API.get(`/mentors/${id}`);
export const assignStudent    = (mentorId, studentId) => API.post(`/mentors/${mentorId}/assign`, { studentId });
export const removeStudent    = (mentorId, studentId) => API.delete(`/mentors/${mentorId}/remove/${studentId}`);

// Students
export const getStudents      = ()           => API.get('/students');
export const getUnassigned    = ()           => API.get('/students?unassigned=true');

// Evaluations
export const getEvaluations   = (mentorId)   => API.get(`/evaluations/mentor/${mentorId}`);
export const updateMarks      = (evalId, marks) => API.put(`/evaluations/${evalId}/marks`, { marks });
export const submitEvaluation = (mentorId)   => API.post(`/evaluations/submit/${mentorId}`);