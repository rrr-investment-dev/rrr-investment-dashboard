import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

/**
 * Removes background from an image and saves it as a PNG file.
 * Returns the new path or null if it fails.
 */
export const processBackgroundRemoval = async (inputPath) => {
    try {
        // Read file using absolute path just to be safe
        const absolutePath = path.resolve(inputPath);
        const fileUrl = pathToFileURL(absolutePath).href;

        // Remove background using proper file URL
        const blob = await removeBackground(fileUrl);
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate new file name (change extension to .png)
        const parsedPath = path.parse(absolutePath);
        const newFileName = `${parsedPath.name}-bg-removed.png`;
        const newPath = path.join(parsedPath.dir, newFileName);

        // Save new file
        fs.writeFileSync(newPath, buffer);

        // Delete original file
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }

        // Return the relative path to be saved in DB
        // Assuming inputPath is like "uploads/teams/..."
        const originalRelativeDir = path.dirname(inputPath);
        return path.posix.join(originalRelativeDir.replace(/\\/g, '/'), newFileName);
    } catch (error) {
        console.error("Background removal failed:", error);
        return inputPath; // Fallback to original image if it fails
    }
};
