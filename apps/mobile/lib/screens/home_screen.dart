import 'package:flutter/material.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/hero_banner.dart';
import '../widgets/category_chip.dart';
import '../widgets/listing_card.dart';
import 'create_listing_screen.dart';
import 'create_request_screen.dart';
import 'notifications_screen.dart';
import 'stores_screen.dart';

class HomeScreen extends StatelessWidget {
  final AppState appState;
  final Function(int) onTabChange;

  const HomeScreen({
    super.key,
    required this.appState,
    required this.onTabChange,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        titleSpacing: 16,
        title: Row(
          children: [
            // Kaafi-App Icon Logo
            ClipRRect(
              borderRadius: BorderRadius.circular(9),
              child: Image.asset(
                'assets/images/kaafi_logo.png',
                width: 36,
                height: 36,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Kaafi-App',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
                Text(
                  'MARKETPLACE',
                  style: TextStyle(
                    fontSize: 9,
                    letterSpacing: 1.5,
                    color: AppTheme.brandLight,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // City selector button
          PopupMenuButton<String>(
            tooltip: 'Dooro Magaalada',
            initialValue: appState.selectedCity,
            onSelected: (city) => appState.setCity(city),
            itemBuilder: (context) => [
              'Garoowe',
              'Boosaaso',
              'Hargeisa',
              'Muqdisho',
            ].map((c) => PopupMenuItem(value: c, child: Text('📍 $c'))).toList(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on, size: 14, color: AppTheme.brand),
                  const SizedBox(width: 4),
                  Text(
                    appState.selectedCity,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : AppTheme.lightTextPrimary,
                    ),
                  ),
                  const Icon(Icons.arrow_drop_down, size: 16),
                ],
              ),
            ),
          ),

          // Notifications Icon with badge
          IconButton(
            tooltip: 'Ogeysiisyada',
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.notifications_outlined, size: 22),
                Positioned(
                  top: -2,
                  right: -2,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppTheme.accent,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
              );
            },
          ),

          // Dark / Light Mode Toggle Button
          IconButton(
            tooltip: 'Badal Midabka (Theme)',
            icon: Icon(
              isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
              size: 20,
              color: isDark ? Colors.amber : AppTheme.darkBg,
            ),
            onPressed: () => appState.toggleTheme(),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => appState.refreshData(),
        color: AppTheme.brand,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Announcement Ticker Bar (matches website marquee)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6.5),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFFEA580C), Color(0xFFC2410C)],
                  ),
                ),
                child: const Row(
                  children: [
                    Text('⚡ ', style: TextStyle(fontSize: 12)),
                    Expanded(
                      child: Text(
                        'Kaafi-App: Qiimo Dhimis 60% • Keenis Dagdag Ah • Meheradaha Xaqiijisan',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          letterSpacing: 0.2,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),

              // Search Input Trigger
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
                child: InkWell(
                  onTap: () => onTabChange(1), // Go to Explore/Search Tab
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.darkCard : AppTheme.lightSurface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.search_rounded, size: 20, color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Raadi baabuur, guryo, telefoono ama adeeg...',
                            style: TextStyle(
                              fontSize: 13,
                              color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: AppTheme.brand.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Icon(Icons.tune_rounded, size: 16, color: AppTheme.brand),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Hero Banner
              HeroBanner(
                onPostRequest: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => CreateRequestScreen(appState: appState),
                    ),
                  );
                },
                onBrowseRequests: () => onTabChange(2), // Switch to Requests Tab
              ),

              // Category Carousel
              const Padding(
                padding: EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: Text(
                  'Qaybaha Suuqa (Categories)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ),
              SizedBox(
                height: 44,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: appState.categories.length + 1,
                  itemBuilder: (context, idx) {
                    if (idx == 0) {
                      final isSelected = appState.selectedCategorySlug == null;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: InkWell(
                          onTap: () => appState.setCategorySlug(null),
                          borderRadius: BorderRadius.circular(24),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: isSelected ? AppTheme.brand : (isDark ? AppTheme.darkCard : AppTheme.lightSurface),
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(
                                color: isSelected ? AppTheme.brandLight : (isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                              ),
                            ),
                            child: Row(
                              children: [
                                const Text('⚡', style: TextStyle(fontSize: 14)),
                                const SizedBox(width: 6),
                                Text(
                                  'Dhamaan',
                                  style: TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                    color: isSelected ? Colors.white : (isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }
                    final cat = appState.categories[idx - 1];
                    final isSelected = appState.selectedCategorySlug == cat.slug;
                    return CategoryChip(
                      category: cat,
                      isSelected: isSelected,
                      onTap: () {
                        appState.setCategorySlug(isSelected ? null : cat.slug);
                        onTabChange(1); // open browse tab filtered
                      },
                    );
                  },
                ),
              ),

              const SizedBox(height: 14),

              // Verified Stores Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: InkWell(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const StoresScreen()),
                    );
                  },
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.darkCard : Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.brand.withOpacity(0.25)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppTheme.brand.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.verified_user_rounded, color: AppTheme.brand, size: 20),
                        ),
                        const SizedBox(width: 10),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Dukaamada Xaqiijisan ee Soomaaliya', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5)),
                              Text('Garoowe Motors, Hudi Electronics & qaar kale...', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
                            ],
                          ),
                        ),
                        const Text('Eeg →', style: TextStyle(color: AppTheme.brandLight, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // 🚗 SECTION 1: Vehicles & Automotive
              _buildSectionHeader(
                context,
                title: '🚗 Baabuurta & Gaadiidka',
                subtitle: 'Baabuur, 4WDs iyo xamuul magaalada ${appState.selectedCity}',
                onViewAll: () {
                  appState.setVertical('VEHICLE');
                  onTabChange(1);
                },
              ),
              _buildListingGrid(appState.vehicles),

              const SizedBox(height: 16),

              // 🏢 SECTION 2: Real Estate & Properties
              _buildSectionHeader(
                context,
                title: '🏢 Dhulka & Guryaha',
                subtitle: 'Guryo, dhulal iyo dukaamo iib ama kiro ah',
                onViewAll: () {
                  appState.setVertical('REAL_ESTATE');
                  onTabChange(1);
                },
              ),
              _buildListingGrid(appState.realEstate),

              const SizedBox(height: 16),

              // 📱 SECTION 3: Electronics & Phones
              _buildSectionHeader(
                context,
                title: '📱 Telefoono & Electronics',
                subtitle: 'iPhones, Laptops, Accessories & Qalabka guriga',
                onViewAll: () {
                  appState.setCategorySlug('electronics');
                  onTabChange(1);
                },
              ),
              _buildListingGrid(appState.electronics),

              const SizedBox(height: 16),

              // 🛠️ SECTION 4: Services & Energy
              _buildSectionHeader(
                context,
                title: '🛠️ Adeegyada & Tamarta Solar',
                subtitle: 'Xirfadlayaal xaqiijisan iyo nidaamyo solar casri ah',
                onViewAll: () {
                  appState.setVertical('SERVICE');
                  onTabChange(1);
                },
              ),
              _buildListingGrid(appState.services),

              const SizedBox(height: 20),

              // Post Request Card Banner
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.brand.withOpacity(0.2),
                      const Color(0xFF162D56),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.brand.withOpacity(0.35)),
                ),
                child: Column(
                  children: [
                    const Text('📋', style: TextStyle(fontSize: 32)),
                    const SizedBox(height: 8),
                    const Text(
                      'Ma weyday waxaad doonayso?',
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Qor Dalabkaaga (Buyer Request) si ganacsatada xaqiijisan ay kugu soo diraan qiimaha ugu jaban.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 12, color: AppTheme.darkTextMuted),
                    ),
                    const SizedBox(height: 14),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => CreateRequestScreen(appState: appState),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.accent,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      ),
                      child: const Text('Daabac Dalabkaaga Hadda', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => CreateListingScreen(appState: appState),
            ),
          );
        },
        backgroundColor: AppTheme.brand,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text(
          'Iibi Alaab',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(
    BuildContext context, {
    required String title,
    required String subtitle,
    required VoidCallback onViewAll,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary,
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 11.5,
                    color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: onViewAll,
            child: const Text('Eeg Dhamaan →', style: TextStyle(fontSize: 12, color: AppTheme.brandLight, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildListingGrid(List<dynamic> listings) {
    if (listings.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Text('Wali wax alaab ah lama soo gelin qaybtan.', style: TextStyle(fontSize: 12, color: Colors.grey)),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: listings.length > 4 ? 4 : listings.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.72,
        ),
        itemBuilder: (context, idx) {
          final item = listings[idx];
          return ListingCard(
            listing: item,
            isFavorite: appState.isFavorite(item.id),
            onFavoriteToggle: () => appState.toggleFavorite(item.id),
          );
        },
      ),
    );
  }
}
