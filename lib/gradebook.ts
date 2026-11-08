type GradebookAssignment = {
  student_id: string;
  title: string;
  status: string;
  score: number | null;
  submitted_at: string | null;
};

function csvCell(value: string | number | null) {
  if (typeof value === 'number') return String(value);
  const label = value ?? '';
  const safe = /^(?:\s*[=+@-]|[\t\r\n])/.test(label) ? "'" + label : label;
  return '"' + safe.replaceAll('"', '""') + '"';
}

export function gradebookCsv(assignments: GradebookAssignment[], students: {id: string; display_name: string}[]) {
  const names = new Map(students.map(student => [student.id, student.display_name]));
  const rows = assignments.map(assignment => [
    names.get(assignment.student_id) ?? 'Student',
    assignment.title,
    assignment.status,
    assignment.score,
    assignment.submitted_at,
  ]);
  return [['Student', 'Assignment', 'Status', 'Automated score (%)', 'Submitted at (UTC)'], ...rows]
    .map(row => row.map(csvCell).join(','))
    .join('\r\n') + '\r\n';
}
