// 할 일 화면의 시작 파일입니다.
// 실행: 저장소 루트에서 npm run dev:todo-client (http://localhost:5173)
import "./style.css";
import { createTodo, deleteTodo, getTodos, updateTodo, type Todo } from "./api.js";

// id로 요소를 찾고, 없으면 바로 오류를 내서 index.html과 id가 어긋난 것을 알려 줍니다.
function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`#${id} 요소를 찾을 수 없습니다`);
  return element as T;
}

const elements = {
  todoForm: getElement<HTMLFormElement>("todo-form"),
  todoInput: getElement<HTMLInputElement>("todo-input"),
  dueDateInput: getElement<HTMLInputElement>("due-date-input"),
  addButton: getElement<HTMLButtonElement>("add-button"),
  clearButton: getElement<HTMLButtonElement>("clear-button"),
  todoContainer: getElement<HTMLUListElement>("todo-container"),
  itemsLeft: getElement<HTMLSpanElement>("items-left"),
  clearCompleted: getElement<HTMLButtonElement>("clear-completed"),
  errorPopup: getElement<HTMLDivElement>("error-popup"),
  errorMessage: getElement<HTMLSpanElement>("error-message"),
  errorClose: getElement<HTMLButtonElement>("error-close"),
};

type Filter = "all" | "active" | "completed";

// 필터 버튼과 서버에 보낼 completed 값
const filterButtons: Record<Filter, HTMLButtonElement> = {
  all: getElement<HTMLButtonElement>("filter-all"),
  active: getElement<HTMLButtonElement>("filter-active"),
  completed: getElement<HTMLButtonElement>("filter-completed"),
};
const filterQuery: Record<Filter, boolean | undefined> = {
  all: undefined,
  active: false,
  completed: true,
};

// 화면 상태: todos는 현재 필터로 서버가 거른 목록, allTodos는 남은 개수·완료 삭제에 쓰는 전체 목록
let todos: Todo[] = [];
let allTodos: Todo[] = [];
let currentFilter: Filter = "all";
let pending = false;

// ---------- 렌더링 ----------

// 서버에서 현재 필터 목록과 전체 목록을 다시 받아 그립니다. (화면에서 거르지 않음)
// 실패해도 render()로 화면을 마지막 상태로 되돌림
async function refresh(): Promise<void> {
  try {
    const completed = filterQuery[currentFilter];
    // '전체'면 두 목록이 같으므로 한 번만 요청
    [todos, allTodos] =
      completed === undefined
        ? await getTodos().then((list) => [list, list])
        : await Promise.all([getTodos(completed), getTodos()]);
  } catch (error) {
    showError(toMessage(error));
  }
  render();
}

function render(): void {
  elements.todoContainer.replaceChildren(...todos.map(createTodoItem));
  updateItemsLeft();
}

// 할 일 한 줄: 체크박스, 제목, 마감일, 삭제 버튼 (제목은 textContent로 넣어 HTML로 해석되지 않게 함)
function createTodoItem(todo: Todo): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "todo-item";
  item.dataset.id = todo.id;
  item.classList.toggle("completed", todo.completed);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-toggle";
  checkbox.checked = todo.completed;
  checkbox.disabled = pending;

  const title = document.createElement("span");
  title.className = "todo-title";
  title.textContent = todo.title;

  // 마감일: 지났으면 빨간색(overdue), 아니면 초록색, 없으면 빈 칸
  const dueDate = document.createElement("span");
  dueDate.className = "todo-due-date";
  if (todo.dueDate) {
    dueDate.textContent = todo.dueDate;
    dueDate.classList.toggle("overdue", isOverdue(todo.dueDate));
  }

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "btn btn-danger todo-delete";
  deleteButton.textContent = "삭제";
  deleteButton.disabled = pending;

  item.append(checkbox, title, dueDate, deleteButton);
  return item;
}

// 오늘(브라우저 날짜)보다 이전이면 true. YYYY-MM-DD는 문자열 비교로 순서가 맞음
function isOverdue(dueDate: string): boolean {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return dueDate < `${now.getFullYear()}-${month}-${day}`;
}

function updateItemsLeft(): void {
  // 필터와 관계없이 전체 기준
  const count = allTodos.filter((todo) => !todo.completed).length;
  elements.itemsLeft.textContent = `${count} ${count === 1 ? "item" : "items"} left`;
}

function showError(message: string): void {
  elements.errorMessage.textContent = message;
  elements.errorPopup.hidden = false;
}

function hideError(): void {
  elements.errorPopup.hidden = true;
}

// 잡은 오류를 팝업 문구로 바꿉니다.
function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
}

// ---------- 요청 처리 ----------

// 요청 중에는 서버 요청을 일으키는 버튼과 체크박스를 모두 비활성화합니다.
function setPending(value: boolean): void {
  pending = value;
  const controls = [
    elements.addButton,
    elements.clearCompleted,
    ...Object.values(filterButtons),
    ...elements.todoContainer.querySelectorAll<HTMLButtonElement | HTMLInputElement>("button, input"),
  ];
  for (const control of controls) control.disabled = value;
}

// 요청은 한 번에 하나만: 요청 중이면 무시하고, 끝나면 성공·실패와 관계없이 목록을 다시 조회합니다.
async function runRequest(task: () => Promise<void>): Promise<void> {
  if (pending) return;
  setPending(true);
  try {
    await task();
  } catch (error) {
    showError(toMessage(error));
  }
  await refresh();
  setPending(false);
}

// ---------- 이벤트 처리 ----------

async function handleAdd(): Promise<void> {
  const title = elements.todoInput.value;
  // 빈 입력은 서버에 보내지 않고 바로 알림
  if (title.trim() === "") {
    showError("할 일을 입력하세요");
    elements.todoInput.focus();
    return;
  }
  // 날짜를 고르지 않으면 value가 빈 문자열이므로 null로 보냄
  const dueDate = elements.dueDateInput.value || null;
  await runRequest(async () => {
    await createTodo(title, dueDate);
    elements.todoInput.value = "";
    elements.dueDateInput.value = "";
    hideError();
  });
}

function handleClear(): void {
  elements.todoInput.value = "";
  elements.dueDateInput.value = "";
  elements.todoInput.focus();
}

async function handleToggle(id: string, completed: boolean): Promise<void> {
  await runRequest(async () => {
    await updateTodo(id, { completed });
  });
}

async function handleDelete(id: string): Promise<void> {
  await runRequest(async () => {
    await deleteTodo(id);
  });
}

// 필터와 관계없이 완료 항목을 모두 지움: 하나가 실패해도 나머지는 지우고, 첫 오류를 팝업으로 알림
async function handleClearCompleted(): Promise<void> {
  await runRequest(async () => {
    const completed = allTodos.filter((todo) => todo.completed);
    const results = await Promise.allSettled(completed.map((todo) => deleteTodo(todo.id)));
    const failed = results.find((result) => result.status === "rejected");
    if (failed) throw failed.reason;
  });
}

// 필터를 바꾸고 선택 버튼을 강조한 뒤 그 필터로 다시 조회합니다. (refresh는 runRequest가 호출)
async function setFilter(filter: Filter): Promise<void> {
  await runRequest(async () => {
    currentFilter = filter;
    for (const [key, button] of Object.entries(filterButtons)) {
      button.classList.toggle("selected", key === filter);
    }
  });
}

// 목록 안에서 일어난 이벤트가 어느 할 일의 것인지 찾습니다.
function getTodoId(target: EventTarget | null): string | undefined {
  if (!(target instanceof HTMLElement)) return undefined;
  return target.closest<HTMLLIElement>(".todo-item")?.dataset.id;
}

async function init(): Promise<void> {
  // Add 클릭과 입력창 Enter 모두 폼 제출로 처리 (페이지 이동은 막음)
  elements.todoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void handleAdd();
  });
  elements.clearButton.addEventListener("click", handleClear);
  elements.clearCompleted.addEventListener("click", () => void handleClearCompleted());
  elements.errorClose.addEventListener("click", hideError);

  // 목록은 이벤트 위임: 항목이 다시 그려져도 리스너를 새로 달 필요가 없음
  elements.todoContainer.addEventListener("change", (event) => {
    const id = getTodoId(event.target);
    if (id && event.target instanceof HTMLInputElement) void handleToggle(id, event.target.checked);
  });
  elements.todoContainer.addEventListener("click", (event) => {
    const id = getTodoId(event.target);
    if (id && event.target instanceof HTMLElement && event.target.closest(".todo-delete")) void handleDelete(id);
  });

  filterButtons.all.addEventListener("click", () => void setFilter("all"));
  filterButtons.active.addEventListener("click", () => void setFilter("active"));
  filterButtons.completed.addEventListener("click", () => void setFilter("completed"));

  setPending(true);
  await refresh();
  setPending(false);
}

void init();
