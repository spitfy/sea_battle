import {Game} from "./game.js";

class Human extends Game{
    constructor(settings) {
        super(settings);
        this.area.name = 'man';
        this.can_drow = false;
        this.direction = {
            axis: 0,
            sign: 0
        };
        this.currentShip = {size: 0, shooted: 0};
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
    endDrow() {
        //this.ship.forEach(cell => this.ships.push({[cell]:this.ship.length}));
        /*let _c = this.ship.map(cell => cell.join('')).map(function(cell) {
            return {[cell]: this.ship.length}
        }, this);
        this.ships.push(_c);*/
        this.ship.forEach(cell => {
            this.cells.x.push(cell[0]);
            this.cells.y.push(cell[1]);
        });
        this.can_drow = false;
        this.addAllships();
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
    shoot(cell, ships) {
        if (this.isShip(cell)) {
            const ship = this.getID(cell);
            ship.x = ship[0];
            ship.y = ship[1];
            this.currentShip.shooted++;
            this.shipShoot.coordX.push(ship.x);
            this.shipShoot.coordY.push(ship.y);
            cell.classList.add('wounded', 'shooted');
            if (this.getShipSize(ship, ships) === this.currentShip.shooted) {
                this.kill('cpu');
                this.currentShip.shooted = 0;
            }
            return true;
        }
        cell.classList.add('shooted');
        return false;
    }
}
export { Human };