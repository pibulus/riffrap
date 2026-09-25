import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getInAppBrowserName,
  getUnsupportedBrowserMessage,
  isRecordingUnsupported,
  getInAppFeatureWarning,
  getMicErrorMessage
} from '../../src/lib/services/audio/inAppBrowser.js';

describe('RiffRap In-App Browser Detector', () => {
  it('identifies Threads webviews correctly', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Barcelona 315.0.0.19.109';
    assert.equal(getInAppBrowserName(ua), 'Threads');
  });

  it('identifies Discord webviews correctly', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Discord/189.0';
    assert.equal(getInAppBrowserName(ua), 'Discord');
  });

  it('identifies Messenger before generic Facebook token', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone13,2;FBMD/iPhone;FBSN/iOS;FBSV/16.5;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5;FBRV/0;FB_IAB/MESSENGER]';
    assert.equal(getInAppBrowserName(ua), 'Messenger');
  });

  it('identifies Instagram correctly', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 285.0.0.12.81';
    assert.equal(getInAppBrowserName(ua), 'Instagram');
  });

  it('identifies TikTok correctly', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 12; Pixel 6 Build/SD2A.220105.001.A1) AppleWebKit/537.36 BytedanceWebview/1.0';
    assert.equal(getInAppBrowserName(ua), 'TikTok');
  });

  it('returns null for standard desktop/mobile Safari', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
    assert.equal(getInAppBrowserName(ua), null);
  });

  it('formats actionable rescue copy naming the offending app', () => {
    const ua = 'Mobile/15E148 Barcelona 315.0';
    const message = getUnsupportedBrowserMessage(ua);
    assert.match(message, /Threads's built-in browser blocks the mic/);
    assert.match(message, /Safari or Chrome/);
  });

  it('provides feature warning copy', () => {
    const ua = 'Discord/189.0';
    const warning = getInAppFeatureWarning('audio recording', ua);
    assert.match(warning, /Discord's built-in browser may restrict audio recording/);
  });

  it('reports true for isRecordingUnsupported in node environment without mediaDevices', () => {
    assert.equal(isRecordingUnsupported(), true);
  });
});
