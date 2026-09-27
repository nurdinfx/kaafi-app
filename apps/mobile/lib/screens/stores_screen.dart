import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class StoresScreen extends StatelessWidget {
  const StoresScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final stores = [
      {
        'name': 'Garoowe Motors & Spare Parts',
        'category': '🚗 Baabuurta & Qalabka',
        'city': 'Garoowe, Puntland',
        'rating': 4.9,
        'listingsCount': 28,
        'verified': true,
        'phone': '+252 90 779 1234',
        'logo': '🚗',
      },
      {
        'name': 'Hudi Electronics Store',
        'category': '📱 Telefoono & Laptops',
        'city': 'Garoowe (Waberi)',
        'rating': 4.8,
        'listingsCount': 45,
        'verified': true,
        'phone': '+252 90 774 5566',
        'logo': '📱',
      },
      {
        'name': 'Puntland Real Estate Agency',
        'category': '🏢 Guryaha & Dhulka',
        'city': 'Garoowe & Boosaaso',
        'rating': 4.95,
        'listingsCount': 62,
        'verified': true,
        'phone': '+252 90 778 8899',
        'logo': '🏢',
      },
      {
        'name': 'Somalia Green Solar Co.',
        'category': '☀️ Qalabka Solarka & Tamarta',
        'city': 'Garoowe (Suuqa Sare)',
        'rating': 4.75,
        'listingsCount': 19,
        'verified': true,
        'phone': '+252 90 771 9900',
        'logo': '☀️',
      },
      {
        'name': 'Al-Nasiim Wholesale & Building',
        'category': '📦 Qalabka Dhismaha & Jumlada',
        'city': 'Garoowe & Muqdisho',
        'rating': 4.85,
        'listingsCount': 34,
        'verified': true,
        'phone': '+252 90 775 4321',
        'logo': '📦',
      },
    ];

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        title: const Text('Dukaamada Xaqiijisan (Verified Stores)'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: stores.length,
        itemBuilder: (context, idx) {
          final s = stores[idx];

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
                  radius: 28,
                  backgroundColor: AppTheme.brand.withOpacity(0.15),
                  child: Text(s['logo'] as String, style: const TextStyle(fontSize: 26)),
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
                              s['name'] as String,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.verified, size: 16, color: AppTheme.brand),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        s['category'] as String,
                        style: TextStyle(fontSize: 11.5, color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, size: 14, color: Colors.amber),
                          const SizedBox(width: 2),
                          Text('${s['rating']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          const SizedBox(width: 10),
                          Text('📍 ${s['city']}', style: TextStyle(fontSize: 11, color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted)),
                        ],
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right_rounded),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Booqanaya dukaanka: ${s['name']}')),
                    );
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
