const signupName = document.getElementById('signup-name');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const btnSignup = document.getElementById('btn-signup');

const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const btnLogin = document.getElementById('btn-login');

const authMsg = document.getElementById('auth-msg');

const profileArea = document.getElementById('profile-area');
const authArea = document.getElementById('auth-area');
const profileInfo = document.getElementById('profile-info');
const btnLogout = document.getElementById('btn-logout');

const api = {
  signup: '/.netlify/functions/signup',
  login: '/.netlify/functions/login',
  profile: '/.netlify/functions/profile'
};

function setToken(token) {
  localStorage.setItem('nandika_token', token);
}

function getToken() {
  return localStorage.getItem('nandika_token');
}

function clearToken() {
  localStorage.removeItem('nandika_token');
}

function showMessage(msg, isError = true) {
  authMsg.textContent = msg;
  authMsg.style.color = isError ? 'crimson' : 'green';
  setTimeout(() => { authMsg.textContent = ''; }, 5000);
}

async function signup() {
  try {
    const res = await fetch(api.signup, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: signupName.value,
        email: signupEmail.value,
        password: signupPassword.value
      })
    });
    const data = await res.json();
    if (!res.ok) {
      showMessage(data.error || JSON.stringify(data));
      return;
    }
    setToken(data.token);
    showMessage('Signup successful', false);
    renderProfile();
  } catch (err) {
    showMessage('Network error');
  }
}

async function login() {
  try {
    const res = await fetch(api.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value
      })
    });
    const data = await res.json();
    if (!res.ok) {
      showMessage(data.error || JSON.stringify(data));
      return;
    }
    setToken(data.token);
    showMessage('Login successful', false);
    renderProfile();
  } catch (err) {
    showMessage('Network error');
  }
}

async function renderProfile() {
  const token = getToken();
  if (!token) {
    authArea.classList.remove('hidden');
    profileArea.classList.add('hidden');
    return;
  }

  try {
    const res = await fetch(api.profile, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    if (!res.ok) {
      showMessage(data.error || 'Failed to load profile');
      clearToken();
      return;
    }
    authArea.classList.add('hidden');
    profileArea.classList.remove('hidden');
    profileInfo.innerHTML = `
      <p><strong>Name:</strong> ${data.user.name || '(no name)'}</p>
      <p><strong>Email:</strong> ${data.user.email}</p>
      <p><strong>ID:</strong> ${data.user.id}</p>
    `;
  } catch (err) {
    showMessage('Network error');
  }
}

btnSignup.addEventListener('click', signup);
btnLogin.addEventListener('click', login);
btnLogout.addEventListener('click', () => {
  clearToken();
  renderProfile();
});

// initialize
renderProfile();
