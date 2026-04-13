// Define global navigation function early so it's always available to HTML onclick events
window.navStep = (direction) => {
    // We'll handle the actual logic once DOM is ready, but defined here to avoid 'undefined' errors
    if (window.handleNavStep) {
        window.handleNavStep(direction);
    } else {
        console.warn("Navigation handler not yet initialized");
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Hide Splash Screen after loading
    const splash = document.getElementById('splashScreen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('hidden');
        }, 1500);
    }

    // Register Service Worker for PWA (Android Experience)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('Service Worker Registered'))
                .catch(err => console.log('Service Worker Selection Failed', err));
        });
    }
    // State
    let currentStep = 1;
    let riskRadarChart = null;
    let historyChart = null;
    let trendChart = null;
    let currentUser = JSON.parse(localStorage.getItem('cardioai_user')) || null;
    if (currentUser) {
        document.getElementById('loginOverlay').classList.remove('active');
    }

    const form = document.getElementById('assessmentForm');
    const loader = document.getElementById('loader');
    const emptyState = document.getElementById('emptyState');
    const resultsView = document.getElementById('resultsView');
    
    // Smart API base: works in browser dev mode (via vite proxy) AND in Android Capacitor
    const isCapacitor = window.Capacitor !== undefined;
    const API_BASE = isCapacitor 
        ? (window.CARDIOAI_BACKEND || 'http://10.88.56.54')  // Android emulator -> host machine
        : '';  // Browser: use Vite proxy (paths relative to domain)

    // --- Core Navigation Handler ---
    window.handleNavStep = (direction) => {
        const nextStep = currentStep + direction;
        if (nextStep < 1 || nextStep > 3) return;

        const currentStepEl = document.getElementById(`step${currentStep}`);
        const nextStepEl = document.getElementById(`step${nextStep}`);

        if (!currentStepEl || !nextStepEl) {
            console.error("Step elements not found", { currentStep, nextStep });
            return;
        }

        currentStepEl.classList.remove('active');
        nextStepEl.classList.add('active');

        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === nextStep - 1);
        });

        currentStep = nextStep;
        const counter = document.getElementById('stepCounter');
        if (counter) counter.innerText = `Step ${currentStep} of 3`;

        // Scroll to top of card on step change
        const card = document.querySelector('.assessment-card');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- Initialization ---
    function init() {
        try {
            if (currentUser) {
                const profileName = document.querySelector('.profile strong');
                if (profileName) profileName.innerText = currentUser.full_name;

                const prefInput = document.getElementById('prefName');
                if (prefInput) prefInput.value = currentUser.full_name;
                
                const profileCreds = document.getElementById('profileCreds');
                if (profileCreds) profileCreds.innerText = `Username: ${currentUser.username} | Phone: ${currentUser.phone || 'N/A'}`;
            }

            loadAnalytics();
            loadLabs();
            setupUploadHandler();
            setupAuthHandlers();
        } catch (e) {
            console.error("Initialization error:", e);
        }
    }

    function setupAuthHandlers() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const logoutBtn = document.getElementById('logoutBtn');
        const loginOverlay = document.getElementById('loginOverlay');
        const showSignup = document.getElementById('showSignup');
        const showLogin = document.getElementById('showLogin');
        const loginSubtitle = document.getElementById('loginSubtitle');

        if (showSignup) {
            showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
                loginSubtitle.innerText = 'Join our health community';
            });
        }

        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                signupForm.style.display = 'none';
                loginForm.style.display = 'block';
                loginSubtitle.innerText = 'Your Personal Health Companion';
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('loginUsername').value;
                const password = document.getElementById('loginPassword').value;

                try {
                    const res = await fetch(`${API_BASE}/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });

                    if (!res.ok) throw new Error("Invalid username or password");
                    const data = await res.json();
                    
                    currentUser = data.user;
                    localStorage.setItem('cardioai_user', JSON.stringify(currentUser));
                    
                    loginOverlay.classList.remove('active');
                    const profileName = document.getElementById('headerProfileName');
                    if (profileName) profileName.innerText = currentUser.full_name;
                    
                    const prefInput = document.getElementById('prefName');
                    if (prefInput) prefInput.value = currentUser.full_name;

                    init();
                } catch (err) {
                    alert(err.message);
                }
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const full_name = document.getElementById('signupFullName').value;
                const username = document.getElementById('signupUsername').value;
                const phone = document.getElementById('signupPhone').value;
                const password = document.getElementById('signupPassword').value;

                try {
                    const res = await fetch(`${API_BASE}/signup`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ full_name, username, phone, password })
                    });

                    if (!res.ok) {
                        const errData = await res.json();
                        let errorMsg = "Signup failed";
                        if (typeof errData.detail === "string") {
                            errorMsg = errData.detail;
                        } else if (Array.isArray(errData.detail)) {
                            errorMsg = errData.detail.map(d => d.msg).join(", ");
                        } else if (errData.detail) {
                            errorMsg = JSON.stringify(errData.detail);
                        }
                        throw new Error(errorMsg);
                    }
                    const data = await res.json();
                    
                    currentUser = data.user;
                    localStorage.setItem('cardioai_user', JSON.stringify(currentUser));
                    
                    loginOverlay.classList.remove('active');
                    const profileName = document.getElementById('headerProfileName');
                    if (profileName) profileName.innerText = currentUser.full_name;
                    
                    init();
                    alert("Account created successfully!");
                } catch (err) {
                    alert(err.message);
                }
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('cardioai_user');
                currentUser = null;
                loginOverlay.classList.add('active');
                if (loginForm) loginForm.reset();
                if (signupForm) signupForm.reset();
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
            });
        }
    }

    init();

    // --- Report Upload Handler ---
    function setupUploadHandler() {
        const fileInput = document.getElementById('reportFile');
        const uploadZone = document.getElementById('uploadZone');

        if (!fileInput || !uploadZone) return;

        fileInput.addEventListener('change', async (e) => {
            if (e.target.files.length === 0) return;

            const file = e.target.files[0];
            uploadZone.classList.add('processing');
            const statusText = uploadZone.querySelector('.upload-text span');
            const statusDesc = uploadZone.querySelector('.upload-text p');

            if (statusText) statusText.innerText = "Analyzing Report...";

            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`${API_BASE}/process-report`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error("Report processing failed");
                const result = await response.json();

                const data = result.data;
                Object.keys(data).forEach(key => {
                    const el = document.getElementById(key);
                    if (el) {
                        el.value = data[key];
                        el.style.borderColor = 'var(--primary)';
                        el.style.boxShadow = '0 0 10px var(--primary-glow)';
                        setTimeout(() => {
                            el.style.borderColor = '';
                            el.style.boxShadow = '';
                        }, 3000);
                    }
                });

                if (statusText) statusText.innerText = "Digital Extraction Complete!";
                if (statusDesc) statusDesc.innerText = "Assessment parameters populated.";
                uploadZone.style.borderColor = 'var(--success)';

            } catch (err) {
                console.error(err);
                alert("Extraction Failed: " + err.message);
                if (statusText) statusText.innerText = "Click to Upload Clinical Data";
            } finally {
                uploadZone.classList.remove('processing');
            }
        });
    }

    // Sidebar Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const appViews = document.querySelectorAll('.app-view');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            appViews.forEach(view => {
                view.classList.remove('active');
                if (view.id === `view-${target}`) {
                    view.classList.add('active');
                }
            });

            if (target === 'labs') loadLabs();
            if (target === 'analytics') loadAnalytics();
        });
    });

    // Form Submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (loader) loader.classList.add('active');
            if (emptyState) emptyState.style.display = 'none';
            if (resultsView) resultsView.style.display = 'none';

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                // Parse numbers where necessary
                const numericFields = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak', 'ca', 'thal'];
                data[key] = numericFields.includes(key) ? parseFloat(value) : parseInt(value);
            });

            try {
                const response = await fetch(`${API_BASE}/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!response.ok) throw new Error('Model service error');

                const result = await response.json();
                showResults(result);
                loadAnalytics();
            } catch (err) {
                alert("Diagnostic Failed: " + err.message);
                if (emptyState) emptyState.style.display = 'block';
            } finally {
                if (loader) loader.classList.remove('active');
            }
        });
    }

    function showResults(data) {
        if (!resultsView) return;
        resultsView.style.display = 'block';

        const color = getRiskColor(data.risk_level);
        const fill = document.getElementById('meterFill');
        const badge = document.getElementById('riskBadge');

        if (fill) {
            fill.style.borderColor = color;
            const rotation = data.risk_level === 'High' ? 225 : (data.risk_level === 'Medium' ? 135 : 45);
            fill.style.transform = `rotate(${rotation}deg)`;
        }

        if (badge) {
            badge.innerText = `${data.risk_level} Risk`;
            badge.style.color = color;
            badge.style.borderColor = color;
        }

        const msgEl = document.getElementById('riskMsg');
        if (msgEl) msgEl.innerText = data.analysis.message;

        const confEl = document.getElementById('confVal');
        if (confEl) {
            confEl.innerText = `${data.confidence}%`;
            confEl.style.color = color;
        }

        updateRadarChart(data.factors);

        renderList('clinicalList', data.analysis.clinical);
        renderList('dietaryList', data.analysis.dietary);
        renderList('lifestyleList', data.analysis.lifestyle);

        resultsView.scrollIntoView({ behavior: 'smooth' });
    }

    function updateRadarChart(factors) {
        const canvas = document.getElementById('riskRadarChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const labels = Object.keys(factors);
        const values = Object.values(factors);

        if (riskRadarChart) riskRadarChart.destroy();

        riskRadarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Impact Magnitude',
                    data: values,
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    pointBackgroundColor: '#6366f1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255,255,255,0.1)' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        pointLabels: { color: '#94a3b8', font: { size: 10 } },
                        ticks: { display: false },
                        suggestedMax: 20
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    const labForm = document.getElementById('labForm');
    if (labForm) {
        labForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) return;
            
            const assessmentForm = document.getElementById('assessmentForm');
            const parameters = {};
            if (assessmentForm) {
                const formData = new FormData(assessmentForm);
                const numericFields = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak', 'ca', 'thal'];
                formData.forEach((value, key) => {
                    parameters[key] = (value === '' || value == null) ? null : (numericFields.includes(key) ? parseFloat(value) : parseInt(value));
                });
            }

            const report = {
                username: currentUser.username,
                date: document.getElementById('labDate').value,
                type: document.getElementById('labType').value,
                result: document.getElementById('labResult').value,
                parameters: parameters
            };

            try {
                const res = await fetch(`${API_BASE}/labs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(report)
                });
                if (!res.ok) throw new Error("Save failed");
                labForm.reset();
                loadLabs();
            } catch (err) {
                alert("Failed to add report");
            }
        });
    }

    async function loadLabs() {
        if (!currentUser) return;
        try {
            const res = await fetch(`${API_BASE}/labs?username=${currentUser.username}`);
            if (!res.ok) return;
            const labs = await res.json();
            renderLabs(labs);
        } catch (e) {
            console.error("Labs load failed", e);
        }
    }

    function renderLabs(labs) {
        const listContainer = document.getElementById('labsHistoryList');
        if (!listContainer) return;
        const historyHero = document.querySelector('.history-hero');

        if (!labs || labs.length === 0) {
            if (historyHero) historyHero.style.display = 'none';
            listContainer.innerHTML = `<div class="placeholder-content"><h2>No reports found</h2></div>`;
            return;
        }

        if (historyHero) historyHero.style.display = 'block';
        updateHistoryChart(labs);

        listContainer.innerHTML = `
            <div class="history-list">
                ${labs.map(item => `
                    <div class="history-item">
                        <div class="hist-main">
                            <strong>${item.type}</strong>
                            <span>${item.date}</span>
                        </div>
                        <div class="hist-meta">
                            <span class="value">${item.result}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function updateHistoryChart(labs) {
        const canvas = document.getElementById('historyChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const labels = labs.map(l => l.date);
        const values = labs.map(l => parseFloat(l.result) || 100);

        if (historyChart) historyChart.destroy();
        historyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Clinical Metric Trend',
                    data: values,
                    borderColor: '#14b8a6',
                    fill: true,
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    window.downloadReport = () => {
        const risk = document.getElementById('riskBadge').innerText;
        const conf = document.getElementById('confVal').innerText;
        const msg = document.getElementById('riskMsg').innerText;
        const clinical = Array.from(document.querySelectorAll('#clinicalList li')).map(li => `• ${li.innerText}`).join('\n');
        const dietary = Array.from(document.querySelectorAll('#dietaryList li')).map(li => `• ${li.innerText}`).join('\n');
        const lifestyle = Array.from(document.querySelectorAll('#lifestyleList li')).map(li => `• ${li.innerText}`).join('\n');

        const report = `
=========================================
      CARDIO AI CLINICAL ASSESSMENT      
=========================================
Generated: ${new Date().toLocaleString()}
Status:    Validated AI Insights

RISK ASSESSMENT PROFILE:
-----------------------------------------
LEVEL:      ${risk}
ACCUR:      ${conf} Confidence
SUMMARY:    ${msg}

CLINICAL RECOMMENDATIONS:
-----------------------------------------
${clinical || "Continue standard preventative care."}

DIETARY GUIDELINES:
-----------------------------------------
${dietary || "Maintain heart-healthy diet."}

LIFESTYLE MODIFICATIONS:
-----------------------------------------
${lifestyle || "Follow standard physical activity guidelines."}

=========================================
DISCLAIMER: This diagnostic insight is 
provided for educational reference only.
=========================================`;

        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CardioAI_Report_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    async function loadAnalytics() {
        try {
            const res = await fetch(`${API_BASE}/analytics`);
            if (!res.ok) return;
            const data = await res.json();
            const stats = document.querySelector('.mock-stats');
            if (stats) {
                stats.innerHTML = `
                    <div class="stat-card"><span>Accuracy</span><strong>${data.accuracy}%</strong></div>
                    <div class="stat-card"><span>Assessments</span><strong>${data.total_assessments}</strong></div>
                    <div class="stat-card"><span>Avg. Confidence</span><strong>${data.avg_confidence}%</strong></div>
                `;
            }
            renderTrendChart(data.recent_trends || []);
        } catch (e) { }
    }

    function renderTrendChart(trends) {
        const canvas = document.getElementById('populationTrendChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (trendChart) trendChart.destroy();

        const displayTrends = trends.length > 0 ? trends : [
            { date: '2025-12-01', score: 85 },
            { date: '2025-12-15', score: 88 },
            { date: '2026-01-01', score: 92 }
        ];

        trendChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: displayTrends.map(t => t.date),
                datasets: [{
                    label: 'System Accuracy Trend (%)',
                    data: displayTrends.map(t => t.score),
                    backgroundColor: 'rgba(99, 102, 241, 0.5)',
                    borderColor: '#6366f1',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    document.querySelectorAll('.toggle').forEach(t => {
        t.addEventListener('click', () => t.classList.toggle('active'));
    });

    window.saveSettings = async () => {
        const profile = {
            username: currentUser.username,
            full_name: document.getElementById('prefName').value,
            settings: {
                darkMode: document.getElementById('toggleDarkMode')?.classList.contains('active'),
                alerts: document.getElementById('toggleAlerts')?.classList.contains('active')
            }
        };

        try {
            const res = await fetch(`${API_BASE}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            if (!res.ok) throw new Error("Save error");
            currentUser.full_name = profile.full_name;
            const profileStrong = document.querySelector('.profile strong');
            if (profileStrong) profileStrong.innerText = currentUser.full_name;
            alert("Preferences Saved");
        } catch (e) {
            alert("Failed to save settings");
        }
    };

    function renderList(id, items) {
        const ul = document.getElementById(id);
        if (ul) ul.innerHTML = items.map(t => `<li>${t}</li>`).join('');
    }

    function getRiskColor(level) {
        if (level === 'High') return '#f43f5e';
        if (level === 'Medium') return '#f59e0b';
        return '#6366f1';
    }

    window.toggleChat = () => {
        document.getElementById('aiAssistant')?.classList.toggle('active');
    };

    window.sendMessage = async () => {
        const input = document.getElementById('chatInput');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        
        addMessage(text, 'user');
        input.value = '';

        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            
            if (!response.ok) throw new Error("Chat service unavailable");
            const data = await response.json();
            
            setTimeout(() => addMessage(data.reply, 'bot'), 400);
        } catch (err) {
            setTimeout(() => addMessage("I'm having trouble connecting to my clinical knowledge base. Please try again in a moment.", 'bot'), 400);
        }
    };

    function addMessage(text, type) {
        const chat = document.getElementById('chatMessages');
        if (!chat) return;
        const div = document.createElement('div');
        div.className = `msg ${type}`;
        
        if (type === 'bot') {
            // Render rich formatting for bot messages
            let html = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
                .replace(/\n\n/g, '<br><br>')  // paragraph breaks
                .replace(/\n/g, '<br>')         // line breaks
                .replace(/• /g, '&bull; ');     // bullets
            div.innerHTML = html;
        } else {
            div.innerText = text;
        }
        
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }
});
