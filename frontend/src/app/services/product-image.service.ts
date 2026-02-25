import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductImageService {
  private readonly API_HOST = `${window.location.protocol}//${window.location.hostname}:4800`;
  private readonly imagenesProductosPath = `${this.API_HOST}/imagenesProductos`;

  // Mapeo de imágenes disponibles locales (sin la extensión)
  private readonly localImages = new Set([
    'aceite',
    'agua',
    'arroz',
    'brocoli',
    'cafe',
    'cerveza',
    'cocacola',
    'croisant',
    'croquetas',
    'filete',
    'leche',
    'lechuga',
    'manzana',
    'merluza',
    'mortadela',
    'naranja',
    'pan',
    'panblanco',
    'panintegral',
    'pastaintegral',
    'pechugapollo',
    'peras',
    'platano',
    'queso',
    'salmon',
    'serrano',
    'tomate',
    'vino',
    'zanaoria',
    'zumanaranja',
    'zumo',
  ]);

  // Mapeo explícito de palabras clave en nombres de productos a archivos de imagen
  // IMPORTANTE: El orden importa - palabras más específicas y "bebidas" van primero
  // para evitar que "naranja" en "jugo de naranja" mapee a naranja.jpg en lugar de zumo.jpg
  private readonly keywordToImage: Record<string, string> = {
    // Bebidas primero (más específicas)
    zumo: 'zumo',
    jugo: 'zumo',
    zumanaranja: 'zumanaranja',
    cerveza: 'cerveza',
    vino: 'vino',
    alcohol: 'vino',
    cafe: 'cafe',
    café: 'cafe',
    natural: 'zumo',

    // Lácteos
    leche: 'leche',
    queso: 'queso',

    // Agua
    agua: 'agua',
    mineral: 'agua',

    // Carnes y pescados
    bacalao: 'merluza',
    pescado: 'merluza',
    merluza: 'merluza',
    salmon: 'salmon',
    salmón: 'salmon',
    jamon: 'serrano',
    jamón: 'serrano',
    serrano: 'serrano',
    embutido: 'serrano',
    mortadela: 'mortadela',
    filete: 'filete',
    carne: 'filete',
    pollo: 'pechugapollo',
    pechuga: 'pechugapollo',

    // Frutas y verduras
    brocoli: 'brocoli',
    brócoli: 'brocoli',
    zanahoria: 'zanaoria',
    zanahorie: 'zanaoria',
    manzana: 'manzana',
    peras: 'peras',
    pera: 'peras',
    platano: 'platano',
    plátano: 'platano',
    naranja: 'naranja',
    tomate: 'tomate',
    lechuga: 'lechuga',

    // Otros
    arroz: 'arroz',
    pan: 'pan',
    croisant: 'croisant',
    integral: 'panintegral',
    pastaintegral: 'pastaintegral',
    aceite: 'aceite',
    croqueta: 'croquetas',
  };

  // Usar una imagen local existente como fallback para evitar 404 si falta default.jpg
  private readonly defaultImage = `${this.imagenesProductosPath}/leche.jpg`;

  constructor() {}

  /**
   * Normaliza el nombre del producto para buscar imagen local
   */
  normalizeProductName(name: string): string {
    return String(name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
      .replace(/\s+/g, '') // Elimina espacios
      .trim();
  }

  /**
   * Obtiene la URL de la imagen local si existe
   * Estrategia:
   * 1. Intenta match directo con el nombre normalizado
   * 2. Busca palabras clave del producto en el mapa keywordToImage
   * 3. Retorna null si no encuentra coincidencia
   */
  getLocalImageUrl(productName: string): string | null {
    if (!productName) return null;

    const normalized = this.normalizeProductName(productName);

    // Intento 1: Match directo
    if (this.localImages.has(normalized)) {
      return `${this.imagenesProductosPath}/${normalized}.jpg`;
    }

    // Intento 2: Buscar palabras clave en el nombre del producto
    const lowerName = productName.toLowerCase();
    for (const [keyword, imageName] of Object.entries(this.keywordToImage)) {
      if (lowerName.includes(keyword) && this.localImages.has(imageName)) {
        return `${this.imagenesProductosPath}/${imageName}.jpg`;
      }
    }

    return null;
  }

  /**
   * Obtiene la imagen del producto con fallback inteligente
   * Usa mapeo de palabras clave para encontrar imagen correcta
   */
  getProductImage(productName: string): string {
    // Usar únicamente imágenes locales por nombre para garantizar
    // correspondencia entre producto e imagen. Si no existe local,
    // devolver la imagen por defecto.
    const localUrl = this.getLocalImageUrl(productName);
    if (localUrl) {
      return localUrl;
    }

    console.warn(
      `[ProductImageService] No local image found for "${productName}", using default`,
    );
    return this.defaultImage;
  }

  /**
   * Verifica si existe una imagen local para el producto
   */
  hasLocalImage(productName: string): boolean {
    const normalized = this.normalizeProductName(productName);
    return this.localImages.has(normalized);
  }
}
