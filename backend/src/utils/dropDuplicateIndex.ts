import mongoose from 'mongoose';
import connectDB from '../config/db';

/**
 * Cleanup script to drop problematic legacy indexes from the users collection.
 *
 * History:
 * - clerkId_1: From an old Clerk-based authentication attempt. No longer relevant.
 * - password_1: If a unique index was ever created on the password field.
 *
 * This script is safe to run multiple times. It only drops indexes that exist.
 *
 * After migrating to Google OAuth, you may also want to run this to ensure
 * no legacy indexes conflict with the new googleId-based schema.
 *
 * Usage: npx tsx src/utils/dropDuplicateIndex.ts
 */
const dropOldIndexes = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('Connected to database');

    const usersCollection = mongoose.connection.collection('users');
 
    // Get all indexes
    const indexes = await usersCollection.getIndexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Drop the clerkId_1 index if it exists (legacy from old Clerk integration)
    if (indexes['clerkId_1']) {
      await usersCollection.dropIndex('clerkId_1');
      console.log('✅ Dropped old clerkId_1 index successfully');
    } else {
      console.log('ℹ️  clerkId_1 index not found (already clean)');
    }

    console.log('\nAll legacy index cleanup complete.');
    console.log('Current schema expects: googleId (unique), email (indexed)');

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error dropping index:', error);
    process.exit(1);
  }
};

dropOldIndexes();
