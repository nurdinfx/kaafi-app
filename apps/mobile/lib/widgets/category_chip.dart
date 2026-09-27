import 'package:flutter/material.dart';
import '../models/category_model.dart';
import '../theme/app_theme.dart';

class CategoryChip extends StatelessWidget {
  final CategoryModel category;
  final bool isSelected;
  final VoidCallback onTap;

  const CategoryChip({
    super.key,
    required this.category,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? AppTheme.brand
                : (isDark ? AppTheme.darkCard : AppTheme.lightSurface),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: isSelected
                  ? AppTheme.brandLight
                  : (isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
              width: isSelected ? 1.5 : 1,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppTheme.brand.withOpacity(0.35),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    )
                  ]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                category.icon,
                style: const TextStyle(fontSize: 15),
              ),
              const SizedBox(width: 6),
              Text(
                category.name,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected
                      ? Colors.white
                      : (isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
