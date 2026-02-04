const RecipeApp = (function () {
  // =========================
  // 1) DATA (recipes)
  // =========================
  const recipes = [
    {
      id: 1,
      title: "Spaghetti Bolognese",
      category: "Dinner",
      time: 45,
      ingredients: [
        "Spaghetti",
        "Ground beef",
        "Tomato sauce",
        "Onion",
        "Garlic",
        "Olive oil",
        "Salt + pepper"
      ],
      steps: [
        "Boil water and cook spaghetti until al dente.",
        "Heat olive oil in a pan.",
        [
          "Add onion and garlic.",
          "Sauté until soft (2–3 minutes).",
          "Add ground beef and cook until browned."
        ],
        "Pour in tomato sauce and simmer 15 minutes.",
        "Serve sauce over spaghetti."
      ]
    },
    {
      id: 2,
      title: "Chicken Salad",
      category: "Lunch",
      time: 15,
      ingredients: [
        "Cooked chicken",
        "Lettuce",
        "Tomatoes",
        "Cucumber",
        "Olive oil",
        "Lemon juice",
        "Salt"
      ],
      steps: [
        "Wash and chop vegetables.",
        "Slice chicken into bite-sized pieces.",
        "Mix everything in a bowl.",
        "Add olive oil, lemon juice, and salt.",
        "Toss and serve."
      ]
    },
    {
      id: 3,
      title: "Pancakes",
      category: "Breakfast",
      time: 20,
      ingredients: [
        "Flour",
        "Milk",
        "Eggs",
        "Baking powder",
        "Sugar",
        "Butter"
      ],
      steps: [
        "Mix dry ingredients in a bowl.",
        [
          "Add milk and eggs.",
          "Whisk until smooth.",
          [
            "If batter is too thick, add a little more milk.",
            "If too thin, add a little flour."
          ]
        ],
        "Heat pan and melt butter.",
        "Pour batter and cook both sides until golden.",
        "Serve with syrup or fruit."
      ]
    },
    {
      id: 4,
      title: "Grilled Cheese Sandwich",
      category: "Snack",
      time: 10,
      ingredients: [
        "Bread slices",
        "Cheese slices",
        "Butter"
      ],
      steps: [
        "Butter the bread on one side.",
        "Place cheese between bread slices.",
        "Cook in pan until golden on both sides.",
        "Serve hot."
      ]
    }
  ];

  // =========================
  // 2) DOM references
  // =========================
  let recipeContainer;
  let categoryFilter;
  let sortSelect;
  let searchInput;

  // =========================
  // 3) RECURSION: renderSteps
  // =========================
  function renderSteps(steps) {
    let html = "<ol>";

    for (let step of steps) {
      if (Array.isArray(step)) {
        // nested steps -> recursion
        html += `<li>${renderSteps(step)}</li>`;
      } else {
        html += `<li>${step}</li>`;
      }
    }

    html += "</ol>";
    return html;
  }

  // =========================
  // 4) Render recipes
  // =========================
  function renderRecipes(list) {
    recipeContainer.innerHTML = list
      .map((recipe) => {
        return `
          <div class="recipe-card" data-id="${recipe.id}">
            <h3>${recipe.title}</h3>
            <p class="recipe-meta">${recipe.category} • ${recipe.time} mins</p>

            <div class="card-actions">
              <button data-action="toggle-steps">Show Steps</button>
              <button data-action="toggle-ingredients">Show Ingredients</button>
            </div>

            <div class="recipe-details">
              <div class="steps hidden">
                <h4>Steps</h4>
                ${renderSteps(recipe.steps)}
              </div>

              <div class="ingredients hidden">
                <h4>Ingredients</h4>
                <ul>
                  ${recipe.ingredients.map((i) => `<li>${i}</li>`).join("")}
                </ul>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // =========================
  // 5) Filtering + Sorting
  // =========================
  function getFilteredAndSortedRecipes() {
    let filtered = [...recipes];

    // Category filter
    const categoryValue = categoryFilter.value;
    if (categoryValue !== "All") {
      filtered = filtered.filter((r) => r.category === categoryValue);
    }

    // Search filter
    const query = searchInput.value.trim().toLowerCase();
    if (query.length > 0) {
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(query)
      );
    }

    // Sorting
    const sortValue = sortSelect.value;

    if (sortValue === "time-asc") {
      filtered.sort((a, b) => a.time - b.time);
    } else if (sortValue === "time-desc") {
      filtered.sort((a, b) => b.time - a.time);
    } else if (sortValue === "title-asc") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortValue === "title-desc") {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }

    return filtered;
  }

  function updateUI() {
    const list = getFilteredAndSortedRecipes();
    renderRecipes(list);
  }

  // =========================
  // 6) Event Delegation for toggles
  // =========================
  function setupEventDelegation() {
    recipeContainer.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (!action) return;

      const card = e.target.closest(".recipe-card");
      if (!card) return;

      if (action === "toggle-steps") {
        const stepsDiv = card.querySelector(".steps");
        stepsDiv.classList.toggle("hidden");

        e.target.textContent = stepsDiv.classList.contains("hidden")
          ? "Show Steps"
          : "Hide Steps";
      }

      if (action === "toggle-ingredients") {
        const ingDiv = card.querySelector(".ingredients");
        ingDiv.classList.toggle("hidden");

        e.target.textContent = ingDiv.classList.contains("hidden")
          ? "Show Ingredients"
          : "Hide Ingredients";
      }
    });
  }

  // =========================
  // 7) Setup filter/sort listeners
  // =========================
  function setupControls() {
    categoryFilter.addEventListener("change", updateUI);
    sortSelect.addEventListener("change", updateUI);
    searchInput.addEventListener("input", updateUI);
  }

  // =========================
  // 8) Init
  // =========================
  function init() {
    recipeContainer = document.querySelector("#recipe-container");
    categoryFilter = document.querySelector("#categoryFilter");
    sortSelect = document.querySelector("#sortSelect");
    searchInput = document.querySelector("#searchInput");

    if (!recipeContainer) {
      console.error("Missing #recipe-container in HTML");
      return;
    }

    setupControls();
    setupEventDelegation();
    updateUI();
  }

  // expose only init
  return { init };
})();

// Run app
document.addEventListener("DOMContentLoaded", () => {
  RecipeApp.init();
});
