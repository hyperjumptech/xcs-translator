import rangeParser from 'parse-numeric-range'

/**
 * convert excel column identifier to 0 indexed number
 */
export function letterToNumber(letter: string): number {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  let total = 0
  for (let i = 0; i < letter.length; i++) {
    const value = ALPHABET.findIndex(
      l => l === letter[letter.length - i - 1].toUpperCase(),
    )
    total += value + i * 26
  }

  return total
}

/**
 * convert "A-C,G,J,W-AC" into [ 0, 1, 2, 6, 9, 22, 23, 24, 25, 26, 27, 28 ]
 */
export function letterRangeToArrayOfIndex(letterRange: string): number[] {
  const numericRange = letterRange.replace(/[A-Z]+/gi, substring => {
    return String(letterToNumber(substring))
  })

  return rangeParser(numericRange)
}
