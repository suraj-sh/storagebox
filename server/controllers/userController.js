const { default: mongoose } = require('mongoose');
const User = require('../model/User');
const Storage = require('../model/Storage');
const { sendEmail } = require('../middleware/email');
const path = require('path');
const fs = require('fs');
const { uploadDocumentToFirebaseStorage } = require('../middleware/uploadDocs');
const { bucket } = require('../config/firebase');

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
        res.status(200).json({ message: "User updated" });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: error.message });
    }
};


const updateSellerDocument = async (req, res) => {
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
        if (user.isSeller) {
            await uploadDocumentToFirebaseStorage(req, res, async () => {
                if (req.files && req.files['idProof']) {
                    // Delete old idProof document from Firebase Storage and update URL in MongoDB
                    if (user.idProof) {
                        await deleteFileFromFirebase(user.idProof);
                    }
                    const idProofUrl = req.fileUrls['idProof'];
                    user.idProof = idProofUrl;
                }
                if (req.files && req.files['documentProof']) {
                    // Delete old documentProof document from Firebase Storage and update URL in MongoDB
                    if (user.documentProof) {
                        await deleteFileFromFirebase(user.documentProof);
                    }
                    const documentProofUrl = req.fileUrls['documentProof'];
                    user.documentProof = documentProofUrl;
                }
                await user.save();
                res.status(200).json({ message: "User updated" });
            });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: error.message });
    }
};


const deleteDocument = async (req, res, documentType) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 'message': 'User not found' });
        }

        const documentUrl = user[documentType];
        if (documentUrl) {
            const documentFileName = documentUrl.split('/').pop();
            const file = bucket.file(`documents/${documentFileName}`);
            await file.delete();
            user[documentType] = undefined;
            await user.save();
            res.json({ 'message': `${documentType} deleted successfully` });
        } else {
            res.status(404).json({ 'message': `${documentType} not found` });
        }
    } catch (error) {
        console.error(`Error deleting ${documentType}:`, error);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};

const deleteIdProof = (req, res) => deleteDocument(req, res, 'idProof');
const deleteDocumentProof = (req, res) => deleteDocument(req, res, 'documentProof');



// Function to delete a file from Firebase Storage
const deleteFileFromFirebase = async (fileUrl) => {
    try {
        // Extract file name from URL before query parameters
        const url = new URL(fileUrl);
        const fileName = url.pathname.split('/').pop();
        const filePath = `documents/${fileName}`;
        const file = bucket.file(filePath);

        // Check if file exists before attempting to delete
        const [exists] = await file.exists();
        if (!exists) {
            console.warn(`File not found: ${filePath}`);
            return; // File does not exist, no need to attempt deletion
        }

        // Log file deletion attempt
        console.log(`Attempting to delete file: ${filePath}`);

        // Attempt to delete the file
        await file.delete();
        console.log(`Deleted file: ${filePath}`);
    } catch (error) {
        console.error('Error deleting file from Firebase Storage:', error);
        throw new Error('Error deleting file from Firebase Storage');
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
            // Delete documents from Firebase Storage
            if (user.documentProof) {
                await deleteFileFromFirebase(user.documentProof);
                user.documentProof = undefined;
            }

            if (user.idProof) {
                await deleteFileFromFirebase(user.idProof);
                user.idProof = undefined;
            }

            // Update user role and save changes
            user.roles = { Editor: 1320 };
            user.isActiveSeller = true;
            await user.save();

            // Send email notification
            const message = `Dear ${user.username},

            Welcome to StorageBox!

            We're pleased to inform you that your Seller account has been successfully verified. 
            You can now start listing your storage units on our platform.

            Thank you,
            The StorageBox Team`;

            await sendEmail({
                email: user.email,
                subject: 'Seller Account Verification',
                message
            });

            return res.status(200).json({ message: 'User roles updated successfully to Editor and the documents are deleted' });
        } else {
            return res.status(400).json({ message: 'Role cannot be changed for this user' });
        }
    } catch (error) {
        console.error('Error changing user role:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

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
            // Delete documents from Firebase Storage
            if (user.documentProof) {
                await deleteFileFromFirebase(user.documentProof);
                user.documentProof = undefined;
            }

            if (user.idProof) {
                await deleteFileFromFirebase(user.idProof);
                user.idProof = undefined;
            }

            const message = `Dear ${user.username},

            Upon reviewing the documents you uploaded for verification, we noticed that there were 
            some discrepancies or the documents provided did not meet our authenticity standards. 
            In order to proceed with the activation of your account, we kindly request you to reupload 
            the required documents.

            Please follow these steps to reupload the documents:

            1. Log in to your account on our platform.
            2. Navigate to your profile page.
            3. Look for the option of documents to upload the new documents.
            4. Click on the upload button to submit the correct documents.

            Once you have reuploaded the documents, our team will review them again and proceed with 
            the activation of your account.

            We apologize for any inconvenience this may cause and appreciate your cooperation in 
            ensuring the security and authenticity of our platform.

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
        console.error('Error processing wrong credentials:', err);
        res.status(500).json({ message: 'Internal Server Error' });
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
        if (req.userId !== req.params.id) {
            return res.status(403).json({ 'message': 'Unauthorized' });
        }
        if (req.file) {
            const file = req.file;
            const fileName = `${Date.now()}-${file.originalname}`;
            const fileBuffer = file.buffer;

            // Upload the file to Firebase Storage
            const fileRef = bucket.file(`images/${fileName}`);
            await fileRef.save(fileBuffer, {
                metadata: {
                    contentType: file.mimetype,
                },
            });

            // Generate a signed URL for the uploaded file
            const [url] = await fileRef.getSignedUrl({
                action: 'read',
                expires: '03-09-2491', // Set an appropriate expiration date
            });

            // Update the user document with the URL of the uploaded image
            user.image = url;
            await user.save();

            return res.status(200).json({ message: 'User profile picture updated' });
        } else {
            return res.status(400).json({ message: 'No image file provided' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


const deleteImageUsingSignedUrl = async (signedUrl) => {
    try {
        const url = new URL(signedUrl);
        const filePath = url.pathname.split('/').slice(2).join('/'); // Extract the path from the signed URL

        // Delete the file from Firebase Storage using the extracted file path
        const fileRef = bucket.file(filePath);
        await fileRef.delete();
        console.log('Image deleted successfully');
    } catch (error) {
        console.error('Error deleting image:', error);
        throw new Error('Failed to delete image');
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
            try {
                await deleteImageUsingSignedUrl(user.image); // Use the function to delete the image from Firebase Storage
                user.image = undefined;
                await user.save();
                return res.status(200).json({ message: 'Profile picture deleted successfully' });
            } catch (error) {
                console.error('Error deleting profile picture:', error);
                return res.status(500).json({ message: 'Error deleting profile picture' });
            }
        } else {
            return res.status(404).json({ message: 'User does not have a profile picture' });
        }
    } catch (error) {
        console.error('Error deleting user profile picture:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


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
        const sellerCount = await User.countDocuments({ isSeller: true }, { "roles.Admin": { $ne: 515 } });
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
        const result = await user.deleteOne({ _id: req.params.id });
        if (!result) {
            return res.status(500).json({ 'message': 'User cannot be deleted' });
        }
        if (user.isSeller) {
            if (user.documentProof) {
                try {
                    await deleteFileFromFirebase(user.documentProof);
                    user.documentProof = undefined;
                } catch (error) {
                    console.error('Error deleting document proof:', error);
                    return res.status(500).json({ message: 'Error deleting document proof' });
                }
            }
            if (user.idProof) {
                try {
                    await deleteFileFromFirebase(user.idProof);
                    user.idProof = undefined;
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
                        try {
                            await deleteImageUsingSignedUrl(image); // Use the function to delete the image from Firebase Storage
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