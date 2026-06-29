// ============================================================
// DSA Problem Tracker - app.js (with Auth)
// ============================================================

// Global state
let currentUser = null;
let problems = [];
let editingId = null;
let currentFilters = {
  search: '',
  topic: 'all',
  difficulty: 'all',
  sort: 'date-desc'
};

// ============================================================
// AUTH ELEMENTS
// ============================================================
const authScreen = document.getElementById('authScreen');
const mainHeader = document.getElementById('mainHeader');
const mainContent = document.getElementById('mainContent');

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const signupUsername = document.getElementById('signupUsername');
const signupPassword = document.getElementById('signupPassword');
const signupConfirm = document.getElementById('signupConfirm');
const signupError = document.getElementById('signupError');
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');

// ============================================================
// MAIN APP ELEMENTS
// ============================================================
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');

const searchInput = document.getElementById('searchInput');
const topicFilters = document.getElementById('topicFilters');
const sortSelect = document.getElementById('sortSelect');
const clearFiltersBtn = document.getElementById('clearFilters');
const exportBtn = document.getElementById('exportBtn');

const tableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');
const logCount = document.getElementById('logCount');

const totalCount = document.getElementById('totalCount');
const easyCount = document.getElementById('easyCount');
const medCount = document.getElementById('medCount');
const hardCount = document.getElementById('hardCount');
const easyBar = document.getElementById('easyBar');
const medBar = document.getElementById('medBar');
const hardBar = document.getElementById('hardBar');

const streakDisplay = document.getElementById('streakDisplay');
const heatmapGrid = document.getElementById('heatmapGrid');

// Form fields
const fName = document.getElementById('fName');
const fTopic = document.getElementById('fTopic');
const fDiff = document.getElementById('fDiff');
const fPlatform = document.getElementById('fPlatform');
const fDate = document.getElementById('fDate');
const fLink = document.getElementById('fLink');
const fNotes = document.getElementById('fNotes');
const fTags = document.getElementById('fTags');
const formError = document.getElementById('formError');

const confirmOverlay = document.getElementById('confirmOverlay');
const confirmDelete = document.getElementById('confirmDelete');
const confirmCancel = document.getElementById('confirmCancel');

// ============================================================
// AUTH SYSTEM
// ============================================================

function getAllUsers() {
  return JSON.parse(localStorage.getItem('dsa_users')) || {};
}

function saveAllUsers(users) {
  localStorage.setItem('dsa_users', JSON.stringify(users));
}

function login(username, password) {
  const users = getAllUsers();
  const user = users[username];

  if (!user) {
    return { success: false, error: 'User not found.' };
  }

  if (user.password !== password) {
    return { success: false, error: 'Incorrect password.' };
  }

  currentUser = username;
  localStorage.setItem('dsa_currentUser', username);
  problems = user.problems || [];
  showApp();
  return { success: true };
}

function signup(username, password, confirmPassword) {
  if (!username.trim()) {
    return { success: false, error: 'Username cannot be empty.' };
  }

  if (username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters.' };
  }

  if (!password || password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  const users = getAllUsers();

  if (users[username]) {
    return { success: false, error: 'Username already exists.' };
  }

  users[username] = {
    username,
    password,
    problems: [],
    createdAt: new Date().toISOString()
  };

  saveAllUsers(users);
  currentUser = username;
  localStorage.setItem('dsa_currentUser', username);
  problems = [];
  showApp();
  return { success: true };
}

function logout() {
  currentUser = null;
  problems = [];
  localStorage.removeItem('dsa_currentUser');
  loginUsername.value = '';
  loginPassword.value = '';
  signupUsername.value = '';
  signupPassword.value = '';
  signupConfirm.value = '';
  loginError.textContent = '';
  signupError.textContent = '';
  switchToLogin.click();
  showAuth();
}

function showAuth() {
  authScreen.classList.remove('hidden');
  mainHeader.style.display = 'none';
  mainContent.style.display = 'none';
}

function showApp() {
  authScreen.classList.add('hidden');
  mainHeader.style.display = 'block';
  mainContent.style.display = 'grid';
  usernameDisplay.textContent = currentUser;
  updateStats();
  updateTopicFilters();
  renderTable();
}

function saveCurrentUserData() {
  const users = getAllUsers();
  if (currentUser && users[currentUser]) {
    users[currentUser].problems = problems;
    saveAllUsers(users);
  }
}

function checkAutoLogin() {
  const storedUser = localStorage.getItem('dsa_currentUser');
  if (storedUser) {
    const users = getAllUsers();
    if (users[storedUser]) {
      currentUser = storedUser;
      problems = users[storedUser].problems || [];
      showApp();
    } else {
      showAuth();
    }
  } else {
    showAuth();
  }
}

// ============================================================
// AUTH EVENT LISTENERS
// ============================================================

loginBtn.addEventListener('click', () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value;
  loginError.textContent = '';

  if (!username || !password) {
    loginError.textContent = 'Please fill in all fields.';
    return;
  }

  const result = login(username, password);
  if (!result.success) {
    loginError.textContent = result.error;
  }
});

signupBtn.addEventListener('click', () => {
  const username = signupUsername.value.trim();
  const password = signupPassword.value;
  const confirm = signupConfirm.value;
  signupError.textContent = '';

  const result = signup(username, password, confirm);
  if (!result.success) {
    signupError.textContent = result.error;
  }
});

switchToSignup.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.remove('active');
  signupForm.classList.add('active');
});

switchToLogin.addEventListener('click', (e) => {
  e.preventDefault();
  signupForm.classList.remove('active');
  loginForm.classList.add('active');
});

logoutBtn.addEventListener('click', logout);

// Allow Enter key to submit forms
loginUsername.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});
loginPassword.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});
signupUsername.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') signupBtn.click();
});
signupPassword.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') signupBtn.click();
});
signupConfirm.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') signupBtn.click();
});


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDifficultyLevel(diff) {
  const levels = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
  return levels[diff] || 0;
}

function extractDomain(url) {
  if (!url) return '';
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    if (domain.includes('leetcode')) return 'LeetCode';
    if (domain.includes('geeksforgeeks')) return 'GFG';
    if (domain.includes('codeforces')) return 'CF';
    if (domain.includes('hackerrank')) return 'HR';
    if (domain.includes('codechef')) return 'CC';
    return domain.split('.')[0];
  } catch {
    return '';
  }
}

// ============================================================
// STATISTICS & UI UPDATE
// ============================================================

function updateStats() {
  const easyProbs = problems.filter(p => p.difficulty === 'Easy').length;
  const medProbs = problems.filter(p => p.difficulty === 'Medium').length;
  const hardProbs = problems.filter(p => p.difficulty === 'Hard').length;
  const total = problems.length;

  totalCount.textContent = total;
  easyCount.textContent = easyProbs;
  medCount.textContent = medProbs;
  hardCount.textContent = hardProbs;

  // Update progress bar
  const barWidth = total > 0 ? 100 / total : 0;
  easyBar.style.width = (easyProbs * barWidth) + '%';
  medBar.style.width = (medProbs * barWidth) + '%';
  hardBar.style.width = (hardProbs * barWidth) + '%';

  updateHeatmap();
}

function updateTopicFilters() {
  const topics = [...new Set(problems.map(p => p.topic).filter(t => t))];
  topicFilters.innerHTML = '<button class="chip active" data-topic="all">All</button>';

  topics.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = topic;
    btn.dataset.topic = topic;
    if (currentFilters.topic === topic) btn.classList.add('active');
    btn.addEventListener('click', () => setTopicFilter(topic));
    topicFilters.appendChild(btn);
  });

  const allBtn = topicFilters.querySelector('[data-topic="all"]');
  if (currentFilters.topic === 'all') allBtn.classList.add('active');
  else allBtn.classList.remove('active');
}

function updateHeatmap() {
  const today = new Date();
  const days = 49; // 7 weeks
  const heatData = {};

  // Count problems per day
  problems.forEach(p => {
    const dateKey = p.date || new Date().toISOString().split('T')[0];
    heatData[dateKey] = (heatData[dateKey] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(heatData), 1);
  heatmapGrid.innerHTML = '';

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const count = heatData[dateKey] || 0;
    const level = count === 0 ? 0 : Math.ceil((count / maxCount) * 3);

    const cell = document.createElement('div');
    cell.className = 'heat-cell';
    cell.dataset.level = level;
    cell.title = `${formatDate(dateKey)}: ${count} problem${count !== 1 ? 's' : ''}`;
    heatmapGrid.appendChild(cell);
  }

  // Calculate streak
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    if (heatData[dateKey]) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  streakDisplay.textContent = streak + ' day' + (streak !== 1 ? 's' : '');
}

// ============================================================
// RENDER TABLE
// ============================================================

function getFilteredProblems() {
  let filtered = problems;

  if (currentFilters.search) {
    const term = currentFilters.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.topic.toLowerCase().includes(term) ||
      p.notes.toLowerCase().includes(term)
    );
  }

  if (currentFilters.topic !== 'all') {
    filtered = filtered.filter(p => p.topic === currentFilters.topic);
  }

  if (currentFilters.difficulty !== 'all') {
    filtered = filtered.filter(p => p.difficulty === currentFilters.difficulty);
  }

  // Sort
  filtered.sort((a, b) => {
    switch (currentFilters.sort) {
      case 'date-desc':
        return new Date(b.date || 0) - new Date(a.date || 0);
      case 'date-asc':
        return new Date(a.date || 0) - new Date(b.date || 0);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'difficulty':
        return getDifficultyLevel(b.difficulty) - getDifficultyLevel(a.difficulty);
      default:
        return 0;
    }
  });

  return filtered;
}

function renderTable() {
  const filtered = getFilteredProblems();
  tableBody.innerHTML = '';

  logCount.textContent = `Showing ${filtered.length} problem${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    emptyState.classList.add('visible');
    return;
  }
  emptyState.classList.remove('visible');

  filtered.forEach((problem, idx) => {
    const row = document.createElement('tr');
    
    // Row number
    const numCell = document.createElement('td');
    numCell.className = 'row-num';
    numCell.textContent = idx + 1;
    row.appendChild(numCell);

    // Problem name + link
    const nameCell = document.createElement('td');
    nameCell.innerHTML = `
      <div class="prob-name">
        ${problem.name}
        ${problem.link ? `<a href="${problem.link}" target="_blank" class="prob-link" title="Open link">↗</a>` : ''}
      </div>
      <div class="prob-meta">
        ${problem.platform ? `<span class="prob-platform">${problem.platform}</span>` : ''}
        ${problem.tags ? problem.tags.split(',').map(tag => `<span class="prob-tag">${tag.trim()}</span>`).join('') : ''}
      </div>
    `;
    row.appendChild(nameCell);

    // Topic
    const topicCell = document.createElement('td');
    topicCell.innerHTML = `<span class="topic-badge">${problem.topic}</span>`;
    row.appendChild(topicCell);

    // Difficulty
    const diffCell = document.createElement('td');
    diffCell.innerHTML = `
      <span class="diff-pill ${problem.difficulty}">
        <span class="diff-dot"></span> ${problem.difficulty}
      </span>
    `;
    row.appendChild(diffCell);

    // Date
    const dateCell = document.createElement('td');
    dateCell.className = 'date-col';
    dateCell.textContent = formatDate(problem.date);
    row.appendChild(dateCell);

    // Notes
    const notesCell = document.createElement('td');
    notesCell.className = 'notes-col';
    notesCell.textContent = problem.notes || '—';
    notesCell.title = problem.notes || '';
    row.appendChild(notesCell);

    // Actions
    const actionsCell = document.createElement('td');
    actionsCell.innerHTML = `
      <div class="action-btns">
        <button class="btn-edit" data-id="${problem.id}" title="Edit">✎</button>
        <button class="btn-del" data-id="${problem.id}" title="Delete">✕</button>
      </div>
    `;
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
  });

  // Attach event listeners to edit/delete buttons
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => editProblem(btn.dataset.id));
  });
  document.querySelectorAll('.btn-del').forEach(btn => {
    btn.addEventListener('click', (e) => confirmDeleteProblem(btn.dataset.id));
  });
}

// ============================================================
// MODAL & FORM
// ============================================================

function openModal() {
  editingId = null;
  modalTitle.textContent = 'Log Problem';
  resetForm();
  modalOverlay.classList.add('open');
  fName.focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  resetForm();
}

function resetForm() {
  fName.value = '';
  fTopic.value = '';
  fDiff.value = '';
  fPlatform.value = '';
  fDate.value = '';
  fLink.value = '';
  fNotes.value = '';
  fTags.value = '';
  formError.textContent = '';
  document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('selected-Easy', 'selected-Medium', 'selected-Hard'));
}

function editProblem(id) {
  editingId = id;
  const problem = problems.find(p => p.id === id);
  if (!problem) return;

  modalTitle.textContent = 'Edit Problem';
  fName.value = problem.name;
  fTopic.value = problem.topic;
  fDiff.value = problem.difficulty;
  fPlatform.value = problem.platform;
  fDate.value = problem.date;
  fLink.value = problem.link;
  fNotes.value = problem.notes;
  fTags.value = problem.tags;

  // Set difficulty button
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.classList.remove('selected-Easy', 'selected-Medium', 'selected-Hard');
    if (btn.dataset.val === problem.difficulty) {
      btn.classList.add(`selected-${problem.difficulty}`);
    }
  });

  formError.textContent = '';
  modalOverlay.classList.add('open');
  fName.focus();
}

function saveProblem() {
  const name = fName.value.trim();
  const topic = fTopic.value.trim();
  const difficulty = fDiff.value.trim();
  const platform = fPlatform.value.trim();
  const date = fDate.value;
  const link = fLink.value.trim();
  const notes = fNotes.value.trim();
  const tags = fTags.value.trim();

  formError.textContent = '';

  if (!name || !topic || !difficulty) {
    formError.textContent = 'Name, Topic, and Difficulty are required.';
    return;
  }

  if (editingId) {
    const problem = problems.find(p => p.id === editingId);
    if (problem) {
      problem.name = name;
      problem.topic = topic;
      problem.difficulty = difficulty;
      problem.platform = platform;
      problem.date = date;
      problem.link = link;
      problem.notes = notes;
      problem.tags = tags;
    }
  } else {
    const newProblem = {
      id: Date.now().toString(),
      name,
      topic,
      difficulty,
      platform,
      date: date || new Date().toISOString().split('T')[0],
      link,
      notes,
      tags,
      createdAt: new Date().toISOString()
    };
    problems.push(newProblem);
  }

  saveCurrentUserData();
  updateStats();
  updateTopicFilters();
  renderTable();
  closeModal();
}

function confirmDeleteProblem(id) {
  confirmDelete.onclick = () => deleteProblem(id);
  confirmOverlay.classList.add('open');
}

function deleteProblem(id) {
  problems = problems.filter(p => p.id !== id);
  saveCurrentUserData();
  updateStats();
  updateTopicFilters();
  renderTable();
  confirmOverlay.classList.remove('open');
}

// ============================================================
// FILTERS & SEARCH
// ============================================================

function setTopicFilter(topic) {
  currentFilters.topic = topic;
  updateTopicFilters();
  renderTable();
}

function setDifficultyFilter(diff) {
  currentFilters.difficulty = diff;
  document.querySelectorAll('.diff-chip').forEach(chip => {
    chip.classList.remove('active');
    if (chip.dataset.diff === diff) chip.classList.add('active');
  });
  renderTable();
}

function resetFilters() {
  currentFilters.search = '';
  currentFilters.topic = 'all';
  currentFilters.difficulty = 'all';
  currentFilters.sort = 'date-desc';
  searchInput.value = '';
  sortSelect.value = 'date-desc';
  updateTopicFilters();
  document.querySelectorAll('.diff-chip').forEach(chip => chip.classList.remove('active'));
  document.querySelector('[data-diff="all"]').classList.add('active');
  renderTable();
}

// ============================================================
// EXPORT CSV
// ============================================================

function exportToCSV() {
  const filtered = getFilteredProblems();
  if (filtered.length === 0) {
    alert('No problems to export.');
    return;
  }

  let csv = 'Problem Name,Topic,Difficulty,Platform,Date,Link,Notes,Tags\n';

  filtered.forEach(p => {
    const escapedName = `"${p.name.replace(/"/g, '""')}"`;
    const escapedNotes = `"${p.notes.replace(/"/g, '""')}"`;
    const escapedTags = `"${p.tags.replace(/"/g, '""')}"`;
    csv += `${escapedName},${p.topic},${p.difficulty},${p.platform || ''},${formatDate(p.date)},${p.link || ''},${escapedNotes},${escapedTags}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dsa-tracker-${currentUser}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// ============================================================
// EVENT LISTENERS
// ============================================================

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
saveBtn.addEventListener('click', saveProblem);
confirmCancel.addEventListener('click', () => confirmOverlay.classList.remove('open'));

searchInput.addEventListener('input', (e) => {
  currentFilters.search = e.target.value;
  renderTable();
});

sortSelect.addEventListener('change', (e) => {
  currentFilters.sort = e.target.value;
  renderTable();
});

clearFiltersBtn.addEventListener('click', resetFilters);
exportBtn.addEventListener('click', exportToCSV);

// Difficulty button toggle
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => 
      b.classList.remove('selected-Easy', 'selected-Medium', 'selected-Hard')
    );
    btn.classList.add(`selected-${btn.dataset.val}`);
    fDiff.value = btn.dataset.val;
  });
});

// Difficulty chip filter
document.querySelectorAll('.diff-chip').forEach(chip => {
  chip.addEventListener('click', () => setDifficultyFilter(chip.dataset.diff));
});

// Close modal on overlay click
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
confirmOverlay.addEventListener('click', (e) => {
  if (e.target === confirmOverlay) confirmOverlay.classList.remove('open');
});

// Enter key to save
fName.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') saveProblem();
});

// ============================================================
// INITIALIZATION
// ============================================================
checkAutoLogin();
