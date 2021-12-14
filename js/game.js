const KEYS = {
    LEFT: 37,
    RIGHT: 39,
    SPACE: 32
}
let game = {
    contextGame: null,
    platform: null,
    ball: null,
    blocks: [],
    rows: 4,
    cols: 8,
    width: 640,
    height: 360,
    sprites: {
        background: null,
        ball: null,
        platform: null,
        block: null
    },
    init: function () {
        this.contextGame = document.getElementById('mycanvas').getContext("2d");
        this.setEvents();
    },
    setEvents() {
        window.addEventListener('keydown', e => {
            if (e.keyCode === KEYS.SPACE) {
                this.platform.fire()
            } else if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
                this.platform.start(e.keyCode)
            }
        });
        window.addEventListener('keyup', e => {
            this.platform.stop()
        })
    },
    preload(callback) {
        let loaded = 0
        let required = Object.keys(this.sprites).length
        let onImageLoad = () => {
            ++loaded
            if (loaded >= required) {
                callback();
            }
        }
        for (let key in this.sprites) {
            this.sprites[key] = new Image();
            this.sprites[key].src = `./images/${key}.png`;
            this.sprites[key].addEventListener('load', onImageLoad)
        }
    },
    create() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.blocks.push({
                    active: true,
                    width: 60,
                    height: 20,
                    x: 64 * col + 65,
                    y: 24 * row + 35
                })
            }
        }
        console.log(this.blocks)
    },
    update() {
        this.platform.move();
        this.ball.move();
        this.ball.collideWorldBounds();
        this.collideBlocks();
        this.collidePlatform();
    },
    collideBlocks() {
        for (let block of this.blocks) {
            if (block.active && this.ball.collide(block)) {
                this.ball.bumpBlock(block);
            }
        }
    },
    collidePlatform() {
        if (this.ball.collide(this.platform)) {
            this.ball.bumpPlatform(this.platform);
        }
    },
    run() {
        window.requestAnimationFrame(() => {
            this.update()
            this.render();
            this.run();
        })
    },
    render() {
        this.contextGame.clearRect(0, 0, this.width, this.height);
        this.contextGame.drawImage(this.sprites.background, 0, 0);
        this.contextGame.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.contextGame.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.renderBlocks();
    },
    renderBlocks() {
        for (let block of this.blocks) {
            if (block.active) {
                this.contextGame.drawImage(this.sprites.block, block.x, block.y)
            }
        }
    },
    start() {
        this.init()
        this.preload(() => {
            this.create();
            this.run()
        })
        // this и есть наш game зачем this ?? можно и без него вроде обойтись
        // CanvasRenderingContext2D   - чтобы отрисовать графику используем getContext('2d') и поможет вывести на экран
        // const contextGame = document.getElementById('mycanvas').getContext("2d");
        // console.log(contextGame);
        // let background = new Image();
        // background.src = "./images/background.png";

        // window.requestAnimationFrame(() => {
        //         background.onload = () => {
        //             this.contextGame.drawImage(
        //                 background,
        //                 0,
        //                 0
        //             );
        //         }
        //     }
        // );
        // this.contextGame = document.getElementById('mycanvas').getContext("2d");
        // let background = new Image();
        // background.src = "./images/background.png";
        // background.onload = () => {
        //     this.contextGame.drawImage(
        //         background,
        //         0,
        //         0
        //     );
        // }
    },
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
};

game.ball = {
    velocity: 3,
    dx: 0,
    dy: 0,
    x: 320,
    y: 280,
    width: 20,
    height: 20,
    start() {
        this.dy = -this.velocity;
        this.dx = game.random(-this.velocity, +this.velocity);
    },
    move() {
        if (this.dy) {
            // this.y -= this.dy;
            this.y += this.dy;
        }
        if (this.dx) {
            this.x += this.dx;
        }
    },
    collide(element) {
        let x = this.x + this.dx;
        let y = this.y + this.dy;
        if (x + this.width > element.x &&
            x < element.x + element.width &&
            y + this.height > element.y &&
            y < element.y + element.height) {
            return true
        } else {
            return false
        }
    },
    bumpBlock(block) {
        this.dy *= -1
        block.active = false
    },
    bumpPlatform(platform) {
        if (this.dy > 0) {
            this.dy = -this.velocity;
            // координата касания с платформой:
            let touchX = this.x + this.width / 2;
            console.log(platform.getTouchOffset(touchX))
            this.dx = this.velocity * platform.getTouchOffset(touchX)
        }
    },
    collideWorldBounds() {
        let x = this.x + this.dx;
        let y = this.y + this.dy;

        let ballLeft = x;
        let ballRight = ballLeft + this.width;
        let ballTop = y;
        let ballBottom = ballTop + this.height;

        let worldLeft = 0;
        let worldRight = game.width;
        let worldTop = 0;
        let worldBottom = game.height;

        if (ballLeft < worldLeft) {
            this.x = 0;
            this.dx = this.velocity;
        } else if (ballRight > worldRight) {
            this.x = worldRight - this.width;
            this.dx = -this.velocity
        } else if (ballTop < worldTop) {
            this.dy = this.velocity;
            this.y = 0;

        } else if (ballBottom > worldBottom) {
            console.log('oops')
        }
    }
}

game.platform = {
    velocity: 6,
    dx: 0,
    x: 280,
    y: 300,
    width: 100,
    height: 14,
    ball: game.ball,
    fire() {
        if (this.ball) {
            this.ball.start()
            this.ball = null
        }
    },
    start(direction) {
        if (direction === KEYS.LEFT) {
            this.dx = -this.velocity
        } else if (direction === KEYS.RIGHT) {
            this.dx = this.velocity
        }
    },
    move() {
        if (this.dx) {
            this.x += this.dx;
            if (this.ball) {
                this.ball.x += this.dx
            }
        }
    },
    stop() {
        this.dx = 0
    },
    getTouchOffset(x) {
        //    1.получаем смещения мяча правую сторону координата правой стороні платформы и вычитаем координату касания:
        let diff = (this.x + this.width) - x;
        //    координату  касания, отнимаем от всей ширины отняли кусок платформы справа, а теперь мы узнали кусок слева платформы:
        let offset = this.width - diff;
        //
        //     this.width - 2
        //     offset - result? получаем значение координаты касания мяча с платформой:
        let result = 2 * offset / this.width;
        return result - 1;
    }
};
// почему window а не document ???? гарантированно выполниться код после загрузки всего html
document.addEventListener('DOMContentLoaded', () => {
    game.start();
})

