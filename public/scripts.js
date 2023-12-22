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
async function displayTodayTasks() {
    const response = await fetch('/api/tasks');
    const tasks = await response.json();

    const userTask = document.getElementById('toDo');
    userTask.innerHTML = '<h4>Today\'s To-dos</h4>';

    const today = new Date();

    tasks.forEach(task => {
        const taskDueDate = new Date(task.dueDate);

        if(isToday(taskDueDate) && !task.isChecked){
            const div = document.createElement('div');
            const taskName = task.taskName;

            const taskText = document.createTextNode(taskName);
            div.appendChild(taskText);

            userTask.appendChild(div);
        }
    });
}


async function displayUpcomingEvents() {
    const response = await fetch('/api/events');
    const events = await response.json();

    const userEvent = document.getElementById('event');
    userEvent.innerHTML = '<h4>Upcoming Events</h4>';

    const today = new Date();

    events.sort((a, b) => {
        const dateA = new Date(a.eventDate);
        const dateB = new Date(b.eventDate);
        return dateA - dateB;
    });

    events.forEach(event => {
        const eventDate = new Date(event.eventDate);
        if(isFutureDate(eventDate)){
            const div = document.createElement('div');
            const eventName = event.eventName;

            const eventText = document.createTextNode(eventName);
            div.appendChild(eventText);

            userEvent.appendChild(div);
        }
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

function isFutureDate(someDate) {
    const today = new Date();
    return someDate > today;
}

//todo script
//new task function
async function newTask(){
    try{
        const li = document.createElement('li');
        const inputVal = document.getElementById('userInput').value;
        const dueDateVal = document.getElementById('dueDate').value;
        const t = document.createTextNode(inputVal);
        li.appendChild(t);
        if(inputVal === ''){
            alert('Please input your task!');
        } else{
            const taskData = {
                taskName: inputVal,
                dueDate: dueDateVal,
                isChecked: false
            };

            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });

            if(!response.ok) throw new Error('Failed to add task.');

            const newTask = await response.json();
            const taskKey = `task-${newTask._id}`;
            li.setAttribute('data-task-key', taskKey);

            document.getElementById('userTask').appendChild(li);
            var span = document.createElement("SPAN");
            var txt = document.createTextNode("\u00D7");
            span.className = "remove";
            span.appendChild(txt);
            li.appendChild(span);

            // Click on a remove button
            span.onclick = async function() {
                const taskId = li.getAttribute('data-task-key').split('-')[1]; // Extracting task ID
                const deleteResponse = await fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE'
                });

                if (deleteResponse.ok) {
                    li.style.display = 'none';
                } else {
                    throw new Error('Failed to delete task.');
                }
            };

            // Checked task
            li.addEventListener('click', async function(ev) {
                if (ev.target.tagName === 'LI') {
                    ev.target.classList.toggle('checked');
                    taskData.isChecked = !taskData.isChecked;
                    const taskId = li.getAttribute('data-task-key').split('-')[1]; // Extracting task ID
                    const updateResponse = await fetch(`/api/tasks/${taskId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(taskData)
                    });

                    if (!updateResponse.ok) {
                        throw new Error('Failed to update task.');
                    }
                }
            }, false);
        }
        document.getElementById('userInput').value = '';
        document.getElementById('dueDate').value = '';
        displayTasks();
    } catch (error){
        console.error('Error adding tasks: ',error);
    }
}

async function displayTasks() {
    try {
        const userTask = document.getElementById('userTask');
        userTask.innerHTML = '';

        const response = await fetch('/api/tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks.');
        }

        const tasks = await response.json();

        tasks.sort((a, b) => {
            const dueDateA = a.dueDate ? new Date(a.dueDate) : null;
            const dueDateB = b.dueDate ? new Date(b.dueDate) : null;
            if (!dueDateA) return 1;
            if (!dueDateB) return -1;
            return dueDateA - dueDateB;
        });

        tasks.forEach(task => {
            const li = document.createElement('li');
            const taskName = task.taskName;
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;

            const taskText = document.createTextNode(taskName);
            li.appendChild(taskText);

            if (dueDate) {
                const dueDateSpan = document.createElement('span');
                const formattedDueDate = `Due: ${dueDate.toLocaleDateString()}`;
                const dueDateText = document.createTextNode(formattedDueDate);
                dueDateSpan.appendChild(dueDateText);
                dueDateSpan.classList.add('due');
                li.appendChild(dueDateSpan);
            }

            if (task.isChecked) {
                li.classList.add('checked');
            }

            var span = document.createElement('span');
            var txt = document.createTextNode("\u00D7");
            span.className = "remove";
            span.appendChild(txt);
            li.appendChild(span);

            li.setAttribute('data-task-key', `task-${task._id}`); // Ensure task ID is set properly

            span.onclick = async function () {
                try {
                    const taskId = li.getAttribute('data-task-key').split('-')[1]; // Extract task ID
                    const deleteResponse = await fetch(`/api/tasks/${taskId}`, {
                        method: 'DELETE'
                    });

                    if (deleteResponse.ok) {
                        li.style.display = 'none';
                    } else {
                        throw new Error('Failed to delete task.');
                    }
                } catch (error) {
                    console.error('Error deleting task: ', error);
                }
            };

            li.addEventListener('click', async function (ev) {
                try {
                    if (ev.target.tagName === 'LI') {
                        ev.target.classList.toggle('checked');
                        const taskId = li.getAttribute('data-task-key').split('-')[1]; // Extract task ID
                        const taskData = {
                            taskName: task.taskName,
                            dueDate: task.dueDate,
                            isChecked: !task.isChecked // Toggle isChecked value
                        };
                        const updateResponse = await fetch(`/api/tasks/${taskId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(taskData)
                        });

                        if (!updateResponse.ok) {
                            throw new Error('Failed to update task.');
                        }
                    }
                } catch (error) {
                    console.error('Error updating task: ', error);
                }
            }, false);

            userTask.appendChild(li);
        });
    } catch (error) {
        console.error('Error displaying tasks: ', error);
    }
}


//event script
async function addEvent() {
    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    
    if (!eventName || !eventDate) {
        alert('Please fill in both event name and date.');
        return;
    }

    const event = {
        eventName: eventName,
        eventDate: eventDate
    };

    try{
        const response = await fetch('/api/events',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });

        if(!response.ok){
            throw new Error('Failed to add event.');
        }
        
        displayEventsOnCalendar(); 

        document.getElementById('eventName').value = ''; 
        document.getElementById('eventDate').value = '';
    } catch (error){
        console.error('Error adding event:', error);
    }
}

async function checkIfDateHasEvent(year, month, day) {
    try {
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const response = await fetch(`/api/events?date=${formattedDate}`);
        
        if (response.ok) {
            const events = await response.json();
            return events && events.length > 0;
        } else {
            console.error('Failed to retrieve events for the date:', response.status);
            return false; 
        }
    } catch (error) {
        console.error('Error checking if date has event:', error);
        return false; 
    }
}
async function displayEventsOnCalendar() {
    try {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth();

        const day = document.querySelector(".calendar-dates");
        const currdate = document.querySelector(".calendar-current-date");
        const prenexIcons = document.querySelectorAll(".calendar-navigation span");
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const manipulate = async () => {
            try {
                let dayone = new Date(year, month, 1).getDay();
                let lastdate = new Date(year, month + 1, 0).getDate();
                let dayend = new Date(year, month, lastdate).getDay();
                let monthlastdate = new Date(year, month, 0).getDate();
                let lit = "";

                for (let i = dayone; i > 0; i--) {
                    lit += `<li class="inactive">${monthlastdate - i + 1}</li>`;
                }

                for (let i = 1; i <= lastdate; i++) {
                    let isToday = i === date.getDate()
                        && month === new Date().getMonth() 
                        && year === new Date().getFullYear()
                        ? "active"
                        : "";
                    let hasEvent = await checkIfDateHasEvent(year, month + 1, i);
                    let dateClassName = hasEvent ? "has-event" : "";
                    lit += `<li class="${isToday} ${dateClassName}">${i}</li>`;
                }

                for (let i = dayend; i < 6; i++) {
                    lit += `<li class="inactive">${i - dayend + 1}</li>`;
                }
                currdate.innerText = `${months[month]} ${year}`;
                day.innerHTML = lit;

                const calendarDates = document.querySelectorAll('.calendar-dates li');

                calendarDates.forEach((dateElement, index) => {
                    dateElement.addEventListener('click', async () => {
                        const selectedDay = dateElement.innerText; // Get the selected day
                        const selectedDate = new Date(year, month, selectedDay);
                        const formattedSelectedDate = selectedDate.toISOString().split('T')[0];
                        try {
                            const response = await fetch(`/api/events?date=${year}-${(month + 1).toString().padStart(2, '0')}-${selectedDay.padStart(2, '0')}`);
                            if (response.ok) {
                                const events = await response.json();
                
                                const userEventList = document.querySelector('.user-event');
                                userEventList.innerHTML = ''; // Clear previous event info
                
                                events.forEach(event => {
                                    const { _id, eventName, eventDate } = event;
                
                                    const eventListItem = document.createElement('li');
                                    eventListItem.textContent = `${eventName} - ${new Date(eventDate).toLocaleDateString()} `;
                
                                    const deleteButton = document.createElement('span');
                                    deleteButton.innerHTML = '&times;';
                                    deleteButton.classList.add('remove');
                                    deleteButton.onclick = async () => {
                                        try {
                                            await fetch(`/api/events/${_id}`, {
                                                method: 'DELETE'
                                            });
                                    
                                            eventListItem.remove(); // Remove event from the list
                                    
                                            // Remove visual mark on the calendar associated with the deleted event date
                                            const selectedDateElement = document.querySelector(`.has-event[data-date="${formattedSelectedDate}"]`);
                                            if (selectedDateElement) {
                                                selectedDateElement.classList.remove('has-event');
                                            }
                                            await manipulate();
                                        } catch (error) {
                                            console.error('Error deleting event: ', error);
                                        }
                                    };

                                    eventListItem.appendChild(deleteButton);                
                                    userEventList.appendChild(eventListItem);
                                });
                            } else {
                                console.error('Failed to fetch events for the selected date');
                            }
                        } catch (error) {
                            console.error('Error handling click event: ', error);
                        }
                    });
                });
            } catch (error) {
                console.error('Error manipulating calendar: ', error);
            }
        };

        await manipulate();

        prenexIcons.forEach(icon => {
            icon.addEventListener("click", async () => {
                month = icon.id === "calendar-prev" ? month - 1 : month + 1;
                if (month < 0 || month > 11) {
                    date = new Date(year, month, new Date().getDate());
                    year = date.getFullYear();
                    month = date.getMonth();
                } else {
                    date = new Date(year, month, 1);
                }
                await manipulate();
            });
        });
    } catch (error) {
        console.error('Error displaying events on calendar: ', error);
    }
}


//focus script
function changeBackgroundToDark() {
    $('body').css('background-image', 'url("darkbg.png")');
    $('#stats').css('color', 'white');
    $('.pomodoro').css('background', '#ffffff7c');
}
function changeBackgroundToDefault() {
    $('body').css('background-image', 'url("bgweb.png")');
    $('#stats').css('color', '#706f6f');
    $('.pomodoro').css('background', '#9d989854');
}
function initPomodoroTimer(){
    var countS = 20;
    $("#session").html(countS);
    var countB = 5;
    $("#break").html(countB);
    var pos = "";
    var countLama;
    var posLama;
    var count;
    $("#stats").html(pos);
    var clock = $(".timer").FlipClock(0, {
        countdown: true,
        clockFace: 'MinuteCounter',
        autoStart: false,
        callbacks: {
            interval: function(){
            if (clock.getTime() == 0){
                if (pos == "session"){
                clock.setTime(countB*60);
                clock.start();
                pos = "break";
                $("#stats").html(pos);
                } else if (pos == "break"){
                clock.setTime(countS*60);
                clock.start();
                pos = "session";
                $("#stats").html(pos);
                }
            }        
            }
        }
    })  
    //SESSION
    $("#sessInc").on("click", function(){
        if ($("#session").html() > 0){
            countS = parseInt($("#session").html());
            countS+=1;
            $("#session").html(countS);
            //clock.setTime(countS*60);
        }
    });
    $("#sessDec").on("click", function(){
        if ($("#session").html() > 1){
            countS = parseInt($("#session").html());
            countS-=1;
            $("#session").html(countS);
            //clock.setTime(countS*60);
        }
    });
    //BREAK
    $("#breakInc").on("click", function(){
        if ($("#break").html() > 0){
            countB = parseInt($("#break").html());
            countB+=1;
            $("#break").html(countB);
        }    
    });
    $("#breakDec").on("click", function(){
        if ($("#break").html() > 1){
            countB = parseInt($("#break").html());
            countB-=1;
            $("#break").html(countB);
        }
    });  
    $("#start").on("click", function(){
        changeBackgroundToDark();
        if (count != countS || clock.getTime()==0){
            clock.setTime(countS*60);
            pos="session";
            $("#stats").html(pos);
        } else {
            pos = posLama;
            $("#stats").html(pos);
        }
        count = countS;    
        clock.start();    
    });
    $("#stop").on("click", function(){
        changeBackgroundToDefault();
        clock.stop();
        countLama = clock.getTime();
        posLama = $("#stats").html();
    });
    $("#clear").on("click", function(){
        changeBackgroundToDefault();
        clock.stop();
        pos = "";
        $("#stats").html(pos);
        clock.setTime(0);
    });
};


window.addEventListener('load', function() {
    if (window.location.pathname.includes('home.html')) {
        displayRandomQuote();
        displayTodayTasks();
        displayUpcomingEvents();
    } else if (window.location.pathname.includes('todo.html')) {
        displayTasks();
    } else if (window.location.pathname.includes('event.html')) {
        displayEventsOnCalendar();
    } else if (window.location.pathname.includes('focus.html')) {
        initPomodoroTimer();
    }
});
