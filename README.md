# miniroll
A simple JS library for rolling dice

## Installation
```sh
yarn add miniroll
npm i miniroll
```

## Usage
```js
const roll = require('miniroll')

const dice = '4d6dL'

roll(dice)
// 11

roll.describe(dice)
// 'roll 4 6-sided dice and drop the lowest'

roll.describeShort(dice)
// '4d6dL'

roll(dice, true)
/*
  {
    result: 14,
    rolls: [ 5, 6, 3 ],
    dropped: [ 3 ],
    source: '4d6dL',
    rollData: {
      count: 4,
      sides: 6,
      select: { mode: 'drop', end: 'lowest', count: 1 }
    }
  }
*/
```
