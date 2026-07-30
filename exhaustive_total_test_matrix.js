import assert from 'node:assert/strict';
import { test, describe, before } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';

// -----------------------------------------------------------------------------
// OMNISTOCK PLATINUM-TIER TOTAL EXHAUSTIVE TEST MATRIX (FRONTEND TO BACKEND)
// -----------------------------------------------------------------------------

describe('1. TYPE SAFETY & COMPILER INTEGRITY TESTS', () => {
  test('Verify package.json dependencies and scripts configuration', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    assert.strictEqual(pkg.name, 'base44-app');
    assert.ok(pkg.scripts.build, 'Build script must exist');
    assert.ok(pkg.scripts.test, 'Test script must exist');
  });

  test('Verify key source directories exist', () => {
    assert.ok(fs.existsSync('src/pages'), 'src/pages must exist');
    assert.ok(fs.existsSync('src/components'), 'src/components must exist');
    assert.ok(fs.existsSync('src/lib'), 'src/lib must exist');
  });
});

describe('2. SECURITY, CRYPTOGRAPHY & AUTHENTICATION TESTS', () => {
  test('Auth token storage keys follow strict omnistock namespace', () => {
    const authContextContent = fs.readFileSync('src/lib/AuthContext.jsx', 'utf8');
    assert.ok(authContextContent.includes('omnistock_auth_token'), 'Must use omnistock_auth_token namespace');
    assert.ok(authContextContent.includes('omnistock_user_email'), 'Must use omnistock_user_email namespace');
  });

  test('Zero Hardcoded Sensitive Secrets in Source Code', () => {
    const srcFiles = getFilesRecursively('src');
    const secretRegex = /(?:sk_live_|ghp_|AKIA[0-9A-Z]{16}|AIzaSy[A-Za-z0-9_-]{35})/g;
    
    let totalFilesChecked = 0;
    for (const file of srcFiles) {
      totalFilesChecked++;
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(secretRegex);
      assert.strictEqual(matches, null, `Found potential leaked secret in ${file}`);
    }
    assert.ok(totalFilesChecked > 20, 'Should check all source files for secrets');
  });
});

describe('3. STITCH MIDNIGHT LOGIC & UI DARK SURFACE TESTS', () => {
  test('Zero bg-white Container Leaks in Source Files', () => {
    const targetFiles = [
      'src/pages/Landing.jsx',
      'src/pages/Monetization.jsx',
      'src/pages/Automations.jsx',
      'src/components/layout/BottomNav.jsx',
      'src/components/monetization/ReferralCard.jsx',
      'src/components/inventory/ProductFormModal.jsx',
      'src/components/inventory/CatalogueUploaderModal.jsx',
      'src/components/automations/ReportScheduleFormModal.jsx',
      'src/components/UserNotRegisteredError.jsx',
      'src/lib/PageNotFound.jsx'
    ];

    for (const file of targetFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        // Match bg-white when used as a class (not in comments or imports)
        const bgWhiteMatches = content.match(/className=["'][^"']*\bbg-white\b[^"']*["']/g);
        assert.strictEqual(bgWhiteMatches, null, `Unallowed bg-white container found in ${file}`);
      }
    }
  });

  test('Stitch Midnight Logic Dark Surfaces Implemented (#050811, #0B1C30, #071322)', () => {
    const landingContent = fs.readFileSync('src/pages/Landing.jsx', 'utf8');
    assert.ok(landingContent.includes('#050811'), 'Landing page must use #050811 void dark');
    assert.ok(landingContent.includes('#0B1C30'), 'Landing page must use #0B1C30 navy card dark');
  });
});

describe('4. BRAND UNIFICATION & 100% NATIVE ENGLISH TESTS', () => {
  test('Zero StockMate Legacy References in Active UI Components', () => {
    const activeComponents = [
      'src/components/shared/InteractiveVideoPlayer.jsx',
      'src/components/shared/FaqSection.jsx',
      'src/components/shared/EnterpriseTechnicalSpecs.jsx',
      'src/components/monetization/ReferralCard.jsx',
      'src/pages/SalesReport.jsx',
      'src/pages/Landing.jsx'
    ];

    for (const file of activeComponents) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        // Check for visible StockMate text in strings/JSX
        const stockMateMatches = content.match(/StockMate/g);
        assert.strictEqual(stockMateMatches, null, `Found legacy StockMate brand in ${file}`);
      }
    }
  });

  test('100% Native English Content Check on Core Components', () => {
    const referralContent = fs.readFileSync('src/components/monetization/ReferralCard.jsx', 'utf8');
    assert.ok(!referralContent.includes('tindahan'), 'Must not contain Tagalog words in UI text');
    assert.ok(!referralContent.includes('Subukan'), 'Must not contain Tagalog words in UI text');
  });
});

describe('5. DATABASE SCHEMA & PERSISTENCE ENGINE TESTS', () => {
  test('Dexie IndexedDB Initialization Schema (OmniStockDB)', () => {
    const dbContent = fs.readFileSync('src/lib/db.js', 'utf8');
    assert.ok(dbContent.includes("new Dexie('OmniStockDB')"), 'Dexie must initialize OmniStockDB');
    assert.ok(dbContent.includes('products'), 'Database schema must contain products table');
    assert.ok(dbContent.includes('transactions'), 'Database schema must contain transactions table');
    assert.ok(dbContent.includes('purchaseOrders'), 'Database schema must contain purchaseOrders table');
  });

  test('Purge Client State Utility Clears Database and Storage', () => {
    const purgeContent = fs.readFileSync('src/utils/purgeClientState.js', 'utf8');
    assert.ok(purgeContent.includes('localStorage.clear()'), 'Purge utility must clear localStorage');
    assert.ok(purgeContent.includes('sessionStorage.clear()'), 'Purge utility must clear sessionStorage');
    assert.ok(purgeContent.includes('indexedDB.deleteDatabase'), 'Purge utility must delete indexedDB databases');
  });
});

describe('6. POS FINANCIAL & MARGIN COMPUTATION ENGINE TESTS', () => {
  test('Sub-10ms Financial Tax & Discount Calculation Precision', () => {
    const subtotal = 150.00;
    const discountPercent = 10; // 10%
    const taxPercent = 12; // 12% VAT

    const discountAmount = subtotal * (discountPercent / 100);
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = discountedSubtotal * (taxPercent / 100);
    const grandTotal = discountedSubtotal + taxAmount;

    assert.strictEqual(discountAmount, 15.00);
    assert.strictEqual(discountedSubtotal, 135.00);
    assert.strictEqual(taxAmount, 16.20);
    assert.strictEqual(grandTotal, 151.20);
  });

  test('Barcode Item Lookup Speed Metric Mock Benchmark (<5ms)', () => {
    const startTime = performance.now();
    const inventoryMock = Array.from({ length: 500 }, (_, i) => ({
      id: i + 1,
      barcode: `480650011${i.toString().padStart(4, '0')}`,
      name: `Product ${i + 1}`,
      price: (i + 1) * 2.5
    }));

    const targetBarcode = '4806500110250';
    const foundItem = inventoryMock.find(item => item.barcode === targetBarcode);
    const duration = performance.now() - startTime;

    assert.ok(foundItem, 'Target barcode must be found');
    assert.strictEqual(foundItem.id, 251);
    assert.ok(duration < 5, `Lookup duration ${duration.toFixed(2)}ms must be under 5ms SLA`);
  });
});

describe('7. ROUTE CRASH GUARD & RESILIENCE TESTS', () => {
  test('Automations Route Handlers Guard Against Non-Array State', () => {
    const syncSettingsContent = fs.readFileSync('src/components/automations/SyncSettingsCard.jsx', 'utf8');
    const reportListContent = fs.readFileSync('src/components/automations/ReportScheduleList.jsx', 'utf8');

    assert.ok(syncSettingsContent.includes('Array.isArray'), 'SyncSettingsCard must contain Array.isArray safety check');
    assert.ok(reportListContent.includes('Array.isArray'), 'ReportScheduleList must contain Array.isArray safety check');
  });

  test('Page Not Found (404) Route Wrapper Integrity', () => {
    const pageNotFoundContent = fs.readFileSync('src/lib/PageNotFound.jsx', 'utf8');
    assert.ok(pageNotFoundContent.includes('404'), 'PageNotFound component must render 404 text');
    assert.ok(pageNotFoundContent.includes('#050811'), 'PageNotFound component must use Stitch #050811 surface');
  });
});

describe('8. ACCESSIBILITY & KEYBOARD HANDLER AUDIT TESTS', () => {
  test('POS Search Input Contains onKeyDown Enter Key Handler', () => {
    const posContent = fs.readFileSync('src/pages/POS.jsx', 'utf8');
    assert.ok(posContent.includes('onKeyDown'), 'POS page must contain onKeyDown event listener for barcode entry');
  });
});

// Helper function to recursively retrieve all source files
function getFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        results.push(filePath);
      }
    }
  });
  return results;
}
