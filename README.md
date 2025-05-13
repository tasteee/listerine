![listerine logo](/logo.png)

listerine is a powerful and intuitive JavaScript/TypeScript library for filtering arrays of objects using a declarative query syntax. It allows you to express complex filtering conditions in a readable, maintainable way without relying on cryptic shorthand notations.

_listerine is also experimental. Take inspiration, but don't put a lot of faith in this library yet in terms of perforance, efficency, etc._

## Installation

```bash
npm install listerine
```

## Basic Usage

```ts
import { listerine } from 'listerine'

const users = [
  { id: 1, name: 'Alice', age: 28, isActive: true },
  { id: 2, name: 'Bob', age: 35, isActive: false },
  { id: 3, name: 'Charlie', age: 22, isActive: true },
]

// Find active users over 25
const results = listerine(users).query({
  isActive: true,
  age$: { $isGreaterThan: 25 },
})
```

## Query Syntax

The query syntax is designed to be intuitive and self-documenting. There are two main ways to specify conditions:

1. **Direct match**: `propertyName: value` - Checks if the property exactly equals the specified value
2. **Filter conditions**: `propertyName$: { /* filters */ }` - Applies specific filters to the property

### Direct Match

```ts
// Find users with isActive set to true
listerine(users).query({ isActive: true })

// Find users with name 'Alice'
listerine(users).query({ name: 'Alice' })
```

### Filter Conditions

Append `$` to the property name to use filter conditions:

```ts
// Find users whose name contains 'li'
listerine(users).query({ name$: { $contains: 'li' } })
```

### Nested Properties

Access nested properties using dot notation:

```ts
const data = [{ user: { name: 'Alice', profile: { age: 28 } } }, { user: { name: 'Bob', profile: { age: 35 } } }]

// Direct match on nested property
listerine(data).query({ 'user.name': 'Alice' })

// Filters on nested property
listerine(data).query({ 'user.profile.age$': { $isGreaterThan: 30 } })
```

### TODO: Logical Operators (NOT YET IMPLEMENTED)

Combine multiple conditions with logical operators:

```ts
// AND conditions (default)
listerine(users).query({
  isActive: true,
  age$: { $isGreaterThan: 25 },
})

// OR conditions
listerine(users).query({
  $or: [{ name: 'Alice' }, { age$: { $isGreaterThan: 30 } }],
})
```

## Available Filters

### Equality Filters

| Filter          | Description                            | Example                                           |
| --------------- | -------------------------------------- | ------------------------------------------------- |
| `$equals`       | Exact equality                         | `{ name$: { $equals: 'Alice' } }`                 |
| `$doesNotEqual` | Negated equality                       | `{ name$: { $doesNotEqual: 'Alice' } }`           |
| `$isOneOf`      | Value is one of the provided array     | `{ name$: { $isOneOf: ['Alice', 'Bob'] } }`       |
| `$isNotOneOf`   | Value is not one of the provided array | `{ name$: { $isNotOneOf: ['Charlie', 'Dave'] } }` |

### Numeric Comparison Filters

| Filter                       | Description                                           | Example                                        |
| ---------------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| `$isGreaterThan`             | Value is greater than provided number                 | `{ age$: { $isGreaterThan: 25 } }`             |
| `$isLessThan`                | Value is less than provided number                    | `{ age$: { $isLessThan: 30 } }`                |
| `$isGreaterThanOrEqualTo`    | Value is greater than or equal to provided number     | `{ age$: { $isGreaterThanOrEqualTo: 28 } }`    |
| `$isLessThanOrEqualTo`       | Value is less than or equal to provided number        | `{ age$: { $isLessThanOrEqualTo: 35 } }`       |
| `$isNotGreaterThan`          | Value is not greater than provided number             | `{ age$: { $isNotGreaterThan: 30 } }`          |
| `$isNotLessThan`             | Value is not less than provided number                | `{ age$: { $isNotLessThan: 25 } }`             |
| `$isNotGreaterThanOrEqualTo` | Value is not greater than or equal to provided number | `{ age$: { $isNotGreaterThanOrEqualTo: 35 } }` |
| `$isNotLessThanOrEqualTo`    | Value is not less than or equal to provided number    | `{ age$: { $isNotLessThanOrEqualTo: 20 } }`    |
| `$isBetween`                 | Value is between two numbers (inclusive)              | `{ age$: { $isBetween: [25, 35] } }`           |
| `$isNotBetween`              | Value is not between two numbers (exclusive)          | `{ age$: { $isNotBetween: [20, 25] } }`        |

### String Filters

| Filter              | Description                                       | Example                                  |
| ------------------- | ------------------------------------------------- | ---------------------------------------- |
| `$startsWith`       | String starts with the provided substring         | `{ name$: { $startsWith: 'Al' } }`       |
| `$doesNotStartWith` | String does not start with the provided substring | `{ name$: { $doesNotStartWith: 'Bo' } }` |
| `$endsWith`         | String ends with the provided substring           | `{ name$: { $endsWith: 'ce' } }`         |
| `$doesNotEndWith`   | String does not end with the provided substring   | `{ name$: { $doesNotEndWith: 'ob' } }`   |
| `$contains`         | String contains the provided substring            | `{ name$: { $contains: 'lic' } }`        |
| `$doesNotContain`   | String does not contain the provided substring    | `{ name$: { $doesNotContain: 'bob' } }`  |

### Array Filters

| Filter              | Description                                            | Example                                          |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| `$contains`         | Array includes the provided value                      | `{ tags$: { $contains: 'js' } }`                 |
| `$doesNotContain`   | Array does not include the provided value              | `{ tags$: { $doesNotContain: 'python' } }`       |
| `$containsAll`      | Array includes all provided values                     | `{ tags$: { $containsAll: ['js', 'ts'] } }`      |
| `$containsSome`     | Array includes at least one of the provided values     | `{ tags$: { $containsSome: ['js', 'python'] } }` |
| `$startsWith`       | Array's first element matches the provided value       | `{ tags$: { $startsWith: 'js' } }`               |
| `$doesNotStartWith` | Array's first element doesn't match the provided value | `{ tags$: { $doesNotStartWith: 'python' } }`     |
| `$endsWith`         | Array's last element matches the provided value        | `{ tags$: { $endsWith: 'ts' } }`                 |
| `$doesNotEndWith`   | Array's last element doesn't match the provided value  | `{ tags$: { $doesNotEndWith: 'java' } }`         |

### Length Filters (for Strings and Arrays)

| Filter              | Description                                | Example                               |
| ------------------- | ------------------------------------------ | ------------------------------------- |
| `$isLongerThan`     | Length is greater than provided number     | `{ name$: { $isLongerThan: 4 } }`     |
| `$isShorterThan`    | Length is less than provided number        | `{ name$: { $isShorterThan: 6 } }`    |
| `$isNotLongerThan`  | Length is not greater than provided number | `{ name$: { $isNotLongerThan: 10 } }` |
| `$isNotShorterThan` | Length is not less than provided number    | `{ name$: { $isNotShorterThan: 3 } }` |

### Special Filters

| Filter     | Description                                                | Example                              |
| ---------- | ---------------------------------------------------------- | ------------------------------------ |
| `$exists`  | Property exists and is not null or undefined               | `{ middleName$: { $exists: true } }` |
| `$isEmpty` | String is empty, array has length 0, or object has no keys | `{ tags$: { $isEmpty: true } }`      |

## Complex Query Examples

You can combine multiple filters to create complex queries:

```ts
// Find active admin users named John who are exactly 30 years old and are tall
const results = listerine(users).query({
  isActive: true,
  'meta.isAdmin': true,
  name: 'John',
  age: 30,
  tags$: { $contains: 'tall' },
})

// Find users with complex criteria
const complexResults = listerine(users).query({
  isActive: true,
  'meta.isAdmin': true,
  age$: { $isGreaterThan: 25, $isLessThan: 35 },
  name$: { $startsWith: 'J', $endsWith: 'n' },
  tags$: { $containsSome: ['smart', 'tall'] },
  'meta.createdAt$': { $isGreaterThan: 1715550000000, $isLessThan: 1715558500000 },
})
```

## TypeScript Support

listerine provides full TypeScript support:

```ts
import { listerine } from 'listerine'

interface User {
  id: number
  name: string
  age: number
  isActive: boolean
  tags: string[]
  meta: {
    isAdmin: boolean
    isMember: boolean
    createdAt: number
  }
}

const users: User[] = [
  /* user objects */
]

// TypeScript will check that you're filtering on valid properties
const results = listerine(users).query({
  isActive: true,
  age$: { $isGreaterThan: 25 },
  'meta.isAdmin': true,
})
```

## License

MIT
