## Configuration

You can configure your collections to:

- make use of a specific key for reading document ids.
- throw errors under conditions that most likely indicate bugs.

### Configuration Example

```typescript
const collectionConfig = { idKey: '_id', strict: true }
const collection = listerine(data, collectionConfig)
```

### Custom Id Key

If your data uses an id key other than `id`, specify `idKey` in the collection config:

```typescript
type UserT = { _id: string; name: string }
const collectionConfig = { idKey: '_id' }
const collection = listerine<UserT>(users, collectionConfig)
```

### Strict Mode

You can enable strict mode on a collection if you want listerine to throw errors under conditions that most likely indicate a bug in your implementation.

```typescript
const collectionConfig = { strict: true }
const collection = listerine<DataT>(data, collectionConfig)
```
