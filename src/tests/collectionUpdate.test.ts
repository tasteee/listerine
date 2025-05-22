import { describe, it, expect } from 'vitest'
import { listerine } from '../listerine'

const taylor = { id: '123', name: 'taylor', isCool: true }
const hannah = { id: '420', name: 'hannah', isCool: true }
const lily = { id: '765', name: 'lily', isCool: true }
const sam = { id: '098', name: 'sam', isCool: false }
const DATA = [taylor, hannah, lily, sam]

describe('collection.update', () => {
  it('updates a single document', () => {
    const collection = listerine(DATA)
    const updatedHannah = { ...hannah, name: 'hannah roksanne' }
    collection.update(updatedHannah)
    const queriedCollection = collection.query('420')
    expect(queriedCollection.data.first).toEqual(updatedHannah)
  })

  it('updates multiple documents', () => {
    const collection = listerine(DATA)
    const updatedHannah = { ...hannah, name: 'hannah roksanne' }
    const updatedLily = { ...lily, name: 'lily chowley' }
    collection.update([updatedHannah, updatedLily])
    const queriedCollection = collection.query(['420', '765'])
    expect(queriedCollection.data.first).toEqual(updatedHannah)
    expect(queriedCollection.data.last).toEqual(updatedLily)
  })
})
