import 'package:shared_preferences/shared_preferences.dart';

/// Service for handling application-wide storage operations.
/// 
/// This service provides a consistent interface for storing and retrieving
/// application preferences and settings using SharedPreferences.
class StorageService {
  const StorageService();

  /// Gets a string value from storage
  Future<String?> getString(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(key);
    } catch (e) {
      throw StorageServiceException('Failed to get string: ${e.toString()}');
    }
  }

  /// Sets a string value in storage
  Future<void> setString(String key, String value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(key, value);
    } catch (e) {
      throw StorageServiceException('Failed to set string: ${e.toString()}');
    }
  }

  /// Gets an integer value from storage
  Future<int?> getInt(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getInt(key);
    } catch (e) {
      throw StorageServiceException('Failed to get int: ${e.toString()}');
    }
  }

  /// Sets an integer value in storage
  Future<void> setInt(String key, int value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(key, value);
    } catch (e) {
      throw StorageServiceException('Failed to set int: ${e.toString()}');
    }
  }

  /// Gets a boolean value from storage
  Future<bool?> getBool(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getBool(key);
    } catch (e) {
      throw StorageServiceException('Failed to get bool: ${e.toString()}');
    }
  }

  /// Sets a boolean value in storage
  Future<void> setBool(String key, bool value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(key, value);
    } catch (e) {
      throw StorageServiceException('Failed to set bool: ${e.toString()}');
    }
  }

  /// Gets a double value from storage
  Future<double?> getDouble(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getDouble(key);
    } catch (e) {
      throw StorageServiceException('Failed to get double: ${e.toString()}');
    }
  }

  /// Sets a double value in storage
  Future<void> setDouble(String key, double value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setDouble(key, value);
    } catch (e) {
      throw StorageServiceException('Failed to set double: ${e.toString()}');
    }
  }

  /// Gets a list of strings from storage
  Future<List<String>?> getStringList(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getStringList(key);
    } catch (e) {
      throw StorageServiceException('Failed to get string list: ${e.toString()}');
    }
  }

  /// Sets a list of strings in storage
  Future<void> setStringList(String key, List<String> value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(key, value);
    } catch (e) {
      throw StorageServiceException('Failed to set string list: ${e.toString()}');
    }
  }

  /// Removes a value from storage
  Future<void> remove(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(key);
    } catch (e) {
      throw StorageServiceException('Failed to remove key: ${e.toString()}');
    }
  }

  /// Clears all values from storage
  Future<void> clear() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
    } catch (e) {
      throw StorageServiceException('Failed to clear storage: ${e.toString()}');
    }
  }

  /// Checks if a key exists in storage
  Future<bool> containsKey(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.containsKey(key);
    } catch (e) {
      throw StorageServiceException('Failed to check key existence: ${e.toString()}');
    }
  }

  /// Gets all keys from storage
  Future<Set<String>> getKeys() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getKeys();
    } catch (e) {
      throw StorageServiceException('Failed to get keys: ${e.toString()}');
    }
  }

  /// Reloads the SharedPreferences instance
  Future<void> reload() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.reload();
    } catch (e) {
      throw StorageServiceException('Failed to reload preferences: ${e.toString()}');
    }
  }
}

/// Exception thrown by storage service operations
class StorageServiceException implements Exception {
  const StorageServiceException(this.message);

  final String message;

  @override
  String toString() => 'StorageServiceException: $message';
}