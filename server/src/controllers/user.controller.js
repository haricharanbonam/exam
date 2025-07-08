import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { options } from "../constants.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  if (
    [fullName, email, username, password].some(
      (field) => typeof field !== "string" || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email / username already exists");
  }

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // sendEmail(
  //   createdUser.email,
  //   "Welcome to Our Platform",
  //   `Hello ${createdUser.fullName},
  //   \n\nThank you for registering on our platform. We are excited to have you with us!\n\nBest regards,\nThe Team
  //   To verify your email, please click on the link below:\n\n
  //   <a href="${process.env.FRONTEND_URL}/verify-email?token=${createdUser._id}">Verify Email</a>
  //   \n\nIf you did not register, please ignore this email.
  //   `
  // );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user ");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Succesfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!email && !username) {
    throw new ApiError(400, "username or email is required");
  }
  if (!password) {
    throw new ApiError(400, "password is required");
  }

  const findUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!findUser) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await findUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshTokens(findUser._id);

  const loggedInUser = await User.findById(findUser._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "login success"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, // to return the new object to logoutUser
    }
  );

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "user logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});











// const getUserProfile = asyncHandler(async (req, res) => {
//   const { username } = req.params;

//   // const user = await User.findOne({ username })
//   //   .select("fullName username aboutme Profession likedPosts myPosts avatarUrl")
//   //   .populate({
//   //     path: "likedPosts",
//   //     select: "title coverImage author",
//   //     populate: {
//   //       path: "author",
//   //       select: "fullName",
//   //     },
//   //   })
//   //   .populate({
//   //     path: "myPosts",
//   //     select: "title coverImage",
//   //   });

//   // if (!user) {
//   //   return res.status(404).json({ message: "User not found" });
//   // }
//   // let bool = req.user._id.toString() === user._id.toString();
//   // console.log("User profile fetched successfully", user);
//   // res.status(200).json({...user.toObject(),owner:bool});
//   const user = await User.aggregate([
//     {
//       $match: {
//         username: username,
//       },
//     },
//     {
//       $lookup: {
//         from: "blogs",
//         let: { postIds: "$myPosts" },
//         pipeline: [
//           {
//             $match: {
//               $expr: { $in: ["$_id", "$$postIds"] },
//             },
//           },
//           {
//             $project: {
//               title: 1,
//               coverImage: 1,
//             },
//           },
//         ],
//         as: "myPosts",
//       },
//     },
//     {
//       $lookup: {
//         from: "blogs",
//         let: { liked: "$likedPosts" }, // Pass likedPosts array
//         pipeline: [
//           {
//             $match: {
//               $expr: { $in: ["$_id", "$$liked"] }, // Match blog._id in likedPosts
//             },
//           },
//           {
//             $lookup: {
//               from: "users",
//               localField: "author", // Blog's owner field
//               foreignField: "_id",
//               as: "author",
//             },
//           },
//           {
//             $project: {
//               title: 1,
//               coverImage: 1,
//               author_fullName: { $arrayElemAt: ["$author.fullName", 0] }, // Only show author's full name
//             },
//           },
//         ],
//         as: "likedPosts",
//       },
//     },
//     {
//       $lookup: {
//         from: "follows",
//         localField: "_id",
//         foreignField: "person",
//         as: "followers",
//       },
//     },
//     {
//       $lookup: {
//         from: "follows",
//         localField: "_id",
//         foreignField: "follower",
//         as: "following",
//       },
//     },
//     {
//       $project: {
//         fullName: 1,
//         aboutme: 1,
//         Profession: 1,
//         avatarUrl: 1,
//         username: 1,
//         email: 1,
//         myPosts: 1,
//         likedPosts: 1,
//         followers: 1,
//         following: 1,
//       },
//     },
//   ]);
//   if (!user[0]) {
//     return res.status(404).json({ message: "User not found" });
//   }
//   const isOwner = req.user._id.toString() === user[0]._id.toString();
//   let isFollowing = false;
//   if (!isOwner) {
//     isFollowing = user[0].followers
//       .map((f) => f.follower.toString())
//       .includes(req.user._id.toString());
//   }
//   res.status(200).json({
//     ...user[0],
//     owner: isOwner,
//     isFollowing: isFollowing || false,
//   });
// });

// const updateDetails = asyncHandler(async (req, res) => {
//   const { fullName, aboutme, Profession } = req.body;
//   const userId = req.user.id;
//   if (!fullName || !aboutme || !Profession) {
//     return res.status(400).json({
//       message: "Full name, about me, and profession are required.",
//     });
//   }
//   const user = await User.findByIdAndUpdate(
//     userId,
//     {
//       fullName,
//       aboutme,
//       Profession,
//     },
//     { new: true }
//   );
//   res
//     .status(200)
//     .json(new ApiResponse(200, user, "User details updated successfully"));
// });

// const updateUserAvatar = asyncHandler(async (req, res) => {
//   const userId = req.user.id;
//   const file = req.file;

//   if (!file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }
//   const uploadResult = await cloudUpload(file.path); // Your Cloudinary uploader

//   if (!uploadResult || !uploadResult.secure_url) {
//     return res.status(500).json({ message: "File upload failed" });
//   }

//   const user = await User.findByIdAndUpdate(
//     userId,
//     { avatarUrl: uploadResult.secure_url },
//     { new: true }
//   );

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }
//   res
//     .status(200)
//     .json(new ApiResponse(200, user.avatarUrl, "Avatar updated successfully"));
// });



export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,


};
