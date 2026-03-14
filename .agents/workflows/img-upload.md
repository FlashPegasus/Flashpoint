---
description: Upload an image to PostImages and get a direct link automatically.
---
# /img-upload Workflow

Use this workflow when the USER provides a local image or a path and wants it hosted on PostImages for the site.

## Steps

1. **Receive Image**: The user provides the absolute path to the image or the image itself exported to the workspace.
2. **Open Browser**: Use `browser_subagent` to navigate to `https://postimages.org/`.
3. **Upload**:
    - Locate the file input (typically `<input type="file">`).
    - Use `setInputFiles` or equivalent sub-agent tool with the local file path.
    - Wait for the upload to process.
4. **Extract Link**:
    - Navigate to the "Direct Link" field in the results page.
    - Copy the URL (the one ending in `.png`, `.jpg`, etc.).
5. **Implement**: 
    - Update the target component (e.g., Navbar) with the new URL.
    - Verify the image renders correctly in the site.

// turbo
6. **Cleanup**: If the image was a temporary file, delete it from the system.
