import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

class StoresScreen extends StatefulWidget {
  const StoresScreen({super.key});

  @override
  State<StoresScreen> createState() => _StoresScreenState();
}

class _StoresScreenState extends State<StoresScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<Map<String, dynamic>> _stores = [];
  String _selectedCity = 'ALL';

  @override
  void initState() {
    super.initState();
    _loadStores();
  }

  Future<void> _loadStores() async {
    setState(() => _isLoading = true);
    final data = await _apiService.getStores(
      city: _selectedCity == 'ALL' ? null : _selectedCity,
    );
    if (mounted) {
      setState(() {
        _stores = data;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        title: const Text('Dukaamada Xaqiijisan (Verified Stores)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Cusbooneysii',
            onPressed: _loadStores,
          ),
        ],
      ),
      body: Column(
        children: [
          // City filter bar
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: ['ALL', 'Garoowe', 'Muqdisho', 'Hargeisa', 'Boosaaso'].map((city) {
                final isSelected = _selectedCity == city;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(
                      city == 'ALL' ? '🌍 Dhammaan' : '📍 $city',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: AppTheme.brand,
                    backgroundColor: isDark ? AppTheme.darkCard : Colors.white,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _selectedCity = city);
                        _loadStores();
                      }
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Store list or states
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _loadStores,
                    child: _stores.isEmpty
                        ? ListView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding: const EdgeInsets.all(32),
                            children: [
                              const SizedBox(height: 60),
                              CircleAvatar(
                                radius: 40,
                                backgroundColor: AppTheme.brand.withOpacity(0.12),
                                child: const Icon(Icons.storefront_outlined, size: 44, color: AppTheme.brand),
                              ),
                              const SizedBox(height: 20),
                              const Text(
                                'Wali ma jiraan dukaamo la xaqiijiyay',
                                textAlign: TextAlign.center,
                                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Dukaamada cusub waxay sugayaan dib-u-eegista iyo oggolaanshaha maamulka (Admin Verification). Marka maamulku xaqiijiyo, waxay si toos ah uga soo muuqan doonaan halkan.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 12.5,
                                  color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted,
                                  height: 1.5,
                                ),
                              ),
                              const SizedBox(height: 24),
                              Center(
                                child: ElevatedButton.icon(
                                  onPressed: _loadStores,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppTheme.brand,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                  ),
                                  icon: const Icon(Icons.refresh_rounded, size: 18),
                                  label: const Text('Cusbooneysii Bogga'),
                                ),
                              ),
                            ],
                          )
                        : ListView.builder(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding: const EdgeInsets.all(16),
                            itemCount: _stores.length,
                            itemBuilder: (context, idx) {
                              final s = _stores[idx];
                              final name = s['businessName'] ?? s['name'] ?? 'Dukaan';
                              final city = s['city'] ?? 'Garoowe';
                              final logoUrl = s['logoUrl'];
                              final rating = (s['rating'] as num?)?.toDouble() ?? 5.0;
                              final count = (s['_count']?['listings'] as num?)?.toInt() ?? (s['listings'] as List?)?.length ?? 0;
                              final isVerified = s['isVerified'] == true;

                              return Container(
                                margin: const EdgeInsets.only(bottom: 14),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: isDark ? AppTheme.darkCard : Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                                ),
                                child: Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 26,
                                      backgroundColor: AppTheme.brand.withOpacity(0.12),
                                      backgroundImage: logoUrl != null && logoUrl.toString().startsWith('http')
                                          ? NetworkImage(logoUrl.toString())
                                          : null,
                                      child: logoUrl == null || !logoUrl.toString().startsWith('http')
                                          ? Text(
                                              name.isNotEmpty ? name.substring(0, 1).toUpperCase() : '🏪',
                                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.brand),
                                            )
                                          : null,
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  name,
                                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                              if (isVerified) ...[
                                                const SizedBox(width: 4),
                                                const Icon(Icons.verified, size: 16, color: Colors.blue),
                                              ],
                                            ],
                                          ),
                                          const SizedBox(height: 3),
                                          Text(
                                            s['tagline']?.toString() ?? 'Meherad rasmi ah',
                                            style: TextStyle(
                                              fontSize: 11.5,
                                              color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 5),
                                          Row(
                                            children: [
                                              const Icon(Icons.star_rounded, size: 14, color: Colors.amber),
                                              const SizedBox(width: 2),
                                              Text(rating.toStringAsFixed(1), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                              const SizedBox(width: 10),
                                              Text('📍 $city', style: TextStyle(fontSize: 11, color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted)),
                                              const Spacer(),
                                              Text(
                                                '$count badeeco',
                                                style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppTheme.brand),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    const Icon(Icons.chevron_right_rounded, color: Colors.grey),
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }
}
