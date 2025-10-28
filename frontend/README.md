# TalentRank Voting Frontend

A modern, beautiful UI for the TalentRank voting dApp built with Next.js 15 and FHEVM.

## 🎨 Features

- **Modern Design**: Beautiful gradient UI with smooth animations
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Dark Theme**: Eye-friendly dark theme with vibrant accent colors
- **Wallet Integration**: Connect with MetaMask
- **Encrypted Voting**: Privacy-preserving votes using FHEVM

## 📄 Pages

### Home (`/`)
- Hero section with call-to-action buttons
- Feature cards explaining the dApp
- "How It Works" section

### Candidates (`/candidates`)
- Browse all registered candidates
- View candidate profiles with images and descriptions
- Cast encrypted votes
- Visual feedback for voting status

### Leaderboard (`/leaderboard`)
- Podium display for top 3 candidates
- Complete rankings with vote counts and percentages
- Progress bars for visual comparison
- Real-time updates

### My Vote (`/myvote`)
- View your voting status
- See which candidate you voted for
- Wallet connection status
- Voting information

### Admin (`/admin`)
- Register new candidates
- Set voting time windows
- End voting period
- Administrative controls

## 🎨 Design System

### Colors
- **Primary (Pink)**: `#EC4899` - Main brand color
- **Secondary (Purple)**: `#8B5CF6` - Accent color
- **Accent (Gold)**: `#F59E0B` - Rankings/medals
- **Success (Green)**: `#10B981` - Positive actions
- **Error (Red)**: `#EF4444` - Errors/warnings

### Components
- `Button`: Multiple variants (primary, secondary, outline, ghost)
- `Card`: Container with hover effects
- `Input` & `TextArea`: Form inputs with validation
- `Navbar`: Sticky navigation with wallet connection
- `ConnectWalletButton`: Wallet integration component

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Generate ABI from contracts
npm run genabi

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔗 Integration

The UI is ready for contract integration. Look for `// TODO:` comments in the code to add:
- Contract calls for voting
- Reading candidate data
- Decrypting encrypted votes
- Admin functions

## 📝 Notes

- Make sure contracts are deployed before testing
- Connect MetaMask to interact with the dApp
- Only contract owner can access admin functions
- Each wallet can vote only once

