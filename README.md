![listerine logo](https://raw.githubusercontent.com/tasteee/listerine/refs/heads/main/rainbow-logo.png)

listerine allows you to query arrays of complex data types using an intuitive, DX focused API.

### Installation

```bash
npm install listerine
```

## Quick Start

### Querying

```javascript
import { listerine } from 'listerine'

const lilJohn = { id: 0, name: 'John', age: 30, isActive: true }
const hannah = { id: 1, name: 'Hannah', age: 25, isActive: true }
const oldJohn = { id: 2, name: 'John', age: 35, isActive: false }
const users = [lilJohn, hannah, oldJohn]

// Directly query by key/value matches.
const queryOptions = { isActive: true }
const query = listerine(users).query(queryOptions)
query.data // [lilJohn, hannah]

// Query using key/value filters.
const queryOptions = { age$: { $isBetween: [30, 40] } }
const query = listerine(users).query(queryOptions)
query.data // [oldJohn]

// Query using a combo of direct key/value matches and filters.
const queryOptions = { name$: { $startsWith: 'H' }, isActive: true }
const query = listerine(users).query(queryOptions)
query.data // [hannah]
```

### Sorting

```javascript
import { listerine } from 'listerine'

const py = { name: 'python', age: 34, tags: ['server', 'clean', 'popular'] }
const js = { name: 'javascript', age: 30, tags: ['web', 'server', 'popular'] }
const nim = { name: 'nim', age: 20, tags: ['server', 'transpiled', 'unpopular'] }
const languages = [py, js, nim]

// Sort your query results by key / direction.
const queryOptions = { tags$: { $contains: 'popular' } }
const sortOptions = { key: 'name', direction: 'ascending' } // or 'descending'
const query = listerine(languages).query(queryOptions).sort(sortOptions)
query.data // [js, py]

// Sort your query results with a sort function.
const queryOptions = { tags$: { $contains: 'server' } }
const sorter = (a, b) => (a.name < b.name ? -1 : 1)
const query = listerine(languages).query(queryOptions).sort(sorter)
query.data // [nim, py, js]
```

### Selecting

```javascript
import { listerine } from 'listerine'

const a = { index: 0, letter: 'a', isVowel: true }
const b = { index: 1, letter: 'b', isVowel: false }
const c = { index: 2, letter: 'c', isVowel: false }
const letters = [a, b, c]

// Select specific properties you want on the final data.
const queryOptions = { index$: { $isGreaterThan: 0 } }
const selectKeys = ['letter']
const query = listerine(letters).query(queryOptions).select(selectKeys)
query.data // [{ letter: 'b' }, { letter: 'c' }]

// Select specific properties you do NOT want on the final data.
const queryOptions = {} // query everything!
const selectKeys = ['!letter', '!isVowel']
const query = listerine(letters).query(queryOptions).select(selectKeys)
query.data // [{ index: 0 }, { index: 1 }, { index: 2 }]

// Provide a selector function to derive your final data.
const queryOptions = { isVowel$: { $isNot: true } }
const selector = (item) => ({ capitalLetter: item.letter.toUpperCase() })
const query = listerine(letters).query(queryOptions).select(selectKeys)
query.data // [{ capitalLetter: 'B' }, { capitalLetter: 'C' }]
```

## Features

### Query Operations

listerine supports a wide range of query operations to filter your data:

#### Direct Match

```javascript
listerine(data).query({ name: 'John' })
```

#### String Operations

- `$startsWith`: Match strings that start with a value
- `$endsWith`: Match strings that end with a value
- `$contains`: Match strings that contain a value
- `$doesNotStartWith`: Match strings that don't start with a value
- `$doesNotEndWith`: Match strings that don't end with a value
- `$doesNotContain`: Match strings that don't contain a value
- `$isLongerThan`: Match strings longer than a value
- `$isNotLongerThan`: Match strings not longer than a value
- `$isShorterThan`: Match strings shorter than a value
- `$isNotShorterThan`: Match strings not shorter than a value

```javascript
listerine(data).query({
  name$: { $startsWith: 'J' },
})
```

#### Numeric Operations

- `$isGreaterThan`: Match numbers greater than a value
- `$isLessThan`: Match numbers less than a value
- `$isGreaterThanOrEqualTo`: Match numbers greater than or equal to a value
- `$isLessThanOrEqualTo`: Match numbers less than or equal to a value
- `$isNotGreaterThan`: Match numbers not greater than a value
- `$isNotLessThan`: Match numbers not less than a value
- `$isNotGreaterThanOrEqualTo`: Match numbers not greater than or equal to a value
- `$isNotLessThanOrEqualTo`: Match numbers not less than or equal to a value
- `$isBetween`: Match numbers between two values
- `$isNotBetween`: Match numbers not between two values

```javascript
listerine(data).query({
  age$: { $isBetween: [25, 35] },
})
```

#### Array Operations

- `$contains`: Match arrays containing a value
- `$doesNotContain`: Match arrays not containing a value
- `$startsWith`: Match arrays starting with a value
- `$doesNotStartWith`: Match arrays not starting with a value
- `$endsWith`: Match arrays ending with a value
- `$doesNotEndWith`: Match arrays not ending with a value
- `$isLongerThan`: Match arrays longer than a value
- `$isNotLongerThan`: Match arrays not longer than a value
- `$isShorterThan`: Match arrays shorter than a value
- `$isNotShorterThan`: Match arrays not shorter than a value
- `$containsAll`: Match arrays containing all specified values
- `$containsSome`: Match arrays containing some specified values
- `$isEmpty`: Match empty arrays
- `$isNotEmpty`: Match non-empty arrays

```javascript
listerine(data).query({
  tags$: { $containsAll: ['smart', 'tall'], $endsWith: 'smart' },
})
```

#### Equality Operations

These work for any data type.

- `$equals` / `$is`: Match values equal to a value
- `$doesNotEqual` / `$isNot`: Match values not equal to a value
- `$isOneOf`: Match values that are one of the specified values
- `$isNotOneOf`: Match values that are not one of the specified values

```javascript
listerine(data).query({
  age$: { $isOneOf: [25, 35], $isNot: 27 },
  name$: { $isOneOf: ['Hannah', 'Rokki'] },
})
```

#### Existence Operations

- `$exists`: Match fields that exist or don't exist

```javascript
listerine(data).query({
  middleName$: { $exists: false },
})
```

### Logical Operators

Combine multiple conditions with logical operators:

#### $and

```javascript
listerine(data).query({
  $and: [{ isActive: true }, { age$: { $isGreaterThan: 30 } }],
})
```

Note: Multiple conditions in a single query object are implicitly combined with AND.

#### $or

```javascript
listerine(data).query({
  $or: [{ name: 'Alice' }, { age$: { $isGreaterThan: 35 } }],
})
```

#### Nested Logical Operators

```javascript
listerine(data).query({
  $or: [{ $and: [{ isActive: true }, { age$: { $isGreaterThan: 30 } }] }, { name: 'Alice' }],
})
```

### Sorting

Sort your data with the `sort` method:

```javascript
// Sort by a specific key
listerine(data).sort({ key: 'age', direction: 'ascending' })
listerine(data).sort({ key: 'name', direction: 'descending' })

// Sort with a custom function
listerine(data).sort((a, b) => a.tags.length - b.tags.length)
```

### Selection

Select specific fields with the `select` method:

```javascript
listerine(data).select(['id', 'name'])
```

### Method Chaining

All methods can be chained together in any order:

```javascript
listerine(data).query({ isActive: true }).sort({ key: 'age', direction: 'descending' }).select(['id', 'name', 'age'])
```

## Advanced Examples

### Nested Properties

Query nested properties using dot notation:

```javascript
listerine(data).query({
  'meta.isAdmin': true,
  'meta.createdAt$': { $isGreaterThan: 1000 },
})
```

### Complex Filtering

Combine multiple filters for complex queries:

```javascript
const result = listerine(users).query({
  isActive: true,
  'meta.isAdmin': true,
  age$: { $isGreaterThan: 25, $isLessThan: 35 },
  name$: { $startsWith: 'J', $endsWith: 'n' },
  tags$: { $containsSome: ['smart', 'tall'] },
})
```

### Multiple Sorts

Apply multiple sorts in sequence:

```javascript
const result = listerine(users)
  .sort({ key: 'name', direction: 'ascending' }) // First by name
  .sort({ key: 'age', direction: 'descending' }) // Then by age
```

### Complete Example

```javascript
const isActiveFilter = { isActive: true }
const ageFilter = { age$: { $isGreaterThan: 30 } }
const nameFilter = { name: 'Alice' }
const isActiveAndOldFilter = { $and: [isActiveFilter, ageFilter] }
const queryOptions = { $or: [isActiveAndOldFilter, nameFilter] }
const sortOptions = { key: 'age', direction: 'descending' }
const seletKeys = ['id', 'name', 'age']

const results = listerine(users).query(queryOptions).sort(sortOptions).select(selectKeys).data
```

## API Reference

### `listerine(data)`

Creates a new listerine instance with the provided data array.

```javascript
const list = listerine(data)
list.data // the provided array
list.query(...)
list.sort(...)
list.select(...)
```

### `.query(queryObject)`

```javascript
const list = listerine(data)
list.query({ name: 'Sally' })
list.query({ name$: { $endsWith: 'y' }, age$: { $isBetween: [20, 40] } })
// TODO: $or...
// TODO: $and...
```

Filters the data based on the provided query object.

### `.sort(options | compareFn)`

Sorts the data either by a key and direction or using a custom compare function.

```javascript
const list = listerine(data)
list.sort({ key: 'dateAdded', direction: 'descending' })
list.sort({ key: 'name', direction: 'ascending' })
list.sort((a, b) => a.name.localeCompare(b.name)) // by name, ascending
list.sort((a, b) => b.name.localeCompare(a.name)) // by name, descending
```

### `.select(keys | selectorFn)`

Selects or deselects specific keys from each item in the data.

```javascript
const list = listerine(data)
list.select(['name', 'age'])
list.select(['!id', '!emailAddress'])
list.select((user) => ({ fullName: `${user.firstName} ${user.lastName}` }))
```

## License

MIT
