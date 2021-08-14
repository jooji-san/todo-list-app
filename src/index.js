import "normalize.css";
import { projects, todos } from "./functionality";
import { sidebar, content } from "./dom";

projects.create("inbox");
projects.create("study");

todos.create(
  "wash the plates",
  "not only the plates, there also a dirty pot",
  "2020-06-29",
  "16:00",
  "priority-high",
  "inbox"
);
todos.create(
  "do laundries",
  "",
  "2020-06-29",
  "23:00",
  "priority-middle",
  "inbox"
);
todos.create(
  "play in the sand",
  "along with friends",
  "2021-01-01",
  "21:00",
  "priority-low",
  "inbox"
);
todos.create(
  "learn physics formulas by heart",
  "hehehe",
  "2021-01-01",
  "20:00",
  "priority-high",
  "study"
);
todos.create(
  "build a new pc",
  "when the shortages will stop",
  "2012-02-05",
  "15:00",
  "priority-middle",
  "study"
);
todos.create(
  "do a presentation about BTS",
  "for my German lessons",
  "2012-02-05",
  "11:00",
  "priority-middle",
  "study"
);

// save.init();

sidebar.render();

content.render("view all");
