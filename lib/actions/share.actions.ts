"use server"

import { revalidatePath } from "next/cache";
import Share from "../models/share.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Cluster from "../models/cluster.model";

interface Params {
    text: string,
    author: string,
    clusterId: string | null,
    path: string,
}

export async function createShare({
    text, author, clusterId, path
}:Params){
    try{
        connectToDB();

        const clusterIdObject = await Cluster.findOne(
        { id: clusterId },
         { _id: 1 }
        );

        const createdShare = await Share.create({
            text,
            author,
            cluster: clusterIdObject,
        });

    // Update user model
        await User.findByIdAndUpdate(author, {
            $push: {shares: createdShare._id}
        });

        if (clusterIdObject) {
      // Update Community model
        await Cluster.findByIdAndUpdate(clusterIdObject, {
         $push: { shares: createdShare._id },
        });
        }

        revalidatePath(path);
    } catch (error:any)
    {
        throw new Error(`Error creating Shares: ${error.message}`);
    }
}

export async function fetchPosts(pageNumer = 1, pageSize = 20){
    connectToDB();

    const skipAmount = (pageNumer - 1) * pageSize;

    // Get all the posts that have no parents only top head posts
    const postsQuery = Share
    .find({parentId: {$in : [null, undefined]}})
    .sort({createdAt: "desc"})
    .skip(skipAmount)
    .limit(pageSize)
    .populate({path: 'author', model:User})
    .populate({
        path: "cluster",
        model: Cluster,
    })
    .populate({
      path: 'children',
        populate: {
            path: 'author',
            model: User,
            select: "_id name parentId image"
        },
    });

    const totalPostsCount = await Share.countDocuments({
        parentId: {$in : [null, undefined]}});

    const posts = await postsQuery.exec();
    
    const isNext = totalPostsCount > skipAmount + posts.length;

    return {posts, isNext};
}

export async function fetchShareById(id: string){
    connectToDB();


    try{
        const share = await Share.findById(id)
        .populate({
            path: 'author',
            model: User,
            select: "_id id name image"
        })
        .populate({
          path: "cluster",
          model: Cluster,
          select:"_id id name image"
        })
        .populate({
                path: 'children',
                populate: [{
                path: 'author',
                model: User,
                select: "_id id name parentId image"
                },
                {
                    path: 'children',
                    model: Share,
                    populate: {
                        path:'author',
                        model: User,
                        select: "_id id name parentId image likes"
                    }
                }
            ]
        }).exec();

        return share;
    } catch (error:any)
    {
        throw new Error(`Error fetching share... ${error.message}`);
    }

}
export async function addLikeToShare(
    shareId: string, 
    userId: string,
    userInfo: string,
){
  connectToDB();
    try {
        //find the original share
        const post = await Share.findById(shareId);

        const userLikedShare = post.likes.indexOf(userInfo);

        if(userLikedShare > -1){
          post.likes.splice(userLikedShare, 1);
        }else{
          post.likes.push(JSON.stringify(userInfo));
        }

        await post.save();

    } catch (error:any) {
        console.log("Error adding a like.");
        throw new Error( `connecting to out data center to retrieve shares:${error.message} `);
    }
}

export async function addCommentToShare(
    shareId: string, 
    commentText: string,
    userId: string,
    path: string,
) {
    connectToDB();
    try {
        //find the original share
        const originalShare = await Share.findById(shareId);

        if(!originalShare)
            throw new Error("Share not found");

        const commentShare = new Share({
            text: commentText,
            author: userId,
            parentId: shareId,
        });

        const savedCommentShare = await commentShare.save();

        originalShare.children.push(savedCommentShare._id);

        await originalShare.save();

        revalidatePath(path);

    } catch (error:any) {
        console.log("Error while adding comment.");
        throw new Error( `connecting to out data center to retrieve shares:${error.message} `);
    }
}


// vvvvvv ERROR vvvvv PRONE vvvvvvv
async function fetchAllChildShares(threadId: string): Promise<any[]> {
  const childThreads = await Share.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildShares(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteShare(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the thread to be deleted (the main thread)
    const mainThread = await Share.findById(id).populate("author cluster");

    if (!mainThread) {
      throw new Error("Share not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildShares(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((share) => share._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((share) => share.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((share) => share.cluster?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.cluster?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Share.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { shares: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Cluster.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { shares: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
  connectToDB();

  try {
    const thread = await Share.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "cluster",
        model: Cluster,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Share, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image likes", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function likeComment(
  threadId: string,
  path: string
)
{
  connectToDB();

  try {
    // Find the original thread by its ID
    connectToDB();

    const updateShareLike = await Share.findByIdAndUpdate(threadId,
      {$inc: {likes: 1}},
      {new : true}
    );


    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original thread by its ID
    const originalThread = await Share.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Share({
      text: commentText,
      author: userId,
      parentId: threadId, // Set the parentId to the original thread's ID
    });

    // Save the comment thread to the database
    const savedCommentThread = await commentThread.save();

    // Add the comment thread's ID to the original thread's children array
    originalThread.children.push(savedCommentThread._id);

    // Save the updated original thread to the database
    await originalThread.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}