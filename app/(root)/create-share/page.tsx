import PostShare from "@/components/forms/PostShare";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function Page() {

    const user = await currentUser();

    if(!user) return redirect('/sign-in');

    const userInfo = await fetchUser(user.id);

    if(!userInfo?.onboarded) redirect('/onboarding');
    const parsedId = JSON.parse(JSON.stringify(userInfo._id));

    return (
        <>
            <h1 className="head-text">Create Message</h1>
            <PostShare userId={parsedId} />
        </>
    )
}

export default Page;