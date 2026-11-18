
async function loadApplications() {
    const applicationsList = document.getElementById("applicationsList");

    try {
        const response = await fetch("/api/applications");
        const applications = await response.json();

        if (applications.length === 0) {
            applicationsList.innerHTML = "<p>No applications found.</p>";
            return;
        }

        applicationsList.innerHTML = applications.map(app => `
            <div class="job-card">
                <h3>Application ID: ${app.id}</h3>
                <p><strong>Applicant:</strong> ${app.applicant_name}</p>
                <p><strong>Email:</strong> ${app.email}</p>
                <p><strong>Job:</strong> ${app.job_title}</p>
                <p><strong>Company:</strong> ${app.company}</p>
            </div>
        `).join("");

    } catch (error) {
        applicationsList.innerHTML = "<p>Unable to load applications.</p>";
        console.error(error);
    }
}

loadApplications();
