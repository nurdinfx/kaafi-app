import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/listing_model.dart';
import '../theme/app_theme.dart';

class CheckoutScreen extends StatefulWidget {
  final ListingModel listing;

  const CheckoutScreen({super.key, required this.listing});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  int _quantity = 1;
  String _paymentMethod = 'SAHAL'; // Default for Garoowe / Puntland
  String _fulfillmentType = 'DRIVER_DELIVERY';
  final _phoneController = TextEditingController(text: '+252 90 ');
  final _districtController = TextEditingController(text: '1-da Luulyo');
  final _landmarkController = TextEditingController(
    text: 'Dhabarka dambe ee Masjidka',
  );
  bool _isProcessing = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _districtController.dispose();
    _landmarkController.dispose();
    super.dispose();
  }

  void _processOrder() async {
    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(milliseconds: 1200));

    if (mounted) {
      setState(() => _isProcessing = false);
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.success.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  color: AppTheme.success,
                  size: 54,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Dalabkaagu Waa Guuleystay!',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Lacagta waxaa lagu hayaa Escrow Ammaan ah. Iibiyaha ayaa lagu wargaliyay inuu kuugu keeno ${_districtController.text.trim()}, ${widget.listing.city}.',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).pop();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.brand,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                ),
                child: const Text('Gartay (OK)'),
              ),
            ],
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final listing = widget.listing;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currencyFormatter = NumberFormat.currency(
      symbol: listing.currency == 'USD' ? '\$' : 'SOS ',
      decimalDigits: 0,
    );

    final subtotal = listing.price * _quantity;
    final deliveryFee = _fulfillmentType == 'DRIVER_DELIVERY' ? 3.0 : 0.0;
    final total = subtotal + deliveryFee;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(title: const Text('Dalbo & Bixi (Checkout & Escrow)')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Summary Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkCard : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
                ),
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.network(
                      listing.firstImageUrl,
                      width: 70,
                      height: 70,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => Container(
                        width: 70,
                        height: 70,
                        color: Colors.grey,
                        child: const Icon(Icons.image),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          listing.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: isDark
                                ? AppTheme.darkTextPrimary
                                : AppTheme.lightTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          currencyFormatter.format(listing.price),
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: isDark
                                ? AppTheme.brandLight
                                : AppTheme.brandDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Quantity Selector
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Tirada aad rabto (Quantity):',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.darkCard : AppTheme.lightSurface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isDark
                          ? AppTheme.darkBorder
                          : AppTheme.lightBorder,
                    ),
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove, size: 16),
                        onPressed: _quantity > 1
                            ? () => setState(() => _quantity--)
                            : null,
                      ),
                      Text(
                        '$_quantity',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add, size: 16),
                        onPressed: () => setState(() => _quantity++),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Delivery Options
            const Text(
              'Habka Keenista (Fulfillment):',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _buildChoiceChip(
                    title: 'Gaari Keenis (\$3)',
                    subtitle: 'Driver Delivery',
                    selected: _fulfillmentType == 'DRIVER_DELIVERY',
                    onTap: () =>
                        setState(() => _fulfillmentType = 'DRIVER_DELIVERY'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildChoiceChip(
                    title: 'Adiga oo Qaata (\$0)',
                    subtitle: 'Customer Pickup',
                    selected: _fulfillmentType == 'CUSTOMER_PICKUP',
                    onTap: () =>
                        setState(() => _fulfillmentType = 'CUSTOMER_PICKUP'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Delivery Address Fields
            const Text(
              'Goobta Keenista (Delivery Address):',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _districtController,
              decoration: const InputDecoration(
                labelText: 'Xaafadda (District)',
                hintText: 'Tusaale: 1-da Luulyo, Waberi, Hodan',
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _landmarkController,
              decoration: const InputDecoration(
                labelText: 'Calaamad U dhow (Landmark)',
                hintText: 'Dhabarka Masjidka ama Isbitaalka',
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Telefoonkaaga Lacag-bixinta & Xiriirka',
              ),
            ),
            const SizedBox(height: 20),

            // Payment Provider Selection (Somali Mobile Money)
            const Text(
              'Habka Lacag-Bixinta (Mobile Money):',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildPaymentOption('SAHAL (Golis)', 'SAHAL', '🔴'),
                _buildPaymentOption('ZAAD (Telesom)', 'ZAAD', '🟡'),
                _buildPaymentOption('EVC PLUS (Hormuud)', 'EVC_PLUS', '🟢'),
                _buildPaymentOption('Kiishka (Wallet)', 'WALLET', '💼'),
              ],
            ),
            const SizedBox(height: 20),

            // Escrow Security Notice
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.brand.withOpacity(0.1),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.brand.withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.security_rounded, color: AppTheme.brand, size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '100% Escrow Protection',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Lacagtaadu waxay ku jiri doontaa Kaafi-App Escrow ilaa aad ka hesho oo aad ka xaqiijiso alaabta.',
                          style: TextStyle(fontSize: 11, height: 1.3),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Order Breakdown
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkCard : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
                ),
              ),
              child: Column(
                children: [
                  _buildSummaryRow(
                    'Qiimaha Alaabta ($_quantity x)',
                    currencyFormatter.format(subtotal),
                  ),
                  const SizedBox(height: 6),
                  _buildSummaryRow(
                    'Keenista (Delivery)',
                    currencyFormatter.format(deliveryFee),
                  ),
                  const Divider(height: 20),
                  _buildSummaryRow(
                    'Wadarta Guud (Total)',
                    currencyFormatter.format(total),
                    isBold: true,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isProcessing ? null : _processOrder,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.brand,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: _isProcessing
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : Text(
                        'Bixi ${currencyFormatter.format(total)} oo Dalbo Hadda',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildChoiceChip({
    required String title,
    required String subtitle,
    required bool selected,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: selected
              ? AppTheme.brand.withOpacity(0.15)
              : (isDark ? AppTheme.darkCard : AppTheme.lightSurface),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected
                ? AppTheme.brand
                : (isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Column(
          children: [
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 12,
                color: selected ? AppTheme.brandLight : null,
              ),
            ),
            Text(
              subtitle,
              style: const TextStyle(fontSize: 10, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentOption(String label, String code, String emoji) {
    final isSelected = _paymentMethod == code;
    return ChoiceChip(
      label: Text('$emoji $label'),
      selected: isSelected,
      selectedColor: AppTheme.brand,
      labelStyle: TextStyle(
        fontSize: 12,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        color: isSelected ? Colors.white : null,
      ),
      onSelected: (_) => setState(() => _paymentMethod = code),
    );
  }

  Widget _buildSummaryRow(String label, String val, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isBold ? 14 : 12.5,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          val,
          style: TextStyle(
            fontSize: isBold ? 16 : 13,
            fontWeight: isBold ? FontWeight.w900 : FontWeight.w600,
            color: isBold ? AppTheme.brandLight : null,
          ),
        ),
      ],
    );
  }
}
