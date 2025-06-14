import { describe, it, expect, test } from 'vitest'
import { listerine } from '../listerine'
import { SCALES } from './scales.data'

const list = listerine(SCALES)

test('array$ $contains string', () => {
  const results = list.find({ notes$: { $contains: 'C#' } })
  expect(results).toEqual([SCALES[1]])
})

test('array$ $conains: string[]', () => {
  const results = list.find({ intervals$: { $contains: ['3M'] } })
  expect(results).toEqual(SCALES)
})

test('array$ $conains: string', () => {
  const results = list.find({ intervals$: { $contains: '3M' } })
  expect(results).toEqual(SCALES)
})

test.todo('array$ $conains: number', () => {
  const results = list.find({ intervals$: { $contains: 9 } })
  expect(results).toEqual([SCALES[0]])
})

test.todo('array$ $conains: number[]', () => {
  const results = list.find({ intervals$: { $contains: [9, 8] } })
  expect(results).toEqual([SCALES[0]])
})

// $contains: ExistingObjectReference
// so we can match specific complex equality inside of arrays?
test.todo('array$ $conains: reference', () => {
  const results = list.find({ intervals$: { $contains: SCALES[0].intervals } })
  expect(results).toEqual([SCALES[0]])
})

test('array $containsAll filter', () => {
  const results = list.find({ notes$: { $containsAll: ['C', 'E', 'G'] } })
  expect(results).toEqual([SCALES[0]])
})

test('array $containsSome filter', () => {
  const results = list.find({ notes$: { $containsSome: ['C', 'C#'] } })
  expect(results).toEqual([SCALES[0], SCALES[1]])
})

test('array $doesNotContain filter', () => {
  const results = list.find({ notes$: { $doesNotContain: 'C#' } })
  expect(results).toEqual([SCALES[0]])
})

test('array $isOneOf filter', () => {
  const results = list.find({ tonic$: { $isOneOf: ['C', 'D'] } })
  expect(results).toEqual([SCALES[0]])
})

test('array $isNotOneOf filter', () => {
  const results = list.find({ tonic$: { $isNotOneOf: ['C#'] } })
  expect(results).toEqual([SCALES[0]])
})

test('array $isIn filter', () => {
  const results = list.find({ notes$: { $isIn: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] } })
  expect(results).toEqual([SCALES[0]])
})

test('array $isSubsetOf filter', () => {
  const results = list.find({ notes$: { $isSubsetOf: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#'] } })
  expect(results).toEqual([SCALES[0]])
})

test('array $isSupersetOf filter', () => {
  const results = list.find({ notes$: { $isSupersetOf: ['C', 'E'] } })
  expect(results).toEqual([SCALES[0]])
})

test('list.findOne(query)', () => {
  const results = list.findOne({ intervals$: { $contains: '3M' } })

  expect(results).toEqual(SCALES[0])
})
