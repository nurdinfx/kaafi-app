class UserModel {
  final String id;
  final String phoneNumber;
  final String fullName;
  final String? email;
  final String role;
  final String? avatarUrl;
  final String city;
  final double walletBalance;
  final bool isVerified;

  UserModel({
    required this.id,
    required this.phoneNumber,
    required this.fullName,
    this.email,
    required this.role,
    this.avatarUrl,
    this.city = 'Garoowe',
    this.walletBalance = 0.0,
    this.isVerified = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      phoneNumber: json['phoneNumber']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? 'Fududeeye User',
      email: json['email']?.toString(),
      role: json['role']?.toString() ?? 'BUYER',
      avatarUrl: json['avatarUrl']?.toString(),
      city: json['city']?.toString() ?? 'Garoowe',
      walletBalance: (json['walletBalance'] as num?)?.toDouble() ?? 0.0,
      isVerified: json['isVerified'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'phoneNumber': phoneNumber,
        'fullName': fullName,
        'email': email,
        'role': role,
        'avatarUrl': avatarUrl,
        'city': city,
        'walletBalance': walletBalance,
        'isVerified': isVerified,
      };
}
