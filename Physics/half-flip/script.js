const maxCoins = 1000;
let flipInTandem = true;

document.getElementById("flip-button").addEventListener("click", () => {
  flipInTandem = !flipInTandem;
  flipCoins();
});
let coins = [];

function createCoins() {
  const container = document.getElementById("coin-container");
  container.innerHTML = "";
  coins = [];
  for (let i = 0; i < maxCoins; i++) {
    const coin = document.createElement("div");
    coin.classList.add("coin");
    coin.dataset.status = "heads";
    container.appendChild(coin);
    coins.push(coin);
  }
}

function flipCoins() {
  coins = coins.filter((coin) => {
    const isHeads = Math.random() < 0.5;
    if (isHeads) {
      coin.dataset.status = "heads";
      return true;
    } else {
      coin.dataset.status = "tails";
      coin.remove();
      return false;
    }
  });
}

document.getElementById("flip-button").addEventListener("click", flipCoins);
document.getElementById("reset-button").addEventListener("click", createCoins);

createCoins();
