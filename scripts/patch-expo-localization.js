const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-localization',
  'ios',
  'LocalizationModule.swift'
);

const before = `    case .iso8601:
      return "iso8601"
    }
  }
`;

const after = `    case .iso8601:
      return "iso8601"
    @unknown default:
      return "gregory"
    }
  }
`;

if (!fs.existsSync(targetFile)) {
  process.exit(0);
}

const source = fs.readFileSync(targetFile, 'utf8');

if (source.includes('@unknown default:')) {
  process.exit(0);
}

if (!source.includes(before)) {
  console.warn('expo-localization patch skipped: expected source block not found');
  process.exit(0);
}

fs.writeFileSync(targetFile, source.replace(before, after));
console.log('Applied expo-localization iOS compatibility patch');
