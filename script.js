const transactionForm = document.querySelector('#transaction-form');
const descriptionList = document.querySelector('#description');
const amountInput = document.querySelector('#amount');
const typeinput = document.querySelector('#type');
const categoryInput = document.querySelector('#category');
const dateInput = document.querySelector('date');

const totalBalanceElement = document.querySelector('#totalBalance');
const totalIncomeElement = document.querySelector('#totalIncome');
const totalexpensesElement =document.querySelector('#totalExpenses');
const transactionCountElement = document.querySelector('#transactionCount');
const transactionsList = document.querySelector('#transactionsList');
const filterButtons = document.querySelectorAll('.filter-button');

let transactions =[];
let currentFilter = 'all';

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

function formatDate(dateValue) {
    return new Intl.DateTimeFormat('es-ES', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).format(new Date(dataValue));
}

function createTransactionElement(description, amount, type, category, categoryLabel, date) {
    return {
        id: crypto.randomUUID(),
        description,
        amount,
        type,
        category,
        categoryLabel,
        date,
        createAt: new Date().toISOString()
    };
}

function getFilteredTransactions() {
    if (currentFilter === 'all') {
        return transactions;
    }

    return transactions.filter(function (transaction) {
        return transaction.type === currentFilter;
    });
}

function updateSummary() {
    const totalIncome = transactions
    .filter(function (transaction) {
        return transaction.type === 'income';
    })
    .reduce(function (total, transaction) {
        return total + transaction.amount;
    }, 0);

const totalExpenses = transactions 
  .filter(function (transaction) {
    return transaction.type === 'expense';
  })
    .reduce(function (total, transaction) {
        return total + transaction.amount;
    }, 0);

    const totalBalance = totalIncome - totalExpenses;

    totalBalanceElement.textContent = formatCurrency(totalBalance);
    totalIncomeElement.textContent = formatCurrency(totalIncome);
    totalexpensesElement.textContent = formatCurrency(totalExpenses);
    transactionCountElement.textcontent = transactions.length;
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
    setTodayDefaultDate();
    descriptionInput.focus();
}

function setTodayDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

transactionForm.addEventLiestener('submit', function (event) {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const categoryLabel = categoryInput.options[categoryInput.selectedIndex].text;
    const date = dateInput.value;

    if (!description || !amount || !type || !category || !date) {
        alert('Please fill in all fields.');
        return;
    }

    if (amount <= 0) {
        alert('Amount must be greaterThan zero.');
        return;
    }

    const newTransaction = createTransactionElement(
        description,
        amount,
        type,
        category,
        categoryLabel,
        date
    );

    transactions.push(newTransaction);

    updateApp();
    resetForm();
});

transactionsList.addEventListener('click', function (event) {
    const deleteButton = event.target.closest('.delete-button');

    if (!deleteButton) {
        return;
    }

    const transactionID = deleteButton.dataset.id;

    transactions = transactions.filter(function (transaction) {
        return transaction.id !== transactionId;
    });

    updateApp();
});

filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        filterButtons.forEach(function (currentButton) {
            currentButton.classList.remove('active');
        });

        button.classList.add('active');
        currentFilter = button.dataset.filter;

        renderTransactions();
    });
});

setTodayDefaultDate();
updateApp();