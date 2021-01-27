"use strict";
    let area = {man: null, cpu: null};
    const settings = {
        ships: [
            {one: 4},
            {two: 3},
            {three: 2},
            {four: 1},
        ],
        size: {
            x:10,
            y:10
        },
    };
    class Ship {
        constructor() {
            this.ships = [];
            this.ship = [];
            this.ship_index = null;
            this.cells = {x:[],y:[]}
        }
        init() {

        }
    }
    class DrowShip extends Ship{
        constructor() {
            super();
            this.can_drow = false;
            this.direction = {
                axis: 0,
                sign: 0
            };
            this.currentElem = null;
        }
        startDrow(cell) {
            if (this.checkNear(cell)) return;
            this.can_drow = true;
            cell.classList.add('ship');
            this.addShip(cell);
        }
        drow(cell) {
            console.log('drow')
            //if (this.currentElem) return;
            if (this.checkNear(cell)) return;
            if (this.ship.length == 2) {
                this.setDirection();
            }
            if (this.ship.length >= 2 && this.checkDirection(cell)) {
                cell.classList.add('ship');
                this.addShip(cell);
            } else if (this.ship.length < 2) {
                cell.classList.add('ship');
                this.addShip(cell);
            }
        }
        addShip(cell) {
            const _x = this.getID(cell)[0];
            const _y = this.getID(cell)[1];
            this.ship.push([_x, _y]);
            //this.cells.x.push(_x);
            //this.cells.y.push(_y);
        }
        endDrow() {
            //this.ship.forEach(cell => this.ships.push({[cell]:this.ship.length}));
            let _c = this.ship.map(cell => cell.join('')).map(function(cell) {
                return {[cell]: this.ship.length}
            }, this);
            this.ships.push(_c);
            this.ship.forEach(cell => {
                this.cells.x.push(cell[0]);
                this.cells.y.push(cell[1]);
            });
            this.can_drow = false;
            this.ship = [];
            this.direction = {
                axis: 0,
                sign: 0
            };
        }
        setDirection() {
            let _x, _y;
            this.ship.forEach((cell, i) => {
                if (i == 0) {
                    _x = cell[0];
                    _y = cell[1];
                } else {
                    this.direction.axis = cell[0] === _x ? 1 : -1;
                    this.direction.sign = (cell[0] < _x || cell[1] < _y) ? -1 : 1;
                }
            });
        }
        checkDirection(cell) {
            const i = this.ship.length - 1;
            return ((this.getID(cell)[0] === this.ship[i][0] && this.direction.axis === 1 &&
                (this.direction.sign === -1 && this.getID(cell)[1] +1 == this.ship[i][1]
                    || this.direction.sign === 1 && this.getID(cell)[1] == 1 + this.ship[i][1]))
                ||
                (this.getID(cell)[1] === this.ship[i][1] && this.direction.axis === -1 &&
                    (this.direction.sign === -1 && this.getID(cell)[0] + 1 == this.ship[i][0]
                        || this.direction.sign === 1 && this.getID(cell)[0] == 1 + this.ship[i][0]))
            );
        }
        getID(cell) {
            const _cell = cell.getAttribute('id').split(':');
            return _cell.map(i => +i);
        }
        checkNear(cell) {
            const _x = this.getID(cell)[0];
            const _y = this.getID(cell)[1];
           /* let _same = false;
            this.ship.forEach(el => {
                if (_same) return;
                let x = el[0];
                let y = el[1];
                if (x === _x && y - 1 === _y
                    || x === _x && y + 1 === _y
                    || x - 1 === _x && y === _y
                    || x + 1 === _x && y === _y
                ) {
                    _same = true;
                    return;
                };
            });
            console.log(_x+':'+_y+' _same- '+_same)
            if (_same) return false;*/
            console.log(_x+':'+_y+' _same- ')
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
            console.log(_x+':'+_y+' - '+_cells.length)
            return _cells.length;
        }
    }
    let shoot_btn
        ,wound_btn
        ,kill_btn;
    let is_random_shoot = true;
    let random_shoot = {};
    let ship_shoot = {};
    const COORDS = [
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
    const resetShip = () => {
        ship_shoot = {
            coordX: [],
            coordY: [],
            cells: 0,
            wounded: false,
            dir: 0,   // направление -1 - горизонтально, 1 - вертикально
            dirSign: 0,
            coords: shuffle(COORDS),
            size: 0 // размер текущего корабля
        };
    }
    const shuffle = (arr) => {
        return arr.sort(() => Math.round(Math.random() * 100) - 50);
    }
    const game = new DrowShip();
    document.addEventListener('DOMContentLoaded', function() {
        resetShip();
        area.man = document.getElementById('area-man');
        for(let y = 0; y < settings.size.y; y++) {
            for(let x = 0; x < settings.size.x; x++) {
                const el = document.createElement('div');
                el.classList.add('cell');
                el.id = x + ':' + y;
                area.man.appendChild(el);
                if (x && x % (settings.size.x-1) == 0) {
                    const br = document.createElement('br');
                    area.man.appendChild(br);
                }
            }
        }

        area.cpu = document.getElementById('area-cpu');
        for(let y = 0; y < settings.size.y; y++) {
            for(let x = 0; x < settings.size.x; x++) {
                const el = document.createElement('div');
                el.classList.add('cell');
                el.id = x + ':' + y;
                area.cpu.appendChild(el);
                if (x && x % (settings.size.x-1) == 0) {
                    const br = document.createElement('br');
                    area.cpu.appendChild(br);
                }
            }
        }
        /*area.onmouseout = e => {
            game.can_drow = false;
            console.log('out')
        }*/
        document.querySelectorAll('.cell').forEach((el) => {
            el.addEventListener('mousedown', function(e) {
                game.startDrow(e.target);
            });
            el.addEventListener('mouseover', function(e) {
                if (game.can_drow) {
                    game.drow(e.target);
                }
            });
            el.addEventListener('mouseup', function() {
                game.endDrow();
            });
        });

        wound_btn = document.getElementById('wound_btn');
        wound_btn.addEventListener('click', function() {
            shootShip(ship_shoot);
        });

        kill_btn = document.getElementById('kill_btn');
        kill_btn.addEventListener('click', function() {
            markAround();
            resetShip();
            genRandomShoot(random_shoot);
        });
        const kill = () => {
            markAround();
            genRandomShoot(random_shoot);
            resetShip();
        }

        shoot_btn = document.getElementById('shoot_btn');
        shoot_btn.addEventListener('click', function() {
            if (ship_shoot.wounded) {
                shootShip(ship_shoot);
                return;
            }
            if (!is_random_shoot && !isCorner(random_shoot)) {
                let _shoot = genNextShoot();
                if (_shoot.cell && !_shoot.cell.classList.contains('shooted')) {
                    shootRandom(_shoot, random_shoot);
                    return;
                }
                _shoot = genNextShoot(false);
                if (_shoot.cell && !_shoot.cell.classList.contains('shooted')) {
                    shootRandom(_shoot, random_shoot);
                    return;
                }
                _shoot = genNextShoot(true, false);
                if (_shoot.cell && !_shoot.cell.classList.contains('shooted')) {
                    shootRandom(_shoot, random_shoot);
                    return;
                }
                _shoot = genNextShoot(false, false);
                if (_shoot.cell && !_shoot.cell.classList.contains('shooted')) {
                    shootRandom(_shoot, random_shoot);
                    return;
                }
                genRandomShoot(random_shoot);
            } else {
                genRandomShoot(random_shoot);
            }
        });
        function genNextShoot(plusX = true, plusY = true) {
            let _xy = {
                x: plusX ? random_shoot.x + 1 : random_shoot.x - 1,
                y: plusY ? random_shoot.y + 1 : random_shoot.y - 1
            };
            _xy.cell = document.getElementById(_xy.x + ':' + _xy.y)
            return _xy;
        }
        function genRandomShoot(random_shoot) {
            let _shoot = {
                    x: Math.floor(Math.random() * settings.size.x),
                    y: Math.floor(Math.random() * settings.size.y)
                };
            _shoot.cell = document.getElementById(_shoot.x + ':' + _shoot.y);

            if (_shoot.cell && !_shoot.cell.classList.contains('shooted')) {
                shootRandom(_shoot, random_shoot);
                is_random_shoot = false;
            } else {
                genRandomShoot(random_shoot)
            }
        }
        function shootRandom(_shoot, random_shoot) {
            if (isShip(_shoot)) {
                _shoot.cell.classList.add('shooted');
                hitTheMark(_shoot)
            } else {
                _shoot.cell.classList.add('shooted');
                Object.assign(random_shoot, _shoot);
            }
        }
        function isCorner(_shoot) {
            return ((_shoot.x + 1) == settings.size.x && (_shoot.y + 1) == settings.size.y
                || _shoot.x == 0  && _shoot.y == 0
                || (_shoot.x + 1) == settings.size.x  && _shoot.y == 0
                || _shoot.x == 0  && (_shoot.y + 1) == settings.size.y
            );
        }
        function isOutOfBorders(_ship) {
            return (_ship.x >= settings.size.x
                || _ship.x < 0
                || _ship.y >= settings.size.y
                || _ship.y < 0
            );
        }
        function checkPrevious(_shoot) {
            let flag = false;
            ship_shoot.coordX.forEach((x, i) => {
                if (_shoot.x == x && _shoot.y == ship_shoot.coordY[i]) {
                    flag = true;
                }
            });
            return flag;
        }
        function isShip(_shoot) {
            return _shoot.cell.classList.contains('ship');
        }
        function shootShip(_shoot, num = 1) {
            let _ship;
            let _dirs = [];
            for (let coord of ship_shoot.coords) {
                if (ship_shoot.dir && ship_shoot.dir !== coord.dir) {
                    continue;
                }
                if (ship_shoot.dirSign && ship_shoot.dirSign !== coord.dirSign) {
                    continue;
                }
                if (ship_shoot.size === ship_shoot.cells) {
                    kill();
                }
                if (ship_shoot.dirSign && ship_shoot.dir) { // сохраняем направление атаки
                    _dirs.push(coord.dir + ':' + coord.dirSign);
                }
                _ship = genNextShipShoot(_shoot, coord, num);
                if (isOutOfBorders(_ship)) {
                    revertDir(coord);
                    if (_dirs.includes(ship_shoot.dir + ':' + ship_shoot.dirSign)) { // если уже пробовали стрелять в этом направлении, идем в рекурсию
                        shootShip(_shoot, ship_shoot.cells);
                        break;
                    }
                    continue;
                }
                if (_ship.cell && _ship.cell.classList.contains('shooted')) {
                    if (_ship.cell.classList.contains('wounded')) {
                        shootShip(_shoot, ship_shoot.cells);
                        break;
                    } else {
                        revertDir(coord);
                    }
                    continue;
                } else {
                    hitTheMark(_ship, coord);
                    break;
                }
            }
        }
        function revertDir(coord) {
            if (!ship_shoot.dir) return;
            ship_shoot.dirSign = -(coord.x ? coord.x : coord.y);
        }
        function genNextShipShoot(_shoot, coord, num) {
            let _xy;
            if (ship_shoot.dirSign) {
                _xy = {
                    x: ship_shoot.dirSign > 0 && coord.x ? _shoot.x + num : (coord.x === 0 ? _shoot.x : _shoot.x - num),
                    y: ship_shoot.dirSign > 0 && coord.y ? _shoot.y + num : (coord.y === 0 ? _shoot.y : _shoot.y - num),
                };
            } else {
                _xy = {
                    x: coord.x > 0 ? _shoot.x + num : (coord.x === 0 ? _shoot.x : _shoot.x - num),
                    y: coord.y > 0 ? _shoot.y + num : (coord.y === 0 ? _shoot.y : _shoot.y - num),
                };
            }

            _xy.cell = getCell(_xy.x, _xy.y)
            return _xy;
        }
        function hitTheMark(_ship, _coord = {}) {
            _ship.cell.classList.add('shooted');
            if (isShip(_ship)) {
                saveShipData(_ship, _coord);
                const coord = _ship.x+''+_ship.y;
                if (!ship_shoot.size) {
                    for (let i = 0; i < game.ships.length; i++) {
                        for (let j = 0; j < game.ships[i].length; j++) {
                            if (game.ships[i][j][coord]) {
                                ship_shoot.size = game.ships[i][j][coord];
                            }
                        }
                    }
                }
                if (ship_shoot.size === ship_shoot.cells) {
                    kill();
                }
                return true;
            }
            return false;
        }
        function saveShipData(_ship, _coord) {
            _ship.cell.classList.add('wounded');
            Object.assign(ship_shoot, _ship);
            ship_shoot.coordX.push(_ship.x);
            ship_shoot.coordY.push(_ship.y);
            ship_shoot.cells++;
            ship_shoot.wounded = true;
            if (!isEmpty(_coord)) {
                ship_shoot.dir = _coord.dir;
                ship_shoot.dirSign = _coord.x ? _coord.x : _coord.y;
            }
        }
        function markAround() {
            let _x = ship_shoot.coordX;
            let _y = ship_shoot.coordY;
            _x.forEach((x, i) => {
                for (let n = -1; n < 2; n++) {
                    for (let m = -1; m < 2; m++) {
                        let cell = getCell(x+n, _y[i]+m);
                        if (cell && (cell.classList.contains('wounded') || cell.classList.contains('shooted'))) {
                            continue;
                        }
                        cell && cell.classList.add('shooted');
                    }
                }
            });
        }
        function getCell(x, y) {
            return document.getElementById(x + ':' + y);
        }
        const isEmpty = (obj) => {
            for (let prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }
            return JSON.stringify(obj) === JSON.stringify({});
        }

    });