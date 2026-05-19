import fs from "fs";
import path from "path";
import catchAsync from "../../../common/Utils/catchAsync.js";
import AppErrorClass from "../../../common/Utils/AppErrorClass.js";
import * as teamService from "./team.service.js";
import { processBackgroundRemoval } from "../../../common/Utils/removeBackground.js";

const deleteFileIfExists = (filePath) => {
    if (!filePath) return;

    try {
        const normalizedPath = filePath.replace(/^\/+/, "").replace(/\\/g, "/");
        const absolutePath = path.resolve(normalizedPath);
        if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
    } catch (err) {
        console.error("File delete error:", err);
    }
};

// Admin

export const addTeamMember = catchAsync(async (req, res, next) => {
    let { name, designation, sectorsCovered, socialMedia } = req.body;

    if (!name || !designation || !req.file) {
        return next(new AppErrorClass("Name, designation and image are required", 400));
    }

    try {
        if (sectorsCovered) sectorsCovered = JSON.parse(sectorsCovered);
    } catch (err) { }

    try {
        if (socialMedia) socialMedia = JSON.parse(socialMedia);
    } catch (err) { }

    // Process background removal
    const processedImagePath = await processBackgroundRemoval(req.file.path);
    const imagePath = `/${processedImagePath.replace(/\\/g, "/")}`;

    const member = await teamService.createTeamMemberService({
        name,
        designation,
        sectorsCovered: sectorsCovered || [],
        image: imagePath,
        socialMedia: socialMedia || [],
    });

    res.status(201).json({
        status: "success",
        message: "Team member Created",
        data: member,
    });
});

export const getTeamMembers = catchAsync(async (req, res, next) => {
    const members = await teamService.getTeamMembersService();

    res.status(200).json({
        status: "success",
        message: "Team members fetched successfully",
        count: members.length,
        data: members,
    });
});

export const getTeamMemberById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const member = await teamService.getTeamMemberByIdService(id);

    if (!member) {
        return next(new AppErrorClass("Team member not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Team member fetched successfully",
        data: member,
    });
});

export const toggleTeamMemberStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
        return next(new AppErrorClass("isActive must be true or false", 400));
    }

    const member = await teamService.toggleTeamMemberStatusService(id, isActive);

    if (!member) {
        return next(new AppErrorClass("Team member not found", 404));
    }

    if (member.alreadySame) {
        return res.status(200).json({
            status: "success",
            message: `Team member is already ${isActive ? "active" : "inactive"}`,
        });
    }

    res.status(200).json({
        status: "success",
        message: `Team member ${isActive ? "activated" : "deactivated"} successfully`,
        data: member,
    });
});

export const deleteTeamMember = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const member = await teamService.getTeamMemberByIdService(id);
    if (!member) {
        return next(new AppErrorClass("Team member not found", 404));
    }

    if (member.image) {
        deleteFileIfExists(member.image);
    }

    await teamService.deleteTeamMemberService(id);

    res.status(200).json({
        status: "success",
        message: "Team member deleted successfully",
    });
});

export const updateTeamMember = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let { name, designation, sectorsCovered, socialMedia } = req.body;

    const existingMember = await teamService.getTeamMemberByIdService(id);
    if (!existingMember) {
        return next(new AppErrorClass("Team member not found", 404));
    }

    try {
        if (sectorsCovered) sectorsCovered = JSON.parse(sectorsCovered);
    } catch (err) { }

    try {
        if (socialMedia) socialMedia = JSON.parse(socialMedia);
    } catch (err) { }

    const dataToUpdate = {
        name,
        designation,
        sectorsCovered: sectorsCovered || [],
        socialMedia: socialMedia || [],
    };

    if (req.file) {
        // Process new image
        const processedImagePath = await processBackgroundRemoval(req.file.path);
        const imagePath = `/${processedImagePath.replace(/\\/g, "/")}`;

        dataToUpdate.image = imagePath;
        if (existingMember.image) {
            deleteFileIfExists(existingMember.image);
        }
    }

    const member = await teamService.updateTeamMemberService(id, dataToUpdate);

    res.status(200).json({
        status: "success",
        message: "Team member updated successfully",
        data: member,
    });
});


// Public

export const getTeamMembersPublic = catchAsync(async (req, res, next) => {
    const members = await teamService.getActiveTeamMembersService();

    res.status(200).json({
        status: "success",
        message: "Active team members fetched successfully",
        count: members.length,
        data: members,
    });
});