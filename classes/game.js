class Game {
    constructor(settings) {
        this.settings = settings;
        this.ships = [];
        this.ship = [];
        this.cells = {x:[],y:[]}
        this.area =  {name: null, el: null};
        this.resetDirection();
    }
    getCell(x, y) {
        return document.getElementById(`${this.area.name}${x}:${y}`);
    }
    init() {
        this.area.el = document.getElementById('area-' + this.area.name);
        for(let y = 0; y < this.settings.size.y; y++) {
            for(let x = 0; x < this.settings.size.x; x++) {
                const el = document.createElement('div');
                el.classList.add('cell');
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
    }
    getID(cell) {
        const _cell = cell.getAttribute('id').split(':');
        return _cell.map(i => i.replace(/(cpu|man)/,'')).map(i => +i);
    }
}
export { Game };