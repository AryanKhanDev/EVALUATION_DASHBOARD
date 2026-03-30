import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMentors } from '../api';

function Dashboard() {
  const [mentors, setMentors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate                = useNavigate();

  useEffect(() => {
    getMentors()
      .then((res) => setMentors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 32 }}>Loading...</p>;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ marginBottom: 8 }}>Evaluation Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Select your mentor account to continue</p>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {mentors.map((mentor) => (
          <div
            key={mentor._id}
            onClick={() => navigate(`/mentor/${mentor._id}/students`)}
            style={cardStyle}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍🏫</div>
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>{mentor.name}</h2>
            <p style={{ color: '#6b7280', fontSize: 14 }}>{mentor.email}</p>
            <p style={{ marginTop: 12, fontSize: 13, color: mentor.isSubmitted ? '#16a34a' : '#d97706' }}>
              {mentor.isSubmitted ? '✅ Submitted' : `📋 ${mentor.students.length} student(s) assigned`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 24,
  width: 220,
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

export default Dashboard;