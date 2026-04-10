/**
 * API Testing Script
 * Run with: npx tsx scripts/test-apis.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Simple .env parser
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');

    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  } catch (error) {
    console.error('Failed to load .env.local:', error);
  }
}

loadEnv();

const API_TESTS = [
  {
    name: 'CoinGecko',
    test: async () => {
      const apiKey = process.env.COINGECKO_API_KEY;
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd`;
      const headers: Record<string, string> = apiKey ? { 'x-cg-pro-api-key': apiKey } : {};

      const res = await fetch(url, { headers });
      const data = await res.json();

      return {
        success: !!data['usd-coin'],
        data: data['usd-coin'],
      };
    },
  },
  {
    name: 'FRED (Federal Reserve)',
    test: async () => {
      const apiKey = process.env.FRED_API_KEY;
      if (!apiKey) throw new Error('API key not found');

      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=DFF&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`;
      const res = await fetch(url);
      const data = await res.json();

      return {
        success: !!data.observations,
        data: data.observations?.[0],
      };
    },
  },
  {
    name: 'Etherscan',
    test: async () => {
      const apiKey = process.env.ETHERSCAN_API_KEY;
      if (!apiKey) throw new Error('API key not found');

      // USDC contract address
      const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
      const url = `https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=${usdcAddress}&apikey=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      return {
        success: data.status === '1',
        data: { totalSupply: data.result },
      };
    },
  },
  {
    name: 'Dune Analytics',
    test: async () => {
      const apiKey = process.env.DUNE_API_KEY;
      if (!apiKey) throw new Error('API key not found');

      // Test API connection
      const url = 'https://api.dune.com/api/v1/query/3914154/results';
      const res = await fetch(url, {
        headers: {
          'X-Dune-API-Key': apiKey,
        },
      });
      const data = await res.json();

      return {
        success: !data.error,
        data: data.state || 'Connected',
      };
    },
  },
  {
    name: 'Alpha Vantage',
    test: async () => {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apiKey) throw new Error('API key not found');

      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=CRCL&apikey=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      return {
        success: !!data['Global Quote'],
        data: data['Global Quote'],
      };
    },
  },
];

async function testAllAPIs() {
  console.log('🧪 Testing API Connections...\n');
  console.log('=' .repeat(60));

  let passed = 0;
  let failed = 0;

  for (const test of API_TESTS) {
    try {
      console.log(`\n📡 Testing ${test.name}...`);
      const result = await test.test();

      if (result.success) {
        console.log(`✅ ${test.name}: SUCCESS`);
        console.log(`   Data:`, JSON.stringify(result.data, null, 2).slice(0, 200));
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Response:`, result.data);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
      console.log(`   Error:`, error instanceof Error ? error.message : error);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${API_TESTS.length} tests`);

  if (passed === API_TESTS.length) {
    console.log('🎉 All APIs are working correctly!\n');
  } else if (passed > 0) {
    console.log('⚠️  Some APIs are working. Check the failed ones above.\n');
  } else {
    console.log('❌ No APIs are working. Check your .env.local configuration.\n');
  }
}

testAllAPIs().catch(console.error);
