import NavBar from "../Nav/navBar";
import CartButton from "./CartButton";
import Link from "next/link";
import Image from "next/image";
import Session from "./Session";
import { auth } from "@/lib/auth";

export default async function Header() {
    const user = await auth();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-black/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800">
            <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="Logo Ecommerce"
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                        />
                    </Link>
                    <NavBar />
                </div>

                <div className="flex items-center gap-4">
                    <Session user={user} />
                    <CartButton />
                </div>
            </div>
        </header>
    );
}   