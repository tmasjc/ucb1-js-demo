class Bandit {
  constructor(prob) {
    this.prob = prob;
    this.count = 0;
    this.value = 0;
  }

  update(new_value) {
    this.count += 1;
    this.value += (new_value - this.value) / this.count;
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

let intervalId;
let currentRound = 0;
let ucb1;
let isPaused = false;

function runSimulation() {
  const rounds = parseInt(document.getElementById('rounds').value);
  const banditProbabilities = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  ucb1 = new UCB1(banditProbabilities);

  // Initiate simulation
  if (intervalId) {
    clearInterval(intervalId);
    currentRound = 0;
  }

  // Start a new simulation
  intervalId = setInterval(() => {
    if (currentRound < rounds && !isPaused) {
      const chosen_arm = ucb1.selectArm();
      const reward = getReward(ucb1.bandits[chosen_arm]);
      ucb1.update(chosen_arm, reward);
      displayResults(ucb1.bandits);
      currentRound++;
    } else {
      clearInterval(intervalId);
      intervalId = null;
    }
  }, 100); 
}

function pauseSimulation() {
  isPaused = true;
}

function resumeSimulation() {
  isPaused = false;
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

document.getElementById('start').addEventListener('click', runSimulation);
document.getElementById('pause').addEventListener('click', pauseSimulation);
document.getElementById('resume').addEventListener('click', resumeSimulation);
