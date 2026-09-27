import 'package:flutter/material.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';

class CreateRequestScreen extends StatefulWidget {
  final AppState appState;

  const CreateRequestScreen({super.key, required this.appState});

  @override
  State<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _budgetController = TextEditingController();
  final _qtyController = TextEditingController(text: '1');

  String _urgency = 'NORMAL';
  String _selectedCity = 'Garoowe';
  String _currency = 'USD';
  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _budgetController.dispose();
    _qtyController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final data = {
      'title': _titleController.text.trim(),
      'description': _descController.text.trim(),
      'targetBudget': double.tryParse(_budgetController.text),
      'currency': _currency,
      'quantity': int.tryParse(_qtyController.text) ?? 1,
      'urgency': _urgency,
      'city': _selectedCity,
    };

    final success = await widget.appState.postBuyerRequest(data);

    setState(() => _isSubmitting = false);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: AppTheme.success,
            content: Text('Dalabkaaga waa la diiwaangeliyay! Iibiyeyaashu waxay kugu soo hagaajin doonaan qiimaha.'),
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
        title: const Text('Dalbo Waxaad Rabto (Buyer Request)'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Info banner
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.accent.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.accent.withOpacity(0.3)),
                ),
                child: const Row(
                  children: [
                    Text('📋', style: TextStyle(fontSize: 24)),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Ma weyday waxaad raadinaysay? Halkan ku qor, iibiyeyaasha xaqiijisan ayaa kuu keeni doona qiimaha ugu habboon.',
                        style: TextStyle(fontSize: 12, height: 1.3),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              // Title
              const Text('Maxaad u baahan tahay? (Title)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(hintText: 'Tusaale: Baabuur Hilux 2020 ama 100 Kiish oo Sibir ah'),
                validator: (v) => (v == null || v.isEmpty) ? 'Fadlan qor waxaad u baahan tahay' : null,
              ),
              const SizedBox(height: 16),

              // Budget & Quantity Row
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Miisaaniyadda (Target Budget)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _budgetController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(hintText: 'USD \$'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Tirada (Qty)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _qtyController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(hintText: '1'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Urgency & City
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Degdegga (Urgency)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _urgency,
                          items: const [
                            DropdownMenuItem(value: 'NORMAL', child: Text('Caadi (Normal)')),
                            DropdownMenuItem(value: 'HIGH', child: Text('Degdeg (High)')),
                            DropdownMenuItem(value: 'URGENT', child: Text('Degdeg Badan 🔥')),
                          ],
                          onChanged: (v) => setState(() => _urgency = v!),
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

              // Description
              const Text('Sharaxaad Dheeraad ah (Description)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descController,
                maxLines: 4,
                decoration: const InputDecoration(hintText: 'Qeex midabka, xaaladda, goobta aad doonayso in laguugu keeno...'),
                validator: (v) => (v == null || v.isEmpty) ? 'Fadlan qor sharraxaad' : null,
              ),
              const SizedBox(height: 28),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.accent,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Dir Dalabka (Post Buyer Request)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
