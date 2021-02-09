import {Game} from "./game.js";

class Human extends Game{
    constructor(settings) {
        super(settings);
        this.area.name = 'man';
        this.can_drow = false;
        this.usedShips =  {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
        };
        this.direction = {
            axis: 0,
            sign: 0
        };
        this.currentShip = {size: 0, shooted: 0};
    }
    startDrow(cell) {
        if (!this.allowDrow) return;
        if (this.checkNear(cell)) return;
        this.can_drow = true;
        this.addShip(cell);
    }
    drow(cell) {
        if (this.checkNear(cell)) return;
        if (this.usedShips[this.ship.length] >= this.settings.ships[1]) return;
        if (this.ship.length == 2) {
            this.setDirection();
        }
        if (this.ship.length >= 2 && this.checkDirection(cell)) {
            this.addShip(cell);
        } else if (this.ship.length < 2) {
            this.addShip(cell);
        }
    }
    endDrow() {
        this.shipCnt();
        const size = this.ship.length;
        if (this.usedShips[size] > this.settings.ships[size]
            || size > 4
        ) {
            // удаляем корабль
            this.shipCnt(false);
            this.ship.forEach((cell, i)=> {
                this.getCell(cell[0], cell[1]).classList.remove('ship');
            });
            this.ship = [];
        } else {
            this.ship.forEach(cell => {
                this.cells.x.push(cell[0]);
                this.cells.y.push(cell[1]);
            });
            this.addAllships();
            if (this.compareShips(this.settings.ships, this.usedShips)) {
                document.querySelector( '#area-cpu .block-screen').style.display = 'none';
            }
        }
        this.can_drow = false;
        this.direction = {
            axis: 0,
            sign: 0
        };
    }
    shipCnt(pos = true) {
        const ship = document.getElementById(this.settings.word[this.ship.length] + '-cell-ship');
        if (!ship) return;
        if (pos) {
            ship.innerText = +ship.innerText - 1;
            this.usedShips[this.ship.length]++;
        } else {
            ship.innerText = +ship.innerText + 1;
            this.usedShips[this.ship.length]--;
        }

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
    kill(area) {
        this.shipKilled[this.currentShip.shooted]++;
        super.kill(area);
    }

    shoot(cell, ships) {
        if (this.isShip(cell)) {
            const ship = this.getID(cell);
            ship.x = ship[0];
            ship.y = ship[1];
            this.currentShip.shooted++;
            this.shipShoot.coordX.push(ship.x);
            this.shipShoot.coordY.push(ship.y);
            cell.classList.add('wounded');
            this.boom(cell);
            if (this.getShipSize(ship, ships) === this.currentShip.shooted) {
                this.kill('cpu');
                this.currentShip.shooted = 0;
            }
            return true;
        }
        this.boom(cell);
        return false;
    }
}
export { Human };