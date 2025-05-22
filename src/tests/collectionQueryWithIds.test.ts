import { describe, it, expect } from 'vitest'
import { listerine } from '../listerine'

const baseLiljohn = { name: 'John', age: 30, isActive: true, tags: ['tall', 'strong'] }
const baseHannah = { name: 'Hannah', age: 25, isActive: false, tags: ['strong', 'smart', 'cute'] }
const baseOldjohn = { name: 'John', age: 35, isActive: true, tags: ['short', 'smart', 'cute', 'fast'] }

describe('collection.query (simple)', () => {
  describe('querying with ids', () => {
    const liljohn = { ...baseLiljohn, id: '0' }
    const hannah = { ...baseHannah, id: '1' }
    const oldjohn = { ...baseOldjohn, id: '2' }
    const DATA0 = [liljohn, hannah, oldjohn]

    it('should query by singular number id', () => {
      const fullCollection = listerine(DATA0)
      const queriedCollection = fullCollection.query('1')
      expect(queriedCollection.data).toEqual([hannah])
    })

    it('should query by multiple number ids', () => {
      const fullCollection = listerine(DATA0)
      const queriedCollection = fullCollection.query(['0', '2'])
      expect(queriedCollection.data.length).toEqual(2)
      expect(queriedCollection.data).toEqual([liljohn, oldjohn])
    })

    it('should not match number id queries with objects with string ids', () => {
      const fullCollection = listerine(DATA0)
      const queriedCollection = fullCollection.query([0, 2])
      expect(queriedCollection.data.length).toEqual(0)
      expect(queriedCollection.data).toEqual([])
    })
  })

  it('should not update original collection.data', () => {
    const liljohn = { ...baseLiljohn, id: '0' }
    const hannah = { ...baseHannah, id: '1' }
    const oldjohn = { ...baseOldjohn, id: '2' }
    const DATA0 = [liljohn, hannah, oldjohn]

    const fullDatas = []
    const fullStringDatas = []

    const fullCollection = listerine(DATA0)
    fullDatas.push(fullCollection.data)
    fullStringDatas.push(JSON.stringify(fullCollection.data))

    const queriedCollection = fullCollection.query([0, 2])
    const queriedData = queriedCollection.data
    const queriedStringifiedData = JSON.stringify(queriedCollection.data)

    fullDatas.push(fullCollection.data)
    fullStringDatas.push(JSON.stringify(fullCollection.data))

    expect(fullDatas[0]).toBe(fullDatas[1])
    expect(fullStringDatas[0]).toEqual(fullStringDatas[1])
    expect(queriedData).not.toEqual(fullDatas[1])
    expect(queriedStringifiedData).not.toEqual(fullStringDatas[1])
  })
})
