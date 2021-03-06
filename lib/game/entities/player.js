ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityPlayer = ig.Entity.extend({
    type: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.ACTIVE,
    checkAgainst: ig.Entity.TYPE.B,
    size: {x: 32, y: 32},
    gravityFactor: 0,
    zIndex: 101,

    // Main stats
    lives: 3,
    isSheep: true,

    // Speed
    speed: 100,
    sheepSpeed: 100,
    wolfSpeed: 200,

    // Energy
    energy: 50,
    energyWarning: false,
    maxEnergy: 100,
    feedingEnergyBonus: 15,
    corralEnergyBonus: 5,
    currentEnergyDepletion: 1,
    sheepEnergyDepletion: 0.5,
    wolfEnergyDepletion: 1.5,
    energyDepletionTimer: new ig.Timer(1),

    // Movement
    attackDistance: 45,
    maxVel: {x: 150, y: 150},
    friction: {x: 500, y: 500},
    angle: 0,
    accelGround: 700,
    accelAir: 700,
    accelTurnSpeed: 250,
    wolfSoundPlaying: false,

    // Audio
    playerWolfSound: new ig.Sound( 'media/audio/player-wolf-growl.*', false ),

    sheepAnimSheet: new ig.AnimationSheet( 'media/sheep-player.png', 54, 34 ),
    wolfAnimSheet: new ig.AnimationSheet( 'media/wolf-player.png', 56, 30 ),
    transformationAnimSheet: new ig.AnimationSheet( 'media/player-transformation.png', 56, 34),

	init: function(x, y, settings) {
        this.parent(x, y, settings);
        ig.game.player = this;
        this.setAnimations();
        this.currentAnim = this.anims.idle;
        this.currentAnim.pivot = {x: this.sheepAnimSheet.width / 2, y: this.sheepAnimSheet.height / 2}
    },

    setAnimations: function() {
        if (this.isSheep) {
            this.anims.idle = new ig.Animation( this.sheepAnimSheet, 0, [0], true );
            this.anims.walking = new ig.Animation( this.sheepAnimSheet, 0.1, [2,3,4,3] );
            this.anims.transform = new ig.Animation ( this.transformationAnimSheet, 0.07, [0,1,2], true);
        }
        else {
            this.anims.idle = new ig.Animation( this.wolfAnimSheet, 0, [0], true );
            this.anims.walking = new ig.Animation( this.wolfAnimSheet, 0.1, [8,9,10,9] );
            this.anims.transform = new ig.Animation ( this.transformationAnimSheet, 0.07, [2,1,0], true);
            this.anims.biting = new ig.Animation(this.wolfAnimSheet, 0.1, [12,13,12]);
        }
    },
	
    update: function() {
        this.currentAnim.angle = this.angle.toRad();
        this.checkOffset();
        this.checkMovement();
        this.checkMode();
        this.depleteEnergy();
       
        if (this.currentAnim === this.anims.transform && this.currentAnim.loopCount > 0) {
            this.currentAnim = this.anims.idle;
            this.currentAnim.angle = this.angle.toRad();
        }
        else if (this.currentAnim === this.anims.biting && this.currentAnim.loopCount > 0) {
            this.currentAnim = this.anims.idle;
            this.currentAnim.angle = this.angle.toRad();
        }

        if (!this.isSheep && ig.input.released('space')) {
            this.currentAnim = this.anims.biting.rewind();
        }

        this.parent();
    },

    checkOffset: function() {
        this.offset.x = (this.currentAnim.sheet.width - this.size.x) / 2;
        this.offset.y = (this.currentAnim.sheet.height - this.size.y) / 2;
    },

    checkMovement: function() {
        if (this.currentAnim !== this.anims.humping) {
            if (ig.input.state('right')) {
                this.angle += this.accelTurnSpeed * ig.system.tick;
            }
            
            else if (ig.input.state('left')) {
                this.angle -= this.accelTurnSpeed * ig.system.tick;
            }

            if (this.angle > 360) {
                this.angle = 0;
            }
            else if (this.angle < 0) {
                this.angle = 360;
            }
            
            if (ig.input.state('up')) {
                // Accelerate the player in the right direction
                this.vel.x = Math.cos(this.angle*Math.PI/180) * this.speed;
                this.vel.y = Math.sin(this.angle*Math.PI/180) * this.speed;
                if (!this.isSheep && this.wolfSoundPlaying === false) {
                    this.playerWolfSound.play();
                    this.wolfSoundPlaying = true;
                }
            }

            else if (ig.input.state('down')) {
                // Accelerate the player in the right direction
                this.vel.x = Math.cos(this.angle*Math.PI/180) * -this.speed;
                this.vel.y = Math.sin(this.angle*Math.PI/180) * -this.speed;
                if (!this.isSheep && this.wolfSoundPlaying === false) {
                    this.playerWolfSound.play();
                    this.wolfSoundPlaying = true;
                }
            } 

            else {
                this.vel.y = 0;
                this.vel.x = 0;
                if (this.wolfSoundPlaying === true) {
                    this.playerWolfSound.stop();
                    this.wolfSoundPlaying = false;
                } 
            }

            if (this.currentAnim !== this.anims.transform && this.currentAnim !== this.anims.biting) {
                if (this.vel.x !== 0 || this.vel.y !== 0) {
                    if (this.currentAnim !== this.anims.walking) {
                        this.currentAnim = this.anims.walking;
                    }
                }
                else {
                    if (this.currentAnim !== this.anims.idle) {
                        this.currentAnim = this.anims.idle;
                    }
                }
            }
        }
    },

    check: function(other) {
        if (!this.isSheep && other instanceof EntitySheep) {
            if (ig.input.released('space')) {
                this.eatSheep(other);
            }
            else {
                other.pickEscapeAngle();
            }
        }
    },

    eatSheep: function(sheep) {
        this.addEnergy(this.feedingEnergyBonus);
        sheep.getEaten();
    },

    checkMode: function() {
        if (ig.input.pressed('c')) {
            this.isSheep = !this.isSheep;
            this.setAnimations();
            this.currentAnim = this.anims.transform;
            this.currentAnim.angle = this.angle.toRad();
            if (this.isSheep) {
                this.playerWolfSound.stop();
                this.currentEnergyDepletion = this.sheepEnergyDepletion;
                this.speed = this.sheepSpeed;
            }
            else {
                this.currentEnergyDepletion = this.wolfEnergyDepletion;
                this.speed = this.wolfSpeed;
            }
            this.energyDepletionTimer.set = this.currentEnergyDepletion;
        }
    },

    depleteEnergy: function() {
        if (this.energy <= 0) {
            this.kill();
        }
        else {
            if (this.energyDepletionTimer.delta() > 0) {
                this.energyDepletionTimer.reset();
                this.energy -= this.currentEnergyDepletion;
                if (this.energy <= 15 && !this.energyWarning) {
                    this.energyWarning = true;
                    ig.game.setNotification('You are close to death! Eat a sheep now!', 'warning');
                }
                else if (this.energyWarning && this.energy > 15) {
                    this.energyWarning = false;
                }
            }
        }
    },

    addEnergy: function(amount) {
        if (this.energy + amount <= this.maxEnergy) {
            this.energy += amount;
        }
        else {
            this.energy = this.maxEnergy;
        }
    },

    kill: function() {
        this.playerWolfSound.stop();
        ig.game.loadLevel(LevelGameover);
        this.parent();
    },

    draw: function() {
        this.parent();
    }
});
});