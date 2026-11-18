
const allCourses = document.getElementById("allCourses");
const courseSearch = document.getElementById("courseSearch");
const courseCount = document.getElementById("courseCount");

const courses = JSON.parse(localStorage.getItem("courses")) || [
    "Python Programming",
    "Web Development",
    "Java Programming",
    "Data Science",
    "Machine Learning",
    "Database Management"
];

function displayCourses(courseList) {
    allCourses.innerHTML = "";
    courseCount.textContent = "Total Courses: " + courseList.length;
    if (courseList.length === 0) {
    allCourses.textContent = "No courses found!";
    return;
}

    courseList.forEach(function(course) {
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
                alert("Already enrolled in this course!");
            }
        });

        courseCard.appendChild(courseTitle);
        courseCard.appendChild(enrollButton);
        allCourses.appendChild(courseCard);
    });
}

courseSearch.addEventListener("input", function() {
    const searchText = courseSearch.value.toLowerCase();

    const filteredCourses = courses.filter(function(course) {
        return course.toLowerCase().includes(searchText);
    });

    displayCourses(filteredCourses);
});

displayCourses(courses);

const clearSearch = document.getElementById("clearSearch");

clearSearch.addEventListener("click", function() {
    courseSearch.value = "";
    displayCourses(courses);
});

