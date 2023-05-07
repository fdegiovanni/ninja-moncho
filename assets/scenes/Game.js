import { SHAPES } from '../../utils.js';
const { TRIANGLE, SQUARE, DIAMOND } = SHAPES;

export default class Game extends Phaser.Scene {
  score;
  gameOver;
  timer;
  constructor() {
    super("Game");
  }

  init() {
    this.gameOver = false;
    this.shapesRecolected = {
      [TRIANGLE]: { count: 0, score: 10},
      [SQUARE]: { count: 0, score: 20 },
      [DIAMOND]: { count: 0, score: 30 },
    };
    console.log(this.shapesRecolected)
  }

  create() {
    // add background
    this.add.image(400, 300, "sky").setScale(0.555);

    // add static platforms group
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    // add shapes group
    this.shapesGroup = this.physics.add.group();
    // this.shapesGroup.create(100, 0, 'diamond');
    // this.shapesGroup.create(200, 0, 'triangle');
    // this.shapesGroup.create(300, 0, 'square');
    // create event to add shapes
    this.time.addEvent({
      delay: 10000,
      callback: this.addShape,
      callbackScope: this,
      loop: true,
    });

    this.time.addEvent({
      delay: 1000,
      callback: this.onSecond,
      callbackScope: this,
      loop: true,
    });
    
    // add sprite player
    this.player = this.physics.add.sprite(100, 450, "ninja");
    this.player.setCollideWorldBounds(true);
    
    // create cursors
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // add collider between player and platforms
    // add collider between player and shapes
    // add overlap between player and shapes
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.shapesGroup);
    this.physics.add.collider(this.platforms, this.shapesGroup);

    // add overlap between player and shapes
    this.physics.add.overlap(
      this.player,
      this.shapesGroup,
      this.collectShape, // funcion que llama cuando player choca con shape
      null, //dejar fijo por ahora
      this //dejar fijo por ahora
    );

    // add score on scene
    this.score = 0;
    this.scoreText = this.add.text(20, 20, "Score:" + this.score, {
      fontSize: "32px",
      fontStyle: "bold",
      fill: "#FFFFFF",
    });

    // add timer
    this.timer = 10;
    this.timerText = this.add.text(750, 20, this.timer, {
      fontSize: "32px",
      fontStyle: "bold",
      fill: "#FFFFFF",
    });
  }

  update() {
    // condicion para ganar y mostrar escena 
    if (this.score>200) {
      this.scene.start("Win");
    }

    if(this.gameOver){
      this.scene.start("Win");
    }

    // check if not game over or win
    // update player movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-250);
    } else {
      if (this.cursors.right.isDown) {
        this.player.setVelocityX(250);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // update player jump
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }


    // check shapes
    this.shapesGroup.children.iterate(function(shape) {
      // Comprobar si el elemento shape está tocando una plataforma
      if (this.physics.overlap(shape, this.platforms)) {
        // Restar % valor del elemento shape
        shape.value -= 0.25;

        const shapeName = shape.texture.key;
        const percentage = shape.value;
        const scoreNow = this.shapesRecolected[shapeName].score * percentage;
        console.log('Valor posible del shape '+shapeName+' '+scoreNow)
        
  
        // Si el valor llega a cero, destruir el elemento shape
        if (shape.value <= 0) {
          shape.disableBody(true, true);
        }
      }
    }, this);
  }

  addShape() {
    // get random shape
    const randomShape = Phaser.Math.RND.pick([DIAMOND, SQUARE, TRIANGLE]);

    // get random position x
    const randomX = Phaser.Math.RND.between(0, 800);

    const shape = this.physics.add.sprite(randomX, 0, randomShape);

    // add shape to screen
    this.shapesGroup.add(shape);
    shape.setBounce(0.75);
    shape.value = 1;
    shape.setCircle(32, 0, 0);

    console.log("shape is added", randomX, randomShape);
  }

  collectShape(player, shape) {
    // remove shape from screen
    shape.disableBody(true, true);
    const shapeName = shape.texture.key;

    const percentage = shape.value;
    const scoreNow = this.shapesRecolected[shapeName].score * percentage;

    
    this.shapesRecolected[shapeName].count++;

    this.score += scoreNow;
    console.log(scoreNow)
    this.scoreText.setText(`Score: ${this.score.toString()}`);
    

    console.log(this.shapesRecolected);
  }

  onSecond(){
    this.timer--;
    this.timerText.setText(this.timer);
    if(this.timer <= 0){
      // this.gameOver = true;
    }
  }
  
}
