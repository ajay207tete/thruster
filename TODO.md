# Fix Shop Page Products Visibility

## Tasks
- [x] Remove redundant test fetch in fetchProducts
- [x] Remove strict validation that blocks valid responses
- [x] Simplify fetchProducts to detect response structure automatically
- [x] Normalize products consistently (_id→id, name→title, imageUrl/image→image)
- [x] Ensure setProducts always called with processed array
- [x] Fix retry logic to reuse fetchProducts
- [x] Ensure FlatList renders correctly with fallbacks
- [x] Test that products are visible on Shop page
