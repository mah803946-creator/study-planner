document.addEventListener("DOMContentLoaded", () => {
    console.log("Study Planner loaded successfully.");

    const addBtn = document.getElementById("add-btn");
    if (addBtn) {
        addBtn.addEventListener("click", addTask);
    }
});

function addTask() {
    const input = document.getElementById("task-input");
    if (!input) return;
    
    const taskText = input.value.trim();

    if (taskText !== "") {
        const ul = document.getElementById("task-list");
        if (!ul) return;
        
        const li = document.createElement("li");
        li.innerHTML = `<span>${taskText}</span> <button onclick="this.parentElement.remove()">Delete</button>`;
        ul.appendChild(li);

        input.value = "";
    }
}
