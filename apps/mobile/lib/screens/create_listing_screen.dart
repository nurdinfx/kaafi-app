import 'package:flutter/material.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';

class CreateListingScreen extends StatefulWidget {
  final AppState appState;

  const CreateListingScreen({super.key, required this.appState});

  @override
  State<CreateListingScreen> createState() => _CreateListingScreenState();
}

class _CreateListingScreenState extends State<CreateListingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _priceController = TextEditingController();
  final _imageUrlController = TextEditingController(
    text: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
  );

  String _verticalType = 'PRODUCT';
  String _condition = 'NEW';
  bool _isNegotiable = true;
  String _selectedCity = 'Garoowe';
  String _currency = 'USD';
  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _imageUrlController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final data = {
      'title': _titleController.text.trim(),
      'description': _descController.text.trim(),
      'price': double.tryParse(_priceController.text) ?? 100.0,
      'currency': _currency,
      'condition': _condition,
      'isNegotiable': _isNegotiable,
      'verticalType': _verticalType,
      'city': _selectedCity,
      'media': [
        {'url': _imageUrlController.text.trim(), 'mediaType': 'IMAGE', 'sortOrder': 0}
      ],
    };

    final success = await widget.appState.postListing(data);

    setState(() => _isSubmitting = false);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: AppTheme.success,
            content: Text('Alaabtaada si guul leh ayaa loo diiwaangeliyay Database-ka!'),
          ),
        );
        Navigator.of(context).pop();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: AppTheme.error,
            content: Text('Khalad ayaa dhacay. Hubi xiriirka server-ka.'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        title: const Text('Kudar Alaab Cusub (Post Listing)'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title
              const Text('Magaca Alaabta (Title)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(hintText: 'Tusaale: iPhone 15 Pro Max ama Toyota Prado'),
                validator: (v) => (v == null || v.isEmpty) ? 'Fadlan qor cinwaanka' : null,
              ),
              const SizedBox(height: 16),

              // Price & Currency Row
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Qiimaha (Price)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _priceController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(hintText: '1500'),
                          validator: (v) => (v == null || v.isEmpty) ? 'Geli qiimaha' : null,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Lacagta', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _currency,
                          items: const [
                            DropdownMenuItem(value: 'USD', child: Text('USD (\$)')),
                            DropdownMenuItem(value: 'SOS', child: Text('SOS')),
                          ],
                          onChanged: (v) => setState(() => _currency = v!),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Category / Vertical
              const Text('Qaybta (Vertical Type)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _verticalType,
                items: const [
                  DropdownMenuItem(value: 'VEHICLE', child: Text('🚗 Baabuur (Vehicles)')),
                  DropdownMenuItem(value: 'REAL_ESTATE', child: Text('🏢 Dhul & Guryo (Real Estate)')),
                  DropdownMenuItem(value: 'PRODUCT', child: Text('📱 Alaab & Electronics')),
                  DropdownMenuItem(value: 'SERVICE', child: Text('🛠️ Adeegyo (Services)')),
                ],
                onChanged: (v) => setState(() => _verticalType = v!),
              ),
              const SizedBox(height: 16),

              // Condition & City Row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Xaaladda', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _condition,
                          items: const [
                            DropdownMenuItem(value: 'NEW', child: Text('Cusub (New)')),
                            DropdownMenuItem(value: 'LIKE_NEW', child: Text('Sida Cusub')),
                            DropdownMenuItem(value: 'USED', child: Text('La isticmaalay')),
                          ],
                          onChanged: (v) => setState(() => _condition = v!),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Magaalada', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _selectedCity,
                          items: const [
                            DropdownMenuItem(value: 'Garoowe', child: Text('Garoowe')),
                            DropdownMenuItem(value: 'Boosaaso', child: Text('Boosaaso')),
                            DropdownMenuItem(value: 'Hargeisa', child: Text('Hargeisa')),
                            DropdownMenuItem(value: 'Muqdisho', child: Text('Muqdisho')),
                          ],
                          onChanged: (v) => setState(() => _selectedCity = v!),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Negotiable Checkbox
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Qiimaha wadahadal ma leeyahay? (Is Negotiable)', style: TextStyle(fontSize: 13)),
                value: _isNegotiable,
                activeColor: AppTheme.brand,
                onChanged: (v) => setState(() => _isNegotiable = v ?? false),
              ),
              const SizedBox(height: 10),

              // Image URL
              const Text('Sawirka Alaabta (Image URL)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _imageUrlController,
                decoration: const InputDecoration(hintText: 'https://... (URL Sawirka)'),
              ),
              const SizedBox(height: 16),

              // Description
              const Text('Faahfaahin Buuxda (Description)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descController,
                maxLines: 4,
                decoration: const InputDecoration(hintText: 'Sharax xaaladda alaabta, sababta loo iibinayo...'),
                validator: (v) => (v == null || v.isEmpty) ? 'Fadlan faahfaahin geli' : null,
              ),
              const SizedBox(height: 28),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.brand,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Daabac Alaabta (Post to Database)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }
}
