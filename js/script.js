// Reveal sections as they enter the viewport.
const faders = document.querySelectorAll('.fade');
window.addEventListener('scroll', () => {
  faders.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add('show');
    }
  });
});

// Keep the one-page navigation smooth instead of jumping.
const links = document.querySelectorAll('nav a');
links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Slight mouse movement on the hero so it does not feel static.
document.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  document.querySelector('.hero').style.transform = `translate(${x}px, ${y}px)`;
});

// Login / register modal state
const loginBtn = document.getElementById('loginBtn');
const modal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const authSubmit = document.getElementById('authSubmit');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const authSwitchLabel = document.getElementById('authSwitchLabel');
const logoutPanel = document.getElementById('logoutPanel');
const logoutSubmit = document.getElementById('logoutSubmit');
const message = document.getElementById('loginMessage');
const authToast = document.getElementById('authToast');
const authApiUrl = window.AUTH_API_URL || 'http://127.0.0.1:3000';

let authMode = 'login';
let toastTimer;

function showMessage(text, type) {
  message.innerText = text;
  message.className = `auth-message ${type}`;
}

function clearMessage() {
  message.innerText = '';
  message.className = 'auth-message';
}

function showToast(text, type = 'success') {
  clearTimeout(toastTimer);
  authToast.innerText = text;
  authToast.className = `auth-toast show ${type}`;

  toastTimer = setTimeout(() => {
    authToast.className = 'auth-toast';
  }, 2600);
}

function setLoggedInState(username) {
  localStorage.setItem('loggedInUser', username);
  loginBtn.innerText = `Hi, ${username}`;
  loginBtn.dataset.user = username;
  updateContactAccess();
}

function clearLoggedInState() {
  localStorage.removeItem('loggedInUser');
  loginBtn.innerText = 'Login';
  delete loginBtn.dataset.user;
  updateContactAccess();
}

function updateAuthView() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  const isLoggedIn = Boolean(loggedInUser);

  if (isLoggedIn) {
    authTitle.innerText = 'Account';
    authSubtitle.innerText = `Signed in as ${loggedInUser}.`;
    authSubmit.hidden = true;
    usernameInput.hidden = true;
    passwordInput.hidden = true;
    logoutPanel.classList.remove('is-hidden');
    authSwitchLabel.innerText = 'Want to use a different account?';
    toggleAuthMode.innerText = 'Sign in here';
    toggleAuthMode.hidden = false;
    return;
  }

  logoutPanel.classList.add('is-hidden');
  authSubmit.hidden = false;
  usernameInput.hidden = false;
  passwordInput.hidden = false;
  toggleAuthMode.hidden = false;

  if (authMode === 'login') {
    authTitle.innerText = 'Login';
    authSubtitle.innerText = 'Welcome back. Sign in to continue to your account.';
    authSubmit.innerText = 'Login';
    authSwitchLabel.innerText = 'No account yet?';
    toggleAuthMode.innerText = 'Register here';
  } else {
    authTitle.innerText = 'Register';
    authSubtitle.innerText = 'Create an account to get started with your access.';
    authSubmit.innerText = 'Create Account';
    authSwitchLabel.innerText = 'Already have an account?';
    toggleAuthMode.innerText = 'Login here';
  }
}

function openModal() {
  clearMessage();
  updateAuthView();
  modal.style.display = 'flex';
}

loginBtn.addEventListener('click', openModal);

closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', e => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

toggleAuthMode.addEventListener('click', () => {
  clearMessage();

  if (localStorage.getItem('loggedInUser')) {
    clearLoggedInState();
    authMode = 'login';
  } else {
    authMode = authMode === 'login' ? 'signup' : 'login';
  }

  updateAuthView();
});

authSubmit.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showMessage('Please enter both username and password.', 'error');
    return;
  }

  const endpoint = authMode === 'login' ? 'login' : 'signup';

  try {
    const res = await fetch(`${authApiUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
      if (authMode === 'login') {
        setLoggedInState(username);
        showMessage(data.message || 'Login successful.', 'success');
        showToast(`Signed in successfully. Welcome, ${username}.`, 'success');
        updateAuthView();
        setTimeout(() => {
          modal.style.display = 'none';
          clearMessage();
        }, 900);
      } else {
        showMessage(data.message || 'Registration successful. You can now log in.', 'success');
        showToast('Account created successfully. You can log in now.', 'success');
        authMode = 'login';
        updateAuthView();
      }
    } else {
      showMessage(data.message || 'Something went wrong. Please try again.', 'error');
    }
  } catch (error) {
    showMessage('Unable to connect to the server right now.', 'error');
  }
});

logoutSubmit.addEventListener('click', () => {
  clearLoggedInState();
  authMode = 'login';
  usernameInput.value = '';
  passwordInput.value = '';
  updateAuthView();
  showMessage('You have been signed out successfully.', 'success');
  showToast('Signed out successfully.', 'success');
});

const contactGate = document.getElementById('contactGate');
const contactLoginTrigger = document.getElementById('contactLoginTrigger');
const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');
const contactSubmit = document.getElementById('contactSubmit');
const scrollVisuals = document.querySelectorAll('.scroll-visual');
const parallaxMedia = document.querySelectorAll('.parallax-media');
const teamSlider = document.getElementById('teamSlider');
const teamSliderButtons = document.querySelectorAll('[data-team-slider]');

// Contact form stays hidden until someone is signed in.
function updateContactAccess() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  const isLoggedIn = Boolean(loggedInUser);

  if (contactGate) {
    contactGate.classList.toggle('is-hidden', isLoggedIn);
  }

  if (contactForm) {
    contactForm.classList.toggle('is-hidden', !isLoggedIn);
  }
}

const savedUser = localStorage.getItem('loggedInUser');
if (savedUser) {
  setLoggedInState(savedUser);
}
updateAuthView();
updateContactAccess();

// Subtle motion inside the about section.
function updateScrollVisuals() {
  if (!scrollVisuals.length) {
    return;
  }

  const viewportCenter = window.innerHeight / 2;

  scrollVisuals.forEach(visual => {
    const rect = visual.getBoundingClientRect();
    const speed = Number(visual.dataset.scrollSpeed || 0.12);
    const visualCenter = rect.top + rect.height / 2;
    const distanceFromCenter = visualCenter - viewportCenter;
    const offset = Math.max(-90, Math.min(90, distanceFromCenter * speed));

    visual.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
}

// Move the wide image block a bit while scrolling.
function updateParallaxMedia() {
  if (!parallaxMedia.length) {
    return;
  }

  const viewportHeight = window.innerHeight;

  parallaxMedia.forEach(media => {
    const rect = media.parentElement.getBoundingClientRect();
    const speed = Number(media.dataset.parallaxSpeed || 0.1);
    const progress = (rect.top + rect.height / 2 - viewportHeight / 2) * speed;
    const offset = Math.max(-70, Math.min(70, progress));

    media.style.transform = `translate3d(0, ${offset}px, 0) scale(1.08)`;
  });
}

window.addEventListener('scroll', updateScrollVisuals, { passive: true });
window.addEventListener('scroll', updateParallaxMedia, { passive: true });
window.addEventListener('resize', updateScrollVisuals);
window.addEventListener('resize', updateParallaxMedia);
updateScrollVisuals();
updateParallaxMedia();

if (teamSlider && teamSliderButtons.length) {
  // Slide the team cards one card at a time.
  teamSliderButtons.forEach(button => {
    button.addEventListener('click', () => {
      const firstCard = teamSlider.querySelector('.team-profile-card');

      if (!firstCard) {
        return;
      }

      const cardWidth = firstCard.getBoundingClientRect().width + 20;
      const direction = button.dataset.teamSlider === 'next' ? 1 : -1;

      teamSlider.scrollBy({
        left: cardWidth * direction,
        behavior: 'smooth'
      });
    });
  });
}

if (contactLoginTrigger) {
  contactLoginTrigger.addEventListener('click', openModal);
}

if (contactForm) {
  // Send the feedback form through Formspree and report the result inline.
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();

    const formData = new FormData(contactForm);

    if (contactStatus) {
      contactStatus.textContent = 'Sending feedback...';
      contactStatus.className = 'contact-status';
    }

    if (contactSubmit) {
      contactSubmit.disabled = true;
      contactSubmit.textContent = 'Sending...';
    }

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      contactForm.reset();

      if (contactStatus) {
        contactStatus.textContent = 'Feedback sent successfully.';
        contactStatus.className = 'contact-status success';
      }
    } catch (error) {
      if (contactStatus) {
        contactStatus.textContent = 'Unable to send right now. Please try again.';
        contactStatus.className = 'contact-status error';
      }
    } finally {
      if (contactSubmit) {
        contactSubmit.disabled = false;
        contactSubmit.textContent = 'Send Feedback';
      }
    }
  });
}

// Simple page switch for the project preview cards.
function openProject(page) {
  window.location.href = page;
}
