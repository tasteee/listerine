// advanced1.test.ts
import { describe, it, expect } from 'vitest'
import { listerine } from '../listerine'

type User = {
  id: number
  name: string
  age: number
  isActive: boolean
  tags: string[]
  middleName?: string | null
  meta: {
    isAdmin: boolean
    isMember: boolean
    createdAt: number
  }
}

const users: User[] = [
  {
    id: 1,
    name: 'Alice',
    age: 28,
    isActive: true,
    tags: ['smart', 'tall', 'js'],
    middleName: null,
    meta: {
      isAdmin: true,
      isMember: true,
      createdAt: 1715551000000,
    },
  },
  {
    id: 2,
    name: 'Bob',
    age: 35,
    isActive: false,
    tags: ['python', 'short'],
    meta: {
      isAdmin: false,
      isMember: true,
      createdAt: 1715556000000,
    },
  },
  {
    id: 3,
    name: 'Charlie',
    age: 22,
    isActive: true,
    tags: ['js', 'react'],
    meta: {
      isAdmin: true,
      isMember: false,
      createdAt: 1715558000000,
    },
  },
  {
    id: 4,
    name: 'John',
    age: 30,
    isActive: true,
    tags: ['tall', 'smart'],
    middleName: 'Michael',
    meta: {
      isAdmin: true,
      isMember: true,
      createdAt: 1715555000000,
    },
  },
]

describe('listerine advanced queries', () => {
  it('should find active admin users named John who are exactly 30 years old and are tall', () => {
    const result = listerine(users).query({
      isActive: true,
      'meta.isAdmin': true,
      name: 'John',
      age: 30,
      tags$: { $contains: 'tall' },
    })

    expect(result.data).toHaveLength(1)
    expect(result.data[0].name).toBe('John')
  })

  it('should find users with complex criteria using multiple filters', () => {
    const result = listerine(users).query({
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

    expect(result.data).toHaveLength(1)
    expect(result.data[0].name).toBe('John')
  })

  it('should return users with existing middleName field', () => {
    const result = listerine(users).query({
      middleName$: { $exists: true },
    })

    expect(result.data).toHaveLength(1)
    expect(result.data[0].middleName).toBe('Michael')
  })

  it('should find users with names longer than 5 characters', () => {
    const result = listerine(users).query({
      name$: { $isLongerThan: 5 },
    })

    expect(result.data.map((u) => u.name)).toEqual(['Charlie'])
  })

  it('should find users whose tags array starts with "js"', () => {
    const result = listerine(users).query({
      tags$: { $startsWith: 'js' },
    })

    const resultingNames = result.data.map((user) => user.name)
    expect(resultingNames).toEqual(['Charlie'])
  })

  it('should exclude users with age between 20 and 25', () => {
    const result = listerine(users).query({
      age$: { $isNotBetween: [20, 25] },
    })

    expect(result.data.map((u) => u.name)).not.toContain('Charlie')
    expect(result.data).toHaveLength(3)
  })

  it('should find users who are not admins and not named Alice', () => {
    const result = listerine(users).query({
      'meta.isAdmin': false,
      name$: { $doesNotEqual: 'Alice' },
    })

    expect(result.data).toHaveLength(1)
    expect(result.data[0].name).toBe('Bob')
  })

  it('should find users whose tag list contains all of [smart, tall]', () => {
    const result = listerine(users).query({
      tags$: { $containsAll: ['smart', 'tall'] },
    })

    expect(result.data).toHaveLength(2)
    expect(result.data.map((u) => u.name)).toContain('Alice')
    expect(result.data.map((u) => u.name)).toContain('John')
  })
})
