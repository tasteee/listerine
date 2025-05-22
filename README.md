<!-- ⚠️ This README has been generated from the file(s) "./docs/blueprint.md" ⚠️-->
[](#listerine)

# listerine

A lightweight, TypeScript-first, Mongo-inspired library for managing and querying arrays of complex data using an intuitive, developer-focused API.


[](#table-of-contents)

## → Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Querying](#querying)
- [Sorting](#sorting)
- [Inserting](#inserting)
- [Updating](#updating)
- [Removing](#removing)
- [Filters](#filters)
- [Configuration](#configuration)
- [Examples](#examples)
- [License](#license)



[](#installation)

## → Installation

```bash
npm install listerine
```



[](#usage)

## → Usage

First, let's set up a listerine collection.

```typescript
import { listerine } from 'listerine'

type UserT = {
  id: string
  name: string
  age: number
  isActive: boolean
}

const lilJohn = { id: '0', name: 'john', age: 30, isActive: true }
const hannah = { id: '1', name: 'hannah', age: 25, isActive: true }
const oldJohn = { id: '2', name: 'john', age: 35, isActive: false }
const users = [lilJohn, hannah, oldJohn]
const usersCollection = listerine<UserT>(users)
```

`usersCollection.data` is a very normal array and can be used as such, but it is slightly enhanced with getters for easily accessing the first and last items of the list.

```typescript
usersCollection.data // [liljohn, hannah, oldjohn]
usersCollection.data[0] // liljohn
usersCollection.data.first // liljohn
usersCollection.data.last // oldjohn
```

### Querying

You can query a collection using just a string id to find the document that has that specific id. (When querying by id with the intent of finding one specific item, you lean on `query.data.first` to easily access the singular result.)

```typescript
const queriedCollection = usersCollection.query('1')
queriedCollection.data // [hannah]
queriedCollection.data.first // hannah
```

You can query a collection using an array of string ids.

```typescript
const queriedCollection = usersCollection.query(['0', '2'])
queriedCollection.data // [liljohn, oldjohn]
```

You can query a collection using a filter object.

```typescript
const queriedCollection = usersCollection.query({ isActive: true })
queriedCollection.data // [liljohn, hannah]
```

When querying, a new collection is created to manage the resulting filtered data set, leaving the original collection unaffected.

```typescript
const queriedCollection = usersCollection.query({ name$: { $startsWith: 'j' } })
usersCollection.data // [liljohn, hannah, oldjohn]
queriedCollection.data // [liljohn, oldjohn]
```

You can query a collection using exact match key/value queries.

```typescript
const queryOptions = { isActive: true }
const queriedCollection = usersCollection.query(queryOptions)
queriedCollection.data // [lilJohn, hannah]
```

You can query your data with complex, logical filters and conditional operators.

In order to indicate that you are applying filters to a specific property, suffixing the key you are querying with `$` and use any of the [available filters](#available-filters) to build your filters for that property.

```typescript
const queryOptions = { age$: { $isBetween: [20, 32] } }
const queriedCollection = usersCollection.query(queryOptions)
queriedCollection.data // [liljohn, hannah]
```

You can query your data using a combination of exact match key/value queries and filters.

```typescript
const queryOptions = { isActive: true, name$: { $startsWith: 'h' } }
const queriedCollection = usersCollection.query(queryOptions)
queriedCollection.data // [hannah]
```

You can use logical operators (`$and` and `$or`) to execute much more modular and complex queries.

```typescript
// Query all users who are active
// AND who are older than 28.
const isActiveFilter = { isActive: true }
const ageFilter = { age$: { $isGreaterThan: 28 } }
const queryOptions = { $and: [isActiveFilter, ageFilter] }
const queriedCollection = usersCollection.query(queryOptions)
queriedCollection.data // [lilJohn]
// liljohn IS active AND IS older than 28
```

```typescript
// Query all users who are active OR who are older than 30.
const isActiveFilter = { isActive: true }
const ageFilter = { age$: { $isGreaterThan: 30 } }
const queryOptions = { $or: [isActiveFilter, ageFilter] }
const queriedCollection = usersCollection.query(queryOptions)
queriedCollection.data // [lilJohn, hannah, oldJohn]
// liljohn IS NOT older than 30, but IS active
// hannah IS NOT older than 30, but IS active
// oldjohn IS older than 30, despite NOT being active
```

Generally, `$and` is not very useful as a top-level operator in a query. We can see from comparing the two following examples that top-level `$and` is redundant, since each key/value pair in a normal query object is naturally treated like `$and`.

```typescript
// Query all users who are NOT active and who are 26-39 years old.
const isActiveFilter = { isActive: false }
const ageFilter = { age$: { $isBetween: [25, 40] } }
const queryOptions = { $and: [isActiveFilter, ageFilter] }
const queriedCollection = usersCollection.query(queryOptions)
queriedCollection.data // [oldJohn]
```

```typescript
// Query all users who are NOT active and who are 26-39 years old.
const queryOptions = { isActive: false, age$: { $isBetween: [25, 40] } }
const queriedCollection = usersCollection.query(queryOptions)
queriedCollection.data // [oldJohn]
```

You can nest logical operators for the most complex querying requirements.

```typescript
// Query all users who (are active AND are older than 30)
// OR (whose name is 'hannah').
const nameFilter = { name: 'hannah' }
const isActiveFilter = { isActive: true }
const ageFilter = { age$: { $isGreaterThan: 30 } }
const isActiveAndIsGettingOldFilter = { $and: [isActiveFilter, ageFilter] }
const queryOptions = { $or: [isActiveAndIsGettingOldFilter, nameFilter] }
const queriedCollection = usersCollection.query(queryOptions)
queriedCollection.data // [hannah, oldjohn]
```

For reference, if we were not to break down `queryOptions`, it would look like this:

```javascript
// query users where:
// (name === "hannah") OR
// (isActive === true AND age > 30)
const queriedCollection = usersCollection.query({
  $or: [
    { name: 'hannah' },

    {
      $and: [{ isActive: true }, { age$: { $isGreaterThan: 30 } }],
    },
  ],
})
```

### Sorting

Sorting is most useful following a query, so let's go ahead and set up a listerine collection and query it before exploring sorting.

```typescript
import { listerine } from 'listerine'

type LanguageT = {
  name: string
  age: number
  tags: string[]
}

const py = { name: 'python', age: 34, tags: ['server', 'clean', 'popular'] }
const js = { name: 'javascript', age: 30, tags: ['web', 'server', 'popular'] }
const nim = { name: 'nim', age: 20, tags: ['server', 'transpiled', 'unpopular'] }
const languages = [py, js, nim]
const languagesList = listerine<LanguageT>(languages)
const queryOptions = { tags$: { $contains: 'server' } }
const queriedCollection = languagesList.query(queryOptions)
queriedCollection.data // [py, js, nim]
```

You can sort by passing a string that corresponds to the key you want to sort by. Using this method of sorting, the output will always be in ascending order.

```typescript
// Sort by age, ascending.
queriedCollection.sort('age')
queriedCollection.data // [nim, js, py]
```

You can sort using a sort options object specifying the key to sort by and the direction: `ascending` or `descending`.

```typescript
// Sort by name, alphabetically, descending.
const sortOptions = { key: 'name', direction: 'descending' }
queriedCollection.sort(sortOptions)
queriedCollection.data // [py, nim, js]
```

You can omit `direction` when sorting via a sortOptions object if you just want ascending direction.

```typescript
// Sort by age, ascending.
const sortOptions = { key: 'age' }
queriedCollection.sort(sortOptions)
queriedCollection.data // [nim, js, py]
```

You can also sort using a comparer function, just like you would with `Array.sort(fn)`.

```typescript
// Sort by name, alphabetically, ascending.
const comparer = (a, b) => a.name.localeCompare(b.name)
queriedCollection.sort(comparer)
queriedCollection.data // [js, nim, py]
```

### Inserting

You can insert a new document.

```typescript
collection.insert({
  id: crypto.randomUUID(),
  foo: 'bar',
  isBaz: false,
})
```

You can insert multiple new documents by passing an array of objects to `insert`.

```typescript
const doc0 = {
  id: crypto.randomUUID(),
  foo: 'bar',
  isBaz: false,
}

const doc1 = {
  id: crypto.randomUUID(),
  foo: 'yolo',
  isBaz: true,
}

collection.insert([doc0, doc1])
```

You don't have to generate ids yourself. listerine will apply an id to any document being inserted.

```typescript
const doc0 = { name: 'hannah' }
const doc1 = { name: 'taylor' }

collection.insert([doc0, doc1])
collection.data // [{ id: 'some-uuid', name: 'hannah' }, { id: 'other-uuid', name: 'taylor' }]
```

### Removing

You can remove a single document by id.

```typescript
collection.remove('123')
```

You can remove multiple documents by their ids by passing an array of ids to `remove`.

```typescript
collection.remove(['123', '321'])
```

You can remove multiple documents by passing an array of partial documents (with ids) to `remove`. listerine will pluck the ids from each object in the array and use them to perform `collection.remove([...pluckedIds])`.

```typescript
const doc0 = {
  id: crypto.randomUUID(),
  thisProperty: 'doesntMatter',
}

const doc1 = {
  id: crypto.randomUUID(),
}

collection.remove([doc0, doc1])
```

You use the full querying / filtering API to match and remove documents that meet specific criteria.

```typescript
collection.remove({
  age$: { $isGreaterThanOrEqualTo: 99 },
  isDeactivated: true,
})
```

### Updating

You can pass an object containing an `id` (that will be used to find the correct document to update) and whatever other properties to be applied as updates to the found document.

```typescript
const id = '123'
const updates = { age: 29 }

collection.update({
  ...updates,
  id,
})

const updatedDocument = {
  id: '456',
  isActive: false,
}

collection.update(updatedDocument)
```

You can do the same thing as above, but with an array of objects, each containing an `id` and whatever updates you want to apply to the document with that specific id.

```typescript
collection.update([
  {
    id: '123',
    name: 'hannah hendrix',
  },
  {
    id: '456',
    isActive: false,
  },
  {
    id: '420',
    age: 69,
  },
])
```



[](#filters)

## → Filters

### String Operations

- `$startsWith`: (string) Match strings that start with a value
- `$endsWith`: (string) Match strings that end with a value
- `$contains`: (string) Match strings that contain a value
- `$doesNotStartWith`: (string) Match strings that don't start with a value
- `$doesNotEndWith`: (string) Match strings that don't end with a value
- `$doesNotContain`: (string) Match strings that don't contain a value
- `$isLongerThan`: (number) Match strings longer than a value
- `$isNotLongerThan`: (number) Match strings not longer than a value
- `$isShorterThan`: (number) Match strings shorter than a value
- `$isNotShorterThan`: (number) Match strings not shorter than a value

```typescript
listerine<DataT>(data).query({
  lastName$: {
    // Arbitrary usage here. These
    // filters may not make sense to use
    // together, they are just examples.
    $startsWith: 'C',
    $endsWith: 'ey',
    $contains: 'howl',
    $doesNotContain: 'yolo',
    $isLongerThan: 6,
    $isShorterThan: 8,
    $isNotLongerThan: 7,
    $isNotShorterThan: 7,
  },
})
```

### Numeric Operations

- `$isGreaterThan`: (number) Match numbers greater than a value
- `$isLessThan`: (number) Match numbers less than a value
- `$isGreaterThanOrEqualTo`: (number) Match numbers greater than or equal to a value
- `$isLessThanOrEqualTo`: (number) Match numbers less than or equal to a value
- `$isNotGreaterThan`: (number) Match numbers not greater than a value
- `$isNotLessThan`: (number) Match numbers not less than a value
- `$isNotGreaterThanOrEqualTo`: (number) Match numbers not greater than or equal to a value
- `$isNotLessThanOrEqualTo`: (number) Match numbers not less than or equal to a value
- `$isBetween`: (number[]) Match numbers between two values
- `$isNotBetween`: (number[]) Match numbers not between two values

```typescript
listerine<DataT>(data).query({
  age$: {
    // Arbitrary usage here. These
    // filters may not make sense to use
    // together, they are just examples.
    $isBetween: [0, 99],
    $isNotBetween: [40, 50],
    $isLessThanOrEqualTo: 85,
    $isGreaterThanOrEqualTo: 18,
  },
})
```

### Array Operations

- `$contains`: (any) Match arrays containing a value
- `$doesNotContain`: (any) Match arrays not containing a value
- `$startsWith`: (any) Match arrays starting with a value
- `$doesNotStartWith`: (any) Match arrays not starting with a value
- `$endsWith`: (any) Match arrays ending with a value
- `$doesNotEndWith`: (any) Match arrays not ending with a value
- `$isLongerThan`: (number) Match arrays longer than a value
- `$isNotLongerThan`: (number) Match arrays not longer than a value
- `$isShorterThan`: (number) Match arrays shorter than a value
- `$isNotShorterThan`: (number) Match arrays not shorter than a value
- `$containsAll`: (any[]) Match arrays containing all specified values
- `$containsSome`: (any[]) Match arrays containing some specified values
- `$isEmpty`: (boolean) Match empty arrays
- `$isNotEmpty`: (boolean) Match non-empty arrays

```typescript
listerine<DataT>(data).query({
  tags$: {
    // Arbitrary usage of filters for
    // demonstration purposes.
    $containsAll: ['smart', 'tall'],
    $startsWith: 'cool',
    $endsWith: 'smart'
    $isLongerThan: 2,
    $isShortedThan: 5,
    $isNotEmpty: true,
  },
})
```

### Equality Operations

These work for any data type.

- `$equals` / `$is`: (any) Match values equal to a value
- `$doesNotEqual` / `$isNot`: (any) Match values not equal to a value
- `$isOneOf`: (any[]) Match values that are one of the specified values
- `$isNotOneOf`: (any[]) Match values that are not one of the specified values
- `$exists`: (boolean) Test whether an item's [key] is null or undefined

```typescript
listerine<DataT>(data).query({
  // Age must be either 25 or 35.
  age$: {
    $isOneOf: [25, 35],
  },

  // Nobody with exactly 27 friends.
  friendCount$: {
    $isNot: 27
  }

  // Name must be either "hannah" or "Rokki".
  name$: {
    $isOneOf: ['hannah', 'Rokki']
  },

  // Any last name is fine...
  // Except Scrub. I dont want no Scrub.
  // A Scrub is a guy who cant... nevermind.
  lastName$: {
    $doesNotEqual: 'Scrub'
  },

  // item.nickname should either not
  // be present or be set to null.
   nickname$: { $exists: false },
})
```



[](#configuration)

## → Configuration

By defalt, listerine will expect documents to have an `id` property. If your data uses an id key other than `id`, specify `idKey` in the collection config.

```typescript
type UserT = { _id: string; name: string }
const collectionConfig = { idKey: '_id' }
const collection = listerine<UserT>(users, collectionConfig)
```



[](#examples)

## → Examples

### Method Chaining

`query` and `sort` can be chained together or called in any order. You will most likely want to perform `sort` after `query` in most cases, because it will be more efficient and performant to sort a subset of your data after querying rather than the entire data set before querying.

```typescript
dataList.query(queryOptions).sort(sortOptions)
// OR
dataList.sort(sortOptions).query(queryOptions)
// OR
dataList.query(queryOptions)
dataList.sort(sortOptions)
// OR
dataList.sort(sortOptions)
dataList.query(queryOptions)
// etc...
```

### Deep Querying

It is completely valid to query with a nested object.

```typescript
collection.query({
  meta: {
    session: {
      isActive: true,
      token$: {
        $exists: true,
      },
    },
  },
})
```

But you can also be more direct by using a stringified property path key using dot notation and, in the case of filtering, suffixing it with `$`.

```typescript
dataList.query({
  'meta.session.isActive': true,
  'meta.session.token$': {
    $exists: true,
  },
})
```

### Complex Filtering

You can combine multiple filters for complex queries.

```typescript
const result = listerine(users).query({
  isDeactivated: false,
  'meta.session.isActive': true,
  'meta.session.token$': {
    $exists: true,
    $startsWith: 'ey',
    $isLongerThan: 24,
    $isShorterThan: 12_000,
  },

  age$: { $isGreaterThan: 25, $isLessThan: 35 },
  name$: { $startsWith: 'j', $endsWith: 'n' },
  tags$: { $containsSome: ['smart', 'tall'] },
})
```

You can combine multiple filters along with logical operators for brain-meltingly complex queries.

```typescript
const result = listerine(users).query({
  $or: [
    {
      isDeactivated: false,
      'meta.session.isActive': true,
      'meta.session.token$': {
        $exists:  true,
        $startsWith: 'ey',
        $isLongerThan: 24,
        $isShorterThan: 12_000
      },
    }
    {
      $and: [
          age$: { $isGreaterThan: 25, $isLessThan: 35 },
          name$: { $startsWith: 'J', $endsWith: 'n' },
          tags$: { $containsSome: ['smart', 'tall'] },
      ]
    }
  ]
})
```

### Multiple Sorts

You can apply multiple sorts in sequence.

```typescript
const result = listerine(users)
  .sort({ key: 'name', direction: 'ascending' }) // first by name
  .sort({ key: 'age', direction: 'descending' }) // then by age
```

### Full Implementation Example

```typescript
import { listerine } from 'listerine'

type DataT = { ... }
const data = [ ... ]

const nameFilter = { name: 'Alice' }
const isActiveFilter = { isActive: true }
const ageFilter = { age$: { $isGreaterThan: 30 } }
const isActiveAndOldFilter = { $and: [isActiveFilter, ageFilter] }
const queryOptions = { $or: [isActiveAndOldFilter, nameFilter] }
const firstSortOptions = { key: 'age', direction: 'descending' }
const secondSorter = (a, b) => a.tags.length - b.tags.length

const { data } = listerine<DataT>(data)
  .query(queryOptions)
  .sort(sortOptions)
  .sort(secondSorter)
```



[](#license)

## → License

MIT
