const projects = [
  {
    title: "Проект «Лазарь»",
    type: "Космическая навигация",
    description: "Построение маршрутов и подготовка дальних межзвёздных экспедиций.",
    image: "./assets/lazarus.png",
    port: 5182,
    category: "research"
  },
  {
    title: "Архив Kings",
    type: "Закрытая организация",
    description: "Оперативные досье, протоколы допуска и история лучших агентов.",
    image: "./assets/kings.png",
    port: 5183,
    category: "corporate"
  },
  {
    title: "Бюро Мориарти",
    type: "Аналитическое бюро",
    description: "Интеллектуальные расследования и системный анализ сложных дел.",
    image: "./assets/moriarty.png",
    port: 5184,
    category: "corporate"
  },
  {
    title: "Vern",
    type: "Исследовательская экспедиция",
    description: "Научный проект о путешествиях, открытиях и неизведанных территориях.",
    image: "./assets/vern.png",
    port: 5185,
    category: "research"
  },
  {
    title: "Abstergo Industries",
    type: "Нейротехнологии",
    description: "Программа ANIMUS и доступ к генетической памяти человечества.",
    image: "./assets/abstergo.png",
    port: 5186,
    category: "corporate research"
  },
  {
    title: "Парадокс 3.0",
    type: "Институт парадоксов",
    description: "Закрытый протокол исследования альтернативных моделей реальности.",
    image: "./assets/paradox.jpg",
    port: 5187,
    category: "research"
  },
  {
    title: "Umbrella",
    type: "Биотехнологическая корпорация",
    description: "Исследовательская программа в области вирусологии и биозащиты.",
    image: "./assets/umbrella.png",
    port: 5188,
    category: "corporate research"
  },
  {
    title: "Корпорация монстров",
    type: "Энергетическая компания",
    description: "Главная энергетическая инфраструктура города Монстрополиса.",
    image: "./assets/monsters.png",
    port: 5189,
    category: "corporate"
  },
  {
    title: "Oscorp Industries",
    type: "Глобальная корпорация",
    description: "Биоинженерия, искусственный интеллект и технологии будущего.",
    image: "./assets/oscorp.png",
    port: 5190,
    category: "corporate research"
  }
];

const grid = document.querySelector("#project-grid");
const template = document.querySelector("#project-template");
const host = window.location.hostname || "127.0.0.1";

projects.forEach((project, index) => {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector(".project-card");
  const media = fragment.querySelector(".project-media");
  const link = fragment.querySelector(".project-link");
  const image = fragment.querySelector("img");
  const url = `http://${host}:${project.port}/`;

  card.dataset.category = project.category;
  media.href = url;
  link.href = url;
  image.src = project.image;
  image.alt = `Превью проекта «${project.title}»`;
  fragment.querySelector(".project-number").textContent = String(index + 1).padStart(2, "0");
  fragment.querySelector(".project-type").textContent = project.type;
  fragment.querySelector("h3").textContent = project.title;
  fragment.querySelector(".project-description").textContent = project.description;
  grid.append(fragment);

  checkAvailability(card, url);
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".filter.is-active")?.classList.remove("is-active");
    button.classList.add("is-active");
    const filter = button.dataset.filter;
    document.querySelectorAll(".project-card").forEach((card) => {
      card.classList.toggle("is-hidden", filter !== "all" && !card.dataset.category.includes(filter));
    });
  });
});

async function checkAvailability(card, url) {
  const badge = card.querySelector(".availability");
  const label = badge.querySelector("b");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2200);

  try {
    await fetch(url, { mode: "no-cors", cache: "no-store", signal: controller.signal });
    badge.classList.add("is-online");
    label.textContent = "Сайт запущен";
  } catch {
    badge.classList.add("is-offline");
    label.textContent = "Сервер выключен";
  } finally {
    clearTimeout(timer);
  }
}
