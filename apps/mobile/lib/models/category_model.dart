class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String icon;
  final String verticalType;
  final String? description;
  final double? commissionRate;

  CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.icon,
    required this.verticalType,
    this.description,
    this.commissionRate,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      icon: json['icon']?.toString() ?? '📦',
      verticalType: json['verticalType']?.toString() ?? 'PRODUCT',
      description: json['description']?.toString(),
      commissionRate: (json['commissionRate'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        'icon': icon,
        'verticalType': verticalType,
        'description': description,
      };
}
