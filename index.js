const gameList = document.querySelector(".game-list");
let page = 1;
let isLoading = false;
let searchQuery = "";
const apiUrl =
  "https://api.rawg.io/api/games?key=58ee01e52ce14968a6c26b86c06b3f2b";

async function loadGames() {
  if (isLoading) {
    return;
  }
  isLoading = true;
  let url = searchQuery ? `${apiUrl}&search=${searchQuery}` : apiUrl;
  if (page > 1) {
    url += `&page=${page}`;
  }
  const response = await fetch(url);
  const gamesData = await response.json();
  if (page === 1 && searchQuery === "") {
    gameList.innerHTML = "";
  }
  if (gamesData && gamesData.results.length) {
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
