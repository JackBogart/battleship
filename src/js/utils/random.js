export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function shuffleArray(array) {
  const shuffledArray = array.slice();

  // Fisher-Yates algorithm
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray;
}
