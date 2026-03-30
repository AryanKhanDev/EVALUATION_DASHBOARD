import { useEffect, useState } from 'react';
import { useParams }           from 'react-router-dom';
import { getMentor, getUnassigned, assignStudent, removeStudent } from '../api';
import Navbar from '../components/Navbar';

function Students() {
  const { mentorId }          = useParams();
  const [mentor, setMentor]   = useState(null);
  const [available, setAvail] = useState([]);
  const [msg, setMsg]         = useState('');

  const load = async () => {
    const [m, a] = await Promise.all([getMentor(mentorId), getUnassigned()]);
    setMentor(m.data);
    setAvail(a.data);
  };

  useEffect(() => { load(); }, [mentorId]);

  const assign = async (studentId) => {
    try {
      await assignStudent(mentorId, studentId);
      setMsg('Student assigned!');
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  const remove = async (studentId) => {
    try {
      await removeStudent(mentorId, studentId);
      setMsg('Student removed!');
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  if (!mentor) return <p style={{ padding: 32 }}>Loading...</p>;

  return (
    <>
      <Navbar mentorName={mentor.name} />
      <div style={{ padding: 32 }}>
        <h2 style={{ marginBottom: 4 }}>Manage Students</h2>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>
          {mentor.students.length}/4 students assigned (min 3, max 4)
        </p>

        {msg && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 16px', marginBottom: 20, color: '#1d4ed8' }}>
            {msg}
          </div>
        )}

        {/* Assigned students */}
        <h3 style={{ marginBottom: 12 }}>Assigned Students</h3>
        {mentor.students.length === 0 && <p style={{ color: '#9ca3af', marginBottom: 24 }}>No students assigned yet.</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
          {mentor.students.map((s) => (
            <div key={s._id} style={assignedCard}>
              <div>
                <p style={{ fontWeight: 600 }}>{s.name}</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{s.rollNo} • {s.email}</p>
              </div>
              {!mentor.isSubmitted && (
                <button onClick={() => remove(s._id)} style={removeBtn}>Remove</button>
              )}
            </div>
          ))}
        </div>

        {/* Available students */}
        {!mentor.isSubmitted && (
          <>
            <h3 style={{ marginBottom: 12 }}>Available Students</h3>
            {available.length === 0 && <p style={{ color: '#9ca3af' }}>All students are assigned.</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {available.map((s) => (
                <div key={s._id} style={availableCard}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{s.name}</p>
                    <p style={{ fontSize: 13, color: '#6b7280' }}>{s.rollNo} • {s.email}</p>
                  </div>
                  <button onClick={() => assign(s._id)} style={assignBtn}>Assign</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

const assignedCard  = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, minWidth: 280 };
const availableCard = { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, minWidth: 280 };
const removeBtn     = { background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600 };
const assignBtn     = { background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600 };

export default Students;