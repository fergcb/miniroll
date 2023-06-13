export interface Roll {
  /**
   * The number of dice to roll
   */
  count: number
  /**
   * The number of sides on the dice
   */
  sides: number
  /**
   * Instructions about which dice to keep or drop
   */
  select?: Selection
}

export interface RollResult {
  /**
   * The sum of the undropped dice
   */
  result: number
  /**
   * The undropped results of dice rolls
   */
  rolls: number[]
  /**
   * The dropped results of dice rolls
   */
  dropped: number[]
  /**
   * The dice notation that created this roll (generated with {@link describeShort } if this roll was generated with a {@link Roll }) object.
   */
  source: string
  /**
   * The parameters used to execute this roll
   */
  rollData: Roll
}

export interface Selection {
  /**
   * What to do with the selected dice
   */
  mode: 'drop' | 'keep'
  /**
   * Which end of the sorted list of rolls to select from
   */
  end: 'lowest' | 'highest'
  /**
   * The number of dice to select
   */
  count: number
}

// A regex to match dice notation
const diceNotation = /^\s*(?<count>[1-9][0-9]*)?d(?<sides>[2-9]|[1-9][0-9]+|%)((?<selectMode>[-dDkK])(?<selectEnd>[lLhH])(?<selectCount>[1-9][0-9]*)?)*\s*$/

/**
 * Take a string or roll data, and return only roll data
 */
export function resolveRoll (input: string | Roll): Roll {
  if (typeof input === 'string') return parseDiceNotation(input)
  return input
}

/**
 * Take dice notation and return roll data
 */
export function parseDiceNotation (input: string): Roll {
  // Execute dice notation regex on input string
  const res = diceNotation.exec(input)
  if (res === null) throw Error(`Failed to parse dice notation "${input}"`)
  // Extract named groups from regex exec result
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
  const { count, sides, selectMode, selectEnd, selectCount } = res.groups!

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
 */
export function describe (input: string | Roll): string {
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
 */
export function describeShort (input: string | Roll): string {
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
 */
function rollOnce (sides: number): number {
  return Math.ceil(Math.random() * sides)
}

/**
 * Execute a roll and return the result of rolling the specified di(c)e and applying the given selection
 */
export function roll (input: string | Roll): RollResult {
  const source = typeof input === 'string' ? input : describeShort(input)

  const rollData = resolveRoll(input)
  const { count, sides, select } = rollData

  // Roll all the dice
  let rolls: number[] = []
  for (let i = 0; i < count; i++) {
    const roll = rollOnce(sides)
    rolls.push(roll)
  }

  // Drop/keep selected dice
  let dropped: number[] = []
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
    const selected: number[] = []
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

  return {
    result,
    rolls,
    dropped,
    source,
    rollData,
  }
}
