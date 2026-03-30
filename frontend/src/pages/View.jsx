import { useEffect, useState } from 'react';
import { useParams }           from 'react-router-dom';
import { getMentor, getEvaluations } from '../api';
import Navbar from '../components/Navbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function View() {
  const { mentorId }        = useParams();
  const [mentor, setMentor] = useState(null);
  const [evals, setEvals]   = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    Promise.all([getMentor(mentorId), getEvaluations(mentorId)]).then(([m, e]) => {
      setMentor(m.data);
      setEvals(e.data);
    });
  }, [mentorId]);

  const isFullyGraded = (e) => e.marks.every((m) => m.score !== null && m.score !== undefined);
  const totalMarks    = (marks) => marks.reduce((sum, m) => sum + (m.score || 0), 0);
  const maxTotal      = (marks) => marks.reduce((sum, m) => sum + m.maxScore, 0);

  const filtered = evals.filter((e) => {
    if (filter === 'graded')   return isFullyGraded(e);
    if (filter === 'ungraded') return !isFullyGraded(e);
    return true;
  });

  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175);
    doc.text('Evaluation Marksheet', 105, 20, { align: 'center' });

    // Mentor info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Mentor: ${mentor.name}`, 14, 35);
    doc.text(`Email:  ${mentor.email}`, 14, 43);
    doc.text(`Date:   ${new Date().toLocaleDateString()}`, 14, 51);
    doc.text(`Status: ${mentor.isSubmitted ? 'Submitted & Locked' : 'In Progress'}`, 14, 59);

    // Divider line
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(14, 64, 196, 64);

    let yPos = 74;

    evals.forEach((evaluation, index) => {
      const student = evaluation.studentId;
      const total   = totalMarks(evaluation.marks);
      const max     = maxTotal(evaluation.marks);
      const percent = ((total / max) * 100).toFixed(1);

      // Student header
      doc.setFontSize(13);
      doc.setTextColor(30, 64, 175);
      doc.text(`${index + 1}. ${student?.name}`, 14, yPos);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Roll No: ${student?.rollNo}   Email: ${student?.email}`, 14, yPos + 7);

      yPos += 14;

      // Marks table
      autoTable(doc, {
        startY: yPos,
        head: [['Parameter', 'Score', 'Max Score', 'Percentage']],
        body: evaluation.marks.map((m) => [
          m.parameter,
          m.score !== null && m.score !== undefined ? m.score : '—',
          m.maxScore,
          m.score !== null && m.score !== undefined
            ? `${((m.score / m.maxScore) * 100).toFixed(1)}%`
            : '—',
        ]),
        foot: [[
          'Total',
          total,
          max,
          `${percent}%`,
        ]],
        headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
        footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 11 },
      });

      yPos = doc.lastAutoTable.finalY + 16;

      // Page break if needed
      if (yPos > 250 && index < evals.length - 1) {
        doc.addPage();
        yPos = 20;
      }
    });

    // Summary table at the end
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(30, 64, 175);
    doc.text('Summary', 105, 20, { align: 'center' });

    autoTable(doc, {
      startY: 30,
      head: [['Student', 'Roll No', 'Total Marks', 'Out Of', 'Percentage', 'Status']],
      body: evals.map((e) => {
        const total   = totalMarks(e.marks);
        const max     = maxTotal(e.marks);
        const percent = ((total / max) * 100).toFixed(1);
        return [
          e.studentId?.name,
          e.studentId?.rollNo,
          total,
          max,
          `${percent}%`,
          isFullyGraded(e) ? 'Graded' : 'Pending',
        ];
      }),
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 11 },
    });

    doc.save(`marksheet-${mentor.name.replace(/\s+/g, '-')}.pdf`);
  };

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
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
            <button onClick={generatePDF} style={pdfBtn}>
              ⬇ Download Marksheet
            </button>
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
const pdfBtn   = {
  background: '#1e40af',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 20px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
};

export default View;