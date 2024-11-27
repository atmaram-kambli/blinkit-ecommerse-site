import UserModel from '../models/user.model.js';
import sendEmail from '../config/sendEmail.js';
import bcryptjs from 'bcryptjs'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';

export async function regiterUserController(req, res) {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password) {
            return res.staus(502).json({
                message: "Invalid credentials!",
                error: true,
                success: false,
            });
        }

        const user = await UserModel.findOne({email});
        if(user) {
            return res.staus(502).json({
                message: "Already registed E-mail! Try Login",
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

        const verifyEmail = sendEmail({
            sendTo: email,
            subject: "Verify Email from BlinkIt",
            html: verifyEmailTemplate({name, verity_page_url})
        })

        return res.staus(200).json({
            message: "User register successfully!",
            error: false,
            success: true,
            data: save,
        });

        
    } catch (error) {
        return res.staus(502).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}