function calculateTowerStatus(tower: number[], isComputer: boolean, gameOver: boolean) {
  if (gameOver || tower.length !== 10)
    return;

  let flyInAnimation = '';
  if (isComputer) {
    flyInAnimation = 'fly-in-right .6s ease-out forwards';
  } else {
    flyInAnimation = 'fly-in-left .6s ease-out forwards';
  }

  let errors = 0;
  let highest = 0;

  for (let i = 0; i < tower.length; i++) {
    if (tower[i] < highest)
      errors++;
    else if (tower[i] > highest)
      highest = tower[i];
  }
  if (errors <= 2)
    return { brickAnimation: flyInAnimation, towerAnimation: 'sway 18s ease-in-out infinite', brickContainerAnimation: 'flash-green 2s ease-in-out infinite' };
  else if (errors <= 4)
    return { brickAnimation: flyInAnimation, towerAnimation: 'sway 13s ease-in-out infinite', brickContainerAnimation: 'vibrate 3.5s ease-in-out infinites' }
  else
    return { brickAnimation: flyInAnimation, towerAnimation: 'sway 8s ease-in-out infinite', brickContainerAnimation: 'vibrate 2s ease-in-out infinite' };
}

export default calculateTowerStatus;