import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../providers/app_state.dart';
import '../models/buyer_request_model.dart';
import '../theme/app_theme.dart';
import 'create_request_screen.dart';
import 'request_detail_screen.dart';

class RequestsScreen extends StatelessWidget {
  final AppState appState;

  const RequestsScreen({super.key, required this.appState});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final requests = appState.buyerRequests;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        title: const Text('Dalabaadka Macaamiisha (Requests)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => appState.refreshData(),
          ),
        ],
      ),
      body: requests.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('📋', style: TextStyle(fontSize: 48)),
                  const SizedBox(height: 12),
                  const Text('Wali dalab cusub ma jiro', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  const Text('Noqo qofka ugu horeeya ee soo qora dalab!'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => CreateRequestScreen(appState: appState)),
                      );
                    },
                    child: const Text('Dalbo Waxaad Rabto'),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: requests.length,
              itemBuilder: (context, idx) {
                final req = requests[idx];
                return _buildRequestCard(context, req, isDark);
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => CreateRequestScreen(appState: appState)),
          );
        },
        backgroundColor: AppTheme.accent,
        icon: const Icon(Icons.post_add_rounded, color: Colors.white),
        label: const Text('Dalbo Waxaad Rabto', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildRequestCard(BuildContext context, BuyerRequestModel req, bool isDark) {
    final currencyFormatter = NumberFormat.currency(
      symbol: req.currency == 'USD' ? '\$' : 'SOS ',
      decimalDigits: 0,
    );

    return InkWell(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => RequestDetailScreen(request: req)),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Urgency & Status Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: req.urgency == 'URGENT' || req.urgency == 'HIGH'
                      ? Colors.redAccent.withOpacity(0.15)
                      : AppTheme.brand.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: req.urgency == 'URGENT' || req.urgency == 'HIGH'
                        ? Colors.redAccent.withOpacity(0.4)
                        : AppTheme.brand.withOpacity(0.4),
                  ),
                ),
                child: Text(
                  req.urgency == 'URGENT' ? '🔥 URGENT' : (req.urgency == 'HIGH' ? '⚡ DEGDEG' : 'CAADI'),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: req.urgency == 'URGENT' || req.urgency == 'HIGH' ? Colors.redAccent : AppTheme.brandLight,
                  ),
                ),
              ),
              if (req.targetBudget != null)
                Text(
                  'Miisaaniyadda: ${currencyFormatter.format(req.targetBudget)}',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.accent,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),

          // Title
          Text(
            req.title,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary,
            ),
          ),
          const SizedBox(height: 6),

          // Description
          Text(
            req.description,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 12.5,
              height: 1.4,
              color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted,
            ),
          ),
          const SizedBox(height: 12),

          // Location & Buyer & Action
          Row(
            children: [
              Icon(Icons.location_on_rounded, size: 14, color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted),
              const SizedBox(width: 4),
              Text(req.city, style: TextStyle(fontSize: 11.5, color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted)),
              const Spacer(),
              Text(
                '${req.offersCount} dalab loo diray',
                style: const TextStyle(fontSize: 11, color: AppTheme.brandLight, fontWeight: FontWeight.bold),
              ),
              const SizedBox(width: 10),
              ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('U dir qiimo dalabka: ${req.title}')),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.brand,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('U Dir Qiimo'),
              ),
            ],
          ),
        ],
      ),
    ),
  );
}
}
