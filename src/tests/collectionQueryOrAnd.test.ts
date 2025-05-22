// logicalOperators.test.ts
import { describe, it, expect } from 'vitest'
import { listerine } from '../listerine'
import { DATA0 } from './testData'

describe('$or / $and query operators', () => {
  describe('$or operator', () => {
    it('should match items that satisfy any of the conditions', () => {
      const result = listerine(DATA0).query({
        $or: [{ name: 'Alice' }, { age: 40 }],
      })

      // Should match Alice (id 3) and Bob (id 4)
      expect(result.data.length).toBe(2)
      expect(result.data.some((item) => item.name === 'Alice')).toBe(true)
      expect(result.data.some((item) => item.name === 'Bob')).toBe(true)
    })

    it('should work with filter operators', () => {
      const result = listerine(DATA0).query({
        $or: [{ name: 'Alice' }, { age$: { $isGreaterThan: 30 } }],
      })

      // Should match Alice (id 3), John (id 2, age 35), and Bob (id 4, age 40)
      expect(result.data.length).toBe(3)
      expect(result.data.some((item) => item.name === 'Alice')).toBe(true)
      expect(result.data.some((item) => item.name === 'John' && item.age === 35)).toBe(true)
      expect(result.data.some((item) => item.name === 'Bob')).toBe(true)
    })

    it('should handle complex OR conditions', () => {
      {
        const result = listerine(DATA0).query({
          $or: [
            { isActive: true, age$: { $isLessThan: 30 } }, // Active users under 30
            { 'meta.isAdmin': true }, // Any admin
          ],
        })

        // Should match Alice (active, age 28) and all admins (John id 0, John id 2, Bob)
        expect(result.data.length).toBe(4) // got: 1
        expect(result.data.some((item) => item.name === 'Alice')).toBe(true) // got: false
        expect(result.data.some((item) => item.id === '0')).toBe(true) // got: false
        expect(result.data.some((item) => item.id === '2')).toBe(true) // got: false
        expect(result.data.some((item) => item.name === 'Bob')).toBe(true) // got: false
      }

      {
        const result = listerine(DATA0).query({
          $or: [
            { isActive: true, age$: { $isLessThan: 30 } }, // Active users under 30
            { meta: { isAdmin: true } }, // Any admin
          ],
        })

        // Should match Alice (active, age 28) and all admins (John id 0, John id 2, Bob)
        expect(result.data.length).toBe(4) // got: 1
        expect(result.data.some((item) => item.name === 'Alice')).toBe(true) // got: false
        expect(result.data.some((item) => item.id === '0')).toBe(true) // got: false
        expect(result.data.some((item) => item.id === '2')).toBe(true) // got: false
        expect(result.data.some((item) => item.name === 'Bob')).toBe(true) // got: false
      }

      {
        const result = listerine(DATA0).query({
          $or: [
            { isActive: true, age$: { $isLessThan: 30 } }, // Active users under 30
            { meta: { isAdmin$: { $equals: true } } }, // Any admin
          ],
        })

        // Should match Alice (active, age 28) and all admins (John id 0, John id 2, Bob)
        expect(result.data.length).toBe(4) // got: 1
        expect(result.data.some((item) => item.name === 'Alice')).toBe(true) // got: false
        expect(result.data.some((item) => item.id === '0')).toBe(true) // got: false
        expect(result.data.some((item) => item.id === '2')).toBe(true) // got: false
        expect(result.data.some((item) => item.name === 'Bob')).toBe(true) // got: false
      }
    })

    it('should be chainable with other methods', () => {
      const result = listerine(DATA0)
        .query({
          $or: [{ name: 'Alice' }, { age$: { $isGreaterThanOrEqualTo: 35 } }],
        })
        .sort({ key: 'age', direction: 'descending' })

      // Should match Alice, John (id 2), and Bob, sorted by age descending
      expect(result.data.length).toBe(3)
      expect(result.data[0].name).toBe('Bob') // age 40
      expect(result.data[1].name).toBe('John') // age 35
      expect(result.data[2].name).toBe('Alice') // age 28
    })
  })

  describe('$and operator', () => {
    it('should match items that satisfy all conditions', () => {
      const result = listerine(DATA0).query({
        $and: [{ isActive: true }, { age$: { $isGreaterThan: 25 } }],
      })

      // Should match all active users over 25: John (id 0), John (id 2), Alice
      expect(result.data.length).toBe(3)
      expect(result.data.some((item) => item.id === '0')).toBe(true) // John, age 30
      expect(result.data.some((item) => item.id === '2')).toBe(true) // John, age 35
      expect(result.data.some((item) => item.name === 'Alice')).toBe(true) // Alice, age 28

      // Should not match inactive users or users 25 or younger
      expect(result.data.some((item) => item.name === 'Hannah')).toBe(false) // Hannah, age 25
      expect(result.data.some((item) => item.name === 'Bob')).toBe(false) // Bob, inactive
    })

    it('should work with complex conditions', () => {
      const ageFilter = { age$: { $isGreaterThanOrEqualTo: 30 } }
      const isMemberFilter = { 'meta.isMember$': { $is: true } }
      const andQuery = { $and: [ageFilter, isMemberFilter] }
      const result = listerine(DATA0).query(andQuery)

      // these three expectations failed:
      expect(result.data.length).toBe(2) // received 0
      expect(result.data.some((item) => item.id === '0')).toBe(true) // received: false
      expect(result.data.some((item) => item.name === 'Bob')).toBe(true) // received false

      // Should not match non-members or younger users
      expect(result.data.some((item) => item.id === '2')).toBe(false)
    })

    it('should be implicitly applied for multiple conditions', () => {
      // This query should be equivalent to using $and
      const result = listerine(DATA0).query({
        isActive: true,
        age$: { $isGreaterThan: 25 },
      })

      // Should match all active users over 25: John (id 0), John (id 2), Alice
      expect(result.data.length).toBe(3)
      expect(result.data.some((item) => item.id === '0')).toBe(true)
      expect(result.data.some((item) => item.id === '2')).toBe(true)
      expect(result.data.some((item) => item.name === 'Alice')).toBe(true)
    })
  })

  describe('nested logical operators', () => {
    it('should support combined AND and OR operations', () => {
      const result = listerine(DATA0).query({
        $or: [
          {
            $and: [{ isActive: true }, { age$: { $isGreaterThan: 30 } }],
          },
          { name: 'Alice' },
        ],
      })

      // Should match:
      // - Users who are both active AND have age > 30: John (id 2)
      // - Users named Alice
      expect(result.data.length).toBe(2)
      expect(result.data.some((item) => item.id === '2')).toBe(true) // John, age 35, active
      expect(result.data.some((item) => item.name === 'Alice')).toBe(true)

      // Should not match: John (id 0, active but only 30), Bob (not active), Hannah (not active and too young)
      expect(result.data.some((item) => item.id === '0')).toBe(false)
      expect(result.data.some((item) => item.name === 'Bob')).toBe(false)
      expect(result.data.some((item) => item.name === 'Hannah')).toBe(false)
    })

    it('should handle complex nested logical operations', () => {
      const result = listerine(DATA0).query({
        $and: [
          {
            $or: [{ name: 'John' }, { name: 'Alice' }],
          },
          { isActive: true },
        ],
      })

      // Should match active users who are either John or Alice:
      // - John (id 0), John (id 2), Alice
      expect(result.data.length).toBe(3)
      expect(result.data.some((item) => item.id === '0')).toBe(true)
      expect(result.data.some((item) => item.id === '2')).toBe(true)
      expect(result.data.some((item) => item.name === 'Alice')).toBe(true)

      // Should not match inactive users
      expect(result.data.some((item) => item.name === 'Hannah')).toBe(false)
      expect(result.data.some((item) => item.name === 'Bob')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty $or array', () => {
      const result = listerine(DATA0).query({
        $or: [],
      })

      // Empty OR should match nothing (since none of the conditions are met)
      expect(result.data.length).toBe(0)
    })

    it('should handle empty $and array', () => {
      const result = listerine(DATA0).query({
        $and: [],
      })

      // Empty AND should match everything (since all of the conditions are met)
      expect(result.data.length).toBe(5)
    })
  })
})
