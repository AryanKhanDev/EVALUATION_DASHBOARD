import { Link, useParams } from 'react-router-dom';

function Navbar({ mentorName }) {
  const { mentorId } = useParams();

  return (
    <nav style={{
      background: '#1e40af',
      color: '#fff',
      padding: '14px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 20 }}>
        EvalDashboard
      </Link>
      {mentorId && (
        <div style={{ display: 'flex', gap: 24 }}>
          <Link to={`/mentor/${mentorId}/students`} style={navLink}>Students</Link>
          <Link to={`/mentor/${mentorId}/marks`}    style={navLink}>Marks</Link>
          <Link to={`/mentor/${mentorId}/view`}     style={navLink}>View</Link>
        </div>
      )}
      {mentorName && <span style={{ fontSize: 14, opacity: 0.85 }}>{mentorName}</span>}
    </nav>
  );
}

const navLink = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: 15,
  opacity: 0.9,
};

export default Navbar;