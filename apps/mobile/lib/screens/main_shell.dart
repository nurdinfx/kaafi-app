import 'package:flutter/material.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';
import 'explore_screen.dart';
import 'requests_screen.dart';
import 'chat_screen.dart';
import 'profile_screen.dart';

class MainShell extends StatefulWidget {
  final AppState appState;

  const MainShell({super.key, required this.appState});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final pages = [
      HomeScreen(appState: widget.appState, onTabChange: _onTabTapped),
      ExploreScreen(appState: widget.appState),
      RequestsScreen(appState: widget.appState),
      ChatScreen(appState: widget.appState),
      ProfileScreen(appState: widget.appState),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
              width: 1,
            ),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _onTabTapped,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.storefront_outlined),
              activeIcon: Icon(Icons.storefront_rounded),
              label: 'Suuqa',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.explore_outlined),
              activeIcon: Icon(Icons.explore_rounded),
              label: 'Sahami',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.assignment_outlined),
              activeIcon: Icon(Icons.assignment_rounded),
              label: 'Dalabaadka',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.chat_bubble_outline_rounded),
              activeIcon: Icon(Icons.chat_bubble_rounded),
              label: 'Wadahadal',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline_rounded),
              activeIcon: Icon(Icons.person_rounded),
              label: 'Xisaabtayda',
            ),
          ],
        ),
      ),
    );
  }
}
