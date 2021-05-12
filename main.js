
class Bubble {

  constructor() {
    this.width = this.height = Math.floor(Math.random() * 70) + 30;
    this.x = Math.random() * 700;
    this.y = 600;
    this.color = this.getRandomColor();
    this.alive = true;
    this.node = this.makeNode()
    this.lose = null;
  }

  getRandomColor = () => {
    const r = Math.floor(Math.random() * (200));
    const g = Math.floor(Math.random() * (200));
    const b = Math.floor(Math.random() * (200));
    return '#' + r.toString(16) + g.toString(16) + b.toString(16);
  }

  getBaseLog = (x, y) => {
    return Math.log(y) / Math.log(x);
  }

  moveBubble = (wind, speed) => {
    this.y = this.y - speed; 
    if(this.x < 690 && this.x > 10) {
      if (wind > 0) {
        // Изменение скорости ветра от расстояния
        const modWind = wind -  (1/this.x + 0.8)
        if(modWind >= 0) {
          this.x = this.x + modWind;
        }
      } else if (wind < 0) {
        const modWind = wind + (this.getBaseLog(this.x, 10) + 0.8)
        if(modWind <= 0) {
          this.x = this.x + modWind;
        }
      }
    }
  }

  kill = () => {
    this.alive = false;
    this.lose = false;
  }

  setLose = () => {
    this.lose = true;
  }

  makeNode = () => {
    const bubbleHtml = document.createElement("div");
        bubbleHtml.classList.add("bubble");
        bubbleHtml.style = `
          background-color: ${this.color}; 
          width: ${this.width}px; 
          height: ${this.height}px;
          top: ${this.y}px;
          left: ${this.x}px;
        `
    return bubbleHtml;    
  }

  deleteNode = () => {
    this.node = null;
  }
  
}

class Game {
  constructor() {
    this.score = 0;
    this.bubbles = [];
    this.wind = Math.floor(Math.random() * 10) - 5;
    this.needleX = 0;
    this.speed = 5;
    this.lose = 0;
  }

  incSpeed = () => {
    this.speed = this.speed + 1;
  }

  addNewBubble = () => {
    const newBubble = new Bubble();
    this.bubbles.push(newBubble);
    return newBubble;
  }

  setNeedleX = (x) => {
    this.needleX = x;
  }
  
  incScore = () => {
    this.score = this.score + 1;
  }

  incLose = () => {
    this.lose = this.lose + 1;
  }

  drowBubbles = (gameArea) => {
    this.bubbles.forEach((bubble) => {
      const {
        x,
        y,
        alive,
        node
      } = bubble;
      if (alive) {
        const parentX = gameArea.getBoundingClientRect().left;
        bubble.moveBubble(this.wind, this.speed);
        node.style.top = `${y}px`;
        node.style.left = `${x}px`;
        if (this.needleX - parentX > bubble.x && this.needleX - parentX < bubble.x + bubble.width) {
          if (bubble.y < 45) {
            bubble.kill();
            this.incScore();
          }
        } else if (bubble.y < 0 && bubble.lose !== true) {
          bubble.setLose();
          this.incLose();
        }
      } else if (node) {
        gameArea.removeChild(node);
        bubble.deleteNode();
      }
    })
  }

  moveBubbles = () => {
    this.bubbles.forEach((bubble) => {
      if (bubble.alive) {
        bubble.moveBubble();
        if (this.needleX - 144 > bubble.x && this.needleX - 144 < bubble.x + bubble.width) {
          if (bubble.y < 45) {
            bubble.kill();
            this.incScore()
          }
        }
      }
    })
  }
}

const gameField = document.getElementById("game");
const gameArea = document.getElementById("game-area");
const startGameButton = document.getElementById("start-game");
const needle = document.getElementById("needle");
const score = document.getElementById("score");
const wind = document.getElementById("wind");
const lose = document.getElementById("lose");


if(startGameButton) {
  startGameButton.addEventListener("click", () => {
    const game = new Game();
    
    const interval = setInterval(() => {
      const newBubble = game.addNewBubble();
      gameArea.appendChild(newBubble.node);
    }, 1000);
    
    wind.innerHTML = game.wind;

    const drowInterval = setInterval(() => {
      game.drowBubbles(gameArea);
      score.innerHTML = game.score;
      lose.innerHTML = game.lose;
    }, 20);
    
    const needleEventHandler = (e) => {
      const left = e.clientX;
      game.setNeedleX(left)
      needle.style = `left: ${left}px`
    }
    
    //Увеличеваем скорость каждые 5с
    const speedInterval = setInterval(() => {
      game.incSpeed();
    }, 5000);
    

    gameField.addEventListener("mousemove", needleEventHandler)

    setTimeout(() => {
      clearInterval(speedInterval)
      clearInterval(interval)
      clearInterval(drowInterval)
      gameField.removeEventListener("mousemove", needleEventHandler);

      //Завершает анимацю и чисти dom
      const lastInterval = setInterval(() => {
        game.drowBubbles(gameArea);
      }, 20);
      
      setTimeout(() => {
        clearInterval(lastInterval)
        while(gameArea.firstChild) {
          gameArea.removeChild(gameArea.firstChild)
        }
      }, 5000)

    }, 60000)
  })
  
}

