class Game {
    constructor(settings) {
        this.settings = settings;
        this.ships = [];
        this.ship = [];
        this.cells = {x:[],y:[]}
        this.area =  {name: null, el: null};
        this.resetDirection();
        this.allowDrow = true;
        this.shipShoot = {
            coordX: [],
            coordY: []
        };
        this.shipKilled = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
        };//потопленные корабли человека
        this.COORDS = [
            {
                x: 1,
                y: 0,
                dir: -1,
                dirSign: 1,
            },
            {
                x: -1,
                y: 0,
                dir: -1,
                dirSign: -1,
            },
            {
                x: 0,
                y: 1,
                dir: 1,
                dirSign: 1,
            },
            {
                x: 0,
                y: -1,
                dir: 1,
                dirSign: -1,
            },
        ];
    }
    getCell(x, y, area = '') {
        const id = area || this.area.name;
        return document.getElementById(`${id}${x}:${y}`);
    }
    init() {
        this.area.el = document.getElementById('area-' + this.area.name);
        for(let y = 0; y < this.settings.size.y; y++) {
            for(let x = 0; x < this.settings.size.x; x++) {
                const el = document.createElement('div');
                el.classList.add('cell', this.area.name);
                el.id = this.area.name + x + ':' + y;
                this.area.el.appendChild(el);
                if (x && x % (this.settings.size.x-1) == 0) {
                    const br = document.createElement('br');
                    this.area.el.appendChild(br);
                }
            }
        }
    }

    generate() {
        const getRandom = (num) => {
            let rand = this.randomCell(num);
            if (num > 1) {
                let coord = {};
                Object.assign(coord, this.shuffle(this.COORDS)[0]);
                if (this.getNextCell(rand, coord, num)) {
                    this.resetDirection();
                    return true;
                } else {
                    this.ship = [];
                    if (getRandom(num)) {
                        return true;
                    } else {
                        // todo реализовать рекурсию
                        console.log('что то пошло не так: ' + num)
                        return false;
                    }
                }
            } else {
                this.addShip(rand.cell);
                this.addAllships();
                return true;
            }
        }
        for (let num in this.settings.ships) {
            for (let i = 0; i < this.settings.ships[+num]; i++) {
                getRandom(+num);
            }
        }
        this.allowDrow = false;
    }
    randomCell(size) {
        let rand = {
            x: Math.floor(Math.random() * this.settings.size.x),
            y: Math.floor(Math.random() * this.settings.size.y)
        };
        rand.cell = this.getCell(rand.x, rand.y);

        if (!rand.cell
            || rand.cell.classList.contains('ship')
            || this.checkNear(rand.cell)
        ) {
            rand = this.randomCell();
        }
        if (size === 1) {
            this.cells.x.push(rand.x);
            this.cells.y.push(rand.y);
        }
        return rand;
    }
    getNextCell(cell, direction, size, change = false) {
        let i = 1;
        let _arr = {x:[], y:[], cells:[]};
        let _cell = {};
        _arr.x.push(cell.x);
        _arr.y.push(cell.y);
        _arr.cells.push(cell.cell);

        if (this.generateDir.changed) { // меняем направление
            direction.x = -direction.x;
            direction.y = -direction.y;
        }
        if (this.generateDir.axis) { // меняем ось координат
            let _x = direction.x;
            direction.x = direction.x ? 0 : direction.y;
            direction.y = direction.y ? 0 : _x;
        }

        while (i < size) {
            if (direction.x && direction.x < 0) {
                _cell.x = cell.x - i;
                _cell.y = cell.y;
            }
            if (direction.x && direction.x > 0) {
                _cell.x = cell.x + i;
                _cell.y = cell.y;
            }
            if (direction.y && direction.y < 0) {
                _cell.x = cell.x;
                _cell.y = cell.y - i;
            }
            if (direction.y && direction.y > 0) {
                _cell.x = cell.x;
                _cell.y = cell.y + i;
            }
            _cell.el = this.getCell(_cell.x, _cell.y);

            if (_cell.el && this.checkNear(_cell.el) || this.isOutOfBorders(_cell)) {
                change = !change;
                let axis = !change ? direction.dir : 0;
                if (this.revertDirection(change, axis)) {
                    _arr.x.length = 1;
                    _arr.y.length = 1;
                    return this.getNextCell(cell, direction, size, change);
                } else {
                    return false;
                }
            } else {
                _arr.x.push(_cell.x);
                _arr.y.push(_cell.y);
                _arr.cells.push(_cell.el);
            }
            i++;
        }
        if (_arr.x.length === size) {
            _arr.x.forEach((x, i) => {
                //this.getCell(x, _arr.y[i]).classList.add('ship');
                this.addShip(_arr.cells[i]);
                this.cells.x.push(x);
                this.cells.y.push(_arr.y[i]);
            });
            this.addAllships();
            return true;
        } else {
            return false;
        }
    }







    isOutOfBorders(cell) {
        return (cell.x >= this.settings.size.x
            || cell.x < 0
            || cell.y >= this.settings.size.y
            || cell.y < 0
        );
    }
    revertDirection(dir = false, axis) {
        if (dir) {
            this.generateDir.changed = !this.generateDir.changed;
        } else {
            this.generateDir.axis = -axis;
        }
        return ++this.generateDir.cnt < 4;
    }
    resetDirection() {
        this.generateDir = {changed: false, axis: 0, cnt: 0};// учитывается при генерации кораблей
    }
    checkNear(cell) {
        const _x = this.getID(cell)[0];
        const _y = this.getID(cell)[1];
        const _cells = this.cells.x.filter((x, i) => {
            let y = this.cells.y[i];
            if (x + 1 === _x && y + 1 === _y
                || x - 1 === _x && y - 1 === _y
                || x - 1 === _x && y + 1 === _y
                || x + 1 === _x && y - 1 === _y
                || x === _x && y - 1 === _y
                || x === _x && y + 1 === _y
                || x - 1 === _x && y === _y
                || x + 1 === _x && y === _y
            ) return true;
            return false;
        }, this);
        return _cells.length;
    }
    addShip(cell) {
        const _x = this.getID(cell)[0];
        const _y = this.getID(cell)[1];
        this.ship.push([_x, _y]);
        cell.classList.add('ship');
    }
    addAllships() {
        let _c = this.ship.map(cell => cell.join('')).map(function(cell) {
            return {[cell]: this.ship.length}
        }, this);
        this.ships.push(_c);
        this.ship = [];
    }
    getID(cell) {
        const _cell = cell.getAttribute('id').split(':');
        return _cell.map(i => i.replace(/(cpu|man)/,'')).map(i => +i);
    }
    shuffle(arr) {
        return arr.sort(() => Math.round(Math.random() * 100) - 50);
    }
    kill(area) {
        this.markAround(area);
        this.resetShip();
        if (this.isEndGame()) {
            this.showEndGameScreen();
        }
    }
    markAround(area) {
        let _x = this.shipShoot.coordX;
        let _y = this.shipShoot.coordY;
        let cells = [];
        _x.forEach((x, i) => {
            for (let n = -1; n < 2; n++) {
                for (let m = -1; m < 2; m++) {
                    let cell = this.getCell(x+n, _y[i]+m, area);
                    if (cell && (cell.classList.contains('wounded') || cell.classList.contains('shooted') || cells.includes(cell))) {
                        continue;
                    }
                    if (cell) {
                        cells.push(cell);
                    }
                }
            }
        });
        cells.forEach((cell, i) => {
            console.log('i', i)
            this.delay(() => {
                this.boom(cell);
            }, ++i);
        });
    }
    getShipSize(ship, ships) {
        const coord = ship.x+''+ship.y;
        for (let i = 0; i < ships.length; i++) {
            for (let j = 0; j < ships[i].length; j++) {
                if (ships[i][j][coord]) {
                    return ships[i][j][coord];
                }
            }
        }
        return false;
    }
    resetShip() {
        this.shipShoot = {
            coordX: [],
            coordY: []
        };
    }
    isShip(_shoot) {
        return _shoot.classList.contains('ship');
    }
    isEmpty(obj) {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return JSON.stringify(obj) === JSON.stringify({});
    }
    isEndGame() {
        return this.compareShips(this.settings.ships, this.shipKilled);
    }
    compareShips(setting, ships) {
        for (let i in setting) {
            if (setting[i] !== ships[i]) return false;
        }
        return true;
    }
    showEndGameScreen() {
        let message, area;
        if (this.area.name === 'cpu') {
            area = 'man';
            message = 'Вы проиграли!';
        } else {
            area = 'cpu';
            message = 'Вы победили!';
        }
        document.querySelector( `#area-${area} .end-screen`).style.display = 'flex';
        document.querySelector( `#area-${area} .end-screen .loose`).innerHTML = message;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async delay(callback, ms = 1) {
        await this.sleep(this.settings.ms * ms);
        callback && callback();
    }
    boom(cell) {
        cell.classList.add('shooted');
        this.delay(() => cell.classList.add('boom'), 0.01);
    }
}
export { Game };