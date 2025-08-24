import '../entities/user.dart';

/// Abstract repository interface for user-related operations.
/// 
/// This interface defines the contract for user data operations without
/// specifying the implementation details. It follows the dependency inversion
/// principle by allowing the domain layer to define what it needs.
abstract class UserRepository {
  /// Retrieves the current user
  /// 
  /// Returns null if no user is currently logged in or stored.
  Future<User?> getCurrentUser();

  /// Saves user data to persistent storage
  /// 
  /// Throws [UserRepositoryException] if the operation fails.
  Future<void> saveUser(User user);

  /// Updates an existing user
  /// 
  /// Throws [UserRepositoryException] if the user doesn't exist or 
  /// the operation fails.
  Future<User> updateUser(User user);

  /// Deletes user data from storage
  /// 
  /// Throws [UserRepositoryException] if the operation fails.
  Future<void> deleteUser(String userId);

  /// Retrieves a user by ID
  /// 
  /// Returns null if the user is not found.
  /// Throws [UserRepositoryException] if the operation fails.
  Future<User?> getUserById(String userId);

  /// Retrieves a list of all users
  /// 
  /// Returns an empty list if no users are found.
  /// Throws [UserRepositoryException] if the operation fails.
  Future<List<User>> getAllUsers();

  /// Checks if a user exists with the given email
  /// 
  /// Throws [UserRepositoryException] if the operation fails.
  Future<bool> userExistsWithEmail(String email);

  /// Clears all user data from storage
  /// 
  /// Throws [UserRepositoryException] if the operation fails.
  Future<void> clearAllUsers();
}

/// Exception thrown by user repository operations
class UserRepositoryException implements Exception {
  const UserRepositoryException(this.message, [this.cause]);

  final String message;
  final dynamic cause;

  @override
  String toString() {
    return 'UserRepositoryException: $message${cause != null ? ' (caused by: $cause)' : ''}';
  }
}