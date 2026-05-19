import Team from "./team.model.js";
import AppErrorClass from "../../../common/Utils/AppErrorClass.js";

// Admin

export const createTeamMemberService = async (data) => {
    const member = await Team.create(data);

    if (!member) {
        throw new AppErrorClass("Team member not created", 500);
    }

    return member;
};

export const getTeamMembersService = async () => {
    const team = await Team.find().sort({ createdAt: -1 });
    return team;
}

export const getTeamMemberByIdService = async (id) => {
    const member = await Team.findById(id);
    return member;
};

export const toggleTeamMemberStatusService = async (id, isActive) => {
    const member = await Team.findById(id);

    if (!member) return null;

    if (member.isActive === isActive) {
        return {
            alreadySame: true
        };
    }

    member.isActive = isActive;
    await member.save();

    return member;
};

export const deleteTeamMemberService = async (id) => {
    const member = await Team.findByIdAndDelete(id);
    return member;
};

export const updateTeamMemberService = async (id, data) => {
    const member = await Team.findByIdAndUpdate(id, data, { new: true });
    return member;
}


// Public

export const getActiveTeamMembersService = async () => {
    const team = await Team.find({ isActive: true }).sort({ createdAt: -1 });
    return team;
};

