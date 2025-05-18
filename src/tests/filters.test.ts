// filters.test.ts
import { describe, it, expect } from 'vitest'
import { filters } from '../filters'

describe('Basic Equality Filters', () => {
  describe('$equals / $is', () => {
    it('should return true when values are equal', () => {
      const item = { name: 'John', age: 30 }
      expect(filters.$equals('name', 'John')(item)).toBe(true)
      expect(filters.$equals('age', 30)(item)).toBe(true)
      expect(filters.$is('name', 'John')(item)).toBe(true)
      expect(filters.$is('age', 30)(item)).toBe(true)
    })

    it('should return false when values are not equal', () => {
      const item = { name: 'John', age: 30 }
      expect(filters.$equals('name', 'Jane')(item)).toBe(false)
      expect(filters.$equals('age', 25)(item)).toBe(false)
      expect(filters.$is('name', 'Jane')(item)).toBe(false)
      expect(filters.$is('age', 25)(item)).toBe(false)
    })

    it('should handle nested properties', () => {
      const item = { user: { name: 'John', details: { age: 30 } } }
      expect(filters.$equals('user.name', 'John')(item)).toBe(true)
      expect(filters.$equals('user.details.age', 30)(item)).toBe(true)
      expect(filters.$equals('user.details.age', 25)(item)).toBe(false)
      expect(filters.$is('user.name', 'John')(item)).toBe(true)
      expect(filters.$is('user.details.age', 30)(item)).toBe(true)
      expect(filters.$is('user.details.age', 25)(item)).toBe(false)
    })

    it('filters.$isIn', () => {
      const item = { user: { name: 'Hannah', details: { age: 35 } } }
      expect(filters.$isIn('user.name', ['John', 'Hannah'])(item)).toBe(true)
      expect(filters.$isIn('user.details.age', [30, 35])(item)).toBe(true)
      expect(filters.$isIn('user.details.age', [25, 30])(item)).toBe(false)
    })

    it('should handle objects and arrays', () => {
      const item = {
        preferences: { colors: ['red', 'blue'] },
        settings: { theme: 'dark' },
      }
      expect(filters.$equals('preferences.colors', ['red', 'blue'])(item)).toBe(true)
      expect(filters.$equals('settings', { theme: 'dark' })(item)).toBe(true)
      expect(filters.$equals('preferences.colors', ['red'])(item)).toBe(false)
    })
  })

  describe('doesNotEqual', () => {
    it('should return true when values are not equal', () => {
      const item = { name: 'John', age: 30 }
      expect(filters.$doesNotEqual('name', 'Jane')(item)).toBe(true)
      expect(filters.$doesNotEqual('age', 25)(item)).toBe(true)
    })

    it('should return false when values are equal', () => {
      const item = { name: 'John', age: 30 }
      expect(filters.$doesNotEqual('name', 'John')(item)).toBe(false)
      expect(filters.$doesNotEqual('age', 30)(item)).toBe(false)
    })
  })

  describe('matches', () => {
    it('should return true when strings match exactly', () => {
      const item = { name: 'John', code: 'ABC123' }
      expect(filters.$matches('name', 'John')(item)).toBe(true)
      expect(filters.$matches('code', 'ABC123')(item)).toBe(true)
    })

    it('should return false when strings do not match', () => {
      const item = { name: 'John', code: 'ABC123' }
      expect(filters.$matches('name', 'john')(item)).toBe(false) // Case sensitive
      expect(filters.$matches('code', 'abc123')(item)).toBe(false)
    })
  })

  describe('doesNotMatch', () => {
    it('should return true when strings do not match', () => {
      const item = { name: 'John', code: 'ABC123' }
      expect(filters.$doesNotMatch('name', 'jane')(item)).toBe(true)
      expect(filters.$doesNotMatch('code', 'XYZ')(item)).toBe(true)
    })

    it('should return false when strings match', () => {
      const item = { name: 'John', code: 'ABC123' }
      expect(filters.$doesNotMatch('name', 'John')(item)).toBe(false)
      expect(filters.$doesNotMatch('code', 'ABC123')(item)).toBe(false)
    })
  })
})

describe('Collection Filters', () => {
  describe('isOneOf', () => {
    it('should return true when value is in the array', () => {
      const item = { status: 'active', category: 'electronics' }
      expect(filters.$isOneOf('status', ['active', 'pending'])(item)).toBe(true)
      expect(filters.$isOneOf('category', ['books', 'electronics', 'clothing'])(item)).toBe(true)
    })

    it('should return false when value is not in the array', () => {
      const item = { status: 'active', category: 'electronics' }
      expect(filters.$isOneOf('status', ['pending', 'completed'])(item)).toBe(false)
      expect(filters.$isOneOf('category', ['books', 'clothing'])(item)).toBe(false)
    })

    it('should handle objects in arrays', () => {
      const item = { preference: { theme: 'dark' } }
      expect(filters.$isOneOf('preference', [{ theme: 'dark' }, { theme: 'light' }])(item)).toBe(true)
      expect(filters.$isOneOf('preference', [{ theme: 'light' }])(item)).toBe(false)
    })
  })

  describe('isNotOneOf', () => {
    it('should return true when value is not in the array', () => {
      const item = { status: 'active', category: 'electronics' }
      expect(filters.$isNotOneOf('status', ['pending', 'completed'])(item)).toBe(true)
      expect(filters.$isNotOneOf('category', ['books', 'clothing'])(item)).toBe(true)
    })

    it('should return false when value is in the array', () => {
      const item = { status: 'active', category: 'electronics' }
      expect(filters.$isNotOneOf('status', ['active', 'pending'])(item)).toBe(false)
      expect(filters.$isNotOneOf('category', ['books', 'electronics'])(item)).toBe(false)
    })
  })
})

describe('Numeric Comparison Filters', () => {
  const item = { age: 30, score: 85, rating: 4.5 }

  describe('isGreaterThan', () => {
    it('should return true when value is greater than target', () => {
      expect(filters.$isGreaterThan('age', 25)(item)).toBe(true)
      expect(filters.$isGreaterThan('score', 80)(item)).toBe(true)
      expect(filters.$isGreaterThan('rating', 4)(item)).toBe(true)
    })

    it('should return false when value is equal to or less than target', () => {
      expect(filters.$isGreaterThan('age', 30)(item)).toBe(false)
      expect(filters.$isGreaterThan('age', 35)(item)).toBe(false)
      expect(filters.$isGreaterThan('score', 85)(item)).toBe(false)
      expect(filters.$isGreaterThan('score', 90)(item)).toBe(false)
    })

    it('should return false for non-numeric values', () => {
      const nonNumericItem = { name: 'John', isActive: true }
      expect(filters.$isGreaterThan('name', 5)(nonNumericItem)).toBe(false)
      expect(filters.$isGreaterThan('isActive', 0)(nonNumericItem)).toBe(false)
    })
  })

  describe('isLessThan', () => {
    it('should return true when value is less than target', () => {
      expect(filters.$isLessThan('age', 35)(item)).toBe(true)
      expect(filters.$isLessThan('score', 90)(item)).toBe(true)
      expect(filters.$isLessThan('rating', 5)(item)).toBe(true)
    })

    it('should return false when value is equal to or greater than target', () => {
      expect(filters.$isLessThan('age', 30)(item)).toBe(false)
      expect(filters.$isLessThan('age', 25)(item)).toBe(false)
      expect(filters.$isLessThan('score', 85)(item)).toBe(false)
      expect(filters.$isLessThan('score', 80)(item)).toBe(false)
    })
  })

  describe('isGreaterThanOrEqualTo', () => {
    it('should return true when value is greater than or equal to target', () => {
      expect(filters.$isGreaterThanOrEqualTo('age', 30)(item)).toBe(true)
      expect(filters.$isGreaterThanOrEqualTo('age', 25)(item)).toBe(true)
      expect(filters.$isGreaterThanOrEqualTo('score', 85)(item)).toBe(true)
      expect(filters.$isGreaterThanOrEqualTo('score', 80)(item)).toBe(true)
    })

    it('should return false when value is less than target', () => {
      expect(filters.$isGreaterThanOrEqualTo('age', 35)(item)).toBe(false)
      expect(filters.$isGreaterThanOrEqualTo('score', 90)(item)).toBe(false)
    })
  })

  describe('isLessThanOrEqualTo', () => {
    it('should return true when value is less than or equal to target', () => {
      expect(filters.$isLessThanOrEqualTo('age', 30)(item)).toBe(true)
      expect(filters.$isLessThanOrEqualTo('age', 35)(item)).toBe(true)
      expect(filters.$isLessThanOrEqualTo('score', 85)(item)).toBe(true)
      expect(filters.$isLessThanOrEqualTo('score', 90)(item)).toBe(true)
    })

    it('should return false when value is greater than target', () => {
      expect(filters.$isLessThanOrEqualTo('age', 25)(item)).toBe(false)
      expect(filters.$isLessThanOrEqualTo('score', 80)(item)).toBe(false)
    })
  })

  // Testing the negative versions
  describe('isNotGreaterThan', () => {
    it('should return true when value is not greater than target', () => {
      expect(filters.$isNotGreaterThan('age', 30)(item)).toBe(true)
      expect(filters.$isNotGreaterThan('age', 35)(item)).toBe(true)
    })

    it('should return false when value is greater than target', () => {
      expect(filters.$isNotGreaterThan('age', 25)(item)).toBe(false)
    })
  })

  describe('isNotLessThan', () => {
    it('should return true when value is not less than target', () => {
      expect(filters.$isNotLessThan('age', 30)(item)).toBe(true)
      expect(filters.$isNotLessThan('age', 25)(item)).toBe(true)
    })

    it('should return false when value is less than target', () => {
      expect(filters.$isNotLessThan('age', 35)(item)).toBe(false)
    })
  })
})

describe('String and Array Content Filters', () => {
  describe('contains', () => {
    it('should return true when string contains value', () => {
      const item = { name: 'John Doe', description: 'Senior Developer' }
      expect(filters.$contains('name', 'John')(item)).toBe(true)
      expect(filters.$contains('description', 'Developer')(item)).toBe(true)
    })

    it('should return false when string does not contain value', () => {
      const item = { name: 'John Doe', description: 'Senior Developer' }
      expect(filters.$contains('name', 'Jane')(item)).toBe(false)
      expect(filters.$contains('description', 'Manager')(item)).toBe(false)
    })

    it('should return true when array contains value', () => {
      const item = { tags: ['javascript', 'typescript', 'react'], categories: [1, 2, 3] }
      expect(filters.$contains('tags', 'javascript')(item)).toBe(true)
      expect(filters.$contains('categories', 2)(item)).toBe(true)
    })

    it('should return false when array does not contain value', () => {
      const item = { tags: ['javascript', 'typescript', 'react'], categories: [1, 2, 3] }
      expect(filters.$contains('tags', 'python')(item)).toBe(false)
      expect(filters.$contains('categories', 4)(item)).toBe(false)
    })

    it('should return false for non-string and non-array values', () => {
      const item = { age: 30, isActive: true }
      expect(filters.$contains('age', 3)(item)).toBe(false)
      expect(filters.$contains('isActive', true)(item)).toBe(false)
    })
  })

  describe('doesNotContain', () => {
    it('should return true when string does not contain value', () => {
      const item = { name: 'John Doe', description: 'Senior Developer' }
      expect(filters.$doesNotContain('name', 'Jane')(item)).toBe(true)
      expect(filters.$doesNotContain('description', 'Manager')(item)).toBe(true)
    })

    it('should return false when string contains value', () => {
      const item = { name: 'John Doe', description: 'Senior Developer' }
      expect(filters.$doesNotContain('name', 'John')(item)).toBe(false)
      expect(filters.$doesNotContain('description', 'Developer')(item)).toBe(false)
    })
  })

  describe('containsAll', () => {
    it('should return true when array contains all values', () => {
      const item = { tags: ['javascript', 'typescript', 'react', 'vue'] }
      expect(filters.$containsAll('tags', ['javascript', 'typescript'])(item)).toBe(true)
      expect(filters.$containsAll('tags', ['react', 'vue'])(item)).toBe(true)
    })

    it('should return false when array does not contain all values', () => {
      const item = { tags: ['javascript', 'typescript', 'react'] }
      expect(filters.$containsAll('tags', ['javascript', 'python'])(item)).toBe(false)
      expect(filters.$containsAll('tags', ['angular', 'vue'])(item)).toBe(false)
    })

    it('should return false for non-array values', () => {
      const item = { name: 'John', age: 30 }
      expect(filters.$containsAll('name', ['J', 'o'])(item)).toBe(false)
      expect(filters.$containsAll('age', [3, 0])(item)).toBe(false)
    })
  })

  describe('containsSome', () => {
    it('should return true when array contains some values', () => {
      const item = { tags: ['javascript', 'typescript', 'react'] }
      expect(filters.$containsSome('tags', ['javascript', 'python'])(item)).toBe(true)
      expect(filters.$containsSome('tags', ['angular', 'react'])(item)).toBe(true)
    })

    it('should return false when array contains none of the values', () => {
      const item = { tags: ['javascript', 'typescript', 'react'] }
      expect(filters.$containsSome('tags', ['python', 'ruby'])(item)).toBe(false)
      expect(filters.$containsSome('tags', ['angular', 'vue'])(item)).toBe(false)
    })
  })
})

describe('String and Array Pattern Filters', () => {
  describe('startsWith', () => {
    it('should return true when string starts with value', () => {
      const item = { name: 'John Doe', code: 'ABC123' }
      expect(filters.$startsWith('name', 'John')(item)).toBe(true)
      expect(filters.$startsWith('code', 'ABC')(item)).toBe(true)
    })

    it('should return false when string does not start with value', () => {
      const item = { name: 'John Doe', code: 'ABC123' }
      expect(filters.$startsWith('name', 'Doe')(item)).toBe(false)
      expect(filters.$startsWith('code', '123')(item)).toBe(false)
    })

    it('should return true when array starts with sequence', () => {
      const item = { sequence: [1, 2, 3, 4, 5] }
      expect(filters.$startsWith('sequence', [1, 2])(item)).toBe(true)
      expect(filters.$startsWith('sequence', [1])(item)).toBe(true)
    })

    it('should return false when array does not start with sequence', () => {
      const item = { sequence: [1, 2, 3, 4, 5] }
      expect(filters.$startsWith('sequence', [2, 3])(item)).toBe(false)
      expect(filters.$startsWith('sequence', [5])(item)).toBe(false)
    })

    it('should return false when sequence is longer than array', () => {
      const item = { sequence: [1, 2, 3] }
      expect(filters.$startsWith('sequence', [1, 2, 3, 4])(item)).toBe(false)
    })
  })

  describe('endsWith', () => {
    it('should return true when string ends with value', () => {
      const item = { name: 'John Doe', code: 'ABC123' }
      expect(filters.$endsWith('name', 'Doe')(item)).toBe(true)
      expect(filters.$endsWith('code', '123')(item)).toBe(true)
    })

    it('should return false when string does not end with value', () => {
      const item = { name: 'John Doe', code: 'ABC123' }
      expect(filters.$endsWith('name', 'John')(item)).toBe(false)
      expect(filters.$endsWith('code', 'ABC')(item)).toBe(false)
    })

    it('should return true when array ends with sequence', () => {
      const item = { sequence: [1, 2, 3, 4, 5] }
      expect(filters.$endsWith('sequence', [4, 5])(item)).toBe(true)
      expect(filters.$endsWith('sequence', [5])(item)).toBe(true)
    })

    it('should return false when array does not end with sequence', () => {
      const item = { sequence: [1, 2, 3, 4, 5] }
      expect(filters.$endsWith('sequence', [3, 4])(item)).toBe(false)
      expect(filters.$endsWith('sequence', [1])(item)).toBe(false)
    })

    it('should return true when array ends with string value', () => {
      const item = { tags: ['javascript', 'typescript', 'react'] }
      expect(filters.$endsWith('tags', 'react')(item)).toBe(true)
    })
  })
})

describe('Length and Existence Filters', () => {
  describe('isLongerThan', () => {
    it('should return true when string is longer than length', () => {
      const item = { name: 'John Doe', code: 'ABC' }
      expect(filters.$isLongerThan('name', 7)(item)).toBe(true)
      expect(filters.$isLongerThan('code', 2)(item)).toBe(true)
    })

    it('should return false when string is not longer than length', () => {
      const item = { name: 'John Doe', code: 'ABC' }
      expect(filters.$isLongerThan('name', 8)(item)).toBe(false)
      expect(filters.$isLongerThan('code', 3)(item)).toBe(false)
    })

    it('should return true when array is longer than length', () => {
      const item = { tags: ['javascript', 'typescript', 'react'] }
      expect(filters.$isLongerThan('tags', 2)(item)).toBe(true)
    })

    it('should return false when array is not longer than length', () => {
      const item = { tags: ['javascript', 'typescript', 'react'] }
      expect(filters.$isLongerThan('tags', 3)(item)).toBe(false)
      expect(filters.$isLongerThan('tags', 4)(item)).toBe(false)
    })

    it('should return false for non-string and non-array values', () => {
      const item = { age: 30, isActive: true }
      expect(filters.$isLongerThan('age', 1)(item)).toBe(false)
      expect(filters.$isLongerThan('isActive', 0)(item)).toBe(false)
    })
  })

  describe('isShorterThan', () => {
    it('should return true when string is shorter than length', () => {
      const item = { name: 'John Doe', code: 'ABC' }
      expect(filters.$isShorterThan('name', 9)(item)).toBe(true)
      expect(filters.$isShorterThan('code', 4)(item)).toBe(true)
    })

    it('should return false when string is not shorter than length', () => {
      const item = { name: 'John Doe', code: 'ABC' }
      expect(filters.$isShorterThan('name', 8)(item)).toBe(false)
      expect(filters.$isShorterThan('code', 3)(item)).toBe(false)
    })
  })

  describe('exists', () => {
    it('should return true when value exists', () => {
      const item = { name: 'John', age: 30, score: 0, empty: '' }
      expect(filters.$exists('name', true)(item)).toBe(true)
      expect(filters.$exists('age', true)(item)).toBe(true)
      expect(filters.$exists('score', true)(item)).toBe(true)
      expect(filters.$exists('empty', true)(item)).toBe(true)
    })

    it('should return false when value does not exist', () => {
      const item = { name: 'John', nullProp: null }
      expect(filters.$exists('address', true)(item)).toBe(false)
      expect(filters.$exists('nullProp', true)(item)).toBe(false)
    })
  })
})

describe('isEmpty', () => {
  it('should return true when value is empty', () => {
    const item = {
      emptyString: '',
      emptyArray: [],
      emptyObject: {},
      nullValue: null,
      undefinedValue: undefined,
    }
    expect(filters.$isEmpty('emptyString', true)(item)).toBe(true)
    expect(filters.$isEmpty('emptyArray', true)(item)).toBe(true)
    expect(filters.$isEmpty('emptyObject', true)(item)).toBe(true)
    expect(filters.$isEmpty('nullValue', true)(item)).toBe(true)
    expect(filters.$isEmpty('undefinedValue', true)(item)).toBe(true)
    expect(filters.$isEmpty('nonExistent', true)(item)).toBe(true)
  })

  it('should return false when value is not empty', () => {
    const item = {
      name: 'John',
      age: 30,
      isActive: false,
      tags: ['js'],
      settings: { theme: 'dark' },
    }
    expect(filters.$isEmpty('name', true)(item)).toBe(false)
    expect(filters.$isEmpty('age', true)(item)).toBe(false)
    expect(filters.$isEmpty('isActive', true)(item)).toBe(false)
    expect(filters.$isEmpty('tags', true)(item)).toBe(false)
    expect(filters.$isEmpty('settings', true)(item)).toBe(false)
  })
})
