document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const htmlElement = document.documentElement;
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            themeToggleBtn.innerHTML = newTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        });
    }

    // --- Pomodoro Timer ---
    let timerMinutes = 25;
    let timerSeconds = 0;
    let timerInterval = null;
    let isRunning = false;

    const timerDisplay = document.getElementById('timer');
    const startBtn = document.querySelector('.timer-btn.start');
    const pauseBtn = document.querySelector('.timer-btn.pause');
    const resetBtn = document.querySelector('.timer-btn.reset');
    const tabBtns = document.querySelectorAll('.tab-btn');

    function updateTimerDisplay() {
        const mins = String(timerMinutes).padStart(2, '0');
        const secs = String(timerSeconds).padStart(2, '0');
        if (timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        timerInterval = setInterval(() => {
            if (timerSeconds === 0) {
                if (timerMinutes === 0) {
                    clearInterval(timerInterval);
                    isRunning = false;
                    alert('Focus session complete! Great job!');
                    triggerFireworks();
                    return;
                }
                timerMinutes--;
                timerSeconds = 59;
            } else {
                timerSeconds--;
            }
            updateTimerDisplay();
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        isRunning = false;
    }

    function resetTimer(mins = 25) {
        clearInterval(timerInterval);
        isRunning = false;
        timerMinutes = mins;
        timerSeconds = 0;
        updateTimerDisplay();
    }

    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (resetBtn) resetBtn.addEventListener('click', () => resetTimer(25));

    tabBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (index === 0) resetTimer(25);
            else if (index === 1) resetTimer(5);
            else if (index === 2) resetTimer(15);
        });
    });

    // --- Ambient Music Player ---
    const audioEl = document.getElementById('ambient-audio');
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const nowPlayingEl = document.getElementById('now-playing');
    const musicTrackSelect = document.getElementById('music-track-select');

    if (musicToggleBtn && audioEl) {
        musicToggleBtn.addEventListener('click', () => {
            if (audioEl.paused) {
                audioEl.play().then(() => {
                    musicToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
                    if (nowPlayingEl) nowPlayingEl.textContent = 'Playing...';
                }).catch(e => {
                    console.error("Playback error:", e);
                    alert("Could not play audio. Please interact with the page or check the audio source.");
                });
            } else {
                audioEl.pause();
                musicToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
                if (nowPlayingEl) nowPlayingEl.textContent = 'Paused';
            }
        });

        if (musicTrackSelect) {
            musicTrackSelect.addEventListener('change', (e) => {
                audioEl.src = e.target.value;
                if (!audioEl.paused) {
                    audioEl.play();
                }
            });
        }
    }

    // --- Task Manager & Gamification ---
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const progressStats = document.querySelector('.progress-stats');
    const progressFill = document.querySelector('.card:last-of-type .progress-bar-fill');
    const userXpEl = document.getElementById('user-xp');
    const userLevelEl = document.getElementById('user-level');

    let tasks = JSON.parse(localStorage.getItem('study_tasks')) || [];
    let xp = parseInt(localStorage.getItem('study_xp')) || 0;
    let level = parseInt(localStorage.getItem('study_level')) || 1;

    function updateStatsDisplay() {
        if (userXpEl) userXpEl.textContent = xp;
        if (userLevelEl) userLevelEl.textContent = level;
    }

    function saveTasks() {
        localStorage.setItem('study_tasks', JSON.stringify(tasks));
        localStorage.setItem('study_xp', xp);
        localStorage.setItem('study_level', level);
        updateStatsDisplay();
    }

    function renderTasks() {
        if (!taskList) return;
        taskList.innerHTML = '';
        let completedCount = 0;

        tasks.forEach((task, index) => {
            if (task.completed) completedCount++;
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.justifyContent = 'space-between';
            li.style.padding = '10px 0';
            li.style.borderBottom = '1px solid var(--border-color)';

            li.innerHTML = `
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; color: var(--text-main); font-size: 0.9rem;">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}" style="width: 16px; height: 16px; accent-color: var(--primary);">
                    <span style="${task.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${task.text}</span>
                </label>
                <button class="delete-task-btn" data-index="${index}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.9rem;"><i class="fa-solid fa-trash"></i></button>
            `;
            taskList.appendChild(li);
        });

        const total = tasks.length;
        const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        if (progressStats) progressStats.textContent = `${percent}% completed (${completedCount}/${total})`;
        if (progressFill) progressFill.style.width = `${percent}%`;

        if (total > 0 && completedCount === total) {
            triggerFireworks();
        }
    }

    if (addTaskBtn && taskInput) {
        addTaskBtn.addEventListener('click', () => {
            const text = taskInput.value.trim();
            if (text) {
                tasks.push({ text, completed: false });
                taskInput.value = '';
                saveTasks();
                renderTasks();
            }
        });

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTaskBtn.click();
            }
        });
    }

    if (taskList) {
        taskList.addEventListener('click', (e) => {
            const checkbox = e.target.closest('input[type="checkbox"]');
            const deleteBtn = e.target.closest('.delete-task-btn');

            if (checkbox) {
                const index = checkbox.dataset.index;
                tasks[index].completed = checkbox.checked;
                if (checkbox.checked) {
                    xp += 20;
                    if (xp >= level * 100) {
                        level++;
                        alert(`Level Up! You reached Level ${level}! 🎉`);
                    }
                }
                saveTasks();
                renderTasks();
            }

            if (deleteBtn) {
                const index = deleteBtn.dataset.index;
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
            }
        });
    }

    updateStatsDisplay();
    renderTasks();

    // --- Fireworks Animation Engine ---
    function triggerFireworks() {
        if (document.getElementById('fireworks-container')) return;

        const container = document.createElement('div');
        container.id = 'fireworks-container';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '99999';
        document.body.appendChild(container);

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = ['#ff0055', '#00ffcc', '#ffcc00', '#9900ff', '#ffffff'][Math.floor(Math.random() * 5)];
            
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 150 + 50;
            const tx = Math.cos(angle) * speed;
            const ty = Math.sin(angle) * speed;

            particle.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
            container.appendChild(particle);

            requestAnimationFrame(() => {
                particle.style.transform = `translate(${tx}px, ${ty}px) scale(1.5)`;
                particle.style.opacity = '0';
            });
        }

        setTimeout(() => {
            container.remove();
        }, 1200);
    }
});

