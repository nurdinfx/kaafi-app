import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../models/listing_model.dart';
import '../theme/app_theme.dart';
import '../screens/listing_detail_screen.dart';

class ListingCard extends StatelessWidget {
  final ListingModel listing;
  final bool isFavorite;
  final VoidCallback? onFavoriteToggle;

  const ListingCard({
    super.key,
    required this.listing,
    this.isFavorite = false,
    this.onFavoriteToggle,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currencyFormatter = NumberFormat.currency(
      symbol: listing.currency == 'USD' ? '\$' : 'SOS ',
      decimalDigits: 0,
    );

    return InkWell(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ListingDetailScreen(listing: listing),
          ),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? AppTheme.darkCard : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.25 : 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with Condition & Favorite badges
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 1.15,
                  child: CachedNetworkImage(
                    imageUrl: listing.firstImageUrl,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                      child: const Center(
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: isDark ? AppTheme.darkSurface : AppTheme.lightSurface,
                      child: const Icon(Icons.broken_image_rounded, size: 36, color: Colors.grey),
                    ),
                  ),
                ),

                // Condition badge
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.7),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Text(
                      listing.condition.replaceAll('_', ' '),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),

                // Favorite button
                Positioned(
                  top: 6,
                  right: 6,
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: onFavoriteToggle,
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                          size: 16,
                          color: isFavorite ? Colors.redAccent : Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),

                // Negotiable badge if applicable
                if (listing.isNegotiable)
                  Positioned(
                    bottom: 6,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.accent.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'Wadahadal leh',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
              ],
            ),

            // Listing details
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Price
                  Text(
                    currencyFormatter.format(listing.price),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: isDark ? AppTheme.brandLight : AppTheme.brandDark,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Title
                  Text(
                    listing.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      height: 1.25,
                      color: isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Location & Category
                  Row(
                    children: [
                      Icon(
                        Icons.location_on_outlined,
                        size: 12,
                        color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted,
                      ),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          listing.city,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted,
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
}
