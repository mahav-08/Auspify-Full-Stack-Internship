
const courseForm = document.getElementById("courseForm");

const adminCourseList = document.getElementById("adminCourseList");

let courses = JSON.parse(localStorage.getItem("courses")) || [
    "Python Programming",
    "Web Development",
    "Java Programming",
    "Data Science",
    "Machine Learning",
    "Database Management"
];

function displayCourses() {
    adminCourseList.innerHTML = "";

    courses.forEach(function(course, index) {
        const courseCard = document.createElement("div");

        courseCard.className = "course-card";
        courseCard.textContent = course;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            courses.splice(index, 1);

            localStorage.setItem("courses", JSON.stringify(courses));

            displayCourses();
        });

        courseCard.appendChild(deleteButton);
        adminCourseList.appendChild(courseCard);
    });
}

courseForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const courseName = document.getElementById("courseName").value.trim();

    if (courseName === "") {
        return;
    }

    courses.push(courseName);

    localStorage.setItem("courses", JSON.stringify(courses));

    document.getElementById("adminMessage").textContent =
        "Course added successfully!";

    courseForm.reset();

    displayCourses();
});

displayCourses();
