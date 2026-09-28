import 'package:flutter_test/flutter_test.dart';
import 'package:fududeeye_app/main.dart';
import 'package:fududeeye_app/providers/app_state.dart';

void main() {
  testWidgets('Kaafi-App smoke test', (WidgetTester tester) async {
    final appState = AppState();
    await tester.pumpWidget(KaafiApp(appState: appState));
    expect(find.text('Kaafi-App'), findsWidgets);
  });
}
