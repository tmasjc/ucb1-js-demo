class Bandit {
  constructor(prob) {
    this.prob = prob;
    this.count = 0;
    this.value = 0;
  }

  update(new_value) {
    this.count += 1;
    this.value += (new_value - this.value) / this.count; // scaling factor
  }
}

class UCB1 {
  constructor(probs) {
    this.bandits = probs.map(prob => new Bandit(prob));
    this.totalCount = 0;
  }

  selectArm() {
    for (let i = 0; i < this.bandits.length; i++) {
      if (this.bandits[i].count === 0) {
        return i;
      }
    }

    const ucbValues = this.bandits.map((bandit, index) => {
      const bonus = Math.sqrt((2 * Math.log(this.totalCount)) / bandit.count);
      return bandit.value + bonus;
    });

    return ucbValues.indexOf(Math.max(...ucbValues));
  }

  update(chosen_arm, reward) {
    const bandit = this.bandits[chosen_arm];
    bandit.update(reward);
    this.totalCount++;
  }
}

function getReward(bandit) {
  return Math.random() < bandit.prob ? 1 : 0;
}

let timeoutId;
let currentRound = 0;
let ucb1;
let rounds;

const arrayRange = (start, stop, step) =>
  Array.from(
    { length: (stop - start) / step + 1 },
    (value, index) => start + index * step
  );

function initializeSimulation() {
  const banditProbabilities =
    arrayRange(0.1, 0.5, 0.05).map(v => Math.round((v + Number.EPSILON) * 100) / 100);
  ucb1   = new UCB1(banditProbabilities);
  rounds = parseInt(document.getElementById('rounds').value);
  currentRound = 0;
  runSimulation(); 
}

function runSimulation() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  simulate();
}

function simulate() {
  if (currentRound < rounds) {
    const chosen_arm = ucb1.selectArm();
    const reward = getReward(ucb1.bandits[chosen_arm]);
    ucb1.update(chosen_arm, reward);
    displayResults(ucb1.bandits);
    currentRound++;

    timeoutId = setTimeout(simulate, 100);
  }
}

function pauseSimulation() {
  clearTimeout(timeoutId);
}

function displayResults(bandits) {
  const resultsDiv = document.getElementById('results');
  let table = `
    <table>
      <tr>
        <th>Bandit</th>
        <th>Probability</th>
        <th>Count</th>
        <th>Value</th>
      </tr>
  `;

  bandits.forEach((bandit, index) => {
    table += `
      <tr>
        <td>${index + 1}</td>
        <td>${bandit.prob}</td>
        <td>${bandit.count}</td>
        <td>${bandit.value.toFixed(2)}</td>
      </tr>
    `;
  });

  table += '</table>';
  resultsDiv.innerHTML = table;
}
document.getElementById('init').addEventListener('click', initializeSimulation);
document.getElementById('pause').addEventListener('click', pauseSimulation);
document.getElementById('resume').addEventListener('click', runSimulation);