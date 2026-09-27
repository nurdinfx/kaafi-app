class BuyerRequestModel {
  final String id;
  final String title;
  final String description;
  final double? targetBudget;
  final String currency;
  final int quantity;
  final String city;
  final String? landmark;
  final String urgency;
  final String status;
  final DateTime createdAt;
  final String? categoryName;
  final String? buyerName;
  final String? buyerPhone;
  final int offersCount;

  BuyerRequestModel({
    required this.id,
    required this.title,
    required this.description,
    this.targetBudget,
    this.currency = 'USD',
    this.quantity = 1,
    required this.city,
    this.landmark,
    this.urgency = 'NORMAL',
    this.status = 'OPEN',
    required this.createdAt,
    this.categoryName,
    this.buyerName,
    this.buyerPhone,
    this.offersCount = 0,
  });

  factory BuyerRequestModel.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate;
    try {
      parsedDate = DateTime.parse(json['createdAt']?.toString() ?? '');
    } catch (_) {
      parsedDate = DateTime.now();
    }

    String? catName;
    if (json['category'] is Map) {
      catName = json['category']['name']?.toString();
    }

    String? bName;
    String? bPhone;
    if (json['buyer'] is Map) {
      bName = json['buyer']['fullName']?.toString();
      bPhone = json['buyer']['phoneNumber']?.toString();
    }

    int offers = 0;
    if (json['_count'] is Map && json['_count']['offers'] != null) {
      offers = (json['_count']['offers'] as num).toInt();
    } else if (json['offers'] is List) {
      offers = (json['offers'] as List).length;
    }

    return BuyerRequestModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      targetBudget: (json['targetBudget'] as num?)?.toDouble(),
      currency: json['currency']?.toString() ?? 'USD',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      city: json['city']?.toString() ?? 'Garoowe',
      landmark: json['landmark']?.toString(),
      urgency: json['urgency']?.toString() ?? 'NORMAL',
      status: json['status']?.toString() ?? 'OPEN',
      createdAt: parsedDate,
      categoryName: catName,
      buyerName: bName ?? 'Garoowe Buyer',
      buyerPhone: bPhone,
      offersCount: offers,
    );
  }
}
