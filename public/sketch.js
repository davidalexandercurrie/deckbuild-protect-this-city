let hand;
let drawPile;
let discardPile;
let selectedCard;

let ID_COUNTER = 0;
let CARD_DRAW_NUMBER = 4;
let MAX_HAND_SIZE = 8;
let CARD_WIDTH = 90;
let CARD_HEIGHT = 140;

let GAME_STATE = {
  energy: 1,
  win: false,
};

let NEXT_TURN = {
  extraEnergy: 0,
  extraCardDraw: 0,
};

let EVERY_TURN = {
  extraEnergy: 0,
  extraCardDraw: 0,
  extraMaxHandSize: 0,
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  hand = new Hand();
  drawPile = new DrawPile();
  discardPile = new DiscardPile();
  drawPile.addCard(new Card(CARD_DATA[1]));
  drawPile.addCard(new Card(CARD_DATA[1]));
  drawPile.addCard(new Card(CARD_DATA[1]));
  drawPile.addCard(new Card(CARD_DATA[2]));
  drawPile.addCard(new Card(CARD_DATA[3]));
  drawPile.addCard(new Card(CARD_DATA[1]));
  drawPile.addCard(new Card(CARD_DATA[1]));
  drawPile.addCard(new Card(CARD_DATA[1]));
  hand.drawNewHand(drawPile, discardPile);
  hand.resetHand();
}

function draw() {
  background(230);
  hand.show();
  updateUI();
  checkWin();
}

function checkWin() {
  if (GAME_STATE.win) {
    console.log('winning');
    fill(255, 0, 0);
    textAlign(CENTER);
    text('You win!', windowWidth / 2, windowHeight / 2);
    textAlign(LEFT);
  }
}

function updateUI() {
  // ENERGY
  fill(255, 125, 0);
  textSize(24);
  text(
    'Energy: ' + GAME_STATE.energy,
    windowWidth / 12,
    windowHeight - CARD_HEIGHT * 1.6
  );
  // NEXT TURN
  fill(255);
  rect(
    windowWidth - windowWidth / 12 - 5,
    windowHeight - CARD_HEIGHT * 1.6 - 30,
    100,
    50
  );
  textSize(24);
  fill(0, 0, 255);
  text(
    'End Turn',
    windowWidth - windowWidth / 12,
    windowHeight - CARD_HEIGHT * 1.6
  );
}

class Card {
  constructor(data) {
    this.x;
    this.y;
    this.selected = false;
    this.id = ID_COUNTER;
    ID_COUNTER++;
    this.data = data;
  }

  show() {
    fill(255);
    if (this.selected) {
      stroke(255, 0, 0);
    } else {
      stroke(0);
    }
    rect(this.x, this.y, CARD_WIDTH, CARD_HEIGHT);
    // TITLE
    fill(255, 0, 0);
    textSize(12);
    textAlign(CENTER);
    text(this.data.title, this.x, this.y + 25, CARD_WIDTH, CARD_HEIGHT - 50);
    // DESCRIPTION
    textAlign(LEFT);
    fill(0);
    textSize(12);
    text(
      this.data.description,
      this.x + 5,
      this.y + 65,
      CARD_WIDTH - 10,
      CARD_HEIGHT - 50
    );
    // COST
    textAlign(RIGHT);
    fill(0, 0, 255);
    textSize(24);
    text(this.data.cost, this.x + CARD_WIDTH - 3, this.y + 20);
    textAlign(LEFT);
  }
  move(x, y) {
    this.x = x;
    this.y = y;
  }
  playCard() {
    let canPlayResult = this.data.canPlay(this, null, GAME_STATE);

    if (canPlayResult.canPlay === true) {
      this.data.play(this, null, GAME_STATE);
    } else {
      console.log(canPlayResult.message);
      hand.resetHand();
    }
  }
  discardCard() {
    discardPile.addCard(this);
    hand.removeCard(this.id);
  }
}

class Hand {
  constructor() {
    this.cards = [];
  }

  addCard(card) {
    this.cards.push(card);
  }
  removeCard(id) {
    this.cards = this.cards.filter(card => card.id !== id);
  }
  resetHand() {
    let placement = 0;
    this.cards.forEach(card => {
      card.move(width / 12 + (placement * width) / 10, height - 200);
      placement++;
      console.log('Card placed', card.x, card.y, card.data.title);
    });
  }
  show() {
    this.cards.forEach(card => {
      card.show();
    });
  }
  discardHand(discardPile) {
    console.log('Discarding hand');
    this.cards.forEach(card => {
      discardPile.addCard(card);
    });
    this.cards = [];
  }
  drawNewHand(drawPile, discardPile) {
    let drawnCards = 0;
    while (
      drawnCards < CARD_DRAW_NUMBER + NEXT_TURN.extraCardDraw &&
      this.cards.length < MAX_HAND_SIZE
    ) {
      let card = drawPile.cards.pop();
      if (card) {
        this.addCard(card);
        drawnCards++;
      } else {
        if (discardPile.cards.length > 0) {
          discardPile.shuffleAndMoveToDrawPile(drawPile);
        } else {
          break;
        }
      }
    }
    console.log('New hand drawn', this.cards);
  }
}

class DiscardPile {
  constructor() {
    this.cards = [];
  }
  addCard(card) {
    this.cards.push(card);
  }
  removeCard(id) {
    this.cards = this.cards.filter(card => card.id !== id);
  }
  shuffleAndMoveToDrawPile(drawPile) {
    this.cards = this.cards.sort(() => Math.random() - 0.5);
    drawPile.cards = drawPile.cards.concat(this.cards);
    console.log('Discard pile shuffled and moved to draw pile', drawPile.cards);
    this.cards = [];
  }
}

class DrawPile {
  constructor() {
    this.cards = [];
  }
  addCard(card) {
    this.cards.push(card);
  }
  removeCard(id) {
    this.cards = this.cards.filter(card => card.id !== id);
  }
  shuffle() {
    this.cards = this.cards.sort(() => Math.random() - 0.5);
  }
}

function mousePressed() {
  hand.cards.forEach(card => {
    if (
      mouseX > card.x &&
      mouseX < card.x + CARD_WIDTH &&
      mouseY > card.y &&
      mouseY < card.y + CARD_HEIGHT
    ) {
      selectedCard = card;
      selectedCard.selected = true;
    }
  });
  if (
    mouseX > windowWidth - windowWidth / 12 - 5 &&
    mouseX < windowWidth - windowWidth / 12 - 5 + 100 &&
    mouseY > windowHeight - CARD_HEIGHT * 1.6 - 30 &&
    mouseY < windowHeight - CARD_HEIGHT * 1.6 - 30 + 50
  ) {
    console.log('End turn');
    newTurn();
  }
}

function mouseReleased() {
  if (selectedCard) {
    selectedCard.selected = false;
    if (selectedCard.y < height - 300) {
      selectedCard.playCard();
    } else {
      hand.resetHand();
    }
    selectedCard = null;
  }
}

function mouseDragged() {
  xDistance = mouseX - pmouseX;
  yDistance = mouseY - pmouseY;
  if (selectedCard) {
    selectedCard.move(selectedCard.x + xDistance, selectedCard.y + yDistance);
  }
  pmouseX = mouseX;
  pmouseY = mouseY;
}

function keyPressed() {
  if (keyCode === 32) {
    console.log('key pressed', keyCode);
    newTurn();
  }
}

function newTurn() {
  GAME_STATE.energy = 3;
  GAME_STATE.energy += NEXT_TURN.extraEnergy;
  NEXT_TURN.extraEnergy = 0;
  hand.discardHand(discardPile);
  hand.drawNewHand(drawPile, discardPile);
  hand.resetHand();
  NEXT_TURN.extraCardDraw = 0;
  console.log('New turn', GAME_STATE);
}

const CARD_DATA = {
  1: {
    title: 'Energy Boost',
    type: 'Spell',
    cost: 0,
    description: 'Gain 2 energy',
    canPlay: (source, target, gameState) => {
      return { canPlay: true };
    },
    play: (source, target, gameState) => {
      gameState.energy += 2;
      source.discardCard();
      hand.resetHand();
    },
  },
  2: {
    title: 'Magic',
    type: 'Spell',
    cost: 3,
    description: 'Start a new turn with 5 energy and 2 extra cards',
    canPlay: (source, target, gameState) => {
      if (gameState.energy >= 3) {
        return { canPlay: true }; // Condition met, no message needed
      } else {
        return { canPlay: false, message: 'Not enough energy' }; // Condition not met, include message
      }
    },
    play: (source, target, gameState) => {
      gameState.energy -= 3;
      NEXT_TURN.extraEnergy = 2;
      NEXT_TURN.extraCardDraw = 2;
      source.discardCard();
      newTurn();
    },
  },
  3: {
    title: "You're an energetic person",
    type: 'Spell',
    cost: 10,
    description: 'Win the game',
    canPlay: (source, target, gameState) => {
      if (gameState.energy >= 10) {
        return { canPlay: true }; // Condition met, no message needed
      } else {
        return { canPlay: false, message: 'Not enough energy' }; // Condition not met, include message
      }
    },
    play: (source, target, gameState) => {
      gameState.energy -= 10;
      gameState.win = true;
      source.discardCard();
      hand.resetHand();
    },
  },
};
