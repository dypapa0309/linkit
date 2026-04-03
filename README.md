# Linkit

Linkit is a mobile app and web experience built with React Native, Expo, and Supabase. It helps creators and freelancers share a simple public profile page with featured links, profile photo, and short self-introduction.

## Features

- User authentication with Supabase
- Google / Apple / Email sign-in
- Profile creation and editing
- Public profile links on the web
- Additional links with a free plan limit
- Avatar upload with Supabase Storage
- In-app account deletion
- Preview of public pages
- State management with Zustand

## Tech Stack

- React Native
- Expo
- TypeScript
- Zustand
- Supabase
- Expo Router

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Supabase:
   - Create a Supabase project
   - Copy `.env.example` to `.env`
   - Fill in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Run [supabase/schema.sql](/Users/sangbinsmacbook/Desktop/Projects/LinkitApp/supabase/schema.sql) in the Supabase SQL editor

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on device/simulator:
   ```bash
   npm run ios  # for iOS
   npm run android  # for Android
   npm run web  # for web
   ```

## Deployment

Use [DEPLOY_CHECKLIST.md](/Users/sangbinsmacbook/Desktop/Projects/LinkitApp/DEPLOY_CHECKLIST.md) before shipping.

It includes:

- Supabase SQL / Auth / Storage setup
- Google and Apple sign-in setup
- Edge Function deployment for account deletion
- Netlify environment variables
- Real-device release checklist

## Project Structure

- `app/` - Expo Router screens
- `src/components/` - Reusable components
- `src/stores/` - Zustand stores
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions

## Screens

- Login/Register
- Home
- Profile Edit
- Profile Preview
- Public Profile Page
- Settings

## Components

- ProfileHeader
- CTAButton
- TrustBlock
- LinkItemList

## Data Structure

- User: id, email, username
- Profile: user_id, username, name, bio, avatar_url, cta_text, cta_link, plan
- LinkItem: id, user_id, title, description, link, order
