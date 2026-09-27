import 'package:flutter/material.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/listing_card.dart';

class ExploreScreen extends StatefulWidget {
  final AppState appState;

  const ExploreScreen({super.key, required this.appState});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedVertical = 'ALL';
  String _sortBy = 'NEWEST';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final appState = widget.appState;

    // Filter listings based on search, vertical, and category
    var items = appState.allListings.where((item) {
      if (_selectedVertical != 'ALL' && item.verticalType != _selectedVertical) {
        return false;
      }
      if (appState.selectedCategorySlug != null && item.categorySlug != appState.selectedCategorySlug) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final match = item.title.toLowerCase().contains(q) ||
            item.description.toLowerCase().contains(q) ||
            item.city.toLowerCase().contains(q);
        if (!match) return false;
      }
      return true;
    }).toList();

    // Sort
    if (_sortBy == 'PRICE_LOW') {
      items.sort((a, b) => a.price.compareTo(b.price));
    } else if (_sortBy == 'PRICE_HIGH') {
      items.sort((a, b) => b.price.compareTo(a.price));
    } else {
      items.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    }

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        title: const Text('Sahami Suuqa (Explore)'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val.trim()),
              decoration: InputDecoration(
                hintText: 'Raadi baabuur, guryo, telefoono...',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
              ),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // Filter Chips (ALL, VEHICLE, REAL_ESTATE, PRODUCT, SERVICE)
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildFilterChip('Dhamaan (All)', 'ALL'),
                _buildFilterChip('🚗 Baabuur', 'VEHICLE'),
                _buildFilterChip('🏢 Dhul & Guryo', 'REAL_ESTATE'),
                _buildFilterChip('📱 Alaab & Qalab', 'PRODUCT'),
                _buildFilterChip('🛠️ Adeegyo', 'SERVICE'),
              ],
            ),
          ),

          // Count and Sort Row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${items.length} Alaab la helay',
                  style: TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted,
                  ),
                ),
                PopupMenuButton<String>(
                  tooltip: 'Kala saar',
                  initialValue: _sortBy,
                  onSelected: (val) => setState(() => _sortBy = val),
                  itemBuilder: (context) => const [
                    PopupMenuItem(value: 'NEWEST', child: Text('Ugu Cusub')),
                    PopupMenuItem(value: 'PRICE_LOW', child: Text('Qiimaha: Ugu jaban')),
                    PopupMenuItem(value: 'PRICE_HIGH', child: Text('Qiimaha: Ugu qaalisan')),
                  ],
                  child: Row(
                    children: [
                      Text(
                        _sortBy == 'PRICE_LOW'
                            ? 'Qiime Jaban'
                            : _sortBy == 'PRICE_HIGH'
                                ? 'Qiime Sare'
                                : 'Ugu Cusub',
                        style: const TextStyle(fontSize: 12, color: AppTheme.brandLight, fontWeight: FontWeight.bold),
                      ),
                      const Icon(Icons.sort_rounded, size: 16, color: AppTheme.brandLight),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Results Grid
          Expanded(
            child: items.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.search_off_rounded, size: 48, color: Colors.grey),
                        const SizedBox(height: 12),
                        Text(
                          'Wax alaab ah lama helin',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : AppTheme.lightTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Isku day inaad bedesho erayga aad raadinayso',
                          style: TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  )
                : GridView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                    itemCount: items.length,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.72,
                    ),
                    itemBuilder: (context, idx) {
                      final item = items[idx];
                      return ListingCard(
                        listing: item,
                        isFavorite: appState.isFavorite(item.id),
                        onFavoriteToggle: () => appState.toggleFavorite(item.id),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedVertical == value;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: AppTheme.brand,
        backgroundColor: isDark ? AppTheme.darkCard : AppTheme.lightSurface,
        labelStyle: TextStyle(
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected ? Colors.white : (isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary),
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: isSelected ? AppTheme.brandLight : (isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
          ),
        ),
        showCheckmark: false,
        onSelected: (selected) {
          setState(() {
            _selectedVertical = value;
          });
        },
      ),
    );
  }
}
