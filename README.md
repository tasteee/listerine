# listerine

A powerful, type-safe in-memory query engine for JavaScript/TypeScript arrays. listerine provides MongoDB-like query syntax for filtering, searching, and retrieving data from arrays of objects.

## Features

- **MongoDB-like Query Syntax**: Filters galore!
- **Type Safety**: Full TypeScript support with generic types
- **Logical Operators**: Support for `$and` and `$or` operations
- **Nested Object Queries**: Query deeply nested object properties
- **Array Operations**: Comprehensive array filtering and matching
- **String Operations**: Text searching, pattern matching, and length checks
- **Numeric Comparisons**: Range / equality checks, mathematical operations
- **Existence Checks**: Test for null, undefined, empty values

## Installation

```
npm install listerine
```

## Quick Start

```ts
import { listerine } from 'listerine'

const users = [
  { id: '1', name: 'Alice', age: 30, tags: ['admin', 'developer'] },
  { id: '2', name: 'Bob', age: 25, tags: ['user'] },
  { id: '3', name: 'Charlie', age: 35, tags: ['admin'] },
]

// Find users older than 25
const adults = listerine(users).find({ age$: { $isGreaterThan: 25 } })
// Returns: Alice and Charlie

// Find admins
const admins = listerine(users).find({ tags$: { $contains: 'admin' } })
// Returns: Alice and Charlie

// Find specific user by ID
const user = listerine(users).findById('1')
// Returns: Alice
```

## API Reference

### Core Methods

#### `listerine(data)`

Creates a new listerine instance with the provided data array.

**Parameters:**

- `data`: Array of objects, each must have an `id` property

**Returns:** listerine instance with `find`, `findById`, and `findByIds` methods

#### `find(query)`

Finds all documents matching the query criteria.

**Parameters:**

- `query`: Query object using listerine query syntax

**Returns:** Array of matching documents

#### `findById(id)`

Finds a single document by its ID.

**Parameters:**

- `id`: String ID of the document

**Returns:** Single document or `undefined`

#### `findByIds(ids)`

Finds multiple documents by their IDs.

**Parameters:**

- `ids`: Array of string IDs

**Returns:** Array of matching documents

## Query Syntax

### Basic Equality

```ts
// Direct equality (implicit $equals)
list.find({ name: 'Alice' })

// Explicit equality
list.find({ name$: { $equals: 'Alice' } })

// Not equal
list.find({ name$: { $doesNotEqual: 'Alice' } })
```

### Numeric Comparisons

```ts
// Greater than
list.find({ age$: { $isGreaterThan: 25 } })

// Less than
list.find({ age$: { $isLessThan: 30 } })

// Greater than or equal to
list.find({ age$: { $isGreaterThanOrEqualTo: 25 } })

// Less than or equal to
list.find({ age$: { $isLessThanOrEqualTo: 30 } })

// Between (inclusive)
list.find({ age$: { $isBetween:  } })

// Not between
list.find({ age$: { $isNotBetween:  } })
```

### Array Operations

```ts
// Contains a value
list.find({ tags$: { $contains: 'admin' } })

// Contains all values
list.find({ tags$: { $containsAll: ['admin', 'developer'] } })

// Contains some values
list.find({ tags$: { $containsSome: ['admin', 'user'] } })

// Does not contain
list.find({ tags$: { $doesNotContain: 'admin' } })

// Is one of (value in array)
list.find({ role$: { $isOneOf: ['admin', 'moderator'] } })

// Is not one of
list.find({ role$: { $isNotOneOf: ['banned', 'suspended'] } })

// Is in (array is subset)
list.find({ permissions$: { $isIn: ['read', 'write', 'delete'] } })

// Is subset of
list.find({ tags$: { $isSubsetOf: ['admin', 'user', 'guest'] } })

// Is superset of
list.find({ permissions$: { $isSupersetOf: ['read'] } })
```

### String Operations

```ts
// Contains substring
list.find({ name$: { $contains: 'Ali' } })

// Starts with
list.find({ name$: { $startsWith: 'A' } })

// Ends with
list.find({ email$: { $endsWith: '@example.com' } })

// Does not start with
list.find({ name$: { $doesNotStartWith: 'B' } })

// Does not end with
list.find({ email$: { $doesNotEndWith: '@spam.com' } })

// Length comparisons
list.find({ name$: { $isLongerThan: 5 } })
list.find({ name$: { $isShorterThan: 10 } })
list.find({ name$: { $isNotLongerThan: 15 } })
list.find({ name$: { $isNotShorterThan: 3 } })
```

### Existence and Emptiness

```ts
// Field exists
list.find({ email$: { $exists: true } })

// Field does not exist
list.find({ email$: { $exists: false } })
list.find({ email$: { $doesNotExist: true } })

// Field is empty (null, undefined, '', [], {})
list.find({ description$: { $isEmpty: true } })

// Field is not empty
list.find({ description$: { $isNotEmpty: true } })
```

### Logical Operators

```ts
// AND operation (default behavior)
list.find({
  age$: { $isGreaterThan: 25 },
  name$: { $startsWith: 'A' },
})

// Explicit AND
list.find({
  $and: [{ age$: { $isGreaterThan: 25 } }, { name$: { $startsWith: 'A' } }],
})

// OR operation
list.find({
  $or: [{ age$: { $isLessThan: 25 } }, { tags$: { $contains: 'admin' } }],
})

// Complex nested logic
list.find({
  $and: [
    {
      $or: [{ age$: { $isLessThan: 25 } }, { age$: { $isGreaterThan: 35 } }],
    },
    { tags$: { $contains: 'active' } },
  ],
})
```

### Nested Object Queries

```ts
const users = [
  {
    id: '1',
    profile: {
      personal: {
        name: 'Alice',
        age: 30,
      },
      settings: {
        theme: 'dark',
      },
    },
  },
]

const list = listerine(users)

// Query nested properties
list.find({
  profile: {
    personal: {
      age$: { $isGreaterThan: 25 },
    },
  },
})

// Alternative dot notation (if supported by your data structure)
list.find({
  'profile.personal.name': 'Alice',
  'profile.personal.age$': { $isGreaterThan: 25 },
})
```

## Advanced Examples

### User Management System

```ts
interface User {
  id: string
  username: string
  email: string
  age: number
  roles: string[]
  isActive: boolean
  lastLogin?: Date
  profile: {
    firstName: string
    lastName: string
    bio?: string
  }
}

const users: User[] = [
  {
    id: '1',
    username: 'alice_admin',
    email: 'alice@example.com',
    age: 30,
    roles: ['admin', 'user'],
    isActive: true,
    profile: {
      firstName: 'Alice',
      lastName: 'Johnson',
      bio: 'System administrator',
    },
  },

  // ... more users
]

// Find active admin users
const activeAdmins = listerine(users).find({
  isActive: true,
  roles$: { $contains: 'admin' },
})

// Find users with incomplete profiles
const incompleteProfiles = listerine(users).find({
  profile: {
    bio$: { $doesNotExist: true },
  },
})

// Find young active users or admins
const targetUsers = listerine(users).find({
  $or: [
    {
      $and: [{ age$: { $isLessThan: 25 } }, { isActive: true }],
    },
    { roles$: { $contains: 'admin' } },
  ],
})
```

### E-commerce Product Search

```ts
interface Product {
  id: string
  name: string
  price: number
  category: string
  tags: string[]
  inStock: boolean
  rating: number
  description: string
}

const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 99.99,
    category: 'Electronics',
    tags: ['wireless', 'audio', 'bluetooth'],
    inStock: true,
    rating: 4.5,
    description: 'High-quality wireless headphones with noise cancellation',
  },

  // ... more products
]

// Find affordable electronics in stock
const affordableElectronics = listerine(products).find({
  category: 'Electronics',
  price$: { $isLessThanOrEqualTo: 100 },
  inStock: true,
})

// Find highly rated products with specific features
const premiumProducts = listerine(products).find({
  rating$: { $isGreaterThanOrEqualTo: 4.0 },
  $or: [{ tags$: { $contains: 'premium' } }, { price$: { $isGreaterThan: 200 } }],
})

// Search products by description keywords
const searchResults = listerine(products).find({
  $or: [{ name$: { $contains: 'wireless' } }, { description$: { $contains: 'wireless' } }, { tags$: { $contains: 'wireless' } }],
})
```

## TypeScript Support

listerine is built with TypeScript and provides full type safety:

```ts
interface MyData {
  id: string
  name: string
  count: number
}

const data: MyData[] = [...]
const list = listerine(data) // Fully typed

// TypeScript will enforce correct property names and types
const results = list.find({
  name$: { $contains: 'test' }, // ✅ Valid
  count$: { $isGreaterThan: 5 }, // ✅ Valid
  // invalid$: { $contains: 'test' } // ❌ TypeScript error
})
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

## License

MIT License
