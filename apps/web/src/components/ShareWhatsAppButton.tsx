'use client';

interface ShareWhatsAppButtonProps {
  title: string;
  price: number;
}

export default function ShareWhatsAppButton({ title, price }: ShareWhatsAppButtonProps) {
  const handleShare = () => {
    const url = window.location.href;
    const text = encodeURIComponent(`Check this listing on Fududeeye: ${title} - ${price}\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <button
      id="share-whatsapp-btn"
      onClick={handleShare}
      className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
      style={{ background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.2)' }}
    >
      Share on WhatsApp
    </button>
  );
}
