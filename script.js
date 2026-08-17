const books = [
    { title: "Fahrenheit 451", author: "Ray Bradbury", language: "English", type: "Science Fiction", read: true },
    { title: "Cien años de soledad", author: "Gabriel García Márquez", language: "Spanish", type: "Fiction", read: true },
    { title: "The Art of War", author: "Sun Tzu", language: "English", type: "Philosophy", read: true },
    { title: "El principito", author: "Antoine de Saint-Exupéry", language: "Spanish", type: "Fiction", read: true },
    { title: "Sapiens", author: "Yuval Noah Harari", language: "English", type: "Non-fiction", read: false },
    { title: "1984", author: "George Orwell", language: "English", type: "Science Fiction", read: true },
    { title: "Meditations", author: "Marcus Aurelius", language: "English", type: "Philosophy", read: false },
    { title: "2666", author: "Roberto Bolaño", language: "Spanish", type: "Fiction", read: false },
    { title: "One Piece", author: "Eiichiro Oda", language: "Japanese", type: "Manga", read: true },
    { title: "Vagabond", author: "Takehiko Inoue", language: "Japanese", type: "Manga", read: true },
];

let nextBookId = 0;
books.forEach((book) => {
    book.id = nextBookId++;
});

let activeCategory = "all";
let searchTerm = "";

const bookList = document.querySelector("#book-list");
const bookEmptyMessage = document.querySelector("#book-empty-message");
const bookSearch = document.querySelector("#book-search");
const bookCategories = document.querySelector(".book-categories");
const addBookForm = document.querySelector("#add-book-form");

function createBookItem(book) {
    const li = document.createElement("li");
    li.dataset.type = book.type;
    li.dataset.bookId = book.id;
    if (book.read) {
        li.classList.add("read");
    }

    const title = document.createElement("h4");
    title.className = "book-title";
    title.textContent = book.title;

    const meta = document.createElement("p");
    meta.className = "book-meta";
    meta.textContent = `${book.author} — ${book.language} — ${book.type}`;

    const actions = document.createElement("div");
    actions.className = "book-actions";

    const toggleReadButton = document.createElement("button");
    toggleReadButton.type = "button";
    toggleReadButton.dataset.action = "toggle-read";
    toggleReadButton.textContent = book.read ? "Mark unread" : "Mark read";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.dataset.action = "remove";
    removeButton.textContent = "Remove";

    actions.append(toggleReadButton, removeButton);
    li.append(title, meta, actions);

    return li;
}

function passesFilters(book) {
    const matchesCategory = activeCategory === "all" || book.type === activeCategory;
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
        term === "" ||
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
}

function renderBooks() {
    bookList.innerHTML = "";

    const visibleBooks = books.filter(passesFilters);

    visibleBooks.forEach((book) => {
        bookList.appendChild(createBookItem(book));
    });

    bookEmptyMessage.hidden = visibleBooks.length > 0;
}

function renderCategoryButtons() {
    const types = Array.from(new Set(books.map((book) => book.type))).sort();

    bookCategories.querySelectorAll("[data-type]:not([data-type='all'])").forEach((button) => {
        button.remove();
    });

    types.forEach((type) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "category-filter";
        button.dataset.type = type;
        button.setAttribute("aria-pressed", type === activeCategory ? "true" : "false");
        button.textContent = type;
        bookCategories.appendChild(button);
    });
}

function setActiveCategory(type) {
    activeCategory = type;
    bookCategories.querySelectorAll("[data-type]").forEach((button) => {
        button.setAttribute("aria-pressed", button.dataset.type === activeCategory ? "true" : "false");
    });
    renderBooks();
}

bookSearch.addEventListener("input", (event) => {
    searchTerm = event.target.value;
    renderBooks();
});

bookCategories.addEventListener("click", (event) => {
    const button = event.target.closest("[data-type]");
    if (!button) return;
    setActiveCategory(button.dataset.type);
});

bookList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const item = button.closest("li");
    const bookId = Number(item.dataset.bookId);
    const index = books.findIndex((book) => book.id === bookId);
    if (index === -1) return;

    if (button.dataset.action === "remove") {
        books.splice(index, 1);
        renderCategoryButtons();
        renderBooks();
    } else if (button.dataset.action === "toggle-read") {
        books[index].read = !books[index].read;
        renderBooks();
    }
});

addBookForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.querySelector("#book-title").value.trim();
    const author = document.querySelector("#book-author").value.trim();
    const language = document.querySelector("#book-language").value.trim();
    const type = document.querySelector("#book-type").value.trim();

    if (!title || !author || !language || !type) return;

    books.push({ id: nextBookId++, title, author, language, type, read: false });
    renderCategoryButtons();
    renderBooks();
    addBookForm.reset();
});

renderCategoryButtons();
renderBooks();

const contactForm = document.querySelector("#contact-form");
const contactSuccess = document.querySelector("#contact-success");

const contactFields = {
    name: {
        input: document.querySelector("#name"),
        error: document.querySelector("#name-error"),
        validate: (value) => (value.trim() === "" ? "Please enter your name." : ""),
    },
    email: {
        input: document.querySelector("#email"),
        error: document.querySelector("#email-error"),
        validate: (value) => {
            if (value.trim() === "") return "Please enter your email.";
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address.";
            return "";
        },
    },
    message: {
        input: document.querySelector("#message"),
        error: document.querySelector("#message-error"),
        validate: (value) => (value.trim() === "" ? "Please enter a message." : ""),
    },
};

function showFieldError(field, message) {
    field.error.textContent = message;
    if (message) {
        field.input.setAttribute("aria-describedby", field.error.id);
        field.input.setAttribute("aria-invalid", "true");
    } else {
        field.input.removeAttribute("aria-describedby");
        field.input.removeAttribute("aria-invalid");
    }
}

function validateField(field) {
    const message = field.validate(field.input.value);
    showFieldError(field, message);
    return message === "";
}

Object.values(contactFields).forEach((field) => {
    field.input.addEventListener("input", () => {
        if (field.error.textContent) {
            validateField(field);
        }
    });
});

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    contactSuccess.hidden = true;

    const results = Object.values(contactFields).map(validateField);
    const allValid = results.every(Boolean);

    if (allValid) {
        contactSuccess.hidden = false;
        contactForm.reset();
    }
});

const themeToggle = document.querySelector("#theme-toggle");

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
});
