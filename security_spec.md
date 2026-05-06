# Security Specification for Dgamers

## 1. Data Invariants
- A user profile can only be created by the owner (authenticated UID).
- Coins balance can only be updated by a "system" action or a verified transaction, but for this client-side demo, we allow updates with strict verification if the balance matches expected logic (though typically this would be server-side).
- Transactions are immutable once created (status 'completed' is terminal).
- Users can only read their own notifications and transactions.
- Leaderboard is public but read-only.

## 2. The "Dirty Dozen" Payloads (Forbidden Actions)
1. Creating a user profile with a different UID than `request.auth.uid`.
2. Updating `coins` without a corresponding transaction increase (Update Gap).
3. Modifying `createdAt` after creation.
4. Injecting a 1MB string into a `username` or `method` field.
5. Injected nested multi-level objects into flat fields.
6. Deleting a transaction record (Orphaned Write).
7. Changing the `status` of a withdrawal from `completed` back to `pending`.
8. Creating a user with `tier: 'platinum'` directly (Privilege Escalation).
9. Reading another user's PII (email) via a blanket query.
10. Using a 2KB junk string as a document ID (`isValidId` check).
11. Updating `userId` in a notification to point to another user.
12. Attempting to spoof an admin role without a record in the `admins` collection.

## 3. Test Runner (Mock Tests)
- `test('denies creating profile for others', ...)` -> EXPECT PERMISSION_DENIED
- `test('denies terminal state rollback', ...)` -> EXPECT PERMISSION_DENIED
- `test('denies oversized username', ...)` -> EXPECT PERMISSION_DENIED
- `test('denies non-verified user writes', ...)` -> EXPECT PERMISSION_DENIED
