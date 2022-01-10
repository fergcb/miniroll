const roll = require('./miniroll')
const { describe: describeLong, describeShort } = roll

test.each`
  input       | expectedCount | expectedSides | expectedDrops | expectedShortDesc | expectedDesc
  ${'d10'}    | ${1}          | ${10}         | ${0}          | ${'1d10'}         | ${'roll 1 10-sided die'}
  ${'1d20'}   | ${1}          | ${20}         | ${0}          | ${'1d20'}         | ${'roll 1 20-sided die'}
  ${'15d2'}   | ${15}         | ${2}          | ${0}          | ${'15d2'}         | ${'roll 15 2-sided dice'}
  ${'4d6dL'}  | ${4}          | ${6}          | ${1}          | ${'4d6dL'}        | ${'roll 4 6-sided dice and drop the lowest'}
  ${'4d6kH3'} | ${4}          | ${6}          | ${1}          | ${'4d6kH3'}       | ${'roll 4 6-sided dice and keep the highest 3'}
  ${'2d20-H'} | ${2}          | ${20}         | ${1}          | ${'2d20dH'}       | ${'roll 2 20-sided dice and drop the highest'}
  ${'2d20-L'} | ${2}          | ${20}         | ${1}          | ${'2d20dL'}       | ${'roll 2 20-sided dice and drop the lowest'}
  ${'10d%'}   | ${10}         | ${100}        | ${0}          | ${'10d100'}       | ${'roll 10 100-sided dice'}
`('$input', ({ input, expectedCount, expectedSides, expectedDrops, expectedDesc, expectedShortDesc }) => {
  const result = roll(input)

  expect(result).toBeGreaterThanOrEqual(expectedCount)
  expect(result).toBeLessThanOrEqual(expectedCount * expectedSides)

  const { rolls, dropped, rollData } = roll(input, true)

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
