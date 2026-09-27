import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/buyer_request_model.dart';
import '../theme/app_theme.dart';

class RequestDetailScreen extends StatefulWidget {
  final BuyerRequestModel request;

  const RequestDetailScreen({super.key, required this.request});

  @override
  State<RequestDetailScreen> createState() => _RequestDetailScreenState();
}

class _RequestDetailScreenState extends State<RequestDetailScreen> {
  void _openOfferDialog() {
    final priceController = TextEditingController(
      text: widget.request.targetBudget != null ? widget.request.targetBudget!.toStringAsFixed(0) : '',
    );
    final noteController = TextEditingController();
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) {
          final isDark = Theme.of(context).brightness == Brightness.dark;

          return Container(
            padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 24),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkCard : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('U Dir Qiimo (Send Offer)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.of(ctx).pop()),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Dalabka: ${widget.request.title}',
                  style: TextStyle(fontSize: 12, color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted),
                ),
                const SizedBox(height: 16),
                const Text('Qiimahaaga (Your Price USD \$):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 6),
                TextField(
                  controller: priceController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(hintText: 'Tusaale: 500'),
                ),
                const SizedBox(height: 14),
                const Text('Faahfaahinta Alaabtaada & Keenista:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 6),
                TextField(
                  controller: noteController,
                  maxLines: 3,
                  decoration: const InputDecoration(hintText: 'Qeex xaaladda alaabtaada iyo goorta aad keeni karto...'),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: isSubmitting
                        ? null
                        : () async {
                            setModalState(() => isSubmitting = true);
                            await Future.delayed(const Duration(milliseconds: 900));
                            if (ctx.mounted) {
                              Navigator.of(ctx).pop();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  backgroundColor: AppTheme.success,
                                  content: Text('Qiimahaaga si guul leh ayaa loogu diray macmiilka!'),
                                ),
                              );
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.brand,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: isSubmitting
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Dir Qiimaha (Submit Offer)', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final req = widget.request;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currencyFormatter = NumberFormat.currency(
      symbol: req.currency == 'USD' ? '\$' : 'SOS ',
      decimalDigits: 0,
    );

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        title: const Text('Faahfaahinta Dalabka'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status & Urgency Header Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkCard : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: req.urgency == 'URGENT' || req.urgency == 'HIGH'
                              ? Colors.redAccent.withOpacity(0.15)
                              : AppTheme.brand.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          req.urgency == 'URGENT' ? '🔥 URGENT' : (req.urgency == 'HIGH' ? '⚡ DEGDEG' : 'CAADI'),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: req.urgency == 'URGENT' || req.urgency == 'HIGH' ? Colors.redAccent : AppTheme.brandLight,
                          ),
                        ),
                      ),
                      Text(
                        'Tirada: ${req.quantity}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    req.title,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary,
                    ),
                  ),
                  if (req.targetBudget != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Miisaaniyadda la rabo: ${currencyFormatter.format(req.targetBudget)}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.accent,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Description Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkCard : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Sharraxaad Buuxda:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 8),
                  Text(
                    req.description,
                    style: TextStyle(
                      fontSize: 13.5,
                      height: 1.5,
                      color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Buyer Info Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkCard : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 22,
                    backgroundColor: AppTheme.brand.withOpacity(0.15),
                    child: const Icon(Icons.person, color: AppTheme.brand),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(req.buyerName ?? 'Macmiilka Dalbaday', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                        Text('📍 ${req.city}', style: TextStyle(fontSize: 11.5, color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted)),
                      ],
                    ),
                  ),
                  if (req.buyerPhone != null)
                    IconButton(
                      icon: const Icon(Icons.phone, color: AppTheme.success),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Wacaya: ${req.buyerPhone}')),
                        );
                      },
                    ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Submit Offer Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _openOfferDialog,
                icon: const Icon(Icons.local_offer_rounded),
                label: const Text('U Dir Qiimo (Submit Offer)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accent,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
