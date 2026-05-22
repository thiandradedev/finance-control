const transactionForm = document.querySelector("#transactionForm");
const descriptionInput = document.querySelector("#description");
const amountInput = document.querySelector("#amount");
const typeInput = document.querySelector("#type");
const categoryInput = document.querySelector("#category");
const dateInput = document.querySelector("#date");

const totalBalanceElement = document.querySelector("#totalBalance");
const totalIncomeElement = document.querySelector("#totalIncome");
const totalExpensesElement = document.querySelector("#totalExpenses");
const transactionCountElement = document.querySelector("#transactionCount");
const transactionsList = document.querySelector("#transactionsList");
const filterButtons = document.querySelectorAll(".filter-button");

const STORAGE_KEY = "finance-control-transactions";

let transactions = [];
let currentFilter = "all";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(`${dateValue}T00:00:00`));
}

function generateId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return String(Date.now());
}

function createTransaction(description, amount, type, category, categoryLabel, date) {
  return {
    id: generateId(),
    description,
    amount,
    type,
    category,
    categoryLabel,
    date,
    createdAt: new Date().toISOString()
  };
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadTransactions() {
  const savedTransactions = localStorage.getItem(STORAGE_KEY);

  if (!savedTransactions) {
    transactions = [];
    return;
  }

  transactions = JSON.parse(savedTransactions);
}

function getFilteredTransactions() {
  if (currentFilter === "all") {
    return transactions;
  }

  return transactions.filter(function (transaction) {
    return transaction.type === currentFilter;
  });
}

function updateSummary() {
  const totalIncome = transactions
    .filter(function (transaction) {
      return transaction.type === "income";
    })
    .reduce(function (total, transaction) {
      return total + transaction.amount;
    }, 0);

  const totalExpenses = transactions
    .filter(function (transaction) {
      return transaction.type === "expense";
    })
    .reduce(function (total, transaction) {
      return total + transaction.amount;
    }, 0);

  const totalBalance = totalIncome - totalExpenses;

  totalBalanceElement.textContent = formatCurrency(totalBalance);
  totalIncomeElement.textContent = formatCurrency(totalIncome);
  totalExpensesElement.textContent = formatCurrency(totalExpenses);
  transactionCountElement.textContent = transactions.length;
}

function renderTransactions() {
  const filteredTransactions = getFilteredTransactions();

  if (filteredTransactions.length === 0) {
    transactionsList.innerHTML = `
      <p class="empty-state">
        No transactions found.
      </p>
    `;

    return;
  }

  transactionsList.innerHTML = filteredTransactions
    .map(function (transaction) {
      const amountClass = transaction.type === "income" ? "income" : "expense";
      const amountPrefix = transaction.type === "income" ? "+" : "-";

      return `
        <article class="transaction-card">
          <div>
            <strong>${transaction.description}</strong>
            <p>
              ${transaction.categoryLabel} • ${formatDate(transaction.date)}
            </p>
          </div>

          <div class="transaction-info">
            <span class="transaction-amount ${amountClass}">
              ${amountPrefix}${formatCurrency(transaction.amount)}
            </span>

            <button
              type="button"
              class="delete-button"
              data-id="${transaction.id}"
              aria-label="Delete transaction"
            >
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function updateApp() {
  updateSummary();
  renderTransactions();
}

function resetForm() {
  transactionForm.reset();
  setTodayAsDefaultDate();
  descriptionInput.focus();
}

function setTodayAsDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
}

transactionForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;
  const categoryLabel = categoryInput.options[categoryInput.selectedIndex].textContent;
  const date = dateInput.value;

  if (!description || !amount || !type || !category || !date) {
    alert("Please fill in all fields.");
    return;
  }

  if (amount <= 0) {
    alert("Amount must be greater than zero.");
    return;
  }

  const newTransaction = createTransaction(
    description,
    amount,
    type,
    category,
    categoryLabel,
    date
  );

  transactions.push(newTransaction);
  saveTransactions();
  updateApp();
  resetForm();
});

transactionsList.addEventListener("click", function (event) {
  const deleteButton = event.target.closest(".delete-button");

  if (!deleteButton) {
    return;
  }

  const transactionId = deleteButton.dataset.id;

  transactions = transactions.filter(function (transaction) {
    return transaction.id !== transactionId;
  });

  saveTransactions();
  updateApp();
});

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    filterButtons.forEach(function (currentButton) {
      currentButton.classList.remove("active");
    });

    button.classList.add("active");
    currentFilter = button.dataset.filter;

    renderTransactions();
  });
});

setTodayAsDefaultDate();
loadTransactions();
updateApp();