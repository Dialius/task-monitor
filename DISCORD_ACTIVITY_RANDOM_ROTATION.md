# Discord Activity Random Rotation System

## 🎲 Overview

Sistem rotasi activity yang **random namun terkontrol** dengan constraint:
- ✅ Semua template pasti keluar (tidak ada yang terlewat)
- ✅ Tidak ada type yang sama berurutan (WATCHING → WATCHING ❌)
- ✅ Setelah semua keluar, shuffle ulang dan repeat
- ✅ True random dengan predictable behavior

## 🧠 Algoritma: Shuffled Round-Robin with Type Constraint

### Cara Kerja:

```
┌─────────────────────────────────────────────────────────┐
│ 1. INITIALIZATION (Bot Start)                           │
├─────────────────────────────────────────────────────────┤
│ • Group templates by type (PLAYING, WATCHING, etc.)     │
│ • Shuffle each group internally                         │
│ • Generate first playlist                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. PLAYLIST GENERATION (Each Round)                     │
├─────────────────────────────────────────────────────────┤
│ • Create empty playlist                                 │
│ • Track last type used                                  │
│ • While templates remain:                               │
│   ├─ Get available types (not same as last)            │
│   ├─ Random pick one type                              │
│   ├─ Take first template from that type                │
│   ├─ Add to playlist                                   │
│   └─ Update last type                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. PLAYBACK (Every Interval)                            │
├─────────────────────────────────────────────────────────┤
│ • Play activities from playlist sequentially            │
│ • Show progress: [5/19] 👀 Watching ...                │
│ • After last template → Generate new round              │
└─────────────────────────────────────────────────────────┘
```

## 📊 Example Execution

### Templates Available:
```
PLAYING:    5 templates (P1, P2, P3, P4, P5)
WATCHING:   6 templates (W1, W2, W3, W4, W5, W6)
LISTENING:  5 templates (L1, L2, L3, L4, L5)
COMPETING:  3 templates (C1, C2, C3)
───────────────────────────────────────────
Total:      19 templates
```

### Round 1 Generation:

```
Step 1: lastType = null
        Available: [PLAYING, WATCHING, LISTENING, COMPETING]
        Random pick: WATCHING
        → Add W3 to playlist

Step 2: lastType = WATCHING
        Available: [PLAYING, LISTENING, COMPETING]
        Random pick: COMPETING
        → Add C1 to playlist

Step 3: lastType = COMPETING
        Available: [PLAYING, WATCHING, LISTENING]
        Random pick: PLAYING
        → Add P2 to playlist

... continue until all 19 templates used

Result: [W3, C1, P2, L4, W1, P5, C2, L2, W5, ...]
```

### Round 1 Playback:

```
00:00 → [1/19]  👀 Watching deadline terdekat: 16 Feb
00:05 → [2/19]  🏆 Competing in kebut 3 tugas dalam sehari
00:10 → [3/19]  🎮 Playing dengan 5 tugas numpuk
00:15 → [4/19]  🎧 Listening to notif tugas masuk terus
00:20 → [5/19]  👀 Watching progress belajar: 75%
...
01:30 → [19/19] 🏆 Competing in 5 jam lagi
```

### Round 2 Generation:

```
✅ Round 1 completed! All 19 activities shown.

Shuffle each group again:
PLAYING:    [P4, P1, P5, P3, P2]  ← Different order!
WATCHING:   [W2, W6, W1, W4, W5, W3]
LISTENING:  [L5, L1, L3, L2, L4]
COMPETING:  [C3, C2, C1]

Generate new playlist with same algorithm...
Result: [L5, W2, P4, C3, W6, L1, ...]  ← Completely different!
```

## 🎯 Key Features

### 1. No Consecutive Same Type

```
✅ GOOD:
👀 Watching → 🏆 Competing → 🎮 Playing → 🎧 Listening

❌ BAD (Never happens):
👀 Watching → 👀 Watching → 🎮 Playing
```

### 2. All Templates Guaranteed

Every template appears exactly once per round:

```
Round 1: All 19 templates shown ✅
Round 2: All 19 templates shown ✅ (different order)
Round 3: All 19 templates shown ✅ (different order)
```

### 3. True Randomization

Each round has different order:

```
Round 1: W3 → C1 → P2 → L4 → W1 → ...
Round 2: L5 → W2 → P4 → C3 → W6 → ...
Round 3: P1 → W4 → L2 → C2 → P5 → ...
```

### 4. Progress Tracking

Console shows clear progress:

```
🎲 Round 1 playlist generated (19 activities)
   Sequence: 👀 Watching → 🏆 Competing → 🎮 Playing → 🎧 Listening → 👀 Watching...

🔄 [1/19] 👀 Watching deadline terdekat: 16 Feb
🔄 [2/19] 🏆 Competing in kebut 3 tugas dalam sehari
🔄 [3/19] 🎮 Playing dengan 5 tugas numpuk
...
🔄 [19/19] 🏆 Competing in 5 jam lagi

✅ Round 1 completed! All 19 activities shown.

🎲 Round 2 playlist generated (19 activities)
   Sequence: 🎧 Listening to → 👀 Watching → 🎮 Playing → 🏆 Competing → 👀 Watching...
```

## 🔧 Configuration

### No Changes Needed!

Sistem ini bekerja otomatis dengan config yang sudah ada:

```typescript
// src/config/discord.config.ts
activity: {
  enabled: true,
  interval: 5, // minutes
  type: 3, // Default type (not used in random mode)
  templates: [
    // Your templates here
    { text: 'dengan {total} tugas numpuk', dynamic: true, type: 0 },
    { text: 'deadline terdekat: {nearest}', dynamic: true, type: 3 },
    // ... more templates
  ]
}
```

### Environment Variables:

```env
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=5
```

## 📈 Statistics & Monitoring

### Get Rotation Stats:

```typescript
const stats = activityStatusService.getRotationStats();

console.log(stats);
// Output:
// {
//   round: 2,
//   progress: "5/19",
//   playlistIndex: 5,
//   playlistTotal: 19,
//   templatesByType: [
//     { type: "🎮 Playing", count: 5 },
//     { type: "👀 Watching", count: 6 },
//     { type: "🎧 Listening to", count: 5 },
//     { type: "🏆 Competing in", count: 3 }
//   ]
// }
```

### Force New Round:

```typescript
// Skip remaining activities and start new round
activityStatusService.forceNewRound();
```

## 🎮 Console Output Examples

### Bot Start:

```
🎲 Random Activity Rotation initialized:
   → 🎮 Playing: 5 templates
   → 👀 Watching: 6 templates
   → 🎧 Listening to: 5 templates
   → 🏆 Competing in: 3 templates

🎲 Round 1 playlist generated (19 activities)
   Sequence: 👀 Watching → 🏆 Competing → 🎮 Playing → 🎧 Listening → 👀 Watching...

✅ Activity status rotation started
   → Interval: 5 minutes
   → Total activities: 19
```

### During Rotation:

```
🔄 [1/19] 👀 Watching deadline terdekat: 16 Feb
🔄 [2/19] 🏆 Competing in kebut 3 tugas dalam sehari
🔄 [3/19] 🎮 Playing dengan 5 tugas numpuk
🔄 [4/19] 🎧 Listening to notif tugas masuk terus
🔄 [5/19] 👀 Watching progress belajar: 75%
```

### Round Completion:

```
🔄 [19/19] 🏆 Competing in 5 jam lagi — masih bisa dikebut

✅ Round 1 completed! All 19 activities shown.

🎲 Round 2 playlist generated (19 activities)
   Sequence: 🎧 Listening to → 👀 Watching → 🎮 Playing → 🏆 Competing → 👀 Watching...

🔄 [1/19] 🎧 Listening to lo-fi sambil belajar
```

## 🐛 Edge Cases Handled

### 1. Only One Type Available

```
If only WATCHING templates remain:
→ Allow consecutive WATCHING (no choice)
→ Log warning
→ Continue normally
```

### 2. Empty Templates

```
If no templates configured:
→ Skip rotation
→ Log warning
→ No errors
```

### 3. Single Template

```
If only 1 template total:
→ Show same template every interval
→ No round generation needed
```

## 🎯 Benefits

### For Users:
- ✅ Fresh experience every round
- ✅ No boring repetitive patterns
- ✅ Variety in activity types
- ✅ All templates get equal exposure

### For Developers:
- ✅ Clean, maintainable code
- ✅ Comprehensive logging
- ✅ Easy to debug
- ✅ Extensible design

## 📝 Technical Details

### Algorithm Complexity:
- Time: O(n log n) per round (shuffle)
- Space: O(n) for playlist storage
- n = number of templates

### Randomness Quality:
- Uses Fisher-Yates shuffle (unbiased)
- Cryptographically secure? No (uses Math.random)
- Good enough for activity rotation? Yes!

### Type Safety:
- Full TypeScript support
- Type-safe template handling
- Compile-time checks

## 🚀 Future Enhancements

Possible improvements:

1. **Weighted Random**: Some templates appear more often
2. **Time-based**: Different templates for different times
3. **Context-aware**: Show relevant templates based on task data
4. **User preferences**: Let users favorite certain templates
5. **Analytics**: Track which templates get most engagement

## 📚 Related Files

- `src/services/ActivityStatusService.ts` - Main implementation
- `src/config/discord.config.ts` - Template configuration
- `DISCORD_ACTIVITY_GUIDE.md` - General activity guide
- `DISCORD_ACTIVITY_EXAMPLES.md` - Template examples

## 🎉 Summary

Sistem random rotation ini memberikan:
- **Variasi** - Setiap round berbeda
- **Fairness** - Semua template keluar
- **Quality** - No consecutive same type
- **Transparency** - Clear progress tracking
- **Reliability** - Tested and production-ready

Enjoy your randomized activity rotation! 🎲
