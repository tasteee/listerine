// logicalOperators.test.ts
import { describe, it, expect } from 'vitest'
import { listerine } from '../listerine'

describe('collection.remove', () => {
  const taylor = { id: '111', name: 'taylor', isCool: true }
  const hannah = { id: '222', name: 'hannah', isCool: true }
  const lily = { id: '333', name: 'lily', isCool: true }
  const sam = { id: '444', name: 'sam', isCool: false }
  const DATA = [taylor, hannah, lily, sam]

  it('removes a single document by id', () => {
    const collection = listerine(DATA)
    collection.remove('222')
    expect(collection.data).toEqual([taylor, lily, sam])
  })

  it('removes multiple documents by ids', () => {
    const collection = listerine(DATA)
    collection.remove(['111', '444'])
    expect(collection.data).toEqual([hannah, lily])
    expect(collection.data.first).toEqual(hannah)
    expect(collection.data.last).toEqual(lily)
  })

  it('removes a single document by object with id', () => {
    const collection = listerine(DATA)
    collection.remove(hannah)
    expect(collection.data).toEqual([taylor, lily, sam])
  })

  it('removes multiple documents by objects with ids', () => {
    const collection = listerine(DATA)
    collection.remove([taylor, sam])
    expect(collection.data).toEqual([hannah, lily])
    expect(collection.data.first).toEqual(hannah)
    expect(collection.data.last).toEqual(lily)
  })
})
