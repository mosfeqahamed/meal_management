const API_BASE = 'http://127.0.0.1:8000';

// helper: show exactly one form, hide the others
function showForm(id) {
  ['loginForm', 'forgotForm', 'resetForm'].forEach(f => {
    document.getElementById(f)?.classList.toggle('hidden', f !== id);
  });
  document.getElementById('message').textContent = '';
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

// ─── TOGGLE FORMS ──────────────────────────────────────────────────
document.getElementById('showForgot')?.addEventListener('click', () => showForm('forgotForm'));
document.getElementById('showLogin') ?.addEventListener('click', () => showForm('loginForm'));
document.getElementById('showLogin2')?.addEventListener('click', () => showForm('loginForm'));

// ─── REQUEST RESET EMAIL ───────────────────────────────────────────
document.getElementById('forgotForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value;
  try {
    const res = await fetch(`${API_BASE}/auth/users/reset_password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error();
    setMessage('Reset link sent! Check your email.');
  } catch {
    setMessage('Failed to send reset link.', true);
  }
});

// ─── SUBMIT NEW PASSWORD ───────────────────────────────────────────
document.getElementById('resetForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const uid          = document.getElementById('resetUid').value;
  const token        = document.getElementById('resetToken').value;
  const new_password = document.getElementById('resetPassword').value;
  try {
    const res = await fetch(`${API_BASE}/auth/users/reset_password_confirm/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, token, new_password })
    });
    if (!res.ok) throw new Error();
    setMessage('Password reset! You can now log in.');
    showForm('loginForm');
  } catch {
    setMessage('Failed to reset password.', true);
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
