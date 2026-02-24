const ORIGINAL_PRICES_KEY = 'marketing_offer_original_prices_v1';

const toPositiveNumber = (value: any): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const roundPrice = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const isOfferProduct = (product: any): boolean => {
  const offerValue = product?.oferta;
  if (typeof offerValue === 'boolean') {
    return offerValue;
  }
  if (typeof offerValue === 'number') {
    return offerValue === 1;
  }

  const normalized = String(offerValue || '')
    .trim()
    .toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'si' || normalized === 'sí';
};

export const getOriginalPricesMap = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(ORIGINAL_PRICES_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getBaseOriginalPrice = (
  product: any,
  originalPricesMap?: Record<string, number>,
): number => {
  const explicitOriginal = toPositiveNumber(
    product?.precio_original ??
      product?.original_price ??
      product?.originalPrice ??
      product?.precioAnterior,
  );

  const articleId = String(product?.idarticulo ?? product?.id ?? '').trim();
  const storedOriginal = articleId
    ? toPositiveNumber((originalPricesMap || {})[articleId])
    : 0;

  const currentPrice = toPositiveNumber(product?.precio_venta ?? product?.price);
  const original = Math.max(explicitOriginal, storedOriginal);

  return original > currentPrice ? original : 0;
};

export const getOfferDiscountPercent = (
  product: any,
  originalPricesMap?: Record<string, number>,
): number => {
  const currentPrice = toPositiveNumber(product?.precio_venta ?? product?.price);
  const original = getBaseOriginalPrice(product, originalPricesMap);

  if (!original || currentPrice <= 0 || currentPrice >= original) {
    return 0;
  }

  const discount = ((original - currentPrice) / original) * 100;
  return Math.max(1, Math.round(discount));
};

export const getPremiumUnitPrice = (
  product: any,
  originalPricesMap?: Record<string, number>,
): number => {
  const currentPrice = toPositiveNumber(product?.precio_venta ?? product?.price);
  if (!currentPrice) {
    return 0;
  }

  if (isOfferProduct(product)) {
    const original = getBaseOriginalPrice(product, originalPricesMap);
    const baseDiscount = getOfferDiscountPercent(product, originalPricesMap);

    if (original > 0 && baseDiscount > 0) {
      const totalDiscountPercent = Math.min(baseDiscount + 10, 95);
      return roundPrice(original * (1 - totalDiscountPercent / 100));
    }

    return roundPrice(currentPrice * 0.9);
  }

  return roundPrice(currentPrice * 0.95);
};
