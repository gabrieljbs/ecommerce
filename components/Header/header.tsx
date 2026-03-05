import NavBar from "../Nav/navBar";
import CartButton from "./CartButton";
import Link from "next/link";
import Image from "next/image";
import Session from "./Session";
import { auth } from "@/lib/auth";
import logoImg from "@/public/logo.png";

export default async function Header() {
    const user = await auth();

    return (
        <header className="sticky top-0 z-50 w-full bg-[#ebebeb] border-b border-zinc-200 shadow-sm transition-all">
            <div className="container mx-auto px-4 h-20 md:h-24 flex justify-between items-center gap-4">

                {/* Logo Section */}
                <div className="flex items-center flex-1">
                    <Link href="/" className="flex items-center shrink-0">
                        <Image
                            src={logoImg}
                            alt="Logo Minimalist"
                            className="h-14 md:h-20 w-auto object-contain mix-blend-multiply opacity-90"
                            priority
                        />

                    </Link>
                </div>

                {/* Desktop Nav Section */}
                {/* <div className="hidden md:flex flex-1 justify-center">
                    <NavBar />
                </div> */}

                {/* Actions Section */}
                <div className="flex items-center justify-end flex-1 gap-2 md:gap-4">
                    <Session user={user} />
                    <div className="w-px h-6 bg-zinc-200 hidden md:block"></div>
                    <CartButton />
                </div>
            </div>
        </header>
    );
}   