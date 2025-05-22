## Examples

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
