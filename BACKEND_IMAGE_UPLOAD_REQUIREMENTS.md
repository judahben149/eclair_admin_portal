# Backend Image Upload Implementation Guide

## Overview

The frontend admin portal now supports **direct image uploads** from the user's PC. This document provides complete instructions for implementing the backend image upload endpoint using **Cloudinary** for cloud storage.

---

## What the Frontend Expects

### API Endpoint
**POST** `/api/v1/admin/upload/image`

### Request Format
- **Content-Type**: `multipart/form-data`
- **Authorization**: `Bearer {JWT token}` (Required - admin only)
- **Body**: Form data with file field named `file`

### Example Request (cURL)
```bash
curl -X POST "https://your-api.com/api/v1/admin/upload/image" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/image.jpg"
```

### Response Format
```json
{
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/concepts/abc123.jpg"
}
```

### Error Responses

**400 Bad Request** - Invalid file
```json
{
  "message": "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed."
}
```

**413 Payload Too Large** - File too big
```json
{
  "message": "File size exceeds 10 MB limit."
}
```

**500 Internal Server Error** - Upload failed
```json
{
  "message": "Failed to upload image to cloud storage."
}
```

---

## Implementation Steps

### Step 1: Add Cloudinary Dependency

Add to your `pom.xml`:

```xml
<dependency>
    <groupId>com.cloudinary</groupId>
    <artifactId>cloudinary-http44</artifactId>
    <version>1.36.0</version>
</dependency>
```

Then run:
```bash
mvn clean install
```

### Step 2: Configure Cloudinary

#### 2.1: Get Cloudinary Credentials

1. Sign up at https://cloudinary.com (Free tier: 25GB storage, 25GB bandwidth/month)
2. Go to Dashboard → Settings → API Keys
3. Copy:
   - **Cloud Name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

#### 2.2: Add to Environment Variables

**For Railway (Production)**:
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

**For Local Development**:**
```properties
cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=123456789012345
cloudinary.api-secret=abcdefghijklmnopqrstuvwxyz
```

#### 2.3: Create Cloudinary Configuration Class

**File**: `src/main/java/com/eclair/admin/config/CloudinaryConfig.java`

```java
package com.eclair.admin.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:#{environment.CLOUDINARY_CLOUD_NAME}}")
    private String cloudName;

    @Value("${cloudinary.api-key:#{environment.CLOUDINARY_API_KEY}}")
    private String apiKey;

    @Value("${cloudinary.api-secret:#{environment.CLOUDINARY_API_SECRET}}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret,
            "secure", true
        ));
    }
}
```

### Step 3: Create Image Upload Service

**File**: `src/main/java/com/eclair/admin/service/ImageUploadService.java`

```java
package com.eclair.admin.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class ImageUploadService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final String[] ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"};

    @Autowired
    private Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        // Validate file
        validateFile(file);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String uniqueFilename = "concept_" + UUID.randomUUID().toString() + extension;

        // Upload to Cloudinary
        Map<String, Object> uploadParams = ObjectUtils.asMap(
            "folder", "eclair/concepts",           // Organize in folder
            "public_id", uniqueFilename,           // Unique filename
            "resource_type", "image",              // Image resource
            "overwrite", false,                    // Don't overwrite
            "transformation", new Transformation()
                .width(1920).height(1080)          // Max dimensions
                .crop("limit")                      // Don't upscale
                .quality("auto")                    // Auto quality
                .fetchFormat("auto")                // Auto format (WebP if supported)
        );

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);

        // Return the secure URL
        return (String) uploadResult.get("secure_url");
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10 MB limit");
        }

        // Check file type
        String contentType = file.getContentType();
        boolean isValidType = false;
        for (String allowedType : ALLOWED_TYPES) {
            if (allowedType.equals(contentType)) {
                isValidType = true;
                break;
            }
        }

        if (!isValidType) {
            throw new IllegalArgumentException(
                "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed."
            );
        }
    }
}
```

### Step 4: Create Upload Controller

**File**: `src/main/java/com/eclair/admin/controller/FileUploadController.java`

```java
package com.eclair.admin.controller;

import com.eclair.admin.service.ImageUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/upload")
@PreAuthorize("hasRole('ADMIN')")
public class FileUploadController {

    @Autowired
    private ImageUploadService imageUploadService;

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = imageUploadService.uploadImage(file);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            // Validation errors (400 Bad Request)
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (IOException e) {
            // Upload errors (500 Internal Server Error)
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to upload image to cloud storage");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
```

### Step 5: Configure File Upload Limits

**File**: `src/main/resources/application.properties`

```properties
# File upload configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### Step 6: Update CORS Configuration (If Needed)

If you're testing from localhost frontend (http://localhost:5173), make sure CORS allows the origin:

**File**: `src/main/java/com/eclair/admin/config/SecurityConfig.java`

```java
// In your CORS configuration
configuration.setAllowedOrigins(List.of(
    "http://localhost:5173",                                              // Local dev
    "https://eclair-admin-portal.vercel.app",                            // Production
    "https://eclair-admin-server-production-b1b2.up.railway.app"         // Your backend
));
configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
configuration.setAllowedHeaders(List.of("*"));
configuration.setAllowCredentials(true);
```

---

## Testing the Implementation

### Test 1: Upload via cURL

```bash
# Get JWT token first
TOKEN=$(curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

# Upload image
curl -X POST "http://localhost:8080/api/v1/admin/upload/image" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test-image.jpg"

# Expected response:
# {"imageUrl":"https://res.cloudinary.com/your-cloud/image/upload/v1234567890/eclair/concepts/concept_abc-123.jpg"}
```

### Test 2: Test Validation

**Test file size limit**:
```bash
# Upload 11 MB file (should fail)
curl -X POST "http://localhost:8080/api/v1/admin/upload/image" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/large-file.jpg"

# Expected: 400 Bad Request
# {"message":"File size exceeds 10 MB limit"}
```

**Test invalid file type**:
```bash
# Upload PDF file (should fail)
curl -X POST "http://localhost:8080/api/v1/admin/upload/image" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.pdf"

# Expected: 400 Bad Request
# {"message":"Invalid file type. Only JPG, PNG, GIF, and WebP are allowed."}
```

### Test 3: Test from Frontend

1. Start backend: `mvn spring-boot:run`
2. Start frontend: `npm run dev`
3. Login to admin portal
4. Go to `/concepts/new`
5. Add a section
6. Add an image content item
7. Click "Choose File" or drag-and-drop an image
8. Watch the upload progress
9. Verify the image URL is saved

---

## Optional Enhancements

### 1. Image Optimization

Cloudinary automatically optimizes images. The transformation in the code:
- Limits max dimensions to 1920x1080
- Auto-quality (reduces file size)
- Auto-format (serves WebP to supported browsers)

### 2. Delete Old Images

Track uploaded images and delete unused ones:

```java
@Service
public class ImageCleanupService {

    @Autowired
    private Cloudinary cloudinary;

    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
```

### 3. Metadata Storage

Store upload metadata in database:

```java
@Entity
public class UploadedImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cloudinaryId;
    private String url;
    private Long fileSize;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
}
```

### 4. Image Thumbnails

Generate thumbnails for list views:

```java
// In upload service
String thumbnailUrl = cloudinary.url()
    .transformation(new Transformation()
        .width(300).height(200)
        .crop("fill")
        .quality("auto"))
    .generate(publicId);
```

---

## Troubleshooting

### Issue: "Invalid credentials"
- Check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Verify environment variables are set in Railway
- Check spelling in `application.properties`

### Issue: "File too large"
- Check `spring.servlet.multipart.max-file-size`
- Verify frontend sends files < 10 MB
- Check Cloudinary account limits

### Issue: "CORS error"
- Add frontend origin to CORS allowed origins
- Ensure `Access-Control-Allow-Origin` header is set
- Check SecurityConfig.java CORS configuration

### Issue: Upload works but image not displaying
- Check Cloudinary URL in response
- Verify image is accessible (open URL in browser)
- Check image permissions (should be public)

---

## Production Checklist

- [ ] Cloudinary credentials set in Railway environment variables
- [ ] CORS configured for production frontend domain
- [ ] File size limit enforced (10 MB)
- [ ] File type validation working
- [ ] JWT authentication required
- [ ] Error responses are user-friendly
- [ ] Images organized in Cloudinary folder (`eclair/concepts`)
- [ ] Images optimized (auto-quality, auto-format)
- [ ] Tested with various image formats
- [ ] Tested with large files (should reject > 10 MB)
- [ ] Tested with invalid file types (should reject PDFs, etc.)

---

## Cost Estimate

### Cloudinary Free Tier
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25 credits/month (1 credit ≈ 1 transformation)

**Typical Usage**:
- Average image: 500 KB
- 25 GB ÷ 500 KB = ~50,000 images
- More than enough for educational content

**If you exceed free tier**:
- Pay-as-you-go: ~$0.10/GB storage, ~$0.10/GB bandwidth
- Or upgrade to paid plan: $89/month for 175 GB

---

## Summary

**What you need to do**:

1. ✅ Add Cloudinary dependency to `pom.xml`
2. ✅ Sign up for Cloudinary account (free)
3. ✅ Set environment variables in Railway
4. ✅ Create `CloudinaryConfig.java`
5. ✅ Create `ImageUploadService.java`
6. ✅ Create `FileUploadController.java`
7. ✅ Configure file upload limits
8. ✅ Test the endpoint

**Estimated time**: 30-60 minutes

**Frontend is ready!** Once you deploy the backend endpoint, image uploads will work automatically.

---

## Questions?

If you need help:
1. Check Cloudinary docs: https://cloudinary.com/documentation/java_integration
2. Test with cURL first before testing from frontend
3. Check backend logs for detailed error messages
4. Verify JWT token is valid and not expired

**The frontend is fully implemented and waiting for your backend endpoint! 🚀**
