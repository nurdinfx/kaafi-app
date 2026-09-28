import 'package:flutter/material.dart';
import '../providers/app_state.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'create_listing_screen.dart';
import 'create_request_screen.dart';
import 'orders_screen.dart';
import 'stores_screen.dart';
import 'notifications_screen.dart';
import 'auth_screen.dart';

class ProfileScreen extends StatefulWidget {
  final AppState appState;

  const ProfileScreen({super.key, required this.appState});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiService _api = ApiService();

  void _showApiSettingsDialog() {
    final controller = TextEditingController(text: _api.baseUrl);
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Isku xirka Database & API'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Kaafi-App wuxuu toos ugu xiran yahay database-ka website-ka adoo adeegsanaya API-ga hoose:',
                style: TextStyle(fontSize: 12),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: controller,
                decoration: const InputDecoration(
                  labelText: 'API Base URL',
                  hintText: 'http://localhost:5000/api/v1',
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 6,
                children: [
                  ActionChip(
                    label: const Text('Android (10.0.2.2)', style: TextStyle(fontSize: 10)),
                    onPressed: () => controller.text = 'http://10.0.2.2:5000/api/v1',
                  ),
                  ActionChip(
                    label: const Text('iOS/Localhost', style: TextStyle(fontSize: 10)),
                    onPressed: () => controller.text = 'http://localhost:5000/api/v1',
                  ),
                ],
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () async {
                await _api.resetBaseUrl();
                if (!ctx.mounted) return;
                Navigator.of(ctx).pop();
                widget.appState.refreshData();
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Waa dib loo celiyay URL-kii asalka ahaa.')),
                );
              },
              child: const Text('Dib u celi (Default)'),
            ),
            ElevatedButton(
              onPressed: () async {
                await _api.setBaseUrl(controller.text);
                if (!ctx.mounted) return;
                Navigator.of(ctx).pop();
                widget.appState.refreshData();
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('URL-ka cusub: ${controller.text}')),
                );
              },
              child: const Text('Keydi'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final appState = widget.appState;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        title: const Text('Xisaabtayda (Profile & Wallet)'),
        actions: [
          IconButton(
            tooltip: 'Hagaaji API & Database URL',
            icon: const Icon(Icons.settings_ethernet_rounded),
            onPressed: _showApiSettingsDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // User Header Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkCard : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: AppTheme.brand.withOpacity(0.2),
                    child: const Text('👤', style: TextStyle(fontSize: 30)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'Nuurdin Maxamed',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary,
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(Icons.verified_rounded, size: 16, color: AppTheme.brand),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '+252 90 770 0000',
                          style: TextStyle(fontSize: 12, color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.brand.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'VIP Seller & Buyer • Garoowe',
                            style: TextStyle(fontSize: 10, color: AppTheme.brandLight, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Wallet Balance Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0C8FE2), Color(0xFF005899)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.brand.withOpacity(0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Kiishka Kaafi-App (Wallet)',
                        style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                      Icon(Icons.account_balance_wallet_rounded, color: Colors.white, size: 20),
                    ],
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    '\$1,450.00',
                    style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'SOS 37,700,000 (Isku-dheellitirka Dalka)',
                    style: TextStyle(color: Colors.white70, fontSize: 11),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Ku shubo Sahal / Zaad / E-Dahab...')),
                            );
                          },
                          icon: const Icon(Icons.arrow_downward_rounded, size: 14),
                          label: const Text('Ku Shubo', style: TextStyle(fontSize: 12)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: AppTheme.brandDark,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('La bax lacagtaada...')),
                            );
                          },
                          icon: const Icon(Icons.arrow_upward_rounded, size: 14),
                          label: const Text('La Bax', style: TextStyle(fontSize: 12)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Colors.white60),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Quick Menu Items
            _buildMenuItem(
              context,
              icon: Icons.receipt_long_rounded,
              title: 'Dalabaadkayga (My Orders & Escrow)',
              subtitle: 'La soco alaabta aad dalbatay iyo lacagta Escrow-ga',
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const OrdersScreen()),
                );
              },
            ),
            _buildMenuItem(
              context,
              icon: Icons.storefront_rounded,
              title: 'Dukaamada Xaqiijisan (Verified Stores)',
              subtitle: 'Booqasho dukaamada Garoowe, Boosaaso & Muqdisho',
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const StoresScreen()),
                );
              },
            ),
            _buildMenuItem(
              context,
              icon: Icons.notifications_rounded,
              title: 'Ogeysiisyada (Notifications)',
              subtitle: 'Fariimaha, qiimo-dhimisyada iyo dalabaadka',
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                );
              },
            ),
            _buildMenuItem(
              context,
              icon: Icons.login_rounded,
              title: 'Gal / Is-diiwaangeli (Login / Sign Up)',
              subtitle: 'Gali lambarkaaga Soomaaliya si aad u iibiso ama u dalbato',
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const AuthScreen()),
                );
              },
            ),
            _buildMenuItem(
              context,
              icon: Icons.add_box_rounded,
              title: 'Iibi Alaab Cusub (Post Listing)',
              subtitle: 'Kudar baabuur, guri, telefoon ama adeeg',
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => CreateListingScreen(appState: appState)),
                );
              },
            ),
            _buildMenuItem(
              context,
              icon: Icons.post_add_rounded,
              title: 'Dalbo Waxaad Rabto (Buyer Request)',
              subtitle: 'Daabac dalab ay ganacsatadu kugu soo raadsadaan',
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => CreateRequestScreen(appState: appState)),
                );
              },
            ),
            _buildMenuItem(
              context,
              icon: Icons.favorite_rounded,
              title: 'Alaabta Aad Jeclaatay (Favorites)',
              subtitle: '${appState.favorites.length} alaab baa ku keydsan',
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('${appState.favorites.length} alaab baa ku jirta Favorites!')),
                );
              },
            ),
            _buildMenuItem(
              context,
              icon: isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
              title: isDark ? 'U badal Shaashad Cad (Light Mode)' : 'U badal Shaashad Madow (Dark Mode)',
              subtitle: 'Midabka shaashadda oo la jaanqaadaya website-ka',
              onTap: () => appState.toggleTheme(),
            ),
            _buildMenuItem(
              context,
              icon: Icons.cloud_sync_rounded,
              title: 'Xiriirka Database-ka (Database & API)',
              subtitle: _api.baseUrl,
              onTap: _showApiSettingsDialog,
            ),
            const SizedBox(height: 20),

            // About text
            Text(
              'HUDI-SOFT TECHNOLOGIES • FUDUDEEYE v1.0.0\nAfrica-First Multi-Category Marketplace & Social Commerce',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 10.5,
                color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.brand.withOpacity(0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppTheme.brand, size: 22),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w700,
            color: isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary,
          ),
        ),
        subtitle: Text(
          subtitle,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontSize: 11.5,
            color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted,
          ),
        ),
        trailing: const Icon(Icons.chevron_right_rounded, size: 20),
      ),
    );
  }
}
