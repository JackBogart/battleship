import '../css/style.css';
import 'normalize.css';

const gameboards = document.querySelectorAll('.gameboard');

gameboards.forEach((grid) => {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const gridCell = document.createElement('div');
      gridCell.dataset.row = row;
      gridCell.dataset.col = col;

      grid.appendChild(gridCell);
    }
  }
});
