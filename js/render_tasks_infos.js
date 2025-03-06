  /**
   * updates the HTML content of the element with the specified id to display the description property of the provided element
   * 
   * @param {*} element 
   * @param {*} id 
   */
  function renderTaskDescription(element, id) {
    document.getElementById(id).innerHTML = `${element.description}`;
  }
  
  /**
   * displays the progress of subtasks, showing a progress bar and a counter based on the number of completed and total subtasks
   * 
   * @param {*} element 
   * @param {*} id 
   */
  function renderSubtaskProgress(element, id) {
    let progress = document.getElementById(id);
    let completedSubtasks = element.subtasks.filter(subtask => subtask.completed === true);

    if (completedSubtasks.length > 0) {
      progress.innerHTML = /*html*/ `
      <div id="subtask-progress">
          <div id="progress-bar" style="width:${(100 / element.subtasks.length) * completedSubtasks.length
        }%"></div>
      </div>
      <div id="subtask-counter">${completedSubtasks.length}/${element.subtasks.length
        } Subtasks</div>
      `;
    } else if(element.subtasks.length > 0) {
      progress.innerHTML = /*html*/ `
      <div id="subtask-progress">
          <div id="progress-bar" style="width:${(100 / element.subtasks.length) * 0
        }%"></div>
      </div>
      <div id="subtask-counter">0/${element.subtasks.length} Subtasks</div>
      `;
    }
  }
  
  /**
   * displays the initials of assigned users for a task, showing individual initials for up to 5 users and a summary indicator (+N) if there are more than 6 users
   * 
   * @param {*} element 
   * @param {*} initialsCont 
   */
  function renderInitialsInSmallTask(element, initialsCont) {    
    let users = element.assigned_users;
    if (users.length < 6) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const username = user.username;
        const userInitials = getInitialsOfName(username);
        document.getElementById(initialsCont).innerHTML += `
          <div class="test-initials" style="background-color: ${user.color}">${userInitials}</div>
        `;
      }
    }
    if (users.length >= 6) {
      for (let i = 0; i < users.length - (users.length - 5); i++) {
        const user = users[i];
        const username = user.username;
        const userInitials = getInitialsOfName(username);
        document.getElementById(initialsCont).innerHTML += `
          <div class="test-initials" style="background-color: ${user.color}">${userInitials}</div>
        `;
      }
      document.getElementById(initialsCont).innerHTML += `
        <div class="test-initials" style="background-color: #2A3647">+${users.length - 5}</div>
      `;
    }
  }

  function getInitialsOfName(name) {
    if(!name) return "";
    return name.split(" ").map(word => word[0]).join("").toUpperCase();
  }
  
  /**
   * displays a priority icon for the task
   * 
   * @param {*} element 
   * @param {*} id 
   */
  function renderTaskPrio(element, id) {
    document.getElementById(id).innerHTML = `<img class="prio-icons" src="${element.prio.icon_path
    }" alt="prio icon">`;
  }

    /**
   * updates the task details by conditionally rendering assigned user contacts and subtasks if those properties are present
   * 
   * @param {*} task 
   * @param {*} i 
   */
    function renderInfosInTaskDetails(task, i) {
        if ("assigned_users" in task) {
          renderAssignedContacts(task);
        } else {
          document.getElementById(`assigned-users-cont${i}`).classList.add("d-none");
        }
        if ("subtasks" in task) {
          renderSubtasks(task, i);
        } else {
          document.getElementById(`subtasks-cont${i}`).classList.add("d-none");
        }
        renderInfosInTaskDetailsTwo(task, i);
      }
      
      /**
       * updates the task details by conditionally rendering the task description and priority if those properties are present
       * 
       * @param {*} task 
       * @param {*} i 
       */
      function renderInfosInTaskDetailsTwo(task, i) {
        if ("description" in task) {
          renderDescriptionInTaskDetails(task, i);
        } else {
          document
            .getElementById(`task-details-description${i}`)
            .classList.add("d-none");
        }
        if ("prio" in task) {
          renderPrioInTaskDetails(task, i);
        } else {
          document.getElementById(`task-details-prio${i}`).classList.add('d-none');
        }
      }
    
      
      /**
       * displays the description of the task details
       * 
       * @param {*} task 
       * @param {*} i 
       */
      function renderDescriptionInTaskDetails(task, i) {
        document.getElementById(
          `task-details-description${i}`
        ).innerHTML = `${task.description}`;
      }
      
      /**
       * displays the task's priority, including a capitalized priority label and an associated icon image
       * 
       * @param {*} task 
       * @param {*} i 
       */
      function renderPrioInTaskDetails(task, i) {
        let prio = document.getElementById(`prio-cont${i}`);
        prio.innerHTML = /*html*/`
            <span>${task.prio.level.charAt(0).toUpperCase() + task.prio.level.slice(1)}</span>
            <img src="${task.prio.icon_path}">
        `;
      }
      
      /**
       * populates the assigned-contacts element with a list of assigned users for the given task, displaying each user's initials and username
       * 
       * @param {*} task 
       */
      function renderAssignedContacts(task) {
        let contacts = document.getElementById("assigned-contacts");
        contacts.innerHTML = "";
      
        for (let i = 0; i < task.assigned_users.length; i++) {
          const user = task.assigned_users[i];
          const username = user.username
          const userInitials = getInitialsOfName(username)
      
          contacts.innerHTML += `
                    <div class="assigned-single-contact">
                        <div class="test-initials" style="background-color: ${user.color}">${userInitials}</div>
                        <span>${user.username}</span>
                    </div>
                `;
        }
      }
      
      /**
       * display a list of subtasks for the given task, including each subtask's description and a checkbox image that triggers a function to mark the subtask as done when clicked
       * 
       * @param {*} task 
       * @param {*} i 
       */
      function renderSubtasks(task, i) {
        let subtasks = document.getElementById(`subtasks-details${i}`);
        subtasks.innerHTML = "";
        let checkbox_src;
      
        for (let j = 0; j < task.subtasks.length; j++) {
          if(task.subtasks[j].completed) {
            checkbox_src = '../assets/img/checkbox-check.svg'
          } else {
            checkbox_src = '../assets/img/checkbox-empty.svg'
          }
          subtasks.innerHTML += /*html*/ `
                  <div class="subtask-cont">
                      <div class="subtask-cont-img" onclick="toggleSubtask(${i}, ${j})">
                          <img id="checkbox${j}" src="${checkbox_src}">
                      </div>
                      <div class="subtask-cont-text">${task.subtasks[j].subtask}</div>
                  </div>
              `;
        }

        if(task.subtasks.length == 0) {
          document.getElementById(`subtasks-cont${i}`).classList.add('d-none');
        } else {
          document.getElementById(`subtasks-cont${i}`).classList.remove('d-none');
        }
      }
      
      /**
       * renders the selected users in the edit PopUp
       */
      function renderSelectedUsersEdit() {
        let selectedUsers = document.getElementById('contentAssignedUsers');
        selectedUsers.innerHTML = "";
        for (let i = 0; i < assignedUsersEdit.length; i++) {
          const user = assignedUsersEdit[i];
      
          getUserId(user.username);
        }
      }


  /**
 * toggles the completion status of a subtask by updating its checkbox image
 *
 * @param {*} i
 * @param {*} j
 */
  function toggleSubtask(i, j) {
    let check = document.getElementById(`checkbox${j}`);
    let task = tasks[i];
    let taskId = tasks[i].id;
    let subtaskId = task.subtasks[j].id;
  
    if (!task.subtasks[j].completed) {
      check.src = "../assets/img/checkbox-check.svg";
      task.subtasks[j].completed = true;
      saveSubtaskStatus(taskId, subtaskId, task.subtasks[j].completed);
    } else {
      check.src = "../assets/img/checkbox-empty.svg";
      task.subtasks[j].completed = false;
      saveSubtaskStatus(taskId, subtaskId, task.subtasks[j].completed);
    }
    updateHTML();
  }

/**
 * asynchronously sends a PATCH request to update the completion status of a specific subtask for a given task
 * @param {*} taskId 
 * @param {*} subtaskId 
 * @param {*} subtaskBool 
 * @returns 
 */
async function saveSubtaskStatus(taskId, subtaskId, subtaskBool) {
  let data = {
    completed: subtaskBool,
  };
  let response = await fetch('http://127.0.0.1:8000/api/task/' + taskId + '/subtask/' + subtaskId + '/', {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });  
  return await response.json();
}

/**
 * populates the subtasksContent element with a list of subtasks from the subtasksEdit array
 */
function renderSubtasksEdit() {
    let selectedSubtasks = document.getElementById("subtasksContent");
    selectedSubtasks.innerHTML = "";
    for (let i = 0; i < subtasksEdit.length; i++) {
      const element = subtasksEdit[i];

      selectedSubtasks.innerHTML += /*html*/ `
        <li id="subtask-${i}" class="subtask-item">
            <div class="dot"></div>
            <div class="subtask-text">
                <span id="span-${i}" onclick="editSubtask('subtask-${i}', 'span-${i}', 'input-${i}'); editInSubtasksArr('${element.subtask}')">${element.subtask}</span>
            </div>
            <div class="subtask-icon">
                <img onclick="editSubtask('subtask-${i}', 'span-${i}', 'input-${i}')" src="../assets/img/edit.svg" alt="edit">
                <div class="divider"></div>
                <img onclick="deleteFromSubtaskArr('${element.subtask}')" src="../assets/img/delete.svg" alt="delete">
            </div>
        </li>
        `;
    }
  }
