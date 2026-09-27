import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class HeroBanner extends StatelessWidget {
  final VoidCallback onPostRequest;
  final VoidCallback onBrowseRequests;

  const HeroBanner({
    super.key,
    required this.onPostRequest,
    required this.onBrowseRequests,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: [
            Color(0xFF0F2B48),
            Color(0xFF0A1628),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: AppTheme.brand.withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppTheme.brand.withOpacity(0.15),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Background ambient circular glow
          Positioned(
            right: -20,
            top: -20,
            child: Container(
              width: 110,
              height: 110,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.brand.withOpacity(0.12),
              ),
            ),
          ),

          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.brand.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.brand.withOpacity(0.4)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('🇸🇴 ', style: TextStyle(fontSize: 12)),
                    Text(
                      'Suuqa #1 ee Soomaaliya & Puntland',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.brandLight,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Title
              const Text(
                'Iibso ama Iibi si Fudud & Aamin ah',
                style: TextStyle(
                  fontSize: 19,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 6),

              // Description
              Text(
                'Baabuur, Dhul, Guryo, Telefoono & Adeegyo kala duwan magaalada Garoowe iyo guud ahaan dalka.',
                style: TextStyle(
                  fontSize: 12,
                  color: AppTheme.darkTextMuted,
                  height: 1.35,
                ),
              ),
              const SizedBox(height: 16),

              // Action buttons matching the website
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: onPostRequest,
                      icon: const Icon(Icons.post_add_rounded, size: 16),
                      label: const Text('Dalbo Waxaad Rabto', style: TextStyle(fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.accent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        elevation: 0,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onBrowseRequests,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.brandLight,
                        side: BorderSide(color: AppTheme.brand.withOpacity(0.4)),
                        padding: const EdgeInsets.symmetric(vertical: 11),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Eeg Dalabaadka', style: TextStyle(fontSize: 12)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
