const { default: mongoose } = require('mongoose');
const User = require('../model/User');
const { sendEmail } = require('../middlewere/email');

const getAllUser = async (req, res) => {
    const userList = await User.find().select('-password').exec();
    if (!userList) return res.sendStatus(204).json({ 'message': 'No users found' });
    res.json(userList);
}
const getUser = async (req, res) => {
    if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json({ 'message': `Correct ID parameter is required` });
    }
    const user = await User.findById({ _id: req.params.id }).select('-password').exec();
    if (!user) return res.sendStatus(204).json({ 'message': 'No user found' });
    res.json(user);
}
const updateUser = async (req, res) => {
    try {
        if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 'message': 'Correct ID parameter is required' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ 'message': 'User not found' });
        }
        // Check if the new username is already taken
        if (req.body.user) {
            // Check if the new username is already taken
            const existingUser = await User.findOne({ username: req.body.user });
            if (existingUser && existingUser._id.toString() !== req.params.id) {
                return res.status(400).json({ 'message': 'Username is already taken' });
            }
            user.username = req.body.user;
        }

        // Update idProof and documentProof only if isSeller is true
        if (user.isSeller) {
            const basePath = `${req.protocol}://${req.get('host')}/public/document/`;
            // Update idProof
            if (req.files && req.files['idProof']) {
                const idProof = `${basePath}${req.files['idProof'][0].filename}`;
                user.idProof = idProof;
            }
            // Update documentProof
            if (req.files && req.files['documentProof']) {
                const documentProof = `${basePath}${req.files['documentProof'][0].filename}`;
                user.documentProof = documentProof;
            }
        } else {
            res.status(403).json({ 'message': "Only Authorized owners can access this" });
        }
        await user.save();
        res.status(200).json({ message: "User updated" });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateUserPic = async (req, res) => {
    try {
        if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 'message': 'Correct ID parameter is required' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ 'message': 'User not found' });
        }
        if (req.file) {
            const fileName = req.file.filename;
            const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
            user.image = `${basePath}${fileName}`;
        }
        await user.save();
        return res.status(200).json({ message: 'User profile picture updated' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
const deleteUserPic = async (req, res) => {
    try {
        if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 'message': 'Correct ID parameter is required' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ 'message': 'User not found' });
        }
        if (user.image) {
            // Delete the existing profile picture (optional, depending on your use case)
            user.image = undefined;
            await user.save();
            return res.status(200).json({ message: 'Profile picture deleted successfully' });
        } else {
            return res.status(404).json({ message: 'User does not have a profile picture' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }

}
const usersCount = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.send({
            count: count
        });
    } catch (error) {
        console.error('Error counting users:', error);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};

const sellerCount = async (req, res) => {
    try {
        const sellerCount = await User.countDocuments({ isSeller: true });
        res.send({ count: sellerCount });
    } catch (error) {
        console.error('Error counting sellers:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const verifiedSellerCount = async (req, res) => {
    try {
        const verifiedSellerCount = await User.countDocuments({ isActiveSeller: true });
        res.send({ count: verifiedSellerCount });
    } catch (error) {
        console.error('Error counting sellers:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const changeUserRole = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isSeller) {
            user.roles = { Editor: 1320 };
            user.isActiveSeller = true;
            user.documentProof = undefined;
            user.idProof = undefined;
            await user.save();
            const message = `Dear ${user.username},
We're delighted to inform you that your role on StorageBox has been updated to Seller. This change grants you access to additional features and privileges within our platform, empowering you to put your storage space from the sale and even edit it.

Thank you for your continued support and contributions to the StorageBox community.
Thank you,
The StorageBox Team`;

            await sendEmail({
                email: user.email,
                subject: 'Changed the user role to editor',
                message
            });
            res.status(200).json({ message: 'User roles updated successfully to Editor and the documents are deleted' });
        } else {
            res.status(400).json({ message: 'Role cannot be changed for this user' });
        }
    } catch (error) {
        console.error('Error updating user roles:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const changeEditorRole = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isSeller && user.roles.Editor) {
            user.roles = { User: 2002 };
            user.isActiveSeller = false;
            await user.save();
            res.status(200).json({ message: 'User roles updated successfully to User' });
        } else {
            res.status(400).json({ message: 'User is not an editor' });
        }
    } catch (error) {
        console.error('Error updating user roles:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 'message': 'Correct ID parameter is required' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.sendStatus(404).json({ 'message': 'User not found' });
        }
        const result = await user.remove();
        if (!result) {
            return res.status(500).json({ 'message': 'User cannot be deleted' });
        }
        res.json({ 'message': 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};

const getSellerUsers = async (req, res) => {
    try {
        const sellerUsers = await User.find({ isSeller: true }).select('-password');
        res.json(sellerUsers);
    } catch (error) {
        console.error('Error fetching seller users:', error);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};
const deleteIdProof = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 'message': 'User not found' });
        }
        user.idProof = undefined;
        await user.save();
        res.json({ 'message': 'IdProof deleted successfully' });
    } catch (error) {
        res.status(500).json({ 'message': error.message });
    }
};
const deleteDocumentProof = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 'message': 'User not found' });
        }
        user.documentProof = undefined;
        await user.save();
        res.json({ 'message': 'documentProof deleted successfully' });
    } catch (error) {
        res.status(500).json({ 'message': error.message });
    }
};

module.exports = {
    getAllUser,
    getUser,
    updateUser,
    usersCount,
    deleteUser,
    sellerCount,
    verifiedSellerCount,
    getSellerUsers,
    changeUserRole,
    updateUserPic,
    changeEditorRole,
    deleteIdProof,
    deleteUserPic,
    deleteDocumentProof
}