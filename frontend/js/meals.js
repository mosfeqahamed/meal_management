/* js/meals.js */

// Fetch and populate members into a <select>
async function loadMembers(selectId) {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/meal/members/", {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const members = await res.json();
    const select = document.getElementById(selectId);
    select.innerHTML = "";

    members.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load members:', err);
    alert('Could not load member list.');
  }
}

// Render the pivot table of daily counts
function renderTable(days, summary) {
  const container = document.getElementById('tableContainer');
  container.innerHTML = '';

  const table = document.createElement('table');
  const thead = table.createTHead();
  const headerRow = thead.insertRow();

  // sticky "Member" header
  const thName = document.createElement('th');
  thName.textContent = 'Member';
  thName.classList.add('sticky');
  headerRow.appendChild(thName);

  // day columns
  days.forEach(d => {
    const th = document.createElement('th');
    th.textContent = d;
    headerRow.appendChild(th);
  });

  const tbody = table.createTBody();
  summary.forEach(member => {
    const row = tbody.insertRow();

    // name cell
    const nameCell = row.insertCell();
    nameCell.textContent = member.name;
    nameCell.classList.add('sticky');

    // day counts
    days.forEach(d => {
      const cell = row.insertCell();
      const cnt = member.daily_counts[d] || 0;
      cell.textContent = cnt > 0 ? cnt : '';
    });
  });

  container.appendChild(table);
}

// Load and render the summary via AJAX
async function loadSummary() {
  const pickerValue = document.getElementById('reportMonthYear').value;
  if (!pickerValue) return;
  const [year, month] = pickerValue.split('-');

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/meal/report/?month=${month}&year=${year}`,
      { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const { days, daily_summary } = await res.json();
    renderTable(days, daily_summary);
  } catch (err) {
    console.error('Load summary failed:', err);
    alert('Failed to load summary');
  }
}

// Handle "Add Meal" submission via AJAX
async function handleAddMeal(e) {
  e.preventDefault();
  const member = document.getElementById('mealMember').value;
  const date   = document.getElementById('mealDate').value;
  const count  = document.getElementById('mealCount').value;

  try {
    const res = await fetch('http://127.0.0.1:8000/api/meal/meals/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ member, date, count })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    alert('Meal added');
    // clear inputs
    document.getElementById('mealDate').value  = '';
    document.getElementById('mealCount').value = '';
    // reload summary without form dispatch
    await loadSummary();
  } catch (err) {
    console.error('Add meal failed:', err);
    alert('Failed to add meal');
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  // 1) Load members for Add Meal
  await loadMembers('mealMember');

  // 2) Pre-fill month picker
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm   = String(today.getMonth() + 1).padStart(2, '0');
  document.getElementById('reportMonthYear').value = `${yyyy}-${mm}`;

  // 3) Hook form events
  document.getElementById('mealForm').addEventListener('submit', handleAddMeal);
  document.getElementById('reportForm').addEventListener('submit', e => {
    e.preventDefault();
    loadSummary();
  });

  // 4) Initial summary load
  await loadSummary();
});
