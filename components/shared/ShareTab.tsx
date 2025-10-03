import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ShareCard from "../cards/ShareCard";

interface Props{
    currentUserId: string;
    accountId: string;
    accountType: string;
}


const ShareTab = async ({currentUserId, accountId, accountType}:Props) => {
    // fetch all profile shares
    let result = await fetchUserPosts(accountId);
    if(!result) redirect('/');

    return (
        <section className="mt-9 flex flex-col gap-10">
            {result.shares.map((childItem)=> (
                 <ShareCard 
                    key={childItem._id}
                    id={childItem._id}
                    currentUserId={currentUserId}
                    parentId={childItem.parentId}
                    content={childItem.text}
                    author={accountType==='User' 
                        ? {name: result.name, image: result.image, id: result.id}
                        : {name: childItem.author.name, image: childItem.image, id: childItem.author.id}
                    }
                    cluster={childItem.cluster}
                    createdAt={childItem.createdAt}
                    comments={childItem.children}
                    isComment
                />
            ))}
        </section>
    )
}

export default ShareTab;