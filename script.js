const SCRIPT_VERSION = "2.1.1";
console.log("PlaceMentor Script v" + SCRIPT_VERSION + " Initialized [Stable v1]");

// Search System
function initSearch() {
    const searchInput = document.querySelector('#search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.glass-card');
        
        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            if (text.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Download Notes Mock
window.downloadNotes = () => {
    alert("Downloading PDF Notes... (This is a mock feature for the technical demonstration)");
};

// Bookmark System
function toggleBookmark(topicId) {
    let bookmarks = JSON.parse(localStorage.getItem('placementor_bookmarks')) || [];
    if (bookmarks.includes(topicId)) {
        bookmarks = bookmarks.filter(id => id !== topicId);
    } else {
        bookmarks.push(topicId);
    }
    localStorage.setItem('placementor_bookmarks', JSON.stringify(bookmarks));
    alert("Topic bookmarked!");
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCollapsibles();
    initProgress();
    updateNavigation();
    initSearch();
    wrapTables();
});

// Auto-wrap tables for responsiveness
function wrapTables() {
    document.querySelectorAll('.tech-table').forEach(table => {
        if (!table.parentElement.classList.contains('tech-table-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'tech-table-wrapper';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeBtn = document.querySelector('#theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// Collapsible Sections
function initCollapsibles() {
    const headers = document.querySelectorAll('.collapsible-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.chevron-icon');
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                if (icon) icon.style.transform = 'rotate(0deg)';
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}

// Progress Tracking
function initProgress() {
    const units = ['unit1', 'unit2', 'unit3', 'unit4', 'unit5', 'unit6'];
    let progress = JSON.parse(localStorage.getItem('placementor_progress')) || {};
    
    // Initialize if empty
    units.forEach(u => {
        if (!progress[u]) progress[u] = { completed: false, quizScore: 0 };
    });
    
    localStorage.setItem('placementor_progress', JSON.stringify(progress));
    updateProgressBar();
}

function updateProgressBar() {
    const progress = JSON.parse(localStorage.getItem('placementor_progress'));
    if (!progress) return;
    
    const totalUnits = 6;
    const completedUnits = Object.values(progress).filter(u => u.completed).length;
    const percentage = (completedUnits / totalUnits) * 100;
    
    const bars = document.querySelectorAll('.progress-bar');
    bars.forEach(bar => {
        bar.style.width = `${percentage}%`;
    });
    
    const text = document.querySelector('.progress-text');
    if (text) text.innerText = `${Math.round(percentage)}% Complete`;
}

function markUnitComplete(unitId) {
    let progress = JSON.parse(localStorage.getItem('placementor_progress'));
    if (progress[unitId]) {
        progress[unitId].completed = true;
        localStorage.setItem('placementor_progress', JSON.stringify(progress));
        updateProgressBar();
    }
}

// Navigation Helper
function updateNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Quiz System Utility
function handleQuiz(unitId, questions) {
    const quizContainer = document.querySelector(`#quiz-${unitId}`);
    if (!quizContainer) return;

    let html = '';
    questions.forEach((q, index) => {
        html += `
            <div class="quiz-question glass-card" style="margin-bottom: 1rem; padding: 1.5rem;">
                <p style="font-weight: 600; margin-bottom: 1rem;">${index + 1}. ${q.question}</p>
                <div class="options">
                    ${q.options.map((opt, i) => `
                        <label style="display: block; margin-bottom: 0.5rem; cursor: pointer;">
                            <input type="radio" name="q${index}" value="${i}"> ${opt}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    });

    html += `<button class="btn btn-primary" onclick="submitQuiz('${unitId}', ${JSON.stringify(questions).replace(/"/g, '&quot;')})">Submit Quiz</button>`;
    quizContainer.innerHTML = html;
}

window.submitQuiz = (unitId, questions) => {
    let score = 0;
    questions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        if (selected && parseInt(selected.value) === q.answer) {
            score++;
        }
    });

    const resultArea = document.querySelector(`#quiz-result-${unitId}`);
    if (resultArea) {
        resultArea.innerHTML = `
            <div class="glass-card" style="border-color: var(--success); background: rgba(34, 197, 94, 0.1);">
                <h3>Quiz Results</h3>
                <p>Your Score: ${score} / ${questions.length}</p>
                <p>${score >= questions.length / 2 ? 'Great job!' : 'Keep studying and try again.'}</p>
            </div>
        `;
    }

    if (score >= questions.length / 2) {
        markUnitComplete(unitId);
    }
};
