## Configuration

By defalt, listerine will expect documents to have an `id` property. If your data uses an id key other than `id`, specify `idKey` in the collection config.

```typescript
type UserT = { _id: string; name: string }
const collectionConfig = { idKey: '_id' }
const collection = listerine<UserT>(users, collectionConfig)
```
