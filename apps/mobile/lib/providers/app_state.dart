import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/category_model.dart';
import '../models/listing_model.dart';
import '../models/buyer_request_model.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AppState extends ChangeNotifier {
  final ApiService _api = ApiService();

  bool _isDarkMode = true;
  bool get isDarkMode => _isDarkMode;

  String _selectedCity = 'Garoowe';
  String get selectedCity => _selectedCity;

  String _selectedVertical = 'ALL';
  String get selectedVertical => _selectedVertical;

  String? _selectedCategorySlug;
  String? get selectedCategorySlug => _selectedCategorySlug;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  List<CategoryModel> _categories = [];
  List<CategoryModel> get categories => _categories;

  List<ListingModel> _allListings = [];
  List<ListingModel> get allListings => _allListings;

  List<ListingModel> _vehicles = [];
  List<ListingModel> get vehicles => _vehicles;

  List<ListingModel> _realEstate = [];
  List<ListingModel> get realEstate => _realEstate;

  List<ListingModel> _electronics = [];
  List<ListingModel> get electronics => _electronics;

  List<ListingModel> _services = [];
  List<ListingModel> get services => _services;

  List<BuyerRequestModel> _buyerRequests = [];
  List<BuyerRequestModel> get buyerRequests => _buyerRequests;

  final Set<String> _favorites = {};
  Set<String> get favorites => _favorites;

  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _isDarkMode = prefs.getBool('fududeeye_is_dark') ?? true;
    _selectedCity = prefs.getString('fududeeye_selected_city') ?? 'Garoowe';
    await _api.init();
    await refreshData();
  }

  void toggleTheme() async {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('fududeeye_is_dark', _isDarkMode);
  }

  void setCity(String city) async {
    _selectedCity = city;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('fududeeye_selected_city', city);
    await refreshData();
  }

  void setVertical(String vertical) {
    _selectedVertical = vertical;
    _selectedCategorySlug = null;
    notifyListeners();
  }

  void setCategorySlug(String? slug) {
    _selectedCategorySlug = slug;
    notifyListeners();
  }

  void toggleFavorite(String listingId) {
    if (_favorites.contains(listingId)) {
      _favorites.remove(listingId);
    } else {
      _favorites.add(listingId);
    }
    notifyListeners();
  }

  bool isFavorite(String listingId) => _favorites.contains(listingId);

  Future<void> refreshData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final results = await Future.wait([
        _api.getCategories(),
        _api.getListings(city: _selectedCity),
        _api.getListings(verticalType: 'VEHICLE', city: _selectedCity),
        _api.getListings(verticalType: 'REAL_ESTATE', city: _selectedCity),
        _api.getListings(verticalType: 'PRODUCT', categorySlug: 'electronics', city: _selectedCity),
        _api.getListings(verticalType: 'SERVICE'),
        _api.getBuyerRequests(),
      ]);

      _categories = results[0] as List<CategoryModel>;
      _allListings = results[1] as List<ListingModel>;
      _vehicles = results[2] as List<ListingModel>;
      _realEstate = results[3] as List<ListingModel>;
      _electronics = results[4] as List<ListingModel>;
      _services = results[5] as List<ListingModel>;
      _buyerRequests = results[6] as List<BuyerRequestModel>;
    } catch (e) {
      debugPrint('Error loading app state: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> postListing(Map<String, dynamic> data) async {
    final success = await _api.createListing(data);
    if (success) {
      await refreshData();
    }
    return success;
  }

  Future<bool> postBuyerRequest(Map<String, dynamic> data) async {
    final success = await _api.createBuyerRequest(data);
    if (success) {
      await refreshData();
    }
    return success;
  }
}
