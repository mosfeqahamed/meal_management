document.getElementById("reportForm")?.addEventListener("submit", async function(e) {
  e.preventDefault();

  // gets a string like "2025-06"
  const monthYear = document.getElementById("reportMonthYear").value;
  if (!monthYear) return;

  // split into [ "2025", "06" ]
  const [year, month] = monthYear.split("-");

  const res = await fetch(
    `http://127.0.0.1:8000/api/meal/report/?month=${Number(month)}&year=${Number(year)}`,
    { headers: getAuthHeaders() }
  );
  const data = await res.json();

  // build table
  const table = document.getElementById("reportTable");
  table.innerHTML = `
    <tr>
      <th>Name</th><th>Meals</th><th>Rate</th>
      <th>Total Cost</th><th>Paid</th><th>Give</th><th>Take</th>
    </tr>`;

  data.financial_report.forEach(r => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.name}</td>
      <td>${r.meal_count}</td>
      <td>${r.meal_rate}</td>
      <td>${r.total_meal_cost}</td>
      <td>${r.total_paid}</td>
      <td>${r.give}</td>
      <td>${r.take}</td>
    `;
    table.appendChild(row);
  });
});
