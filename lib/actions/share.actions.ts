"use server"

import { revalidatePath } from "next/cache";
import Share from "../models/share.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { threadId } from "worker_threads";

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

        const createShare = await Share.create({
            text,
            author,
            cluster: null,
        });

    // Update user model
        await User.findByIdAndUpdate(author, {
            $push: {shares: createShare._id}
        });

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
    .populate({path: 'children',
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
                        select: "_id id name parentId image"
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