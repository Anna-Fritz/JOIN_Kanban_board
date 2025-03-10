let tasks = [];
let dbKeys = [];
let storedUsernames = [];
let currentDraggedElement;
let index_to_do = [];
let index_in_progress = [];
let index_await_feedback = [];
let index_done = [];
let userlist = [];

const ADD_URL =
  "http://127.0.0.1:8000/api/task/";

/**
 * Retrieves task data and updates the HTML content accordingly
 */
async function loadTasks() {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  tasks = [];
  dbKeys = [];
  let response = await fetch(ADD_URL, {
    method: "GET",
    headers: {
    // important when permission_classes = [IsAuthenticated] for permission to use
      "Authorization": `Bearer ${accessToken}`
    }
  });
  const data = await response.json();
  tasks = data
    for (let index = 0; index < tasks.length; index++) {
      const taskId = tasks[index].id;
      dbKeys.push(taskId);
    }

    updateHTML();
}

/**
 * collects the initials of all selected users, processes these usernames through the getInitials function, and returns an array of the generated initials.
 * 
 * @returns 
 */
function storeInitials() {
  let selectedUsers = document.querySelectorAll(".assigned-user");
  let storedInitials = [];

  selectedUsers.forEach(function (user) {
    const username = user.dataset.username;
    storedInitials.push(getInitials(username)); // Nutze die getInitials Funktion, um die Initialen korrekt zu generieren
  });
  return storedInitials;
}


/**
 * generates and returns the initials of a given username
 * 
 * @param {string} username 
 * @returns 
 */
function getInitials(username) {
  const names = username.split(" ");
  let initials = names[0].charAt(0).toUpperCase();
  if (names.length > 1) {
    initials += names[1].charAt(0).toUpperCase();
  }
  return initials;
}


/**
 * submits a new task's details , shows a confirmation popup, and then redirects the user to the board page
 * 
 * @returns 
 */
async function addTask() {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  let taskTitle = document.getElementById("addTaskInputTitle");
  let descriptionName = document.getElementById("addTaskDiscriptionField");
  let taskDate = document.getElementById("addTaskInputDueDate");
  let data = {
    title: taskTitle.value,
    description: descriptionName.value,
    assigned_user_id: assignedUsersArr,
    due_date: taskDate.value,
    prio_id: prioArr,
    subtasks: subtasksArr,
    category_id: categoryArr,
    status: "to_do",
  };

  let response = await fetch(ADD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });

  showTaskCreatedPopUp();
  setTimeout(function () {
    location.href = "../html/board.html";
  }, 1200);
  return await response.json();
}

/**
 * submits a new task's details , shows a confirmation popup, and then redirects the user to the board page
 * 
 * @returns 
 */
async function addTaskPopupBoard() {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  let taskTitle = document.getElementById("addTaskPopupInputTitle");
  let descriptionName = document.getElementById("addTaskPopupDiscriptionField");
  let taskDate = document.getElementById("addTaskPopupInputDueDate");
  let data = {
    title: taskTitle.value,
    description: descriptionName.value,
    assigned_user_id: assignedUsersArr,
    due_date: taskDate.value,
    prio_id: prioArr,
    subtasks: subtasksArr,
    category_id: categoryArr,
    status: "to_do",
  };
  let response = await fetch(ADD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(data),
  });
  location.href = "../html/board.html";
  return await response.json();
}

/**
 * deletes a task specified by its index from the server
 * 
 * @param {*} i 
 * @returns 
 */
async function deleteTask(i) {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  closeTaskDetails();
  await fetch(ADD_URL + i + "/", {
    method: "DELETE",
    headers: {
    // important when permission_classes = [IsAuthenticated] for permission to use
      "Authorization": `Bearer ${accessToken}`
    }
  });
  await loadTasks();
}

/**
 * sets the currentDraggedElement variable to the provided id, indicating which element is currently being dragged.
 * 
 * @param {*} id 
 */
function startDragging(id) {
  
  currentDraggedElement = id;
  
}
  
/**
 * prevents the default handling of a drag-and-drop event, allowing the dragged element to be dropped in the target area.
 * 
 * @param {*} ev 
 */
function allowDrop(ev) {
  ev.preventDefault();
}
  
/**
 * highlights the container on dragging
 * 
 * @param {*} id 
 */
function highlightCont(id) {
  document.getElementById(id).classList.add("highlight-category-cont");
}
  
/**
 * removes highlight after dragging
 * 
 * @param {*} id 
 */
function removeHighlight(id) {
  document.getElementById(id).classList.remove("highlight-category-cont");
}
  
/**
 * updates the status of the currently dragged task to the specified status
 * 
 * @param {*} status 
 */
function moveTo(status) {
  tasks[currentDraggedElement]["status"] = status;
  updateHTML();
  saveProgress(currentDraggedElement);
}
  
  /**
   * sets the status of the task with the specified id to "to_do"
   * 
   * @param {*} id 
   */
  function moveToToDo(id) {
    tasks[id]["status"] = "to_do";
    updateHTML();
    saveProgress(id);
  }
  
  /**
   * sets the status of the task with the specified id to "in_progress"
   * 
   * @param {*} id 
   */
  function moveToInProgress(id) {
    tasks[id]["status"] = "in_progress";
    updateHTML();
    saveProgress(id);
  }
  
  /**
   * sets the status of the task with the specified id to "await_feedback"
   * 
   * @param {*} id 
   */
  function moveToAwaitFeedback(id) {
    tasks[id]["status"] = "await_feedback";
    updateHTML();
    saveProgress(id);
  }
  
  /**
   * sets the status of the task with the specified id to "done"
   * 
   * @param {*} id 
   */
  function moveToDone(id) {
    tasks[id]["status"] = "done";
    updateHTML();
    saveProgress(id);
  }
  
  /**
   * toggles the visibility of the dropdown menu
   * 
   * @param {*} i 
   */
  function toggleKebabDropdown(i) {
    document.getElementById(`kebab-dropdown${i}`).classList.toggle("d-none");
  }
  
  /**
   * saves the current state of tasksArray to a server at the specified path using a PUT request
   * 
   * @param {*} path 
   * @returns 
   */
  async function saveProgress(id) {
    const accessToken = localStorage.getItem("accessToken");
    // important when permission_classes = [IsAuthenticated] for permission to use
    if (!accessToken) {
        return;
    }
    let currentTask = tasks[id];
    let currentTaskId = tasks[id].id;
    let data = {
      status: currentTask.status
    }
    let response = await fetch(ADD_URL + currentTaskId + "/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  /**
   * generates the Task Details HTML into PopUp and renders all Infos of the task
   * 
   * @param {*} i 
   */
  function openTaskDetails(i) {
    document.getElementById("task-details-overlay").classList.remove("d-none");
    document.getElementById("task-details-overlay").style = `left: 0`;
    let taskDetails = document.getElementById("task-details-Popup");
    let task = tasks[i];
  
    taskDetails.innerHTML = generateTaskDetailsHTML(task, i);
    renderInfosInTaskDetails(task, i);
  }

  /**
 * hides the task details overla
 */
function closeTaskDetails() {
  document.getElementById("task-details-overlay").classList.add("d-none");
  // document.getElementById('task-details-Popup').style = `left: 100%`;
  updateHTML();
}

/**
 * fetches tasks from database, filters them based on a search input (matching title or description)
 */
async function findTask() {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  tasks = [];
  dbKeys = [];
  let response = await fetch(ADD_URL, {
    method: "GET",
    headers: {
    // important when permission_classes = [IsAuthenticated] for permission to use
      "Authorization": `Bearer ${accessToken}`
    }
  });
  const data = await response.json();
  tasks = data;
  let search = document.getElementById("search-input").value;
  let filter = tasks.filter(
    (x) =>
      x.title.toLowerCase().includes(search.toLowerCase()) ||
      x.description.toLowerCase().includes(search.toLowerCase())
  );
  tasks = filter;
  updateHTML();
}
