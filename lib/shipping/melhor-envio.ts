const BASE_URL = process.env.MELHOR_ENVIO_SANDBOX === "true"
    ? "https://sandbox.melhorenvio.com.br/api/v2/me"
    : "https://melhorenvio.com.br/api/v2/me";

export interface PackageDimensions {
    weight: number; // kg
    height: number; // cm
    width: number; // cm
    length: number; // cm
}

// Dimensões padrão de fallback (produto genérico)
const DEFAULT_PACKAGE: PackageDimensions = {
    weight: 0.3,
    height: 4,
    width: 12,
    length: 17,
};

export async function calculateShipping(
    cep: string,
    pkg: PackageDimensions = DEFAULT_PACKAGE
) {
    const response = await fetch(`${BASE_URL}/shipment/calculate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
            "Accept": "application/json",
        },
        body: JSON.stringify({
            from: { postal_code: process.env.SHIPPING_FROM_CEP || "01001-000" },
            to: { postal_code: cep },
            package: {
                height: pkg.height,
                width: pkg.width,
                length: pkg.length,
                weight: pkg.weight,
            },
        }),
        cache: "no-store",
    });

    const data = await response.json();
    console.log("MELHOR ENVIO — package:", pkg, "| response:", data);
    return data;
}
