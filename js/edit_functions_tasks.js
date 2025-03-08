/**
 * retrieves user data from a database
 */
async function getUsersFromDB() {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  let response = await fetch(USERS_URL, {
    method: "GET",
    headers: {
    // important when permission_classes = [IsAuthenticated] for permission to use
      "Authorization": `Bearer ${accessToken}`
    }
  });
  const data = await response.json();
  let ObjValues = Object.values(data);
  userlist = [];
  for (let i = 0; i < ObjValues.length; i++) {
    const element = ObjValues[i];
    userlist.push(element);
  }
}
  
  /**
   * fetches and sorts user data, finds the index of a user with a matching username
   *
   * @param {*} user
   */
  async function getUserId(user) {
    await getUsersFromDB();
    let sortedUsers = Object.values(userlist).sort((a, b) =>
      a.username.localeCompare(b.username)
    );
    let index = sortedUsers.findIndex((obj) => obj["username"] === user);
    assignedUsersEdit.splice(0, 1);
    toggleUserSelectionBoard(index);
  }
  
  /**
   * Handles the userselection in the dropdown menu. Highlighting, selection, removing etc.
   * @param {*} index
   */
  function toggleUserSelectionBoard(index) {
    let sortedUsers = Object.values(userlist).sort((a, b) =>
      a.username.localeCompare(b.username)
    );
  
    let user = sortedUsers[index];
  
    if (selectedUsers.has(user.username)) {
      selectedUsers.delete(user.username);
      removeUserFromSelection(user.username);
    } else {
      selectedUsers.add(user.username);
      addUserToSelection(user, user.id);
    }
  }
  
  /**
   * removes a user with the specified username from the assignedUsersEdit array
   *
   * @param {*} username
   */
  function removeFromUsersArr(username) {
    for (let i = 0; i < assignedUsersEdit.length; i++) {
      const element = assignedUsersEdit[i];
      if (element.username == username) {
        assignedUsersEdit.splice(i, 1);
      }
    }
    renderSelectedUsersEdit();
  }
  
  /**
   * removes a specified subtask from both the subtasksEdit and subtasksEdit_done arrays
   *
   * @param {*} subtask
   */
  function deleteFromSubtaskArr(subtask) {
    for (let i = 0; i < subtasksEdit.length; i++) {
      const element = subtasksEdit[i];
      if (element.subtask == subtask) {
        subtasksEdit.splice(i, 1);
      }
    }
    renderSubtasksEdit();
  }

  function saveInSubtasksArr(previousSubtask, newSubtask) {
    for (let i = 0; i < subtasksEdit.length; i++) {
      const element = subtasksEdit[i];
      if (element.subtask == previousSubtask) {
        element.subtask = newSubtask;
      }
    }
    for (let i = 0; i < subtasksArr.length; i++) {
      const element = subtasksArr[i];
      if (element.subtask == previousSubtask) {
        element.subtask = newSubtask;
      }
    }
    renderSubtasksEdit();
  }

  /**
 * This function generates the Task Details Edit HTML into PopUp, fetches Data from Task and fill it into Edit Form
 *
 * @param {number} i - index number for selected task
 */
async function openEdit(i) {
    let taskDetails = document.getElementById("task-details-Popup");
    taskDetails.innerHTML = generateTaskDetailsEditHTML(i);
  
    let task = tasks[i];
  
    fillEditForm(task);
  }
  
  /**
   * This function fills the data into Edit Form
   *
   * @param {object} data - data with all information about the selected task
   */
  function fillEditForm(data) {
    let title = document.getElementById("editTitle");
    let description = document.getElementById("editDescription");
    let date = document.getElementById("editDueDate");    
  
    categoryArr = data.category.id;
  
    title.value = data.title;
  
    if ("description" in data) {
      description.value = data.description;
    }
  
    date.value = data.due_date;
  
    firstcheckIfKeysInData(data);
    secondCheckIfKeysInData(data);
  }
  
  /**
   * This function checks if the keys "prio" & "assigned_users" are used in the selected task
   *
   * @param {object} data - data with all information about the selected task
   */
  function firstcheckIfKeysInData(data) {
    if ("prio" in data) {
      document.getElementById(data.prio.level).click();
      prioArrEdit = data.prio.id;
    }
    if ("assigned_users" in data) {
      assignedUsersEdit = [];
      for (let i = 0; i < data.assigned_users.length; i++) {
        const user = data.assigned_users[i];
        assignedUsersEdit.push({
          id: user.id,
          initials: `${user.initials}`,
          username: `${user.username}`,
          color: `${user.color}`,
        });
      }
      renderSelectedUsersEdit();
    }
  }
  
  /**
   * This function checks if the keys "subtasks" & "subtasks_done" are used in the selected task
   *
   * @param {object} data - data with all information about the selected task
   */
  function secondCheckIfKeysInData(data) {
    if ("subtasks" in data) {
      subtasksEdit = [];
      for (let i = 0; i < data.subtasks.length; i++) {
        const element = data.subtasks[i];
  
        subtasksEdit.push({
          subtask: `${element.subtask}`,
        });
      }
      renderSubtasksEdit();
    }

    statusEdit = data.status;
  }
  
  /**
   * This function save the edited infos and patches it back to DB
   *
   * @param {number} i - index number for selected task
   * @returns
   */
  async function saveEdit(i) {
    const accessToken = localStorage.getItem("accessToken");
    // important when permission_classes = [IsAuthenticated] for permission to use
    if (!accessToken) {
        return;
    }
    let taskTitle = document.getElementById("editTitle");
    let descriptionName = document.getElementById("editDescription");
    let taskDate = document.getElementById("editDueDate");
    let data = {
      title: taskTitle.value,
      description: descriptionName.value,
      assigned_user_id: assignedUsersEdit,
      due_date: taskDate.value,
      prio_id: prioArrEdit,
      category_id: categoryArr,
      subtasks: subtasksEdit,
      status: statusEdit
    };

    let taskKey = dbKeys[i];
    let response = await fetch(ADD_URL + taskKey + "/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(data),
    });
  
    showEditSuccessPopUp();
    setTimeout(() => {
      location.href = "../html/board.html";
      updateHTML();
    }, 2000);
    return await response.json();
  }
  
  /**
   * This function generates Task Details HTML into PopUp and renders all Infos of Task
   *
   * @param {number} i - index number for selected task
   */
  function closeEdit(i) {
    let task = tasks[i];
    let taskDetails = document.getElementById("task-details-Popup");
    taskDetails.innerHTML = generateTaskDetailsHTML(task, i);
    renderInfosInTaskDetails(task, i);
  }
  
  /**
   * This function shows a PopUp with Info that the changes were successfully commited
   */
  function showEditSuccessPopUp() {
    let editSuccessElement = document.getElementById("edit-success");
    editSuccessElement.style.display = "flex";
    setTimeout(() => {
      editSuccessElement.style.transform = "translate(-50%, -50%)"; 
      editSuccessElement.style.opacity = "1"; 
    }, 500); 
  
    setTimeout(closeEditSuccessPopUp, 3000); 
  }
  
  /**
   * This function hides again the PopUp with Info that the changes were successfully commited
   */
  function closeEditSuccessPopUp() {
    let editSuccessElement = document.getElementById("edit-success");
    editSuccessElement.style.transform = "translate(100%, -50%)";
    editSuccessElement.style.opacity = "0";
    setTimeout(() => {
      editSuccessElement.style.display = "none";
    }, 500);
  }
  