import { useEffect, useState } from 'react';
import { useParams }           from 'react-router-dom';
import { getMentor, getEvaluations, updateMarks, submitEvaluation } from '../api';
import Navbar from '../components/Navbar';

function Marks() {
  const { mentorId }          = useParams();
  const [mentor, setMentor]   = useState(null);
  const [evals, setEvals]     = useState([]);
  const [msg, setMsg]         = useState('');

  const load = async () => {
    const [m, e] = await Promise.all([getMentor(mentorId), getEvaluations(mentorId)]);
    setMentor(m.data);
    setEvals(e.data);
  };

  useEffect(() => { load(); }, [mentorId]);

  const handleScore = (evalId, paramIdx, value) => {
    setEvals((prev) =>
      prev.map((e) => {
        if (e._id !== evalId) return e;
        const marks = e.marks.map((m, i) =>
          i === paramIdx ? { ...m, score: value === '' ? null : Number(value) } : m
        );
        return { ...e, marks };
      })
    );
  };

  const saveMarks = async (evaluation) => {
    try {
      await updateMarks(evaluation._id, evaluation.marks);
      setMsg('Marks saved!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving marks');
    }
  };

  const submit = async () => {
    if (!window.confirm('Submit and lock all marks? This cannot be undone.')) return;
    try {
      await submitEvaluation(mentorId);
      setMsg('Submitted successfully! Marks are now locked.');
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error submitting');
    }
  };

  const totalMarks = (marks) =>
    marks.reduce((sum, m) => sum + (m.score || 0), 0);
  const maxTotal = (marks) =>
    marks.reduce((sum, m) => sum + m.maxScore, 0);

  if (!mentor) return <p style={{ padding: 32 }}>Loading...</p>;

  return (
    <>
      <Navbar mentorName={mentor.name} />
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>Assign Marks</h2>
            <p style={{ color: '#6b7280' }}>Fill in marks for all students before submitting</p>
          </div>
          {!mentor.isSubmitted && (
            <button onClick={submit} style={submitBtn}>Submit & Lock</button>
          )}
          {mentor.isSubmitted && (
            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: 8, fontWeight: 600 }}>
              ✅ Submitted & Locked
            </span>
          )}
        </div>

        {msg && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 16px', marginBottom: 20, color: '#1d4ed8' }}>
            {msg}
          </div>
        )}

        {evals.length === 0 && <p style={{ color: '#9ca3af' }}>No students assigned yet.</p>}

        {evals.map((evaluation) => (
          <div key={evaluation._id} style={evalCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ marginBottom: 2 }}>{evaluation.studentId?.name}</h3>
                <p style={{ fontSize: 13, color: '#6b7280' }}>
                  {evaluation.studentId?.rollNo} • {evaluation.studentId?.email}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#1e40af' }}>
                  {totalMarks(evaluation.marks)}/{maxTotal(evaluation.marks)}
                </p>
                <p style={{ fontSize: 12, color: '#6b7280' }}>Total</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={th}>Parameter</th>
                  <th style={th}>Score</th>
                  <th style={th}>Max</th>
                </tr>
              </thead>
              <tbody>
                {evaluation.marks.map((mark, idx) => (
                  <tr key={idx}>
                    <td style={td}>{mark.parameter}</td>
                    <td style={td}>
                      {evaluation.isLocked ? (
                        <span style={{ fontWeight: 600 }}>{mark.score}</span>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          max={mark.maxScore}
                          value={mark.score ?? ''}
                          onChange={(e) => handleScore(evaluation._id, idx, e.target.value)}
                          style={scoreInput}
                        />
                      )}
                    </td>
                    <td style={td}>{mark.maxScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!evaluation.isLocked && (
              <button onClick={() => saveMarks(evaluation)} style={saveBtn}>Save Marks</button>
            )}
            {evaluation.isLocked && (
              <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>🔒 Locked</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

const evalCard  = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20 };
const th        = { padding: '10px 16px', textAlign: 'left', fontSize: 13, color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' };
const td        = { padding: '10px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 15 };
const scoreInput = { width: 70, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 15 };
const saveBtn   = { background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600 };
const submitBtn = { background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 15 };

export default Marks;