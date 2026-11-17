
const expenseForm = document.getElementById("expenseForm");
const transactionList = document.getElementById("transactionList");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balance = document.getElementById("balance");

const API_URL = "http://localhost:3001/api/transactions";

// Load transactions
async function loadTransactions() {
    try {
        const response = await fetch(API_URL);
        const transactions = await response.json();

        displayTransactions(transactions);
        updateSummary(transactions);
    } catch (error) {
        console.error("Error loading transactions:", error);
    }
}

// Display transactions
function displayTransactions(transactions) {
    transactionList.innerHTML = "";

    transactions.forEach(transaction => {
        const row = document.createElement("tr");

        const values = [
            transaction.title,
            "₹" + Number(transaction.amount).toFixed(2),
            transaction.type,
            transaction.category,
            transaction.date
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteTransaction(transaction.id);

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        transactionList.appendChild(row);
    });
}

// Update income, expense and balance
function updateSummary(transactions) {
    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            income += Number(transaction.amount);
        } else {
            expense += Number(transaction.amount);
        }
    });

    totalIncome.textContent = "₹" + income.toFixed(2);
    totalExpense.textContent = "₹" + expense.toFixed(2);
    balance.textContent = "₹" + (income - expense).toFixed(2);
}

// Add transaction
expenseForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const transaction = {
        title: document.getElementById("title").value,
        amount: document.getElementById("amount").value,
        type: document.getElementById("type").value,
        category: document.getElementById("category").value,
        date: document.getElementById("date").value
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transaction)
        });

        if (!response.ok) {
            throw new Error("Unable to add transaction");
        }

        expenseForm.reset();
        loadTransactions();

    } catch (error) {
        alert("Unable to add transaction. Please check the server.");
    }
});

// Delete transaction
async function deleteTransaction(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete transaction");
        }

        loadTransactions();

    } catch (error) {
        alert("Unable to delete transaction.");
    }
}

// Load data when page opens
loadTransactions();
