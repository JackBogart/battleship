## Battleship!

### Todo

- Refactor control/view logic
  - Can probably abstract a lot of the view, exposing methods for each view
    (view meaning stage of the game) as needed, and methods related to action
    listeners.
  - Re-examine the drag and drop system, should we remove/create ships or move
    their position?
  - Can also standardize how event delegation is handler. We shouldn't have
    logic sometimes in the view, and sometimes in the controller
- Add dark mode
- Final UI review
- Clean up the README to show off the project

### Known Bugs

- Look into why drag and drop API cursors aren't appearing without CSS

### Stretch Goals

- Add messages about type of ship sunk
  - Not sure how to do this in a way that looks good. Currently I've moved this
    to the bottom but the idea might be dropped. Need to brainstorm.
- Add feedback for failed rotation attempts, make the ship(s) preventing
  rotation blink red?
- Improve AI?
- Options menu to change site theme color?
  - This isn't required at all but would be kinda cool
