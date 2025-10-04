import { addLikeToShare, fetchShareById } from "@/lib/actions/share.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Page = async ({ params } : {id: string} ) => {
    
    const { id } = await params;

    if(!id) return null;

    const user = await currentUser();
    if(!user) return null;

    const share = await fetchShareById(id);
    const userInfo = await fetchUser(user.id)

    const handleLikes = async () => {
            await addLikeToShare(share._id, userInfo._id);
        }
    
    handleLikes();
    redirect('/');

    return(
        <></>
    );
}

export default Page;