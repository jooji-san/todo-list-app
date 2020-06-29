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

  (function addProjectDropdownOptions() {
    const dropdown = document.querySelector('#project-select');
    Object.keys(projects.obj).forEach((project) => {
      const option = document.createElement('option');
      option.value = project;
      option.textContent = project;
      dropdown.appendChild(option);
    });
  })();

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
  }

  return { toggleAddDiv };
})();

const content = (function () {
  (function addSortInputEventListeners() {
    const propertyInput = document.querySelector('#sort-property');
    const directionInput = document.querySelector('#sort-direction');

    propertyInput.addEventListener('input', refresh);
    directionInput.addEventListener('input', refresh);
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

  function render() {
    save.set();

    let valuesModified;
    const currProjectTitle = sidebar.getCurrentProject();
    console.log(currProjectTitle)
    if (currProjectTitle === 'view all') {
      valuesModified = getSortedValuesAll();
    } else if (currProjectTitle === 'today') {
      console.log('hehe')
      valuesModified = projects.filterToday(getSortedValuesAll());
    } else {
      const currProjectValues = Object.values(projects.obj[currProjectTitle]);
      valuesModified = getSortedValues(currProjectValues);
    }

    valuesModified.forEach((todo) => {
      renderContainer(todo.title, todo.projectTitle);
      renderContainerContent(todo.title, todo.dueDateDate, todo.priority);
      addContainerEventListeners();
    });
  }

  function renderContainer(todoTitle, todoProjectTitle) {
    const contentDiv = document.querySelector('.content');

    const container = document.createElement('div');
    container.classList.add('container');
    container.dataset.title = todoTitle;
    container.dataset.projectTitle = todoProjectTitle;

    contentDiv.appendChild(container);
  }

  function renderContainerContent(todoTitle, todoDueDateDate, todoPriority) {
    const container = document.querySelector(`[data-title="${todoTitle}"]`);

    container.classList.add(todoPriority);

    insertCompleteCheckbox(container);
    insertTitle(container, todoTitle);
    insertDueDateDate(container, todoDueDateDate);
    insertDeleteBtn(container);
  }

  function insertCompleteCheckbox(container) {
    const completeCheckbox = document.createElement('input');
    completeCheckbox.type = 'checkbox';
    completeCheckbox.addEventListener('click', handleCompleteCheckboxClick);
    container.appendChild(completeCheckbox);
  }

  function handleCompleteCheckboxClick(e) {
    e.stopPropagation();

    const todo = findTodoWithEvent(e);
    todo.completed = todo.completed ? false : true;

    const container = e.target.parentElement;
    container.classList.toggle('completed');
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

  function insertDueDateDate(container, todoDueDateDate) {
    const dueDateDateElement = document.createElement('p');

    const todoDueDateDateISO = parseISO(todoDueDateDate);
    if (isToday(todoDueDateDateISO)) {
      let dueDateDateWithoutSuffix = formatDistanceToNowStrict(todoDueDateDateISO, { locale: ka });
      dueDateDateWithoutSuffix = dueDateDateWithoutSuffix.slice(0, -1);

      todoDueDateDate = isFuture(todoDueDateDateISO)
        ? `${dueDateDateWithoutSuffix}ში`
        : `${dueDateDateWithoutSuffix}ის წინ`;
    }

    dueDateDateElement.textContent = todoDueDateDate;

    container.appendChild(dueDateDateElement);
  }

  function insertDeleteBtn(container) {
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'delete';
    deleteBtn.addEventListener('click', handleDeleteBtn);
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
  }

  function clearProjectLinks() {
    const nav = document.querySelector('nav');
    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach((link) => nav.removeChild(link));
  }

  return { render, addProjectEventListeners, getCurrentProject };
})();

const expandedView = (function () {
  function toggleHidden() {
    const fullDiv = document.querySelector('.full');
    const expandedDiv = document.querySelector('.expanded');
    fullDiv.classList.toggle('hidden');
    expandedDiv.classList.toggle('hidden');
  }

  function render(todo) {
    toggleHidden();

    const expandedDiv = document.querySelector('.expanded');

    const titleHeader = expandedDiv.querySelector('.todo-title');
    const descriptionTextarea = expandedDiv.querySelector('.todo-description');
    const dueDateDateHeader = expandedDiv.querySelector('.todo-due-date-date');
    const dueDateTimeHeader = expandedDiv.querySelector('.todo-due-date-time');
    const priorityHeader = expandedDiv.querySelector('.todo-priority');
    const projectHeader = expandedDiv.querySelector('.todo-project');

    titleHeader.textContent = todo.title;
    descriptionTextarea.value = todo.description;
    dueDateDateHeader.value = todo.dueDateDate;
    dueDateTimeHeader.value = todo.dueDateTime;
    priorityHeader.textContent = `Priority: ${todo.priority.split('-')[1]}`;
    projectHeader.textContent = `Project: ${todo.projectTitle}`;
  }

  (function listenForTextareaValueChange() {
    const textarea = document.querySelector('textarea');
    textarea.addEventListener('input', handleTextareaChange);
  })();

  function handleTextareaChange(e) {
    save.set();

    const parentElement = e.target.parentElement;
    const todoTitleHeader = parentElement.querySelector('.todo-title');
    const projectHeader = parentElement.querySelector('.todo-project');
    const textarea = parentElement.querySelector('textarea');

    const todoTitle = todoTitleHeader.textContent;
    let project = projectHeader.textContent;
    project = project.split(' ').slice(1).join(' ');
    const todo = projects.obj[project][todoTitle];

    todo.description = textarea.value;
  }

  (function AddExitBtnEventListener() {
    const exitBtn = document.querySelector('.exit-btn');
    exitBtn.addEventListener('click', toggleHidden);
  })();

  return { render };
})();

sidebar.render();
sidebar.addProjectEventListeners();

content.render('view all');
