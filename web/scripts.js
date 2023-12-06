//random quote on homepage
const quote = "You will never find time for anything. If you want time, you must make it./Don’t watch the clock; do what it does. Keep going./The only way to do great work is to love what you do./The most effective way to do it is to do it./Believe you can and you're halfway there.";
const quotesArr = quote.split('/');

function displayRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotesArr.length);
    const randomQuote = quotesArr[randomIndex];

    const quotesDiv = document.querySelector('.quotes');
    if (quotesDiv) {
        quotesDiv.textContent = randomQuote;
    }
}

//home script
function displayTodayTasks() {
    var userTask = document.getElementById('toDo');
    userTask.innerHTML = '<h4>Today\'s To-dos</h4>';

    var tasks = [];

    for (let i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith('task-')) {
            var taskData = JSON.parse(localStorage.getItem(key));
            var dueDate = taskData.dueDate ? new Date(taskData.dueDate) : null;

            if (dueDate && isToday(dueDate)) {
                tasks.push({
                    key: key,
                    taskData: taskData,
                    dueDate: dueDate
                });
            }
        }
    }

    tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
    });

    tasks.forEach(task => {
        var div = document.createElement('div');
        var taskName = task.taskData.taskName;
        var dueDate = task.dueDate;

        var taskText = document.createTextNode(taskName);
        div.appendChild(taskText);

        userTask.appendChild(div);
    });
}

function isToday(someDate) {
    const today = new Date();
    return (
        someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear()
    );
}


//todo script
//new task function
function newTask(){
    var li = document.createElement('li');
    var inputVal = document.getElementById('userInput').value;
    var dueDateVal = document.getElementById('dueDate').value;
    var t = document.createTextNode(inputVal);
    li.appendChild(t);
    if(inputVal === ''){
        alert('Please input your task!');
    } else{
        const taskData = {
            taskName: inputVal,
            dueDate: dueDateVal,
            isChecked: false
        };
        const currentTime = new Date().getTime();
        const taskKey = `task-${currentTime}`;
        localStorage.setItem(taskKey, JSON.stringify(taskData));

        document.getElementById('userTask').appendChild(li);
        var span = document.createElement("SPAN");
        var txt = document.createTextNode("\u00D7");
        span.className = "remove";
        span.appendChild(txt);
        li.appendChild(span);

        // Click on a remove button
        span.onclick = function() {
            var div = this.parentElement;
            div.style.display = 'none';
            localStorage.removeItem(taskKey);
        };

        // Checked task
        li.addEventListener('click', function(ev) {
            if (ev.target.tagName === 'LI') {
                ev.target.classList.toggle('checked');
                taskData.isChecked = !taskData.isChecked;
                localStorage.setItem(taskKey, JSON.stringify(taskData));
            }
        }, false);
    }
    document.getElementById('userInput').value = '';
    document.getElementById('dueDate').value = '';
    displayTasks();
}

function displayTasks() {
    var userTask = document.getElementById('userTask');
    userTask.innerHTML = '';

    var tasks = [];

    for (let i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith('task-')) {
            var taskData = JSON.parse(localStorage.getItem(key));
            tasks.push({
                key: key,
                taskData: taskData,
                dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null
            });
        }
    }

    tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
    });

    tasks.forEach(task => {
        var li = document.createElement('li');
        var taskName = task.taskData.taskName;
        var dueDate = task.dueDate;

        var taskText = document.createTextNode(taskName);
        li.appendChild(taskText);

        if (dueDate) {
            var dueDateSpan = document.createElement('span');
            var formattedDueDate = `Due: ${dueDate.toLocaleDateString()}`;
            var dueDateText = document.createTextNode(formattedDueDate);
            dueDateSpan.appendChild(dueDateText);
            dueDateSpan.classList.add('due');
            li.appendChild(dueDateSpan);
        }

        if (task.taskData.isChecked) {
            li.classList.add('checked');
        }

        var span = document.createElement("SPAN");
        var txt = document.createTextNode("\u00D7");
        span.className = "remove";
        span.appendChild(txt);
        li.appendChild(span);

        li.setAttribute('data-task-key', task.key);

        span.onclick = function () {
            var div = this.parentElement;
            var taskKey = div.getAttribute('data-task-key');
            div.style.display = 'none';
            localStorage.removeItem(taskKey);
        };

        userTask.appendChild(li);
    });

    var listItems = document.querySelectorAll('#userTask li');
    listItems.forEach(function (item) {
        item.addEventListener('click', function (ev) {
            var taskKey = this.getAttribute('data-task-key');
            var taskData = JSON.parse(localStorage.getItem(taskKey));

            if (ev.target.tagName === 'LI') {
                ev.target.classList.toggle('checked');
                taskData.isChecked = !taskData.isChecked;
                localStorage.setItem(taskKey, JSON.stringify(taskData));
            }
        });
    });
}

window.addEventListener('load', function() {
    if (window.location.pathname.includes('home.html')) {
        displayRandomQuote();
        displayTodayTasks();
    } else if (window.location.pathname.includes('todo.html')) {
        displayTasks();
    }
});

