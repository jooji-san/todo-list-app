import { compareDesc, compareAsc, parseISO, isToday } from "date-fns";

const projects = (() => {
  const obj = {};

  function create(title) {
    if (Object.keys(this.obj).some((key) => key === title)) {
      return;
    }
    this.obj[title] = {};
  }

  function filterToday(arr) {
    const arrFiltered = arr.filter((todo) =>
      isToday(parseISO(todo.dueDateDate))
    );
    return arrFiltered;
  }

  const sort = (() => {
    function sortByCreationDateDesc(arr) {
      arr.sort((a, b) => b.creationDate - a.creationDate);
      return arr;
    }

    function sortByCreationDateAsc(arr) {
      arr.sort((a, b) => a.creationDate - b.creationDate);
      return arr;
    }

    function sortByTitleDesc(arr) {
      arr.sort((a, b) => a.title > b.title);
      return arr;
    }

    function sortByTitleAsc(arr) {
      arr.sort((a, b) => a.title < b.title);
      return arr;
    }

    function sortByDueDateDesc(arr) {
      arr.sort((a, b) =>
        compareDesc(
          parseISO(`${a.dueDateDate} ${a.dueDateTime}`),
          parseISO(`${b.dueDateDate} ${b.dueDateTime}`)
        )
      );
      return arr;
    }

    function sortByDueDateAsc(arr) {
      arr.sort((a, b) =>
        compareAsc(
          parseISO(`${a.dueDateDate} ${a.dueDateTime}`),
          parseISO(`${b.dueDateDate} ${b.dueDateTime}`)
        )
      );
      return arr;
    }

    return {
      sortByCreationDateDesc,
      sortByCreationDateAsc,
      sortByTitleDesc,
      sortByTitleAsc,
      sortByDueDateDesc,
      sortByDueDateAsc,
    };
  })();

  return {
    obj,
    create,
    sort,
    filterToday,
  };
})();

const todos = (() => {
  class Todo {
    constructor(
      title,
      creationDate,
      description,
      dueDateDate,
      dueDateTime,
      priority,
      projectTitle,
      completed = false
    ) {
      this.title = title;
      this.creationDate = creationDate;
      this.description = description;
      this.dueDateDate = dueDateDate;
      this.dueDateTime = dueDateTime;
      this.priority = priority;
      this.projectTitle = projectTitle;
      this.completed = completed;
    }

    moveTodo() {
      projects.obj[this.projectTitle][this.title] = this;
    }
  }

  function create(
    title,
    description,
    dueDateDate,
    dueDateTime,
    priority,
    projectTitle,
    completed
  ) {
    const creationDate = Date.now();
    const todo = new Todo(
      title,
      creationDate,
      description,
      dueDateDate,
      dueDateTime,
      priority,
      projectTitle,
      completed
    );
    todo.moveTodo();
  }

  return { create };
})();

const save = (() => {
  function get() {
    projects.obj = JSON.parse(localStorage.getItem("projects"));
  }

  function set() {
    localStorage.setItem("projects", JSON.stringify(projects.obj));
  }

  function init() {
    if (localStorage.getItem("projects")) {
      get();
    } else {
      set();
    }
  }

  return { init, set };
})();

export { projects, todos, save };
