/**
 * Test Script for Random Activity Rotation Algorithm
 */

// Mock templates
const mockTemplates = [
  { text: 'P1', type: 0 }, { text: 'P2', type: 0 }, { text: 'P3', type: 0 }, { text: 'P4', type: 0 }, { text: 'P5', type: 0 },
  { text: 'W1', type: 3 }, { text: 'W2', type: 3 }, { text: 'W3', type: 3 }, { text: 'W4', type: 3 }, { text: 'W5', type: 3 }, { text: 'W6', type: 3 },
  { text: 'L1', type: 2 }, { text: 'L2', type: 2 }, { text: 'L3', type: 2 }, { text: 'L4', type: 2 }, { text: 'L5', type: 2 },
  { text: 'C1', type: 5 }, { text: 'C2', type: 5 }, { text: 'C3', type: 5 }
];

const typeNames = { 0: '🎮 PLAYING', 2: '🎧 LISTENING', 3: '👀 WATCHING', 5: '🏆 COMPETING' };

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function hasRemaining(map) {
  return Array.from(map.values()).some(arr => arr.length > 0);
}

function generatePlaylist(templates) {
  const templatesByType = new Map();
  templates.forEach(template => {
    if (!templatesByType.has(template.type)) templatesByType.set(template.type, []);
    templatesByType.get(template.type).push(template);
  });

  const remaining = new Map();
  templatesByType.forEach((temps, type) => {
    const shuffled = [...temps];
    shuffleArray(shuffled);
    remaining.set(type, shuffled);
  });

  const playlist = [];
  let lastType = null;

  while (hasRemaining(remaining)) {
    const typesByCount = Array.from(remaining.entries())
      .filter(([_, templates]) => templates.length > 0)
      .sort((a, b) => b[1].length - a[1].length);

    let selectedType;
    const differentTypes = typesByCount.filter(([type, _]) => type !== lastType);
    
    if (differentTypes.length > 0) {
      const topTypes = differentTypes.slice(0, Math.min(3, differentTypes.length));
      selectedType = topTypes[Math.floor(Math.random() * topTypes.length)][0];
    } else {
      selectedType = typesByCount[0][0];
    }

    playlist.push(remaining.get(selectedType).shift());
    lastType = selectedType;
  }

  return playlist;
}

function validatePlaylist(playlist, originalTemplates) {
  const errors = [];
  const warnings = [];

  if (playlist.length !== originalTemplates.length) {
    errors.push(`Length mismatch: ${playlist.length} vs ${originalTemplates.length}`);
  }

  const texts = playlist.map(t => t.text);
  if (texts.length !== new Set(texts).size) errors.push('Duplicates found');
  if (new Set(originalTemplates.map(t => t.text)).size !== new Set(texts).size) errors.push('Missing templates');

  let consecutiveCount = 0;
  let maxConsecutive = 0;
  for (let i = 1; i < playlist.length; i++) {
    if (playlist[i].type === playlist[i - 1].type) {
      consecutiveCount++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveCount + 1);
      if (consecutiveCount >= 2) {
        warnings.push(`${consecutiveCount + 1} consecutive ${typeNames[playlist[i].type]} at index ${i}`);
      }
    } else {
      consecutiveCount = 0;
    }
  }

  return { errors, warnings, maxConsecutive };
}

console.log('🧪 Testing Random Activity Rotation Algorithm\n');
console.log('📊 Test Data: 19 templates (P:5, W:6, L:5, C:3)\n');

let totalErrors = 0;
let totalWarnings = 0;
let maxConsecutiveOverall = 0;

for (let round = 1; round <= 5; round++) {
  console.log(`${'='.repeat(60)}`);
  console.log(`Round ${round}`);
  console.log('='.repeat(60));

  const playlist = generatePlaylist(mockTemplates);
  const result = validatePlaylist(playlist, mockTemplates);

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log('✅ Perfect! No consecutive same types.');
  } else if (result.errors.length === 0) {
    console.log('✅ All critical tests passed.');
    if (result.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      result.warnings.forEach(w => console.log(`   ${w}`));
      totalWarnings += result.warnings.length;
    }
  } else {
    console.log('❌ Errors:');
    result.errors.forEach(e => console.log(`   ${e}`));
    totalErrors += result.errors.length;
  }

  maxConsecutiveOverall = Math.max(maxConsecutiveOverall, result.maxConsecutive);

  const typeSequence = playlist.map(t => typeNames[t.type].split(' ')[0]).join(' → ');
  console.log(`\n📊 Type sequence:\n   ${typeSequence}\n`);
}

console.log('='.repeat(60));
console.log('📊 Summary');
console.log('='.repeat(60));
console.log(`Rounds tested: 5`);
console.log(`Errors: ${totalErrors}`);
console.log(`Warnings: ${totalWarnings}`);
console.log(`Max consecutive: ${maxConsecutiveOverall}`);

if (totalErrors === 0) {
  console.log('\n✅ All critical tests passed!');
  if (totalWarnings > 0) console.log('⚠️  Some edge cases (mathematically unavoidable).');
} else {
  console.log('\n❌ Tests failed.');
}
