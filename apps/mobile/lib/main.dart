import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'providers/app_state.dart';
import 'screens/main_shell.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark,
    ),
  );

  final appState = AppState();
  await appState.init();

  runApp(KaafiApp(appState: appState));
}

class KaafiApp extends StatelessWidget {
  final AppState? appState;

  const KaafiApp({super.key, this.appState});

  @override
  Widget build(BuildContext context) {
    final state = appState ?? AppState();
    return ListenableBuilder(
      listenable: state,
      builder: (context, _) {
        return MaterialApp(
          title: 'Kaafi-App',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: state.isDarkMode ? ThemeMode.dark : ThemeMode.light,
          home: MainShell(appState: state),
        );
      },
    );
  }
}

// Backward-compatible alias
typedef FududeeyeApp = KaafiApp;
