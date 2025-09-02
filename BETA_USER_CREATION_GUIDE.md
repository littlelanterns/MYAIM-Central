# Beta User Creation Guide

## 🎯 **How to Add Beta Users**

### **Method 1: Through AIM-Admin Dashboard (Recommended)**

1. **Access AIM-Admin**:
   - Click "AIM-Admin" button in QuickActions, OR
   - Navigate to `/aim-admin`

2. **Navigate to Beta Testing Tab**:
   - Click "Beta Testing" tab in the admin dashboard

3. **Create New Beta User**:
   - Click "Create Beta User" button
   - Enter beta user's email address
   - Generate or enter temporary password
   - Click "Create User"

4. **Send Credentials**:
   - Securely share login credentials with beta user
   - Direct them to `/beta/login` to get started

### **Method 2: Direct Beta Admin Access**
- Navigate directly to `/beta/admin` 
- Same creation process as above

## 🔐 **Admin Access Requirements**

**Only these super admin emails can create beta users:**
- tenisewertman@gmail.com
- aimagicformoms@gmail.com  
- 3littlelanterns@gmail.com

## 🔄 **What Happens When You Create a Beta User**

1. **User Created**: New user added to Supabase Auth with metadata `is_beta_user: 'true'`
2. **Auto-Trigger**: Database trigger automatically creates record in `beta_users` table
3. **Beta Status**: User is marked as active beta tester
4. **Setup Required**: User must complete family setup on first login

## 👤 **Beta User Experience**

1. **Login**: Beta user goes to `/beta/login` with provided credentials
2. **Family Setup**: Required to complete family onboarding (solo or full family)
3. **Full Access**: Can use all features and test subscription tier upgrades
4. **Feedback**: "Hit a Snag?" button available on all pages for issue reporting

## 📊 **Managing Beta Users**

**In the Beta Testing dashboard you can:**
- ✅ View all beta users and their activity
- ✅ Monitor setup completion status  
- ✅ Change user status (Active/Suspended/Completed)
- ✅ Review feedback submissions
- ✅ Respond to user issues
- ✅ Track usage analytics

## 🎛️ **Beta User Capabilities**

**Beta users can test:**
- ✅ Complete family setup (solo or full family)
- ✅ All subscription tiers using "beta" code instead of payment
- ✅ Full feature set (Command Center, Library, Task Management, etc.)
- ✅ Provide feedback through "Hit a Snag?" system

## 🚨 **Important Notes**

- **Temporary Passwords**: Encourage users to change passwords after first login
- **Family Setup**: Beta users MUST complete family setup before accessing main app
- **Feedback Collection**: All beta user activity is logged for analysis
- **Access Control**: Only super admins can manage beta program

## 📋 **Beta User Checklist**

When creating a beta user:
- [ ] Enter valid email address
- [ ] Generate secure temporary password  
- [ ] Record credentials securely
- [ ] Send login instructions to user
- [ ] Monitor their setup completion
- [ ] Follow up on any feedback they provide