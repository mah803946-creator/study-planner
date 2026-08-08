document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Switcher ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const settingsThemeBtn = document.getElementById('settings-theme-btn');
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    
    htmlElement.setAttribute('data-theme', savedTheme);
    
    function updateThemeUI(theme) {
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        }
    }
    updateThemeUI(savedTheme);

    function toggleThemeHandler() {
        const current = htmlElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', next);
        localStorage.setItem('appTheme', next);
        updateThemeUI(next);
    }

    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleThemeHandler);
    if (settingsThemeBtn) settingsThemeBtn.addEventListener('click', toggleThemeHandler);

    // --- Sound Effects Toggle Setting ---
    const soundToggleSetting = document.getElementById('sound-toggle-setting');
    if (soundToggleSetting) {
        soundToggleSetting.checked = localStorage.getItem('soundEnabled') !== 'false';
        soundToggleSetting.addEventListener('change', () => {
            localStorage.setItem('soundEnabled', soundToggleSetting.checked);
        });
    }

    // --- XP & Leveling System ---
    let userXP = parseInt(localStorage.getItem('userXP')) || 0;
    let userLevel = parseInt(localStorage.getItem('userLevel')) || 1;

    function addXP(amount) {
        userXP += amount;
        if (userXP >= userLevel * 100) {
            userXP -= userLevel * 100;
            userLevel++;
            alert(`🎉 Level Up! You reached Level ${userLevel}! Keep up the great studying!`);
        }
        localStorage.setItem('userXP', userXP);
        localStorage.setItem('userLevel', userLevel);
        updateXPDisplay();
    }

    function updateXPDisplay() {
        const xpSpan = document.getElementById('user-xp');
        const lvlSpan = document.getElementById('user-level');
        const setXp = document.getElementById('settings-xp');
        const setLvl = document.getElementById('settings-level');

        if (xpSpan) xpSpan.textContent = userXP;
        if (lvlSpan) lvlSpan.textContent = userLevel;
        if (setXp) setXp.textContent = userXP;
        if (setLvl) setLvl.textContent = userLevel;
    }
    updateXPDisplay();

    // --- Settings Action Handlers ---
    const resetProgressBtn = document.getElementById('reset-progress-btn');
    if (resetProgressBtn) {
        resetProgressBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset your Level and XP back to Level 1?')) {
                localStorage.setItem('userXP', '0');
                localStorage.setItem('userLevel', '1');
                userXP = 0;
                userLevel = 1;
                updateXPDisplay();
                alert('Progression has been reset.');
            }
        });
    }

    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            try {
                const data = {
                    tasks: localStorage.getItem('studyPlannerTasks'),
                    plans: localStorage.getItem('studyCalendarPlans'),
                    xp: localStorage.getItem('userXP'),
                    level: localStorage.getItem('userLevel')
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'study-planner-backup.json';
                a.click();
                URL.revokeObjectURL(url);
            } catch (err) {
                alert('Could not export backup data.');
            }
        });
    }

    const clearAllDataBtn = document.getElementById('clear-all-data-btn');
    if (clearAllDataBtn) {
        clearAllDataBtn.addEventListener('click', () => {
            if (confirm('WARNING: This will delete all tasks, calendar plans, and XP. Are you sure?')) {
                localStorage.clear();
                location.reload();
            }
        });
    }

    // --- Virtual Study Garden Logic ---
    const plantEmoji = document.getElementById('plant-stage-emoji');
    const plantStatusText = document.getElementById('plant-status-text');
    const plantProgressFill = document.getElementById('plant-progress-fill');

    function updatePlantGrowth(progressPercent) {
        if (!plantEmoji) return;
        if (progressPercent < 25) {
            plantEmoji.textContent = '🌱';
            plantStatusText.textContent = 'Just planted! Focus to help it grow.';
        } else if (progressPercent < 50) {
            plantEmoji.textContent = '🌿';
            plantStatusText.textContent = 'Sprouting nicely! Keep going.';
        } else if (progressPercent < 99) {
            plantEmoji.textContent = '🌷';
            plantStatusText.textContent = 'Almost fully bloomed!';
        } else {
            plantEmoji.textContent = '🌻';
            plantStatusText.textContent = 'Full bloom! Wonderful focus session!';
        }
        if (plantProgressFill) plantProgressFill.style.width = `${progressPercent}%`;
    }

    // --- Timer & Pomodoro Logic ---
    const timerDisplay = document.getElementById('timer');
    const startBtn = document.querySelector('.timer-btn.start');
    const pauseBtn = document.querySelector('.timer-btn.pause');
    const resetBtn = document.querySelector('.timer-btn.reset');
    const tabBtns = document.querySelectorAll('.tab-btn');

    let focusTime = parseInt(localStorage.getItem('customFocusTime')) || 25;
    let breakTime = parseInt(localStorage.getItem('customBreakTime')) || 5;
    let totalFocusSeconds = focusTime * 60;
    let currentTime = totalFocusSeconds;
    let timerId = null;
    let currentMode = 'focus';
    let targetTimestamp = null;

    function playBeep() {
        if (localStorage.getItem('soundEnabled') === 'false') return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
        } catch(e) {}
    }

    function updateTimerDisplay() {
        const m = Math.floor(currentTime / 60);
        const s = currentTime % 60;
        if (timerDisplay) {
            timerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            document.title = `(${timerDisplay.textContent}) Study Garden`;
        }
        if (currentMode === 'focus') {
            const elapsed = totalFocusSeconds - currentTime;
            const percent = Math.min(100, Math.round((elapsed / totalFocusSeconds) * 100));
            updatePlantGrowth(percent);
        }
    }

    function switchMode(mode, btnElement) {
        if (timerId !== null) { clearInterval(timerId); timerId = null; }
        targetTimestamp = null;
        currentMode = mode;
        if (tabBtns.length > 0) {
            tabBtns.forEach(b => b.classList.remove('active'));
            if (btnElement) btnElement.classList.add('active');
        }
        if (mode === 'focus') {
            focusTime = parseInt(localStorage.getItem('customFocusTime')) || 25;
            totalFocusSeconds = focusTime * 60;
            currentTime = totalFocusSeconds;
        } else if (mode === 'short') {
            breakTime = parseInt(localStorage.getItem('customBreakTime')) || 5;
            currentTime = breakTime * 60;
        } else {
            currentTime = 15 * 60;
        }
        updateTimerDisplay();
    }

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const t = btn.textContent.trim().toLowerCase();
                if (t.includes('focus')) switchMode('focus', btn);
                else if (t.includes('short')) switchMode('short', btn);
                else if (t.includes('long')) switchMode('long', btn);
            });
        });
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (timerId !== null) return;
            targetTimestamp = Date.now() + (currentTime * 1000);
            timerId = setInterval(() => {
                currentTime = Math.max(0, Math.ceil((targetTimestamp - Date.now()) / 1000));
                updateTimerDisplay();
                if (currentTime <= 0) {
                    clearInterval(timerId);
                    timerId = null;
                    playBeep();
                    if (currentMode === 'focus') {
                        addXP(50);
                        alert('Focus session complete! +50 XP and your plant fully bloomed.');
                        switchMode('short', tabBtns[1]);
                    } else {
                        alert('Break over! Time to grow another plant.');
                        switchMode('focus', tabBtns[0]);
                    }
                }
            }, 200);
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (timerId !== null) {
                clearInterval(timerId);
                timerId = null;
                if (targetTimestamp) currentTime = Math.max(0, Math.ceil((targetTimestamp - Date.now()) / 1000));
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (timerId !== null) { clearInterval(timerId); timerId = null; }
            currentTime = currentMode === 'focus' ? totalFocusSeconds : (currentMode === 'short' ? breakTime * 60 : 900);
            updateTimerDisplay();
        });
    }

    const customFocusInput = document.getElementById('custom-focus-input');
    const customBreakInput = document.getElementById('custom-break-input');
    const saveTimeBtn = document.getElementById('save-time-btn');

    if (saveTimeBtn && customFocusInput && customBreakInput) {
        saveTimeBtn.addEventListener('click', () => {
            const nf = parseInt(customFocusInput.value);
            const nb = parseInt(customBreakInput.value);
            if (nf > 0) { focusTime = nf; localStorage.setItem('customFocusTime', nf); }
            if (nb > 0) { breakTime = nb; localStorage.setItem('customBreakTime', nb); }
            if (currentMode === 'focus') { totalFocusSeconds = focusTime * 60; currentTime = totalFocusSeconds; }
            updateTimerDisplay();
            alert('Settings saved!');
        });
    }

    updateTimerDisplay();

    // --- Multi-Track Study Ambience Handler ---
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const ambientAudio = document.getElementById('ambient-audio');
    const musicTrackSelect = document.getElementById('music-track-select');
    const nowPlayingLabel = document.getElementById('now-playing');

    if (musicToggleBtn && ambientAudio && musicTrackSelect) {
        musicTrackSelect.addEventListener('change', () => {
            ambientAudio.src = musicTrackSelect.value;
            ambientAudio.load();
            if (!ambientAudio.paused) {
                ambientAudio.play().catch(err => console.log("Playback error:", err));
            }
            const selectedOption = musicTrackSelect.options[musicTrackSelect.selectedIndex];
            if (nowPlayingLabel) nowPlayingLabel.textContent = selectedOption.text;
        });

        musicToggleBtn.addEventListener('click', () => {
            if (ambientAudio.paused) {
                ambientAudio.play().then(() => {
                    musicToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
                    const selectedOption = musicTrackSelect.options[musicTrackSelect.selectedIndex];
                    if (nowPlayingLabel) nowPlayingLabel.textContent = selectedOption.text;
                }).catch((error) => {
                    console.log("Playback prevented:", error);
                    alert("Please tap the screen once, then try pressing Play again.");
                });
            } else {
                ambientAudio.pause();
                musicToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
                if (nowPlayingLabel) nowPlayingLabel.textContent = "Paused";
            }
        });
    }

    // --- Fireworks Sound Effect Generator ---
    function playFireworkSound() {
        if (localStorage.getItem('soundEnabled') === 'false') return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(120, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);
            
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
        } catch(e) {}
    }

    // --- Massive Center Screen Fireworks Engine with Sound ---
    function triggerMassiveFireworks() {
        playFireworkSound();

        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '99999';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899', '#38bdf8', '#a78bfa', '#fbbf24'];

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const bursts = [
            { x: centerX, y: centerY },
            { x: centerX - 60, y: centerY - 40 },
            { x: centerX + 60, y: centerY - 40 },
            { x: centerX, y: centerY - 80 }
        ];

        bursts.forEach(b => {
            for (let i = 0; i < 75; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 9;
                particles.push({
                    x: b.x,
                    y: b.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: 3 + Math.random() * 5
                });
            }
        });

        function animateFireworks() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let activeParticles = 0;
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.12; 
                p.alpha -= 0.012; 

                if (p.alpha > 0) {
                    activeParticles++;
                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });

            if (activeParticles > 0) {
                requestAnimationFrame(animateFireworks);
            } else {
                canvas.remove();
            }
        }
        animateFireworks();
    }

    function checkAllTasksCompleted(completedCount, totalCount) {
        if (totalCount > 0 && completedCount === totalCount) {
            if (!window.hasCelebratedAllTasks) {
                window.hasCelebratedAllTasks = true;
                triggerMassiveFireworks();
                addXP(25);
            }
        } else {
            window.hasCelebratedAllTasks = false;
        }
    }

    // --- Task Manager ---
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    let tasks = [];
    try {
        tasks = JSON.parse(localStorage.getItem('studyPlannerTasks')) || [];
    } catch (e) {
        tasks = [];
    }

    function saveAndRenderTasks() {
        localStorage.setItem('studyPlannerTasks', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        if (!taskList) return;
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            taskList.innerHTML = '<li style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 12px;">No active quests. Add one above!</li>';
        }
        let completed = 0;
        tasks.forEach((task, index) => {
            if (task.completed) completed++;
            const li = document.createElement('li');
            li.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 8px;";
            li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; overflow: hidden; flex: 1; margin-right: 8px;">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}" style="width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; flex-shrink: 0;">
                    <span style="font-size: 0.9rem; word-break: break-word; ${task.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${task.text}</span>
                </div>
                <button data-index="${index}" style="background: transparent; border: none; color: #ef4444; cursor: pointer; flex-shrink: 0;"><i class="fa-solid fa-trash"></i></button>
            `;
            taskList.appendChild(li);
        });

        const percentage = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
        const progressStats = document.querySelector('.progress-stats');
        const progressBarFill = document.querySelector('.progress-bar-fill');
        if (progressStats) progressStats.textContent = `${percentage}% completed (${completed}/${tasks.length})`;
        if (progressBarFill) progressBarFill.style.width = `${percentage}%`;

        checkAllTasksCompleted(completed, tasks.length);
    }

    if (addTaskBtn && taskInput) {
        addTaskBtn.addEventListener('click', () => {
            const text = taskInput.value.trim();
            if (text) {
                tasks.push({ text, completed: false });
                taskInput.value = '';
                saveAndRenderTasks();
            }
        });
        taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTaskBtn.click(); });
    }

    if (taskList) {
        taskList.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            if (index !== null) {
                if (e.target.tagName === 'INPUT') {
                    tasks[index].completed = e.target.checked;
                    if (e.target.checked) addXP(10);
                    saveAndRenderTasks();
                } else if (e.target.closest('button')) {
                    tasks.splice(index, 1);
                    saveAndRenderTasks();
                }
            }
        });
    }
    renderTasks();

    // --- Calendar Planner Logic ---
    const dateInput = document.getElementById('plan-date-input');
    const textInput = document.getElementById('plan-text-input');
    const savePlanBtn = document.getElementById('save-plan-btn');
    const plansList = document.getElementById('saved-plans-list');

    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    let savedPlans = [];
    try {
        savedPlans = JSON.parse(localStorage.getItem('studyCalendarPlans')) || [];
    } catch (e) {
        savedPlans = [];
    }

    function renderPlans() {
        if (!plansList) return;
        plansList.innerHTML = '';
        if (savedPlans.length === 0) {
            plansList.innerHTML = '<li style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 12px;">No plans scheduled yet. Pick a date above!</li>';
            return;
        }

        savedPlans.sort((a, b) => new Date(a.date) - new Date(b.date));

        savedPlans.forEach((plan, index) => {
            const li = document.createElement('li');
            li.style.cssText = "display: flex; align-items: flex-start; justify-content: space-between; padding: 12px; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 8px;";
            
            li.innerHTML = `
                <div style="flex: 1; margin-right: 8px;">
                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary); background: var(--primary-light, rgba(99, 102, 241, 0.1)); padding: 2px 8px; border-radius: 6px; display: inline-block; margin-bottom: 4px;">${plan.date}</span>
                    <p style="font-size: 0.9rem; color: var(--text-main); word-break: break-word; margin-top: 2px;">${plan.text}</p>
                </div>
                <button data-plan-index="${index}" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.9rem; padding: 4px; flex-shrink: 0;" title="Delete Plan"><i class="fa-solid fa-trash"></i></button>
            `;
            plansList.appendChild(li);
        });
    }

    if (savePlanBtn && dateInput && textInput) {
        savePlanBtn.addEventListener('click', () => {
            const dateVal = dateInput.value;
            const textVal = textInput.value.trim();

            if (!dateVal || !textVal) {
                alert('Please select a date and enter a plan description.');
                return;
            }

            savedPlans.push({ date: dateVal, text: textVal });
            localStorage.setItem('studyCalendarPlans', JSON.stringify(savedPlans));
            textInput.value = '';
            renderPlans();
            addXP(15);
        });
    }

    if (plansList) {
        plansList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('button');
            if (deleteBtn && deleteBtn.hasAttribute('data-plan-index')) {
                const index = parseInt(deleteBtn.getAttribute('data-plan-index'), 10);
                if (!isNaN(index)) {
                    savedPlans.splice(index, 1);
                    localStorage.setItem('studyCalendarPlans', JSON.stringify(savedPlans));
                    renderPlans();
                }
            }
        });
    }

    renderPlans();
});
