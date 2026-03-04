-- Migration: Add accepted_privacy_policy column to donor_registrations
-- Date: 2026-03-04

ALTER TABLE donor_registrations ADD COLUMN accepted_privacy_policy INTEGER DEFAULT 0;
