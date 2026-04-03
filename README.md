# Linkit

Linkit is a mobile app built with React Native and Expo, designed to create personalized landing pages that combine self-introduction, trust-building, and call-to-action elements.

## Features

- User authentication with Supabase
- Profile creation and editing
- Preview of public pages
- Public pages accessible via web (Expo Web)
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
   - Update `src/utils/supabase.ts` with your project URL and anon key

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

## Components

- ProfileHeader
- CTAButton
- TrustBlock
- ServiceCardItem
- ServiceCardList
- LinkItemList

## Data Structure

- User: id, email, username
- Profile: user_id, name, bio, avatar_url, cta_text, cta_link, trust data
- ServiceCard: id, user_id, title, description, link, order
- LinkItem: id, user_id, title, link, order