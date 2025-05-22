// sortAndSelect.test.ts
import { describe, it, expect } from 'vitest'
import { listerine } from '../listerine'
import { DATA1 } from './testData'

describe('sort', () => {
  // Test sort method directly on full data
  describe('sort method on full data', () => {
    it('should sort by name in ascending order', () => {
      const result = listerine(DATA1).sort({ key: 'name', direction: 'ascending' })
      expect(result.data[0].name).toBe('Hannah')
      expect(result.data[1].name).toBe('John')
      expect(result.data[2].name).toBe('John')
    })

    it('should sort by name in descending order', () => {
      const result = listerine(DATA1).sort({ key: 'name', direction: 'descending' })
      // Both Johns should be before Hannah
      expect(result.data[0].name).toBe('John')
      expect(result.data[1].name).toBe('John')
      expect(result.data[2].name).toBe('Hannah')
    })

    it('should sort by age in ascending order', () => {
      const result = listerine(DATA1).sort({ key: 'age', direction: 'ascending' })
      expect(result.data[0].age).toBe(25) // Hannah
      expect(result.data[1].age).toBe(30) // John (id 0)
      expect(result.data[2].age).toBe(35) // John (id 2)
    })

    it('should sort by age in descending order', () => {
      const result = listerine(DATA1).sort({ key: 'age', direction: 'descending' })
      expect(result.data[0].age).toBe(35) // John (id 2)
      expect(result.data[1].age).toBe(30) // John (id 0)
      expect(result.data[2].age).toBe(25) // Hannah
    })

    it('should sort using a custom function', () => {
      const result = listerine(DATA1).sort((a, b) => a.tags.length - b.tags.length)
      expect(result.data[0].tags.length).toBe(2) // John (id 0)
      expect(result.data[1].tags.length).toBe(3) // Hannah
      expect(result.data[2].tags.length).toBe(4) // John (id 2)
    })
  })

  // Test query and then sort
  describe('query and then sort', () => {
    it('should filter by name and then sort by age', () => {
      const result = listerine(DATA1).query({ name: 'John' }).sort({ key: 'age', direction: 'ascending' })

      // Should have 2 Johns, sorted by age
      expect(result.data.length).toBe(2)
      expect(result.data[0].name).toBe('John')
      expect(result.data[0].age).toBe(30)
      expect(result.data[1].name).toBe('John')
      expect(result.data[1].age).toBe(35)
    })

    it('should filter by isActive and then sort by name', () => {
      const result = listerine(DATA1).query({ isActive: true }).sort({ key: 'name', direction: 'ascending' })

      // Should have 2 items: John (id 0) and John (id 2), already correctly sorted by name
      expect(result.data.length).toBe(2)
      expect(typeof result.data.length).toEqual('number')
      expect(result.data[0].name).toBe('John')
      expect(result.data[1].name).toBe('John')
      // Further sort by age to ensure predictable order
      const ageResult = result.sort({ key: 'age', direction: 'ascending' })
      expect(ageResult.data[0].id).toEqual('0') // John, age 30
      expect(ageResult.data[1].id).toEqual('2') // John, age 35
    })
  })

  // Test sort and then query
  describe('sort and then query', () => {
    it('should sort by age descending and then filter by isActive', () => {
      const result = listerine(DATA1).sort({ key: 'age', direction: 'descending' }).query({ isActive: true })

      // Should have 2 items, John (id 2) and John (id 0)
      expect(result.data.length).toEqual(2)
      expect(result.data[0].id).toEqual('2') // John, age 35
      expect(result.data[1].id).toEqual('0') // John, age 30
    })
  })

  // Advanced use case: chaining multiple sorts
  describe('chaining multiple sorts', () => {
    it('should allow multiple sorts in sequence', () => {
      const result = listerine(DATA1)
        .sort({ key: 'name', direction: 'ascending' }) // First by name
        .sort({ key: 'age', direction: 'descending' }) // Then by age

      // Should sort first by name (Hannah then Johns), then by age descending
      expect(result.data[0].name).toBe('John')
      expect(result.data[1].name).toBe('John')
      expect(result.data[1].age).toBe(30) // John (id 2)
      expect(result.data[2].name).toBe('Hannah')
      expect(result.data[2].age).toBe(25) // Hannah (id 1)
    })
  })

  // Edge cases
  describe('edge cases', () => {
    it('should handle empty data arrays', () => {
      const result = listerine([]).sort({ key: 'name', direction: 'ascending' })
      expect(result.data).toEqual([])
    })
  })
})
