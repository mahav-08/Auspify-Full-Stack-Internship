
let jobs = [];

async function loadJobs() {
    try {
        const response = await fetch("/api/jobs");
        jobs = await response.json();

        displayJobs(jobs);
    } catch (error) {
        console.error("Error loading jobs:", error);
    }
}

function displayJobs(jobArray) {
    const jobList = document.getElementById("jobList");

    jobList.innerHTML = "";

    if (jobArray.length === 0) {
        jobList.innerHTML = "<p>No jobs found!</p>";
        return;
    }

    jobArray.forEach(job => {
        jobList.innerHTML += `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p><strong>Company:</strong> ${job.company}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Salary:</strong> ${job.salary}</p>
                <button onclick="applyJob(${job.id})">
                    Apply Now
                </button>
            </div>
        `;
    });
}

function searchJobs() {
    const searchValue = document
        .getElementById("searchInput")
        .value.toLowerCase();

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchValue)
    );

    displayJobs(filteredJobs);
}

async function applyJob(jobId) {
    const applicantName = prompt("Enter your name:");
    if (!applicantName || !applicantName.trim()) return;

    const email = prompt("Enter your email:");
    if (!email || !email.trim()) return;

    try {
        const response = await fetch("/api/applications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                job_id: jobId,
                applicant_name: applicantName,
                email: email
            })
        });

        const result = await response.json();

        alert(result.message);
    } catch (error) {
        alert("Application failed. Please try again.");
    }
}

loadJobs();
