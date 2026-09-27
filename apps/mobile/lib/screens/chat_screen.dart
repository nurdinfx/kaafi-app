import 'package:flutter/material.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import 'chat_room_screen.dart';

class ChatScreen extends StatelessWidget {
  final AppState appState;

  const ChatScreen({super.key, required this.appState});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final chats = [
      {
        'name': 'Garoowe Motors',
        'lastMsg': 'Haa walaal, Land Cruiser-ka waa diyaar, goorma ayaad rabtaa inaad aragto?',
        'time': '10:45 AM',
        'unread': 2,
        'avatar': '🚗',
      },
      {
        'name': 'Hudi Electronics Store',
        'lastMsg': 'iPhone 15 Pro Max 256GB waa la heli karaa, keenistuna waa bilaash.',
        'time': 'Shalay',
        'unread': 0,
        'avatar': '📱',
      },
      {
        'name': 'Puntland Real Estate',
        'lastMsg': 'Guriga Waberi ku yaal wuu furan yahay booqasho galabta.',
        'time': '2 maalmood',
        'unread': 0,
        'avatar': '🏢',
      },
      {
        'name': 'Somalia Green Solar',
        'lastMsg': 'Qiimaha solar-ka waxaan ku dareynaa rakibidda iyo dammaanadda.',
        'time': '3 maalmood',
        'unread': 0,
        'avatar': '☀️',
      },
    ];

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        title: const Text('Wadahadallada (Chat & Messages)'),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: chats.length,
        separatorBuilder: (context, idx) => Divider(
          color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
          height: 1,
        ),
        itemBuilder: (context, idx) {
          final c = chats[idx];
          final unread = c['unread'] as int;

          return ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            leading: CircleAvatar(
              radius: 24,
              backgroundColor: AppTheme.brand.withOpacity(0.15),
              child: Text(c['avatar'] as String, style: const TextStyle(fontSize: 22)),
            ),
            title: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  c['name'] as String,
                  style: TextStyle(
                    fontSize: 14.5,
                    fontWeight: unread > 0 ? FontWeight.w800 : FontWeight.w600,
                    color: isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary,
                  ),
                ),
                Text(
                  c['time'] as String,
                  style: TextStyle(
                    fontSize: 11,
                    color: unread > 0 ? AppTheme.brandLight : (isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted),
                  ),
                ),
              ],
            ),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                c['lastMsg'] as String,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 12.5,
                  color: isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted,
                  fontWeight: unread > 0 ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            ),
            trailing: unread > 0
                ? Container(
                    padding: const EdgeInsets.all(6),
                    decoration: const BoxDecoration(
                      color: AppTheme.brand,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '$unread',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  )
                : null,
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ChatRoomScreen(
                    peerName: c['name'] as String,
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
