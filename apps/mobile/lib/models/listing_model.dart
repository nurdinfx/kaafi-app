class ListingMedia {
  final String url;
  final String mediaType;
  final int sortOrder;

  ListingMedia({
    required this.url,
    this.mediaType = 'IMAGE',
    this.sortOrder = 0,
  });

  factory ListingMedia.fromJson(Map<String, dynamic> json) {
    return ListingMedia(
      url: json['url']?.toString() ?? '',
      mediaType: json['mediaType']?.toString() ?? 'IMAGE',
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
    );
  }
}

class SellerInfo {
  final String id;
  final String fullName;
  final String? avatarUrl;
  final String? phoneNumber;

  SellerInfo({
    required this.id,
    required this.fullName,
    this.avatarUrl,
    this.phoneNumber,
  });

  factory SellerInfo.fromJson(Map<String, dynamic> json) {
    return SellerInfo(
      id: json['id']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? 'Fududeeye Seller',
      avatarUrl: json['avatarUrl']?.toString(),
      phoneNumber: json['phoneNumber']?.toString(),
    );
  }
}

class BusinessInfo {
  final String id;
  final String businessName;
  final String slug;
  final String? logoUrl;
  final bool isVerified;

  BusinessInfo({
    required this.id,
    required this.businessName,
    required this.slug,
    this.logoUrl,
    this.isVerified = false,
  });

  factory BusinessInfo.fromJson(Map<String, dynamic> json) {
    return BusinessInfo(
      id: json['id']?.toString() ?? '',
      businessName: json['businessName']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      logoUrl: json['logoUrl']?.toString(),
      isVerified: json['isVerified'] == true,
    );
  }
}

class ListingModel {
  final String id;
  final String slug;
  final String title;
  final String description;
  final double price;
  final String currency;
  final String condition;
  final bool isNegotiable;
  final int inventoryCount;
  final String city;
  final String? district;
  final String? landmark;
  final String? region;
  final String verticalType;
  final String status;
  final int viewsCount;
  final int favoritesCount;
  final DateTime createdAt;
  final List<ListingMedia> media;
  final String? categoryName;
  final String? categorySlug;
  final SellerInfo? seller;
  final BusinessInfo? business;
  final Map<String, dynamic>? vehicleDetails;
  final Map<String, dynamic>? propertyDetails;

  ListingModel({
    required this.id,
    required this.slug,
    required this.title,
    required this.description,
    required this.price,
    required this.currency,
    required this.condition,
    required this.isNegotiable,
    required this.inventoryCount,
    required this.city,
    this.district,
    this.landmark,
    this.region,
    required this.verticalType,
    this.status = 'ACTIVE',
    this.viewsCount = 0,
    this.favoritesCount = 0,
    required this.createdAt,
    this.media = const [],
    this.categoryName,
    this.categorySlug,
    this.seller,
    this.business,
    this.vehicleDetails,
    this.propertyDetails,
  });

  String get firstImageUrl {
    if (media.isNotEmpty && media.first.url.isNotEmpty) {
      return media.first.url;
    }
    // Vertical-specific default fallbacks
    switch (verticalType) {
      case 'VEHICLE':
        return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80';
      case 'REAL_ESTATE':
        return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
      case 'SERVICE':
        return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80';
      default:
        return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80';
    }
  }

  factory ListingModel.fromJson(Map<String, dynamic> json) {
    List<ListingMedia> parsedMedia = [];
    if (json['media'] is List) {
      parsedMedia = (json['media'] as List)
          .map((m) => ListingMedia.fromJson(m as Map<String, dynamic>))
          .toList();
    }

    String? catName;
    String? catSlug;
    if (json['category'] is Map) {
      catName = json['category']['name']?.toString();
      catSlug = json['category']['slug']?.toString();
    }

    SellerInfo? parsedSeller;
    if (json['seller'] is Map) {
      parsedSeller = SellerInfo.fromJson(json['seller'] as Map<String, dynamic>);
    }

    BusinessInfo? parsedBusiness;
    if (json['business'] is Map) {
      parsedBusiness = BusinessInfo.fromJson(json['business'] as Map<String, dynamic>);
    }

    DateTime parsedDate;
    try {
      parsedDate = DateTime.parse(json['createdAt']?.toString() ?? '');
    } catch (_) {
      parsedDate = DateTime.now();
    }

    return ListingModel(
      id: json['id']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      title: json['title']?.toString() ?? 'No Title',
      description: json['description']?.toString() ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency']?.toString() ?? 'USD',
      condition: json['condition']?.toString() ?? 'USED',
      isNegotiable: json['isNegotiable'] == true,
      inventoryCount: (json['inventoryCount'] as num?)?.toInt() ?? 1,
      city: json['city']?.toString() ?? 'Garoowe',
      district: json['district']?.toString(),
      landmark: json['landmark']?.toString(),
      region: json['region']?.toString() ?? 'Puntland',
      verticalType: json['verticalType']?.toString() ?? 'PRODUCT',
      status: json['status']?.toString() ?? 'ACTIVE',
      viewsCount: (json['viewsCount'] as num?)?.toInt() ?? 0,
      favoritesCount: (json['favoritesCount'] as num?)?.toInt() ?? 0,
      createdAt: parsedDate,
      media: parsedMedia,
      categoryName: catName,
      categorySlug: catSlug,
      seller: parsedSeller,
      business: parsedBusiness,
      vehicleDetails: json['vehicleDetails'] is Map ? Map<String, dynamic>.from(json['vehicleDetails']) : null,
      propertyDetails: json['propertyDetails'] is Map ? Map<String, dynamic>.from(json['propertyDetails']) : null,
    );
  }
}
