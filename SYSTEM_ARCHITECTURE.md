# FADERCO QR Platform - System Architecture & Database Schema

## Database Overview

### Tables (15 total)

#### 1. **profiles** - User Account Management
- **Purpose**: Stores user profile information and roles
- **Key Columns**:
  - `id` (UUID, Primary Key - Auth User ID)
  - `email` (Text) - User's email
  - `full_name` (Text) - User's full name
  - `role` (Text) - "user" or "admin"
  - `status` (Text) - "pending", "approved", "rejected", "blocked"
  - `company` (Text) - Company name
  - `phone_number` (Text) - Phone number
  - `avatar_url` (Text) - Profile picture
- **RLS**: 5 policies - Users see own, admins see all
- **Critical**: New users start with `status = "pending"` and must be approved by admin

#### 2. **virtual_business_cards** - User's Business Cards
- **Purpose**: Virtual business card data and metadata
- **Key Columns**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key → profiles.id)
  - `qr_code_id` (UUID, Foreign Key → qr_codes.id)
  - `full_name`, `email`, `phone`, `company_name`, `job_title`, `website`
  - `profile_image_url` (Text) - User's profile photo
  - `cover_image_url` (Text) - Business card cover image
  - `theme_color`, `card_layout`, `background_style`
- **RLS**: Users manage own, public can view active cards
- **Note**: Images stored in Vercel Blob, URLs stored here

#### 3. **qr_codes** - QR Code Management
- **Purpose**: Stores QR code metadata and configuration
- **Key Columns**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key → profiles.id)
  - `short_code` (Text) - Generated short code for URL
  - `short_url` (Text) - Full short URL
  - `destination_url` (Text) - Where QR redirects to
  - `business_card_id` (UUID) - Links to business card
  - `type` (Text) - "standard", "business_card", etc.
  - `status` (Text) - "active", "inactive"
  - `is_active` (Boolean) - Activation flag
  - `scans_used` (Integer) - Number of scans
  - `scan_limit` (Integer) - Maximum allowed scans
  - `qr_image_url` (Text) - Generated QR code image
- **RLS**: Users manage own, public can read active QRs, admins see all
- **Important**: Redirect logic checks BOTH `is_active` AND `status`

#### 4. **scans** - QR Code Scan Tracking
- **Purpose**: Records when QR codes are scanned
- **Key Columns**:
  - `id` (UUID, Primary Key)
  - `qr_code_id` (UUID, Foreign Key → qr_codes.id)
  - `scanned_at` (Timestamp) - Scan time
  - `ip_address`, `browser`, `os`, `device_type`, `country`, `city`
  - `referrer`, `latitude`, `longitude`
- **RLS**: Users see own QR scans, admins see all
- **Note**: Captured on each QR redirect

#### 5. **pending_deletions** - Soft Delete Tracking
- **Purpose**: Tracks QR codes scheduled for deletion
- **Key Columns**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID) - User who scheduled deletion
  - `qr_code_id` (UUID, Foreign Key → qr_codes.id)
  - `scheduled_deletion_at` (Timestamp) - When to delete
  - `password_confirmed` (Boolean) - User confirmed password
  - `deletion_reason` (Text) - Why deleting
- **RLS**: Users manage own, admins view all
- **Critical**: QR codes with pending deletion should be filtered from list

#### 6. **activity_logs** - Audit Trail
- **Purpose**: Track all user actions for security
- **Key Columns**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID) - Who performed action
  - `action_type` (Text) - What action
  - `entity_type` (Text) - What was affected (QR, profile, etc)
  - `entity_id` (UUID) - Which entity
  - `old_value`, `new_value` (Text) - Before/after values
  - `ip_address`, `user_agent`, `device_info`
- **RLS**: Users see own, admins see all
- **Note**: Auto-logged by triggers

#### 7. **card_analytics** - Business Card Views
- **Purpose**: Analytics for who viewed business cards
- **Key Columns**:
  - `id` (UUID, Primary Key)
  - `card_id` (UUID, Foreign Key)
  - `event_type` (Text) - "view", "click", etc
  - `ip_address`, `browser`, `device_type`, `country`, `city`
  - `latitude`, `longitude`, `referrer`
- **RLS**: Users see own card analytics
- **Note**: Similar to scans but for business card page

#### 8. **login_history** - Security Tracking
- **Purpose**: Track login attempts and locations
- **Key Columns**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID) - Who logged in
  - `logged_in_at` (Timestamp)
  - `ip_address`, `browser`, `os`, `device_type`, `country`, `city`
- **RLS**: Users see own, admins see all
- **Note**: Auto-logged on successful login

#### 9. **nfc_requests** - NFC Card Requests
- **Purpose**: Track physical NFC card requests
- **Key Columns**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID) - Who requested
  - `status` (Text) - "pending", "approved", "shipped", "delivered"
  - `request_type` (Text)
  - `reason` (Text)
  - `timeline_start`, `timeline_delivery` (Timestamp)
  - `admin_notes` (Text)
- **RLS**: Users manage own, admins manage all
- **Note**: For physical NFC card fulfillment

#### 10. **user_sessions** - Session Management
- **Purpose**: Track active user sessions
- **Key Columns**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID) - Session owner
  - `session_token` (Text) - Token for session
  - `is_active` (Boolean)
  - `expires_at` (Timestamp)
  - `last_activity` (Timestamp)
  - `browser`, `os`, `device_type`, `ip_address`
- **RLS**: Users see own, admins see all
- **Note**: For multi-device session tracking

#### 11. **settings** - Platform Configuration
- **Purpose**: Global platform settings
- **Key Columns**:
  - `id` (UUID, Primary Key)
  - `key` (Text) - Setting name
  - `value` (Text) - Setting value
- **RLS**: Admins manage, public reads some
- **Examples**: `footer_text`, `tutorial_video_url`, `support_info`

#### 12. **carousel_slides** - Landing Page Carousel
- **Purpose**: Homepage carousel image slides
- **Key Columns**:
  - `id` (UUID, Primary Key)
  - `image_url` (Text) - Slide image
  - `link_url` (Text) - Where slide links to
  - `is_active` (Boolean)
  - `display_order` (Integer)
  - `duration_seconds` (Integer) - Show duration
- **RLS**: Admins manage, public views active

#### 13. **landing_sections** - Landing Page Sections
- **Purpose**: Customizable landing page sections
- **Key Columns**:
  - `id` (UUID, Primary Key)
  - `section_number` (Integer) - Order
  - `title`, `description` (Text)
  - `video_url`, `youtube_url` (Text)
- **RLS**: Admins manage, public reads

#### 14. **allowed_domains** - Email Domain Whitelist
- **Purpose**: Restrict registrations to certain email domains
- **Key Columns**:
  - `id` (UUID, Primary Key)
  - `domain` (Text) - Allowed email domain
  - `created_by` (UUID) - Admin who added
- **RLS**: Anyone reads, admins manage

#### 15. **nfc_requests** - NFC Card Order Tracking
- **Purpose**: Physical NFC card fulfillment
- **Key Columns**: (See above)

---

## Critical User Flows

### 1. User Registration & Approval Flow
```
1. User fills registration form
2. Creates auth account (not yet approved)
3. Profile created with status = "pending"
4. Email confirmation sent (if configured)
5. Admin views "Pending Accounts" section
6. Admin clicks "Approve & Confirm"
   - Confirms email in auth.users
   - Updates profiles.status = "approved"
7. User can now login and access dashboard
8. User creates business card
9. Business card auto-generates QR code
10. QR code can be scanned
```

### 2. QR Code Redirect Flow
```
1. QR scanned → GET /api/redirect/[shortCode]
2. Look up qr_code with short_code
3. Check: is_active = true AND status = "active"
4. If inactive/pending deletion → show error
5. If active → redirect to destination_url
6. Log scan in scans table with geo/device data
7. Update scan count in qr_codes.scans_used
```

### 3. QR Code Soft Delete Flow
```
1. User clicks "Delete QR"
2. Creates row in pending_deletions table
3. QR still exists but filtered from list
4. loadQRCodes() filters by checking pending_deletions
5. If user cancels → delete from pending_deletions
6. After delay → cron job actually deletes QR
```

---

## Authentication & Authorization

### Middleware (lib/supabase/middleware.ts)
- Checks if user is authenticated
- Redirects unauthenticated to /auth/login
- Routes admins to /admin, regular users to /dashboard
- Allows public routes: /, /auth/*, /business-card/*, /api/redirect/*

### Admin Layout (app/admin/layout.tsx)
- Checks: `role === "admin"` AND `status === "approved"`
- Redirects non-admins to /dashboard
- Protects all /admin/* routes

### Action Authorization
- All server actions check `adminProfile?.role === "admin"`
- Returns error if not admin
- Logs admin actions to activity_logs

---

## Image Storage

### Storage Location: Vercel Blob
- Profile images: `/profiles/[userId]/profile.jpg`
- Cover images: `/profiles/[userId]/cover.jpg`
- QR code images: `/qr-codes/[qrId]/qr.png`
- Carousel images: `/carousel/[slideId]/image.jpg`

### How URLs Work
1. Image uploaded to Blob → Returns public URL
2. URL stored in database (profile_image_url, cover_image_url)
3. When displaying → Use stored URL directly
4. CORS: Images have `crossOrigin="anonymous"`

---

## Performance Considerations

1. **QR Code Filtering**: Filter pending deletions in component (client-side)
   - Don't add WHERE clause → Load all, then filter
   - Reason: Avoid joining pending_deletions on every query

2. **Admin Queries**: Admins see all data (no user_id filter)
   - This is why admin views load system-wide stats

3. **Caching**: Use revalidatePath() after mutations
   - Ensures next requests get fresh data

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL (should be https://fadercoqr.com)
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
```

---

## Common Issues & Fixes

### Issue: Admin can't see pending users
- **Cause**: Client using auth.admin.getUserById() requires service role
- **Fix**: Use server action, pass SERVICE_ROLE_KEY to admin client

### Issue: QR code changes not reflecting
- **Cause**: No revalidatePath() after update
- **Fix**: Add revalidatePath("/admin") and revalidatePath("/dashboard")

### Issue: Soft-deleted QRs still showing
- **Cause**: Not filtering pending_deletions in loadQRCodes()
- **Fix**: Filter client-side after state loads

### Issue: Images not loading on business cards
- **Cause**: Missing profile_image_url field or CORS issue
- **Fix**: Add crossOrigin="anonymous" to img tags

---
