
const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");

let editingStudentId = null;

// Display all students
async function displayStudents() {
    const response = await fetch("/api/students");
    const students = await response.json();

    studentList.innerHTML = "";

    students.forEach(student => {
        const row = document.createElement("tr");

        [student.name, student.roll, student.department, student.email]
            .forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        editButton.onclick = function() {
            editingStudentId = student.id;

            document.getElementById("studentName").value = student.name;
            document.getElementById("studentRoll").value = student.roll;
            document.getElementById("studentDepartment").value = student.department;
            document.getElementById("studentEmail").value = student.email;

            studentForm.querySelector("button[type='submit']").textContent = "Update Student";
        };

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.onclick = async function() {
            if (confirm("Are you sure you want to delete this student?")) {
                await fetch(`/api/students/${student.id}`, {
                    method: "DELETE"
                });

                alert("Student deleted successfully!");
                displayStudents();
            }
        };

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        studentList.appendChild(row);
    });
}

// Add or update student
studentForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const student = {
        name: document.getElementById("studentName").value.trim(),
        roll: document.getElementById("studentRoll").value.trim(),
        department: document.getElementById("studentDepartment").value.trim(),
        email: document.getElementById("studentEmail").value.trim()
    };

    const url = editingStudentId
        ? `/api/students/${editingStudentId}`
        : "/api/students";

    const method = editingStudentId ? "PUT" : "POST";

    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(student)
    });

    const result = await response.json();

    if (!response.ok) {
        alert(result.message);
        return;
    }

    alert(editingStudentId ? "Student updated successfully!" : "Student added successfully!");

    editingStudentId = null;
    studentForm.reset();
    studentForm.querySelector("button[type='submit']").textContent = "Add Student";

    displayStudents();
});

// Load students when page opens
displayStudents();
