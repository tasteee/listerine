// advanced.test.ts
import { describe, it, expect } from 'vitest'
import { listerine } from '../listerine'

const DATA0 = [
  {
    id: 0,
    name: 'John',
    age: 30,
    isActive: true,
    tags: ['tall', 'strong'],
    meta: { isAdmin: true, isMember: true, createdAt: 1000, updatedAt: 1400 },
  },
  {
    id: 1,
    name: 'Hannah',
    age: 25,
    isActive: false,
    tags: ['strong', 'smart', 'cute'],
    meta: { isAdmin: false, isMember: true, createdAt: 255, updatedAt: 750 },
  },
  {
    id: 2,
    name: 'John',
    age: 35,
    isActive: true,
    tags: ['short', 'smart', 'cute', 'fast'],
    meta: { isAdmin: true, isMember: false, createdAt: 1250, updatedAt: 1500 },
  },
]

describe('listerine', () => {
  it('$is', () => {
    {
      const id$ = { $is: 0 }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected = [DATA0[0]]
      expect(results.data).toEqual(expected)
    }

    {
      const id$ = { $is: 5 }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = []
      expect(results.data).toEqual(expected)
    }
  })

  it('$isNot', () => {
    {
      const id$ = { $isNot: 0 }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected = [DATA0[1], DATA0[2]]
      expect(results.data).toEqual(expected)
    }

    {
      const id$ = { $isNot: 5 }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected = [DATA0[0], DATA0[1], DATA0[2]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$equals', () => {
    {
      const id$ = { $equals: 0 }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected = [DATA0[0]]
      expect(results.data).toEqual(expected)
    }

    {
      const id$ = { $equals: 5 }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = []
      expect(results.data).toEqual(expected)
    }
  })

  it('$doesNotEqual', () => {
    {
      const id$ = { $doesNotEqual: 0 }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected = [DATA0[1], DATA0[2]]
      expect(results.data).toEqual(expected)
    }

    {
      const id$ = { $doesNotEqual: 5 }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected = [DATA0[0], DATA0[1], DATA0[2]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$isIn', () => {
    {
      const id$ = { $isIn: [0, 2] }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected = [DATA0[0], DATA0[2]]
      expect(results.data).toEqual(expected)
    }

    {
      const id$ = { $isIn: [5, 6, 7] }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = []
      expect(results.data).toEqual(expected)
    }

    {
      const name$ = { $isIn: ['Timmy', 'Hannah'] }
      const query = { name$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[1]]
      expect(results.data).toEqual(expected)
    }

    {
      const tags$ = { $isIn: ['great', 'tall', 'strong'] }
      const query = { tags$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[0]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$isNotIn', () => {
    {
      const id$ = { $isNotIn: [0] }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected = [DATA0[1], DATA0[2]]
      expect(results.data).toEqual(expected)
    }

    {
      const id$ = { $isNotIn: [5] }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected = [DATA0[0], DATA0[1], DATA0[2]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$isOneOf', () => {
    {
      const id$ = { $isOneOf: [0, 2] }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected = [DATA0[0], DATA0[2]]
      expect(results.data).toEqual(expected)
    }

    {
      const id$ = { $isOneOf: [5, 6, 7] }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = []
      expect(results.data).toEqual(expected)
    }
  })

  it('$isNotOneOf', () => {
    {
      const id$ = { $isNotOneOf: [0, 2] }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected = [DATA0[1]]
      expect(results.data).toEqual(expected)
    }

    {
      const id$ = { $isNotOneOf: [5, 6, 7] }
      const query = { id$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[0], DATA0[1], DATA0[2]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$matches', () => {
    {
      const name$ = { $matches: 'John' }
      const query = { name$ }
      const results = listerine(DATA0).query(query)
      const expected = [DATA0[0], DATA0[2]]
      expect(results.data).toEqual(expected)
    }

    {
      const name$ = { $matches: 'Jane' }
      const query = { name$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = []
      expect(results.data).toEqual(expected)
    }
  })

  it('$doesNotMatch', () => {
    {
      const name$ = { $doesNotMatch: 'John' }
      const query = { name$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[1]]
      expect(results.data).toEqual(expected)
    }

    {
      const name$ = { $doesNotMatch: 'Jane' }
      const query = { name$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[0], DATA0[1], DATA0[2]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$isGreaterThan', () => {
    {
      const age$ = { $isGreaterThan: 25 }
      const query = { age$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[0], DATA0[2]]
      expect(results.data).toEqual(expected)
    }

    {
      const age$ = { $isGreaterThan: 35 }
      const query = { age$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = []
      expect(results.data).toEqual(expected)
    }
  })

  it('$isLessThan', () => {
    {
      const age$ = { $isLessThan: 30 }
      const query = { age$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[1]]
      expect(results.data).toEqual(expected)
    }

    {
      const age$ = { $isLessThan: 20 }
      const query = { age$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = []
      expect(results.data).toEqual(expected)
    }
  })

  it('$isGreaterThanOrEqualTo', () => {
    {
      const age$ = { $isGreaterThanOrEqualTo: 30 }
      const query = { age$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[0], DATA0[2]]
      expect(results.data).toEqual(expected)
    }

    {
      const age$ = { $isGreaterThanOrEqualTo: 35 }
      const query = { age$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[2]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$isLessThanOrEqualTo', () => {
    {
      const age$ = { $isLessThanOrEqualTo: 30 }
      const query = { age$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[0], DATA0[1]]
      expect(results.data).toEqual(expected)
    }

    {
      const age$ = { $isLessThanOrEqualTo: 20 }
      const query = { age$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = []
      expect(results.data).toEqual(expected)
    }
  })

  it('$isNotGreaterThan', () => {
    {
      const age$ = { $isNotGreaterThan: 30 }
      const query = { age$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[0], DATA0[1]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$startsWith', () => {
    {
      const name$ = { $startsWith: 'J' }
      const query = { name$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[0], DATA0[2]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$endsWith', () => {
    {
      const name$ = { $endsWith: 'n' }
      const query = { name$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[0], DATA0[2]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$doesNotStartWith', () => {
    {
      const name$ = { $doesNotStartWith: 'J' }
      const query = { name$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[1]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$doesNotEndWith', () => {
    {
      const name$ = { $doesNotEndWith: 'n' }
      const query = { name$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[1]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$isLongerThan', () => {
    {
      const name$ = { $isLongerThan: 3 }
      const query = { name$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[0], DATA0[1], DATA0[2]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$isNotLongerThan', () => {
    {
      const name$ = { $isNotLongerThan: 3 }
      const query = { name$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = []
      expect(results.data).toEqual(expected)
    }
  })

  it('$isShorterThan', () => {
    {
      const name$ = { $isShorterThan: 3 }
      const query = { name$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = []
      expect(results.data).toEqual(expected)
    }
  })

  it('$isNotShorterThan', () => {
    {
      const name$ = { $isNotShorterThan: 3 }
      const query = { name$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[0], DATA0[1], DATA0[2]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$isEmpty', () => {
    {
      const tags$ = { $isEmpty: true }
      const query = { tags$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = []
      expect(results.data).toEqual(expected)
    }
  })

  it('$isNotEmpty', () => {
    {
      const tags$ = { $isNotEmpty: true }
      const query = { tags$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[0], DATA0[1], DATA0[2]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$isBetween', () => {
    {
      const createdAt$ = { $isBetween: [1000, 1400] }
      const query = { 'meta.createdAt$': createdAt$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[0], DATA0[2]]
      expect(results.data).toEqual(expected)
    }
  })

  it('$isNotBetween', () => {
    {
      const createdAt$ = { $isNotBetween: [1000, 1400] }
      const query = { 'meta.createdAt$': createdAt$ }
      const results = listerine(DATA0).query(query)
      const expected: typeof DATA0 = [DATA0[1]]
      expect(results.data).toEqual(expected)
    }
  })

  it('should handle complex queries', () => {
    {
      const age$ = { $isGreaterThan: 25, $isLessThan: 35 }
      const name$ = { $startsWith: 'J', $endsWith: 'n', $contains: 'oh' }
      const tags$ = { $containsSome: ['smart', 'tall'] }
      const createdAt$ = { $isBetween: [200, 1500], $isNot: 255 }

      const query = {
        isActive: true,
        age$: age$,
        name$: name$,
        tags$: tags$,
        'meta.isAdmin': true,
        'meta.createdAt$': createdAt$,
      }

      const result0 = listerine(DATA0).query(query)
      const expected0 = [DATA0[0]]
      expect(result0.data).toEqual(expected0)
    }
  })
})
