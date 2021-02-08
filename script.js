"use strict";
    const settings = {
        ships: {
            1: 4,
            2: 3,
            4: 1,
            3: 2,
        },
        size: {
            x:10,
            y:10
        },
        nums: {
            one: 1,
            two: 2,
            three: 3,
            four: 4,
        },
        word: {
            1: 'one',
            2: 'two',
            3: 'three',
            4: 'four',
        }
    };
    import { Human } from './classes/human.js';
    import { CPU } from './classes/cpu.js';



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
    const gameMan =  new Human(settings);
    const gameCPU =  new CPU(settings);
    const oneCellShip = document.getElementById('one-cell-ship');
    const twoCellShip = document.getElementById('two-cell-ship');
    const threeCellShip = document.getElementById('three-cell-ship');
    const fourCellShip = document.getElementById('four-cell-ship');
    document.addEventListener('DOMContentLoaded', function() {
        oneCellShip.innerText = settings.ships[1];
        twoCellShip.innerText = settings.ships[2];
        threeCellShip.innerText = settings.ships[3];
        fourCellShip.innerText = settings.ships[4];

        resetShip();
        gameMan.init();
        gameCPU.init();
        gameCPU.generate();

        /*area.onmouseout = e => {
            gameMan.can_drow = false;
            console.log('out')
        }*/
        document.querySelectorAll('.cell.man').forEach((el) => {
            el.addEventListener('mousedown', function(e) {
                gameMan.startDrow(e.target);
            });
            el.addEventListener('mouseover', function(e) {
                if (gameMan.can_drow) {
                    gameMan.drow(e.target);
                }
            });
            el.addEventListener('mouseup', function(e) {
                gameMan.endDrow(e.target);
            });
        });
        document.querySelectorAll('.cell.cpu').forEach((el) => {
            el.addEventListener('click', function(e) {
                if (!gameMan.shoot(e.target, gameCPU.ships)) {
                    gameCPU.shoot(gameMan.ships)
                }
            });
        });

        wound_btn = document.getElementById('wound_btn');
        wound_btn.addEventListener('click', function() {
            gameCPU.shoot(gameMan.ships)
            //shootShip(ship_shoot);
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
            _xy.cell = getCell(_xy.x, _xy.y)
            return _xy;
        }
        function genRandomShoot(random_shoot) {
            let _shoot = {
                    x: Math.floor(Math.random() * settings.size.x),
                    y: Math.floor(Math.random() * settings.size.y)
                };
            _shoot.cell = getCell(_shoot.x, _shoot.y);

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
                    for (let i = 0; i < gameMan.ships.length; i++) {
                        for (let j = 0; j < gameMan.ships[i].length; j++) {
                            if (gameMan.ships[i][j][coord]) {
                                ship_shoot.size = gameMan.ships[i][j][coord];
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
            return document.getElementById('man' + x + ':' + y); // todo: сделать выборку из класса
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