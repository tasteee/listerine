## Filters

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
