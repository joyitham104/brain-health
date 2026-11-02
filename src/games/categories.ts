export type Category = { name: string; words: string[]; band: 'easy' | 'mid' | 'letter' };
//defines the categories of the word fluency game (difficulty and accepted answers)

export const CATEGORIES: Category[] = [
  {
    name: 'animals',
    band: 'easy',
    words: ['dog', 'cat', 'horse', 'cow', 'pig', 'sheep', 'lion', 'tiger', 'bear', 'bird', 'fish', 'mouse', 'elephant', 'giraffe', 'zebra', 'wolf', 'fox', 'deer', 'duck', 'chicken', 'goat', 'rabbit', 'snake', 'frog', 'whale', 'shark', 'monkey', 'owl', 'eagle', 'turtle'],
  },
  {
    name: 'fruits',
    band: 'easy',
    words: ['apple', 'banana', 'orange', 'grape', 'pear', 'peach', 'plum', 'mango', 'kiwi', 'lemon', 'lime', 'cherry', 'berry', 'strawberry', 'blueberry', 'watermelon', 'melon', 'pineapple', 'coconut', 'papaya', 'fig', 'date', 'apricot', 'nectarine'],
  },
  {
    name: 'colors',
    band: 'easy',
    words: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey', 'gold', 'silver', 'teal', 'navy', 'maroon', 'beige', 'tan', 'violet'],
  },
  {
    name: 'things in a kitchen',
    band: 'mid',
    words: ['spoon', 'fork', 'knife', 'plate', 'cup', 'bowl', 'pan', 'pot', 'oven', 'stove', 'sink', 'fridge', 'toaster', 'kettle', 'spatula', 'whisk', 'mug', 'glass', 'cutting board', 'blender'],
  },
  {
    name: 'things that are cold',
    band: 'mid',
    words: ['ice', 'snow', 'freezer', 'ice cream', 'soda', 'winter', 'icicle', 'frost', 'hail', 'slush', 'popsicle', 'yogurt', 'wind', 'refrigerator'],
  },
  {
    name: 'things in a bathroom',
    band: 'mid',
    words: ['soap', 'towel', 'toothbrush', 'toothpaste', 'shower', 'sink', 'toilet', 'mirror', 'shampoo', 'comb', 'brush', 'lotion', 'razor'],
  },
  { name: 'words that start with F', band: 'letter', words: [] },
  { name: 'words that start with S', band: 'letter', words: [] },
  { name: 'words that start with M', band: 'letter', words: [] },
  //no predefined list (checks first letter of the word)
];

export function pickCategories(level: number): Category[] {
  //receives the level of the player and returns the array of two categories
  const band = level <= 3 ? 'easy' : level <= 7 ? 'mid' : 'letter';
  const pool = CATEGORIES.filter((c) => c.band === band);
  const a = pool[Math.floor(Math.random() * pool.length)];
  const b = pool.filter((c) => c.name !== a.name)[Math.floor(Math.random() * (pool.length - 1))] ?? a;
  return [a, b];
}
//picks two random categories based on the level of the player

export function targetFor(level: number) {
  return 8 + Math.round(((level - 1) * 8) / 9);
}

export function matchWord(said: string, cat: Category) {
  const token = said.trim().toLowerCase().replace(/[^a-z ]/g, '');
  if (token.length < 2) return { word: token, known: false };
  if (cat.band === 'letter') {
    const letter = cat.name.slice(-1).toLowerCase();
    const known = token.startsWith(letter) && token.length >= 3;
    return { word: token, known };
  }
  const known = cat.words.some((w) => token === w || token.includes(w) || w.includes(token));
  return { word: token, known };
}
