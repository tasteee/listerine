import { describe, it, expect } from 'vitest'
import { listerine } from '../listerine'

const taylor = { id: '123', name: 'taylor', isCool: true }
const hannah = { id: '420', name: 'hannah', isCool: true }
const lily = { id: '765', name: 'lily', isCool: true }
const sam = { id: '098', name: 'sam', isCool: false }
const DATA = [taylor]

describe('collection.insert', () => {
  it('inserts a single document', () => {
    const collection = listerine(DATA)
    collection.insert(hannah)
    const lastItem = collection.data.last
    expect(lastItem).toEqual(hannah)
    expect(collection.data).toEqual([taylor, hannah])
  })

  it('inserts multiple documents', () => {
    const collection = listerine(DATA)
    collection.insert([hannah, sam])
    const lastItem = collection.data.last
    const nextToLastItem = collection.data[collection.data.length - 2]
    expect(lastItem).toEqual(sam)
    expect(nextToLastItem).toEqual(hannah)
    expect(collection.data).toEqual([taylor, hannah, sam])
  })

  it('assigns id when none is provided', () => {
    const sailor = { name: 'sailor', isCool: true }
    const collection = listerine(DATA)
    collection.insert(sailor)
    expect(collection.data.length).toEqual(2)
    expect(collection.data.last).toHaveProperty('id')
  })

  // TODO: Make this a general test to ensure API is always available.
  it('can still insert after inserting', () => {
    const collection = listerine(DATA)

    {
      collection.insert([hannah, sam])
      const lastItem = collection.data.last
      const nextToLastItem = collection.data[collection.data.length - 2]
      expect(lastItem).toEqual(sam)
      expect(nextToLastItem).toEqual(hannah)
      expect(collection.data).toEqual([taylor, hannah, sam])
    }

    {
      collection.insert(lily)
      const lastItem = collection.data.last
      const nextToLastItem = collection.data[collection.data.length - 2]
      expect(lastItem).toEqual(lily)
      expect(nextToLastItem).toEqual(sam)
    }
  })
})
