// src/tests/listerine.test.ts
import { describe, it, expect } from 'vitest'
import { listerine } from '../listerine'

const DATA0 = [
  { id: 0, name: 'John', age: 30, isActive: true, tags: ['tall', 'strong'] },
  { id: 1, name: 'Hannah', age: 25, isActive: false, tags: ['strong', 'smart', 'cute'] },
  { id: 2, name: 'John', age: 35, isActive: true, tags: ['short', 'smart', 'cute', 'fast'] },
]

describe('listerine', () => {
  it('should handle direct match filters', () => {
    const result0 = listerine(DATA0).query({
      name: 'John',
    })

    const expected0 = [DATA0[0], DATA0[2]]
    expect(result0).toEqual(expected0)

    const result1 = listerine(DATA0).query({
      age: 30,
    })

    const expected1 = [DATA0[0]]
    expect(result1).toEqual(expected1)

    const result2 = listerine(DATA0).query({
      isActive: false,
    })

    const expected2 = [DATA0[1]]
    expect(result2).toEqual(expected2)

    const result3 = listerine(DATA0).query({
      tags: ['tall', 'strong'],
    })

    const expected3 = [DATA0[0]]
    expect(result3).toEqual(expected3)

    const result4 = listerine(DATA0).query({
      id: 1,
    })

    const expected4 = [DATA0[1]]
    expect(result4).toEqual(expected4)
  })

  // STRING TESTS

  it('should handle string $startsWith', () => {
    const result0 = listerine(DATA0).query({
      name$: {
        $startsWith: 'Jo',
      },
    })

    const expected0 = [DATA0[0], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle string $doesNotStartWith', () => {
    const result0 = listerine(DATA0).query({
      name$: {
        $doesNotStartWith: 'Jo',
      },
    })

    const expected0 = [DATA0[1]]
    expect(result0).toEqual(expected0)
  })

  it('should handle string $endsWith', () => {
    const result0 = listerine(DATA0).query({
      name$: {
        $endsWith: 'hn',
      },
    })

    const expected0 = [DATA0[0], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle string $doesNotEndWith', () => {
    const result0 = listerine(DATA0).query({
      name$: {
        $doesNotEndWith: 'hn',
      },
    })

    const expected0 = [DATA0[1]]
    expect(result0).toEqual(expected0)
  })

  it('should handle string $isLongerThan', () => {
    const result0 = listerine(DATA0).query({
      name$: {
        $isLongerThan: 3,
      },
    })

    const expected0 = DATA0
    expect(result0).toEqual(expected0)
  })

  it('should handle string $isNotLongerThan', () => {
    const result0 = listerine(DATA0).query({
      name$: {
        $isNotLongerThan: 5,
      },
    })

    const expected0 = [DATA0[0], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle string $isShorterThan', () => {
    const result0 = listerine(DATA0).query({
      name$: {
        $isShorterThan: 5,
      },
    })

    const expected0 = [DATA0[0], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle string $isNotShorterThan', () => {
    const result0 = listerine(DATA0).query({
      name$: {
        $isNotShorterThan: 5,
      },
    })

    const expected0 = [DATA0[1]]
    expect(result0).toEqual(expected0)
  })

  it('should handle string $contains', () => {
    const result0 = listerine(DATA0).query({
      name$: {
        $contains: 'Jo',
      },
    })

    const expected0 = [DATA0[0], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle string $doesNotContain', () => {
    const result0 = listerine(DATA0).query({
      name$: {
        $doesNotContain: 'Jo',
      },
    })

    const expected0 = [DATA0[1]]
    expect(result0).toEqual(expected0)
  })

  // ARRAY TESTS

  it('should handle array $contains', () => {
    const result0 = listerine(DATA0).query({
      tags$: {
        $contains: 'strong',
      },
    })

    const expected0 = [DATA0[0], DATA0[1]]
    expect(result0).toEqual(expected0)
  })

  it('should handle array $doesNotContain', () => {
    const result0 = listerine(DATA0).query({
      tags$: {
        $doesNotContain: 'strong',
      },
    })

    const expected0 = [DATA0[2]]
    expect(result0).toEqual(expected0)

    const result1 = listerine(DATA0).query({
      tags$: {
        $doesNotContain: 'cute',
      },
    })

    const expected1 = [DATA0[0]]
    expect(result1).toEqual(expected1)

    const result2 = listerine(DATA0).query({
      tags$: {
        $doesNotContain: ['cute', 'fast'],
      },
    })

    const expected2 = [DATA0[0]]
    expect(result2).toEqual(expected2)
  })

  it('should handle array $startsWith', () => {
    const result0 = listerine(DATA0).query({
      tags$: {
        $startsWith: 'strong',
      },
    })

    const expected0 = [DATA0[1]]
    expect(result0).toEqual(expected0)
  })

  it('should handle array $doesNotStartWith', () => {
    const result0 = listerine(DATA0).query({
      tags$: {
        $doesNotStartWith: 'strong',
      },
    })

    const expected0 = [DATA0[0], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle array $endsWith', () => {
    const result0 = listerine(DATA0).query({
      tags$: {
        $endsWith: 'cute',
      },
    })

    const expected0 = [DATA0[1]]
    expect(result0).toEqual(expected0)
  })

  it('should handle array $doesNotEndWith', () => {
    const result0 = listerine(DATA0).query({
      tags$: {
        $doesNotEndWith: 'cute',
      },
    })

    const expected0 = [DATA0[0], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle array $isLongerThan', () => {
    const result0 = listerine(DATA0).query({
      tags$: {
        $isLongerThan: 2,
      },
    })

    const expected0 = [DATA0[1], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle array $isNotLongerThan', () => {
    const result0 = listerine(DATA0).query({
      tags$: {
        $isNotLongerThan: 2,
      },
    })

    const expected0 = [DATA0[0]]
    expect(result0).toEqual(expected0)
  })

  it('should handle array $isShorterThan', () => {
    const result0 = listerine(DATA0).query({
      tags$: {
        $isShorterThan: 3,
      },
    })

    const expected0 = [DATA0[0]]
    expect(result0).toEqual(expected0)
  })

  it('should handle array $isNotShorterThan', () => {
    const result0 = listerine(DATA0).query({
      tags$: {
        $isNotShorterThan: 3,
      },
    })

    const expected0 = [DATA0[1], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle array $containsAll', () => {
    const result0 = listerine(DATA0).query({
      tags$: {
        $containsAll: ['strong', 'cute'],
      },
    })

    const expected0 = [DATA0[1]]
    expect(result0).toEqual(expected0)
  })

  it('should handle array $containsSome', () => {
    const result0 = listerine(DATA0).query({
      tags$: {
        $containsSome: ['tall', 'cute'],
      },
    })

    const expected0 = DATA0
    expect(result0).toEqual(expected0)
  })

  // Add these tests to your existing listerine.test.ts file

  // NUMERIC COMPARISON TESTS
  it('should handle numeric $isGreaterThan', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isGreaterThan: 30 },
    })
    const expected0 = [DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle numeric $isLessThan', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isLessThan: 30 },
    })
    const expected0 = [DATA0[1]]
    expect(result0).toEqual(expected0)
  })

  it('should handle numeric $isGreaterThanOrEqualTo', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isGreaterThanOrEqualTo: 30 },
    })
    const expected0 = [DATA0[0], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle numeric $isLessThanOrEqualTo', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isLessThanOrEqualTo: 30 },
    })
    const expected0 = [DATA0[0], DATA0[1]]
    expect(result0).toEqual(expected0)
  })

  it('should handle numeric $isNotGreaterThan', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isNotGreaterThan: 30 },
    })
    const expected0 = [DATA0[0], DATA0[1]]
    expect(result0).toEqual(expected0)
  })

  it('should handle numeric $isNotLessThan', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isNotLessThan: 30 },
    })
    const expected0 = [DATA0[0], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle numeric $isNotGreaterThanOrEqualTo', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isNotGreaterThanOrEqualTo: 30 },
    })
    const expected0 = [DATA0[1]]
    expect(result0).toEqual(expected0)
  })

  it('should handle numeric $isNotLessThanOrEqualTo', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isNotLessThanOrEqualTo: 30 },
    })
    const expected0 = [DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  // EQUALITY TESTS
  it('should handle $equals', () => {
    const result0 = listerine(DATA0).query({
      name$: { $equals: 'John' },
    })
    const expected0 = [DATA0[0], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle $doesNotEqual', () => {
    const result0 = listerine(DATA0).query({
      name$: { $doesNotEqual: 'John' },
    })
    const expected0 = [DATA0[1]]
    expect(result0).toEqual(expected0)
  })

  it('should handle $isOneOf', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isOneOf: [25, 35] },
    })
    const expected0 = [DATA0[1], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle $isNotOneOf', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isNotOneOf: [25, 35] },
    })
    const expected0 = [DATA0[0]]
    expect(result0).toEqual(expected0)
  })

  // EXISTENCE TESTS
  it('should handle $exists with true', () => {
    const DATA_WITH_MISSING = [...DATA0, { id: 3, name: 'Alice', isActive: true }]

    const result0 = listerine(DATA_WITH_MISSING).query({
      age$: { $exists: true },
    })
    const expected0 = [DATA0[0], DATA0[1], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle $exists with false', () => {
    const DATA_WITH_MISSING = [...DATA0, { id: 3, name: 'Alice', isActive: true }]

    const result0 = listerine(DATA_WITH_MISSING).query({
      age$: { $exists: false },
    })
    const expected0 = [{ id: 3, name: 'Alice', isActive: true }]
    expect(result0).toEqual(expected0)
  })

  // EMPTINESS TESTS
  it('should handle $isEmpty with true', () => {
    const DATA_WITH_EMPTY = [...DATA0, { id: 3, name: 'Alice', age: 40, isActive: true, tags: [] }]

    const result0 = listerine(DATA_WITH_EMPTY).query({
      tags$: { $isEmpty: true },
    })
    const expected0 = [{ id: 3, name: 'Alice', age: 40, isActive: true, tags: [] }]
    expect(result0).toEqual(expected0)
  })

  it('should handle $isEmpty with false', () => {
    const DATA_WITH_EMPTY = [...DATA0, { id: 3, name: 'Alice', age: 40, isActive: true, tags: [] }]

    const result0 = listerine(DATA_WITH_EMPTY).query({
      tags$: { $isEmpty: false },
    })
    const expected0 = [DATA0[0], DATA0[1], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  // COMPLEX QUERY TESTS
  it('should handle multiple filters on the same field', () => {
    const result0 = listerine(DATA0).query({
      age$: {
        $isGreaterThan: 25,
        $isLessThan: 35,
      },
    })
    const expected0 = [DATA0[0]]
    expect(result0).toEqual(expected0)
  })

  it('should handle multiple fields with filters', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isGreaterThan: 25 },
      name$: { $startsWith: 'J' },
    })
    const expected0 = [DATA0[0], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle combination of direct match and filters', () => {
    const result0 = listerine(DATA0).query({
      isActive: true,
      age$: { $isGreaterThan: 30 },
    })
    const expected0 = [DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle complex nested queries', () => {
    const result0 = listerine(DATA0).query({
      name$: { $startsWith: 'J' },
      age$: { $isGreaterThanOrEqualTo: 30 },
      isActive: true,
      tags$: { $containsSome: ['smart', 'tall'] },
    })
    const expected0 = [DATA0[0], DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should return empty array when no items match', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isGreaterThan: 100 },
    })
    expect(result0).toEqual([])
  })

  // ERROR HANDLING
  it('should throw an error for invalid filter names', () => {
    expect(() => {
      listerine(DATA0).query({
        age$: { $invalidFilter: 30 } as any,
      })
    }).toThrow('Invalid filter name: $invalidFilter')
  })

  it('should handle $isBetween', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isBetween: [33, 37] },
    })

    const expected0 = [DATA0[2]]
    expect(result0).toEqual(expected0)
  })

  it('should handle $isNotBetween', () => {
    const result0 = listerine(DATA0).query({
      age$: { $isNotBetween: [31, 39] },
    })
    const expected0 = [DATA0[0], DATA0[1]]
    expect(result0).toEqual(expected0)
  })
})
