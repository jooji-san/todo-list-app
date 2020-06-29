export { projects, todos, save };
import { compareDesc, compareAsc, parseISO, isToday } from 'date-fns';

const projects = (function () {
  let obj = {};

  function create(title) {
    if (Object.keys(this.obj).some((key) => key === title)) {
      return;
    }
    this.obj[title] = {};
  }

  function filterToday(arr) {
    const arrFiltered = arr.filter(todo => isToday(parseISO(todo.dueDateDate)));
    return arrFiltered;
  }

  const sort = (function () {
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
      arr.sort((a, b) => {
        compareDesc(parseISO(`${a.dueDateDate} ${a.dueDateTime}`), parseISO(`${b.dueDateDate} ${b.dueDateTime}`));
      });
      return arr;
    }

    function sortByDueDateAsc(arr) {
      arr.sort((a, b) =>
        compareAsc(parseISO(`${a.dueDateDate} ${a.dueDateTime}`), parseISO(`${b.dueDateDate} ${b.dueDateTime}`)),
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

  return { obj, create, sort, filterToday };
})();

const todos = (function () {
  class Todo {
    constructor(title, creationDate, description, dueDateDate, dueDateTime, priority, projectTitle, completed = false) {
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

  function create(title, description, dueDateDate, dueDateTime, priority, projectTitle, completed) {
    const creationDate = Date.now();
    const todo = new Todo(
      title,
      creationDate,
      description,
      dueDateDate,
      dueDateTime,
      priority,
      projectTitle,
      completed,
    );
    todo.moveTodo();
  }

  return { create };
})();

const save = (function () {
  function init() {
    if (localStorage.getItem('projects')) {
      get();
    } else {
      set();
    }
  }

  function get() {
    projects.obj = JSON.parse(localStorage.getItem('projects'));
  }

  function set() {
    localStorage.setItem('projects', JSON.stringify(projects.obj));
  }

  return { init, set };
})();

projects.create('inbox');
projects.create('სწავლა');

todos.create('გარეცხე თეფშები', 'მარტო თეფშები არა. ტაფაც დევს იქ და კიდევ ბევრი ჩანგალი', '2020-06-29', '16:00', 'priority-high', 'inbox');
todos.create('გაფერთხე საბანი', '', '2020-06-29', '23:00', 'priority-middle', 'inbox');
todos.create('ითამაშე ქვიშაში', 'მეგობრებთან ერთად', '2021-01-01', '21:00', 'priority-low', 'inbox');
todos.create('დაიზეპირე ფიზიკის ფორმულები', 'hehehe', '2021-01-01', '20:00', 'priority-high', 'სწავლა');
todos.create('აკენწლე ბურთი ასჯერ', 'hey hey', '2012-02-05', '15:00', 'priority-middle', 'სწავლა');
todos.create('გააკეთე პრეზენტაცია გერმანულში ბითიესზე', 'hey hey', '2012-02-05', '11:00', 'priority-middle', 'სწავლა');

// save.init();

console.log(projects.obj);
