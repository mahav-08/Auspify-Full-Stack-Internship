
const jobForm = document.getElementById("jobForm");

jobForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const jobData = {
        title: document.getElementById("title").value.trim(),
        company: document.getElementById("company").value.trim(),
        location: document.getElementById("location").value.trim(),
        salary: document.getElementById("salary").value.trim()
    };

    try {
        const response = await fetch("/api/jobs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jobData)
        });

        const result = await response.json();

        document.getElementById("message").textContent =
            result.message;

        if (response.ok) {
            jobForm.reset();
        }

    } catch (error) {
        document.getElementById("message").textContent =
            "Unable to add job. Please try again.";
    }
});
