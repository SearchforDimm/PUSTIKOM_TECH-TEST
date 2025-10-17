const api = {
    async get(category) {
        const url = category && category !== 'All' ? `/api/expenses?category=${encodeURIComponent(category)}` : '/api/expenses';
        const res = await fetch(url);
        return res.json();
    },
    async create(expense) {
        const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });
        return res.json();
    },
    async delete(id) {
        const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
        return res.json();
    }
};

const form = document.getElementById('expense-form');
const amountEl = document.getElementById('amount');
const descEl = document.getElementById('description');
const categoryEl = document.getElementById('category');
const filterEl = document.getElementById('filter');
const listEl = document.getElementById('expenses-list');
const totalEl = document.getElementById('total');
const formError = document.getElementById('form-error');

async function load() {
    const category = filterEl.value;
    const expenses = await api.get(category);
    renderList(expenses);
    updateTotal(expenses);
}

function renderList(expenses) {
    listEl.innerHTML = '';
    if (!expenses || expenses.length === 0) {
        listEl.innerHTML = '<li class="empty">No expenses</li>';
        return;
    }
    expenses.forEach(e => {
        const li = document.createElement('li');
        li.className = 'expense-item';
        li.innerHTML = `
      <div class="main">
        <div class="desc">${escapeHtml(e.description)}</div>
        <div class="meta">${e.category} • ${new Date(e.timestamp).toLocaleString()}</div>
      </div>
      <div class="right">
        <div class="amount">$${Number(e.amount).toFixed(2)}</div>
        <button data-id="${e.id}" class="del">Delete</button>
      </div>
    `;
        listEl.appendChild(li);
    });
}

function updateTotal(expenses) {
    const total = (expenses || []).reduce((s, e) => s + Number(e.amount), 0);
    totalEl.textContent = total.toFixed(2);
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    formError.textContent = '';
    const amount = parseFloat(amountEl.value);
    const description = descEl.value.trim();
    const category = categoryEl.value;
    // Client-side validation
    if (isNaN(amount) || amount <= 0) return formError.textContent = 'Please enter a positive amount';
    if (!description) return formError.textContent = 'Please enter a description';

    try {
        await api.create({ amount, description, category });
        amountEl.value = '';
        descEl.value = '';
        await load();
    } catch (e) {
        formError.textContent = 'Failed to add expense';
    }
});

filterEl.addEventListener('change', load);

listEl.addEventListener('click', async (e) => {
    if (e.target.matches('button.del')) {
        const id = e.target.getAttribute('data-id');
        await api.delete(id);
        await load();
    }
});

// initial load
load();
