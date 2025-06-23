// payments.js

// Populate the dropdown on page load
loadMembers("paymentMember");

document.getElementById("paymentForm")?.addEventListener("submit", async function(e) {
  e.preventDefault();
  const member = document.getElementById("paymentMember").value;
  const date   = document.getElementById("paymentDate").value;
  const amount = document.getElementById("paymentAmount").value;

  if (!member) {
    alert("Please select a member.");
    return;
  }

  const res = await fetch("http://127.0.0.1:8000/api/meal/payments/", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ member, amount, date })
  });

  if (res.ok) {
    alert("Payment added");
    // optionally clear form
    document.getElementById("paymentForm").reset();
  } else {
    const err = await res.json();
    console.error("Payment error:", err);
    alert("Failed to add payment");
  }
});
