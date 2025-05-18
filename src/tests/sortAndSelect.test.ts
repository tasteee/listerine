// sortAndSelect.test.ts
import { describe, it, expect } from 'vitest'
import { listerine } from '../listerine'

const DATA = [
  {
    id: 0,
    name: 'John',
    age: 30,
    isActive: true,
    tags: ['tall', 'strong'],
    meta: {
      isAdmin: true,
      isMember: true,
      createdAt: 1000,
      updatedAt: 1400,
    },
  },
  {
    id: 1,
    name: 'Hannah',
    age: 25,
    isActive: false,
    tags: ['strong', 'smart', 'cute'],
    meta: {
      isAdmin: false,
      isMember: true,
      createdAt: 255,
      updatedAt: 750,
    },
  },
  {
    id: 2,
    name: 'John',
    age: 35,
    isActive: true,
    tags: ['short', 'smart', 'cute', 'fast'],
    meta: {
      isAdmin: true,
      isMember: false,
      createdAt: 1250,
      updatedAt: 1500,
    },
  },
]

describe('sort and select', () => {
  // Test sort method directly on full data
  describe('sort method on full data', () => {
    it('should sort by name in ascending order', () => {
      const result = listerine(DATA).sort({ key: 'name', direction: 'ascending' })
      expect(result.data[0].name).toBe('Hannah')
      expect(result.data[1].name).toBe('John')
      expect(result.data[2].name).toBe('John')
    })

    it('should sort by name in descending order', () => {
      const result = listerine(DATA).sort({ key: 'name', direction: 'descending' })
      // Both Johns should be before Hannah
      expect(result.data[0].name).toBe('John')
      expect(result.data[1].name).toBe('John')
      expect(result.data[2].name).toBe('Hannah')
    })

    it('should sort by age in ascending order', () => {
      const result = listerine(DATA).sort({ key: 'age', direction: 'ascending' })
      expect(result.data[0].age).toBe(25) // Hannah
      expect(result.data[1].age).toBe(30) // John (id 0)
      expect(result.data[2].age).toBe(35) // John (id 2)
    })

    it('should sort by age in descending order', () => {
      const result = listerine(DATA).sort({ key: 'age', direction: 'descending' })
      expect(result.data[0].age).toBe(35) // John (id 2)
      expect(result.data[1].age).toBe(30) // John (id 0)
      expect(result.data[2].age).toBe(25) // Hannah
    })

    it('should sort using a custom function', () => {
      const result = listerine(DATA).sort((a, b) => a.tags.length - b.tags.length)
      expect(result.data[0].tags.length).toBe(2) // John (id 0)
      expect(result.data[1].tags.length).toBe(3) // Hannah
      expect(result.data[2].tags.length).toBe(4) // John (id 2)
    })
  })

  // Test select method directly on full data
  describe('select method on full data', () => {
    it('should select specific keys', () => {
      const result = listerine(DATA).select(['id', 'name'])

      // Check that only requested properties exist
      expect(Object.keys(result.data[0]).length).toBe(2)
      expect(result.data[0].id).toBeDefined()
      expect(result.data[0].name).toBeDefined()
      expect(result.data[0].age).toBeUndefined()
      expect(result.data[0].isActive).toBeUndefined()

      // Check that values are preserved
      expect(result.data[0].id).toBe(0)
      expect(result.data[0].name).toBe('John')
    })

    it('should select a single key', () => {
      const result = listerine(DATA).select(['name'])
      expect(Object.keys(result.data[0]).length).toBe(1)
      expect(result.data[0].name).toBeDefined()
      expect(result.data[0].name).toBe('John')
    })
  })

  // Test sort and then select
  describe('sort and then select', () => {
    it('should sort by age descending and then select id and name', () => {
      const result = listerine(DATA).sort({ key: 'age', direction: 'descending' }).select(['id', 'name'])

      // Verify sort order is maintained
      expect(result.data[0].id).toBe(2) // John (id 2, age 35)
      expect(result.data[1].id).toBe(0) // John (id 0, age 30)
      expect(result.data[2].id).toBe(1) // Hannah (id 1, age 25)

      // Verify only selected fields are present
      expect(Object.keys(result.data[0]).length).toBe(2)
      expect(result.data[0].id).toBeDefined()
      expect(result.data[0].name).toBeDefined()
      expect(result.data[0].age).toBeUndefined()
    })
  })

  // Test select and then sort
  describe('select and then sort', () => {
    it('should select name and age and then sort by age ascending', () => {
      const result = listerine(DATA).select(['name', 'age']).sort({ key: 'age', direction: 'ascending' })

      // Verify sort order
      expect(result.data[0].name).toBe('Hannah')
      expect(result.data[0].age).toBe(25)
      expect(result.data[1].name).toBe('John')
      expect(result.data[1].age).toBe(30)
      expect(result.data[2].name).toBe('John')
      expect(result.data[2].age).toBe(35)

      // Verify only selected fields are present
      expect(Object.keys(result.data[0]).length).toBe(2)
      expect(result.data[0].name).toBeDefined()
      expect(result.data[0].age).toBeDefined()
      expect(result.data[0].id).toBeUndefined()
    })
  })

  // Test query and then sort
  describe('query and then sort', () => {
    it('should filter by name and then sort by age', () => {
      const result = listerine(DATA).query({ name: 'John' }).sort({ key: 'age', direction: 'ascending' })

      // Should have 2 Johns, sorted by age
      expect(result.data.length).toBe(2)
      expect(result.data[0].name).toBe('John')
      expect(result.data[0].age).toBe(30)
      expect(result.data[1].name).toBe('John')
      expect(result.data[1].age).toBe(35)
    })

    it('should filter by isActive and then sort by name', () => {
      const result = listerine(DATA).query({ isActive: true }).sort({ key: 'name', direction: 'ascending' })

      // Should have 2 items: John (id 0) and John (id 2), already correctly sorted by name
      expect(result.data.length).toBe(2)
      expect(result.data[0].name).toBe('John')
      expect(result.data[1].name).toBe('John')
      // Further sort by age to ensure predictable order
      const ageResult = result.sort({ key: 'age', direction: 'ascending' })
      expect(ageResult.data[0].id).toBe(0) // John, age 30
      expect(ageResult.data[1].id).toBe(2) // John, age 35
    })
  })

  // Test sort and then query
  describe('sort and then query', () => {
    it('should sort by age descending and then filter by isActive', () => {
      const result = listerine(DATA).sort({ key: 'age', direction: 'descending' }).query({ isActive: true })

      // Should have 2 items, John (id 2) and John (id 0)
      expect(result.data.length).toBe(2)
      expect(result.data[0].id).toBe(2) // John, age 35
      expect(result.data[1].id).toBe(0) // John, age 30
    })
  })

  // Test query and then select
  describe('query and then select', () => {
    it('should filter by isActive and then select name and age', () => {
      const result = listerine(DATA).query({ isActive: true }).select(['name', 'age'])

      // Should have 2 items with only name and age
      expect(result.data.length).toBe(2)
      expect(Object.keys(result.data[0]).length).toBe(2)
      expect(result.data[0].name).toBeDefined()
      expect(result.data[0].age).toBeDefined()
      expect(result.data[0].isActive).toBeUndefined()
    })
  })

  // Test select and then query
  describe('select and then query', () => {
    it('should select name and age and then filter by name', () => {
      const result = listerine(DATA).select(['name', 'age']).query({ name: 'John' })

      // Should have 2 Johns with only name and age properties
      expect(result.data.length).toBe(2)
      expect(Object.keys(result.data[0]).length).toBe(2)
      expect(result.data[0].name).toBe('John')
      expect(result.data[0].age).toBeDefined()
      expect(result.data[0].isActive).toBeUndefined()
    })
  })

  // Test all three methods chained
  describe('query, select, and sort chained', () => {
    it('should chain query -> select -> sort', () => {
      const result = listerine(DATA).query({ name: 'John' }).select(['name', 'age']).sort({ key: 'age', direction: 'descending' })

      // Should have 2 Johns, only name and age, sorted by age descending
      expect(result.data.length).toBe(2)
      expect(Object.keys(result.data[0]).length).toBe(2)
      expect(result.data[0].name).toBe('John')
      expect(result.data[0].age).toBe(35) // John (id 2)
      expect(result.data[1].name).toBe('John')
      expect(result.data[1].age).toBe(30) // John (id 0)
    })

    it('should chain query -> sort -> select', () => {
      const result = listerine(DATA).query({ name: 'John' }).sort({ key: 'age', direction: 'descending' }).select(['name', 'age'])

      // Should have 2 Johns, sorted by age descending, with only name and age
      expect(result.data.length).toBe(2)
      expect(Object.keys(result.data[0]).length).toBe(2)
      expect(result.data[0].name).toBe('John')
      expect(result.data[0].age).toBe(35) // John (id 2)
      expect(result.data[1].name).toBe('John')
      expect(result.data[1].age).toBe(30) // John (id 0)
    })

    it('should chain select -> query -> sort', () => {
      const result = listerine(DATA)
        .select(['name', 'age', 'isActive'])
        .query({ isActive: true })
        .sort({ key: 'age', direction: 'ascending' })

      // Should have 2 active users, with name/age/isActive only, sorted by age ascending
      expect(result.data.length).toBe(2)
      expect(Object.keys(result.data[0]).length).toBe(3)
      expect(result.data[0].name).toBe('John')
      expect(result.data[0].age).toBe(30) // John (id 0)
      expect(result.data[1].name).toBe('John')
      expect(result.data[1].age).toBe(35) // John (id 2)
    })

    it('should chain select -> sort -> query', () => {
      const result = listerine(DATA)
        .select(['name', 'age', 'isActive'])
        .sort({ key: 'age', direction: 'ascending' })
        .query({ isActive: true })

      // Should have 2 active users, with name/age/isActive only, in age order
      expect(result.data.length).toBe(2)
      expect(Object.keys(result.data[0]).length).toBe(3)
      expect(result.data[0].name).toBe('John')
      expect(result.data[0].age).toBe(30) // John (id 0)
      expect(result.data[1].name).toBe('John')
      expect(result.data[1].age).toBe(35) // John (id 2)
    })

    it('should chain sort -> query -> select', () => {
      const result = listerine(DATA).sort({ key: 'age', direction: 'descending' }).query({ isActive: true }).select(['name', 'age'])

      // Should have 2 active users, sorted by age descending, with only name and age
      expect(result.data.length).toBe(2)
      expect(Object.keys(result.data[0]).length).toBe(2)
      expect(result.data[0].name).toBe('John')
      expect(result.data[0].age).toBe(35) // John (id 2)
      expect(result.data[1].name).toBe('John')
      expect(result.data[1].age).toBe(30) // John (id 0)
    })

    it('should chain sort -> select -> query', () => {
      const result = listerine(DATA)
        .sort({ key: 'age', direction: 'descending' })
        .select(['name', 'age', 'isActive'])
        .query({ isActive: true })

      // Should have 2 active users sorted by age descending, with only name, age, and isActive
      expect(result.data.length).toBe(2)
      expect(Object.keys(result.data[0]).length).toBe(3)
      expect(result.data[0].name).toBe('John')
      expect(result.data[0].age).toBe(35) // John (id 2)
      expect(result.data[1].name).toBe('John')
      expect(result.data[1].age).toBe(30) // John (id 0)
    })
  })

  // Advanced use case: chaining multiple sorts
  describe('chaining multiple sorts', () => {
    it('should allow multiple sorts in sequence', () => {
      const result = listerine(DATA)
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
      const result = listerine([]).sort({ key: 'name', direction: 'ascending' }).select(['id', 'name'])

      expect(result.data).toEqual([])
    })

    it('should handle selecting non-existent keys', () => {
      const result = listerine(DATA).select(['id', 'nonExistentKey' as any])

      // Should only have id property in result
      expect(result.data[0].id).toBeDefined()
      expect(Object.keys(result.data[0]).length).toBe(1)
      expect((result.data[0] as any).nonExistentKey).toBeUndefined()
    })
  })
})
