// API Key: 58ee01e52ce14968a6c26b86c06b3f2b
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
        "PlayStation 5" : "PS5",
        "PlayStation 4" : "PS4",
        "PlayStation 3" : "PS3",
        "PlayStation 2" : "PS2",
        "PlayStation 1" : "PS1",
        "PlayStation" : "PS1"
    };

  const gamePlatforms = game.platforms.map(platform => gamePlatformsShort[platform.platform.name] || platform.platform.name).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).join(", ");

  const gameGenres = game.genres.map(genre => genre.name).join(", ");

  const releaseDate = new Date(game.released);
  const formattedReleaseDate = releaseDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
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
            <img src="${game.background_image}" alt="">
            <h5>${game.name}</h5>
            <h6>${formattedReleaseDate}</h6>
            <h6>${gamePlatforms}</h6>
            <h6>${gameGenres}</h6>
            <h6>Average Playtime (hours): ${game.playtime}</h6>
            <h6><span class="${scoreColor}">${game.metacritic}</span></h6>
            </div>
        </div>`;
}
