import 'package:flutter/material.dart';
import '../models/listing_model.dart';
import '../theme/app_theme.dart';
import 'checkout_screen.dart';

class ChatRoomScreen extends StatefulWidget {
  final String peerName;
  final String? peerPhone;
  final ListingModel? attachedListing;

  const ChatRoomScreen({
    super.key,
    required this.peerName,
    this.peerPhone,
    this.attachedListing,
  });

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  final TextEditingController _msgController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];

  @override
  void initState() {
    super.initState();
    _messages.addAll([
      {
        'sender': 'them',
        'text': 'Asc walaal! Ku soo dhawoow ${widget.peerName}. Sideen kuu caawin karnaa maanta?',
        'time': '10:30 AM',
      },
      if (widget.attachedListing != null)
        {
          'sender': 'them',
          'text': 'Waxaad ka hadlaysaa alaabtan: "${widget.attachedListing!.title}". Weli waa la heli karaa.',
          'time': '10:31 AM',
        },
    ]);
  }

  @override
  void dispose() {
    _msgController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final txt = _msgController.text.trim();
    if (txt.isEmpty) return;

    setState(() {
      _messages.add({
        'sender': 'me',
        'text': txt,
        'time': 'Hadda',
      });
      _msgController.clear();
    });

    // Auto simulated reply from seller
    Future.delayed(const Duration(milliseconds: 1000), () {
      if (mounted) {
        setState(() {
          _messages.add({
            'sender': 'them',
            'text': 'Mahadsanid! Farriintaadu waa na soo gaartay. Waxaan kugu soo jawaabaynaa daqiiqado gudahood.',
            'time': 'Hadda',
          });
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppTheme.brand.withOpacity(0.2),
              child: Text(widget.peerName[0], style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.brand)),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.peerName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  const Row(
                    children: [
                      CircleAvatar(radius: 3, backgroundColor: AppTheme.success),
                      SizedBox(width: 4),
                      Text('Online Hadda', style: TextStyle(fontSize: 10, color: AppTheme.success)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.phone_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Wacaya: ${widget.peerPhone ?? "+252 90 770 0000"}')),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Attached Listing Banner if opened from a product
          if (widget.attachedListing != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkCard : Colors.white,
                border: Border(bottom: BorderSide(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder)),
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      widget.attachedListing!.firstImageUrl,
                      width: 44,
                      height: 44,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(widget.attachedListing!.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        Text('\$${widget.attachedListing!.price.toStringAsFixed(0)}', style: const TextStyle(fontSize: 12, color: AppTheme.brandLight, fontWeight: FontWeight.w800)),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => CheckoutScreen(listing: widget.attachedListing!)),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.brand,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    child: const Text('Dalbo Hadda', style: TextStyle(fontSize: 11)),
                  ),
                ],
              ),
            ),

          // Messages List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, idx) {
                final m = _messages[idx];
                final isMe = m['sender'] == 'me';

                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: isMe
                          ? AppTheme.brand
                          : (isDark ? AppTheme.darkCard : Colors.white),
                      borderRadius: BorderRadius.circular(16).copyWith(
                        bottomRight: isMe ? const Radius.circular(2) : const Radius.circular(16),
                        bottomLeft: !isMe ? const Radius.circular(2) : const Radius.circular(16),
                      ),
                      border: Border.all(
                        color: isMe
                            ? Colors.transparent
                            : (isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(
                          m['text'] as String,
                          style: TextStyle(
                            fontSize: 13,
                            color: isMe
                                ? Colors.white
                                : (isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          m['time'] as String,
                          style: TextStyle(
                            fontSize: 10,
                            color: isMe ? Colors.white70 : (isDark ? AppTheme.darkTextMuted : AppTheme.lightTextMuted),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Message input bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkCard : Colors.white,
              border: Border(top: BorderSide(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _msgController,
                      decoration: const InputDecoration(
                        hintText: 'Qor farriintaada...',
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send_rounded, color: AppTheme.brand),
                    onPressed: _sendMessage,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
