import UserModel from '../models/user.model.js';
import sendEmail from '../config/sendEmail.js';
import bcryptjs from 'bcryptjs'

import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generateAccessToken.js';
import genertedRefreshToken from '../utils/generateRefreshToken.js';



// 1. New User Registeration
export async function regiterUserController(req, res) {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({
                message: "Provide valid credentials!",
                error: true,
                success: false,
            });
        }

        const user = await UserModel.findOne({email});
        if(user) {
            return res.status(400).json({
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

        const verity_page_url = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`;
        // console.log(verity_page_url);

        const verifyEmail = await sendEmail({
            sendTo: email,
            subject: "Verify Email from BlinkIt",
            html: verifyEmailTemplate({name, verity_page_url})
        })

        return res.status(200).json({
            message: "User is registered successfully!",
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
                message: "Bad res!",
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

// 3. User Login Controller
export async function loginController(req,res){
    try {
        const { email , password } = req.body

        if(!email || !password){
            return res.status(400).json({
                message : "Invalid crendentials!",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return res.status(400).json({
                message : "User is not registered. Try SignUp!",
                error : true,
                success : false
            })
        }

        if(user.status !== "Active"){
            return res.status(400).json({
                message : "Access Denied!",
                error : true,
                success : false
            })
        }

        const checkPassword = await bcryptjs.compare(password,user.password)

        if(!checkPassword){
            return res.status(400).json({
                message : "Wrong crendentials!",
                error : true,
                success : false
            })
        }

        const accesstoken = await generatedAccessToken(user._id)
        const refreshToken = await genertedRefreshToken(user._id)

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            last_login_date : new Date()
        })

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
        res.cookie('accessToken',accesstoken,cookiesOption)
        res.cookie('refreshToken',refreshToken,cookiesOption)

        return res.json({
            message : "User is Logged in Successfully!",
            error : false,
            success : true,
            data : {
                accesstoken,
                refreshToken
            }
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// 4. User logout controller
export async function logoutController(req,res){
    try {
        const userid = req.userId

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        res.clearCookie("accessToken",cookiesOption)
        res.clearCookie("refreshToken",cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid,{
            refresh_token : ""
        })

        return res.json({
            message : "User is Logged out successfully!",
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}