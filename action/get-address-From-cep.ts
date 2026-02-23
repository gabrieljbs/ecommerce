export async function getAddressFromCep(cep: string) {
    if (!cep) return null;
    try {
        const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}