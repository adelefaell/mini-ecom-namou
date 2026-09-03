import type { NewProduct, NewVariant } from "./schema"

type SeedVariant = Omit<NewVariant, "productId">

export interface SeedProduct {
  product: NewProduct
  variants: SeedVariant[]
}

export const seedData: SeedProduct[] = [
  {
    product: {
      slug: "classic-white-tee",
      name: "Classic White T-Shirt",
      description: "A timeless crew-neck tee in soft combed cotton. Fits true to size.",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    },
    variants: [
      { sku: "TEE-WHT-S", name: "Small", price: 19.99, stock: 50 },
      { sku: "TEE-WHT-M", name: "Medium", price: 19.99, stock: 60 },
      { sku: "TEE-WHT-L", name: "Large", price: 19.99, stock: 40 },
      { sku: "TEE-WHT-XL", name: "XL", price: 21.99, stock: 15 },
    ],
  },
  {
    product: {
      slug: "black-hoodie",
      name: "Black Hoodie",
      description: "Heavyweight fleece hoodie with a double-layered hood and ribbed cuffs.",
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
    },
    variants: [
      { sku: "HDY-BLK-S", name: "Small", price: 49.99, stock: 25 },
      { sku: "HDY-BLK-M", name: "Medium", price: 49.99, stock: 30 },
      { sku: "HDY-BLK-L", name: "Large", price: 49.99, stock: 20 },
      { sku: "HDY-BLK-XL", name: "XL", price: 54.99, stock: 8 },
    ],
  },
  {
    product: {
      slug: "slim-fit-jeans",
      name: "Slim Fit Jeans",
      description: "Stretch-denim jeans with a modern slim taper and five-pocket styling.",
      imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d",
    },
    variants: [
      { sku: "JNS-SLM-28", name: "28", price: 59.99, stock: 12 },
      { sku: "JNS-SLM-30", name: "30", price: 59.99, stock: 18 },
      { sku: "JNS-SLM-32", name: "32", price: 59.99, stock: 22 },
      { sku: "JNS-SLM-34", name: "34", price: 62.99, stock: 10 },
      { sku: "JNS-SLM-36", name: "36", price: 62.99, stock: 4 },
    ],
  },
  {
    product: {
      slug: "canvas-sneakers",
      name: "Canvas Sneakers",
      description: "Lightweight low-top sneakers with a vulcanised rubber sole.",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    },
    variants: [
      { sku: "SNK-CNV-40", name: "EU 40", price: 69.99, stock: 20 },
      { sku: "SNK-CNV-41", name: "EU 41", price: 69.99, stock: 24 },
      { sku: "SNK-CNV-42", name: "EU 42", price: 69.99, stock: 30 },
      { sku: "SNK-CNV-43", name: "EU 43", price: 72.99, stock: 16 },
      { sku: "SNK-CNV-44", name: "EU 44", price: 72.99, stock: 6 },
    ],
  },
  {
    product: {
      slug: "wool-beanie",
      name: "Wool Beanie",
      description: "Ribbed merino-wool beanie that keeps you warm without the itch.",
      imageUrl: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531",
    },
    variants: [
      { sku: "BH-Default", name: "Default", price: 24.99, stock: 100 },
    ],
  },
  {
    product: {
      slug: "leather-wallet",
      name: "Leather Wallet",
      description: "Slim bifold wallet in full-grain leather with six card slots.",
      imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93",
    },
    variants: [
      { sku: "WLT-BRN", name: "Brown", price: 39.99, stock: 45 },
      { sku: "WLT-BLK", name: "Black", price: 39.99, stock: 38 },
    ],
  },
  {
    product: {
      slug: "ceramic-mug",
      name: "Ceramic Mug",
      description: "340ml matte ceramic mug, dishwasher and microwave safe.",
      imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d",
    },
    variants: [
      { sku: "MUG-12-CRM", name: "Cream", price: 14.99, stock: 80 },
      { sku: "MUG-12-MNT", name: "Mint", price: 14.99, stock: 70 },
      { sku: "MUG-12-SND", name: "Sand", price: 14.99, stock: 65 },
    ],
  },
  {
    product: {
      slug: "desk-lamp",
      name: "Desk Lamp",
      description: "Minimal LED desk lamp with a dimmable warm-white light.",
      imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
    },
    variants: [
      { sku: "LMP-BLK", name: "Black", price: 44.99, stock: 28 },
      { sku: "LMP-WHT", name: "White", price: 44.99, stock: 32 },
      { sku: "LMP-WOD", name: "Walnut", price: 49.99, stock: 12 },
    ],
  },
  {
    product: {
      slug: "yoga-mat",
      name: "Yoga Mat",
      description: "Eco-friendly TPE mat with alignment lines and a carrying strap.",
      imageUrl: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2",
    },
    variants: [
      { sku: "YGA-6MM", name: "6mm", price: 34.99, stock: 40 },
      { sku: "YGA-8MM", name: "8mm", price: 39.99, stock: 36 },
    ],
  },
  {
    product: {
      slug: "water-bottle",
      name: "Insulated Water Bottle",
      description: "Double-wall stainless bottle that keeps drinks cold for 24h.",
      imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
    },
    variants: [
      { sku: "BT-750-SLV", name: "750ml Silver", price: 29.99, stock: 55 },
      { sku: "BT-750-GRY", name: "750ml Graphite", price: 29.99, stock: 48 },
      { sku: "BT-500-BLU", name: "500ml Blue", price: 26.99, stock: 42 },
    ],
  },
  {
    product: {
      slug: "notebook",
      name: "Hardcover Notebook",
      description: "A5 dotted notebook with 192 pages of 100gsm paper.",
      imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db",
    },
    variants: [
      { sku: "NB-A5-BLK", name: "Black", price: 16.99, stock: 90 },
      { sku: "NB-A5-NVY", name: "Navy", price: 16.99, stock: 85 },
    ],
  },
  {
    product: {
      slug: "sunglasses",
      name: "Retro Sunglasses",
      description: "Acetate frames with UV400 polarised lenses in a classic shape.",
      imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
    },
    variants: [
      { sku: "SGL-BLK", name: "Black", price: 54.99, stock: 22 },
      { sku: "SGL-TRT", name: "Tortoise", price: 54.99, stock: 18 },
      { sku: "SGL-CLR", name: "Clear", price: 57.99, stock: 12 },
    ],
  },
  {
    product: {
      slug: "backpack",
      name: "Weekender Backpack",
      description: "40L waxed-canvas backpack with a padded 16\" laptop sleeve.",
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    },
    variants: [
      { sku: "BKP-TAN", name: "Tan", price: 89.99, stock: 14 },
      { sku: "BKP-BLK", name: "Black", price: 89.99, stock: 16 },
      { sku: "BKP-OLV", name: "Olive", price: 94.99, stock: 10 },
    ],
  },
  {
    product: {
      slug: "bluetooth-speaker",
      name: "Bluetooth Speaker",
      description: "Water-resistant portable speaker with 12h battery life.",
      imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
    },
    variants: [
      { sku: "SPK-BLK", name: "Black", price: 79.99, stock: 24 },
      { sku: "SPK-GRY", name: "Grey", price: 79.99, stock: 21 },
      { sku: "SPK-NVY", name: "Navy", price: 79.99, stock: 18 },
    ],
  },
  {
    product: {
      slug: "windbreaker-jacket",
      name: "Windbreaker Jacket",
      description: "Packable ripstop windbreaker with an adjustable hood.",
      imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea",
    },
    variants: [
      { sku: "JKT-WND-S", name: "Small", price: 64.99, stock: 12 },
      { sku: "JKT-WND-M", name: "Medium", price: 64.99, stock: 20 },
      { sku: "JKT-WND-L", name: "Large", price: 64.99, stock: 18 },
      { sku: "JKT-WND-XL", name: "XL", price: 69.99, stock: 8 },
    ],
  },
]