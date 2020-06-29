import { projects, todos, save } from './functionality';
import { formatDistanceToNowStrict, isToday, parseISO, isFuture, format } from 'date-fns';
import { ka } from 'date-fns/locale';

export { sidebar };

const addDiv = (function () {
  const addDiv = document.querySelector('.add-div');
  const titleInput = addDiv.querySelector('#title');
  const dueDateDateInput = addDiv.querySelector('#due-date-date');
  const dueDateTimeInput = addDiv.querySelector('#due-date-time');
  const priorityInput = addDiv.querySelector('#priority-select');
  const projectInput = addDiv.querySelector('#project-select');

  function refreshProjectDropdownOptions() {
    clearProjectDropdownOptions();
    addProjectDropdownOptions();
  }

  function addProjectDropdownOptions() {
    const dropdown = document.querySelector('#project-select');
    Object.keys(projects.obj).forEach((project) => {
      const option = document.createElement('option');
      option.value = project;
      option.textContent = project;
      dropdown.appendChild(option);
    });
  };

  function clearProjectDropdownOptions() {
    const dropdown = document.querySelector('#project-select');
    dropdown.innerHTML = '';
  }

  (function addOkBtnEventListener() {
    const okBtn = document.querySelector('.ok-btn');
    okBtn.addEventListener('click', handleOkBtnClick);
  })();

  function handleOkBtnClick() {
    addTodo();
    toggleAddDiv();
    content.refresh();
  }

  (function addCancelBtnEventListener() {
    const cancelBtn = document.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', toggleAddDiv);
  })();

  function addTodo() {
    const title = titleInput.value;
    const dueDateDate = dueDateDateInput.value;
    const dueDateTime = dueDateTimeInput.value;
    const priority = priorityInput.value;
    const project = projectInput.value;

    todos.create(title, '', dueDateDate, dueDateTime, priority, project, false);
  }

  function resetAddDivInputs() {
    titleInput.value = '';
    dueDateDateInput.value = format(Date.now(), 'yyyy-MM-dd');
    dueDateTimeInput.value = format(Date.now(), 'k:m');
    priorityInput.value = 'priority-none';
    projectInput.value = 'inbox';
  }

  function toggleHidden() {
    const addDiv = document.querySelector('.add-div');
    addDiv.classList.toggle('hidden');
  }

  function toggleAddDiv() {
    toggleHidden();
    resetAddDivInputs();
    refreshProjectDropdownOptions();
  }

  return { toggleAddDiv };
})();

const content = (function () {
  (function addSortInputEventListeners() {
    const topInputs = document.querySelectorAll('.top-input')
    topInputs.forEach(input => input.addEventListener('input', refresh))
  })();

  function getSortedValues(values) {
    const propertyInput = document.querySelector('#sort-property');
    const directionInput = document.querySelector('#sort-direction');
    const property = propertyInput.value;
    const direction = directionInput.value;

    if (property === 'due date') {
      if (direction === 'desc') {
        return projects.sort.sortByDueDateDesc(values);
      } else if (direction === 'asc') {
        return projects.sort.sortByDueDateAsc(values);
      }
    } else if (property === 'creation date') {
      if (direction === 'desc') {
        return projects.sort.sortByCreationDateDesc(values);
      } else if (direction === 'asc') {
        return projects.sort.sortByCreationDateAsc(values);
      }
    } else if (property === 'title') {
      if (direction === 'desc') {
        return projects.sort.sortByTitleDesc(values);
      } else if (direction === 'asc') {
        return projects.sort.sortByTitleAsc(values);
      }
    }
  }

  function getSortedValuesAll() {
    // this needs some rewriting
    const values1 = Object.values(projects.obj);
    let values2 = values1.map((obj) => Object.values(obj));
    values2 = values2.flat();

    const valuesSorted = getSortedValues(values2);
    return valuesSorted;
  }

  function moveCompletedToBottom(values) {
    const valuesCopy = [...values];
    return valuesCopy.sort((a, b) => a.completed - b.completed)
  }

  function hideCompleted(values) {
    return values.filter(value => value.completed === false);
  }

  function hideOrBottom(values) {
    const hideCompletedCheckbox = document.querySelector('.hide-completed');
    const completedToBottomCheckbox = document.querySelector('.completed-to-bottom');
    if (hideCompletedCheckbox.checked) {
      return hideCompleted(values);
    } else if (completedToBottomCheckbox.checked) {
      return moveCompletedToBottom(values);
    }

    return values;
  }

  function render() {
    save.set();

    let valuesModified;
    const currProjectTitle = sidebar.getCurrentProject();
    if (currProjectTitle === 'view all') {
      valuesModified = getSortedValuesAll();
    } else if (currProjectTitle === 'today') {
      valuesModified = projects.filterToday(getSortedValuesAll());
    } else {
      const currProjectValues = Object.values(projects.obj[currProjectTitle]);
      valuesModified = getSortedValues(currProjectValues);
    }

    valuesModified = hideOrBottom(valuesModified);

    valuesModified.forEach((todo) => {
      renderContainer(todo.title, todo.projectTitle);
      renderContainerContent(todo.title, todo.dueDateDate, todo.dueDateTime, todo.priority, todo.completed);
    });

    addContainerEventListeners();
  }

  function renderContainer(todoTitle, todoProjectTitle) {
    const contentDiv = document.querySelector('.content');

    const container = document.createElement('div');
    container.classList.add('container');
    container.dataset.title = todoTitle;
    container.dataset.projectTitle = todoProjectTitle;

    contentDiv.appendChild(container);
  }

  function renderContainerContent(todoTitle, todoDueDateDate, todoDueDateTime, todoPriority, todoCompleted) {
    const container = document.querySelector(`[data-title="${todoTitle}"]`);

    container.classList.add(todoPriority);

    insertCompleteCheckbox(container, todoCompleted);
    insertTitle(container, todoTitle);
    insertDueDate(container, todoDueDateDate, todoDueDateTime);
    insertDeleteBtn(container);
  }

  function insertCompleteCheckbox(container, todoCompleted) {
    const completeCheckbox = document.createElement('input');
    completeCheckbox.type = 'checkbox';
    completeCheckbox.checked = todoCompleted;
    completeCheckbox.classList.add('complete-checkbox');
    completeCheckbox.addEventListener('click', handleCompleteCheckboxClick);
    completeCheckbox.addEventListener('mouseover', (e) => e.stopPropagation());
    container.appendChild(completeCheckbox);
  }

  function handleCompleteCheckboxClick(e) {
    e.stopPropagation();

    const todo = findTodoWithEvent(e);
    todo.completed = todo.completed ? false : true;

    const container = e.target.parentElement;
    container.classList.toggle('completed');

    refresh();
  }

  function findTodoWithEvent(e) {
    const todoTitle = e.target.parentElement.dataset.title;
    const todoProjectTitle = e.target.parentElement.dataset.projectTitle;
    return projects.obj[todoProjectTitle][todoTitle];
  }

  function insertTitle(container, todoTitle) {
    const title = document.createElement('p');
    title.classList.add('todo-title');
    title.textContent = todoTitle;
    container.appendChild(title);
  }

  function insertDueDate(container, todoDueDateDate, todoDueDateTime) {
    const dueDateElement = document.createElement('p');

    const todoDueDateISO = parseISO(`${todoDueDateDate} ${todoDueDateTime}`);
    if (isToday(todoDueDateISO)) {
      let todoDueDateFormatted = formatDistanceToNowStrict(todoDueDateISO, { locale: ka });
      todoDueDateFormatted = todoDueDateFormatted.slice(0, -1);

      dueDateElement.textContent = isFuture(todoDueDateISO)
        ? `${todoDueDateFormatted}ში`
        : `${todoDueDateFormatted}ის წინ`;
    } else {
      dueDateElement.textContent = todoDueDateDate;
    }

    container.appendChild(dueDateElement);
  }

  function insertDeleteBtn(container) {
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn')
    deleteBtn.textContent = 'delete';
    deleteBtn.addEventListener('click', handleDeleteBtn);
    deleteBtn.addEventListener('mouseover', (e) => e.stopPropagation());
    container.appendChild(deleteBtn);
  }

  function handleDeleteBtn(e) {
    e.stopPropagation();
    deleteTodo(e);
    refresh();
  }

  function deleteTodo(e) {
    const todoTitle = e.target.parentElement.dataset.title;
    const todoProjectTitle = e.target.parentElement.dataset.projectTitle;
    delete projects.obj[todoProjectTitle][todoTitle];
  }

  function refresh() {
    clear();
    render(sidebar.getCurrentProject());
  }

  function addContainerEventListeners() {
    const containers = document.querySelectorAll('.container');
    containers.forEach((container) => {
      container.addEventListener('click', handleContainerClick);
      container.addEventListener('mouseover', (e) => e.currentTarget.classList.add('opacity-80'));
      container.addEventListener('mouseout', (e) => e.currentTarget.classList.remove('opacity-80'));
    });
  }

  function handleContainerClick(e) {
    const todoTitle = e.currentTarget.dataset.title;
    const todoProjectTitle = e.currentTarget.dataset.projectTitle;
    const todo = projects.obj[todoProjectTitle][todoTitle];
    expandedView.render(todo);
  }

  function clear() {
    const contentDiv = document.querySelector('.content');
    contentDiv.innerHTML = '';
  }

  return { render, clear, refresh };
})();

const sidebar = (function () {
  let currentProject = 'view all';
  function getCurrentProject() {
    return currentProject;
  }
  function setCurrentProject(value) {
    currentProject = value;
  }

  function render() {
    Object.keys(projects.obj).forEach((key) => {
      const projectLinksDiv = document.querySelector('.project-links');
      const projectLink = document.createElement('a');
      projectLink.classList.add('project-link');
      projectLink.textContent = key;
      projectLinksDiv.appendChild(projectLink);
    });

    addProjectEventListeners();
  }

  function addProjectEventListeners() {
    const projectLinks = document.querySelectorAll('.sidebar a');
    projectLinks.forEach((link) => link.addEventListener('click', handleProjectLinkClick));
  }

  function handleProjectLinkClick(e) {
    content.clear();

    const projectTitle = e.target.innerText;
    setCurrentProject(projectTitle);

    content.render();
  }

  (function addEventListenerAddBtn() {
    const addBtn = document.querySelector('.add-btn');
    addBtn.addEventListener('click', handleAddBtnClick);
  })();

  function handleAddBtnClick() {
    addDiv.toggleAddDiv();
  }

  (function addEventListenerAddProjectBtn() {
    const addProjectBtn = document.querySelector('.add-project-btn');
    addProjectBtn.addEventListener('click', handleAddProjectBtnClick);
  })();

  function handleAddProjectBtnClick() {
    const projectTitle = prompt('what do you want to name a new project?');
    if (!projectTitle) return;

    projects.create(projectTitle);
    clearProjectLinks();
    render();
    save.set();
  }

  function clearProjectLinks() {
    const projectLinksDiv = document.querySelector('.project-links');
    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach((link) => projectLinksDiv.removeChild(link));
  }

  return { render, addProjectEventListeners, getCurrentProject };
})();

const expandedView = (function () {
  const expandedDiv = document.querySelector('.expanded');
  const titleHeader = expandedDiv.querySelector('.todo-title');
  const descriptionTextarea = expandedDiv.querySelector('.todo-description');
  const dueDateDateInput = expandedDiv.querySelector('.todo-due-date-date');
  const dueDateTimeInput = expandedDiv.querySelector('.todo-due-date-time');
  const priorityInput = expandedDiv.querySelector('.todo-priority-select');
  const projectInput = expandedDiv.querySelector('.todo-project-select');

  function toggleHidden() {
    const fullDiv = document.querySelector('.full');
    const expandedDiv = document.querySelector('.expanded');
    fullDiv.classList.toggle('hidden');
    expandedDiv.classList.toggle('hidden');
    content.refresh();
  }

  let currProjectTitle;

  function render(todo) {
    toggleHidden();

    titleHeader.textContent = todo.title;
    descriptionTextarea.value = todo.description;
    dueDateDateInput.value = todo.dueDateDate;
    dueDateTimeInput.value = todo.dueDateTime;
    priorityInput.value = todo.priority;

    refreshProjectDropdownOptions();
    currProjectTitle = todo.projectTitle;
    projectInput.value = currProjectTitle;
  }

  (function addInputEventListeners() {
    const expandedDiv = document.querySelector('.expanded');
    const inputs = expandedDiv.querySelectorAll('.input');
    inputs.forEach(input => input.addEventListener('input', handleInputChange));
  })();

  function handleInputChange(e) {
    const todoTitle = titleHeader.textContent;
    const input = e.currentTarget;
    const property = input.dataset.property;
    const todo = projects.obj[currProjectTitle][todoTitle];
    todo[property] = input.value;

    if (e.currentTarget.dataset.property === 'projectTitle') {
      todo.moveTodo();
      delete projects.obj[currProjectTitle][todoTitle];
      currProjectTitle = input.value;
    }

    save.set();
  }

  (function AddExitBtnEventListener() {
    const exitBtn = document.querySelector('.exit-btn');
    exitBtn.addEventListener('click', toggleHidden);
  })();

  function refreshProjectDropdownOptions() {
    clearProjectDropdownOptions();
    addProjectDropdownOptions();
  }

  function addProjectDropdownOptions() {
    const dropdown = document.querySelector('.todo-project-select');
    Object.keys(projects.obj).forEach((project) => {
      const option = document.createElement('option');
      option.value = project;
      option.textContent = project;
      dropdown.appendChild(option);
    });
  }

  function clearProjectDropdownOptions() {
    const dropdown = document.querySelector('.todo-project-select');
    dropdown.innerHTML = '';
  }

  return { render };
})();

sidebar.render();

content.render('view all');
