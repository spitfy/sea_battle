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
        /*nums: {
            one: 1,
            two: 2,
            three: 3,
            four: 4,
        },*/
        word: {
            1: 'one',
            2: 'two',
            3: 'three',
            4: 'four',
        },
        ms: 200
    };
    import { Human } from './classes/human.js';
    import { CPU } from './classes/cpu.js';

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

        gameMan.init();
        gameCPU.init();
        gameCPU.generate();

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
                    gameCPU.delay(() => {
                        gameCPU.shoot(gameMan.ships);
                    });
                }
            });
        });
        const gen_btn = document.getElementById('gen_btn');
        gen_btn.addEventListener('click', function(e) {
            gameMan.generate();
            document.querySelector( '#area-cpu .block-screen').style.display = 'none';
        });

    });