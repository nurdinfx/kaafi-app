import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final sampleOrders = [
      {
        'id': 'ORD-2026-9812',
        'title': 'iPhone 15 Pro Max 256GB',
        'seller': 'Hudi Electronics Store',
        'price': 1180.0,
        'status': 'PAID_ESCROW',
        'statusText': 'Lacagtu waxay ku jirtaa Escrow Ammaan ah',
        'date': '24 Sebtembar 2026',
        'image': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
        'city': 'Garoowe',
      },
      {
        'id': 'ORD-2026-8741',
        'title': 'Solar Inverter 5kW Hybrid System',
        'seller': 'Somalia Green Solar',
        'price': 3400.0,
        'status': 'DELIVERED',
        'statusText': 'Waa la keenay - Xaqiiji Helidda',
        'date': '18 Sebtembar 2026',
        'image': 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80',
        'city': 'Garoowe',
      },
      {
        'id': 'ORD-2026-7603',
        'title': 'Toyota Land Cruiser V8 Service Package',
        'seller': 'Garoowe Motors',
        'price': 450.0,
        'status': 'COMPLETED',
        'statusText': 'Waa la dhameystiray',
        'date': '10 Sebtembar 2026',
        'image': 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&q=80',
        'city': 'Garoowe',
      },
    ];

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        title: const Text('Dalabaadkayga (My Orders & Escrow)'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: sampleOrders.length,
        itemBuilder: (context, idx) {
          final ord = sampleOrders[idx];
          final status = ord['status'] as String;

          Color statusColor = AppTheme.brandLight;
          if (status == 'PAID_ESCROW') statusColor = AppTheme.accent;
          if (status == 'DELIVERED') statusColor = Colors.orangeAccent;
          if (status == 'COMPLETED') statusColor = AppTheme.success;

          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkCard : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Order ID & Date
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      ord['id'] as String,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.brandLight),
                    ),
                    Text(
                      ord['date'] as String,
                      style: TextStyle(fontSize: 11, color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted),
                    ),
                  ],
                ),
                const Divider(height: 18),

                // Item info
                Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        ord['image'] as String,
                        width: 56,
                        height: 56,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(ord['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          const SizedBox(height: 2),
                          Text('Iibiyaha: ${ord['seller']}', style: TextStyle(fontSize: 11, color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted)),
                          const SizedBox(height: 4),
                          Text('\$${(ord['price'] as double).toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Escrow status badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: statusColor.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.shield_rounded, size: 16, color: statusColor),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          ord['statusText'] as String,
                          style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: statusColor),
                        ),
                      ),
                    ],
                  ),
                ),

                // If Delivered, allow releasing Escrow funds
                if (status == 'DELIVERED') ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            backgroundColor: AppTheme.success,
                            content: Text('Waad mahadsan tahay! Lacagta waxaa loo sii daayay iibiyaha.'),
                          ),
                        );
                      },
                      icon: const Icon(Icons.check_circle_outline, size: 16),
                      label: const Text('Xaqiiji Helidda (Release Escrow)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.success,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}
