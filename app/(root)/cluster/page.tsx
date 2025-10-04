import ClusterCard from "@/components/cards/ClusterCard";
import UserCard from "@/components/cards/UserCard";
import { fetchCommunities, fetchCommunityDetails } from "@/lib/actions/cluster.actions";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

async function Page() {

    const user = await currentUser();
    if(!user) return null;

    const userInfo = await fetchUser(user.id);
    if(!userInfo?.onboarded) redirect('/onboarding');

    // Fetch clusters
    const result = await fetchCommunities({
        searchString: '',
        pageNumber: 1,
        pageSize: 25
    })
    
    return (
        <section>
            <h1 className="head-text mb-10">
                Search
            </h1>
            <div className="mt-14 flex flex-col gap-9">
                {result.communities.length === 0 ? (
                    <p className="no-result">No Users Found</p>
                ): (
                    <>
                    {result.communities.map((cluster)=>(
                        <ClusterCard  
                            key={cluster.id}
                            id={cluster.id}
                            name={cluster.name}
                            username={cluster.username}
                            imgUrl={cluster.image}
                            bio={cluster.bio}
                            members={cluster.members}
                        />
                    ))}
                    </>
                )}
            </div>
        </section>
    )
}

export default Page;