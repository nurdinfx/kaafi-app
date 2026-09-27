import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/category_model.dart';
import '../models/listing_model.dart';
import '../models/buyer_request_model.dart';
import '../models/user_model.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  static const String _prefBaseUrlKey = 'fududeeye_api_base_url';
  static const String _prefTokenKey = 'fududeeye_jwt_token';

  String? _customBaseUrl;
  String? _token;

  String get defaultBaseUrl {
    if (kIsWeb) return 'http://localhost:5000/api/v1';
    try {
      if (Platform.isAndroid) {
        // Standard Android emulator connects to host machine at 10.0.2.2
        return 'http://10.0.2.2:5000/api/v1';
      } else if (Platform.isIOS) {
        // iOS Simulator connects directly via localhost
        return 'http://localhost:5000/api/v1';
      }
    } catch (_) {}
    return 'http://localhost:5000/api/v1';
  }

  String get baseUrl => _customBaseUrl ?? defaultBaseUrl;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _customBaseUrl = prefs.getString(_prefBaseUrlKey);
    _token = prefs.getString(_prefTokenKey);
  }

  Future<void> setBaseUrl(String url) async {
    _customBaseUrl = url.trim();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefBaseUrlKey, _customBaseUrl!);
  }

  Future<void> resetBaseUrl() async {
    _customBaseUrl = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_prefBaseUrlKey);
  }

  Future<void> setToken(String? token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    if (token != null) {
      await prefs.setString(_prefTokenKey, token);
    } else {
      await prefs.remove(_prefTokenKey);
    }
  }

  String? get token => _token;
  bool get isAuthenticated => _token != null && _token!.isNotEmpty;

  Map<String, String> _headers() {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_token != null && _token!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  // ─────────────────────────────────────────────────────────────
  // CATEGORIES
  // ─────────────────────────────────────────────────────────────
  Future<List<CategoryModel>> getCategories() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/categories'), headers: _headers())
          .timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final list = (data['data'] ?? data) as List;
        return list.map((c) => CategoryModel.fromJson(c)).toList();
      }
    } catch (e) {
      debugPrint('ApiService getCategories error, using seed fallback: $e');
    }
    return _fallbackCategories;
  }

  // ─────────────────────────────────────────────────────────────
  // LISTINGS
  // ─────────────────────────────────────────────────────────────
  Future<List<ListingModel>> getListings({
    String? verticalType,
    String? categorySlug,
    String? city,
    String? search,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final params = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };
      if (verticalType != null && verticalType.isNotEmpty) {
        params['verticalType'] = verticalType;
      }
      if (categorySlug != null && categorySlug.isNotEmpty) {
        params['categorySlug'] = categorySlug;
      }
      if (city != null && city.isNotEmpty) {
        params['city'] = city;
      }
      if (search != null && search.isNotEmpty) {
        params['q'] = search;
      }

      final uri = Uri.parse('$baseUrl/listings').replace(queryParameters: params);
      final res = await http.get(uri, headers: _headers()).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final list = (data['data'] ?? data) as List;
        return list.map((item) => ListingModel.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('ApiService getListings error, using seed fallback: $e');
    }

    // Filter fallback data
    return _fallbackListings.where((l) {
      if (verticalType != null && verticalType.isNotEmpty && l.verticalType != verticalType) {
        return false;
      }
      if (categorySlug != null && categorySlug.isNotEmpty && l.categorySlug != categorySlug) {
        return false;
      }
      if (city != null && city.isNotEmpty && l.city.toLowerCase() != city.toLowerCase()) {
        return false;
      }
      if (search != null && search.isNotEmpty) {
        final q = search.toLowerCase();
        return l.title.toLowerCase().contains(q) || l.description.toLowerCase().contains(q);
      }
      return true;
    }).toList();
  }

  // ─────────────────────────────────────────────────────────────
  // BUYER REQUESTS
  // ─────────────────────────────────────────────────────────────
  Future<List<BuyerRequestModel>> getBuyerRequests() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/requests'), headers: _headers())
          .timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final list = (data['data'] ?? data) as List;
        return list.map((item) => BuyerRequestModel.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('ApiService getBuyerRequests error, using seed fallback: $e');
    }
    return _fallbackBuyerRequests;
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE LISTING
  // ─────────────────────────────────────────────────────────────
  Future<bool> createListing(Map<String, dynamic> data) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/listings'),
        headers: _headers(),
        body: jsonEncode(data),
      ).timeout(const Duration(seconds: 6));
      return res.statusCode == 201 || res.statusCode == 200;
    } catch (e) {
      debugPrint('ApiService createListing error: $e');
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE BUYER REQUEST
  // ─────────────────────────────────────────────────────────────
  Future<bool> createBuyerRequest(Map<String, dynamic> data) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/requests'),
        headers: _headers(),
        body: jsonEncode(data),
      ).timeout(const Duration(seconds: 6));
      return res.statusCode == 201 || res.statusCode == 200;
    } catch (e) {
      debugPrint('ApiService createBuyerRequest error: $e');
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CURRENT USER
  // ─────────────────────────────────────────────────────────────
  Future<UserModel?> getCurrentUser() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/auth/me'), headers: _headers())
          .timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return UserModel.fromJson(data['data'] ?? data);
      }
    } catch (e) {
      debugPrint('ApiService getCurrentUser error: $e');
    }
    return null;
  }

  // ─────────────────────────────────────────────────────────────
  // AUTH (LOGIN & REGISTER)
  // ─────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>?> login(String phone, String password) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: _headers(),
        body: jsonEncode({'phoneNumber': phone, 'password': password}),
      ).timeout(const Duration(seconds: 5));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final token = data['token'] ?? data['accessToken'] ?? data['data']?['token'];
        if (token != null) {
          await setToken(token.toString());
        }
        return data;
      }
    } catch (e) {
      debugPrint('ApiService login error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> register({
    required String fullName,
    required String phone,
    required String password,
    String role = 'BUYER',
    String city = 'Garoowe',
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: _headers(),
        body: jsonEncode({
          'fullName': fullName,
          'phoneNumber': phone,
          'password': password,
          'role': role,
          'city': city,
        }),
      ).timeout(const Duration(seconds: 5));

      if (res.statusCode == 201 || res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final token = data['token'] ?? data['accessToken'] ?? data['data']?['token'];
        if (token != null) {
          await setToken(token.toString());
        }
        return data;
      }
    } catch (e) {
      debugPrint('ApiService register error: $e');
    }
    return null;
  }

  // ─────────────────────────────────────────────────────────────
  // SEED / FALLBACK DATA (Matches website & Prisma Seed database)
  // ─────────────────────────────────────────────────────────────
  static final List<CategoryModel> _fallbackCategories = [
    CategoryModel(id: 'c1', name: 'Vehicles', slug: 'vehicles', icon: '🚗', verticalType: 'VEHICLE', description: 'Cars, 4WDs, trucks & motorcycles'),
    CategoryModel(id: 'c2', name: 'Real Estate', slug: 'real-estate', icon: '🏢', verticalType: 'REAL_ESTATE', description: 'Houses, plots, apartments & rentals'),
    CategoryModel(id: 'c3', name: 'Electronics', slug: 'electronics', icon: '📱', verticalType: 'PRODUCT', description: 'Smartphones, laptops & gadgets'),
    CategoryModel(id: 'c4', name: 'Services', slug: 'services', icon: '🛠️', verticalType: 'SERVICE', description: 'Skilled professionals & technicians'),
    CategoryModel(id: 'c5', name: 'Wholesale & B2B', slug: 'wholesale', icon: '📦', verticalType: 'PRODUCT', description: 'Bulk supplies, building materials & goods'),
    CategoryModel(id: 'c6', name: 'Fashion & Beauty', slug: 'fashion', icon: '👗', verticalType: 'PRODUCT', description: 'Clothes, abayas, shoes & perfumes'),
    CategoryModel(id: 'c7', name: 'Solar & Energy', slug: 'solar', icon: '☀️', verticalType: 'PRODUCT', description: 'Solar panels, inverters & batteries'),
  ];

  static final List<ListingModel> _fallbackListings = [
    ListingModel(
      id: 'l1',
      slug: 'toyota-land-cruiser-v8-garoowe',
      title: 'Toyota Land Cruiser V8 (2022) GXR',
      description: 'Baabuur aad u fiican, xaalad sare leh. Diesel, Automatic, 4WD. Somali plate, Garoowe inspection passed. Diyaar u ah wareejin dagdag ah.',
      price: 68500.0,
      currency: 'USD',
      condition: 'LIKE_NEW',
      isNegotiable: true,
      inventoryCount: 1,
      city: 'Garoowe',
      district: '1-da Luulyo',
      verticalType: 'VEHICLE',
      categoryName: 'Vehicles',
      categorySlug: 'vehicles',
      viewsCount: 412,
      favoritesCount: 38,
      createdAt: DateTime.now().subtract(const Duration(hours: 4)),
      media: [
        ListingMedia(url: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&q=80'),
        ListingMedia(url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80'),
      ],
      seller: SellerInfo(id: 's1', fullName: 'Garoowe Motors', phoneNumber: '+252 90 779 1234'),
      vehicleDetails: {'make': 'Toyota', 'model': 'Land Cruiser V8', 'year': 2022, 'transmission': 'Automatic'},
    ),
    ListingModel(
      id: 'l2',
      slug: 'iphone-15-pro-max-256gb',
      title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
      description: 'Brand new, sealed box with Apple 1-Year Warranty. Dual eSIM, 100% Battery Health. Keenista Garoowe, Boosaaso ama Hargeisa.',
      price: 1180.0,
      currency: 'USD',
      condition: 'NEW',
      isNegotiable: false,
      inventoryCount: 5,
      city: 'Garoowe',
      district: 'Waberi',
      verticalType: 'PRODUCT',
      categoryName: 'Electronics',
      categorySlug: 'electronics',
      viewsCount: 680,
      favoritesCount: 92,
      createdAt: DateTime.now().subtract(const Duration(hours: 6)),
      media: [
        ListingMedia(url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80'),
      ],
      seller: SellerInfo(id: 's2', fullName: 'Hudi Electronics Store', phoneNumber: '+252 90 774 5566'),
    ),
    ListingModel(
      id: 'l3',
      slug: 'villa-casri-ah-garoowe',
      title: 'Villa Casri ah - 5 Qol, Garoowe (Suuq Sare)',
      description: 'Guri weyn oo cusub, 5 qol jiif ah, 4 suuli, barxad weyn oo baabuurta ah, koronto solar ah iyo biyo joogto ah. Sharaf iyo deganaan.',
      price: 145000.0,
      currency: 'USD',
      condition: 'NEW',
      isNegotiable: true,
      inventoryCount: 1,
      city: 'Garoowe',
      district: 'Hoddan',
      verticalType: 'REAL_ESTATE',
      categoryName: 'Real Estate',
      categorySlug: 'real-estate',
      viewsCount: 890,
      favoritesCount: 120,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      media: [
        ListingMedia(url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'),
      ],
      seller: SellerInfo(id: 's3', fullName: 'Puntland Real Estate Agency', phoneNumber: '+252 90 778 8899'),
      propertyDetails: {'bedrooms': 5, 'bathrooms': 4, 'propertyType': 'Villa'},
    ),
    ListingModel(
      id: 'l4',
      slug: 'macbook-pro-m3-16gb',
      title: 'MacBook Pro 14" M3 Pro - 18GB / 512GB SSD',
      description: 'Space Black, cusub qasnadda kuma jirto. Ku habboon Programming, Graphics & Video Editing. Original MagSafe charger included.',
      price: 1950.0,
      currency: 'USD',
      condition: 'LIKE_NEW',
      isNegotiable: true,
      inventoryCount: 2,
      city: 'Garoowe',
      district: 'Waberi',
      verticalType: 'PRODUCT',
      categoryName: 'Electronics',
      categorySlug: 'electronics',
      viewsCount: 310,
      favoritesCount: 45,
      createdAt: DateTime.now().subtract(const Duration(hours: 12)),
      media: [
        ListingMedia(url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'),
      ],
      seller: SellerInfo(id: 's2', fullName: 'Hudi Electronics Store', phoneNumber: '+252 90 774 5566'),
    ),
    ListingModel(
      id: 'l5',
      slug: 'solar-energy-system-5kw',
      title: 'Complete 5kW Solar System - Garoowe Installation',
      description: '8x 550W Tier 1 Solar Panels, 5kW Hybrid Inverter, 10kWh Lithium Battery. Qiimaha waxaa ku jira xiridda iyo dammaanad 3 sano ah.',
      price: 3400.0,
      currency: 'USD',
      condition: 'NEW',
      isNegotiable: true,
      inventoryCount: 8,
      city: 'Garoowe',
      district: 'Suuqa',
      verticalType: 'SERVICE',
      categoryName: 'Solar & Energy',
      categorySlug: 'solar',
      viewsCount: 520,
      favoritesCount: 76,
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      media: [
        ListingMedia(url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80'),
      ],
      seller: SellerInfo(id: 's4', fullName: 'Somalia Green Solar Co.', phoneNumber: '+252 90 771 9900'),
    ),
    ListingModel(
      id: 'l6',
      slug: 'hyundai-tucson-2021',
      title: 'Hyundai Tucson 2021 Panoramic AWD',
      description: 'Petrol, Automatic, Panoramic roof, Leather seats, Reverse camera, mileage 28,000km. Aad u nadiif ah.',
      price: 24500.0,
      currency: 'USD',
      condition: 'USED',
      isNegotiable: true,
      inventoryCount: 1,
      city: 'Garoowe',
      district: '1-da Luulyo',
      verticalType: 'VEHICLE',
      categoryName: 'Vehicles',
      categorySlug: 'vehicles',
      viewsCount: 290,
      favoritesCount: 31,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      media: [
        ListingMedia(url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80'),
      ],
      seller: SellerInfo(id: 's1', fullName: 'Garoowe Motors', phoneNumber: '+252 90 779 1234'),
    ),
  ];

  static final List<BuyerRequestModel> _fallbackBuyerRequests = [
    BuyerRequestModel(
      id: 'r1',
      title: 'Waxaan rabaa Toyota Hilux D4D 2018-2022',
      description: 'Waxaan si dagdag ah ugu baahanahay Toyota Hilux Double Cabin, xaalad fiican, manual ama automatic. Diyaar baa u ahay lacag caddaan ah.',
      targetBudget: 28000.0,
      currency: 'USD',
      quantity: 1,
      city: 'Garoowe',
      urgency: 'HIGH',
      status: 'OPEN',
      createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      categoryName: 'Vehicles',
      buyerName: 'Axmed Jaamac',
      buyerPhone: '+252 90 700 1122',
      offersCount: 4,
    ),
    BuyerRequestModel(
      id: 'r2',
      title: '50 Kiish oo Sibir ah (Dhismaha Garoowe)',
      description: 'Sibidhka dhismaha guriga, keena xaafadda Hodan. Qiimaha ugu jaban iyo rarida qofkii haya ha ila soo xiriiro.',
      targetBudget: 550.0,
      currency: 'USD',
      quantity: 50,
      city: 'Garoowe',
      urgency: 'NORMAL',
      status: 'OPEN',
      createdAt: DateTime.now().subtract(const Duration(hours: 7)),
      categoryName: 'Wholesale & B2B',
      buyerName: 'Faarax Cali',
      offersCount: 2,
    ),
    BuyerRequestModel(
      id: 'r3',
      title: 'iPhone 13 ama 14 Pro (128GB/256GB)',
      description: 'Telefoon nadiif ah battery 85%+ qof haya Garoowe gudaheeda.',
      targetBudget: 600.0,
      currency: 'USD',
      quantity: 1,
      city: 'Garoowe',
      urgency: 'NORMAL',
      status: 'OPEN',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      categoryName: 'Electronics',
      buyerName: 'Hodan Nuur',
      offersCount: 5,
    ),
  ];
}
