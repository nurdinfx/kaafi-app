import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final notifs = [
      {
        'title': 'Qiimo Cusub ayaa loo soo diray dalabkaaga!',
        'body': 'Garoowe Motors ayaa kuugu soo diray qiimo \$27,500 dalabkii Toyota Hilux.',
        'time': '10 daqiiqo ka hor',
        'isRead': false,
        'icon': Icons.local_offer_rounded,
        'color': AppTheme.accent,
      },
      {
        'title': 'Lacag bixintaada Escrow waa la xaqiijiyay',
        'body': 'Lacagta dalabkaaga ORD-2026-9812 waxay ku jirtaa Escrow ammaan ah.',
        'time': '2 saacadood ka hor',
        'isRead': false,
        'icon': Icons.shield_rounded,
        'color': AppTheme.brand,
      },
      {
        'title': 'Qiimo dhimis: iPhone 15 Pro Max',
        'body': 'Alaabta aad jeclaatay waxaa laga dhimay \$50 maanta!',
        'time': 'Shalay',
        'isRead': true,
        'icon': Icons.trending_down_rounded,
        'color': AppTheme.success,
      },
    ];

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        title: const Text('Ogeysiisyada (Notifications)'),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: notifs.length,
        separatorBuilder: (_, __) => Divider(
          color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
          height: 1,
        ),
        itemBuilder: (context, idx) {
          final n = notifs[idx];
          final isRead = n['isRead'] as bool;

          return Container(
            color: !isRead
                ? (isDark ? AppTheme.brand.withOpacity(0.06) : AppTheme.brand.withOpacity(0.04))
                : Colors.transparent,
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              leading: CircleAvatar(
                backgroundColor: (n['color'] as Color).withOpacity(0.15),
                child: Icon(n['icon'] as IconData, color: n['color'] as Color, size: 20),
              ),
              title: Text(
                n['title'] as String,
                style: TextStyle(
                  fontSize: 13.5,
                  fontWeight: !isRead ? FontWeight.bold : FontWeight.w600,
                  color: isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary,
                ),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  Text(
                    n['body'] as String,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    n['time'] as String,
                    style: const TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
