import {Game} from "./game.js";

class CPU extends Game{
    constructor(settings) {
        super(settings);
        this.area.name = 'cpu';
        this.can_drow = false;
        this.isRandomShoot = true;
        this.randomShoot = {};
        this.shipsMan = []; // корабли человека
        this.shoots = {x: [], y: []};
        this.direction = {
            axis: 0,
            sign: 0
        };
        this.resetShip();
    }
    kill() {
        this.shipKilled[this.shipShoot.size]++;
        super.kill();
        this.genRandomShoot(this.randomShoot);
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
    isBigShipsAlive() { // проверяем остались ли большие корабли
        for (let i in this.shipKilled) {
            if (i > 1 && this.shipKilled[i] < this.settings.ships[i]) {
                return true;
            }
        }
        return false;
    }
    checkNearShoot(shoot) {
        const _x = shoot.x;
        const _y = shoot.y;
        const _cells = this.shoots.x.filter((x, i) => {
            let y = this.shoots.y[i];
            if (x === _x && y - 1 === _y
                || x === _x && y + 1 === _y
                || x - 1 === _x && y === _y
                || x + 1 === _x && y === _y
            ) return true;
            return false;
        }, this);
        return _cells.length;
    }
    shoot(ships) {
        if (this.isEndGame()) return;
        if (!this.shipsMan.length) {
            this.shipsMan = ships;
        }
        if (this.shipShoot.wounded) {
            this.shootShip(this.shipShoot);
            return;
        }
        if (!this.isRandomShoot && !this.isCorner(this.randomShoot) && this.isBigShipsAlive()) {
            let _shoot = this.genNextShoot();
            if (_shoot.cell && !_shoot.cell.classList.contains('shooted') && !this.checkNearShoot(_shoot)) {
                this.shootRandom(_shoot, this.randomShoot);
                return;
            }
            _shoot = this.genNextShoot(false);
            if (_shoot.cell && !_shoot.cell.classList.contains('shooted') && !this.checkNearShoot(_shoot)) {
                this.shootRandom(_shoot, this.randomShoot);
                return;
            }
            _shoot = this.genNextShoot(true, false);
            if (_shoot.cell && !_shoot.cell.classList.contains('shooted') && !this.checkNearShoot(_shoot)) {
                this.shootRandom(_shoot, this.randomShoot);
                return;
            }
            _shoot = this.genNextShoot(false, false);
            if (_shoot.cell && !_shoot.cell.classList.contains('shooted') && !this.checkNearShoot(_shoot)) {
                this.shootRandom(_shoot, this.randomShoot);
                return;
            }
            this.genRandomShoot(this.randomShoot);
        } else {
            this.genRandomShoot(this.randomShoot);
        }
    }
    genNextShoot(plusX = true, plusY = true) {
        let _xy = {
            x: plusX ? this.randomShoot.x + 1 : this.randomShoot.x - 1,
            y: plusY ? this.randomShoot.y + 1 : this.randomShoot.y - 1
        };
        _xy.cell = this.getCell(_xy.x, _xy.y, 'man')
        return _xy;
    }
    genRandomShoot(random_shoot) {
        let _shoot = {
            x: Math.floor(Math.random() * this.settings.size.x),
            y: Math.floor(Math.random() * this.settings.size.y)
        };
        _shoot.cell = this.getCell(_shoot.x, _shoot.y, 'man');

        if (_shoot.cell && !_shoot.cell.classList.contains('shooted')) {
            this.shootRandom(_shoot, random_shoot);
            this.isRandomShoot = false;
        } else {
            this.genRandomShoot(random_shoot)
        }
    }
    shootRandom(_shoot, random_shoot) {
        if (this.isShip(_shoot.cell)) {
            this.hitTheMark(_shoot)
        } else {
            Object.assign(random_shoot, _shoot);
            this.addShoot(_shoot);
        }
    }
    isCorner(_shoot) {
        return ((_shoot.x + 1) == this.settings.size.x && (_shoot.y + 1) == this.settings.size.y
            || _shoot.x == 0  && _shoot.y == 0
            || (_shoot.x + 1) == this.settings.size.x  && _shoot.y == 0
            || _shoot.x == 0  && (_shoot.y + 1) == this.settings.size.y
        );
    }
    isOutOfBorders(_ship) {
        return (_ship.x >= this.settings.size.x
            || _ship.x < 0
            || _ship.y >= this.settings.size.y
            || _ship.y < 0
        );
    }
    shootShip(_shoot, num = 1) {
        let _ship;
        let _dirs = [];
        for (let coord of this.shipShoot.coords) {
            if (this.shipShoot.dir && this.shipShoot.dir !== coord.dir) {
                continue;
            }
            if (this.shipShoot.dirSign && this.shipShoot.dirSign !== coord.dirSign) {
                continue;
            }
            if (this.shipShoot.size === this.shipShoot.cells) {
                this.kill('man');
            }
            if (this.shipShoot.dirSign && this.shipShoot.dir) { // сохраняем направление атаки
                _dirs.push(coord.dir + ':' + coord.dirSign);
            }
            _ship = this.genNextShipShoot(_shoot, coord, num);
            if (this.isOutOfBorders(_ship)) {
                this.revertDir(coord);
                if (_dirs.includes(this.shipShoot.dir + ':' + this.shipShoot.dirSign)) { // если уже пробовали стрелять в этом направлении, идем в рекурсию
                    this.shootShip(_shoot, this.shipShoot.cells);
                    break;
                }
                continue;
            }
            if (_ship.cell && _ship.cell.classList.contains('shooted')) {
                if (_ship.cell.classList.contains('wounded')) {
                    this.shootShip(_shoot, this.shipShoot.cells);
                    break;
                } else {
                    this.revertDir(coord);
                }
                continue;
            } else {
                this.hitTheMark(_ship, coord);
                break;
            }
        }
    }
    revertDir(coord) {
        if (!this.shipShoot.dir) return;
        this.shipShoot.dirSign = -(coord.x ? coord.x : coord.y);
    }
    genNextShipShoot(_shoot, coord, num) {
        let _xy;
        if (this.shipShoot.dirSign) {
            _xy = {
                x: this.shipShoot.dirSign > 0 && coord.x ? _shoot.x + num : (coord.x === 0 ? _shoot.x : _shoot.x - num),
                y: this.shipShoot.dirSign > 0 && coord.y ? _shoot.y + num : (coord.y === 0 ? _shoot.y : _shoot.y - num),
            };
        } else {
            _xy = {
                x: coord.x > 0 ? _shoot.x + num : (coord.x === 0 ? _shoot.x : _shoot.x - num),
                y: coord.y > 0 ? _shoot.y + num : (coord.y === 0 ? _shoot.y : _shoot.y - num),
            };
        }

        _xy.cell = this.getCell(_xy.x, _xy.y, 'man')
        return _xy;
    }
    addShoot(shoot) {
        this.boom(shoot.cell);
        this.shoots.x.push(shoot.x);
        this.shoots.y.push(shoot.y);
    }
    hitTheMark(_ship, _coord = {}) {
        this.addShoot(_ship);
        if (this.isShip(_ship.cell)) {
            this.saveShipData(_ship, _coord);
            const coord = _ship.x+''+_ship.y;
            if (!this.shipShoot.size) {
                for (let i = 0; i < this.shipsMan.length; i++) { //todo
                    for (let j = 0; j < this.shipsMan[i].length; j++) {
                        if (this.shipsMan[i][j][coord]) {
                            this.shipShoot.size = this.shipsMan[i][j][coord];
                        }
                    }
                }
            }
            if (this.shipShoot.size === this.shipShoot.cells) {
                this.kill();
                return;
            }
            this.delay(() => {
                this.shootShip(this.shipShoot);
            }, this.shipShoot.cells);
            return true;
        }
        return false;
    }
    saveShipData(_ship, _coord) {
        _ship.cell.classList.add('wounded');
        Object.assign(this.shipShoot, _ship);
        this.shipShoot.coordX.push(_ship.x);
        this.shipShoot.coordY.push(_ship.y);
        this.shipShoot.cells++;
        this.shipShoot.wounded = true;
        if (!this.isEmpty(_coord)) {
            this.shipShoot.dir = _coord.dir;
            this.shipShoot.dirSign = _coord.x ? _coord.x : _coord.y;
        }
    }
    markAround() {
        let _x = this.shipShoot.coordX;
        let _y = this.shipShoot.coordY;
        let cells = [];
        let _xy = []
        _x.forEach((x, i) => {
            for (let n = -1; n < 2; n++) {
                for (let m = -1; m < 2; m++) {
                    const cell = this.getCell(x+n, _y[i]+m, 'man');
                    if (cell && (cell.classList.contains('wounded') || cell.classList.contains('shooted') || cells.includes(cell))) {
                        continue;
                    }
                    if (cell) {
                        cells.push(cell);
                        _xy.push({
                            x: x + n,
                            y: _y[i] + m
                        });
                    }
                    /*cell && this.delay(() => {
                        this.addShoot({
                            x: x + n,
                            y: _y[i] + m,
                            cell: cell
                        });
                    }, ++ms);*/
                }
            }
        });
        cells.forEach((cell, i) => {
            console.log(i);
            this.delay(() => {
                this.boom(cell);
                this.shoots.x.push(_xy[i].x);
                this.shoots.y.push(_xy[i].y);
            }, i + 1);
        });
    }
}
export {CPU};