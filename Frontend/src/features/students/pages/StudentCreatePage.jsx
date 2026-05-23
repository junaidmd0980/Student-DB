import StudentForm from "../components/StudentForm.jsx";

function StudentCreatePage() {
  return (
    <div className="page student-create-page">
      <div className="container">
        <h1 className="form-title">Create Student</h1>
        <StudentForm />
      </div>
    </div>
  );
}

export default StudentCreatePage;