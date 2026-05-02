# CaptX Pro

**Super Advanced Screen Recorder** — Professional, powerful, and beautifully designed.

## Features
- Ultra HD recording: 480p → 720p → 1080p → 2K → 4K
- Frame rate: 24, 30, 60, 120 FPS
- Bitrate control: 2–32 Mbps
- Audio sources: None, Microphone, System, Both
- Countdown timer, recording limit, orientation lock
- Show touches, tap rings, face cam overlay
- GPU acceleration, HDR mode
- Full tutorial built-in

## Build APK via GitHub Actions

### Step 1 — Add Expo Token to GitHub Secrets
1. Go to [expo.dev](https://expo.dev) and create a free account
2. Get your token: expo.dev → Account → Access Tokens → Create
3. In this GitHub repo → Settings → Secrets → Actions
4. Add: `EXPO_TOKEN` = your token

### Step 2 — Trigger the Build
- Push any change to this repo, OR
- Go to Actions tab → `Build Android APK` → `Run workflow`

### Step 3 — Download APK
- Wait ~10-15 minutes for build to complete
- Go to Actions → your build → Artifacts → Download `captx-pro-apk`

## Tech Stack
- Expo (React Native)
- TypeScript
- AsyncStorage for persistence
- EAS Build for APK compilation
