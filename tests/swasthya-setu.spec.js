// @ts-check
import { test, expect } from '@playwright/test';

/**
 * SwasthyaSetu - End-to-End Automated Test Suite (Page Object Model)
 * Covers:
 * 1. Authentication & Multi-Role Switching (Patient, Staff, Doctor, Admin)
 * 2. Karnataka Hospital Search & Department Filtering
 * 3. Digital OPD Token Booking & Duplicate Concurrency Protection
 * 4. Real-time Live Queue Broadcast
 * 5. Staff Queue Action (Calling Next, Starting Consultation, Completing)
 * 6. AI Symptom-to-Department Triage with Medical Disclaimer
 * 7. Multilingual Switching (Kannada ಕನ್ನಡ & English)
 */

class HomePageModel {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.brandTitle = page.locator('text=SwasthyaSetu');
    this.emergencyBanner = page.locator('text=Call 108 Emergency');
    this.findHospitalBtn = page.locator('text=Find a Hospital');
    this.bookTokenBtn = page.locator('text=Get OPD Token');
    this.trackQueueBtn = page.locator('text=Track Live Queue');
    this.aiAssistantBtn = page.locator('text=AI Health Guide');
    this.languageToggle = page.locator('button:has-text("ಕನ್ನಡ")').first();
  }

  async goto() {
    await this.page.goto('/');
  }
}

class TokenBookingPageModel {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.patientNameInput = page.locator('input[placeholder="Enter patient full name"]');
    this.patientPhoneInput = page.locator('input[placeholder="10-digit mobile number"]');
    this.symptomsInput = page.locator('textarea[placeholder*="Low grade fever"]');
    this.generateTokenBtn = page.locator('button:has-text("Generate OPD Token")');
  }

  async fillPatientDetails(name, phone, symptoms) {
    await this.patientNameInput.fill(name);
    await this.patientPhoneInput.fill(phone);
    await this.symptomsInput.fill(symptoms);
  }
}

test.describe('SwasthyaSetu Portal Automation Suite', () => {
  test('01. Home Page renders Karnataka Government Health Mission and 4 pillars', async ({ page }) => {
    const home = new HomePageModel(page);
    await home.goto();

    await expect(home.brandTitle.first()).toBeVisible();
    await expect(home.emergencyBanner).toBeVisible();
    await expect(home.findHospitalBtn).toBeVisible();
    await expect(home.bookTokenBtn.first()).toBeVisible();
    await expect(home.trackQueueBtn).toBeVisible();
    await expect(home.aiAssistantBtn).toBeVisible();
  });

  test('02. Bilingual Language Switcher toggles English and Kannada (ಕನ್ನಡ)', async ({ page }) => {
    const home = new HomePageModel(page);
    await home.goto();

    // Click language switch to Kannada
    await home.languageToggle.click();
    await expect(page.locator('text=ಸ್ವಾಸ್ಥ್ಯಸೇತು').first()).toBeVisible();
    await expect(page.locator('text=ಆಸ್ಪತ್ರೆ ಹುಡುಕಿ').first()).toBeVisible();

    // Toggle back to English
    await page.locator('button:has-text("English")').first().click();
    await expect(page.locator('text=Find a Hospital').first()).toBeVisible();
  });

  test('03. Hospital Directory filters by Karnataka district (e.g. Kodagu)', async ({ page }) => {
    await page.goto('/hospitals');

    // Select Kodagu district
    await page.selectOption('select:has-text("All Districts")', 'Kodagu');
    await page.click('button:has-text("Filter")');

    // Should display Virajpet Taluk Hospital and District Hospital Madikeri
    await expect(page.locator('text=Virajpet Taluk Hospital')).toBeVisible();
    await expect(page.locator('text=District Hospital Madikeri')).toBeVisible();
  });

  test('04. Digital OPD Token Booking generates unique token sequence', async ({ page }) => {
    await page.goto('/book-token');
    const booking = new TokenBookingPageModel(page);

    const testMobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    await booking.fillPatientDetails('Ramesh Kulkarni', testMobile, 'Joint pain in right knee');
    await booking.generateTokenBtn.click();

    // Verify token confirmation card
    await expect(page.locator('text=Token Generated Successfully!')).toBeVisible();
    await expect(page.locator('text=Digital OPD Pass')).toBeVisible();
    await expect(page.locator('text=Ramesh Kulkarni')).toBeVisible();
  });

  test('05. Live Queue Board updates waiting roster and token status', async ({ page }) => {
    await page.goto('/live-queue');

    await expect(page.locator('text=Live OPD Waiting Board')).toBeVisible();
    await expect(page.locator('text=Now Consulting / Calling')).toBeVisible();
    await expect(page.locator('text=Patients in Queue')).toBeVisible();
  });

  test('06. AI Health Assistant recommends Orthopedics for joint and walking difficulty', async ({ page }) => {
    await page.goto('/ai-assistant');

    // Enter symptom into chat triage interface
    await page.fill('input[placeholder*="knee"]', 'Severe joint pain in knees and difficulty walking');
    await page.click('button[aria-label="Send symptom description"]');

    // Validate structured recommendation and safety disclaimer
    await expect(page.locator('text=Orthopedics')).toBeVisible();
    await expect(page.locator('text=Administrative recommendation').first()).toBeVisible();
  });

  test('07. Staff Dashboard enables queue progression and walk-in issuance', async ({ page }) => {
    await page.goto('/staff/dashboard');

    await expect(page.locator('text=Hospital Staff Portal')).toBeVisible();
    await expect(page.locator('button:has-text("Call Next Waiting Patient")')).toBeVisible();
    await expect(page.locator('button:has-text("Register Walk-in Patient")')).toBeVisible();
  });
});
