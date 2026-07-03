// =============================================
//   script.js — Frontend logic
// =============================================

const API_BASE = 'http://localhost:3000/api';

const statusBanner    = document.getElementById('statusBanner');
const confessionForm  = document.getElementById('confessionForm');
const contentInput    = document.getElementById('content');
const charCount       = document.getElementById('charCount');
const contentError    = document.getElementById('contentError');
const categorySelect  = document.getElementById('category');
const submitBtn       = document.getElementById('submitBtn');
const btnText         = document.getElementById('btnText');
const spinner         = document.getElementById('spinner');
const categoryFilter  = document.getElementById('categoryFilter');
const confessionList  = document.getElementById('confessionList');
const loadingText     = document.getElementById('loadingText');

// =============================================
//  BANNER HELPER
// =============================================

function showBanner(message, type) {
  statusBanner.textContent = message;
  statusBanner.className = `banner visible ${type}`;
  setTimeout(() => statusBanner.classList.remove('visible'), 4000);
}

// =============================================
//  FETCH HELPER
// =============================================

async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong.');
    }
    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Could not reach the backend server. Is it running on port 3000?');
    }
    throw err;
  }
}

// =============================================
//  CHARACTER COUNTER
// =============================================

contentInput.addEventListener('input', () => {
  charCount.textContent = contentInput.value.length;
});

// =============================================
//  LOAD CONFESSIONS
// =============================================

async function loadConfessions() {
  const category = categoryFilter.value;
  loadingText.style.display = 'block';
  loadingText.textContent = 'Loading confessions...';
  confessionList.innerHTML = '';

  try {
    const query = category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
    const confessions = await apiRequest(`/confessions${query}`);
    loadingText.style.display = 'none';
    renderConfessions(confessions);
  } catch (err) {
    loadingText.textContent = `Error: ${err.message}`;
  }
}

function renderConfessions(confessions) {
  if (confessions.length === 0) {
    confessionList.innerHTML = '<p class="loading-text">No confessions here yet. Be the first to share.</p>';
    return;
  }

  confessionList.innerHTML = '';
  confessions.forEach(conf => {
    const card = document.createElement('div');
    card.className = 'confession-card';
    card.innerHTML = `
      <div class="vote-controls">
        <button class="vote-btn upvote" data-id="${conf.id}" aria-label="Upvote">&#9650;</button>
        <span class="vote-count">${conf.votes}</span>
        <button class="vote-btn downvote" data-id="${conf.id}" aria-label="Downvote">&#9660;</button>
      </div>
      <div class="confession-body">
        <p class="confession-content">${escapeHtml(conf.content)}</p>
        <div class="confession-meta">
          <span class="category-tag">${escapeHtml(conf.category)}</span>
          <span class="confession-time">${formatTime(conf.created_at)}</span>
        </div>
      </div>
    `;
    confessionList.appendChild(card);
  });

  document.querySelectorAll('.upvote').forEach(btn => {
    btn.addEventListener('click', () => handleVote(btn.dataset.id, 'upvote'));
  });
  document.querySelectorAll('.downvote').forEach(btn => {
    btn.addEventListener('click', () => handleVote(btn.dataset.id, 'downvote'));
  });
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// =============================================
//  VOTING
// =============================================

async function handleVote(id, direction) {
  try {
    await apiRequest(`/confessions/${id}/${direction}`, { method: 'PUT' });
    await loadConfessions();
  } catch (err) {
    showBanner(err.message, 'error');
  }
}

categoryFilter.addEventListener('change', loadConfessions);

// =============================================
//  SUBMIT NEW CONFESSION
// =============================================

function validateContent(value) {
  if (!value.trim()) return 'Confession cannot be empty.';
  if (value.trim().length < 5) return 'Confession must be at least 5 characters.';
  if (value.trim().length > 500) return 'Confession must be under 500 characters.';
  return '';
}

confessionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  contentError.textContent = '';

  const error = validateContent(contentInput.value);
  if (error) {
    contentError.textContent = error;
    contentInput.focus();
    return;
  }

  setSubmitting(true);

  try {
    await apiRequest('/confessions', {
      method: 'POST',
      body: JSON.stringify({
        content: contentInput.value.trim(),
        category: categorySelect.value,
      }),
    });

    showBanner('Confession posted anonymously.', 'success');
    confessionForm.reset();
    charCount.textContent = '0';
    await loadConfessions();
  } catch (err) {
    contentError.textContent = err.message;
  } finally {
    setSubmitting(false);
  }
});

function setSubmitting(isSubmitting) {
  submitBtn.disabled = isSubmitting;
  if (isSubmitting) {
    btnText.textContent = 'Posting...';
    spinner.classList.add('active');
  } else {
    btnText.textContent = 'Post Anonymously';
    spinner.classList.remove('active');
  }
}

// =============================================
//  INITIAL LOAD
// =============================================

loadConfessions();
