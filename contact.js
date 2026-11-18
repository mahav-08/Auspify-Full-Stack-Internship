const contactForm = document.getElementById("contactForm");
const contactResponse = document.getElementById("contactResponse");

contactForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    try {
        const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message
            })
        });

        const data = await response.json();

        contactResponse.textContent = data.message;

        if (response.ok) {
            contactForm.reset();
        }

    } catch (error) {
        contactResponse.textContent = "Unable to connect to server!";
    }
});