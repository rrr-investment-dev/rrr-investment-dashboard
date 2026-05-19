import catchAsync from "../../../common/Utils/catchAsync.js";
import AppErrorClass from "../../../common/Utils/AppErrorClass.js";
import * as contactService from "./contact.service.js";
import { logActivity } from "../../../common/Utils/activityLogger.js";

// FORM CONFIGURATION CONTROLLERS (Admin)

const validateFormConfigData = (data, isUpdate = false) => {
    const { label, type, options } = data;

    if (!isUpdate && (!label || !type)) {
        return "Label and type are required fields.";
    }

    if (type) {
        const validTypes = ["text", "email", "tel", "url", "textarea", "number", "select", "radio", "checkbox", "date", "time", "file"];
        if (!validTypes.includes(type)) {
            return `Invalid type. Allowed types: ${validTypes.join(", ")}`;
        }
    }

    // Conditional validation for options
    // If it's a create, or if type is being updated to a multi-option type,
    // or if options are being updated for a multi-option type.
    if (["select", "radio", "checkbox"].includes(type)) {
        if (!options || !Array.isArray(options) || options.length === 0) {
            return `Options array is required for type '${type}'.`;
        }
    }

    if (options !== undefined) {
        if (!Array.isArray(options)) {
            return "Options must be an array.";
        }
        for (const opt of options) {
            if (!opt.label || !opt.value) {
                return "Each option must have both a 'label' and a 'value'.";
            }
        }
    }

    return null;
};

export const getFormConfigs = catchAsync(async (req, res, next) => {
    let { page, limit } = req.query;

    // Basic validation for pagination
    if (page && (isNaN(page) || page < 1)) page = 1;
    if (limit && (isNaN(limit) || limit < 1)) limit = 50;

    const data = await contactService.getFormConfigsService({
        ...req.query,
        page: Number(page) || 1,
        limit: Number(limit) || 50
    });

    res.status(200).json({
        status: "success",
        message: "Form configurations fetched successfully",
        data: data,
    });
});

export const getFormConfigById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const config = await contactService.getFormConfigByIdService(id);

    res.status(200).json({
        status: "success",
        message: "Form field configuration fetched successfully",
        data: config,
    });
});

export const createFormConfig = catchAsync(async (req, res, next) => {
    const { label, type, placeholder, required, options, order } = req.body;

    const validationError = validateFormConfigData(req.body);
    if (validationError) {
        return next(new AppErrorClass(validationError, 400));
    }

    const config = await contactService.createFormConfigService({
        label, type, placeholder, required, options, order
    });

    // Log administrative activity
    await logActivity({
        action: "Form config changed",
        detail: `Field "${config.label}" added`,
        module: "website",
        userId: req.user?.id || req.user?._id || null,
    });

    res.status(201).json({
        status: "success",
        message: "Form field created successfully",
        data: config,
    });
});

export const updateFormConfig = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { label, type, placeholder, required, options, order } = req.body;

    const validationError = validateFormConfigData(req.body, true);
    if (validationError) {
        return next(new AppErrorClass(validationError, 400));
    }

    const config = await contactService.updateFormConfigService(id, { label, type, placeholder, required, options, order });

    if (!config) {
        return next(new AppErrorClass("Form field not found", 404));
    }

    // Log administrative activity
    await logActivity({
        action: "Form config changed",
        detail: `Field "${config.label}" revised`,
        module: "website",
        userId: req.user?.id || req.user?._id || null,
    });

    res.status(200).json({
        status: "success",
        message: "Form field updated successfully",
        data: config,
    });
});

export const deleteFormConfig = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const config = await contactService.deleteFormConfigService(id);

    if (!config) {
        return next(new AppErrorClass("Form field not found", 404));
    }

    // Log administrative activity
    await logActivity({
        action: "Form config changed",
        detail: `Field "${config.label}" removed`,
        module: "website",
        userId: req.user?.id || req.user?._id || null,
    });

    res.status(200).json({
        status: "success",
        message: "Form field deleted successfully",
    });
});

export const toggleFormConfigStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!req.body || req.body.isActive === undefined) {
        return next(new AppErrorClass("isActive field is required in the request body", 400));
    }

    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
        return next(new AppErrorClass("isActive must be a boolean value", 400));
    }

    const config = await contactService.toggleFormConfigStatusService(id, isActive);

    // Log administrative activity
    await logActivity({
        action: "Form config changed",
        detail: `Field "${config.label}" ${isActive ? "activated" : "deactivated"}`,
        module: "website",
        userId: req.user?.id || req.user?._id || null,
    });

    res.status(200).json({
        status: "success",
        message: `Form field ${isActive ? "activated" : "deactivated"} successfully`,
        data: config,
    });
});

export const reorderFormConfigs = catchAsync(async (req, res, next) => {
    const { orderedIds } = req.body; // Expects an array of IDs in new order

    if (!Array.isArray(orderedIds)) {
        return next(new AppErrorClass("orderedIds must be an array of string IDs", 400));
    }

    const configs = await contactService.reorderFormConfigsService(orderedIds);

    // Log administrative activity
    await logActivity({
        action: "Form config changed",
        detail: "Contact Form fields reordered",
        module: "website",
        userId: req.user?.id || req.user?._id || null,
    });

    res.status(200).json({
        status: "success",
        message: "Form fields reordered successfully",
        data: configs,
    });
});

// PUBLIC

export const getActiveFormConfigsPublic = catchAsync(async (req, res, next) => {
    const configs = await contactService.getActiveFormConfigsService();

    res.status(200).json({
        status: "success",
        message: "Active form configurations fetched successfully",
        data: configs,
    });
});



// INQUIRY CONTROLLERS (Admin)

export const getInquiries = catchAsync(async (req, res, next) => {
    let { page, limit } = req.query;

    if (page && (isNaN(page) || page < 1)) page = 1;
    if (limit && (isNaN(limit) || limit < 1)) limit = 10;

    const data = await contactService.getInquiriesService({
        ...req.query,
        page: Number(page) || 1,
        limit: Number(limit) || 10
    });

    res.status(200).json({
        status: "success",
        message: "Inquiries fetched successfully",
        ...data,
    });
});

export const getInquiryById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const inquiry = await contactService.getInquiryByIdService(id);

    res.status(200).json({
        status: "success",
        message: "Inquiry fetched successfully",
        data: inquiry,
    });
});

export const updateInquiryStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["unread", "read"].includes(status)) {
        return next(new AppErrorClass("Invalid status. Allowed: unread, read", 400));
    }

    const inquiry = await contactService.updateInquiryStatusService(id, status);

    // Log administrative activity
    await logActivity({
        action: "Inquiry status updated",
        detail: `Inquiry status changed to ${status}`,
        module: "website",
        userId: req.user?.id || req.user?._id || null,
    });

    res.status(200).json({
        status: "success",
        message: "Inquiry status updated successfully",
        data: inquiry,
    });
});

export const deleteInquiry = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await contactService.deleteInquiryService(id);

    // Log administrative activity
    await logActivity({
        action: "Inquiry deleted",
        detail: "Contact Inquiry removed",
        module: "website",
        userId: req.user?.id || req.user?._id || null,
    });

    res.status(200).json({
        status: "success",
        message: "Inquiry deleted successfully",
    });
});

// PUBLIC 

export const submitInquiryPublic = catchAsync(async (req, res, next) => {
    const { responses } = req.body;

    if (!responses || typeof responses !== 'object') {
        return next(new AppErrorClass("Responses object is required", 400));
    }

    // 1. Fetch active configurations to validate against
    const activeConfigs = await contactService.getActiveFormConfigsService();

    // 2. Validate and Sanitize responses
    const { sanitizedResponses, errors } = contactService.validateAndSanitizeInquiry(activeConfigs, responses);

    if (errors.length > 0) {
        return next(new AppErrorClass(errors[0], 400));
    }

    // 3. Save Inquiry (using sanitized data only)
    const inquiryData = {
        responses: sanitizedResponses,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    };

    const inquiry = await contactService.createInquiryService(inquiryData);

    // Log administrative activity
    await logActivity({
        action: "New inquiry received",
        detail: "Contact form submission from website",
        module: "website",
        userId: null,
    });

    res.status(201).json({
        status: "success",
        message: "Inquiry submitted successfully",
        data: inquiry,
    });
});
