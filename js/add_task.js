let selectedPrio = null;
let categoriesContainerClick = false;
let assignedContainerClick = false;
let userList = [];
let subtaskIdCounter = 0;
let prioArr;
let prioArrEdit;
let subtasksArr = [];
let subtasksEdit = [];
let categoryArr;
let assignedUsersArr = [];
let assignedUsersEdit = [];
let selectedUsers = new Set();
let prio_data = []
let category_data = []
let statusEdit;

/**
 * Adding backend task URL
 */
const PRIO_URL =
  "http://127.0.0.1:8000/api/prio/";


/**
* Adding backend category URL
*/
 const CATEGORY_URL =
   "http://127.0.0.1:8000/api/category/";


  /**
 * Adding backend user URL
 */
const USERS_URL =
  "http://127.0.0.1:8000/api/user/"

/**
 * asynchronously calls two functions to fetch category and priority data
 */
async function getTaskOptions() {
  getCategoryData();
  getPrioData();
}

/**
 * asynchronously fetches priority data
 * @returns
 */
async function getPrioData() {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  try {
    let response = await fetch(PRIO_URL, {
      method: "GET",
      headers: {
        // important when permission_classes = [IsAuthenticated] for permission to use
        "Authorization": `Bearer ${accessToken}`
      }
    });
    const data = await response.json();
    if (data) {
      prio_data = data;
      return data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

/**
 * asynchronously fetches category data
 * @returns 
 */
async function getCategoryData() {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  try {
    let response = await fetch(CATEGORY_URL, {
      method: "GET",
      headers: {
      // important when permission_classes = [IsAuthenticated] for permission to use
        "Authorization": `Bearer ${accessToken}`
      }
    });
    const data = await response.json();
    if (data) {
      category_data = data;
      return data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

/**
 * Toggle button function. Handles which button is active/checked and unchecks the others
 * @param {*} prioState
 */
function toggleButton(prioState) {
  getTaskOptions();
  prioArrEdit = [];
  let button = document.getElementById(prioState);
  let img = document.getElementById(prioState + "Img");

  if (selectedPrio === prioState) {
    button.classList.remove(`btn-${prioState}-active`);
    img.src = `../assets/img/Prio_${prioState}_color.png`;
    selectedPrio = null;
  } else {
    let priorities = ["urgent", "medium", "low"];
    priorities.forEach((priority) => {
      let otherButton = document.getElementById(priority);
      let otherImg = document.getElementById(priority + "Img");
      otherButton.classList.remove(`btn-${priority}-active`);
      otherImg.src = `../assets/img/Prio_${priority}_color.png`;
    });
    button.classList.add(`btn-${prioState}-active`);
    img.src = `../assets/img/Prio_${prioState}_white.png`;
    selectedPrio = prioState;
    prioArr = 2;
    prioArrEdit = 2;
  }
  if (prioState != 'medium') {
    prioObj = prio_data.filter(obj => obj["level"] === selectedPrio);
    prioId = prioObj[0].id
    prioArr = prioId;
    prioArrEdit = prioId;  
  }
}

/**
 * Category function
 * render categories in dropdown menu
 */
function renderCategories() {
  let categoryContainer = document.getElementById("dropDownCategoryMenu");
  categoryContainer.innerHTML = "";

  for (let i = 0; i < category_data.length; i++) {
    const catName = category_data[i].name;
    const catId = category_data[i].id;

    categoryContainer.innerHTML += `
        <div class="addtask-category" onclick="selectCategory('${catName}', ${catId})">
          ${catName}
        </div>
      `;
  }
}

/**
 * Handles the category dropdown. activation,highlighting and selection
 * @param {*} categoryTask
 * @param {*} catColor
 */
function selectCategory(catName, catId) {
  let categoryInput = document.getElementById("categoryInput");
  let categoryList = document.getElementById("dropDownCategoryMenu");
  categoryInput.value = catName;
  hideCategories();
  categoryList.style.border = "0px";
  categoryArr = catId;
}

/**
 * Opens/closes the dropdown menu for the categorys, icon switch etc.
 */
function openCategories() {
  let categoryList = document.getElementById("dropDownCategoryMenu");
  let icon = document.getElementById("arrowDropMenuCategory");
  icon.style.transform = "rotate(180deg)";
  categoryList.innerHTML = "";
  if (!categoriesContainerClick) {
    categoriesContainerClick = true;
    categoryList.style.border = "1px solid #CDCDCD";
    renderCategories();   
  } else {
    categoriesContainerClick = false;
    categoryList.style.border = "0px";
    hideCategories();
  }
  document.getElementById("categoryInput").classList.toggle("outline");
}


function hideCategories() {
  categoriesContainerClick = false;
  let categoryList = document.getElementById("dropDownCategoryMenu");
  let icon = document.getElementById("arrowDropMenuCategory");
  icon.style.transform = "rotate(0deg)";
  categoryList.innerHTML = "";
}

/**
 * Assigned to function
 * Picks the initials of the selected username due array methods
 * Changes size of the first characters and returns the result
 * @param {*} username
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
 * Fetching data from the Database
 * @returns
 */
async function loadContacts() {
  const accessToken = localStorage.getItem("accessToken");
  // important when permission_classes = [IsAuthenticated] for permission to use
  if (!accessToken) {
      return;
  }
  try {
    let response = await fetch(USERS_URL, {
      method: "GET",
      headers: {
      // important when permission_classes = [IsAuthenticated] for permission to use
        "Authorization": `Bearer ${accessToken}`
      }
    });
    const data = await response.json();    
    if (data) {
      userList = data;
      return data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

/**
 * Opening the dropdown for the userlist and loading the acutal listed users
 */
async function showUsers() {
  let userListElement = document.getElementById("dropDownUserMenu");
  let icon = document.getElementById("arrowDropMenuAssigned");
  icon.style.transform = "rotate(180deg)";
  await loadContacts();
  if (!assignedContainerClick) {
    assignedContainerClick = true;
    userListElement.style.border = "1px solid #CDCDCD";
    displayDropdownUserList(userList);
  } else {
    assignedContainerClick = false;
    userListElement.style.border = "0px";
    hideUsers();
  }
  document.getElementById("userNameInput").classList.toggle("outline");
}

function displayDropdownUserList(userList) {
  let dropdownMenu = document.getElementById("dropDownUserMenu");
  dropdownMenu.innerHTML = "";
  let sortedUsers = Object.values(userList).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
  let lastInitial = "";
  sortedUsers.forEach((user, i) => {
    let color = user.color || generateRandomColor();
    let initial = user.username[0].toUpperCase();
    if (initial !== lastInitial) {
      lastInitial = initial;
    }
    let userId = user.id;
    let isSelected = selectedUsers.has(user.username);
    let additionalClass = isSelected ? "contact-card-click-assigned" : "";
    dropdownMenu.innerHTML += /*html*/ `
      <div onclick="toggleUserSelection(${i}, ${userId})" id="contact-info${i}" class="contact-assigned ${additionalClass}">
        <div class="initials" style="background-color: ${color};">${getInitials(
      user.username
    )}</div>
        <div class="contact-info">
          <p id="name${i}" class="name-assigned ${
      isSelected ? "contact-name-assigned" : ""
    }">
            <span>${user.username}</span>
          </p>
        </div>
      </div>
    `;
  });
}

/**
 * Handles the userselection in the dropdown menu. Highlighting, selection, removing etc.
 * @param {*} index
 */
function toggleUserSelection(index, userId) {
  document.getElementById('userNameInput').value = "";
  let sortedUsers = Object.values(userList).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
  let user = sortedUsers[index];
  let contactElementAssigned = document.getElementById(`contact-info${index}`);

  if (selectedUsers.has(user.username)) {
    selectedUsers.delete(user.username);
    removeUserFromSelection(user.username, userId);
    contactElementAssigned.classList.remove("contact-card-click-assigned");
    contactElementAssigned
      .querySelector(".name-assigned")
      .classList.remove("contact-name-assigned");
  } else {
    selectedUsers.add(user.username);
    addUserToSelection(user, userId);
    contactElementAssigned.classList.add("contact-card-click-assigned");
    contactElementAssigned
      .querySelector(".name-assigned")
      .classList.add("contact-name-assigned");
  }
}

function addUserToSelection(user, userId) {
  let contentAssignedUsers = document.getElementById("contentAssignedUsers");
  let userDiv = document.createElement("div");
  userDiv.className = "assigned-user";
  userDiv.dataset.username = user.username;
  userDiv.innerHTML = `
        <div class="rendered-initials-cont">
            <div class="initials" style="background-color: ${
              user.color || generateRandomColor()
            };">
                ${getInitials(user.username)}
            </div>
        </div>
    `;

  contentAssignedUsers.appendChild(userDiv);
  assignedUsersArr.push(userId);
  assignedUsersEdit.push(userId);
}

function removeUserFromSelection(username, userId) {
  let contentAssignedUsers = document.getElementById("contentAssignedUsers");
  let userDiv = Array.from(contentAssignedUsers.children).find(
    (child) => child.dataset.username === username
  );
  if (userDiv) {
    contentAssignedUsers.removeChild(userDiv);
  }
  for (let i = 0; i < assignedUsersArr.length; i++) {
    const element = assignedUsersArr[i];
    if (element == userId) {
      assignedUsersArr.splice(i, 1);
    }
  }
  for (let i = 0; i < assignedUsersEdit.length; i++) {
    const element = assignedUsersEdit[i];
    if (element == userId) {
      assignedUsersEdit.splice(i, 1);
    }
  }
}

/**
 * Closing the user dropdown menu and changes state of the dropdown
 */
function hideUsers() {
  assignedContainerClick = false;
  let userListElement = document.getElementById("dropDownUserMenu");
  let icon = document.getElementById("arrowDropMenuAssigned");
  icon.style.transform = "rotate(0deg)";
  userListElement.innerHTML = "";
}

/**
 * Filters the userlist shown in dropdown menu
 * @returns
 */
function filterUsers() {
  if (!Array.isArray(userList) || userList.length === 0) {
    return;
  }
  const searchTerm = document
    .getElementById("userNameInput")
    .value.toLowerCase();
  const filteredUsers = Object.values(userList).filter((user) =>
    user.username.toLowerCase().includes(searchTerm)
  );

  displayDropdownUserList(filteredUsers);
}

/**
 * Subtask functions. Add, counter, creating li element, setting IDs for DOM Elements
 * and creating the HTML.
 */
function addSubtask() {
  const subtaskInput = document.getElementById("subtaskInput");
  const subtasksContent = document.getElementById("subtasksContent");

  if (subtaskInput.value.trim() !== "") {
    subtaskIdCounter++;
    const liId = "subtask-" + subtaskIdCounter;
    const spanId = "span-" + subtaskIdCounter;
    const inputId = "input-" + subtaskIdCounter;
    const newSubtaskHTML = /*html*/ `
    <li id="${liId}" class="subtask-item">
        <div class="dot"></div>
        <div class="subtask-text">
            <span id="${spanId}" onclick="editSubtask('${liId}', '${spanId}', '${inputId}')">${subtaskInput.value}</span>
        </div>
        <div class="subtask-icon">
            <img onclick="editSubtask('${liId}', '${spanId}', '${inputId}')" src="../assets/img/edit.svg" alt="edit">
            <div class="divider"></div>
            <img onclick="deleteSubtask('${liId}')" src="../assets/img/delete.svg" alt="delete">
        </div>
    </li>
`;
    subtasksArr.push({
      subtask: `${subtaskInput.value}`,
    });
    subtasksEdit.push({
      subtask: `${subtaskInput.value}`,
    });
    subtasksContent.innerHTML += newSubtaskHTML;
    subtaskInput.value = "";
  }
  document.getElementById("clear-add-icons").classList.add("d-none");
  document.getElementById("subtasks-plus-icon").classList.remove("d-none");
}

/**
 * Subtask edit function
 * @param {*} liId
 * @param {*} spanId
 * @param {*} inputId
 */
function editSubtask(liId, spanId, inputId) {
  const spanElement = document.getElementById(spanId);
  const li = document.getElementById(liId);
  const currentText = spanElement.textContent;

  const editSubtaskHTML = /*html*/ `
        <div class="subtask-input-wrapper edit-mode">
            <input id="${inputId}" class="edit-subtask-input" type="text" value="${currentText}">
            <div class="input-icons-edit">
                <img src ="../assets/img/deletecopy.svg" onclick="deleteSubtask('${liId}')">
                <div class="divider"></div>
                <img src="../assets/img/check1.svg" onclick="saveSubtask('${liId}', '${inputId}', '${spanId}', '${currentText}')">
            </div>
        </div>
    `;

  li.innerHTML = editSubtaskHTML;
  li.classList.add("subtask-item-on-focus");
  li.classList.remove("subtask-item");
}

/**
 * Saving edited subtask
 * @param {*} liId
 * @param {*} inputId
 * @param {*} spanId
 */
function saveSubtask(liId, inputId, spanId, previousText) {
  const li = document.getElementById(liId);
  const input = document.getElementById(inputId);
  const saveSubtaskHTML = `
        <div class="subtask-text">
            <div class="dot"></div>
            <span id="span-${liId}" onclick="editSubtask('${liId}', 'span-${liId}', 'input-${liId}')">${input.value}</span>
        </div>
        <div class="subtask-icon">
            <img onclick="editSubtask('${liId}', '${spanId}', '${inputId}')" src="../assets/img/edit.svg" alt="edit">
            <div class="divider"></div>
            <img id="deleteBtn-${liId}" onclick="deleteSubtask('${liId}')" src="../assets/img/delete.svg" alt="delete">
        </div>
    `;

  li.innerHTML = saveSubtaskHTML;

  saveInSubtasksArr(previousText, input.value);

  li.classList.remove("subtask-item-on-focus");
  li.classList.add("subtask-item");
}

/**
 * Deleting Subtasks
 * @param {*} liId
 */
function deleteSubtask(liId) {
  const li = document.getElementById(liId);
  li.remove();
}

/**
 * Clearing inputfields from Subtask
 */
function clearSubtaskInput() {
  const input = document.getElementById("subtaskInput");
  input.value = "";
  document.getElementById("clearButton").style.display = "none";
}

function showClearButton() {
  document.getElementById("clear-add-icons").classList.remove("d-none");
  document.getElementById("subtasks-plus-icon").classList.add("d-none");
}

function clearImput() {
  document.getElementById("subtaskInput").value = "";
}

/**
 * Successpopup for adding a task. Opening, closing
 */
function showTaskCreatedPopUp() {
  if (window.innerWidth < 1350) {
    document.getElementById("task-success").style = `left: 30px;`;
  } else {
    document.getElementById("task-success").style = `left: 64px;`;
  }
  setTimeout(closeTaskCreatedPopUp, 1200);
}

function closeTaskCreatedPopUp() {
  document.getElementById("task-success").style = `left: 100%;`;
}

/**
 * Click outside event for dropdown closing
 * @param {*} event
 */
function handleClickOutside(event) {
  let categoryList = document.getElementById("dropDownCategoryMenu");
  let categoryIcon = document.getElementById("arrowDropMenuCategory");

  let userListElement = document.getElementById("dropDownUserMenu");
  let userIcon = document.getElementById("arrowDropMenuAssigned");
  if (!categoryList.contains(event.target) && event.target !== categoryIcon) {
    hideCategories();
  }
  if (!userListElement.contains(event.target) && event.target !== userIcon) {
    hideUsers();
  }
}

document.addEventListener("click", handleClickOutside);
