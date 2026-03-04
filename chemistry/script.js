// === Mobile Nav Toggle ===
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      menuToggle.textContent = nav.classList.contains('open') ? '\u2715' : '\u2630';
    });

    // Close nav when clicking a link on mobile
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 800) {
          nav.classList.remove('open');
          menuToggle.textContent = '\u2630';
        }
      });
    });
  }

  // Highlight current page in nav
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  nav?.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  // Initialize RAG from localStorage
  initRAG();
});

// === Show/Hide Answer ===
function showAnswer(btn) {
  const questionBlock = btn.closest('.question-block');
  const answerReveal = questionBlock.querySelector('.answer-reveal');
  if (answerReveal) {
    answerReveal.classList.toggle('show');
    btn.textContent = answerReveal.classList.contains('show') ? 'Hide Answer' : 'Show Answer';
  }
}

// === Multiple Choice Checking ===
function checkMC(btn) {
  const questionBlock = btn.closest('.question-block');
  const selected = questionBlock.querySelector('input[type="radio"]:checked');
  const answerReveal = questionBlock.querySelector('.answer-reveal');
  const labels = questionBlock.querySelectorAll('.mc-options label');

  if (!selected) {
    alert('Please select an answer first.');
    return;
  }

  // Remove any previous styling
  labels.forEach(l => {
    l.classList.remove('correct', 'incorrect');
  });

  const isCorrect = selected.dataset.correct === 'true';
  const selectedLabel = selected.closest('label');

  if (isCorrect) {
    selectedLabel.classList.add('correct');
    if (answerReveal) {
      answerReveal.classList.remove('incorrect-feedback');
      answerReveal.querySelector('.answer-header').textContent = 'Correct!';
    }
  } else {
    selectedLabel.classList.add('incorrect');
    // Also highlight correct answer
    questionBlock.querySelectorAll('input[type="radio"]').forEach(radio => {
      if (radio.dataset.correct === 'true') {
        radio.closest('label').classList.add('correct');
      }
    });
    if (answerReveal) {
      answerReveal.classList.add('incorrect-feedback');
      answerReveal.querySelector('.answer-header').textContent = 'Not quite...';
    }
  }

  if (answerReveal) {
    answerReveal.classList.add('show');
  }

  btn.disabled = true;
  btn.textContent = isCorrect ? 'Correct!' : 'Incorrect';

  // Disable further selection
  questionBlock.querySelectorAll('input[type="radio"]').forEach(r => r.disabled = true);

  // Track score
  updateQuizScore();
}

// === Fill-in-the-blank Checking ===
function checkFill(btn, answers) {
  const questionBlock = btn.closest('.question-block');
  const inputs = questionBlock.querySelectorAll('.fill-input');
  const answerReveal = questionBlock.querySelector('.answer-reveal');
  // answers is an array of acceptable answers (arrays of alternatives) corresponding to each input
  let allCorrect = true;

  inputs.forEach((input, i) => {
    const acceptable = answers[i].map(a => a.toLowerCase().trim());
    const userVal = input.value.toLowerCase().trim();
    if (acceptable.includes(userVal)) {
      input.classList.add('correct-input');
      input.classList.remove('incorrect-input');
    } else {
      input.classList.add('incorrect-input');
      input.classList.remove('correct-input');
      allCorrect = false;
    }
    input.readOnly = true;
  });

  if (answerReveal) {
    answerReveal.classList.add('show');
    if (allCorrect) {
      answerReveal.classList.remove('incorrect-feedback');
      answerReveal.querySelector('.answer-header').textContent = 'Correct!';
    } else {
      answerReveal.classList.add('incorrect-feedback');
      answerReveal.querySelector('.answer-header').textContent = 'Not quite...';
    }
  }

  btn.disabled = true;
  btn.textContent = allCorrect ? 'Correct!' : 'Check the answer below';
}

// === Quiz Score Tracking ===
function updateQuizScore() {
  const scoreEl = document.getElementById('quiz-score');
  if (!scoreEl) return;

  const allQuestions = document.querySelectorAll('.question-block.mc');
  let answered = 0;
  let correct = 0;

  allQuestions.forEach(q => {
    const checkedRadio = q.querySelector('input[type="radio"]:checked');
    if (checkedRadio && checkedRadio.disabled) {
      answered++;
      if (checkedRadio.dataset.correct === 'true') {
        correct++;
      }
    }
  });

  scoreEl.textContent = `${correct}/${answered}`;
}

// === RAG Self-Assessment ===
function initRAG() {
  document.querySelectorAll('.rag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.rag-item');
      const key = item.dataset.ragKey;
      const rating = btn.dataset.rating;

      // Deselect siblings
      item.querySelectorAll('.rag-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Save to localStorage
      const ragData = JSON.parse(localStorage.getItem('gcse-chem-rag') || '{}');
      ragData[key] = rating;
      localStorage.setItem('gcse-chem-rag', JSON.stringify(ragData));

      updateProgress();
    });
  });

  // Load saved ratings
  const ragData = JSON.parse(localStorage.getItem('gcse-chem-rag') || '{}');
  Object.entries(ragData).forEach(([key, rating]) => {
    const item = document.querySelector(`.rag-item[data-rag-key="${key}"]`);
    if (item) {
      const btn = item.querySelector(`.rag-btn[data-rating="${rating}"]`);
      if (btn) btn.classList.add('selected');
    }
  });

  updateProgress();
}

function updateProgress() {
  const progressBar = document.querySelector('.progress-bar');
  const progressText = document.querySelector('.progress-text');
  if (!progressBar) return;

  const ragData = JSON.parse(localStorage.getItem('gcse-chem-rag') || '{}');
  const allItems = document.querySelectorAll('.rag-item');
  const total = allItems.length;
  if (total === 0) return;

  let greenCount = 0;
  let ratedCount = 0;

  Object.values(ragData).forEach(v => {
    ratedCount++;
    if (v === 'green') greenCount++;
  });

  const pct = Math.round((greenCount / total) * 100);
  progressBar.style.width = pct + '%';
  if (progressText) {
    progressText.textContent = `${greenCount}/${total} topics confident (${pct}%)`;
  }
}

function resetRAG() {
  if (confirm('Reset all your RAG self-assessments? This cannot be undone.')) {
    localStorage.removeItem('gcse-chem-rag');
    document.querySelectorAll('.rag-btn').forEach(b => b.classList.remove('selected'));
    updateProgress();
  }
}

// === Collapsible Sections ===
function toggleCollapsible(header) {
  header.classList.toggle('collapsed');
  const content = header.nextElementSibling;
  content.classList.toggle('hidden');
}
