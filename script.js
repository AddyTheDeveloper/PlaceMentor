const SCRIPT_VERSION = "2.2.0";
console.log("PlaceMentor Script v" + SCRIPT_VERSION + " Initialized [Stable v2]");

// Gemini API Key - Replace with your own key from Google AI Studio
const GEMINI_API_KEY = "";

// Search System (supports Dashboard and Unit Page collapsible searching)
function initSearch() {
    const searchInput = document.querySelector('#search-input');
    if (!searchInput) return;

    // Create No Results element if it doesn't exist
    let noResults = document.querySelector('.no-results');
    if (!noResults) {
        noResults = document.createElement('div');
        noResults.className = 'no-results glass-card';
        noResults.innerHTML = '<i class="fas fa-search-minus"></i><p>No matching topics found. Try a different keyword!</p>';
        const contentArea = document.querySelector('.course-grid') || document.querySelector('.main-content');
        if (contentArea && contentArea.parentNode) {
            contentArea.parentNode.insertBefore(noResults, contentArea.nextSibling);
        }
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const isUnitPage = document.querySelector('.unit-page-header') !== null;

        if (isUnitPage) {
            // Filter unit collapsibles
            const headers = document.querySelectorAll('.collapsible-header');
            let hasVisibleContent = false;

            headers.forEach(header => {
                const content = header.nextElementSibling;
                const headerText = header.innerText.toLowerCase();
                const contentText = content.innerText.toLowerCase();
                const isMatch = headerText.includes(query) || contentText.includes(query);

                if (query === "") {
                    header.style.display = '';
                    content.style.display = '';
                    // Reset to height class
                    if (content.classList.contains('active')) {
                        content.style.maxHeight = content.scrollHeight + "px";
                    } else {
                        content.style.maxHeight = null;
                    }
                    hasVisibleContent = true;
                } else if (isMatch) {
                    header.style.display = '';
                    content.style.display = 'block';
                    content.style.maxHeight = 'none'; // Overrides max-height limit
                    hasVisibleContent = true;
                } else {
                    header.style.display = 'none';
                    content.style.display = 'none';
                    content.style.maxHeight = null;
                }
            });

            if (query !== "" && !hasVisibleContent) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
        } else {
            // Original homepage search logic
            const contentContainers = ['.course-grid', '.glossary-grid', '.benefit-grid'];
            let hasVisibleContent = false;
            let totalItemsChecked = 0;

            contentContainers.forEach(containerSelector => {
                const container = document.querySelector(containerSelector);
                if (!container) return;

                let items;
                if (containerSelector === '.glossary-grid') {
                    items = container.querySelectorAll('.glossary-item');
                } else {
                    items = container.querySelectorAll('.glass-card, .unit-card, .benefit-card');
                }

                items.forEach(item => {
                    const text = item.innerText.toLowerCase();
                    const isMatch = text.includes(query);
                    
                    if (query === "") {
                        item.style.display = '';
                        hasVisibleContent = true;
                    } else if (isMatch) {
                        item.style.display = ''; 
                        hasVisibleContent = true;
                    } else {
                        item.style.display = 'none';
                    }
                    totalItemsChecked++;
                });
            });

            if (query !== "" && !hasVisibleContent && totalItemsChecked > 0) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
        }
    });
}

// Download Notes System
window.downloadNotes = () => {
    const btn = event.currentTarget || document.querySelector('button[onclick="downloadNotes()"]');
    const originalContent = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing PDF...';
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Download Ready';
        btn.classList.remove('btn-primary');
        btn.style.background = 'var(--success)';
        
        const blob = new Blob(["PlaceMentor - Comprehensive Interview Notes\n\nDownload the full package at: https://github.com/AddyTheDeveloper/Place-Mentor"], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "PlaceMentor_Notes_Manifest.txt";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalContent;
            btn.style.background = '';
            btn.classList.add('btn-primary');
        }, 3000);
    }, 1500);
};

// Bookmark System
function toggleBookmark(topicId) {
    let bookmarks = JSON.parse(localStorage.getItem('placementor_bookmarks')) || [];
    const idx = bookmarks.indexOf(topicId);
    let isBookmarked = false;
    
    if (idx > -1) {
        bookmarks.splice(idx, 1);
    } else {
        bookmarks.push(topicId);
        isBookmarked = true;
    }
    
    localStorage.setItem('placementor_bookmarks', JSON.stringify(bookmarks));
    
    // Update bookmark UI indicators
    updateBookmarkButtons(topicId, isBookmarked);
    
    // Update Dashboard if we are on index.html
    updateBookmarksDashboard();
}

function updateBookmarkButtons(topicId, isBookmarked) {
    const buttons = document.querySelectorAll(`[data-bookmark-id="${topicId}"]`);
    buttons.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) {
            if (isBookmarked) {
                icon.className = 'fas fa-bookmark';
                btn.classList.add('bookmarked');
            } else {
                icon.className = 'far fa-bookmark';
                btn.classList.remove('bookmarked');
            }
        }
    });
}

function initBookmarks() {
    let bookmarks = JSON.parse(localStorage.getItem('placementor_bookmarks')) || [];
    bookmarks.forEach(topicId => {
        updateBookmarkButtons(topicId, true);
    });
    updateBookmarksDashboard();
}

function updateBookmarksDashboard() {
    const listContainer = document.querySelector('#bookmarks-list');
    const section = document.querySelector('#bookmarks-section');
    if (!listContainer || !section) return;

    const bookmarks = JSON.parse(localStorage.getItem('placementor_bookmarks')) || [];
    if (bookmarks.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    
    const topicMap = {
        'unit1_sec1': { title: 'Unit 1: Foundations & Types of OS', url: 'unit1.html' },
        'unit1_sec2': { title: 'Unit 1: Process Management & Life Cycle', url: 'unit1.html' },
        'unit1_sec3': { title: 'Unit 1: Processor Scheduling Algorithms', url: 'unit1.html' },
        'unit1_sec4': { title: 'Unit 1: Process Synchronization & IPC', url: 'unit1.html' },
        'unit1_sec4b': { title: 'Unit 1: Deadlocks', url: 'unit1.html' },
        'unit1_sec4c': { title: 'Unit 1: Inter-Process Communication', url: 'unit1.html' },
        'unit1_sec5': { title: 'Unit 1: Memory Management', url: 'unit1.html' },
        'unit1_sec6': { title: 'Unit 1: File System & Allocation', url: 'unit1.html' },
        'unit1_sec7': { title: 'Unit 1: Disk Scheduling & I/O', url: 'unit1.html' },
        'unit1_sec8': { title: 'Unit 1: Virtualization & Modern Concepts', url: 'unit1.html' },
        'unit1_sec9': { title: 'Unit 1: Linux & Shell Programming', url: 'unit1.html' },
        
        'unit2_sec1': { title: 'Unit 2: Fundamentals of CN', url: 'unit2.html' },
        'unit2_sec2': { title: 'Unit 2: OSI Model', url: 'unit2.html' },
        'unit2_sec3': { title: 'Unit 2: TCP/IP Model', url: 'unit2.html' },
        'unit2_sec4': { title: 'Unit 2: Data Link Layer', url: 'unit2.html' },
        'unit2_sec5': { title: 'Unit 2: Network Layer', url: 'unit2.html' },
        'unit2_sec6': { title: 'Unit 2: Transport Layer', url: 'unit2.html' },
        'unit2_sec7': { title: 'Unit 2: Application Layer', url: 'unit2.html' },
        'unit2_sec8': { title: 'Unit 2: Network Security Basics', url: 'unit2.html' },
        'unit2_sec9': { title: 'Unit 2: Important Numericals', url: 'unit2.html' },
        
        'unit3_sec1': { title: 'Unit 3: Basics of DBMS', url: 'unit3.html' },
        'unit3_sec2': { title: 'Unit 3: ER Model', url: 'unit3.html' },
        'unit3_sec3': { title: 'Unit 3: Relational Model & Keys', url: 'unit3.html' },
        'unit3_sec4': { title: 'Unit 3: Functional Dependency', url: 'unit3.html' },
        'unit3_sec5': { title: 'Unit 3: Normalization', url: 'unit3.html' },
        'unit3_sec6': { title: 'Unit 3: SQL Deep Dive', url: 'unit3.html' },
        'unit3_sec7': { title: 'Unit 3: Transactions & ACID', url: 'unit3.html' },
        'unit3_sec8': { title: 'Unit 3: Locks & Deadlock Prevention', url: 'unit3.html' },
        'unit3_sec9': { title: 'Unit 3: Indexing & B+ Trees', url: 'unit3.html' },
        'unit3_sec10': { title: 'Unit 3: Transaction States', url: 'unit3.html' },

        'unit4_sec1': { title: 'Unit 4: Storage Classes & Scope', url: 'unit4.html' },
        'unit4_sec2': { title: 'Unit 4: Pointers & Memory', url: 'unit4.html' },
        'unit4_sec3': { title: 'Unit 4: Parameter Passing', url: 'unit4.html' },
        'unit4_sec4': { title: 'Unit 4: OOP Mastery', url: 'unit4.html' },
        'unit4_sec5': { title: 'Unit 4: Exception Handling', url: 'unit4.html' },
        'unit4_sec6': { title: 'Unit 4: Generic Programming', url: 'unit4.html' },

        'unit5_sec1': { title: 'Unit 5: Arrays & Static Logic', url: 'unit5.html' },
        'unit5_sec2': { title: 'Unit 5: Linked Lists', url: 'unit5.html' },
        'unit5_sec3': { title: 'Unit 5: Stacks & Queues', url: 'unit5.html' },
        'unit5_sec4': { title: 'Unit 5: Trees & Hierarchical DS', url: 'unit5.html' },
        'unit5_sec5': { title: 'Unit 5: Graphs & Hashing', url: 'unit5.html' },

        'unit6_sec1': { title: 'Unit 6: Asymptotic Analysis', url: 'unit6.html' },
        'unit6_sec2': { title: 'Unit 6: Sorting & Divide & Conquer', url: 'unit6.html' },
        'unit6_sec3': { title: 'Unit 6: Greedy vs Dynamic Programming', url: 'unit6.html' },
        'unit6_sec4': { title: 'Unit 6: Backtracking', url: 'unit6.html' },
        'unit6_sec5': { title: 'Unit 6: String Matching', url: 'unit6.html' },
        'unit6_sec6': { title: 'Unit 6: Complexity Theory', url: 'unit6.html' }
    };

    listContainer.innerHTML = bookmarks.map(id => {
        const item = topicMap[id] || { title: id, url: '#' };
        return `
            <div class="glossary-item flex-between" style="border-bottom: 1px solid var(--border); padding: 0.75rem 0;">
                <a href="${item.url}" style="text-decoration: none; color: var(--text-main); font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-bookmark color-primary"></i> ${item.title}
                </a>
                <button class="btn btn-sm" style="padding: 0.25rem 0.5rem; background: transparent; color: var(--danger); border: none; cursor: pointer;" onclick="toggleBookmark('${id}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }).join('');
}

// Progress Tracking System
function initProgress() {
    let progress = JSON.parse(localStorage.getItem('placementor_progress')) || {};
    const units = ['unit1', 'unit2', 'unit3', 'unit4', 'unit5', 'unit6'];
    
    units.forEach(u => {
        if (!progress[u]) {
            progress[u] = { completed: false, readSections: [] };
        } else if (!progress[u].readSections) {
            progress[u].readSections = [];
        }
    });
    
    localStorage.setItem('placementor_progress', JSON.stringify(progress));
    updateProgressBar();
    initMarkReadButtons();
}

function initMarkReadButtons() {
    const currentUnitId = getCurrentUnitId();
    if (!currentUnitId) return;

    let progress = JSON.parse(localStorage.getItem('placementor_progress'));
    const readSections = progress[currentUnitId]?.readSections || [];

    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        const idx = parseInt(btn.getAttribute('data-section-idx'));
        if (readSections.includes(idx)) {
            btn.classList.add('completed');
            btn.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
        }
    });
}

function getCurrentUnitId() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const match = path.match(/unit(\d)\.html/);
    return match ? `unit${match[1]}` : null;
}

function markSectionRead(unitId, sectionIdx, btnElement) {
    let progress = JSON.parse(localStorage.getItem('placementor_progress'));
    if (!progress[unitId]) progress[unitId] = { completed: false, readSections: [] };
    if (!progress[unitId].readSections) progress[unitId].readSections = [];

    const readArr = progress[unitId].readSections;
    const idx = readArr.indexOf(sectionIdx);

    if (idx > -1) {
        readArr.splice(idx, 1);
        btnElement.classList.remove('completed');
        btnElement.innerHTML = '<i class="far fa-check-circle"></i> Mark as Read';
    } else {
        readArr.push(sectionIdx);
        btnElement.classList.add('completed');
        btnElement.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
    }

    localStorage.setItem('placementor_progress', JSON.stringify(progress));
    updateProgressBar();
}

function updateProgressBar() {
    let progress = JSON.parse(localStorage.getItem('placementor_progress'));
    if (!progress) return;
    
    const currentUnitId = getCurrentUnitId();
    const isDashboard = !currentUnitId;

    const unitSectionCounts = {
        'unit1': 11, // 1 to 9 + 4b + 4c
        'unit2': 9,  // 1 to 9
        'unit3': 10, // 1 to 10
        'unit4': 6,  // 1 to 6
        'unit5': 5,  // 1 to 5
        'unit6': 6   // 1 to 6
    };

    if (isDashboard) {
        // Calculate overall average progress across all 6 units
        let totalPercent = 0;
        Object.keys(unitSectionCounts).forEach(u => {
            const uData = progress[u] || { completed: false, readSections: [] };
            const maxSec = unitSectionCounts[u];
            const readCount = uData.readSections ? uData.readSections.length : 0;
            const readPercentage = Math.min((readCount / maxSec) * 80, 80);
            const quizPercentage = uData.completed ? 20 : 0;
            totalPercent += (readPercentage + quizPercentage);
        });
        
        const percentage = Math.round(totalPercent / 6);
        
        const bars = document.querySelectorAll('.progress-bar');
        bars.forEach(bar => {
            bar.style.width = `${percentage}%`;
            if (percentage > 80) bar.style.background = 'var(--success)';
            else if (percentage > 40) bar.style.background = 'linear-gradient(90deg, var(--primary), var(--purple))';
            else bar.style.background = 'var(--primary)';
        });
        
        const textElements = document.querySelectorAll('.progress-text');
        textElements.forEach(text => {
            text.innerText = `${percentage}% Complete`;
        });
    } else {
        // Calculate specific unit progress
        const uData = progress[currentUnitId] || { completed: false, readSections: [] };
        const maxSec = unitSectionCounts[currentUnitId] || 5;
        const readCount = uData.readSections ? uData.readSections.length : 0;
        const readPercentage = (readCount / maxSec) * 80;
        const quizPercentage = uData.completed ? 20 : 0;
        const percentage = Math.round(readPercentage + quizPercentage);

        const bars = document.querySelectorAll('.progress-bar');
        bars.forEach(bar => {
            bar.style.width = `${percentage}%`;
            if (percentage > 80) bar.style.background = 'var(--success)';
            else if (percentage > 40) bar.style.background = 'linear-gradient(90deg, var(--primary), var(--purple))';
            else bar.style.background = 'var(--primary)';
        });
        
        const textElements = document.querySelectorAll('.progress-text');
        textElements.forEach(text => {
            text.innerText = `${percentage}% Complete`;
        });
    }
}

function markUnitComplete(unitId) {
    let progress = JSON.parse(localStorage.getItem('placementor_progress'));
    if (progress[unitId]) {
        progress[unitId].completed = true;
        localStorage.setItem('placementor_progress', JSON.stringify(progress));
        updateProgressBar();
    }
}

// Collapsible Sections
function initCollapsibles() {
    const headers = document.querySelectorAll('.collapsible-header');
    
    headers.forEach(header => {
        const content = header.nextElementSibling;
        if (header.classList.contains('active') || content.classList.contains('active')) {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });

    headers.forEach(header => {
        header.addEventListener('click', (e) => {
            // Prevent collapsing if clicking action buttons inside the header
            if (e.target.closest('button') || e.target.closest('a')) {
                return;
            }

            const content = header.nextElementSibling;
            const icon = header.querySelector('.chevron-icon');
            
            header.classList.toggle('active');
            content.classList.toggle('active');
            
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

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
    
    const themeBtn = document.querySelector('#theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeUI(newTheme);
        });
    }
}

function updateThemeUI(theme) {
    const themeBtn = document.querySelector('#theme-toggle');
    if (themeBtn) {
        const icon = themeBtn.querySelector('i');
        const text = themeBtn.querySelector('span');
        if (theme === 'dark') {
            if (icon) {
                icon.className = 'fas fa-sun';
                icon.style.color = '#eab308';
            }
            if (text) text.innerText = 'Light Mode';
        } else {
            if (icon) {
                icon.className = 'fas fa-moon';
                icon.style.color = '';
            }
            if (text) text.innerText = 'Dark Mode';
        }
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

// Auto-wrap tables
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

// Quiz System Utility
function handleQuiz(unitId, questions) {
    const quizContainer = document.querySelector(`#quiz-${unitId}`);
    if (!quizContainer) return;

    let html = `
        <div class="glass-card mt-4" style="border-top: 4px solid var(--purple);">
            <h2><i class="fas fa-question-circle"></i> Unit Practice Quiz</h2>
            <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.5rem;">Score at least 50% to complete this unit and gain 20% progress.</p>
    `;
    
    questions.forEach((q, index) => {
        html += `
            <div class="quiz-question glass-card" style="margin-bottom: 1rem; padding: 1.5rem; background: var(--bg-main);">
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

    html += `
            <button class="btn btn-primary" onclick="submitQuiz('${unitId}', ${JSON.stringify(questions).replace(/"/g, '&quot;')})">Submit Quiz</button>
            <div id="quiz-result-${unitId}" class="mt-4"></div>
        </div>
    `;
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
    const passed = score >= questions.length / 2;
    if (resultArea) {
        resultArea.innerHTML = `
            <div class="glass-card" style="border-color: ${passed ? 'var(--success)' : 'var(--danger)'}; background: ${passed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; margin-top: 1rem;">
                <h3>Quiz Results</h3>
                <p>Your Score: <strong>${score} / ${questions.length}</strong></p>
                <p>${passed ? '🎉 Great job! You passed the quiz and unlocked unit mastery.' : '❌ Keep studying and try again.'}</p>
            </div>
        `;
    }

    if (passed) {
        markUnitComplete(unitId);
    }
};

// ==========================================
// PLACE MENTOR AI TUTOR FLOATING WIDGET
// ==========================================

const offlineResponses = {
    "osi": `
        <h4>OSI Reference Model</h4>
        <p>A conceptual framework developed by ISO containing 7 layers:</p>
        <ul>
            <li><strong>7. Application:</strong> Interface for users (HTTP, DNS, FTP).</li>
            <li><strong>6. Presentation:</strong> Encryption, compression, syntax (SSL, JPEG).</li>
            <li><strong>5. Session:</strong> Connection session control (NetBIOS).</li>
            <li><strong>4. Transport:</strong> End-to-end reliability (TCP/UDP, Port numbers).</li>
            <li><strong>3. Network:</strong> Logical routing (IP, Router, OSPF/RIP).</li>
            <li><strong>2. Data Link:</strong> Physical framing & MAC checks (Switch, Bridge).</li>
            <li><strong>1. Physical:</strong> Bit transmission over copper/fiber (Hub, Repeater).</li>
        </ul>
    `,
    "acid": `
        <h4>ACID Properties in DBMS</h4>
        <p>Critical requirements for database transactions:</p>
        <ul>
            <li><strong>Atomicity:</strong> All operations succeed or all roll back (all-or-nothing).</li>
            <li><strong>Consistency:</strong> The DB transitions from one valid state to another.</li>
            <li><strong>Isolation:</strong> Concurrent transactions execute independently.</li>
            <li><strong>Durability:</strong> Updates survive system failures once committed.</li>
        </ul>
    `,
    "pointer": `
        <h4>Pointers & Memory Control</h4>
        <p>A pointer stores the memory address of another variable.</p>
        <ul>
            <li><strong>Null Pointer:</strong> Points to memory 0x0. Safe placeholder.</li>
            <li><strong>Void Pointer:</strong> Generic address pointer. Needs typecasting.</li>
            <li><strong>Wild Pointer:</strong> Uninitialized address. Dangerous.</li>
            <li><strong>Dangling Pointer:</strong> Points to memory that has been deallocated.</li>
        </ul>
    `,
    "dijkstra": `
        <h4>Dijkstra's Algorithm</h4>
        <p>Single-source shortest path algorithm for graphs with non-negative edge weights.</p>
        <ul>
            <li><strong>Complexity:</strong> O((V + E) log V) with Min-Heap.</li>
            <li><strong>Greedy Choice:</strong> Always expands the node with minimum distance value.</li>
            <li><strong>Note:</strong> Fails on negative edge cycles (use Bellman-Ford instead).</li>
        </ul>
    `,
    "complexity": `
        <h4>Asymptotic Notations</h4>
        <ul>
            <li><strong>Big-O (O):</strong> Upper bound (Worst Case).</li>
            <li><strong>Omega (Ω):</strong> Lower bound (Best Case).</li>
            <li><strong>Theta (Θ):</strong> Tight bound (Average Case).</li>
        </ul>
        <p><strong>Master Theorem:</strong> Formula T(n) = aT(n/b) + f(n) resolves recursion complexities instantly.</p>
    `,
    "process": `
        <h4>Process vs Thread</h4>
        <ul>
            <li><strong>Process:</strong> Active instance of execution. Has private memory space (Heap, Stack, Data). Heavyweight.</li>
            <li><strong>Thread:</strong> Lightweight execution unit. Shares code and data segments with siblings, but has private Stack and Program Counter.</li>
        </ul>
    `,
    "deadlock": `
        <h4>Deadlocks & Coffman Conditions</h4>
        <p>Occurs when processes wait circularly for locked resources. Four mandatory conditions:</p>
        <ol>
            <li><strong>Mutual Exclusion:</strong> Non-shareable resource.</li>
            <li><strong>Hold & Wait:</strong> Holds a resource while requesting another.</li>
            <li><strong>No Preemption:</strong> Resource cannot be forcibly taken.</li>
            <li><strong>Circular Wait:</strong> P1 waits for P2 which waits for P1.</li>
        </ol>
        <p>Avoided using the **Banker's Algorithm** (safe state calculation).</p>
    `
};

function injectAITutor() {
    // Check if launcher already exists
    if (document.querySelector('.ai-tutor-launcher')) return;

    // Create Launcher Button
    const launcher = document.createElement('div');
    launcher.className = 'ai-tutor-launcher';
    launcher.innerHTML = '<i class="fas fa-graduation-cap"></i>';
    launcher.title = "Ask PlaceMentor AI";
    document.body.appendChild(launcher);

    // Create AI Window
    const windowDiv = document.createElement('div');
    windowDiv.className = 'ai-tutor-window';
    windowDiv.innerHTML = `
        <div class="ai-tutor-header">
            <div class="ai-tutor-title">
                <i class="fas fa-brain"></i>
                <span>PlaceMentor AI Tutor</span>
            </div>
            <button class="ai-tutor-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="ai-tutor-messages">
            <div class="ai-message system">
                Hi! I am your AI Placement Tutor. Ask me any technical interview question!
            </div>
        </div>
        <div class="ai-tutor-chips">
            <div class="ai-chip" data-query="Explain OSI Layers">OSI Layers</div>
            <div class="ai-chip" data-query="What is ACID?">ACID Properties</div>
            <div class="ai-chip" data-query="Types of Pointers">Pointer Types</div>
            <div class="ai-chip" data-query="Dijkstra's complexity?">Dijkstra's Algo</div>
            <div class="ai-chip" data-query="What is a Deadlock?">Deadlocks</div>
        </div>
        <div class="ai-tutor-input-area">
            <input type="text" class="ai-tutor-input" placeholder="Type a concept or ask a query...">
            <button class="ai-tutor-send"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;
    document.body.appendChild(windowDiv);

    // Set up Events
    launcher.addEventListener('click', () => {
        windowDiv.classList.add('active');
        launcher.style.display = 'none';
    });

    const closeBtn = windowDiv.querySelector('.ai-tutor-close');
    closeBtn.addEventListener('click', () => {
        windowDiv.classList.remove('active');
        launcher.style.display = 'flex';
    });

    const input = windowDiv.querySelector('.ai-tutor-input');
    const sendBtn = windowDiv.querySelector('.ai-tutor-send');

    const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;
        addUserMessage(text);
        input.value = "";
        processAIResponse(text);
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    windowDiv.querySelectorAll('.ai-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            addUserMessage(query);
            processAIResponse(query);
        });
    });
}

function addUserMessage(text) {
    const msgContainer = document.querySelector('.ai-tutor-messages');
    if (!msgContainer) return;
    
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message user';
    userMsg.innerText = text;
    msgContainer.appendChild(userMsg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

function addAssistantMessage(htmlContent) {
    const msgContainer = document.querySelector('.ai-tutor-messages');
    if (!msgContainer) return;
    
    const botMsg = document.createElement('div');
    botMsg.className = 'ai-message assistant';
    botMsg.innerHTML = htmlContent;
    msgContainer.appendChild(botMsg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

function addSystemMessage(text) {
    const msgContainer = document.querySelector('.ai-tutor-messages');
    if (!msgContainer) return;
    
    const sysMsg = document.createElement('div');
    sysMsg.className = 'ai-message system';
    sysMsg.innerText = text;
    msgContainer.appendChild(sysMsg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

function showTypingIndicator() {
    const msgContainer = document.querySelector('.ai-tutor-messages');
    if (!msgContainer) return null;

    const indicator = document.createElement('div');
    indicator.className = 'ai-message assistant typing-indicator';
    indicator.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    msgContainer.appendChild(indicator);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    return indicator;
}

async function processAIResponse(query) {
    const indicator = showTypingIndicator();
    
    // Check if live API Key is defined
    if (GEMINI_API_KEY && GEMINI_API_KEY !== "") {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: query
                        }]
                    }],
                    systemInstruction: {
                        parts: [{
                            text: "You are PlaceMentor AI, an expert Computer Science placement tutor. Keep your explanations detailed, placement-focused, structured with clear HTML formatting (like strong, p, ul, li tags), and encouraging."
                        }]
                    }
                })
            });

            const data = await response.json();
            if (indicator) indicator.remove();
            
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
                // Convert simple Markdown back to basic HTML tags if necessary
                let formattedText = rawText
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`([^`]+)`/g, '<code>$1</code>');
                addAssistantMessage(formattedText);
            } else {
                addAssistantMessage("Sorry, I could not generate a response. Please check your Gemini API key.");
            }
        } catch (e) {
            console.error(e);
            if (indicator) indicator.remove();
            addAssistantMessage("Connection error while calling Gemini API. Falling back to offline dictionary.");
            fallbackResponse(query);
        }
    } else {
        // Fallback to offline rule-based dictionary
        setTimeout(() => {
            if (indicator) indicator.remove();
            fallbackResponse(query);
        }, 800);
    }
}

function fallbackResponse(query) {
    const q = query.toLowerCase();
    let found = false;

    for (const key in offlineResponses) {
        if (q.includes(key)) {
            addAssistantMessage(offlineResponses[key]);
            found = true;
            break;
        }
    }

    if (!found) {
        addAssistantMessage(`
            <h4>Offline Mode</h4>
            <p>I am currently running in Offline mode (no Gemini API Key provided). I couldn't find a direct match for your question.</p>
            <p><strong>Try asking about:</strong> OSI, ACID, Pointer, Dijkstra, Complexity, Process, or Deadlock.</p>
        `);
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCollapsibles();
    initProgress();
    updateNavigation();
    initSearch();
    wrapTables();
    initBookmarks();
    injectAITutor();
});
