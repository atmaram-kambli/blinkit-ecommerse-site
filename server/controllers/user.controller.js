import UserModel from '../models/user.model.js';
import sendEmail from '../config/sendEmail.js';
import bcryptjs from 'bcryptjs'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';



// 1. New User Registeration
export async function regiterUserController(req, res) {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password) {
            return res.status(500).json({
                message: "Provide valid credentials!",
                error: true,
                success: false,
            });
        }

        const user = await UserModel.findOne({email});
        if(user) {
            return res.status(500).json({
                message: "Already registered User! Try Login",
                error: true,
                success: false,
            });
        }

        const salt = await bcryptjs.genSalt(12);
        const hashPass = await bcryptjs.hash(password, salt);

        const payload = {
            name, 
            email,
            password: hashPass,
        }

        const newUser = await UserModel(payload);
        const save = await newUser.save();

        const verity_page_url = `${process.env.FRONTEND_URL}/verify-email?code=${save._id}`;
        // console.log(verity_page_url);

        const verifyEmail = sendEmail({
            sendTo: email,
            subject: "Verify Email from BlinkIt",
            html: verifyEmailTemplate({name, verity_page_url})
        })

        return res.status(200).json({
            message: "User register successfully!",
            error: false,
            success: true,
            data: save,
        });

        
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

// 2. USer Email Verification
export async function verifyEmailController(req, res) {
    try {
        const { code } = req.body;
        const findUser = await UserModel.findById(code);

        if(!findUser) {
            return res.status(400).json({
                message: "Bad Request!",
                error: true,
                success: false,
            });
        }
        const updatedUser = await UserModel.updateOne({_id: code}, {
            verify_email: true,
        })
        // console.log(updatedUser);
        return res.status(200).json({
            message: "User is verified successfully!",
            error: false,
            success: true,
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

