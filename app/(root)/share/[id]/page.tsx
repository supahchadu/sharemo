import ShareCard from "@/components/cards/ShareCard";
import Comment from "@/components/forms/Comment";
import { fetchShareById } from "@/lib/actions/share.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


const Page = async ({ params } ) => {

    const { id } = await params;

    if(!id) return null;

    const user = await currentUser();
    if(!user) return null;

    const userInfo = await fetchUser(user.id);

    if(!userInfo?.onboarded)
        redirect('/onboarding');

    const share = await fetchShareById(id);

    return(
        <section className="relative">
        <div>
            <ShareCard 
                key={share._id}
                id={share._id}
                currentUserId={user?.id || ""}
                parentId={share.parentId}
                content={share.text}
                author={share.author}
                cluster={share.cluster}
                createdAt={share.createdAt}
                comments={share.children}
            />

            <div className="mt-7">
                <Comment 
                    shareId={share.id}
                    currentUserImg={userInfo.image}
                    currentUserId={JSON.stringify(userInfo._id)}
                />
            </div>
            <div className="mt-10">
                {share.children.map((childItem: any) => (
                    <ShareCard 
                    key={childItem._id}
                    id={childItem._id}
                    currentUserId={childItem?.id || ""}
                    parentId={childItem.parentId}
                    content={childItem.text}
                    author={childItem.author}
                    cluster={childItem.cluster}
                    createdAt={childItem.createdAt}
                    comments={childItem.children}
                    isComment
                    />
                ))}
            </div>
        </div>
        </section>
    );
}

export default Page;