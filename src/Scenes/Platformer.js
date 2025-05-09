class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 2000;
        this.DRAG = 8000;    // DRAG < ACCELERATION = icy slide
        this.MAX_VELOCITY = 500;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -700;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 40, 40);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setScale(SCALE);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // get playerspawn point
        let tempPlayerSprite = this.map.createFromObjects('PlayerSpawn')[0];

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(tempPlayerSprite.x*SCALE, tempPlayerSprite.y*SCALE, "platformer_characters", "tile_0000.png").setScale(SCALE)
        tempPlayerSprite.destroy();

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // create coins
        my.coins = this.map.createFromObjects('Coins', {classType: Phaser.Physics.Arcade.Sprite}, false);
        for (let coin of my.coins) {
            this.physics.add.existing(coin);
            coin.setPosition(coin.x*SCALE, coin.y*SCALE);
            coin.setTexture("tilemap_tiles", 151);
            coin.setScale(SCALE);
            coin.setSize(10, 10);
            coin.body.allowGravity = false;
        }

        // set up coin collision
        this.score = 0;
        this.physics.add.overlap(my.sprite.player, my.coins, (player, coin) => {
            coin.destroy();
            this.score += 1;
            console.log("Score: " + this.score);
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        this.cameras.main.startFollow(my.sprite.player, false, 0.15, 1);
    }

    update() {
        this.cameras.main.setFollowOffset(-my.sprite.player.body.velocity.x/5, 0);

        if(cursors.left.isDown) {
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);

            if (my.sprite.player.body.velocity.x < -this.MAX_VELOCITY) {
                my.sprite.player.body.setVelocityX(-this.MAX_VELOCITY);
            }
            
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

        } else if(cursors.right.isDown) {
            my.sprite.player.body.setAccelerationX(this.ACCELERATION);

            if (my.sprite.player.body.velocity.x > this.MAX_VELOCITY) {
                my.sprite.player.body.setVelocityX(this.MAX_VELOCITY);
            }

            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

        } else {
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);

            my.sprite.player.anims.play('idle');
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

        }
    }
}