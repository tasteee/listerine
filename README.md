# listerine

listerine is a powerful, type-safe, in-memory query engine with Mongo-*ish* syntax for performing complex (or simple!) queries on arrays of objects.

## Features
- **MongoDB-like Query Syntax**: Filters and stuff
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

type UserT = {
  id: string,
  name: string,
  age: number,
  tags: string[]
}

const hannah = { id: '1', name: 'hannah', age: 25, tags: ['admin', 'dev'] }
const lily = { id: '2', name: 'lily', age: 18, tags: ['guest'] }
const sailor = { id: '3', name: 'sailor', age: 32, tags: ['guest'] }
const userList = [hannah, lily, sailor]
const userCollection = listerine<UserT>(userList)

const query =  { age$: { $isGreaterThan: 20 } }
const adults = userCollection.find(query)
expect(adults).toEqual([hannah, sailor])

const query = { tags$: { $contains: 'guest' } }
const guests = userCollection.find(query)
expect(guests).toEqual([lily, sailor])

const members = userCollection.findById(['1', '2'])
expect(members).toEqual([hannah, lily])

const member = userCollection.findById('1')
expect(member).toEqual(hannah)
```

## API Reference

### `listerine<DataT>(dataList: DataT[])`

Creates a new listerine collection with the provided array of objects.


```ts
const collection = listerine<UserT>(userList)
expect(collection).toHaveProperty('find')
expect(collection).toHaveProperty('findById')
expect(collection).toHaveProperty('findByIds')
```

*NOTE: listerine will apply an `id` property to any object in `dataList` that does not already have one.*

### `collection.find(query: QueryT)`

Finds and returns an array of all documents matching the query criteria.

```ts
const collection = listerine<UserT>(userList)
const results = collection.find({ isActive: true })
expect(Array.isArray(results)).toEqual(true)
```

### `collection.findById(id: string)`

Finds and returns the document that has the provided id. If no document has the provided id, returns `null`.

```ts
const collection = listerine<UserT>(userList)
const result = collection.findById('123')
```

### `collection.findByIds(ids: string[])`

Finds and returns any documents with an id found in the provided ids. If no documents match the provided ids, an empty array.

```ts
const collection = listerine<UserT>(userList)
const result = collection.findById('123')
expect(Array.isArray(results)).toEqual(true)
```

## Query Syntax

### Basic Equality

```ts
// Direct equality (implicit $equals)
list.find({ name: 'hannah' })

// Explicit equality
list.find({ name$: { $equals: 'hannah' } })

// Not equal
list.find({ name$: { $doesNotEqual: 'hannah' } })
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
list.find({ tags$: { $containsAll: ['admin', 'dev'] } })

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
        name: 'hannah',
        age: 25,
      },
      settings: {
        theme: 'dark',
      },
    },
  },
]

const list = listerine(users)

// Nested query
list.find({
  profile: {
    personal: {
      name: 'hannah',
      age$: { $isGreaterThan: 25 },
    },
  },
})

// Or...
list.find({
  'profile.personal.name': 'hannah',
  'profile.personal.age$': { $isGreaterThan: 25 },
})
```

## Advanced Examples

### User Management System

```ts
type UserT = {
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

// 💭 Imagine there are more users that just the one.
const users: UserT[] = [
  {
    id: '1',
    username: 'alice_admin',
    email: 'alice@example.com',
    age: 25,
    roles: ['admin', 'user'],
    isActive: true,
    profile: {
      firstName: 'hannah',
      lastName: 'Johnson',
      bio: 'System administrator',
    },
  }
]

const usersCollection = listerine<UserT>(memberList)

// Find active admin users
const activeAdmins = usersCollection.find({
  isActive: true,
  roles$: { $contains: 'admin' },
})

// Find users with incomplete profiles
const incompleteProfiles = usersCollection.find({
  'profile.bio$': { $doesNotExist: true }
})

// Find young active users or admins
const targetUsers = usersCollection.find({
  $or: [
    { roles$: { $contains: 'admin' } },
    {
      isActive: true,
      age$: { $isLessThan: 25 }
    },
  ],
})
```

### E-commerce Product Search

```ts
type ProductT =  {
  id: string
  name: string
  price: number
  category: string
  tags: string[]
  inStock: boolean
  rating: number
  description: string
}

// 💭 Imagine there are more products that just the one.
const products: ProductT[] = [
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
]

const productsCollection = listerine<ProductT>(products)

// Find affordable electronics in stock
const affordableElectronics = productsCollection.find({
  category: 'Electronics',
  price$: { $isLessThanOrEqualTo: 100 },
  inStock: true,
})

// Find highly rated products with specific features
const premiumProducts = productsCollection.find({
  rating$: { $isGreaterThanOrEqualTo: 4.0 },

  $or: [
    { tags$: { $contains: 'premium' } },
    { price$: { $isGreaterThan: 200 } }
  ],
})

// Search products by description keywords
const results = productsCollection.find({
  $or: [
    { name$: { $contains: 'wireless' } },
    { description$: { $contains: 'wireless' } },
    { tags$: { $contains: 'wireless' } }
  ],
})
```

## TypeScript Support

listerine is built with TypeScript and provides full type safety:

```ts
type DataT = {
  id: string
  name: string
  count: number
}

const data: DataT[] = [...]
const list = listerine<DataT>(data) // Fully typed

// TypeScript will enforce correct property names and types
const results = list.find({
  name$: { $contains: 'test' }, // ✅ Valid
  count$: { $isGreaterThan: 5 }, // ✅ Valid
  // invalid$: { $contains: 'test' } // ❌ TypeScript error
})
```

## Contributing

Contributions are welcome!  
No rules or templates -- just have fun!

## License

MIT License
