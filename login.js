const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        loginMessage.textContent = data.message;

        if (response.ok) {
            localStorage.setItem("student", JSON.stringify(data.student));
            window.location.href = "dashboard.html";
        }

    } catch (error) {
        loginMessage.textContent = "Unable to connect to server!";
    }
});