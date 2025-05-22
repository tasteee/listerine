// src/tests/testData.ts

export const DATA0 = [
  {
    id: '0',
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
    id: '1',
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
    id: '2',
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
  {
    id: '3',
    name: 'Alice',
    age: 28,
    isActive: true,
    tags: ['smart', 'organized'],
    meta: {
      isAdmin: false,
      isMember: true,
      createdAt: 800,
      updatedAt: 1200,
    },
  },
  {
    id: '4',
    name: 'Bob',
    age: 40,
    isActive: false,
    tags: ['strong', 'experienced'],
    meta: {
      isAdmin: true,
      isMember: true,
      createdAt: 500,
      updatedAt: 2000,
    },
  },
]

export const DATA1 = [
  {
    id: '0',
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
    id: '1',
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
    id: '2',
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

export type UserT = {
  id: string
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

export const USERS: UserT[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
