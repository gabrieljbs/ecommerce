import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileDataForm from "@/components/Forms/ProfileDataForm";

export default async function ProfileDataPage() {

    // Server protection and fetch
    const user = await auth();

    if (!user) {
        redirect("/login");
    }

    return (
        <ProfileDataForm user={{ id: user.id, name: user.name, email: user.email }} />
    );
}
