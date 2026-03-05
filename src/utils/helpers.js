export function formatPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function getDiscount(price, discountPrice) {
    return Math.round(((price - discountPrice) / price) * 100);
}

export function getStarArray(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return { full, half, empty };
}
