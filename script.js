
function showMessage() {
    document.getElementById("courses").scrollIntoView({
        behavior: "smooth"
    });
}

const courses = JSON.parse(localStorage.getItem("courses")) || [
    "Python Programming",
    "Web Development",
    "Java Programming",
    "Data Science",
    "Machine Learning",
    "Database Management"
];


const courseList = document.getElementById("courseList");
courseList.innerHTML = "";

courses.forEach(function(course) {
    const courseCard = document.createElement("div");
    courseCard.className = "course-card";

    const courseTitle = document.createElement("h3");
    courseTitle.textContent = course;

    const enrollButton = document.createElement("button");
    enrollButton.textContent = "Enroll Now";

    enrollButton.addEventListener("click", function() {
        let enrolledCourses = JSON.parse(
            localStorage.getItem("enrolledCourses")
        ) || [];

        if (!enrolledCourses.includes(course)) {
            enrolledCourses.push(course);

            localStorage.setItem(
                "enrolledCourses",
                JSON.stringify(enrolledCourses)
            );

            alert("Successfully enrolled in " + course);
        } else {
            alert("You are already enrolled in this course!");
        }
    });

    courseCard.appendChild(courseTitle);
    courseCard.appendChild(enrollButton);

    courseList.appendChild(courseCard);
});
