import { useEffect, useState } from 'react';
import { useParams }           from 'react-router-dom';
import { getMentor, getEvaluations } from '../api';
import Navbar from '../components/Navbar';
function View() {
  const { mentorId }        = useParams();
  const [mentor, setMentor] = useState(null);
  const [evals, setEvals]   = useState([]);
  const [filter, setFilter] = useState('all'); // all | graded | ungraded

  useEffect(() => {
    Promise.all([getMentor(mentorId), getEvaluations(mentorId)]).then(([m, e]) => {
      setMentor(m.data);
      setEvals(e.data);
    });
  }, [mentorId]);

  const isFullyGraded = (e) => e.marks.every((m) => m.score !== null && m.score !== undefined);

  const filtered = evals.filter((e) => {
    if (filter === 'graded')   return isFullyGraded(e);
    if (filter === 'ungraded') return !isFullyGraded(e);
    return true;
  });

  const totalMarks = (marks) => marks.reduce((sum, m) => sum + (m.score || 0), 0);
  const maxTotal   = (marks) => marks.reduce((sum, m) => sum + m.maxScore, 0);

  if (!mentor) return <p style={{ padding: 32 }}>Loading...</p>;

  return (
    <>
      <Navbar mentorName={mentor.name} />
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>View Evaluations</h2>
            <p style={{ color: '#6b7280' }}>{mentor.name}'s students</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'graded', 'ungraded'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: filter === f ? '#1e40af' : '#fff',
                  color:      filter === f ? '#fff'    : '#374151',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <p style={{ color: '#9ca3af' }}>No students match this filter.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map((evaluation) => (
            <div key={evaluation._id} style={viewCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ marginBottom: 2 }}>{evaluation.studentId?.name}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>{evaluation.studentId?.rollNo}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: '#1e40af' }}>
                    {totalMarks(evaluation.marks)}/{maxTotal(evaluation.marks)}
                  </p>
                  {evaluation.isLocked && <span style={{ fontSize: 12, color: '#16a34a' }}>🔒 Locked</span>}
                </div>
              </div>

              {evaluation.marks.map((mark, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 14, color: '#374151' }}>{mark.parameter}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {mark.score !== null && mark.score !== undefined ? `${mark.score}/${mark.maxScore}` : '—'}
                  </span>
                </div>
              ))}

              <div style={{ marginTop: 12 }}>
                <span style={{
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: isFullyGraded(evaluation) ? '#dcfce7' : '#fef3c7',
                  color:      isFullyGraded(evaluation) ? '#16a34a' : '#d97706',
                  fontWeight: 600,
                }}>
                  {isFullyGraded(evaluation) ? 'Graded' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const viewCard = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 };

export default View;