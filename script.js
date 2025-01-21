// DOM Elements
const expenseForm = document.getElementById('expense-form');
const expenseTableBody = document.querySelector('#expense-table tbody');
const totalExpensesEl = document.getElementById('total-expenses');
const categoryBreakdownEl = document.getElementById('category-breakdown');
const goalInput = document.getElementById('goal-input');
const setGoalBtn = document.getElementById('set-goal-btn');
const goalNotification = document.getElementById('goal-notification');
const progressBar = document.getElementById('progress-bar');
const categoryColors = {};

// Expense Data Storage
let expenses = [];
let spendingGoal = null;

// Add Expense
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Get Form Values
  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;

  // Add Expense to Array
  expenses.push({ description, amount, category });

  // Update UI
  renderExpenses();
  renderAnalytics();

  // Reset Form
  expenseForm.reset();
});

// Set Spending Goal
setGoalBtn.addEventListener('click', () => {
  const goalValue = parseFloat(goalInput.value);
  if (isNaN(goalValue) || goalValue <= 0) {
    alert('Please enter a valid positive number for the goal.');
    return;
  }
  spendingGoal = goalValue;
  updateGoalNotification();
});

// Update Goal Notification
function updateGoalNotification() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  if (spendingGoal === null) return;

  if (total > spendingGoal) {
    const overAmount = total - spendingGoal;
    goalNotification.textContent = `You are over your spending goal by $${overAmount.toFixed(2)}!`;
    goalNotification.style.color = 'red';
    updateProgressBar(100, true); // Overfilled
  } else {
    const percentageUsed = (total / spendingGoal) * 100;
    goalNotification.textContent = `You have used ${percentageUsed.toFixed(2)}% of your spending goal.`;
    goalNotification.style.color = 'green';
    updateProgressBar(percentageUsed, false); // Under goal
  }
}

// Render Expenses
function renderExpenses() {
  expenseTableBody.innerHTML = '';
  expenses.forEach((expense, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${expense.description}</td>
      <td>${expense.category}</td>
      <td>$<span class="amount">${expense.amount.toFixed(2)}</span></td>
      <td>
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </td>
    `;
    expenseTableBody.appendChild(row);
  });

  // Add event listeners to Edit and Delete buttons
  document.querySelectorAll('.edit-btn').forEach((button) => {
    button.addEventListener('click', handleEdit);
  });

  document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', handleDelete);
  });
}

// Handle Edit
function handleEdit(e) {
  const index = e.target.dataset.index;
  const newAmount = prompt(
    `Edit the amount for "${expenses[index].description}" (current: $${expenses[index].amount.toFixed(2)}):`,
    expenses[index].amount
  );

  if (newAmount !== null && !isNaN(newAmount) && parseFloat(newAmount) >= 0) {
    expenses[index].amount = parseFloat(newAmount);
    renderExpenses();
    renderAnalytics();
    updateGoalNotification();
  } else {
    alert('Invalid input! Please enter a valid number.');
  }
}

// Handle Delete
function handleDelete(e) {
  const index = e.target.dataset.index;
  const confirmed = confirm(`Are you sure you want to delete "${expenses[index].description}"?`);
  
  if (confirmed) {
    expenses.splice(index, 1); // Remove the expense from the array
    renderExpenses();
    renderAnalytics();
    updateGoalNotification();
  }
}

// Render Analytics
function renderAnalytics() {
  // Calculate Total Expenses
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalExpensesEl.textContent = total.toFixed(2);

  // Calculate Category Breakdown
  const categoryTotals = expenses.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    return totals;
  }, {});

  // Render Category Breakdown
  categoryBreakdownEl.innerHTML = '';
  for (const [category, amount] of Object.entries(categoryTotals)) {
    const p = document.createElement('p');
    p.textContent = `${category}: $${amount.toFixed(2)}`;
    categoryBreakdownEl.appendChild(p);
  }

  // Update Goal Notification and Progress Bar
  updateGoalNotification();
  updateProgressBarWithCategories();
  updateLegend();
}

// Update Progress Bar
function updateProgressBar(percentage, isOver) {
  const cappedPercentage = Math.min(percentage, 100); // Cap at 100% for display
  progressBar.style.height = `${cappedPercentage}%`;
  progressBar.style.backgroundColor = isOver ? 'red' : '#4CAF50'; // Change color if over goal
}

// Update the progress bar with a single color for all segments
function updateProgressBarWithCategories() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  if (spendingGoal === null || total === 0) return;

  const progressBarContainer = document.getElementById('progress-bar');
  progressBarContainer.innerHTML = ''; // Clear existing segments

  let cumulativeHeight = 0;

  expenses.forEach((expense) => {
    const categoryHeight = (expense.amount / spendingGoal) * 100;
    const segment = document.createElement('div');
    segment.className = 'progress-segment';
    segment.style.height = `${categoryHeight}%`;
    segment.style.backgroundColor = '#4CAF50'; // Set a single color for the progress bar
    segment.style.bottom = `${cumulativeHeight}%`;
    progressBarContainer.appendChild(segment);
    cumulativeHeight += categoryHeight;
  });

  // If over the goal, adjust styles
  if (total > spendingGoal) {
    progressBarContainer.style.backgroundColor = 'red'; // Overfilled
  } else {
    progressBarContainer.style.backgroundColor = ''; // Reset background color
  }
}


// Generate random color for a new category
function getCategoryColor(category) {
  if (!categoryColors[category]) {
    // Generate a random color
    const randomColor =
      '#' +
      Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    categoryColors[category] = randomColor;
  }
  return categoryColors[category];
}
