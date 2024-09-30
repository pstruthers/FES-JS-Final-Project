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
    "PlayStation 5": `<i class="fa-brands fa-playstation"></i>`,
    "PlayStation 4": `<i class="fa-brands fa-playstation"></i>`,
    "PlayStation 3": `<i class="fa-brands fa-playstation"></i>`,
    "PlayStation 2": `<i class="fa-brands fa-playstation"></i>`,
    "PlayStation 1": `<i class="fa-brands fa-playstation"></i>`,
    "PlayStation": `<i class="fa-brands fa-playstation"></i>`,
    "Xbox" : `<i class="fa-brands fa-xbox"></i>`,
    "Xbox 360" : `<i class="fa-brands fa-xbox"></i>`,
    "Xbox One" : `<i class="fa-brands fa-xbox"></i>`,
    "Xbox Series S/X" : `<i class="fa-brands fa-xbox"></i>`,
    "Linux" : `<i class="fa-brands fa-linux"></i>`,
    "PC" : `<i class="fa-brands fa-windows"></i>`,
    "macOS": `<i class="fa-solid fa-desktop"></i>`,
    "iOS" : `<i class="fa-brands fa-apple"></i>`,
    "Android" : `<i class="fa-brands fa-android"></i>`,
    "Nintendo Switch" : `<i class="fa-solid fa-n"></i>`
  };

  const uniqueLogos = new Set();

  game.platforms.forEach(platform => {
    const logo = gamePlatformsShort[platform.platform.name];
    if (logo) {
      uniqueLogos.add(logo);
    }
  });

  const sortedUniqueLogos = Array.from(uniqueLogos).sort().join("");

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
                <h6 class="game__platforms">${sortedUniqueLogos}</h6>
                <div class="genres">
                  <h6 class="genres__label">Genres:</h6>
                  <h6 class="game__genres">${gameGenres}</h6>
                </div>
                <h6 class="game__score"><span class="${scoreColor}">${game.metacritic}</span></h6>
                </div>
              </div>
            </div>`;
}
