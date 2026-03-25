# Firebase Storage Setup Guide

Your product images are now stored in **Firebase Storage** instead of Firestore. This provides better performance and scalability.

## How It Works

1. **Image Upload**: When you upload an image, it goes to Firebase Storage
2. **Download URL**: Firebase generates a permanent download URL
3. **URL Storage**: Only the download URL (not the image data) is stored in Firestore in the `imageURLs` array
4. **Benefits**: 
   - Smaller Firestore documents
   - Better performance
   - Unlimited image size (per file limits)
   - Easy image deletion from storage

## Firebase Storage Security Rules

You need to configure Firebase Security Rules to allow uploads. Follow these steps:

### 1. Go to Firebase Console
- Visit [Firebase Console](https://console.firebase.google.com/)
- Select your project: **outfy-44079**
- Go to **Storage** from left menu

### 2. Set Storage Rules

Click on **Rules** tab and replace the existing rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload/read product images
    match /products/{allPaths=**} {
      allow read: if true;  // Anyone can view/download images
      allow write: if request.auth != null;  // Only authenticated users can upload
    }
  }
}
```

### 3. Publish Rules

- Click **Publish** button
- Confirm the changes

## Testing Image Upload

1. Open your admin panel
2. Go to **Products** page
3. Click **Add Product**
4. Fill in product details
5. Click **Click to upload images** and select image files
6. Images upload to Firebase Storage automatically
7. You'll see preview thumbnails
8. Save the product - download URLs are stored in Firestore

## Firebase Configuration

Your Firebase config already includes Storage:

```javascript
import { getStorage } from "firebase/storage";
export const storage = getStorage(app);
```

This is imported in `productService.js` automatically.

## Image Upload Function

The `uploadImage()` function now:
- ✅ Validates file type (JPEG, PNG, WebP, GIF only)
- ✅ Validates file size (max 5MB)
- ✅ Uploads to Firebase Storage
- ✅ Returns permanent download URL
- ✅ Organizes files by product ID

## Deleting Images

When you remove an image from a product:
1. The file is deleted from Firebase Storage
2. The URL is removed from Firestore document

When you delete a product:
- **Note**: Image files remain in Storage (Firestore document deleted)
- To clean up: You may want to delete unused images from Storage console periodically

## Troubleshooting

### "Permission denied" error
- Check Security Rules are published (see step 2-3 above)
- Ensure you're logged in (Firebase Auth should be working)

### "File size exceeds limit"
- Maximum file size is 5MB
- Compress images before upload if needed

### Images not displaying
- Check that download URL is valid
- Verify Storage Rules allow public read access
- Check browser console for errors

## File Organization in Storage

Images are organized in this structure:

```
storage/
└── products/
    ├── product_id_1/
    │   ├── 1234567890_image1.jpg
    │   └── 1234567890_image2.png
    └── product_id_2/
        └── 1234567890_image.jpg
```

**For new products**, images are initially organized under a temporary folder that matches the upload order, but download URLs remain valid after the product is created.

## API Reference

### uploadImage(file, productId)
- Uploads image file to Storage
- Returns: Promise<string> (download URL)
- Throws: Error if validation fails

### deleteImage(imageURL)
- Deletes file from Storage using download URL
- Returns: Promise<void>
- Throws: Error if deletion fails

Both functions are used automatically in the Products component.
