document.addEventListener("DOMContentLoaded", () => {
    console.log("Study Planner Loaded Successfully.");
});

function addTask() {
    const input = document.getElementById("task-input");
    const taskText = input.value.trim();
    
    if (taskText !== "") {
        const ul = document.getElementById("task-list");
        const li = document.createElement("li");
        
        li.innerHTML = `<span>${taskText}</span> <button onclick="this.parentElement.remove()" class="btn-danger">Delete</button>`;
        ul.appendChild(li);
        
        input.value = "";
    }
}
