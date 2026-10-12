export interface SheinSubItem {
  name: string;
  image?: string;
  isViewAll?: boolean;
  slug?: string;
  query?: string;
}

export interface SheinSection {
  title: string;
  hasIcon?: boolean;
  items: SheinSubItem[];
}

export interface SheinCategory {
  id: string;
  name: string;
  slug: string;
  badge?: string;
  sections: SheinSection[];
}

export const SHEIN_CATEGORIES: SheinCategory[] = [
  {
    id: 'new-in',
    name: 'New In',
    slug: 'new-in',
    badge: 'HOT',
    sections: [
      {
        title: "NEW IN WOMEN'S CLOTHING",
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'fashion' },
          { name: 'Tops', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'tops' },
          { name: 'T-shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 't-shirts' },
          { name: 'Blouses', image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'blouses' },
          { name: 'Tank Tops & Camis', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'tank tops' },
          { name: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'dresses' },
          { name: 'Long Dresses', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'long dresses' },
          { name: 'Knitwear', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'knitwear' },
          { name: 'Sweaters', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'sweaters' },
          { name: 'Bottoms', image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'bottoms' },
          { name: 'Pants', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'pants' },
          { name: 'Outerwear', image: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'outerwear' },
          { name: 'Winter Coats', image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'coats' },
          { name: 'Denim', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'denim' },
          { name: 'Co-ords', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'co-ords' },
        ],
      },
      {
        title: 'NEW IN CURVE CLOTHING',
        items: [
          { name: 'View All', isViewAll: true, slug: 'fashion' },
          { name: 'Tops', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve tops' },
          { name: 'Dresses', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve dresses' },
          { name: 'Bottoms', image: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve bottoms' },
          { name: 'Blouses', image: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve blouses' },
          { name: 'Sweaters', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve sweaters' },
          { name: 'Denim', image: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve denim' },
          { name: 'Co-ords', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve sets' },
          { name: 'Sweatshirts', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'sweatshirts' },
          { name: 'Jackets & Coats', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'jackets' },
          { name: 'Jumpsuits', image: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'jumpsuits' },
          { name: 'Suits', image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'suits' },
          { name: 'Party Wear', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'party wear' },
        ],
      },
      {
        title: 'OFFICIALLY LICENSED COLLABS',
        items: [
          { name: 'Fansphere', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'fansphere' },
          { name: 'Harry Potter', image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'harry potter' },
          { name: 'Rick and Morty', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'rick and morty' },
          { name: 'THE POWERPUFF GIRLS', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'powerpuff' },
          { name: 'Care Bears', image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'care bears' },
          { name: 'TOM and JERRY', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'tom and jerry' },
          { name: 'Looney Tunes', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'looney tunes' },
        ],
      },
    ],
  },
  {
    id: 'est-3-workdays',
    name: 'Est. 3 Workdays',
    slug: 'fast-shipping',
    badge: 'FAST',
    sections: [
      {
        title: 'EXPRESS DELIVERY ITEMS (3 DAYS)',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'fast-shipping' },
          { name: 'Best Sellers', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'bestseller' },
          { name: 'Smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02543?w=160&h=160&fit=crop&q=80', slug: 'electronics' },
          { name: 'Heels & Shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'shoes' },
          { name: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&h=160&fit=crop&q=80', slug: 'wholesale', query: 'watches' },
          { name: 'Beauty', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=160&h=160&fit=crop&q=80', slug: 'health-beauty' },
          { name: 'Handbags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'bags' },
        ],
      },
    ],
  },
  {
    id: 'women-clothing',
    name: 'Women Clothing',
    slug: 'fashion',
    sections: [
      {
        title: "WOMEN'S APPAREL & OUTFITS",
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'fashion' },
          { name: 'Tops', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'tops' },
          { name: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'dresses' },
          { name: 'Dirac & Hijabs', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'dirac' },
          { name: 'Blouses', image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'blouses' },
          { name: 'Pants & Skirts', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'skirts' },
          { name: 'Denim', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'denim' },
          { name: 'Co-ords', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'co-ords' },
          { name: 'Sweaters', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'sweaters' },
          { name: 'Jackets', image: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'jackets' },
        ],
      },
      {
        title: 'PARTY & OCCASION WEAR',
        items: [
          { name: 'View All', isViewAll: true, slug: 'fashion' },
          { name: 'Evening Dresses', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'evening' },
          { name: 'Wedding Guest', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'wedding' },
          { name: 'Silk & Satin', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'satin' },
        ],
      },
    ],
  },
  {
    id: 'beachwear',
    name: 'Beachwear',
    slug: 'beachwear',
    sections: [
      {
        title: 'BEACH & RESORT WEAR',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'fashion' },
          { name: 'Cover Ups', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'beach' },
          { name: 'Maxi Dresses', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'maxi' },
          { name: 'Sun Hats', image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'hats' },
          { name: 'Sandals', image: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'sandals' },
        ],
      },
    ],
  },
  {
    id: 'curve',
    name: 'Curve',
    slug: 'curve',
    badge: 'PLUS',
    sections: [
      {
        title: 'SHOP CURVE & PLUS SIZE',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'fashion' },
          { name: 'Tops', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve tops' },
          { name: 'Dresses', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve dresses' },
          { name: 'Jeans', image: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve jeans' },
          { name: 'Outerwear', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve jackets' },
          { name: 'Co-ords', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'curve sets' },
        ],
      },
    ],
  },
  {
    id: 'kids',
    name: 'Kids',
    slug: 'kids',
    sections: [
      {
        title: 'SHOP BY CATEGORY (KIDS)',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'kids' },
          { name: 'New In', image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'new' },
          { name: 'Top Rated', image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'top' },
          { name: 'Kids Educational Toys', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'educational' },
          { name: 'Kids Dolls & Stuffed Toys', image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'dolls' },
          { name: 'Hobbies, Parties', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'party' },
          { name: 'Kids Arts & Crafts', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'crafts' },
          { name: 'Games & Entertainment', image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'games' },
          { name: 'Kids Outdoor Play', image: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'outdoor' },
          { name: 'Kids Block Toys', image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'blocks' },
          { name: 'Kids Vehicle Toys', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'vehicles' },
        ],
      },
      {
        title: 'KIDS EDUCATIONAL TOYS',
        items: [
          { name: 'View All', isViewAll: true, slug: 'kids' },
          { name: 'Reading & Writing', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'reading' },
          { name: 'Preschool Toys', image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'preschool' },
          { name: 'Interactive Games', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'interactive' },
          { name: 'Electronic Learning', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'electronic' },
          { name: 'Kids Puzzles', image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'puzzles' },
          { name: 'Shape Recognition', image: 'https://images.unsplash.com/photo-1500995617113-cf789362a3e1?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'shapes' },
          { name: 'STEM Toys', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'stem' },
        ],
      },
      {
        title: 'KIDS DOLLS & STUFFED TOYS',
        items: [
          { name: 'View All', isViewAll: true, slug: 'kids' },
          { name: 'Plush & Stuffed', image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'plush' },
          { name: 'Doll Toys', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'dolls' },
          { name: 'Puppets & Theaters', image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=160&h=160&fit=crop&q=80', slug: 'kids', query: 'puppets' },
        ],
      },
    ],
  },
  {
    id: 'men-clothing',
    name: 'Men Clothing',
    slug: 'men',
    sections: [
      {
        title: "MEN'S APPAREL & ESSENTIALS",
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'fashion' },
          { name: 'T-shirts & Polos', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'men shirts' },
          { name: 'Shirts & Khamiis', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'khamiis' },
          { name: 'Hoodies & Sweats', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'hoodies' },
          { name: 'Jackets & Coats', image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'men jackets' },
          { name: 'Pants & Chinos', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'chinos' },
          { name: 'Jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'men jeans' },
          { name: 'Suits & Blazers', image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'suits' },
          { name: 'Shoes & Sneakers', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'sneakers' },
        ],
      },
    ],
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    slug: 'real-estate',
    sections: [
      {
        title: 'HOME ESSENTIALS & DECOR',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'real-estate' },
          { name: 'Bedding & Pillows', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=160&h=160&fit=crop&q=80', slug: 'real-estate', query: 'bedding' },
          { name: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=160&h=160&fit=crop&q=80', slug: 'real-estate', query: 'kitchen' },
          { name: 'Home Decor', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=160&h=160&fit=crop&q=80', slug: 'real-estate', query: 'decor' },
          { name: 'Lighting & Lamps', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=160&h=160&fit=crop&q=80', slug: 'real-estate', query: 'lighting' },
          { name: 'Storage & Boxes', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=160&h=160&fit=crop&q=80', slug: 'real-estate', query: 'storage' },
        ],
      },
    ],
  },
  {
    id: 'underwear-sleepwear',
    name: 'Underwear & Sleepwear',
    slug: 'underwear',
    sections: [
      {
        title: 'LOUNGEWEAR & SLEEPWEAR',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'fashion' },
          { name: 'Pajama Sets', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'pajamas' },
          { name: 'Robes', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'robes' },
          { name: 'Loungewear', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'loungewear' },
        ],
      },
    ],
  },
  {
    id: 'shoes',
    name: 'Shoes',
    slug: 'shoes',
    sections: [
      {
        title: 'FOOTWEAR FOR ALL',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'fashion' },
          { name: 'Heels & Pumps', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'heels' },
          { name: 'Sneakers', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'sneakers' },
          { name: 'Sandals & Slides', image: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'sandals' },
          { name: 'Boots', image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'boots' },
          { name: "Men's Dress Shoes", image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'dress shoes' },
        ],
      },
    ],
  },
  {
    id: 'jewelry-accessories',
    name: 'Jewelry & Accessories',
    slug: 'wholesale',
    sections: [
      {
        title: 'JEWELRY & WATCHES',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'wholesale' },
          { name: 'Necklaces & Silsilad', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=160&h=160&fit=crop&q=80', slug: 'wholesale', query: 'necklace' },
          { name: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&h=160&fit=crop&q=80', slug: 'wholesale', query: 'watches' },
          { name: 'Earrings & Hilqado', image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=160&h=160&fit=crop&q=80', slug: 'wholesale', query: 'earrings' },
          { name: 'Rings & Fargallo', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=160&h=160&fit=crop&q=80', slug: 'wholesale', query: 'rings' },
          { name: 'Handbags & Clutches', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=160&h=160&fit=crop&q=80', slug: 'wholesale', query: 'bags' },
        ],
      },
    ],
  },
  {
    id: 'beauty-health',
    name: 'Beauty & Health',
    slug: 'health-beauty',
    sections: [
      {
        title: 'BEAUTY, PERFUMES & HEALTH',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'health-beauty' },
          { name: 'Perfumes & Oud', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=160&h=160&fit=crop&q=80', slug: 'health-beauty', query: 'perfume' },
          { name: 'Skincare', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=160&h=160&fit=crop&q=80', slug: 'health-beauty', query: 'skincare' },
          { name: 'Makeup', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=160&h=160&fit=crop&q=80', slug: 'health-beauty', query: 'makeup' },
          { name: 'Hair Care & Oils', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=160&h=160&fit=crop&q=80', slug: 'health-beauty', query: 'hair' },
          { name: 'Personal Care', image: 'https://images.unsplash.com/photo-1608248597359-28c460d3d463?w=160&h=160&fit=crop&q=80', slug: 'health-beauty', query: 'care' },
        ],
      },
    ],
  },
  {
    id: 'home-textiles',
    name: 'Home Textiles',
    slug: 'home-textiles',
    sections: [
      {
        title: 'TEXTILES & CURTAINS',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'real-estate' },
          { name: 'Curtains & Daaqadaha', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=160&h=160&fit=crop&q=80', slug: 'real-estate', query: 'curtains' },
          { name: 'Rugs & Gogol', image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=160&h=160&fit=crop&q=80', slug: 'real-estate', query: 'rugs' },
          { name: 'Towels & Tuwaalada', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=160&h=160&fit=crop&q=80', slug: 'real-estate', query: 'towels' },
        ],
      },
    ],
  },
  {
    id: 'cell-phones-accessories',
    name: 'Cell Phones & Accessories',
    slug: 'electronics',
    sections: [
      {
        title: 'PHONES, TABLETS & ACCESSORIES',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'electronics' },
          { name: 'iPhone & iOS', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02543?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'iphone' },
          { name: 'Samsung Galaxy', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'samsung' },
          { name: 'Smart Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'smartwatch' },
          { name: 'Airpods & Earbuds', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'airpods' },
          { name: 'Powerbanks', image: 'https://images.unsplash.com/photo-1609592424368-80e927598ff7?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'powerbank' },
          { name: 'Phone Cases', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'cases' },
          { name: 'Chargers & Cables', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'chargers' },
        ],
      },
    ],
  },
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    sections: [
      {
        title: 'CONSUMER ELECTRONICS & COMPUTERS',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'electronics' },
          { name: 'Laptops & MacBooks', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'laptop' },
          { name: 'Speakers & Sound', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'speaker' },
          { name: 'CCTV & Security', image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'cctv' },
          { name: 'Gaming & Consoles', image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=160&h=160&fit=crop&q=80', slug: 'electronics', query: 'gaming' },
        ],
      },
    ],
  },
  {
    id: 'sports-outdoor',
    name: 'Sports & Outdoor',
    slug: 'sports',
    sections: [
      {
        title: 'SPORTS GEAR & FITNESS',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'fashion' },
          { name: 'Gym & Fitness', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'gym' },
          { name: 'Sportswear', image: 'https://images.unsplash.com/photo-1483721074577-0c17bc44983a?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'sportswear' },
          { name: 'Water Bottles', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=160&h=160&fit=crop&q=80', slug: 'fashion', query: 'bottle' },
        ],
      },
    ],
  },
  {
    id: 'automotive',
    name: 'Automotive & Vehicles',
    slug: 'vehicles',
    sections: [
      {
        title: 'VEHICLES & CAR ACCESSORIES',
        hasIcon: true,
        items: [
          { name: 'View All', isViewAll: true, slug: 'vehicles' },
          { name: 'Toyota Land Cruiser', image: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=160&h=160&fit=crop&q=80', slug: 'vehicles', query: 'land cruiser' },
          { name: 'Sedans & Vitz', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=160&h=160&fit=crop&q=80', slug: 'vehicles', query: 'vitz' },
          { name: 'Bajaaj & Motorcycles', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=160&h=160&fit=crop&q=80', slug: 'vehicles', query: 'bajaaj' },
          { name: 'Car Accessories', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=160&h=160&fit=crop&q=80', slug: 'vehicles', query: 'car accessories' },
        ],
      },
    ],
  },
];
