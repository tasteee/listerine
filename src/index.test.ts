import { describe, it, expect } from 'vitest'
import { listerine } from '../src/listerine'

interface TestUser {
  id: string
  name: string
  age: number
  email: string
  tags: string[]
  isActive: boolean
  score?: number
  profile: {
    bio?: string
    settings: {
      theme: string
    }
  }
}

const testUsers: TestUser[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    age: 30,
    email: 'alice@example.com',
    tags: ['admin', 'developer'],
    isActive: true,
    score: 95,
    profile: {
      bio: 'Senior developer with 10 years experience',
      settings: { theme: 'dark' },
    },
  },
  {
    id: '2',
    name: 'Bob Smith',
    age: 25,
    email: 'bob@test.com',
    tags: ['user', 'designer'],
    isActive: true,
    score: 87,
    profile: {
      settings: { theme: 'light' },
    },
  },
  {
    id: '3',
    name: 'Charlie Brown',
    age: 35,
    email: 'charlie@example.org',
    tags: ['admin', 'manager'],
    isActive: false,
    score: 92,
    profile: {
      bio: 'Project manager and team lead',
      settings: { theme: 'dark' },
    },
  },
  {
    id: '4',
    name: 'Diana Prince',
    age: 28,
    email: 'diana@wonder.com',
    tags: ['user'],
    isActive: true,
    profile: {
      bio: '',
      settings: { theme: 'auto' },
    },
  },
  {
    id: '5',
    name: 'Eve Adams',
    age: 22,
    email: 'eve@startup.io',
    tags: ['intern', 'developer'],
    isActive: true,
    score: 78,
    profile: {
      settings: { theme: 'light' },
    },
  },
]

describe('Listerine Query Engine', () => {
  describe('Basic Operations', () => {
    const db = listerine(testUsers)

    it('should find documents by ID', () => {
      const user = db.findById('1')
      expect(user?.name).toBe('Alice Johnson')
    })

    it('should find multiple documents by IDs', () => {
      const users = db.findByIds(['1', '3', '5'])
      expect(users).toHaveLength(3)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Charlie Brown', 'Eve Adams'])
    })

    it('should return undefined for non-existent ID', () => {
      const user = db.findById('999')
      expect(user).toBeUndefined()
    })

    it('should return empty array for non-existent IDs', () => {
      const users = db.findByIds(['999', '888'])
      expect(users).toEqual([])
    })
  })

  describe('Equality Operators', () => {
    const db = listerine(testUsers)

    it('should find documents with implicit equality', () => {
      const users = db.find({ name: 'Alice Johnson' })
      expect(users).toHaveLength(1)
      expect(users[0].id).toBe('1')
    })

    it('should find documents with $equals', () => {
      const users = db.find({ age$: { $equals: 30 } })
      expect(users).toHaveLength(1)
      expect(users[0].name).toBe('Alice Johnson')
    })

    it('should find documents with $is (alias for $equals)', () => {
      const users = db.find({ isActive$: { $is: true } })
      expect(users).toHaveLength(4)
    })

    it('should find documents with $doesNotEqual', () => {
      const users = db.find({ age$: { $doesNotEqual: 30 } })
      expect(users).toHaveLength(4)
      expect(users.map((u) => u.name)).not.toContain('Alice Johnson')
    })

    it('should find documents with $isNot', () => {
      const users = db.find({ isActive$: { $isNot: false } })
      expect(users).toHaveLength(4)
      expect(users.every((u) => u.isActive)).toBe(true)
    })
  })

  describe('Numeric Comparisons', () => {
    const db = listerine(testUsers)

    it('should find documents with $isGreaterThan', () => {
      const users = db.find({ age$: { $isGreaterThan: 28 } })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Charlie Brown'])
    })

    it('should find documents with $isLessThan', () => {
      const users = db.find({ age$: { $isLessThan: 26 } })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Bob Smith', 'Eve Adams'])
    })

    it('should find documents with $isGreaterThanOrEqualTo', () => {
      const users = db.find({ age$: { $isGreaterThanOrEqualTo: 30 } })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Charlie Brown'])
    })

    it('should find documents with $isLessThanOrEqualTo', () => {
      const users = db.find({ age$: { $isLessThanOrEqualTo: 25 } })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Bob Smith', 'Eve Adams'])
    })

    it('should find documents with $isBetween', () => {
      const users = db.find({ age$: { $isBetween: [25, 30] } })
      expect(users).toHaveLength(3)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Bob Smith', 'Diana Prince'])
    })

    it('should find documents with $isNotBetween', () => {
      const users = db.find({ age$: { $isNotBetween: [25, 30] } })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Charlie Brown', 'Eve Adams'])
    })

    it('should find documents with score comparisons', () => {
      const users = db.find({ score$: { $isGreaterThan: 90 } })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Charlie Brown'])
    })
  })

  describe('Array Operations', () => {
    const db = listerine(testUsers)

    it('should find documents with $contains for single value', () => {
      const users = db.find({ tags$: { $contains: 'admin' } })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Charlie Brown'])
    })

    it('should find documents with $contains for multiple values', () => {
      const users = db.find({ tags$: { $contains: ['admin', 'developer'] } })
      expect(users).toHaveLength(1)
      expect(users[0].name).toBe('Alice Johnson')
    })

    it('should find documents with $containsAll', () => {
      const users = db.find({ tags$: { $containsAll: ['admin', 'developer'] } })
      expect(users).toHaveLength(1)
      expect(users[0].name).toBe('Alice Johnson')
    })

    it('should find documents with $containsSome', () => {
      const users = db.find({ tags$: { $containsSome: ['admin', 'designer'] } })
      expect(users).toHaveLength(3)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Bob Smith', 'Charlie Brown'])
    })

    it('should find documents with $doesNotContain for single value', () => {
      const users = db.find({ tags$: { $doesNotContain: 'admin' } })
      expect(users).toHaveLength(3)
      expect(users.map((u) => u.name)).toEqual(['Bob Smith', 'Diana Prince', 'Eve Adams'])
    })

    it('should find documents with $doesNotContain for multiple values', () => {
      const users = db.find({ tags$: { $doesNotContain: ['admin', 'manager'] } })
      expect(users).toHaveLength(3) // Bob, Diana, Eve (Alice has admin but not manager, Charlie has both)
      expect(users.map((u) => u.name)).toEqual(['Bob Smith', 'Diana Prince', 'Eve Adams'])
    })

    it('should find documents with $isOneOf', () => {
      const users = db.find({ age$: { $isOneOf: [25, 30, 35] } })
      expect(users).toHaveLength(3)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Bob Smith', 'Charlie Brown'])
    })

    it('should find documents with $isNotOneOf', () => {
      const users = db.find({ age$: { $isNotOneOf: [25, 30] } })
      expect(users).toHaveLength(3)
      expect(users.map((u) => u.name)).toEqual(['Charlie Brown', 'Diana Prince', 'Eve Adams'])
    })

    it('should find documents with $isIn for subset checking', () => {
      const users = db.find({ tags$: { $isIn: ['admin', 'developer', 'user', 'designer', 'manager'] } })
      expect(users).toHaveLength(4) // All except Eve who has 'intern' which is not in the list
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince'])
    })

    it('should find documents with $isSubsetOf', () => {
      const users = db.find({ tags$: { $isSubsetOf: ['admin', 'developer', 'user', 'designer', 'manager'] } })
      expect(users).toHaveLength(4) // All except Eve who has 'intern'
      expect(users.map((u) => u.name)).not.toContain('Eve Adams')
    })
  })

  describe('String Operations', () => {
    const db = listerine(testUsers)

    it('should find documents with $contains for strings', () => {
      const users = db.find({ name$: { $contains: 'Alice' } })
      expect(users).toHaveLength(1)
      expect(users[0].name).toBe('Alice Johnson')
    })

    it('should find documents with $startsWith', () => {
      const users = db.find({ name$: { $startsWith: 'A' } })
      expect(users).toHaveLength(1)
      expect(users[0].name).toBe('Alice Johnson')
    })

    it('should find documents with $endsWith', () => {
      const users = db.find({ email$: { $endsWith: '.com' } })
      expect(users).toHaveLength(3) // alice@example.com, bob@test.com, diana@wonder.com
    })

    it('should find documents with $doesNotStartWith', () => {
      const users = db.find({ name$: { $doesNotStartWith: 'A' } })
      expect(users).toHaveLength(4)
      expect(users.map((u) => u.name)).not.toContain('Alice Johnson')
    })

    it('should find documents with $doesNotEndWith', () => {
      const users = db.find({ email$: { $doesNotEndWith: '.com' } })
      expect(users).toHaveLength(2) // charlie@example.org, eve@startup.io
      expect(users.map((u) => u.email)).toEqual(['charlie@example.org', 'eve@startup.io'])
    })

    it('should find documents with $isLongerThan', () => {
      const users = db.find({ name$: { $isLongerThan: 10 } })
      expect(users).toHaveLength(3)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Charlie Brown', 'Diana Prince'])
    })

    it('should find documents with $isShorterThan', () => {
      const users = db.find({ name$: { $isShorterThan: 10 } })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Bob Smith', 'Eve Adams'])
    })
  })

  describe('Existence and Emptiness', () => {
    const db = listerine(testUsers)

    it('should find documents with $exists true', () => {
      const users = db.find({ score$: { $exists: true } })
      expect(users).toHaveLength(4) // All except Diana who doesn't have score
      expect(users.map((u) => u.name)).not.toContain('Diana Prince')
    })

    it('should find documents with $exists false', () => {
      const users = db.find({ score$: { $exists: false } })
      expect(users).toHaveLength(1)
      expect(users[0].name).toBe('Diana Prince')
    })

    it('should find documents with $doesNotExist', () => {
      const users = db.find({ score$: { $doesNotExist: true } })
      expect(users).toHaveLength(1)
      expect(users[0].name).toBe('Diana Prince')
    })

    it('should find documents with $isEmpty for empty strings', () => {
      const users = db.find({
        profile: {
          bio$: { $isEmpty: true },
        },
      })
      expect(users).toHaveLength(3) // Bob (undefined), Diana (empty string), Eve (undefined)
      expect(users.map((u) => u.name)).toEqual(['Bob Smith', 'Diana Prince', 'Eve Adams'])
    })

    it('should find documents with $isNotEmpty', () => {
      const users = db.find({
        profile: {
          bio$: { $isNotEmpty: true },
        },
      })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Charlie Brown'])
    })
  })

  describe('Logical Operators', () => {
    const db = listerine(testUsers)

    it('should find documents with implicit AND', () => {
      const users = db.find({
        age$: { $isGreaterThan: 25 },
        isActive: true,
      })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Diana Prince'])
    })

    it('should find documents with explicit $and', () => {
      const users = db.find({
        $and: [{ age$: { $isGreaterThan: 25 } }, { tags$: { $contains: 'admin' } }],
      })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Charlie Brown'])
    })

    it('should find documents with $or', () => {
      const users = db.find({
        $or: [{ age$: { $isLessThan: 25 } }, { tags$: { $contains: 'admin' } }],
      })
      expect(users).toHaveLength(3)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Charlie Brown', 'Eve Adams'])
    })

    it('should find documents with nested logical operators', () => {
      const users = db.find({
        $and: [
          {
            $or: [{ age$: { $isLessThan: 25 } }, { age$: { $isGreaterThan: 30 } }],
          },
          { isActive: true },
        ],
      })
      expect(users).toHaveLength(1)
      expect(users[0].name).toBe('Eve Adams')
    })

    it('should find documents with both $and and $or at same level', () => {
      const users = db.find({
        $and: [{ isActive: true }],
        $or: [{ age$: { $isLessThan: 25 } }, { tags$: { $contains: 'admin' } }],
      })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Eve Adams'])
    })
  })

  describe('Nested Object Queries', () => {
    const db = listerine(testUsers)

    it('should find documents with nested object properties', () => {
      const users = db.find({
        profile: {
          settings: {
            theme: 'dark',
          },
        },
      })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Charlie Brown'])
    })

    it('should find documents with nested object filters', () => {
      const users = db.find({
        profile: {
          bio$: { $contains: 'developer' },
        },
      })
      expect(users).toHaveLength(1)
      expect(users[0].name).toBe('Alice Johnson')
    })

    it('should find documents with multiple nested conditions', () => {
      const users = db.find({
        profile: {
          settings: {
            theme: 'light',
          },
          bio$: { $exists: false },
        },
      })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Bob Smith', 'Eve Adams'])
    })
  })

  describe('Complex Queries', () => {
    const db = listerine(testUsers)

    it('should handle complex multi-condition queries', () => {
      const users = db.find({
        $or: [
          {
            $and: [{ age$: { $isGreaterThan: 25 } }, { tags$: { $contains: 'admin' } }, { isActive: true }],
          },
          {
            $and: [{ age$: { $isLessThan: 25 } }, { score$: { $isGreaterThan: 75 } }],
          },
        ],
      })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Eve Adams'])
    })

    it('should handle queries with mixed operators', () => {
      const users = db.find({
        age$: { $isBetween: [20, 35] },
        tags$: { $containsSome: ['developer', 'admin'] },
        $or: [{ isActive: true }, { score$: { $isGreaterThan: 90 } }],
      })
      expect(users).toHaveLength(5) // All users match these conditions
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Adams'])
    })

    it('should handle email domain filtering', () => {
      const users = db.find({
        $or: [{ email$: { $endsWith: '@example.com' } }, { email$: { $endsWith: '@example.org' } }],
      })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Charlie Brown'])
    })

    it('should handle tag-based role filtering', () => {
      const users = db.find({
        tags$: { $isSupersetOf: ['intern'] },
        isActive: true,
        $or: [{ tags$: { $contains: 'admin' } }, { score$: { $isGreaterThanOrEqualTo: 85 } }],
      })

      expect(users).toHaveLength(3)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Bob Smith', 'Charlie Brown'])
    })
  })

  describe('Array Length and Content', () => {
    const db = listerine(testUsers)

    it('should find documents with array length checks', () => {
      const users = db.find({ tags$: { $isLongerThan: 1 } })
      expect(users).toHaveLength(4) // Alice, Bob, Charlie, Eve (all except Diana who has only 1 tag)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Eve Adams'])
    })

    it('should find documents with array length equality', () => {
      const users = db.find({ tags$: { $isShorterThan: 2 } })
      expect(users).toHaveLength(1) // Only Diana has 1 tag
      expect(users.map((u) => u.name)).toEqual(['Diana Prince'])
    })

    it('should find documents with array starts with primitive', () => {
      const users = db.find({ tags$: { $startsWith: 'admin' } })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Charlie Brown'])
    })

    it('should find documents with array starts with array', () => {
      const users = db.find({ tags$: { $startsWith: ['admin'] } })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Charlie Brown'])
    })

    it('should find documents with array ends with primitive', () => {
      const users = db.find({ tags$: { $endsWith: 'developer' } })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Eve Adams'])
    })

    it('should find documents with array ends with array', () => {
      const users = db.find({ tags$: { $endsWith: ['developer'] } })
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.name)).toEqual(['Alice Johnson', 'Eve Adams'])
    })
  })

  describe('Edge Cases and Type Handling', () => {
    const db = listerine(testUsers)

    it('should handle null values correctly', () => {
      const dataWithNulls = [
        { id: '1', value: null, name: 'Test1' },
        { id: '2', value: 'something', name: 'Test2' },
        { id: '3', value: undefined, name: 'Test3' },
      ]
      const nullDb = listerine(dataWithNulls)

      const nullResults = nullDb.find({ value: null })
      expect(nullResults).toHaveLength(1)
      expect(nullResults[0].name).toBe('Test1')

      const existsResults = nullDb.find({ value$: { $exists: true } })
      expect(existsResults).toHaveLength(1)
      expect(existsResults[0].name).toBe('Test2')
    })

    it('should handle undefined values correctly', () => {
      const dataWithUndefined = [
        { id: '1', optional: 'present', name: 'Test1' },
        { id: '2', name: 'Test2' }, // optional is undefined
      ]
      const undefinedDb = listerine(dataWithUndefined)

      const undefinedResults = undefinedDb.find({ optional$: { $doesNotExist: true } })
      expect(undefinedResults).toHaveLength(1)
      expect(undefinedResults[0].name).toBe('Test2')
    })

    it('should handle empty arrays correctly', () => {
      const dataWithEmptyArrays = [
        { id: '1', items: [], name: 'Empty' },
        { id: '2', items: ['item1'], name: 'NotEmpty' },
        { id: '3', items: ['item1', 'item2'], name: 'Multiple' },
      ]
      const emptyArrayDb = listerine(dataWithEmptyArrays)

      const emptyResults = emptyArrayDb.find({ items$: { $isEmpty: true } })
      expect(emptyResults).toHaveLength(1)
      expect(emptyResults[0].name).toBe('Empty')

      const notEmptyResults = emptyArrayDb.find({ items$: { $isNotEmpty: true } })
      expect(notEmptyResults).toHaveLength(2)
      expect(notEmptyResults.map((r) => r.name)).toEqual(['NotEmpty', 'Multiple'])
    })

    it('should handle empty objects correctly', () => {
      const dataWithEmptyObjects = [
        { id: '1', metadata: {}, name: 'Empty' },
        { id: '2', metadata: { key: 'value' }, name: 'NotEmpty' },
      ]
      const emptyObjectDb = listerine(dataWithEmptyObjects)

      const emptyResults = emptyObjectDb.find({ metadata$: { $isEmpty: true } })
      expect(emptyResults).toHaveLength(1)
      expect(emptyResults[0].name).toBe('Empty')
    })

    it('should handle boolean values correctly', () => {
      const booleanResults = db.find({ isActive$: { $equals: true } })
      expect(booleanResults).toHaveLength(4)

      const falseResults = db.find({ isActive: false })
      expect(falseResults).toHaveLength(1)
      expect(falseResults[0].name).toBe('Charlie Brown')
    })

    it('should handle numeric zero correctly', () => {
      const dataWithZero = [
        { id: '1', count: 0, name: 'Zero' },
        { id: '2', count: 1, name: 'One' },
        { id: '3', count: -1, name: 'NegativeOne' },
      ]
      const zeroDb = listerine(dataWithZero)

      const zeroResults = zeroDb.find({ count: 0 })
      expect(zeroResults).toHaveLength(1)
      expect(zeroResults[0].name).toBe('Zero')

      const greaterThanZero = zeroDb.find({ count$: { $isGreaterThan: 0 } })
      expect(greaterThanZero).toHaveLength(1)
      expect(greaterThanZero[0].name).toBe('One')

      const lessThanZero = zeroDb.find({ count$: { $isLessThan: 0 } })
      expect(lessThanZero).toHaveLength(1)
      expect(lessThanZero[0].name).toBe('NegativeOne')
    })
  })

  describe('Performance and Large Dataset Handling', () => {
    const db = listerine(testUsers)

    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `user-${i}`,
        name: `User ${i}`,
        age: 20 + (i % 50),
        isActive: i % 2 === 0,
        tags: i % 3 === 0 ? ['admin'] : ['user'],
        score: 50 + (i % 50),
      }))

      const largeDb = listerine(largeDataset)

      const activeAdmins = largeDb.find({
        isActive: true,
        tags$: { $contains: 'admin' },
      })

      expect(activeAdmins.length).toBeGreaterThan(0)
      expect(activeAdmins.every((user) => user.isActive)).toBe(true)
      expect(activeAdmins.every((user) => user.tags.includes('admin'))).toBe(true)
    })

    it('should handle complex queries on large datasets', () => {
      const complexDataset = Array.from({ length: 500 }, (_, i) => ({
        id: `item-${i}`,
        category: ['electronics', 'books', 'clothing'][i % 3],
        price: 10 + (i % 100),
        rating: 1 + (i % 5),
        tags: [`tag${i % 10}`, `category${i % 5}`],
        inStock: i % 4 !== 0,
        metadata: {
          brand: `Brand${i % 20}`,
          model: `Model${i % 30}`,
        },
      }))

      const complexDb = listerine(complexDataset)

      const complexQuery = complexDb.find({
        $and: [{ category: 'electronics' }, { price$: { $isBetween: [20, 80] } }, { rating$: { $isGreaterThanOrEqualTo: 3 } }, { inStock: true }],
      })

      expect(complexQuery.length).toBeGreaterThan(0)
      expect(complexQuery.every((item) => item.category === 'electronics' && item.price >= 20 && item.price <= 80 && item.rating >= 3 && item.inStock)).toBe(true)
    })
  })

  describe('Real-world Scenarios', () => {
    const db = listerine(testUsers)

    it('should handle user permission filtering', () => {
      const usersWithPermissions = [
        { id: '1', name: 'Admin', permissions: ['read', 'write', 'delete', 'admin'] },
        { id: '2', name: 'Editor', permissions: ['read', 'write'] },
        { id: '3', name: 'Viewer', permissions: ['read'] },
        { id: '4', name: 'SuperUser', permissions: ['read', 'write', 'delete', 'admin', 'super'] },
      ]
      const permDb = listerine(usersWithPermissions)

      const canDelete = permDb.find({ permissions$: { $contains: 'delete' } })
      expect(canDelete).toHaveLength(2)
      expect(canDelete.map((u) => u.name)).toEqual(['Admin', 'SuperUser'])

      const hasAllBasicPerms = permDb.find({
        permissions$: { $containsAll: ['read', 'write'] },
      })
      expect(hasAllBasicPerms).toHaveLength(3)
      expect(hasAllBasicPerms.map((u) => u.name)).toEqual(['Admin', 'Editor', 'SuperUser'])
    })

    it('should handle product inventory filtering', () => {
      const products = [
        {
          id: '1',
          name: 'Laptop',
          price: 999,
          stock: 5,
          categories: ['electronics', 'computers'],
          specs: { ram: 16, storage: 512 },
        },
        {
          id: '2',
          name: 'Phone',
          price: 699,
          stock: 0,
          categories: ['electronics', 'mobile'],
          specs: { ram: 8, storage: 256 },
        },
        {
          id: '3',
          name: 'Tablet',
          price: 399,
          stock: 12,
          categories: ['electronics', 'tablets'],
          specs: { ram: 4, storage: 128 },
        },
      ]
      const productDb = listerine(products)

      const inStockElectronics = productDb.find({
        categories$: { $contains: 'electronics' },
        stock$: { $isGreaterThan: 0 },
      })
      expect(inStockElectronics).toHaveLength(2)
      expect(inStockElectronics.map((p) => p.name)).toEqual(['Laptop', 'Tablet'])

      const affordableHighSpec = productDb.find({
        price$: { $isLessThan: 800 },
        specs: {
          ram$: { $isGreaterThanOrEqualTo: 8 },
        },
      })
      expect(affordableHighSpec).toHaveLength(1)
      expect(affordableHighSpec[0].name).toBe('Phone')
    })

    it('should handle event scheduling queries', () => {
      const events = [
        {
          id: '1',
          title: 'Team Meeting',
          duration: 60,
          attendees: ['alice', 'bob', 'charlie'],
          tags: ['work', 'meeting'],
          isRecurring: true,
        },
        {
          id: '2',
          title: 'Project Review',
          duration: 120,
          attendees: ['alice', 'diana'],
          tags: ['work', 'review'],
          isRecurring: false,
        },
        {
          id: '3',
          title: 'Birthday Party',
          duration: 180,
          attendees: ['bob', 'charlie', 'eve'],
          tags: ['personal', 'celebration'],
          isRecurring: false,
        },
      ]
      const eventDb = listerine(events)

      const workEvents = eventDb.find({ tags$: { $contains: 'work' } })
      expect(workEvents).toHaveLength(2)
      expect(workEvents.map((e) => e.title)).toEqual(['Team Meeting', 'Project Review'])

      const longEvents = eventDb.find({ duration$: { $isGreaterThan: 90 } })
      expect(longEvents).toHaveLength(2)
      expect(longEvents.map((e) => e.title)).toEqual(['Project Review', 'Birthday Party'])

      const aliceEvents = eventDb.find({ attendees$: { $contains: 'alice' } })
      expect(aliceEvents).toHaveLength(2)
      expect(aliceEvents.map((e) => e.title)).toEqual(['Team Meeting', 'Project Review'])
    })
  })

  describe('Data Validation and Integrity', () => {
    const db = listerine(testUsers)

    it('should handle mixed data types gracefully', () => {
      const mixedData = [
        { id: '1', value: 'string', type: 'text' },
        { id: '2', value: 42, type: 'number' },
        { id: '3', value: true, type: 'boolean' },
        { id: '4', value: ['array', 'items'], type: 'array' },
        { id: '5', value: { nested: 'object' }, type: 'object' },
      ]
      const mixedDb = listerine(mixedData)

      const stringValues = mixedDb.find({ type: 'text' })
      expect(stringValues).toHaveLength(1)
      expect(stringValues[0].value).toBe('string')

      const numericValues = mixedDb.find({ type: 'number' })
      expect(numericValues).toHaveLength(1)
      expect(numericValues[0].value).toBe(42)
    })

    it('should handle deeply nested object queries', () => {
      const deeplyNested = [
        {
          id: '1',
          level1: {
            level2: {
              level3: {
                value: 'deep',
                count: 5,
              },
            },
          },
        },
        {
          id: '2',
          level1: {
            level2: {
              level3: {
                value: 'deeper',
                count: 10,
              },
            },
          },
        },
      ]
      const deepDb = listerine(deeplyNested)

      const deepQuery = deepDb.find({
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      })
      expect(deepQuery).toHaveLength(1)
      expect(deepQuery[0].id).toBe('1')

      const countQuery = deepDb.find({
        level1: {
          level2: {
            level3: {
              count$: { $isGreaterThan: 7 },
            },
          },
        },
      })
      expect(countQuery).toHaveLength(1)
      expect(countQuery[0].id).toBe('2')
    })
  })

  describe('Query Optimization Scenarios', () => {
    const db = listerine(testUsers)

    it('should handle multiple ID lookups efficiently', () => {
      const manyIds = ['1', '3', '5', '999', '888']
      const results = db.findByIds(manyIds)

      expect(results).toHaveLength(3)
      expect(results.map((u) => u.id)).toEqual(['1', '3', '5'])
    })

    it('should handle empty query objects', () => {
      const allUsers = db.find({})
      expect(allUsers).toHaveLength(5)
      expect(allUsers).toEqual(testUsers)
    })

    it('should handle queries with no matches', () => {
      const noMatches = db.find({ age$: { $isGreaterThan: 100 } })
      expect(noMatches).toEqual([])
    })

    it('should handle single condition optimization', () => {
      const singleCondition = db.find({ isActive: true })
      expect(singleCondition).toHaveLength(4)
      expect(singleCondition.every((u) => u.isActive)).toBe(true)
    })
  })

  describe('Advanced Array Operations', () => {
    const db = listerine(testUsers)

    it('should handle complex array subset operations', () => {
      const dataWithComplexArrays = [
        { id: '1', skills: ['js', 'ts', 'react'], level: 'senior' },
        { id: '2', skills: ['js', 'html', 'css'], level: 'junior' },
        { id: '3', skills: ['python', 'django', 'sql'], level: 'mid' },
        { id: '4', skills: ['js', 'ts'], level: 'mid' },
      ]
      const skillDb = listerine(dataWithComplexArrays)

      const jsDevs = skillDb.find({ skills$: { $contains: 'js' } })
      expect(jsDevs).toHaveLength(3)

      const fullStackJs = skillDb.find({
        skills$: { $containsAll: ['js', 'ts'] },
      })
      expect(fullStackJs).toHaveLength(2)
      expect(fullStackJs.map((d) => d.id)).toEqual(['1', '4'])

      const frontendSkills = skillDb.find({
        skills$: { $containsSome: ['html', 'css', 'react'] },
      })
      expect(frontendSkills).toHaveLength(2)
      expect(frontendSkills.map((d) => d.id)).toEqual(['1', '2'])
    })

    it('should handle array superset operations', () => {
      const dataWithPermissions = [
        { id: '1', permissions: ['read', 'write', 'delete', 'admin'] },
        { id: '2', permissions: ['read', 'write'] },
        { id: '3', permissions: ['read'] },
      ]
      const permDb = listerine(dataWithPermissions)

      const superUsers = permDb.find({
        permissions$: { $isSupersetOf: ['read', 'write'] },
      })
      expect(superUsers).toHaveLength(2)
      expect(superUsers.map((u) => u.id)).toEqual(['1', '2'])
    })
  })

  describe('String Pattern Matching', () => {
    const db = listerine(testUsers)

    it('should handle case-sensitive string operations', () => {
      const caseData = [
        { id: '1', text: 'Hello World', category: 'greeting' },
        { id: '2', text: 'hello world', category: 'greeting' },
        { id: '3', text: 'HELLO WORLD', category: 'greeting' },
      ]
      const caseDb = listerine(caseData)

      const exactCase = caseDb.find({ text: 'Hello World' })
      expect(exactCase).toHaveLength(1)
      expect(exactCase[0].id).toBe('1')

      const containsHello = caseDb.find({ text$: { $contains: 'Hello' } })
      expect(containsHello).toHaveLength(1)
      expect(containsHello[0].id).toBe('1')

      const startsWithHello = caseDb.find({ text$: { $startsWith: 'hello' } })
      expect(startsWithHello).toHaveLength(1)
      expect(startsWithHello[0].id).toBe('2')
    })

    it('should handle string length operations on various data', () => {
      const lengthData = [
        { id: '1', code: 'A', description: 'Short' },
        { id: '2', code: 'ABC', description: 'Medium length' },
        { id: '3', code: 'ABCDEF', description: 'This is a very long description' },
      ]
      const lengthDb = listerine(lengthData)

      const shortCodes = lengthDb.find({ code$: { $isShorterThan: 4 } })
      expect(shortCodes).toHaveLength(2)
      expect(shortCodes.map((d) => d.id)).toEqual(['1', '2'])

      const longDescriptions = lengthDb.find({
        description$: { $isLongerThan: 10 },
      })
      expect(longDescriptions).toHaveLength(2)
      expect(longDescriptions.map((d) => d.id)).toEqual(['2', '3'])
    })
  })
})
