const gameList = document.querySelector(".game-list");
const titleText = document.querySelector(".games__display--title");
const resultsCount = document.querySelector(".games__count");
const filterTitles = document.querySelectorAll(".filter__title");
const clearFiltersBtn = document.querySelector(".clear-filters__btn");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.querySelector(".clear-search__btn");
const sortBtn = document.getElementById("sort-filter");
const dropdownMenu = document.querySelector(".dropdown-content");
let page = 1;
let isLoading = false;
let allGames = [];
let searchQuery = "";
let filters = {
  releaseYears: [],
  platforms: [],
  genres: [],
};
let platformsList = [];
const apiUrl =
  "https://api.rawg.io/api/games?key=58ee01e52ce14968a6c26b86c06b3f2b";

searchInput.addEventListener("input", () => {
  clearSearchBtn.style.display =
    searchInput.value.length > 0 ? "block" : "none";
});

clearSearchBtn.addEventListener("click", (event) => {
  event.preventDefault();
  searchInput.value = "";
  clearSearchBtn.style.display = "none";
  searchInput.focus();
});

searchForm.addEventListener("submit", () => {
  searchInput.blur();
});

sortBtn.addEventListener("click", function() {
  dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
  if (dropdownMenu.style.display === "block") {
    sortBtn.style.borderBottomLeftRadius = "0px";
    sortBtn.style.borderBottomRightRadius = "0px";
  } else {
    sortBtn.style.borderBottomLeftRadius = "5px";
    sortBtn.style.borderBottomRightRadius = "5px";
  }
});

document.addEventListener("click", function(event) {
  if (!sortBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
    dropdownMenu.style.display = "none";
    sortBtn.style.borderBottomLeftRadius = "5px";
    sortBtn.style.borderBottomRightRadius = "5px";
  }
});

filterTitles.forEach((title) => {
  title.addEventListener("click", () => {
    const filterContent = document.getElementById(title.dataset.toggle);
    if (!filterContent.classList.contains("expanded")) {
      filterContent.style.height = `${filterContent.scrollHeight}px`;
      filterContent.classList.add("expanded");
      title.classList.add("active");
    } else {
      filterContent.style.height = "0px";
      filterContent.classList.remove("expanded");
      title.classList.remove("active");
    }
  });
});

document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    updateFilters();
    page = 1;
    allGames = [];
    gameList.innerHTML = "";
    loadGames();
  });
});

async function fetchPlatforms() {
  const response = await fetch(
    `https://api.rawg.io/api/platforms?key=58ee01e52ce14968a6c26b86c06b3f2b`
  );
  const platformData = await response.json();
  return platformData.results;
}

async function fetchGenres() {
  const response = await fetch(
    `https://api.rawg.io/api/genres?key=58ee01e52ce14968a6c26b86c06b3f2b`
  );
  const genreData = await response.json();
  return genreData.results;
}

async function populateFilters() {
  const platforms = await fetchPlatforms();
  const genres = await fetchGenres();
  addFiltersToContainer(platforms, "platform", "platforms");
  addFiltersToContainer(genres, "genre", "genres");
}

function addFiltersToContainer(filterData, filterType, nameAttr) {
  const filterContainer = document.getElementById(filterType);
  filterData.sort((a, b) => a.name.localeCompare(b.name));
  filterData.forEach(filterItem => {
    const filterCheckbox = document.createElement("input");
    filterCheckbox.type = "checkbox";
    filterCheckbox.classList.add("filter-checkbox");
    filterCheckbox.id = filterItem.name;
    filterCheckbox.value = filterItem.id;
    filterCheckbox.name = nameAttr;
    filterCheckbox.addEventListener("change", () => {
      updateFilters();
      page = 1;
      gameList.innerHTML = "";
      loadGames();
    });
    const filterLabel = document.createElement("label");
    filterLabel.htmlFor = filterItem.name;
    if (filterItem.name === "PlayStation") {
      filterLabel.textContent = "PlayStation 1";
    } else {
      filterLabel.textContent = filterItem.name;
    }
    const filterItemElement = document.createElement("div");
    filterItemElement.classList.add("filter-item");
    filterItemElement.appendChild(filterCheckbox);
    filterItemElement.appendChild(filterLabel);
    filterContainer.appendChild(filterItemElement);
  })
}

clearFiltersBtn.addEventListener("click", () => {
  const checkboxes = document.querySelectorAll(".filter-checkbox");
  checkboxes.forEach((checkbox) => (checkbox.checked = false));
  updateFilters();
  page = 1;
  gameList.innerHTML = "";
  loadGames();
});

function updateFilters() {
  filters.releaseYears = Array.from(
    document.querySelectorAll('input[name="release-year"]:checked')
  ).map((cb) => {
    const [startYear, endYear] = cb.value.split("-");
    if (!startYear) {
      return { startYear: 1900, endYear: parseInt(endYear, 10) };
    }
    if (!endYear) {
      return { startYear: parseInt(startYear, 10), endYear: 2099 };
    }
    return {
      startYear: parseInt(startYear, 10),
      endYear: parseInt(endYear, 10),
    };
  });
  filters.platforms = Array.from(
    document.querySelectorAll('input[name="platforms"]:checked')
  ).map((cb) => cb.value);
  filters.genres = Array.from(
    document.querySelectorAll('input[name="genres"]:checked')
  ).map((cb) => cb.value);
}

function buildFilterQuery() {
  let query = "";
  if (filters.releaseYears.length > 0) {
    const startYear = Math.min(
      ...filters.releaseYears.map((range) => range.startYear || 1900)
    );
    const endYear = Math.max(
      ...filters.releaseYears.map((range) => range.endYear || 2099)
    );
    console.log(startYear, endYear);
    query += `&dates=${startYear}-01-01,${endYear}-12-31`;
  }
  if (filters.platforms.length > 0) {
    query += `&platforms=${filters.platforms.join(",")}`;
  }
  if (filters.genres.length > 0) {
    query += `&genres=${filters.genres.join(",")}`;
  }
  return query;
}

document.querySelectorAll(".dropdown-content div").forEach(option => {
  option.addEventListener("click", function() {
    const selectedSort = this.getAttribute("value");
    sortBtn.setAttribute("data-selected", selectedSort);
    const sortType = this.textContent;
    sortBtn.innerHTML = `${sortType} <i id="sort-arrow" class="fa-solid fa-chevron-down"></i>`;
    sortBtn.style.borderBottomLeftRadius = "5px";
    sortBtn.style.borderBottomRightRadius = "5px";
    dropdownMenu.style.display = "none";
    page = 1;
    gameList.innerHTML = "";
    loadGames();
  });
});

async function loadGames() {
  if (isLoading) {
    return;
  }
  isLoading = true;
  showSpinner();
  let url = searchQuery ? `${apiUrl}&search=${searchQuery}` : apiUrl;
  if (page > 1) {
    url += `&page=${page}`;
  }
  const filterQuery = buildFilterQuery();
  if (filterQuery) {
    url += filterQuery;
  }
  const response = await fetch(url);
  const gamesData = await response.json();
  console.log(gamesData)
  resultsCount.innerHTML = `${gamesData.count.toLocaleString()} results`;
  if (page === 1 && searchQuery === "") {
    gameList.innerHTML = "";
    allGames = [];
  }
  if (gamesData && gamesData.results && gamesData.results.length) {
    gamesData.results.forEach(game => {
      if (!allGames.some(existingGame => existingGame.id === game.id)) {
        allGames.push(game);
      }
    });
    const sortedGames = sortGames(allGames);
    const gameHTMLs = sortedGames.map(game => gameHTML(game));
    gameList.innerHTML = gameHTMLs.join("");
    page++;
  }
  hideSpinner();
  isLoading = false;
}

function sortGames(allGames) {
  const selectedSort = sortBtn.getAttribute("data-selected");
  return allGames.sort((a, b) => {
    if (selectedSort === "ALPHA_A_TO_Z") {
      return a.name.toUpperCase().localeCompare(b.name.toUpperCase());
    } else if (selectedSort === "ALPHA_Z_TO_A") {
      return b.name.toUpperCase().localeCompare(a.name.toUpperCase());
    } else if (selectedSort === "DATE_DESC") {
      return new Date(a.released) - new Date(b.released);
    } else if (selectedSort === "DATE_ASC") {
      return new Date(b.released) - new Date(a.released);
    } else if (selectedSort === "SCORE") {
      return b.metacritic - a.metacritic;
    }
    return 0;
  });
}

function debounce(func, delay) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), delay);
  };
}

function searchGames(query) {
  searchQuery = query;
  page = 1;
  allGames = [];
  if (query.length > 0) {
    titleText.innerHTML = `Results for: <span class="green">${query}</span>`;
  } else {
    titleText.innerHTML = `All <span class="green">Games:</span>`;
  }
  gameList.innerHTML = "";
  loadGames();
}

document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = event.target
    .querySelector('input[name="search__input"]')
    .value.trim();
  if (query === "") {
    searchQuery = "";
    page = 1;
    gameList.innerHTML = "";
  }
  searchGames(query);
});

window.addEventListener(
  "scroll",
  debounce(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      !isLoading
    ) {
      loadGames();
    }
  }, 100)
);

window.addEventListener("load", async () => {
  window.scrollTo(0, 0);
  platformsList = await fetchPlatforms();
  populateFilters();
});

function getPlatformId(platformName) {
  const platform = platformsList.find((p) => p.name === platformName);
  return platform ? platform.id : null;
}

function showSpinner() {
  const spinner = document.createElement("div");
  spinner.id = "spinner";
  spinner.classList.add("loading-state");
  spinner.innerHTML = `<i class="fa-solid fa-circle-notch"></i>`;
  gameList.appendChild(spinner);
}

function hideSpinner() {
  const spinner = document.getElementById("spinner");
  if (spinner) {
    spinner.remove();
  }
}

function openLinksMenu() {
  document.body.classList += " links-menu--open";
}

function closeLinksMenu() {
  document.body.classList.remove("links-menu--open");
}

loadGames();

function gameHTML(game) {
  const gamePlatformsShort = {
    PlayStation: [
      "PlayStation",
      "PlayStation 2",
      "PlayStation 3",
      "PlayStation 4",
      "PlayStation 5",
      "PS Vita",
      "PSP",
    ],
    Xbox: ["Xbox", "Xbox 360", "Xbox One", "Xbox Series S/X"],
    PC: ["PC"],
    Apple: ["iOS", "macOS", "Apple II", "Classic Macintosh"],
    Android: ["Android"],
    Linux: ["Linux"],
    Nintendo: [
      "Nintendo Switch",
      "Nintendo 64",
      "Nintendo DS",
      "Nintendo DSi",
      "Nintendo 3DS",
      "Wii",
      "Wii U",
      "Game Boy",
      "Game Boy Advance",
      "Game Boy Color",
      "GameCube",
      "NES",
      "SNES",
    ],
    Atari: [
      "Atari 2600",
      "Atari 5200",
      "Atari 7800",
      "Atari 8-bit",
      "Atari Flashback",
      "Atari Lynx",
      "Atari ST",
      "Atari XEGS",
      "Jaguar",
    ],
    SEGA: [
      "SEGA 32X",
      "SEGA CD",
      "SEGA Master System",
      "SEGA Saturn",
      "Game Gear",
      "Dreamcast",
      "Genesis",
    ],
    DO: ["3DO"],
    Amiga: ["Commodore / Amiga"],
    "Neo Geo": ["Neo Geo"],
  };

  const platformToLogo = {
    PlayStation: `<i class="fa-brands fa-playstation"></i>`,
    Xbox: `<i class="fa-brands fa-xbox"></i>`,
    PC: `<i class="fa-brands fa-windows"></i>`,
    Apple: `<i class="fa-brands fa-apple"></i>`,
    Android: `<i class="fa-brands fa-android"></i>`,
    Linux: `<i class="fa-brands fa-linux"></i>`,
    Nintendo: `<svg class="platform-logo__svg" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" id="nintendo">
  <polygon points="0 23.5 7.06 23.5 7.06 7.46 16.96 23.5 24 23.5 24 .5 16.95 .5 16.95 16.539 7.1 .5 0 .5"></polygon>
</svg>
`,
    Atari: `<svg class="platform-logo__svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0,0,256,256" width="16px" height="16px" fill-rule="nonzero"><g transform="translate(-51.2,-51.2) scale(1.4,1.4)"><g fill-opacity="0" fill="#dddddd" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M36.57143,219.42857v-182.85714h182.85714v182.85714z" id="bgRectangle"></path></g><g fill="#e61e25" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.33333,5.33333)"><path class="platform-logo__path" d="M18.012,7.007c0.852,0 1.132,0 1.984,0c0,2.02 0,4.041 0,6.061c0.016,1.681 -0.032,3.362 -0.113,5.059c-0.113,2.425 -0.273,4.865 -0.659,7.274c-0.273,1.649 -0.852,3.249 -1.56,4.768c-1.158,2.441 -2.959,4.51 -5.001,6.255c-1.817,1.616 -4.004,2.78 -6.287,3.588c-1.285,0.455 -3.009,0.794 -4.376,0.988c0,-1.697 0,-3.378 0,-5.075c1.64,-0.242 4.162,-0.774 5.625,-1.55c1.737,-0.921 3.28,-2.15 4.599,-3.621c1.351,-1.503 2.428,-3.249 3.248,-5.092c0.965,-2.134 1.479,-4.429 1.833,-6.724c0.434,-2.926 0.627,-5.884 0.691,-8.842c0.016,-1.034 0.016,-2.087 0.016,-3.089z"></path><path class="platform-logo__path" d="M22.014,7.007c1.333,-0.016 2.653,0 3.986,0c0,11.315 0,22.646 0,33.96c-1.333,0 -2.653,0 -3.986,0c-0.014,-3.605 0,-7.225 -0.014,-10.83c0.014,-7.709 0.014,-15.42 0.014,-23.13z"></path><path class="platform-logo__path" d="M28.001,7.007c0.853,0 1.168,-0.007 2.004,-0.007c-0.032,3.459 0.096,6.977 0.498,10.419c0.338,2.667 0.929,5.357 1.99,7.831c0.997,2.408 2.856,4.597 4.738,6.391c1.801,1.713 3.972,3.039 6.335,3.799c0.659,0.21 1.742,0.372 2.433,0.485c0,1.697 0,3.378 0,5.075c-1.351,-0.178 -3.077,-0.533 -4.363,-0.97c-1.528,-0.533 -3.007,-1.228 -4.374,-2.117c-0.997,-0.647 -1.897,-1.406 -2.766,-2.214c-1.431,-1.325 -2.701,-2.829 -3.666,-4.542c-0.756,-1.325 -1.302,-2.764 -1.737,-4.219c-0.386,-1.471 -0.563,-2.99 -0.708,-4.51c-0.289,-3.265 -0.402,-6.546 -0.386,-9.828c0.002,-1.859 0.002,-3.75 0.002,-5.593z"></path></g></g></g></svg>`,
    SEGA: `<svg class="platform-logo__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="sega">
  <path fill="#0442EA" class="platform-logo__path" d="m2.75 24 10.632-.01a7.867 7.867 0 0 0 7.868-7.869 7.868 7.868 0 0 0-7.867-7.869l-2.76.016a.399.399 0 0 1 0-.798h10.598l.006-3.33v-.001H10.612a3.723 3.723 0 1 0 .004 7.446l2.771.03a4.504 4.504 0 0 1 4.505 4.506 4.504 4.504 0 0 1-4.503 4.504H2.755L2.75 24z"></path>
  <path fill="#0442EA" class="platform-logo__path" d="M13.368 16.512H2.761l.004 3.331 10.65-.003a3.722 3.722 0 0 0 0-7.443l-2.774-.03c-2.491 0-4.514-2.016-4.514-4.504s2.01-4.507 4.499-4.507l10.602-.003-.006-3.35L10.624 0a7.867 7.867 0 0 0-7.866 7.869 7.869 7.869 0 0 0 7.866 7.871h2.744c.211 0 .384.172.384.385a.389.389 0 0 1-.384.387z"></path>
</svg>
`,
    DO: `<i class="fa-solid fa-3"></i>`,
    Amiga: `<svg class="platform-logo__svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0,0,256,256" width="16px" height="16px" fill-rule="nonzero"><g transform=""><g fill-opacity="0" fill="#dddddd" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,256v-256h256v256z" id="bgRectangle"></path></g><g fill="none" fill-rule="evenodd" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.33333,5.33333)"><path class="platform-logo__path" d="M33.568,16h-5l4.216,-6h5zM39.568,16h-5l4.216,-6h5z" fill="#f36c00"></path><path class="platform-logo__path" d="M29.351,22h-5l4.217,-6h5zM35.351,22h-5l4.217,-6h5z" fill="#ff9000"></path><path class="platform-logo__path" d="M25.135,28h-5l4.216,-6h5zM31.135,28h-5l4.216,-6h5z" fill="#ffa100"></path><path class="platform-logo__path" d="M12.143,36l2.857,4l-4,1l-3.667,-5zM18.143,36l2.857,4l-4,1l-3.667,-5z" fill="#237f2d"></path><path class="platform-logo__path" d="M18.143,36h-4.81l-3.666,-5h4.904z" fill="#008390"></path><path class="platform-logo__path" d="M20.919,34h-5l4.216,-6h5zM26.919,34h-5l4.216,-6h5z" fill="#fdc200"></path><path class="platform-logo__path" d="M16,41h-5l4.919,-7h5zM22,41h-5l4.919,-7h5z" fill="#feda0f"></path><path class="platform-logo__path" d="M37.784,10h-5l4.216,-6h5zM43.784,10h-5l4.216,-6h5z" fill="#dc4100"></path><path class="platform-logo__path" d="M12.143,36h-4.81l-3.666,-5h4.904z" fill="#008390"></path><path class="platform-logo__path" d="M8.571,31h-4.904l-3.667,-5h5zM14.571,31h-4.904l-3.667,-5h5z" fill="#0075c0"></path><path d="M-1,-1h50v50h-50z" fill="none"></path></g></g></g></svg>`,
    "Neo Geo": `<i class="fa-solid fa-s"></i>`,
  };

  const platformsGrouped = {};

  const platforms = game.platforms || [];

  // Group the platforms by their icon types
  platforms.forEach((platform) => {
    let platformName = platform.platform.name;

    for (const key in gamePlatformsShort) {
      if (gamePlatformsShort[key].includes(platformName)) {
        if (!platformsGrouped[key]) {
          platformsGrouped[key] = [];
        }
        if (platformName === "PlayStation") {
          platformName = "PlayStation 1";
        }
        platformsGrouped[key].push(platformName);
      }
    }
  });

  // Generate the platform icons with tooltips
  const platformIconsHTML = Object.keys(platformsGrouped)
    .map((key) => {
      const tooltipContent = platformsGrouped[key].join(", ");
      const logo = platformToLogo[key];
      return `
      <span class="platform-icon" data-tooltip="${tooltipContent}">
        ${logo}
      </span>`;
    })
    .join("");

  const gameGenres = game.genres.map((genre) => genre.name).join(", ");

  const releaseDate = new Date(game.released);
  const formattedReleaseDate = releaseDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  let scoreColor = "";
  if (game.metacritic >= 70) {
    scoreColor = "score--green";
  } else if (game.metacritic >= 50) {
    scoreColor = "score--orange";
  } else {
    scoreColor = "score--red";
  }

  if (game.metacritic) {
    return `<div class="game-card">
    <div class="game-card__container">
      <figure class="game__img--wrapper">
        <img src="${game.background_image}" class="game__img" alt="">
      </figure>
      <div class="game__info">
        <h5 class="game__title">${game.name}</h5>
        <h6 class="game__release-date">${formattedReleaseDate}</h6>
        <h6 class="game__platforms">${platformIconsHTML}</h6>
        <div class="genres">
          <h6 class="genres__label">Genres:</h6>
          <h6 class="game__genres">${gameGenres}</h6>
        </div>
        <h6 class="game__score"><span class="${scoreColor}" data-tooltip="Metacritic score">${game.metacritic}</span></h6>
        </div>
      </div>
    </div>`;
  } else {
    return `<div class="game-card">
    <div class="game-card__container">
      <figure class="game__img--wrapper">
        <img src="${game.background_image}" class="game__img" alt="">
      </figure>
      <div class="game__info">
        <h5 class="game__title">${game.name}</h5>
        <h6 class="game__release-date">${formattedReleaseDate}</h6>
        <h6 class="game__platforms">${platformIconsHTML}</h6>
        <div class="genres">
          <h6 class="genres__label">Genres:</h6>
          <h6 class="game__genres">${gameGenres}</h6>
        </div>
        </div>
      </div>
    </div>`;
  }
}
