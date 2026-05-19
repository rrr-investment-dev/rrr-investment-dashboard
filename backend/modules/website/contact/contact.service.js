import FormConfig from "./models/formConfig.model.js";
import Inquiry from "./models/inquiry.model.js";
import AppErrorClass from "../../../common/Utils/AppErrorClass.js";

// FORM CONFIGURATION SERVICES
// ADMIN

export const getFormConfigsService = async ({ page = 1, limit = 50, search, isActive } = {}) => {
    const skip = (page - 1) * limit;
    const filter = {};

    if (search) {
        filter.label = { $regex: search, $options: "i" };
    }

    if (isActive !== undefined) {
        filter.isActive = isActive === "true" || isActive === true;
    }

    const configs = await FormConfig.find(filter)
        .sort({ order: 1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await FormConfig.countDocuments(filter);

    return {
        configs,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getFormConfigByIdService = async (id) => {
    const config = await FormConfig.findById(id);
    if (!config) {
        throw new AppErrorClass("Form field configuration not found", 404);
    }
    return config;
};

export const createFormConfigService = async (data) => {
    const config = await FormConfig.create(data);
    return config;
};

export const updateFormConfigService = async (id, data) => {
    const config = await FormConfig.findById(id);

    if (!config) {
        throw new AppErrorClass("Form field not found", 404);
    }

    // If label is provided, the pre-save hook will handle the name generation
    // if name is not explicitly provided.
    // If name is explicitly provided, we should check for uniqueness.
    if (data.name && data.name !== config.name) {
        const existingConfig = await FormConfig.findOne({
            name: data.name,
            _id: { $ne: id }
        });
        if (existingConfig) {
            throw new AppErrorClass(`A field with the name "${data.name}" already exists.`, 400);
        }
    }

    // Update fields
    Object.keys(data).forEach((key) => {
        config[key] = data[key];
    });

    await config.save();
    return config;
};

export const deleteFormConfigService = async (id) => {
    const config = await FormConfig.findByIdAndDelete(id);
    return config;
};

export const toggleFormConfigStatusService = async (id, isActive) => {
    const config = await FormConfig.findById(id);
    if (!config) {
        throw new AppErrorClass("Form field not found", 404);
    }

    if (config.isActive === isActive) {
        throw new AppErrorClass(`Form field is already ${isActive ? "active" : "inactive"}`, 400);
    }

    config.isActive = isActive;
    await config.save();
    return config;
};

export const reorderFormConfigsService = async (orderedIds) => {
    // 1. Validate that we are reordering the correct number of fields
    // This prevents leaving any field with a clashing "order" value
    const totalFields = await FormConfig.countDocuments();
    if (orderedIds.length !== totalFields) {
        throw new AppErrorClass(`Reorder list must contain all ${totalFields} fields.`, 400);
    }

    // 2. Prepare bulk operations
    const bulkOps = orderedIds.map((id, index) => ({
        updateOne: {
            filter: { _id: id },
            update: { order: index },
        },
    }));

    if (bulkOps.length > 0) {
        const result = await FormConfig.bulkWrite(bulkOps);

        // 3. Verify that all IDs provided were actually found
        if (result.matchedCount !== orderedIds.length) {
            throw new AppErrorClass("Some field IDs provided were invalid.", 400);
        }
    }

    // 4. Return the refreshed, correctly sorted list (paginated)
    return await getFormConfigsService();
};


// PUBLIC 
export const getActiveFormConfigsService = async () => {
    return await FormConfig.find({ isActive: true })
        .select("-isActive -__v -createdAt -updatedAt")
        .sort({ order: 1 })
        .lean();
};






// INQUIRY SERVICES
// ADMIN

/**
 * Validates user responses against active form configurations
 * and returns a sanitized object containing only valid fields.
 */
export const validateAndSanitizeInquiry = (activeConfigs, userResponses) => {
    const sanitizedResponses = {};
    const errors = [];

    for (const field of activeConfigs) {
        let value = userResponses[field.name];

        // 1. Check Required
        const isEmpty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
        if (field.required && isEmpty) {
            errors.push(`Field '${field.label}' is required.`);
            continue;
        }

        // Skip further validation if empty and not required
        if (isEmpty) continue;

        // 2. Type-Specific Validation & Formatting
        if (field.type === 'email') {
            const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(value)) {
                errors.push(`Please provide a valid email address for '${field.label}'.`);
            }
        } else if (field.type === 'number') {
            if (isNaN(value)) {
                errors.push(`Field '${field.label}' must be a number.`);
            } else {
                value = Number(value); // Force to number type
            }
        } else if (['select', 'radio'].includes(field.type)) {
            const validOptions = field.options.map(opt => opt.value);
            if (!validOptions.includes(value)) {
                errors.push(`Invalid option selected for '${field.label}'.`);
            }
        } else if (field.type === 'checkbox') {
            if (!Array.isArray(value)) {
                errors.push(`Field '${field.label}' must be an array of options.`);
            } else {
                const validOptions = field.options.map(opt => opt.value);
                const invalidSelections = value.filter(val => !validOptions.includes(val));
                if (invalidSelections.length > 0) {
                    errors.push(`Invalid options selected for '${field.label}'.`);
                }
            }
        }

        // 3. Add to sanitized object (prevents extra/malicious fields)
        sanitizedResponses[field.name] = value;
    }

    return { sanitizedResponses, errors };
};

export const getInquiriesService = async ({ page = 1, limit = 10, status, search }) => {
    const skip = (page - 1) * limit;
    const filter = {};

    if (status && ["unread", "read"].includes(status)) {
        filter.status = status;
    }

    if (search) {
        // Since responses are dynamic, we fetch the field names to search against them
        const configs = await FormConfig.find().select("name");
        const searchQueries = configs.map(config => ({
            [`responses.${config.name}`]: { $regex: search, $options: "i" }
        }));

        if (searchQueries.length > 0) {
            filter.$or = searchQueries;
        }
    }

    const inquiries = await Inquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Inquiry.countDocuments(filter);

    return {
        inquiries,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getInquiryByIdService = async (id) => {
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
        throw new AppErrorClass("Inquiry not found", 404);
    }
    return inquiry;
};

export const updateInquiryStatusService = async (id, status) => {
    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
        throw new AppErrorClass("Inquiry not found", 404);
    }

    inquiry.status = status;
    await inquiry.save();
    return inquiry;
};

export const deleteInquiryService = async (id) => {
    const inquiry = await Inquiry.findByIdAndDelete(id);
    if (!inquiry) {
        throw new AppErrorClass("Inquiry not found", 404);
    }
    return inquiry;
};


// PUBLIC
export const createInquiryService = async (data) => {
    const inquiry = await Inquiry.create(data);
    return inquiry;
};


