const gameList = document.querySelector(".game-list");

async function main() {
  const games = await fetch(
    "https://api.rawg.io/api/games?key=58ee01e52ce14968a6c26b86c06b3f2b"
  );
  const gamesData = await games.json();
  const gameResults = gamesData.results;
  gameList.innerHTML = gameResults.map((game) => gameHTML(game)).join("");
}

main();

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

  // Group the platforms by their icon types
  game.platforms.forEach((platform) => {
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
  if (game.metacritic >= 80) {
    scoreColor = "score--green";
  } else if (game.metacritic >= 50) {
    scoreColor = "score--orange";
  } else {
    scoreColor = "score--red";
  }

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
}
