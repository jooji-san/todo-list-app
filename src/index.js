import "normalize.css";
import { projects, todos } from "./functionality";
import { sidebar, content } from "./dom";

projects.create("inbox");
projects.create("სწავლა");

todos.create(
  "გარეცხე თეფშები",
  "მარტო თეფშები არა. ტაფაც დევს იქ და კიდევ ბევრი ჩანგალი",
  "2020-06-29",
  "16:00",
  "priority-high",
  "inbox"
);
todos.create(
  "გაფერთხე საბანი",
  "",
  "2020-06-29",
  "23:00",
  "priority-middle",
  "inbox"
);
todos.create(
  "ითამაშე ქვიშაში",
  "მეგობრებთან ერთად",
  "2021-01-01",
  "21:00",
  "priority-low",
  "inbox"
);
todos.create(
  "დაიზეპირე ფიზიკის ფორმულები",
  "hehehe",
  "2021-01-01",
  "20:00",
  "priority-high",
  "სწავლა"
);
todos.create(
  "აკენწლე ბურთი ასჯერ",
  "hey hey",
  "2012-02-05",
  "15:00",
  "priority-middle",
  "სწავლა"
);
todos.create(
  "გააკეთე პრეზენტაცია გერმანულში ბითიესზე",
  "hey hey",
  "2012-02-05",
  "11:00",
  "priority-middle",
  "სწავლა"
);

// save.init();

sidebar.render();

content.render("view all");
