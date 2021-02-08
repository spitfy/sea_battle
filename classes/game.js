class Game {
    constructor(settings) {
        this.settings = settings;
        this.ships = [];
        this.ship = [];
        this.cells = {x:[],y:[]}
        this.area =  {name: null, el: null};
        this.resetDirection();
        this.shipShoot = {
            coordX: [],
            coordY: []
        };
    }
    getCell(x, y, area = '') {
        const id = area || this.area.name;
        return document.getElementById(`${id}${x}:${y}`);
    }
    init() {
        console.log('init', this.COORDS)
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
        console.log('add_all', _c);
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
    }
    markAround(area) {
        let _x = this.shipShoot.coordX;
        let _y = this.shipShoot.coordY;
        _x.forEach((x, i) => {
            for (let n = -1; n < 2; n++) {
                for (let m = -1; m < 2; m++) {
                    let cell = this.getCell(x+n, _y[i]+m, area);
                    if (cell && (cell.classList.contains('wounded') || cell.classList.contains('shooted'))) {
                        continue;
                    }
                    cell && cell.classList.add('shooted');
                }
            }
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
}
export { Game };