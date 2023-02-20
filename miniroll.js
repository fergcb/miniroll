// A regex to match dice notation
const diceNotation = /^\s*(?<count>[1-9][0-9]*)?d(?<sides>[2-9]|[1-9][0-9]+|%)((?<selectMode>[-dDkK])(?<selectEnd>[lLhH])(?<selectCount>[1-9][0-9]*)?)*\s*$/

/**
 * @typedef {Object} Roll
 * @property {number} count The number of dice to roll
 * @property {number} sides The number of sides on the dice
 * @property {Selection} [select] Instructions about which dice to keep or drop
 */

/**
 * @typedef {Object} Selection
 * @property {("drop" | "keep")} mode What to do with the selected dice
 * @property {("lowest" | "highest")} end Which end of the sorted list of rolls to select from
 * @property {number} count The number of dice to select
 */

/**
 * @typedef {Object} RollResult
 * @property {number} result The sum of the undropped dice
 * @property {number[]} rolls The undropped results of dice rolls
 * @property {number[]} dropped The dropped results of dice rolls
 * @property {string} source The dice notation that created this roll (generated with {@link describeShort} if this roll was generated with a {@link Roll}) object.
 * @property {Roll} rollData The parameters used to execute this roll
 */

/**
 * Take a string or roll data, and return only roll data
 *
 * @param {string | Roll} input The roll to resolve
 * @returns {Roll}
 */
function resolveRoll (input) {
  if (typeof input === 'string') return parseDiceNotation(input)
  return input
}

/**
 * Take dice notation and return roll data
 *
 * @param {string} input Some dice notation to parse
 * @returns {Roll} An object describing the roll
 */
function parseDiceNotation (input) {
  // Execute dice notation regex on input string
  const res = diceNotation.exec(input)
  if (res === null) throw Error(`Failed to parse dice notation "${input}"`)
  // Extract named groups from regex exec result
  const { count, sides, selectMode, selectEnd, selectCount } = res.groups

  return {
    count: count !== undefined ? parseInt(count, 10) : 1,
    sides: sides === '%' ? 100 : parseInt(sides, 10),
    select: selectMode === undefined
      ? undefined
      : {
          mode: '-dD'.includes(selectMode) ? 'drop' : 'keep',
          end: 'lL'.includes(selectEnd) ? 'lowest' : 'highest',
          count: selectCount !== undefined ? parseInt(selectCount, 10) : 1,
        },
  }
}

/**
 * Generate a human-readable description of a dice roll
 *
 * @param {string | Roll} input The roll to describe, as dice notation or a Roll object
 * @returns {string} A plain English description of the roll
 */
function describe (input) {
  const rollData = resolveRoll(input)
  const { count, sides, select } = rollData
  // Pluralise if rolling more than one die
  const diceForm = count === 1 ? 'die' : 'dice'
  // Without selection
  const baseRoll = `roll ${count} ${sides}-sided ${diceForm}`
  if (select === undefined) return baseRoll
  // With selection
  const { mode, end, count: sCount } = select
  // omit count if only one die is being selected
  const which = sCount === 1 ? end : `${end} ${sCount}`
  const selection = `and ${mode} the ${which}`
  return `${baseRoll} ${selection}`
}

/**
 * Generate a short description of a dice roll, using dice notation
 *
 * The output of this function will always be a valid input to {@link parseDiceNotation}.
 *
 * @param {string | Roll} input The roll to describe, as dice notation or a Roll object
 * @returns {string} Dice notation describing the roll
 */
function describeShort (input) {
  const rollData = resolveRoll(input)
  const { count, sides, select } = rollData
  // Without selection
  const baseRoll = `${count}d${sides}`
  if (select === undefined) return baseRoll
  // With selection
  const { mode, end, count: sCount } = select
  const modeAbbr = mode === 'drop' ? 'd' : 'k'
  const endAbbr = end === 'lowest' ? 'L' : 'H'
  return baseRoll + modeAbbr + endAbbr + (sCount > 1 ? `${sCount}` : '')
}

/**
 * Generate a random integer between 1 and a given integer (the die value), inclusive.
 *
 * @param {number} sides The number of sides the die has
 * @returns {number} An integer 1-sides, inclusive
 */
function rollOnce (sides) {
  return Math.ceil(Math.random() * sides)
}

/**
 * Execute a roll and return the result of rolling the specified di(c)e and applying the given selection
 *
 * @param {string | Roll} input The roll to execute, as dice notation or a Roll object
 * @param {boolean} [returnBreakdown=false] Whether or not to return additional information about the roll
 * @returns {number | RollResult}
 */
function roll (input, returnBreakdown = false) {
  const rollData = resolveRoll(input)
  const source = input === rollData ? describeShort(rollData) : input
  const { count, sides, select } = rollData

  // Roll all the dice
  let rolls = []
  for (let i = 0; i < count; i++) {
    const roll = rollOnce(sides)
    rolls.push(roll)
  }

  // Drop/keep selected dice
  let dropped = []
  if (select !== undefined) {
    const { mode, end, count: sCount } = select
    // Sort rolls ascending
    const sorted = [...rolls].sort((a, b) => a - b)

    // Take sCount dice from the appropriate end of the sorted array
    const selection = end === 'lowest'
      ? sorted.splice(0, sCount)
      : sorted.splice(-sCount, sCount)

    // Split the original rolls array into selected and unselected portions
    // Maintains the order in which the values were rolled
    const unselected = [...rolls]
    const selected = []
    for (const num of selection) {
      const index = unselected.indexOf(num)
      selected.push(unselected.splice(index, 1)[0])
    }

    // Keep or drop the selected values as appropriate
    if (mode === 'keep') {
      rolls = selected
      dropped = unselected
    } else {
      rolls = unselected
      dropped = selected
    }
  }

  // Sum the remaining rolls
  const result = rolls.reduce((a, b) => a + b)

  return returnBreakdown
    ? { result, rolls, dropped, source, rollData }
    : result
}

module.exports = roll
roll.parseDiceNotation = parseDiceNotation
roll.describe = describe
roll.describeShort = describeShort
