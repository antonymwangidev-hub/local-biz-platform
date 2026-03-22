# LocalBiz Connect 2.0 - Technical Roadmap

## Project Vision

Transform LocalBiz Connect from a basic business directory into a **comprehensive social platform** for local business engagement, collaboration, and growth with gamification, analytics, and community features.

---

## Phase 1: Foundation & Database (Week 1)

### Database Schema Extensions

#### New Tables:

1. **posts**
   ```sql
   - id (uuid, PK)
   - business_id (FK → businesses)
   - type (promotion | update | announcement)
   - title (text)
   - content (text)
   - attachments (jsonb) - images, videos
   - likes_count (int)
   - comments_count (int)
   - created_at (timestamp)
   - updated_at (timestamp)
   ```

2. **comments**
   ```sql
   - id (uuid, PK)
   - post_id (FK → posts)
   - user_id (FK → users)
   - content (text)
   - likes_count (int)
   - created_at (timestamp)
   ```

3. **post_likes**
   ```sql
   - id (uuid, PK)
   - post_id (FK → posts)
   - user_id (FK → users)
   - created_at (timestamp)
   - UNIQUE(post_id, user_id)
   ```

4. **badges**
   ```sql
   - id (uuid, PK)
   - name (text)
   - description (text)
   - icon_url (text)
   - criteria (jsonb)
   - created_at (timestamp)
   ```

5. **user_badges**
   ```sql
   - id (uuid, PK)
   - user_id (FK → users)
   - badge_id (FK → badges)
   - earned_at (timestamp)
   - UNIQUE(user_id, badge_id)
   ```

6. **collaborations**
   ```sql
   - id (uuid, PK)
   - requesting_business_id (FK → businesses)
   - collaboration_type (partnership | cross-promotion | event)
   - description (text)
   - status (open | interested | matched | completed)
   - interested_businesses (jsonb) - array of business_ids
   - created_at (timestamp)
   ```

7. **business_analytics**
   ```sql
   - id (uuid, PK)
   - business_id (FK → businesses)
   - profile_views (int)
   - post_engagement (int)
   - booking_count (int)
   - review_count (int)
   - date (date)
   - created_at (timestamp)
   ```

8. **business_groups**
   ```sql
   - id (uuid, PK)
   - name (text)
   - description (text)
   - category (industry | interest | location)
   - members_count (int)
   - created_at (timestamp)
   ```

9. **group_members**
   ```sql
   - id (uuid, PK)
   - group_id (FK → business_groups)
   - business_id (FK → businesses)
   - joined_at (timestamp)
   ```

10. **stories**
    ```sql
    - id (uuid, PK)
    - user_id (FK → users)
    - business_id (FK → businesses) - nullable, for check-ins
    - content (text)
    - media_urls (jsonb)
    - expires_at (timestamp)
    - created_at (timestamp)
    ```

11. **polls**
    ```sql
    - id (uuid, PK)
    - business_id (FK → businesses)
    - question (text)
    - options (jsonb) - [{id, text, votes}]
    - status (active | closed)
    - expires_at (timestamp)
    - created_at (timestamp)
    ```

12. **poll_responses**
    ```sql
    - id (uuid, PK)
    - poll_id (FK → polls)
    - user_id (FK → users)
    - selected_option (text)
    - created_at (timestamp)
    ```

---

## Phase 2: Social Feed (Week 2)

### Components to Build:

1. **PostCard.tsx** (enhanced)
   - Display business name, avatar, post type badge
   - Content with images/video preview
   - Like button (animated)
   - Comments section with quick reply
   - Share button
   - Color-coded post types

2. **CreatePostModal.tsx** (enhanced)
   - Text input with formatting
   - Image/video upload (using existing mediaUpload system)
   - Post type selector (dropdown)
   - Preview before posting
   - Character counter

3. **Feed.tsx** (enhanced)
   - Chronological timeline
   - Real-time updates (Supabase subscription)
   - Infinite scroll pagination
   - Filter by post type
   - Search posts

4. **CommentSection.tsx** (new)
   - Display comments with avatars
   - Reply functionality
   - Like individual comments
   - Nested replies (optional)

---

## Phase 3: Gamification System (Week 3)

### Badge Types:

```
1. Profile Completion
   - Criteria: Business profile 100% complete
   - Display: Gold star icon

2. Social Butterfly
   - Criteria: 10+ posts in a month
   - Display: Butterfly icon

3. Event Host
   - Criteria: Host 5+ events
   - Display: Calendar icon

4. Responsive Pro
   - Criteria: Respond to all reviews within 24 hours
   - Display: Checkmark icon

5. Community Leader
   - Criteria: 100+ followers or high engagement
   - Display: Crown icon

6. Collaborator
   - Criteria: Complete 3+ collaborations
   - Display: Handshake icon

7. Top Rated
   - Criteria: Maintain 4.5+ rating
   - Display: Star icon
```

### Components:

1. **BadgeDisplay.tsx** (new)
   - Show earned badges with tooltip
   - Display on profiles and posts

2. **AchievementModal.tsx** (new)
   - Celebrate when badge is earned
   - Show progress to next badge

3. **LeaderboardView.tsx** (new)
   - Top 10 businesses by engagement
   - Top 10 by rating
   - Top 10 by reviews

---

## Phase 4: Analytics Dashboard (Week 4)

### Metrics to Track:

- Profile Views (daily, weekly, monthly)
- Post Engagement (likes, comments, shares)
- Booking Count
- Review Count & Average Rating
- Follower Growth

### Components:

1. **AnalyticsDashboard.tsx** (new)
   - Overview cards (top metrics)
   - Line charts for trends
   - Pie charts for engagement breakdown
   - AI suggestions based on data

2. **InsightCard.tsx** (new)
   - Actionable recommendations
   - "Your posts get 2x engagement on Saturdays"
   - Quick action buttons

---

## Phase 5: Collaboration Matching (Week 5)

### Algorithm:

1. Suggest businesses in complementary categories
2. Consider location proximity
3. Consider rating & engagement level
4. Show successful past collaborations

### Components:

1. **CollaborationRequestsPage.tsx** (new)
   - Browse open requests
   - Express interest
   - View interested businesses

2. **CollaborationCard.tsx** (new)
   - Show request details
   - Display interested businesses
   - Accept/decline matches

3. **SuggestedMatches.tsx** (new)
   - AI-recommended business matches
   - Match score percentage
   - Quick action buttons

---

## Phase 6: Events Calendar & RSVP (Week 6)

### Enhancements:

1. Calendar View Component
2. Event details modal with RSVP
3. Attendee list management
4. Email confirmations
5. Reminder notifications

---

## Phase 7: Communities & Groups (Week 7)

### Features:

1. Group creation by category
2. Member management
3. Group feed for discussions
4. Notification center
5. Group analytics

---

## Phase 8: Customer Engagement Tools (Week 8)

### Features:

1. Check-in Stories
2. Polls/Surveys
3. User-generated content feeds
4. Story expiration (24 hours)
5. Analytics for story performance

---

## Phase 9: Learning Hub (Week 9)

### Content Types:

1. Marketing tips (SEO, social media, email)
2. Operations guides (scheduling, inventory)
3. Customer service best practices
4. Video tutorials
5. Case studies

### Tracking:

- Progress bars
- Completion badges
- Certificates (optional)

---

## Implementation Strategy

### Priority Order:

**Must-Have (MVP):**
1. ✅ Social Feed with Posts
2. ✅ Basic Gamification (badges)
3. ✅ Business Analytics Dashboard
4. ✅ Enhanced Events

**Nice-to-Have:**
5. Collaboration Matching
6. Business Groups
7. Customer Stories/Polls

**Future Enhancements:**
8. Learning Hub
9. AR Discovery
10. Advanced AI Suggestions

---

## Tech Stack

- **Frontend:** React + TypeScript
- **Backend:** Supabase (PostgreSQL)
- **Real-time:** Supabase Realtime subscriptions
- **File Storage:** Supabase Storage (existing)
- **Styling:** Tailwind CSS (existing)
- **Charts:** Recharts or Chart.js

---

## Development Timeline

- **Phase 1 (Database):** 2-3 days
- **Phase 2 (Feed):** 3-4 days
- **Phase 3 (Gamification):** 2-3 days
- **Phase 4 (Analytics):** 3-4 days
- **Phases 5-9:** 2-3 days each

**Total Estimated Time:** 4-6 weeks for full implementation

---

## Next Steps

1. ✅ Approval on architecture
2. ⏳ Create database migrations (Phase 1)
3. ⏳ Build social feed components (Phase 2)
4. ⏳ Implement gamification system (Phase 3)
5. ⏳ Deploy and test

---

## Questions to Clarify

1. **Priority:** Which features are most important for MVP?
2. **Timeline:** When do you need this deployed?
3. **AR Feature:** Do you want AR local discovery in initial version?
4. **Payments:** Should we add premium features with payment integration?
5. **Notifications:** Email, in-app, or push notifications?

**Ready to proceed with Phase 1 (Database)?** Let me know! 🚀
