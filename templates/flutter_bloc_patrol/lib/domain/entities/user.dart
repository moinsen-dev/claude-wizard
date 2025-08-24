import 'package:equatable/equatable.dart';

/// User entity representing the core user model in the domain layer.
/// 
/// This entity encapsulates the essential user information and business logic
/// without any external dependencies or framework-specific code.
class User extends Equatable {
  const User({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl,
    this.isActive = true,
    required this.createdAt,
  });

  /// Unique identifier for the user
  final String id;

  /// Full name of the user
  final String name;

  /// Email address of the user
  final String email;

  /// Optional avatar URL
  final String? avatarUrl;

  /// Whether the user account is active
  final bool isActive;

  /// When the user was created
  final DateTime createdAt;

  /// Creates a copy of this user with the given fields replaced with new values
  User copyWith({
    String? id,
    String? name,
    String? email,
    String? avatarUrl,
    bool? isActive,
    DateTime? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  /// Business logic: Check if user can perform administrative actions
  bool get canAdminister => isActive && email.endsWith('@admin.com');

  /// Business logic: Get user display name
  String get displayName => name.isEmpty ? email : name;

  @override
  List<Object?> get props => [id, name, email, avatarUrl, isActive, createdAt];

  @override
  String toString() {
    return 'User(id: $id, name: $name, email: $email, avatarUrl: $avatarUrl, '
        'isActive: $isActive, createdAt: $createdAt)';
  }
}