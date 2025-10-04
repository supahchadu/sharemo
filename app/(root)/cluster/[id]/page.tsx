
import UserCard from "@/components/cards/UserCard";
import ProfileHeader from "@/components/shared/ProfileHeader";
import ShareTab from "@/components/shared/ShareTab";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { clusterTabs } from "@/constants";
import { fetchCommunityDetails } from "@/lib/actions/cluster.actions";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";

async function Page({params }) {

    const user = await currentUser();
    const userrId = await params;
    if(!user) return null;
    
    const clusterDetails = await fetchCommunityDetails(userrId.id);

    return (
        <section>
            <ProfileHeader 
                accountId ={clusterDetails.id}
                authUserId={user.id}
                name={clusterDetails.name}
                username={clusterDetails.username}
                imgUrl={clusterDetails.image}
                bio={clusterDetails.bio}
                type="Cluster"
            />

            <div className="mt-9">
                <Tabs defaultValue="shares" className="w-full">
                    <TabsList className="tab">
                        {clusterTabs.map((tab) => (
                            <TabsTrigger key={tab.label} value={tab.value} className="tab">
                                <Image 
                                src={tab.icon}
                                alt={tab.label}
                                height={24}
                                width={24}
                                className="object-contain"
                                />
                                <p className="max-sm:hidden">{tab.label}</p>
                                 {tab.label === "Shares" && (
                                    <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
                                     {clusterDetails?.shares?.length}
                                    </p>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                        <TabsContent value="shares"
                        className="w-full text-light-1">
                            <ShareTab 
                                currentUserId={user.id}
                                accountId={clusterDetails._id}
                                accountType="Cluster"
                            />
                        </TabsContent>

                        <TabsContent value="members"
                        className="w-full text-light-1">
                            <section className="mt-9 flex flex-col gap-10">
                                {clusterDetails?.members.map((members:any)=>(
                                    <UserCard 
                                        key={members.id}
                                        id={members.id}
                                        name={members.name}
                                        username={members.username}
                                        imgUrl={members.image}
                                        personType="User"
                                    />
                                ))}
                            </section>
                        </TabsContent>

                        <TabsContent value="requests"
                        className="w-full text-light-1">
                            <ShareTab 
                                currentUserId={user.id}
                                accountId={clusterDetails._id}
                                accountType="Cluster"
                            />
                        </TabsContent>
                </Tabs>
            </div>
        </section>
    );
}

export default Page;