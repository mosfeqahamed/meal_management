// utils.js

// Returns headers with JWT access token
function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("access")
  };
}

// Clears stored tokens
function logout() {
  localStorage.clear();
}

// Shared helper: fetches members and populates any <select>
async function loadMembers(selectId) {
  const res = await fetch("http://127.0.0.1:8000/api/meal/members/", {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    console.error("Failed to load members:", res.statusText);
    return;
  }
  const members = await res.json();
  const select = document.getElementById(selectId);
  // reset options
  select.innerHTML = '<option value="">Select member</option>';
  members.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.name;
    select.appendChild(opt);
  });
}
