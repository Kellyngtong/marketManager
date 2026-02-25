/**
 * Script para probar el mapeo de imágenes de productos
 * Simula el comportamiento del ProductImageService
 */

// Mapeo de imágenes disponibles locales (sin la extensión)
const localImages = new Set([
  "aceite",
  "agua",
  "arroz",
  "cocacola",
  "croquetas",
  "filete",
  "leche",
  "lechuga",
  "manzana",
  "merluza",
  "naranja",
  "panblanco",
  "panintegral",
  "pastaintegral",
  "pechugapollo",
  "platano",
  "queso",
  "salmon",
  "serrano",
  "tomate",
  "vino",
  "zanaoria",
  "zumo",
]);

// Mapeo explícito de palabras clave en nombres de productos a archivos de imagen
const keywordToImage: Record<string, string> = {
  agua: "agua",
  mineral: "agua",
  leche: "leche",
  queso: "queso",
  tomate: "tomate",
  lechuga: "lechuga",
  zanahoria: "zanaoria",
  zanahorie: "zanaoria",
  manzana: "manzana",
  platano: "platano",
  plátano: "platano",
  naranja: "naranja",
  arroz: "arroz",
  pan: "panblanco",
  integral: "panintegral",
  pastaintegral: "pastaintegral",
  filete: "filete",
  carne: "filete",
  pollo: "pechugapollo",
  pechuga: "pechugapollo",
  salmon: "salmon",
  salmón: "salmon",
  bacalao: "merluza",
  pescado: "merluza",
  merluza: "merluza",
  jamon: "serrano",
  jamón: "serrano",
  serrano: "serrano",
  embutido: "serrano",
  mortadela: "serrano",
  aceite: "aceite",
  cerveza: "cocacola",
  vino: "vino",
  alcohol: "vino",
  zumo: "zumo",
  jugo: "zumo",
  natural: "zumo",
  cafe: "zumo",
  café: "zumo",
  croqueta: "croquetas",
};

function normalizeProductName(name: string): string {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
    .replace(/\s+/g, "") // Elimina espacios
    .trim();
}

function getLocalImageUrl(productName: string): string | null {
  if (!productName) return null;

  const normalized = normalizeProductName(productName);

  // Intento 1: Match directo
  if (localImages.has(normalized)) {
    return `/imagenesProductos/${normalized}.jpg`;
  }

  // Intento 2: Buscar palabras clave en el nombre del producto
  const lowerName = productName.toLowerCase();
  for (const [keyword, imageName] of Object.entries(keywordToImage)) {
    if (lowerName.includes(keyword) && localImages.has(imageName)) {
      return `/imagenesProductos/${imageName}.jpg`;
    }
  }

  return null;
}

// Productos de prueba según se mencionaron en el chat
const testProducts = [
  "Agua Mineral 1.5L",
  "Leche Desnatada 1L",
  "Bacalao 600g",
  "Jugo Naranja Natural 1L",
  "Pan Blanco 500g",
  "Pan Integral 500g",
  "Pechuga Pollo 500g",
  "Jamón Serrano 200g",
  "Queso Fresco 250g",
  "Arroz Largo 1kg",
  "Aceite Oliva 1L",
  "Tomate 1kg",
  "Lechuga",
  "Zanahoria 500g",
  "Manzana Roja 1kg",
  "Plátano 1kg",
  "Naranja 1kg",
  "Vino Tinto 750ml",
  "Cerveza Lager 330ml",
  "Croquetas Jamón 250g",
  "Filete Ternera 500g",
  "Salmón 400g",
  "Pasta Integral 500g",
];

console.log("=== TEST DE MAPEO DE IMÁGENES ===\n");
console.log("Productos de prueba:");
console.log("─".repeat(100));

for (const product of testProducts) {
  const imageUrl = getLocalImageUrl(product);
  const status = imageUrl ? "✅" : "❌";
  console.log(
    `${status} ${product.padEnd(40)} → ${imageUrl || "DEFAULT (leche.jpg)"}`,
  );
}

console.log("─".repeat(100));

// Contar éxitos y fallos
const successful = testProducts.filter(
  (p) => getLocalImageUrl(p) !== null,
).length;
const failed = testProducts.length - successful;

console.log(`\n📊 RESULTADOS:`);
console.log(`   ✅ Éxitos: ${successful}/${testProducts.length}`);
console.log(`   ❌ Fallos: ${failed}/${testProducts.length}`);
console.log(
  `   📈 Tasa de éxito: ${((successful / testProducts.length) * 100).toFixed(2)}%`,
);
