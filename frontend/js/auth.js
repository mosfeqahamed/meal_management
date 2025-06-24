const API_BASE = 'http://127.0.0.1:8000';

// helper: show exactly one form, hide the others
function showForm(id) {
  // CHANGED: Removed 'forgotForm' and 'resetForm' as they are no longer in login.html
  ['loginForm'].forEach(f => {
    const formElement = document.getElementById(f);
    if (formElement) {
        formElement.classList.toggle('hidden', f !== id);
    }
  });
  const messageElement = document.getElementById('message');
  if(messageElement) {
      messageElement.textContent = '';
  }
}

// helper: display feedback
function setMessage(text, isError = false) {
  const msg = document.getElementById('message');
  if (!msg) return;
  msg.textContent = text;
  msg.className = isError ? 'message error' : 'message success';
}

// ─── LOGIN ─────────────────────────────────────────────────────────
document.getElementById('loginForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try {
    const res = await fetch(`${API_BASE}/auth/jwt/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    window.location.href = 'dashboard.html';
  } catch {
    setMessage('Login failed. Check your credentials.', true);
  }
});

// ─── REGISTER ─────────────────────────────────────────────────────
document.getElementById('registerForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  setMessage('Registering…');
  const email    = document.getElementById('registerEmail').value;
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  
  try {
    const res = await fetch(`${API_BASE}/auth/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Registered successfully! Redirecting…');
      setTimeout(() => window.location.href = 'login.html', 1500);
    } else {
      // show whatever error the API sent back
      const errMsg = data?.username?.[0] 
                   || data?.email?.[0] 
                   || data?.password?.[0] 
                   || data.detail
                   || 'Registration failed';
      setMessage(errMsg, true);
    }
  } catch (err) {
    setMessage('Network error. Please try again.', true);
  }
});


// CHANGED: The entire password reset logic below has been removed.
// The password reset flow is now fully contained within `resetpass.html`.
// This prevents confusion and keeps the `auth.js` file focused on login/registration.
/*
// ─── TOGGLE FORMS ──────────────────────────────────────────────────
document.getElementById('showForgot')?.addEventListener('click', () => showForm('forgotForm'));
document.getElementById('showLogin') ?.addEventListener('click', () => showForm('loginForm'));
document.getElementById('showLogin2')?.addEventListener('click', () => showForm('loginForm'));

// ─── REQUEST RESET EMAIL ───────────────────────────────────────────
document.getElementById('forgotForm')?.addEventListener('submit', async e => { ... });

// ─── SUBMIT NEW PASSWORD ───────────────────────────────────────────
document.getElementById('resetForm')?.addEventListener('submit', async e => { ... });
*/