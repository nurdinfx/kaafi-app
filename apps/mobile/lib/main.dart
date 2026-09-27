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

  runApp(FududeeyeApp(appState: appState));
}

class FududeeyeApp extends StatelessWidget {
  final AppState appState;

  const FududeeyeApp({super.key, required this.appState});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
        return MaterialApp(
          title: 'Fududeeye',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: appState.isDarkMode ? ThemeMode.dark : ThemeMode.light,
          home: MainShell(appState: appState),
        );
      },
    );
  }
}
