import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema({
    text: { type: String, required: true},
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    cluster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cluster',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    likes: [
        {
            type: String,
        }
    ],
    parentId: {
        type: String
    },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Share'
        }
    ]
});

const Share = mongoose.models.Share || mongoose.model('Share', shareSchema);

export default Share;