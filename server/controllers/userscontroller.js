const { default: mongoose } = require('mongoose');
const User = require('../model/User');
const Storage=require('../model/Storage');
const { sendEmail } = require('../middlewere/email');
const path=require('path');
const fs=require('fs');

const getAllUser = async (req, res) => {
    try {
        const userList = await User.find({ "roles.Admin": { $ne: 515 } }).sort({ _id: -1 }).select('-password').exec();
        if (!userList) return res.sendStatus(204).json({ 'message': 'No users found' });
        res.json(userList);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getUser = async (req, res) => {
    try {
        if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 'message': `Correct ID parameter is required` });
        }
        const user = await User.findById(req.params.id).select('-password').exec();
        if (!user) return res.sendStatus(204).json({ 'message': 'No user found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const updateUser = async (req, res) => {
    try {
        if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 'message': 'Correct ID parameter is required' });
        }       
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ 'message': 'User not found' });
        }    
        if (req.userId !== req.params.id) {
            return res.status(403).json({ 'message': 'Unauthorized' });
        }
        if (req.body.username) {
            // Check if the new username is already taken
            const existingUser = await User.findOne({ username: req.body.username });
            if (existingUser && existingUser._id.toString() !== req.params.id) {
                return res.status(400).json({ 'message': 'Username is already taken' });
            }
            user.username = req.body.username;
        } else {
            return res.status(400).json({ message: "At least username required" });
        }
        await user.save();
        res.status(200).json({ message: "User updated"});
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: error.message });
    }
};
const updateSellerDocument=async(req,res)=>{
    try {
        if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 'message': 'Correct ID parameter is required' });
        }       
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ 'message': 'User not found' });
        }
        if (req.userId !== req.params.id) {
            return res.status(403).json({ 'message': 'Unauthorized' });
        }
        if (!user.isSeller && req.files) {
            return res.status(403).json({ 'message': 'Only sellers can update idProof and documentProof' });
        }
        // Update idProof and documentProof only if isSeller is true
        if (user.isSeller) {
            const basePath = `${req.protocol}://${req.get('host')}/public/document/`;
            if (req.files && req.files['idProof']) {
                const idProof = `${basePath}${req.files['idProof'][0].filename}`;
                user.idProof = idProof;
            }
            if (req.files && req.files['documentProof']) {
                const documentProof = `${basePath}${req.files['documentProof'][0].filename}`;
                user.documentProof = documentProof;
            }
        }
        await user.save();
        res.status(200).json({ message: "User  updated"});
    }catch(error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: error.message });
    }
}


const wrongCredentials = async (req, res) => {
    try {
        if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 'message': 'Correct ID parameter is required' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ 'message': 'User not found' });
        }
        if (user.isSeller) {
            if (user.documentProof) {
                const documentFileName = user.documentProof.split('/').pop();
                const documentPath = path.join(__dirname, '..', 'public', 'document', documentFileName);
                try {
                    await fs.promises.unlink(documentPath);
                } catch (error) {
                    console.error('Error deleting document proof:', error);
                    return res.status(500).json({ message: 'Error deleting document proof' });
                }
            }
            if (user.idProof) {
                const idProofFileName = user.idProof.split('/').pop();
                const idProofPath = path.join(__dirname, '..', 'public', 'document', idProofFileName);
                try {
                    await fs.promises.unlink(idProofPath);
                } catch (error) {
                    console.error('Error deleting id proof:', error);
                    return res.status(500).json({ message: 'Error deleting id proof' });
                }
            }

            const message = `Dear ${user.username},

Upon reviewing the documents you uploaded for verification, we noticed that there were some discrepancies or the documents provided did not meet our authenticity standards. In order to proceed with the activation of your account, we kindly request you to reupload the required documents.

Please follow these steps to reupload the documents:

1. Log in to your account on our platform.
2. Navigate to your profile page.
3. Look for the option of documents to upload the new documents.
4. Click on the upload button to submit the correct documents.

Once you have reuploaded the documents, our team will review them again and proceed with the activation of your account.

We apologize for any inconvenience this may cause and appreciate your cooperation in ensuring the security and authenticity of our platform.

If you have any questions or need further assistance, please do not hesitate to contact us.

Thank you for your understanding and prompt attention to this matter.

Best regards,
The StorageBox Team`;
            await sendEmail({
                email: user.email,
                subject: 'Document Reupload for Account Activation',
                message
            });
            return res.status(200).json({ message: 'Email sent successfully' });
        } else {
            return res.status(401).json({ message: 'Not a seller user' });
        }

    } catch (err) {
        console.error('Error updating user roles:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
const updateUserPic = async (req, res) => {
    try {
        if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 'message': 'Correct ID parameter is required' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ 'message': 'User not found' });
        }
        if (req.userId !== req.params.id) {
            return res.status(403).json({ 'message': 'Unauthorized' });
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
        if (req.userId !== req.params.id) {
            return res.status(403).json({ 'message': 'Unauthorized' });
        }
        if (user.image) {
            const imagePath = path.join(__dirname, '../public/upload', path.basename(user.image));
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error deleting image file:', err);
                    return res.status(500).json({ message: 'Error deleting image file' });
                }
                console.log('Image file deleted successfully');
                user.image = undefined;
                user.save();
                return res.status(200).json({ message: 'Profile picture deleted successfully' });
            });
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
        const sellerCount = await User.countDocuments({ isSeller: true },{ "roles.Admin": { $ne: 515 } });
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
            if (user.documentProof) {
                const documentFileName = user.documentProof.split('/').pop();
                const documentPath = path.join(__dirname, '..', 'public', 'document', documentFileName);
                try {
                    await fs.promises.unlink(documentPath);
                    user.documentProof = undefined;
                } catch (error) {
                    console.error('Error deleting document proof:', error);
                    return res.status(500).json({ message: 'Error deleting document proof' });
                }
            }
            if (user.idProof) {
                const idProofFileName = user.idProof.split('/').pop();
                const idProofPath = path.join(__dirname, '..', 'public', 'document', idProofFileName);
                try {
                    await fs.promises.unlink(idProofPath);
                    user.idProof = undefined;
                } catch (error) {
                    console.error('Error deleting id proof:', error);
                    return res.status(500).json({ message: 'Error deleting id proof' });
                }
            }
            
            await user.save();
            const message = `Dear ${user.username},
Welcome to StorageBox!
            
We're pleased to inform you that your Seller account has been successfully verified. You can now start listing your storage units on our platform.
            
Thank you,
The StorageBox Team`

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
            return res.status(404).json({ 'message': 'User not found' });
        }
        const result = await user.deleteOne({_id:req.params.id});
        if (!result) {
            return res.status(500).json({ 'message': 'User cannot be deleted' });
        }
        if (user.isSeller) {
            if (user.documentProof) {
                const documentFileName = user.documentProof.split('/').pop();
                const documentPath = path.join(__dirname, '..', 'public', 'document', documentFileName);
                try {
                    await fs.promises.unlink(documentPath);
                } catch (error) {
                    console.error('Error deleting document proof:', error);
                    return res.status(500).json({ message: 'Error deleting document proof' });
                }
            }
            if (user.idProof) {
                const idProofFileName = user.idProof.split('/').pop();
                const idProofPath = path.join(__dirname, '..', 'public', 'document', idProofFileName);
                try {
                    await fs.promises.unlink(idProofPath);
                } catch (error) {
                    console.error('Error deleting id proof:', error);
                    return res.status(500).json({ message: 'Error deleting id proof' });
                }
            }
        }
        if (user.isActiveSeller) {
            const userStorage = await Storage.find({ user: req.params.id });
            if (userStorage && userStorage.length > 0) {
                await Promise.all(userStorage.map(async (storage) => {
                    await Promise.all(storage.images.map(async (image) => {
                        const imageName = image.split('/').pop();
                        const imagePath = path.join(__dirname, '..', 'public', 'upload', imageName);
                        try {
                            await fs.promises.unlink(imagePath);
                            console.log(`Image file ${image} deleted successfully`);
                        } catch (error) {
                            console.error(`Error deleting image file ${image}:`, error);
                        }
                    }));
                    try {
                        await Storage.findByIdAndDelete(storage._id);
                        console.log(`Storage deleted successfully`);
                    } catch (error) {
                        console.error('Error deleting storage:', error);
                    }
                }));
            }
        }
        res.json({ 'message': 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};

const getSellerUsers = async (req, res) => {
    try {
        const sellerUsers = await User.find({ isSeller: true }).sort({ _id: -1 }).select('-password');
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
        }  if (user.idProof) {
            const idProofFileName = user.idProof.split('/').pop();
            const idProofPath = path.join(__dirname, '..', 'public', 'document', idProofFileName);
            try {
                await fs.promises.unlink(idProofPath);
                user.idProof = undefined;
            } catch (error) {
                console.error('Error deleting id proof:', error);
                return res.status(500).json({ message: 'Error deleting id proof' });
            }
        }
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
        if (user.documentProof) {
            const documentFileName = user.documentProof.split('/').pop();
            const documentPath = path.join(__dirname, '..', 'public', 'document', documentFileName);
            try {
                await fs.promises.unlink(documentPath);
                user.documentProof = undefined;
            } catch (error) {
                console.error('Error deleting document proof:', error);
                return res.status(500).json({ message: 'Error deleting document proof' });
            }
        }
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
    updateSellerDocument,
    usersCount,
    deleteUser,
    sellerCount,
    wrongCredentials,
    verifiedSellerCount,
    getSellerUsers,
    changeUserRole,
    updateUserPic,
    changeEditorRole,
    deleteIdProof,
    deleteUserPic,
    deleteDocumentProof
}