const gameList = document.querySelector(".game-list");
const titleText = document.querySelector(".games__display--title");
const resultsCount = document.querySelector(".games__count");
const filterTitles = document.querySelectorAll(".filter__title");
let page = 1;
let isLoading = false;
let searchQuery = "";
let filters = {
  releaseYears: [],
  platforms: [],
  genres: []
};
let platformsList = [];
const apiUrl =
  "https://api.rawg.io/api/games?key=58ee01e52ce14968a6c26b86c06b3f2b";

filterTitles.forEach(title => {
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

document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
  checkbox.addEventListener("change", () => {
    updateFilters();
    page = 1;
    gameList.innerHTML = "";
    loadGames();
  });
});

function updateFilters() {
  filters.releaseYears = Array.from(document.querySelectorAll('input[name="release-year"]:checked')).map(cb => {
    const [startYear, endYear] = cb.value.split("-");
    if (!startYear) {
      return { startYear: 1800, endYear: parseInt(endYear, 10) };
    }
    if (!endYear) {
      return { startYear: parseInt(startYear, 10), endYear: 2099 };
    }
    return { startYear: parseInt(startYear, 10), endYear: parseInt(endYear, 10) };
  });
  filters.platforms = Array.from(document.querySelectorAll('input[name="platforms"]:checked')).map(cb => cb.id);
  filters.genres = Array.from(document.querySelectorAll('input[name="genres"]:checked')).map(cb => cb.id);
}

function buildFilterQuery() {
  let query = "";
  if (filters.releaseYears.length > 0) {
    const startYear = Math.min(...filters.releaseYears.map(range => range.startYear || 1800));
    const endYear = Math.max(...filters.releaseYears.map(range => range.endYear || 2099));
    console.log(startYear, endYear);
    query += `&dates=${startYear}-01-01,${endYear}-12-31`;
  }
  if (filters.platforms.length > 0) {
    const platformIds = filters.platforms.map(platformName => getPlatformId(platformName)).filter(id => id);
    if (platformIds.length > 0) {
      query += `&platforms=${platformIds.join(",")}`;
    }
  }
  if (filters.genres.length > 0) {
    query += `&genres=${filters.genres.join(",")}`;
  }
  return query;
}

async function fetchPlatforms() {
  const response = await fetch(`https://api.rawg.io/api/platforms?key=58ee01e52ce14968a6c26b86c06b3f2b`);
  const platformData = await response.json();
  return platformData.results;
}

async function loadGames() {
  if (isLoading) {
    return;
  }
  isLoading = true;
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
  resultsCount.innerHTML = `${gamesData.count.toLocaleString()} results`;
  if (page === 1 && searchQuery === "") {
    gameList.innerHTML = "";
  }
  if (gamesData && gamesData.results && gamesData.results.length) {
    gameList.innerHTML += gamesData.results
      .map((game) => gameHTML(game))
      .join("");
    page++;
  }
  isLoading = false;
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
});

function getPlatformId(platformName) {
  const platform = platformsList.find(p => p.name === platformName);
  return platform ? platform.id : null;
}

loadGames();

function gameHTML(game) {
  const gamePlatformsShort = {
    PlayStation: [
      "PlayStation 1",
      "PlayStation 2",
      "PlayStation 3",
      "PlayStation 4",
      "PlayStation 5",
    ],
    Xbox: ["Xbox", "Xbox 360", "Xbox One", "Xbox Series S/X"],
    PC: ["PC"],
    macOS: ["macOS"],
    iOS: ["iOS"],
    Android: ["Android"],
    "Nintendo Switch": ["Nintendo Switch"],
  };

  const platformToLogo = {
    PlayStation: `<i class="fa-brands fa-playstation"></i>`,
    Xbox: `<i class="fa-brands fa-xbox"></i>`,
    PC: `<i class="fa-brands fa-windows"></i>`,
    macOS: `<i class="fa-solid fa-desktop"></i>`,
    iOS: `<i class="fa-brands fa-apple"></i>`,
    Android: `<i class="fa-brands fa-android"></i>`,
    "Nintendo Switch": `<i class="fa-solid fa-n"></i>`,
  };

  if (game.released !== null) {
    console.log(game);
  }

  const platformsGrouped = {};

  const platforms = game.platforms || [];

  // Group the platforms by their icon types
  platforms.forEach((platform) => {
    const platformName = platform.platform.name;

    for (const key in gamePlatformsShort) {
      if (gamePlatformsShort[key].includes(platformName)) {
        if (!platformsGrouped[key]) {
          platformsGrouped[key] = [];
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
