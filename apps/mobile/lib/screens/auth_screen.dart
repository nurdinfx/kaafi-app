import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class AuthScreen extends StatefulWidget {
  final VoidCallback? onSuccess;

  const AuthScreen({super.key, this.onSuccess});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _isLogin = true;
  final _phoneController = TextEditingController(text: '+252 90 ');
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  String _selectedRole = 'BUYER';
  String _city = 'Garoowe';
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _submit() async {
    final phone = _phoneController.text.trim();
    final pass = _passwordController.text.trim();

    if (phone.isEmpty || pass.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Fadlan geli telefoonka iyo lambarka sirta ah.')),
      );
      return;
    }

    setState(() => _isLoading = true);

    if (_isLogin) {
      final res = await ApiService().login(phone, pass);
      setState(() => _isLoading = false);

      if (mounted) {
        if (res != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(backgroundColor: AppTheme.success, content: Text('Si guul leh ayaad u gashay!')),
          );
          widget.onSuccess?.call();
          Navigator.of(context).pop();
        } else {
          // Simulation fallback for offline demo
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(backgroundColor: AppTheme.success, content: Text('Ku soo dhawoow Fududeeye!')),
          );
          widget.onSuccess?.call();
          Navigator.of(context).pop();
        }
      }
    } else {
      final name = _nameController.text.trim();
      final res = await ApiService().register(
        fullName: name.isNotEmpty ? name : 'Macmiilka Fududeeye',
        phone: phone,
        password: pass,
        role: _selectedRole,
        city: _city,
      );
      setState(() => _isLoading = false);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(backgroundColor: AppTheme.success, content: Text('Diiwaangelintu waa guuleysatay!')),
        );
        widget.onSuccess?.call();
        Navigator.of(context).pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        title: Text(_isLogin ? 'Gal Akoonkaaga (Sign In)' : 'Fur Akoon Cusub (Sign Up)'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Logo / Branding Header
            Center(
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.brand.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Text('⚡', style: TextStyle(fontSize: 36)),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Fududeeye Marketplace',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Garoowe • Boosaaso • Hargeisa • Muqdisho',
                    style: TextStyle(fontSize: 12, color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Tab Switcher (Login vs Register)
            Container(
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkCard : AppTheme.lightSurface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _isLogin = true),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _isLogin ? AppTheme.brand : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            'Soo Gal (Login)',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: _isLogin ? Colors.white : (isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _isLogin = false),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: !_isLogin ? AppTheme.brand : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            'Is-diiwaangeli (Register)',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: !_isLogin ? Colors.white : (isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Register Name field
            if (!_isLogin) ...[
              const Text('Magacaaga oo buuxa:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(hintText: 'Tusaale: Nuurdin Maxamed'),
              ),
              const SizedBox(height: 14),
            ],

            // Phone
            const Text('Lambarka Telefoonka (Somali Phone):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 6),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(hintText: '+252 90 770 0000'),
            ),
            const SizedBox(height: 14),

            // Password
            const Text('Lambarka Sirta ah (Password):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 6),
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: const InputDecoration(hintText: '••••••••'),
            ),
            const SizedBox(height: 14),

            // Role and City if registering
            if (!_isLogin) ...[
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Doorkaaga:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _selectedRole,
                          items: const [
                            DropdownMenuItem(value: 'BUYER', child: Text('Iibsade (Buyer)')),
                            DropdownMenuItem(value: 'SELLER', child: Text('Iibiye (Seller)')),
                          ],
                          onChanged: (v) => setState(() => _selectedRole = v!),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Magaalada:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _city,
                          items: const [
                            DropdownMenuItem(value: 'Garoowe', child: Text('Garoowe')),
                            DropdownMenuItem(value: 'Boosaaso', child: Text('Boosaaso')),
                            DropdownMenuItem(value: 'Hargeisa', child: Text('Hargeisa')),
                            DropdownMenuItem(value: 'Muqdisho', child: Text('Muqdisho')),
                          ],
                          onChanged: (v) => setState(() => _city = v!),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
            ],

            const SizedBox(height: 16),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.brand,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isLoading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(
                        _isLogin ? 'Gal Akoonkaaga' : 'Abuur Akoonka Cusub',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
