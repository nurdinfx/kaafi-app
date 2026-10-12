import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';

class SheinCategoryItem {
  final String name;
  final String? imageUrl;
  final String slug;
  final String? query;
  final bool isViewAll;

  const SheinCategoryItem({
    required this.name,
    this.imageUrl,
    required this.slug,
    this.query,
    this.isViewAll = false,
  });
}

class SheinCategorySection {
  final String title;
  final bool hasIcon;
  final List<SheinCategoryItem> items;

  const SheinCategorySection({
    required this.title,
    this.hasIcon = false,
    required this.items,
  });
}

class SheinCategoryGroup {
  final String id;
  final String name;
  final String slug;
  final List<SheinCategorySection> sections;

  const SheinCategoryGroup({
    required this.id,
    required this.name,
    required this.slug,
    required this.sections,
  });
}

// ─────────────────────────────────────────────────────────────
// SHEIN CATEGORIES MASTER DATA
// ─────────────────────────────────────────────────────────────
final List<SheinCategoryGroup> sheinCategoryGroups = [
  const SheinCategoryGroup(
    id: 'new-in',
    name: 'New In',
    slug: 'fashion',
    sections: [
      SheinCategorySection(
        title: "NEW IN WOMEN'S CLOTHING",
        hasIcon: true,
        items: [
          SheinCategoryItem(name: 'View All', slug: 'fashion', isViewAll: true),
          SheinCategoryItem(name: 'Tops', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'tops'),
          SheinCategoryItem(name: 'T-shirts', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 't-shirts'),
          SheinCategoryItem(name: 'Blouses', imageUrl: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'blouses'),
          SheinCategoryItem(name: 'Dresses', imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'dresses'),
          SheinCategoryItem(name: 'Dirac & Hijab', imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'dirac'),
          SheinCategoryItem(name: 'Sweaters', imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'sweaters'),
          SheinCategoryItem(name: 'Denim', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'denim'),
          SheinCategoryItem(name: 'Co-ords', imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'co-ords'),
        ],
      ),
      SheinCategorySection(
        title: 'NEW IN CURVE CLOTHING',
        items: [
          SheinCategoryItem(name: 'View All', slug: 'fashion', isViewAll: true),
          SheinCategoryItem(name: 'Curve Tops', imageUrl: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve tops'),
          SheinCategoryItem(name: 'Curve Dresses', imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve dresses'),
          SheinCategoryItem(name: 'Bottoms', imageUrl: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve bottoms'),
          SheinCategoryItem(name: 'Jackets', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'jackets'),
        ],
      ),
    ],
  ),
  const SheinCategoryGroup(
    id: 'women',
    name: 'Women Clothing',
    slug: 'fashion',
    sections: [
      SheinCategorySection(
        title: "WOMEN'S APPAREL",
        hasIcon: true,
        items: [
          SheinCategoryItem(name: 'View All', slug: 'fashion', isViewAll: true),
          SheinCategoryItem(name: 'Tops', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'tops'),
          SheinCategoryItem(name: 'Dresses', imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'dresses'),
          SheinCategoryItem(name: 'Dirac Shiiki', imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'dirac'),
          SheinCategoryItem(name: 'Abayas', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'abaya'),
          SheinCategoryItem(name: 'Jeans & Denim', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'jeans'),
          SheinCategoryItem(name: 'Skirts', imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'skirts'),
        ],
      ),
    ],
  ),
  const SheinCategoryGroup(
    id: 'curve',
    name: 'Curve & Plus',
    slug: 'fashion',
    sections: [
      SheinCategorySection(
        title: 'SHOP CURVE',
        hasIcon: true,
        items: [
          SheinCategoryItem(name: 'View All', slug: 'fashion', isViewAll: true),
          SheinCategoryItem(name: 'Curve Tops', imageUrl: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve tops'),
          SheinCategoryItem(name: 'Curve Dresses', imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve dresses'),
          SheinCategoryItem(name: 'Curve Jeans', imageUrl: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve jeans'),
        ],
      ),
    ],
  ),
  const SheinCategoryGroup(
    id: 'kids',
    name: 'Kids & Toys',
    slug: 'kids',
    sections: [
      SheinCategorySection(
        title: 'SHOP BY CATEGORY (KIDS)',
        hasIcon: true,
        items: [
          SheinCategoryItem(name: 'View All', slug: 'kids', isViewAll: true),
          SheinCategoryItem(name: 'Educational Toys', imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'educational'),
          SheinCategoryItem(name: 'Dolls & Plush', imageUrl: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'dolls'),
          SheinCategoryItem(name: 'Kids Games', imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'games'),
          SheinCategoryItem(name: 'Block Toys', imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'blocks'),
          SheinCategoryItem(name: 'Vehicle Toys', imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'vehicles'),
        ],
      ),
      SheinCategorySection(
        title: 'KIDS EDUCATIONAL TOYS',
        items: [
          SheinCategoryItem(name: 'View All', slug: 'kids', isViewAll: true),
          SheinCategoryItem(name: 'Puzzles', imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'puzzles'),
          SheinCategoryItem(name: 'Electronic Learning', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'electronic'),
          SheinCategoryItem(name: 'STEM Toys', imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'stem'),
        ],
      ),
    ],
  ),
  const SheinCategoryGroup(
    id: 'men',
    name: 'Men Clothing',
    slug: 'fashion',
    sections: [
      SheinCategorySection(
        title: "MEN'S APPAREL",
        hasIcon: true,
        items: [
          SheinCategoryItem(name: 'View All', slug: 'fashion', isViewAll: true),
          SheinCategoryItem(name: 'T-shirts & Polos', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'men shirts'),
          SheinCategoryItem(name: 'Khamiis & Shirts', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'khamiis'),
          SheinCategoryItem(name: 'Jackets & Coats', imageUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'men jackets'),
          SheinCategoryItem(name: 'Pants & Jeans', imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'men jeans'),
          SheinCategoryItem(name: 'Shoes & Sneakers', imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'sneakers'),
        ],
      ),
    ],
  ),
  const SheinCategoryGroup(
    id: 'electronics',
    name: 'Phones & Electronics',
    slug: 'electronics',
    sections: [
      SheinCategorySection(
        title: 'PHONES & GADGETS',
        hasIcon: true,
        items: [
          SheinCategoryItem(name: 'View All', slug: 'electronics', isViewAll: true),
          SheinCategoryItem(name: 'iPhone & iOS', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02543?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'iphone'),
          SheinCategoryItem(name: 'Samsung Galaxy', imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'samsung'),
          SheinCategoryItem(name: 'Smart Watches', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'smartwatch'),
          SheinCategoryItem(name: 'Airpods & Cod', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'airpods'),
          SheinCategoryItem(name: 'Laptops', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'laptop'),
        ],
      ),
    ],
  ),
  const SheinCategoryGroup(
    id: 'shoes-bags',
    name: 'Shoes & Bags',
    slug: 'fashion',
    sections: [
      SheinCategorySection(
        title: 'FOOTWEAR & BAGS',
        hasIcon: true,
        items: [
          SheinCategoryItem(name: 'View All', slug: 'fashion', isViewAll: true),
          SheinCategoryItem(name: 'Heels & Pumps', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'heels'),
          SheinCategoryItem(name: 'Sneakers', imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'sneakers'),
          SheinCategoryItem(name: 'Handbags', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'handbags'),
          SheinCategoryItem(name: 'Sandals', imageUrl: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'sandals'),
        ],
      ),
    ],
  ),
  const SheinCategoryGroup(
    id: 'beauty',
    name: 'Beauty & Oud',
    slug: 'health-beauty',
    sections: [
      SheinCategorySection(
        title: 'BEAUTY & PERFUMES',
        hasIcon: true,
        items: [
          SheinCategoryItem(name: 'View All', slug: 'health-beauty', isViewAll: true),
          SheinCategoryItem(name: 'Perfumes & Oud', imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=160&h=160&fit=crop&q=80', slug: 'health-beauty', query: 'perfume'),
          SheinCategoryItem(name: 'Skincare', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=160&h=160&fit=crop&q=80', slug: 'health-beauty', query: 'skincare'),
          SheinCategoryItem(name: 'Makeup', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=160&h=160&fit=crop&q=80', slug: 'health-beauty', query: 'makeup'),
        ],
      ),
    ],
  ),
  const SheinCategoryGroup(
    id: 'home',
    name: 'Home & Living',
    slug: 'real-estate',
    sections: [
      SheinCategorySection(
        title: 'HOME & DECOR',
        hasIcon: true,
        items: [
          SheinCategoryItem(name: 'View All', slug: 'real-estate', isViewAll: true),
          SheinCategoryItem(name: 'Bedding', imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=160&h=160&fit=crop&q=80', slug: 'real-estate', query: 'bedding'),
          SheinCategoryItem(name: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=160&h=160&fit=crop&q=80', slug: 'real-estate', query: 'kitchen'),
          SheinCategoryItem(name: 'Decor', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=160&h=160&fit=crop&q=80', slug: 'real-estate', query: 'decor'),
        ],
      ),
    ],
  ),
  const SheinCategoryGroup(
    id: 'vehicles',
    name: 'Automotive & Cars',
    slug: 'vehicles',
    sections: [
      SheinCategorySection(
        title: 'VEHICLES & ACCESSORIES',
        hasIcon: true,
        items: [
          SheinCategoryItem(name: 'View All', slug: 'vehicles', isViewAll: true),
          SheinCategoryItem(name: 'Land Cruiser V8', imageUrl: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=160&h=160&fit=crop&q=80', slug: 'vehicles', query: 'land cruiser'),
          SheinCategoryItem(name: 'Vitz & Sedans', imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=160&h=160&fit=crop&q=80', slug: 'vehicles', query: 'vitz'),
          SheinCategoryItem(name: 'Bajaaj', imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=160&h=160&fit=crop&q=80', slug: 'vehicles', query: 'bajaaj'),
        ],
      ),
    ],
  ),
];

// Quick circular avatars for home top bar
final List<SheinCategoryItem> sheinQuickCircles = [
  const SheinCategoryItem(name: 'View All', slug: 'fashion', isViewAll: true),
  const SheinCategoryItem(name: 'Dumarka', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&h=160&fit=crop&q=80', slug: 'fashion'),
  const SheinCategoryItem(name: 'Tops & Dirac', imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'tops'),
  const SheinCategoryItem(name: 'Curve', imageUrl: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve'),
  const SheinCategoryItem(name: 'Caruurta', imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=160&h=160&fit=crop&q=80', slug: 'kids'),
  const SheinCategoryItem(name: 'Ragga', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'men'),
  const SheinCategoryItem(name: 'Telefoonnada', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02543?w=160&h=160&fit=crop&q=80', slug: 'electronics'),
  const SheinCategoryItem(name: 'Kabo & Bags', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'shoes'),
  const SheinCategoryItem(name: 'Qurxinta', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=160&h=160&fit=crop&q=80', slug: 'health-beauty'),
  const SheinCategoryItem(name: 'Guriga', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=160&h=160&fit=crop&q=80', slug: 'real-estate'),
  const SheinCategoryItem(name: 'Saacado', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&h=160&fit=crop&q=80', slug: 'wholesale', query: 'watches'),
  const SheinCategoryItem(name: 'Gaadiidka', imageUrl: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=160&h=160&fit=crop&q=80', slug: 'vehicles'),
];

// ─────────────────────────────────────────────────────────────
// WIDGET: SHEIN TOP CATEGORIES BAR (MATCHING SHEIN SCREENSHOT)
// ─────────────────────────────────────────────────────────────
class SheinTopCategoryBar extends StatelessWidget {
  final AppState appState;
  final Function(int) onTabChange;

  const SheinTopCategoryBar({
    super.key,
    required this.appState,
    required this.onTabChange,
  });

  void _openSheinSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SheinCategoryBottomSheet(
        appState: appState,
        onTabChange: onTabChange,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Black/Dark Category Ribbon (Matching Shein Bar)
        Container(
          height: 38,
          color: isDark ? const Color(0xFF161616) : const Color(0xFF111111),
          child: Row(
            children: [
              // Categories Dropdown Button ("Categories ▾")
              InkWell(
                onTap: () => _openSheinSheet(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  height: double.infinity,
                  color: Colors.white.withOpacity(0.08),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Categories',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(width: 4),
                      Icon(Icons.keyboard_arrow_down, size: 16, color: Color(0xFFEA580C)),
                    ],
                  ),
                ),
              ),

              // Divider
              Container(width: 1, height: 18, color: Colors.white24, margin: const EdgeInsets.symmetric(horizontal: 4)),

              // Horizontal Category Pills
              Expanded(
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  itemCount: sheinCategoryGroups.length + 1,
                  itemBuilder: (context, idx) {
                    if (idx == 0) {
                      final isSelected = appState.selectedCategorySlug == null;
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
                        child: InkWell(
                          onTap: () => appState.setCategorySlug(null),
                          borderRadius: BorderRadius.circular(4),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              border: isSelected ? const Border(bottom: BorderSide(color: Color(0xFFEA580C), width: 2)) : null,
                            ),
                            child: Text(
                              'Dhamaan',
                              style: TextStyle(
                                color: isSelected ? Colors.white : Colors.white70,
                                fontSize: 11.5,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                      );
                    }
                    final group = sheinCategoryGroups[idx - 1];
                    final isSelected = appState.selectedCategorySlug == group.slug;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
                      child: InkWell(
                        onTap: () {
                          appState.setCategorySlug(group.slug);
                          onTabChange(1);
                        },
                        borderRadius: BorderRadius.circular(4),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            border: isSelected ? const Border(bottom: BorderSide(color: Color(0xFFEA580C), width: 2)) : null,
                          ),
                          child: Text(
                            group.name,
                            style: TextStyle(
                              color: isSelected ? Colors.white : Colors.white70,
                              fontSize: 11.5,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Right arrow to open full sheet
              IconButton(
                icon: const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Colors.white70),
                onPressed: () => _openSheinSheet(context),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 28),
              ),
            ],
          ),
        ),

        // 2. SHEIN Circular Category Avatars (Horizontal scrollable story-like circles)
        Padding(
          padding: const EdgeInsets.only(top: 10, bottom: 6),
          child: SizedBox(
            height: 88,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              physics: const BouncingScrollPhysics(),
              itemCount: sheinQuickCircles.length,
              itemBuilder: (context, i) {
                final item = sheinQuickCircles[i];
                final isSelected = item.isViewAll
                    ? appState.selectedCategorySlug == null
                    : appState.selectedCategorySlug == item.slug;

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: InkWell(
                    onTap: () {
                      if (item.isViewAll) {
                        _openSheinSheet(context);
                      } else {
                        appState.setCategorySlug(item.slug);
                        onTabChange(1);
                      }
                    },
                    borderRadius: BorderRadius.circular(30),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Circle Avatar
                        Container(
                          width: 54,
                          height: 54,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isSelected ? const Color(0xFFEA580C) : (isDark ? Colors.white24 : Colors.black12),
                              width: isSelected ? 2 : 1,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.06),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: ClipOval(
                            child: item.isViewAll
                                ? Container(
                                    color: isDark ? const Color(0xFF262626) : const Color(0xFFF1F5F9),
                                    child: Center(
                                      child: Icon(
                                        Icons.grid_view_rounded,
                                        size: 24,
                                        color: isSelected ? const Color(0xFFEA580C) : (isDark ? Colors.white : Colors.black87),
                                      ),
                                    ),
                                  )
                                : CachedNetworkImage(
                                    imageUrl: item.imageUrl ?? '',
                                    fit: BoxFit.cover,
                                    placeholder: (context, url) => Container(
                                      color: isDark ? const Color(0xFF262626) : const Color(0xFFF1F5F9),
                                      child: const Center(child: CircularProgressIndicator(strokeWidth: 1.5)),
                                    ),
                                    errorWidget: (context, url, error) => Container(
                                      color: isDark ? const Color(0xFF262626) : const Color(0xFFF1F5F9),
                                      child: const Icon(Icons.shopping_bag_outlined, size: 20),
                                    ),
                                  ),
                          ),
                        ),
                        const SizedBox(height: 5),
                        // Label
                        SizedBox(
                          width: 62,
                          child: Text(
                            item.name,
                            textAlign: TextAlign.center,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                              color: isSelected
                                  ? const Color(0xFFEA580C)
                                  : (isDark ? Colors.white70 : const Color(0xFF334155)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────
// WIDGET: SHEIN 2-PANE CATEGORY MODAL BOTTOM SHEET
// ─────────────────────────────────────────────────────────────
class SheinCategoryBottomSheet extends StatefulWidget {
  final AppState appState;
  final Function(int) onTabChange;

  const SheinCategoryBottomSheet({
    super.key,
    required this.appState,
    required this.onTabChange,
  });

  @override
  State<SheinCategoryBottomSheet> createState() => _SheinCategoryBottomSheetState();
}

class _SheinCategoryBottomSheetState extends State<SheinCategoryBottomSheet> {
  int _selectedGroupIndex = 0;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeGroup = sheinCategoryGroups[_selectedGroupIndex];

    return Container(
      height: MediaQuery.of(context).size.height * 0.82,
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkBg : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Header Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(color: isDark ? AppTheme.darkBorder : Colors.black12),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.grid_view_rounded, size: 18, color: Color(0xFFEA580C)),
                    SizedBox(width: 8),
                    Text(
                      'Dhammaan Qaybaha (SHEIN Categories)',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20),
                  onPressed: () => Navigator.pop(context),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 24),
                ),
              ],
            ),
          ),

          // 2-Pane SHEIN Categories Area
          Expanded(
            child: Row(
              children: [
                // LEFT PANE: Vertical List of Categories
                Container(
                  width: 110,
                  color: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFF8FAFC),
                  child: ListView.builder(
                    itemCount: sheinCategoryGroups.length,
                    itemBuilder: (context, idx) {
                      final grp = sheinCategoryGroups[idx];
                      final isSelected = _selectedGroupIndex == idx;
                      return InkWell(
                        onTap: () => setState(() => _selectedGroupIndex = idx),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? (isDark ? AppTheme.darkBg : Colors.white)
                                : Colors.transparent,
                            border: isSelected
                                ? const Border(
                                    left: BorderSide(color: Color(0xFFEA580C), width: 3),
                                  )
                                : null,
                          ),
                          child: Text(
                            grp.name,
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              color: isSelected
                                  ? const Color(0xFFEA580C)
                                  : (isDark ? Colors.white70 : Colors.black87),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // RIGHT PANE: Subcategories and Circular Cards
                Expanded(
                  child: Container(
                    color: isDark ? AppTheme.darkBg : Colors.white,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(12),
                      itemCount: activeGroup.sections.length,
                      itemBuilder: (context, secIdx) {
                        final section = activeGroup.sections[secIdx];
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Section Title with orange squares icon
                            Padding(
                              padding: const EdgeInsets.only(top: 8, bottom: 10),
                              child: Row(
                                children: [
                                  if (section.hasIcon) ...[
                                    const Icon(Icons.grid_4x4_rounded, size: 14, color: Color(0xFFEA580C)),
                                    const SizedBox(width: 4),
                                  ],
                                  Expanded(
                                    child: Text(
                                      section.title,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w900,
                                        letterSpacing: 0.3,
                                        color: Color(0xFFEA580C),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Grid of Circular Items (3 per row)
                            GridView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 3,
                                crossAxisSpacing: 8,
                                mainAxisSpacing: 12,
                                childAspectRatio: 0.82,
                              ),
                              itemCount: section.items.length,
                              itemBuilder: (context, itemIdx) {
                                final subItem = section.items[itemIdx];
                                return InkWell(
                                  onTap: () {
                                    widget.appState.setCategorySlug(subItem.slug);
                                    Navigator.pop(context);
                                    widget.onTabChange(1);
                                  },
                                  borderRadius: BorderRadius.circular(10),
                                  child: Column(
                                    children: [
                                      // Circle Avatar
                                      Container(
                                        width: 50,
                                        height: 50,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                            color: isDark ? Colors.white24 : Colors.black12,
                                          ),
                                        ),
                                        child: ClipOval(
                                          child: subItem.isViewAll
                                              ? Container(
                                                  color: isDark ? const Color(0xFF2A2A2A) : const Color(0xFFF1F5F9),
                                                  child: const Center(
                                                    child: Icon(Icons.grid_view_rounded, size: 20, color: Color(0xFFEA580C)),
                                                  ),
                                                )
                                              : CachedNetworkImage(
                                                  imageUrl: subItem.imageUrl ?? '',
                                                  fit: BoxFit.cover,
                                                  placeholder: (context, url) => Container(
                                                    color: isDark ? const Color(0xFF2A2A2A) : const Color(0xFFF1F5F9),
                                                    child: const Center(child: CircularProgressIndicator(strokeWidth: 1.5)),
                                                  ),
                                                  errorWidget: (context, url, error) => Container(
                                                    color: isDark ? const Color(0xFF2A2A2A) : const Color(0xFFF1F5F9),
                                                    child: const Icon(Icons.shopping_bag_outlined, size: 18),
                                                  ),
                                                ),
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      // Label
                                      Text(
                                        subItem.name,
                                        textAlign: TextAlign.center,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                          color: isDark ? Colors.white70 : Colors.black87,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                            const SizedBox(height: 12),
                          ],
                        );
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
