
const editJobForm = document.getElementById("editJobForm");
const message = document.getElementById("message");

editJobForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const jobId = document.getElementById("jobId").value;
    const title = document.getElementById("title").value;
    const company = document.getElementById("company").value;
    const location = document.getElementById("location").value;
    const salary = document.getElementById("salary").value;

    try {
        const response = await fetch(`/api/jobs/${jobId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                company,
                location,
                salary
            })
        });

        const result = await response.json();

        message.textContent = result.message;

        if (response.ok) {
            editJobForm.reset();
        }

    } catch (error) {
        message.textContent = "Unable to update job.";
        console.error(error);
    }
});
