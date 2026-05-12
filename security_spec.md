# Security Specification for SwiftShop E-Commerce

## 1. Data Invariants
- Users can only create their own profile matching their auth UID.
- Only Admins can create/update/delete categories and products.
- Orders must be associated with the authenticated user creating them.
- Users can only view their own orders.
- Orders cannot be deleted once created (for auditing), only updated to 'cancelled' status.
- Product stock must be a non-negative integer.
- Prices must be positive numbers.

## 2. The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to create a user profile with a different UID than `request.auth.uid`.
2. **Privilege Escalation**: Attempt to update own user profile to set `role: 'admin'`.
3. **Ghost Field Injection**: Attempt to create a product with an extra `isFeatured: true` field not in schema.
4. **Invalid Price**: Attempt to create a product with `price: -10.00`.
5. **Stock Poisoning**: Attempt to update product stock with a string `"lots"`.
6. **Orphaned Order**: Attempt to create an order referencing a non-existent user.
7. **Cross-User Snooping**: Attempt to read another user's order using their ID.
8. **Status Shortcut**: Attempt to update an order status from 'pending' directly to 'delivered' as a standard user.
9. **Terminal State Breakout**: Attempt to update an order after it has been 'cancelled'.
10. **Resource Exhaustion**: Attempt to use an extremely long string (1MB) as a category name.
11. **Malicious ID**: Attempt to create a product with an ID containing special characters like `../root`.
12. **Unverified Email Access**: Attempt to write to the database with an account that hasn't verified its email.

## 3. Test Runner (Mock)
A full test suite would involve `firebase-admin` or the emulator, but for this spec, we define the expected behavior: all above payloads must return `PERMISSION_DENIED`.
