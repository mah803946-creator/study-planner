document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const progressStats = document.querySelector('.progress-stats');
    const progressBarFill = document.querySelector('.progress-bar-fill');

    let tasks = [];

    function updateProgress() {
        const total = tasks.length;
        if (total === 0) {
            if (progressStats) progressStats.textContent = '0% completed';
            if (progressBarFill) progressBarFill.style.width = '0%';
            return;
        }
        const completed = tasks.filter(t => t.completed).length;
        const percentage = Math.round((completed / total) * 100);
        
        if (progressStats) progressStats.textContent = `${percentage}% completed`;
        if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
    }

    function renderTasks() {
        if (!taskList) return;
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.justifyContent = 'space-between';
            li.style.padding = '8px 0';
            li.style.borderBottom = '1px solid #f1f5f9';

            const leftDiv = document.createElement('div');
            leftDiv.style.display = 'flex';
            leftDiv.style.alignItems = 'center';
            leftDiv.style.gap = '10px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                tasks[index].completed = checkbox.checked;
                renderTasks();
            });

            const span = document.createElement('span');
            span.textContent = task.text;
            if (task.completed) {
                span.style.textDecoration = 'line-through';
                span.style.color = '#94a3b8';
            }

            leftDiv.appendChild(checkbox);
            leftDiv.appendChild(span);

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteBtn.style.background = 'transparent';
            deleteBtn.style.border = 'none';
            deleteBtn.style.color = '#ef4444';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.addEventListener('click', () => {
                tasks.splice(index, 1);
                renderTasks();
            });

            li.appendChild(leftDiv);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
        updateProgress();
    }

    if (addTaskBtn && taskInput) {
        addTaskBtn.addEventListener('click', () => {
            const text = taskInput.value.trim();
            if (text !== '') {
                tasks.push({ text, completed: false });
                taskInput.value = '';
                renderTasks();
            }
        });

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTaskBtn.click();
            }
        });
    }

    const timerDisplay = document.getElementById('timer');
    const startBtn = document.querySelector('.timer-btn.start');
    const pauseBtn = document.querySelector('.timer-btn.pause');
    const resetBtn = document.querySelector('.timer-btn.reset');

    let timeLeft = 25 * 60;
    let timerId = null;

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateTimerDisplay() {
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timeLeft);
        }
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (timerId !== null) return;
            timerId = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerId);
                    timerId = null;
                    alert('Focus session completed!');
                }
            }, 1000);
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            clearInterval(timerId);
            timerId = null;
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            clearInterval(timerId);
            timerId = null;
            timeLeft = 25 * 60;
            updateTimerDisplay();
        });
    }

    updateTimerDisplay();
});

