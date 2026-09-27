import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand colors matching Fududeeye web design system
  static const Color brand = Color(0xFF0C8FE2);
  static const Color brandDark = Color(0xFF005899);
  static const Color brandLight = Color(0xFF7CC8FB);
  static const Color accent = Color(0xFFF97316);
  static const Color accentDark = Color(0xFFEA580C);

  // Dark Theme Palette
  static const Color darkBg = Color(0xFF050C15);
  static const Color darkCard = Color(0xFF0A1628);
  static const Color darkSurface = Color(0xFF0F2040);
  static const Color darkSurfaceHigh = Color(0xFF162D56);
  static const Color darkTextPrimary = Color(0xFFF0F7FF);
  static const Color darkTextMuted = Color(0xFF94B4D0);
  static const Color darkBorder = Color(0x1FFFFFFF); // rgba(255,255,255,0.08)

  // Light Theme Palette
  static const Color lightBg = Color(0xFFF8FAFC);
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightSurface = Color(0xFFF1F5F9);
  static const Color lightSurfaceHigh = Color(0xFFE2E8F0);
  static const Color lightTextPrimary = Color(0xFF0F172A);
  static const Color lightTextMuted = Color(0xFF64748B);
  static const Color lightBorder = Color(0x14000000); // rgba(0,0,0,0.08)

  // Status colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBg,
      primaryColor: brand,
      colorScheme: const ColorScheme.dark(
        primary: brand,
        secondary: accent,
        surface: darkCard,
        onSurface: darkTextPrimary,
        error: error,
      ),
      cardTheme: CardThemeData(
        color: darkCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: darkBorder, width: 1),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: darkBg.withOpacity(0.95),
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: darkTextPrimary,
        ),
        iconTheme: const IconThemeData(color: darkTextPrimary),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: darkCard,
        selectedItemColor: brand,
        unselectedItemColor: darkTextMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 12,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.outfit(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: darkTextPrimary,
        ),
        headlineMedium: GoogleFonts.outfit(
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: darkTextPrimary,
        ),
        headlineSmall: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: darkTextPrimary,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: darkTextPrimary,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 14,
          color: darkTextPrimary,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 13,
          color: darkTextMuted,
        ),
        labelLarge: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: darkSurface,
        hintStyle: GoogleFonts.inter(color: darkTextMuted.withOpacity(0.7), fontSize: 13),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: darkBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: darkBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: brand, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: brand,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold),
          elevation: 2,
        ),
      ),
      dividerColor: darkBorder,
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: lightBg,
      primaryColor: brand,
      colorScheme: const ColorScheme.light(
        primary: brand,
        secondary: accent,
        surface: lightCard,
        onSurface: lightTextPrimary,
        error: error,
      ),
      cardTheme: CardThemeData(
        color: lightCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: lightBorder, width: 1),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: lightTextPrimary,
        ),
        iconTheme: const IconThemeData(color: lightTextPrimary),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: brand,
        unselectedItemColor: lightTextMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.outfit(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: lightTextPrimary,
        ),
        headlineMedium: GoogleFonts.outfit(
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: lightTextPrimary,
        ),
        headlineSmall: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: lightTextPrimary,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: lightTextPrimary,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 14,
          color: lightTextPrimary,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 13,
          color: lightTextMuted,
        ),
        labelLarge: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: lightSurface,
        hintStyle: GoogleFonts.inter(color: lightTextMuted.withOpacity(0.7), fontSize: 13),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: lightBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: lightBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: brand, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: brand,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold),
          elevation: 1,
        ),
      ),
      dividerColor: lightBorder,
    );
  }
}
