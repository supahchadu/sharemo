import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ShareCard from "../cards/ShareCard";
import { fetchCommunityPosts } from "@/lib/actions/cluster.actions";

interface Props{
    currentUserId: string;
    accountId: string;
    accountType: string;
}


const ShareTab = async ({currentUserId, accountId, accountType}:Props) => {
    // fetch all profile shares
    let result :any;

    if(accountType === "Cluster")
    {
        result = await fetchCommunityPosts(accountId);

    } else{
        result = await fetchUserPosts(accountId);
    }
    
   if(!result) redirect('/');

    return (
        <section className="mt-9 flex flex-col gap-10">
            {result.shares.map((childItem:any)=> (
                 <ShareCard 
                    key={childItem._id}
                    id={childItem._id}
                    currentUserId={currentUserId}
                    parentId={childItem.parentId}
                    content={childItem.text}
                    author={accountType==="User"
                        ? {name: result.name, image: result.image, id: result.id}
                        : {name: childItem.author.name, image: childItem.author.image, id: childItem.author.id}
                    }
                    cluster={childItem.cluster}
                    createdAt={childItem.createdAt}
                    likes={childItem.likes}
                    comments={childItem.children}
                />
            ))}
        </section>
    )
}

export default ShareTab;