import {Game} from "./game.js";

class CPU extends Game{
    constructor(settings) {
        super(settings);
        this.area.name = 'cpu';
        this.can_drow = false;
        this.direction = {
            axis: 0,
            sign: 0
        };
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
        this.resetShip();
    }
    generate() {
        const getRandom = (num) => {
            let rand = this.randomCell(this.settings.nums[num]);
            if (this.settings.nums[num] > 1) {
                if (this.getNextCell(rand, this.shuffle(this.COORDS)[0], this.settings.nums[num])) {
                    this.resetDirection();
                    return true;
                } else {
                    this.ship = [];
                    if (getRandom(num)) {
                        return true;
                    } else {
                        // todo реализовать рекурсию
                        console.log('что то пошло не так: ' + num + this.settings.nums[num])
                        return false;
                    }
                }
            } else {
                rand.cell.classList.add('ship');
                this.addShip(rand.cell);
                this.addAllships();
                console.log(num + ': ' +this.settings.nums[num])
                return true;
            }
        }
        for (let num in this.settings.ships) {
            for (let i = 0; i < this.settings.ships[num]; i++) {
                getRandom(num);
            }
        }
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
                this.getCell(x, _arr.y[i]).classList.add('ship');
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
    kill() {
        super.kill();
        //genRandomShoot(random_shoot); todo
    }
    resetShip() {
        super.resetShip();
        this.shipShoot.coords = this.shuffle(this.COORDS);
        this.shipShoot.cells = 0;
        this.shipShoot.wounded = false;
        this.shipShoot.dir = 0; // направление -1 - горизонтально, 1 - вертикально
        this.shipShoot.dirSign = 0;
        this.shipShoot.size = 0; // размер текущего корабля
    }
}
export {CPU};