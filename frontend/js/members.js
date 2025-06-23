// Add members
document.getElementById("memberForm")?.addEventListener("submit", async function(e) {
  e.preventDefault();
  const name = document.getElementById("memberName").value;
  const res = await fetch("http://127.0.0.1:8000/api/meal/members/", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name })
  });
  if (res.ok) {
    alert("Member added");
    document.getElementById("memberName").value = "";
  } else {
    alert("Failed to add member");
  }
});
