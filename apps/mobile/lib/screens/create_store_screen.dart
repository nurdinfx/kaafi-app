import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../providers/app_state.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

/// Merchant store creation screen.
/// Requires the user to be authenticated (auth gate enforced by the caller).
/// Submitted stores start as UNVERIFIED — admin must approve before they appear publicly.
class CreateStoreScreen extends StatefulWidget {
  final AppState appState;

  const CreateStoreScreen({super.key, required this.appState});

  @override
  State<CreateStoreScreen> createState() => _CreateStoreScreenState();
}

class _CreateStoreScreenState extends State<CreateStoreScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _taglineController = TextEditingController();
  final _descController = TextEditingController();
  final _phoneController = TextEditingController(text: '+252 90 ');
  final _emailController = TextEditingController();
  final _addressController = TextEditingController();

  String _city = 'Garoowe';
  String _category = 'Electronics';
  XFile? _logoFile;
  XFile? _bannerFile;
  bool _isSubmitting = false;

  final _picker = ImagePicker();

  static const List<String> _cities = [
    'Garoowe', 'Boosaaso', 'Muqdisho', 'Hargeisa', 'Berbera', 'Kismaayo',
  ];

  static const List<String> _categories = [
    'Electronics', 'Vehicles', 'Real Estate', 'Fashion & Beauty',
    'Solar & Energy', 'Wholesale & B2B', 'Services', 'Food & Grocery',
    'Health & Pharmacy', 'Other',
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _taglineController.dispose();
    _descController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _pickLogo() async {
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 800,
      maxHeight: 800,
      imageQuality: 85,
    );
    if (file != null) setState(() => _logoFile = file);
  }

  Future<void> _pickBanner() async {
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1600,
      maxHeight: 600,
      imageQuality: 85,
    );
    if (file != null) setState(() => _bannerFile = file);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final data = {
      'businessName': _nameController.text.trim(),
      'tagline': _taglineController.text.trim(),
      'description': _descController.text.trim(),
      'phone': _phoneController.text.trim(),
      'email': _emailController.text.trim().isEmpty ? null : _emailController.text.trim(),
      'address': _addressController.text.trim(),
      'city': _city,
      'category': _category,
      'isVerified': false,
      'status': 'PENDING',
    };

    final result = await ApiService().createStore(data);

    setState(() => _isSubmitting = false);

    if (!mounted) return;

    _showSuccessDialog(offline: result == null);
  }

  void _showSuccessDialog({bool offline = false}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.brand.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.storefront_rounded, color: AppTheme.brand, size: 28),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Dukaan La Diiwangeliyay!',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber.withOpacity(0.3)),
              ),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.pending_actions_rounded, color: Colors.amber, size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Dukaanadaadu waxay sugaysaa xaqiijinta Maamulka (Admin Verification).\n\n'
                      'Marka maamulku xaqiijiyo, dukaanadaadu si toos ah ayay ugu soo muuqan doontaa suuqa '
                      'oo aad ku dari kartaa alaabta.',
                      style: TextStyle(fontSize: 12.5, height: 1.5),
                    ),
                  ),
                ],
              ),
            ),
            if (offline) ...[
              const SizedBox(height: 10),
              Text(
                'Codsigaaga waa la diiwangeliyay si xog-doon ah. Marka aad xiriirka API hesho, waa la sync garaynaa.',
                style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
              ),
            ],
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.of(context).pop();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.brand,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Waad ku mahadsan tahay!'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        title: const Text('Fur Dukaan Cusub'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(2),
          child: Container(
            height: 2,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.brand, AppTheme.brandLight],
              ),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Pending Notice Banner
              Container(
                padding: const EdgeInsets.all(14),
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.brand.withOpacity(0.12),
                      AppTheme.brandLight.withOpacity(0.06),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.brand.withOpacity(0.25)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline_rounded, color: AppTheme.brand, size: 22),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Dukaan cusub wuxuu u baahanyahay oggolaanshaha Maamulka ka hor '
                        'intaanu la muuqan dadweynaha. Buuxi macluumaadka hoos.',
                        style: TextStyle(fontSize: 12, height: 1.5, color: AppTheme.brandLight),
                      ),
                    ),
                  ],
                ),
              ),

              // Logo & Banner Pickers
              _sectionHeader('Sawirrada Dukaan (Logo & Banner)', isDark),
              const SizedBox(height: 12),
              Row(
                children: [
                  // Logo picker
                  Expanded(
                    child: GestureDetector(
                      onTap: _pickLogo,
                      child: Container(
                        height: 110,
                        decoration: BoxDecoration(
                          color: isDark ? AppTheme.darkCard : Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: _logoFile != null
                                ? AppTheme.brand
                                : (isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                            width: _logoFile != null ? 2 : 1,
                          ),
                        ),
                        child: _logoFile != null
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(13),
                                child: Image.file(File(_logoFile!.path), fit: BoxFit.cover),
                              )
                            : Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.add_photo_alternate_rounded,
                                      size: 36, color: AppTheme.brand.withOpacity(0.7)),
                                  const SizedBox(height: 6),
                                  const Text('Logo',
                                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.brand)),
                                  Text('640x640', style: TextStyle(fontSize: 10, color: Colors.grey.shade500)),
                                ],
                              ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Banner picker
                  Expanded(
                    flex: 2,
                    child: GestureDetector(
                      onTap: _pickBanner,
                      child: Container(
                        height: 110,
                        decoration: BoxDecoration(
                          color: isDark ? AppTheme.darkCard : Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: _bannerFile != null
                                ? AppTheme.brand
                                : (isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                            width: _bannerFile != null ? 2 : 1,
                          ),
                        ),
                        child: _bannerFile != null
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(13),
                                child: Image.file(File(_bannerFile!.path), fit: BoxFit.cover),
                              )
                            : Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.panorama_rounded,
                                      size: 36, color: AppTheme.brand.withOpacity(0.7)),
                                  const SizedBox(height: 6),
                                  const Text('Banner',
                                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.brand)),
                                  Text('1600x600 - Ikhtiyaari', style: TextStyle(fontSize: 10, color: Colors.grey.shade500)),
                                ],
                              ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 22),

              // Business Info
              _sectionHeader('Macluumaadka Ganacsiga', isDark),
              const SizedBox(height: 12),
              _buildField(
                controller: _nameController,
                label: 'Magaca Dukaan *',
                hint: 'Garoowe Motors',
                icon: Icons.storefront_rounded,
                isDark: isDark,
                validator: (v) =>
                    (v == null || v.trim().length < 3) ? 'Geli magac saxiix ah (3+ xaraf)' : null,
              ),
              _buildField(
                controller: _taglineController,
                label: 'Tagline / Sloogan',
                hint: 'Nooc kastaa, qiimo ku habboon',
                icon: Icons.format_quote_rounded,
                isDark: isDark,
              ),
              _buildField(
                controller: _descController,
                label: 'Sharaxaad Dukaan',
                hint: 'Kooban u sharax waxa aad iibisid...',
                icon: Icons.description_rounded,
                isDark: isDark,
                maxLines: 3,
              ),
              _buildDropdown(
                label: 'Magaaladda Dukaan',
                value: _city,
                items: _cities,
                icon: Icons.location_city_rounded,
                isDark: isDark,
                onChanged: (v) => setState(() => _city = v!),
              ),
              _buildDropdown(
                label: 'Nooca Ganacsi',
                value: _category,
                items: _categories,
                icon: Icons.category_rounded,
                isDark: isDark,
                onChanged: (v) => setState(() => _category = v!),
              ),
              const SizedBox(height: 22),

              // Contact Info
              _sectionHeader('Xiriirka La Xiriiri (Contact)', isDark),
              const SizedBox(height: 12),
              _buildField(
                controller: _phoneController,
                label: 'Lambarka Telefoonka *',
                hint: '+252 90 700 0000',
                icon: Icons.phone_rounded,
                isDark: isDark,
                keyboardType: TextInputType.phone,
                validator: (v) =>
                    (v == null || v.trim().length < 10) ? 'Geli number saxiix ah' : null,
              ),
              _buildField(
                controller: _emailController,
                label: 'Email (Ikhtiyaari)',
                hint: 'dukaan@example.com',
                icon: Icons.email_rounded,
                isDark: isDark,
                keyboardType: TextInputType.emailAddress,
              ),
              _buildField(
                controller: _addressController,
                label: 'Cinwaanka Dukaan *',
                hint: 'Waberi District, Garoowe',
                icon: Icons.pin_drop_rounded,
                isDark: isDark,
                validator: (v) =>
                    (v == null || v.trim().length < 5) ? 'Geli cinwaan' : null,
              ),
              const SizedBox(height: 28),

              // Submit
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.brand,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 2,
                  ),
                  icon: _isSubmitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Icon(Icons.send_rounded, size: 20),
                  label: Text(
                    _isSubmitting ? 'Waa la dirayaa...' : 'Gudbi Dukaan (Submit for Review)',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionHeader(String title, bool isDark) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 18,
          decoration: BoxDecoration(color: AppTheme.brand, borderRadius: BorderRadius.circular(2)),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w800,
            color: isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    required bool isDark,
    int maxLines = 1,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        validator: validator,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          prefixIcon: Icon(icon, color: AppTheme.brand, size: 20),
          filled: true,
          fillColor: isDark ? AppTheme.darkCard : Colors.white,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
          ),
          focusedBorder: const OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(14)),
            borderSide: BorderSide(color: AppTheme.brand, width: 1.5),
          ),
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String value,
    required List<String> items,
    required IconData icon,
    required bool isDark,
    required void Function(String?) onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: DropdownButtonFormField<String>(
        value: value,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: AppTheme.brand, size: 20),
          filled: true,
          fillColor: isDark ? AppTheme.darkCard : Colors.white,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
          ),
          focusedBorder: const OutlineInputBorder(
            borderRadius: BorderRadius.all(Radius.circular(14)),
            borderSide: BorderSide(color: AppTheme.brand, width: 1.5),
          ),
        ),
        items: items.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
        onChanged: onChanged,
        dropdownColor: isDark ? AppTheme.darkCard : Colors.white,
      ),
    );
  }
}
