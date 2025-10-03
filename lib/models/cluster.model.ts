import mongoose, { mongo } from 'mongoose';

const clusterSchema = new mongoose.Schema({
    id: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    image: String,
    bio: String,
    createdBy:{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    shares: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Share'
        }
    ],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

const Cluster = mongoose.models.Cluster || mongoose.model('Cluster', clusterSchema);

export default Cluster;
