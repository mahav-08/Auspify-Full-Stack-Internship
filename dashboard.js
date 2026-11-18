
const student = JSON.parse(localStorage.getItem("student"));

const welcomeMessage = document.getElementById("welcomeMessage");
const learningDetails = document.getElementById("learningDetails");

if (student) {
    welcomeMessage.textContent = "Welcome, " + student.name + "!";
} else {
    welcomeMessage.textContent = "Please register to access your dashboard.";
}

const enrolledCourses = JSON.parse(
    localStorage.getItem("enrolledCourses")
) || [];

if (enrolledCourses.length > 0) {
    learningDetails.innerHTML = "";

    enrolledCourses.forEach(function(course) {
        const courseCard = document.createElement("div");

        courseCard.className = "course-card";
        courseCard.textContent = course;

        learningDetails.appendChild(courseCard);
    });
} else {
    learningDetails.textContent = "You have not enrolled in any courses yet.";
}

function logoutStudent() {
    localStorage.removeItem("student");
    window.location.href = "login.html";
}

