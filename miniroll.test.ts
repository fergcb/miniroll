/* eslint-disable array-bracket-spacing, no-multi-spaces */

import { expect, test } from '@jest/globals'
import { roll, describe as describeLong, describeShort } from './miniroll'

type TestData = [string, number, number, number, string, string]
const testData: TestData[] = [
  ['d10',     1,  10, 0, '1d10',   'roll 1 10-sided die'                       ],
  ['1d20',    1,  20, 0, '1d20',   'roll 1 20-sided die'                       ],
  ['1d%',     1, 100, 0, '1d100',  'roll 1 100-sided die'                      ],
  ['15d2',   15,   2, 0, '15d2',   'roll 15 2-sided dice'                      ],
  ['4d6dL',   4,   6, 1, '4d6dL',  'roll 4 6-sided dice and drop the lowest'   ],
  ['4d6kH3',  4,   6, 1, '4d6kH3', 'roll 4 6-sided dice and keep the highest 3'],
  ['2d20-H',  2,  20, 1, '2d20dH', 'roll 2 20-sided dice and drop the highest' ],
  ['2d20-L',  2,  20, 1, '2d20dL', 'roll 2 20-sided dice and drop the lowest'  ],
]

test.each(testData)('Test #%#: %s', (input, expectedCount, expectedSides, expectedDrops, expectedShortDesc, expectedDesc) => {
  const { result, rolls, dropped, rollData } = roll(input)

  expect(result).toBeGreaterThanOrEqual(expectedCount - expectedDrops)
  expect(result).toBeLessThanOrEqual(expectedCount * expectedSides)

  expect(rollData.count).toBe(expectedCount)
  expect(rolls.length).toBe(expectedCount - expectedDrops)
  expect(dropped.length).toBe(expectedDrops)

  rolls.forEach(result => {
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(expectedSides)
  })

  const desc = describeLong(input)
  expect(desc).toBe(expectedDesc)

  const shortDesc = describeShort(input)
  expect(shortDesc).toBe(expectedShortDesc)
})
