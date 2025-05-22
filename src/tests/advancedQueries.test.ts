import { describe, it, expect } from 'vitest'
import { listerine } from '../listerine'
import { USERS, UserT } from './testData'

describe('advanced queries', () => {
  it('should find active admin users named John who are exactly 30 years old and are tall', () => {
    const queriedCollection = listerine<UserT>(USERS).query({
      isActive: true,
      'meta.isAdmin': true,
      name: 'John',
      age: 30,
      tags$: { $contains: 'tall' },
    })

    expect(queriedCollection.data).toHaveLength(1)
    expect(queriedCollection.data[0].name).toBe('John')
  })

  it('should find users with complex criteria using multiple filters', () => {
    const queriedCollection = listerine<UserT>(USERS).query({
      isActive: true,
      'meta.isAdmin': true,
      age$: { $isGreaterThan: 25, $isLessThan: 35 },
      name$: { $startsWith: 'J', $endsWith: 'n' },
      tags$: { $containsSome: ['smart', 'tall'] },
      'meta.createdAt$': {
        $isGreaterThan: 1715550000000,
        $isLessThan: 1715558500000,
      },
    })

    expect(queriedCollection.data).toHaveLength(1)
    expect(queriedCollection.data[0].name).toBe('John')
  })

  it('should return users with existing middleName field', () => {
    const queriedCollection = listerine<UserT>(USERS).query({
      middleName$: { $exists: true },
    })

    expect(queriedCollection.data).toHaveLength(1)
    expect(queriedCollection.data[0].middleName).toBe('Michael')
  })

  it('should find users with names longer than 5 characters', () => {
    const queriedCollection = listerine<UserT>(USERS).query({
      name$: { $isLongerThan: 5 },
    })

    expect(queriedCollection.data.map((u) => u.name)).toEqual(['Charlie'])
  })

  it('should find users whose tags array starts with "js"', () => {
    const queriedCollection = listerine<UserT>(USERS).query({
      tags$: { $startsWith: 'js' },
    })

    const resultingNames = queriedCollection.data.map((user) => user.name)
    expect(resultingNames).toEqual(['Charlie'])
  })

  it('should exclude users with age between 20 and 25', () => {
    const queriedCollection = listerine<UserT>(USERS).query({
      age$: { $isNotBetween: [20, 25] },
    })

    expect(queriedCollection.data.map((u) => u.name)).not.toContain('Charlie')
    expect(queriedCollection.data).toHaveLength(3)
  })

  it('should find users who are not admins and not named Alice', () => {
    const queriedCollection = listerine<UserT>(USERS).query({
      'meta.isAdmin': false,
      name$: { $doesNotEqual: 'Alice' },
    })

    expect(queriedCollection.data).toHaveLength(1)
    expect(queriedCollection.data[0].name).toBe('Bob')
  })

  it('should find users whose tag list contains all of [smart, tall]', () => {
    const queriedCollection = listerine<UserT>(USERS).query({
      tags$: { $containsAll: ['smart', 'tall'] },
    })

    expect(queriedCollection.data).toHaveLength(2)
    expect(queriedCollection.data.map((u) => u.name)).toContain('Alice')
    expect(queriedCollection.data.map((u) => u.name)).toContain('John')
  })
})
