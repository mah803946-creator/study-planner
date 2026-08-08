document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Advanced High-Precision Timer & Pomodoro Logic ---
    const timerDisplay = document.getElementById('timer');
    const startBtn = document.querySelector('.timer-btn.start');
    const pauseBtn = document.querySelector('.timer-btn.pause');
    const resetBtn = document.querySelector('.timer-btn.reset');
    const tabBtns = document.querySelectorAll('.tab-btn');

    let focusTime = parseInt(localStorage.getItem('customFocusTime')) || 25;
    let breakTime = parseInt(localStorage.getItem('customBreakTime')) || 5;
    
    let currentTime = focusTime * 60;
    let timerId = null;
    let currentMode = 'focus';
    let targetTimestamp = null;
    let completedPomodoros = parseInt(localStorage.getItem('pomodoroCount')) || 0;

    // Web Audio API beep generator for zero-latency audio notifications
    function playBeep() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.4);
        } catch (e) {
            // AudioContext restricted before user interaction
        }
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(currentTime / 60);
        const seconds = currentTime % 60;
        if (timerDisplay) {
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            document.title = `(${timerDisplay.textContent}) Study Planner Pro`;
        }
    }

    function switchMode(mode, btnElement) {
        if (timerId !== null) {
            clearInterval(timerId);
            timerId = null;
        }
        targetTimestamp = null;
        currentMode = mode;

        tabBtns.forEach(btn => btn.classList.remove('active'));
        if (btnElement) btnElement.classList.add('active');

        if (mode === 'focus') {
            focusTime = parseInt(localStorage.getItem('customFocusTime')) || 25;
            currentTime = focusTime * 60;
        } else if (mode === 'short') {
            breakTime = parseInt(localStorage.getItem('customBreakTime')) || 5;
            currentTime = breakTime * 60;
        } else if (mode === 'long') {
            currentTime = 15 * 60;
        }
        updateTimerDisplay();
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.textContent.trim().toLowerCase();
            if (text.includes('focus')) {
                switchMode('focus', btn);
            } else if (text.includes('short')) {
                switchMode('short', btn);
            } else if (text.includes('long')) {
                switchMode('long', btn);
            }
        });
    });

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (timerId !== null) return;
            
            targetTimestamp = Date.now() + (currentTime * 1000);

            timerId = setInterval(() => {
                const now = Date.now();
                currentTime = Math.max(0, Math.ceil((targetTimestamp - now) / 1000));

                updateTimerDisplay();

                if (currentTime <= 0) {
                    clearInterval(timerId);
                    timerId = null;
                    targetTimestamp = null;
                    playBeep();
                    
                    if (currentMode === 'focus') {
                        completedPomodoros++;
                        localStorage.setItem('pomodoroCount', completedPomodoros);
                        alert('Focus session complete! Time for a break.');
                        switchMode('short', tabBtns[1]);
                    } else {
                        alert('Break over! Ready to focus again?');
                        switchMode('focus', tabBtns[0]);
                    }
                }
            }, 100);
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (timerId !== null) {
                clearInterval(timerId);
                timerId = null;
                if (targetTimestamp) {
                    currentTime = Math.max(0, Math.ceil((targetTimestamp - Date.now()) / 1000));
                    targetTimestamp = null;
                }
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (timerId !== null) {
                clearInterval(timerId);
                timerId = null;
            }
            targetTimestamp = null;
            if (currentMode === 'focus') currentTime = focusTime * 60;
            else if (currentMode === 'short') currentTime = breakTime * 60;
            else if (currentMode === 'long') currentTime = 15 * 60;
            updateTimerDisplay();
        });
    }

    // --- Custom Timer Duration Management ---
    const customFocusInput = document.getElementById('custom-focus-input');
    const customBreakInput = document.getElementById('custom-break-input');
    const saveTimeBtn = document.getElementById('save-time-btn');

    if (customFocusInput && customBreakInput) {
        customFocusInput.value = focusTime;
        customBreakInput.value = breakTime;
    }

    if (saveTimeBtn) {
        saveTimeBtn.addEventListener('click', () => {
            const newFocus = parseInt(customFocusInput.value);
            const newBreak = parseInt(customBreakInput.value);

            if (newFocus > 0 && newFocus <= 120) {
                focusTime = newFocus;
                localStorage.setItem('customFocusTime', focusTime);
            }
            if (newBreak > 0 && newBreak <= 60) {
                breakTime = newBreak;
                localStorage.setItem('customBreakTime', breakTime);
            }

            if (currentMode === 'focus') {
                currentTime = focusTime * 60;
            } else if (currentMode === 'short') {
                currentTime = breakTime * 60;
            }
            updateTimerDisplay();
            alert('Custom timer duration saved successfully!');
        });
    }

    updateTimerDisplay();

    // --- Study Ambience Music Player Logic ---
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const ambientAudio = document.getElementById('ambient-audio');
    const nowPlayingText = document.getElementById('now-playing');

    if (musicToggleBtn && ambientAudio) {
        musicToggleBtn.addEventListener('click', () => {
            if (ambientAudio.paused) {
                ambientAudio.play().then(() => {
                    musicToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
                    musicToggleBtn.style.background = '#e0e7ff';
                    musicToggleBtn.style.color = 'var(--primary)';
                    if (nowPlayingText) {
                        nowPlayingText.style.color = 'var(--primary)';
                        nowPlayingText.style.fontWeight = '600';
                    }
                }).catch(err => {
                    console.error("Audio playback restricted:", err);
                    alert("Please interact with the page first to enable audio playback.");
                });
            } else {
                ambientAudio.pause();
                musicToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
                musicToggleBtn.style.background = 'var(--primary)';
                musicToggleBtn.style.color = 'white';
                if (nowPlayingText) {
                    nowPlayingText.style.color = 'var(--text-muted)';
                    nowPlayingText.style.fontWeight = 'normal';
                }
            }
        });
    }

    // --- 2. Advanced Task & Progress Manager with Celebration ---
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const progressStats = document.querySelector('.progress-stats');
    const progressBarFill = document.querySelector('.progress-bar-fill');

    let tasks = JSON.parse(localStorage.getItem('studyPlannerTasks')) || [];

    function checkAllTasksCompleted(completedCount, totalCount) {
        if (totalCount > 0 && completedCount === totalCount) {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const eventX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
                    const eventY = window.innerHeight / 2 + (Math.random() - 0.5) * 100;
                    const petals = ['🌸', '⭐', '🎉', '🌷', '✨'];
                    const petal = document.createElement('div');
                    petal.className = 'falling-petal';
                    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
                    petal.style.left = `${eventX}px`;
                    petal.style.top = `${eventY}px`;
                    const duration = 1 + Math.random() * 0.8;
                    petal.style.animationDuration = `${duration}s`;
                    document.body.appendChild(petal);
                    setTimeout(() => petal.remove(), duration * 1000);
                }, i * 150);
            }
        }
    }

    function saveAndRenderTasks() {
        localStorage.setItem('studyPlannerTasks', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        if (!taskList) return;
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<li style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 12px;">No active tasks. Add one above!</li>';
        }

        let completedCount = 0;

        tasks.forEach((task, index) => {
            if (task.completed) completedCount++;

            const li = document.createElement('li');
            li.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 8px; transition: all 0.2s ease;";
            
            li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; overflow: hidden; text-overflow: ellipsis;">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}" style="width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer;">
                    <span style="font-size: 0.9rem; color: var(--text-main); word-break: break-word; ${task.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${task.text}</span>
                </div>
                <button data-index="${index}" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.9rem; padding: 4px;"><i class="fa-solid fa-trash"></i></button>
            `;
            taskList.appendChild(li);
        });

        const percentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
        if (progressStats) progressStats.textContent = `${percentage}% completed (${completedCount}/${tasks.length})`;
        if (progressBarFill) progressBarFill.style.width = `${percentage}%`;

        checkAllTasksCompleted(completedCount, tasks.length);
    }

    if (addTaskBtn && taskInput) {
        addTaskBtn.addEventListener('click', () => {
            const text = taskInput.value.trim();
            if (text) {
                tasks.push({ text: text, completed: false });
                taskInput.value = '';
                saveAndRenderTasks();
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
            const index = e.target.getAttribute('data-index');
            if (index !== null) {
                if (e.target.tagName === 'INPUT') {
                    tasks[index].completed = e.target.checked;
                    saveAndRenderTasks();
                } else if (e.target.closest('button')) {
                    tasks.splice(index, 1);
                    saveAndRenderTasks();
                }
            }
        });
    }

    renderTasks();

    // --- Motivational Quote Rotator ---
    const quotes = [
        "\"Small progress every day adds up to big results.\"",
        "\"The secret of getting ahead is getting started.\"",
        "\"Focus on being productive instead of busy.\"",
        "\"Your future is created by what you do today, not tomorrow.\""
    ];
    const quoteBanner = document.getElementById('quote-banner');
    if (quoteBanner) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteBanner.textContent = randomQuote;
    }
});

// --- 3. Optimized High-Performance Falling Petals Effect ---
document.addEventListener('click', (e) => {
    if (document.querySelectorAll('.falling-petal').length > 15) return;

    const petals = ['🌸', '🌺', '🌷', '🌹', '🌼'];
    const petal = document.createElement('div');
    petal.className = 'falling-petal';
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    
    const xOffset = (Math.random() - 0.5) * 40;
    petal.style.left = `${e.clientX + xOffset}px`;
    petal.style.top = `${e.clientY}px`;
    
    const duration = 0.8 + Math.random() * 0.6;
    petal.style.animationDuration = `${duration}s`;
    
    document.body.appendChild(petal);
    
    setTimeout(() => {
        petal.remove();
    }, duration * 1000);
});

