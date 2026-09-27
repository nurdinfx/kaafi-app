import 'package:flutter_test/flutter_test.dart';
import 'package:fududeeye_app/main.dart';
import 'package:fududeeye_app/providers/app_state.dart';

void main() {
  testWidgets('Fududeeye app smoke test', (WidgetTester tester) async {
    final appState = AppState();
    await tester.pumpWidget(FududeeyeApp(appState: appState));
    expect(find.text('Fududeeye'), findsWidgets);
  });
}
