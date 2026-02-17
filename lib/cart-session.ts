import { cookies } from "next/headers";

export async function getCartSession() {
    const cookiesStore = await cookies();
    return cookiesStore.get("cart_session")?.value;
}