import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    image: String,
    bio: String,
    shares: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Share'
        }
    ],
    onboarded: {
        type: Boolean,
        default: false,
    },
    clusters: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cluster'
        }
    ]
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
