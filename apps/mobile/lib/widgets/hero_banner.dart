import 'dart:async';
import 'package:flutter/material.dart';
import '../screens/stores_screen.dart';

class HeroBanner extends StatefulWidget {
  final VoidCallback onPostRequest;
  final VoidCallback onBrowseRequests;

  const HeroBanner({
    super.key,
    required this.onPostRequest,
    required this.onBrowseRequests,
  });

  @override
  State<HeroBanner> createState() => _HeroBannerState();
}

class _HeroBannerState extends State<HeroBanner> with SingleTickerProviderStateMixin {
  int _currentSlide = 0;
  Timer? _autoTimer;
  late AnimationController _floatController;
  late Animation<double> _floatAnim;
  late Animation<double> _scaleAnim;

  final List<Map<String, dynamic>> _slides = [
    {
      'title': 'Dharka Dumarka ee Ugu Quruxda Badan',
      'highlight': 'Kolekshinka Cusub 2026',
      'subtitle': 'Abayado, Diracyo Xariir ah, Hijabs & Dharka Ciidda',
      'badge': '👑 QAABAB QURUX BADAN',
      'tag': 'Fashion & Qurux',
      'discount': '-40% OFF',
      'imageUrl': 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80',
      'accent': const Color(0xFFF97316),
      'colors': [const Color(0xFF2E1005), const Color(0xFF190702)],
    },
    {
      'title': 'Moobilada Casriga Ah & Kaamirooyinka CCTV',
      'highlight': 'Amni & Qalab Tayo Sare Leh',
      'subtitle': 'Smartphones, Smartwatches, CCTV & Fast Chargers',
      'badge': '⚡ TAYO SARE LEH',
      'tag': 'Electronics & Tech',
      'discount': '-60% OFF',
      'imageUrl': 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
      'accent': const Color(0xFF0EA5E9),
      'colors': [const Color(0xFF072138), const Color(0xFF03101E)],
    },
    {
      'title': 'Saacadaha Raaxada & Dahabka Asalka Ah',
      'highlight': 'Damiinad 2 Sano Ah',
      'subtitle': 'Saacadaha Automatic-ka ah, Maqaar & Dahabka Lammaanaha',
      'badge': '💎 DUKAAMEYSI AMAN AH',
      'tag': 'Luxury & Watches',
      'discount': 'FREE DELIVERY',
      'imageUrl': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
      'accent': const Color(0xFFD97706),
      'colors': [const Color(0xFF2D1B03), const Color(0xFF130A01)],
    },
  ];

  @override
  void initState() {
    super.initState();
    // Continuous floating and pulse animation for the hero image
    _floatController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2800),
    )..repeat(reverse: true);

    _floatAnim = Tween<double>(begin: -6.0, end: 6.0).animate(
      CurvedAnimation(parent: _floatController, curve: Curves.easeInOut),
    );

    _scaleAnim = Tween<double>(begin: 0.98, end: 1.04).animate(
      CurvedAnimation(parent: _floatController, curve: Curves.easeInOut),
    );

    // Auto-advance slides every 5.5 seconds
    _startTimer();
  }

  void _startTimer() {
    _autoTimer?.cancel();
    _autoTimer = Timer.periodic(const Duration(milliseconds: 5500), (_) {
      if (mounted) {
        setState(() {
          _currentSlide = (_currentSlide + 1) % _slides.length;
        });
      }
    });
  }

  void _goToSlide(int index) {
    setState(() => _currentSlide = index);
    _startTimer(); // Reset auto timer on manual interaction
  }

  @override
  void dispose() {
    _autoTimer?.cancel();
    _floatController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final slide = _slides[_currentSlide];
    final accentColor = slide['accent'] as Color;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          colors: slide['colors'] as List<Color>,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: accentColor.withOpacity(0.45),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: accentColor.withOpacity(0.25),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            // Ambient glowing circles
            Positioned(
              right: -30,
              top: -30,
              child: Container(
                width: 180,
                height: 180,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: accentColor.withOpacity(0.18),
                ),
              ),
            ),
            Positioned(
              left: -40,
              bottom: -40,
              child: Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: accentColor.withOpacity(0.12),
                ),
              ),
            ),

            // Main Content
            Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Row: Brand & Auto Indicators
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Kaafi-App Brand Pill with Logo
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white.withOpacity(0.2)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: Image.asset(
                                'assets/images/kaafi_logo.png',
                                width: 18,
                                height: 18,
                                fit: BoxFit.cover,
                              ),
                            ),
                            const SizedBox(width: 6),
                            RichText(
                              text: const TextSpan(
                                style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900),
                                children: [
                                  TextSpan(text: 'Kaafi-', style: TextStyle(color: Colors.white)),
                                  TextSpan(text: 'App ', style: TextStyle(color: Color(0xFFF97316))),
                                  TextSpan(text: 'ONLINE', style: TextStyle(color: Colors.white70, fontSize: 8.5)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Slide indicators (interactive dots)
                      Row(
                        children: List.generate(_slides.length, (index) {
                          final isSelected = _currentSlide == index;
                          return GestureDetector(
                            onTap: () => _goToSlide(index),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              margin: const EdgeInsets.only(left: 5),
                              width: isSelected ? 22 : 7,
                              height: 7,
                              decoration: BoxDecoration(
                                color: isSelected ? accentColor : Colors.white24,
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          );
                        }),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Middle Row: Title + Floating Animated Product Image
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Text Column (Left)
                      Expanded(
                        flex: 6,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Badge pill
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                              decoration: BoxDecoration(
                                color: accentColor.withOpacity(0.25),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: accentColor.withOpacity(0.5)),
                              ),
                              child: Text(
                                slide['badge'] as String,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: accentColor,
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),

                            // Main Title
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 350),
                              child: Text(
                                slide['title'] as String,
                                key: ValueKey('title_$_currentSlide'),
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  height: 1.25,
                                  letterSpacing: -0.3,
                                ),
                              ),
                            ),
                            const SizedBox(height: 6),

                            // Subtitle
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 350),
                              child: Text(
                                '${slide['highlight']} • ${slide['subtitle']}',
                                key: ValueKey('sub_$_currentSlide'),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFFFCD34D),
                                  fontWeight: FontWeight.w600,
                                  height: 1.35,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(width: 12),

                      // Animated Floating Image Column (Right)
                      Expanded(
                        flex: 4,
                        child: AnimatedBuilder(
                          animation: _floatController,
                          builder: (context, child) {
                            return Transform.translate(
                              offset: Offset(0, _floatAnim.value),
                              child: Transform.scale(
                                scale: _scaleAnim.value,
                                child: Stack(
                                  alignment: Alignment.center,
                                  children: [
                                    // Image frame with glowing shadow
                                    Container(
                                      height: 120,
                                      width: double.infinity,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(18),
                                        border: Border.all(
                                          color: accentColor.withOpacity(0.6),
                                          width: 2,
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: accentColor.withOpacity(0.35),
                                            blurRadius: 18,
                                            spreadRadius: 2,
                                          ),
                                        ],
                                      ),
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(16),
                                        child: AnimatedSwitcher(
                                          duration: const Duration(milliseconds: 400),
                                          child: Image.network(
                                            slide['imageUrl'] as String,
                                            key: ValueKey(slide['imageUrl']),
                                            fit: BoxFit.cover,
                                            width: double.infinity,
                                            height: double.infinity,
                                            loadingBuilder: (context, child, progress) {
                                              if (progress == null) return child;
                                              return Center(
                                                child: CircularProgressIndicator(
                                                  strokeWidth: 2,
                                                  valueColor: AlwaysStoppedAnimation(accentColor),
                                                ),
                                              );
                                            },
                                            errorBuilder: (context, error, stackTrace) => Container(
                                              color: accentColor.withOpacity(0.2),
                                              child: Icon(Icons.shopping_bag, color: accentColor, size: 36),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),

                                    // Discount badge overlay
                                    Positioned(
                                      bottom: 6,
                                      right: 6,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFDC2626),
                                          borderRadius: BorderRadius.circular(8),
                                          boxShadow: const [
                                            BoxShadow(color: Colors.black45, blurRadius: 4),
                                          ],
                                        ),
                                        child: Text(
                                          slide['discount'] as String,
                                          style: const TextStyle(
                                            fontSize: 9.5,
                                            fontWeight: FontWeight.w900,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Feature Pills Row
                  Row(
                    children: [
                      _buildPill('👑 Qaabab Qurux', accentColor),
                      const SizedBox(width: 6),
                      _buildPill('🌿 Tayo Sare', accentColor),
                      const SizedBox(width: 6),
                      _buildPill('🛍️ Aman Ah', accentColor),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: widget.onPostRequest,
                          icon: const Icon(Icons.shopping_bag_outlined, size: 16),
                          label: const Text(
                            'Dukaameyso Hadda',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFEA580C),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 11),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const StoresScreen()),
                            );
                          },
                          icon: const Icon(Icons.storefront_outlined, size: 15),
                          label: const Text(
                            'Meheradaha (Stores)',
                            style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600),
                          ),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: BorderSide(color: Colors.white.withOpacity(0.35)),
                            padding: const EdgeInsets.symmetric(vertical: 11),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPill(String label, Color accent) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withOpacity(0.15)),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
      ),
    );
  }
}
