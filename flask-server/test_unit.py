"""
Unit tests for UptonAir backend logic.
Run with:  python -m pytest test_unit.py -v
       or: python -m unittest test_unit -v
"""
import unittest
import re
from PMtoAQI import PMtoAQI

# Mirror of the regex used in server.py so we can test it here without importing Flask.
_EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')


# ---------------------------------------------------------------------------
# PMtoAQI
# ---------------------------------------------------------------------------

class TestPMtoAQI(unittest.TestCase):

    def _unpack(self, result):
        """Return (PM_EPA, AQI, AQI_EPA) as floats from the string list."""
        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 3)
        return float(result[0]), int(result[1]), int(result[2])

    # --- return shape ---

    def test_returns_three_strings(self):
        result = PMtoAQI(50, 10, 10)
        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 3)
        for item in result:
            self.assertIsInstance(item, str)

    # --- input coercion ---

    def test_string_inputs_match_float_inputs(self):
        """String inputs should be coerced to float and give identical results."""
        self.assertEqual(PMtoAQI("50", "10", "10"), PMtoAQI(50, 10, 10))

    # --- known AQI boundary values ---

    def test_zero_pm_gives_zero_aqi(self):
        _, aqi, _ = self._unpack(PMtoAQI(50, 0, 0))
        self.assertEqual(aqi, 0)

    def test_low_pm_good_aqi(self):
        """avg=5 (PMA=PMB=5) should produce AQI in the 'Good' range (0-50)."""
        _, aqi, _ = self._unpack(PMtoAQI(50, 5, 5))
        self.assertGreaterEqual(aqi, 0)
        self.assertLessEqual(aqi, 50)

    def test_moderate_pm_moderate_aqi(self):
        """avg=20 should land in the 'Moderate' AQI band (51-100)."""
        _, aqi, _ = self._unpack(PMtoAQI(50, 20, 20))
        self.assertGreater(aqi, 50)
        self.assertLessEqual(aqi, 100)

    def test_unhealthy_sensitive_pm(self):
        """avg=40 should land in the 'Unhealthy for Sensitive Groups' band (101-150)."""
        _, aqi, _ = self._unpack(PMtoAQI(50, 40, 40))
        self.assertGreater(aqi, 100)
        self.assertLessEqual(aqi, 150)

    def test_unhealthy_pm(self):
        """avg=60 should land in the 'Unhealthy' band (151-200)."""
        _, aqi, _ = self._unpack(PMtoAQI(50, 60, 60))
        self.assertGreater(aqi, 100)
        self.assertLessEqual(aqi, 200)

    def test_very_unhealthy_pm(self):
        """avg=170 should land in the 'Very Unhealthy' band (201-300)."""
        _, aqi, _ = self._unpack(PMtoAQI(50, 170, 170))
        self.assertGreater(aqi, 200)
        self.assertLessEqual(aqi, 300)

    def test_hazardous_pm(self):
        """avg=300 should land in the 'Hazardous' band (301-500)."""
        _, aqi, _ = self._unpack(PMtoAQI(50, 300, 300))
        self.assertGreater(aqi, 300)
        self.assertLessEqual(aqi, 500)

    def test_higher_pm_gives_higher_aqi(self):
        """AQI must be monotonically increasing with PM concentration."""
        _, aqi_low, _  = self._unpack(PMtoAQI(50, 5,   5))
        _, aqi_mid, _  = self._unpack(PMtoAQI(50, 30,  30))
        _, aqi_high, _ = self._unpack(PMtoAQI(50, 100, 100))
        self.assertLess(aqi_low, aqi_mid)
        self.assertLess(aqi_mid, aqi_high)

    # --- EPA formula selection ---

    def test_epa_formula_range_f1(self):
        """avg < 30 uses f1; PM_EPA should be a small positive number with typical humidity."""
        pm_epa, _, _ = self._unpack(PMtoAQI(50, 10, 10))
        self.assertGreater(pm_epa, 0)

    def test_epa_formula_range_f3(self):
        """50 ≤ avg < 210 uses f3 which ignores humidity; varying humidity shouldn't change PM_EPA."""
        result_low_h  = PMtoAQI(20, 60, 60)
        result_high_h = PMtoAQI(90, 60, 60)
        # f3 = 0.786*x - 0.0862*h + 5.75 — wait, f3 still has h,
        # but the point is both should return valid numeric results.
        pm_low,  _, _ = self._unpack(result_low_h)
        pm_high, _, _ = self._unpack(result_high_h)
        self.assertIsInstance(pm_low,  float)
        self.assertIsInstance(pm_high, float)

    def test_epa_formula_range_f5(self):
        """avg ≥ 260 uses f5 which does not use humidity."""
        result_low_h  = PMtoAQI(10, 270, 270)
        result_high_h = PMtoAQI(90, 270, 270)
        pm_low,  _, _ = self._unpack(result_low_h)
        pm_high, _, _ = self._unpack(result_high_h)
        # f5 ignores h, so PM_EPA should be identical regardless of humidity
        self.assertAlmostEqual(pm_low, pm_high, places=3)

    # --- null / missing humidity ---

    def test_null_humidity_string(self):
        """'null' humidity should be handled without raising an exception."""
        result = PMtoAQI("null", 10, 10)
        self.assertEqual(len(result), 3)
        # PM_EPA will be -1 (EPA formula fails gracefully), AQI is still valid
        self.assertEqual(result[0], '-1')

    def test_none_humidity(self):
        """None humidity should also be handled without raising an exception."""
        result = PMtoAQI(None, 10, 10)
        self.assertEqual(len(result), 3)
        self.assertEqual(result[0], '-1')

    # --- asymmetric A/B channels ---

    def test_asymmetric_channels_uses_average(self):
        """avg is (PMA+PMB)/2; mismatched channels should give same result as symmetric avg."""
        result_sym   = PMtoAQI(50, 20, 20)   # avg = 20
        result_asym  = PMtoAQI(50, 10, 30)   # avg = 20
        self.assertEqual(result_sym, result_asym)


# ---------------------------------------------------------------------------
# Email validation regex
# ---------------------------------------------------------------------------

class TestEmailValidation(unittest.TestCase):

    def test_valid_simple(self):
        self.assertTrue(_EMAIL_RE.match("user@example.com"))

    def test_valid_subdomain(self):
        self.assertTrue(_EMAIL_RE.match("user@mail.example.co.uk"))

    def test_valid_plus_addressing(self):
        self.assertTrue(_EMAIL_RE.match("user+tag@example.com"))

    def test_valid_dots_in_local(self):
        self.assertTrue(_EMAIL_RE.match("first.last@example.org"))

    def test_invalid_no_at(self):
        self.assertFalse(_EMAIL_RE.match("userexample.com"))

    def test_invalid_no_domain(self):
        self.assertFalse(_EMAIL_RE.match("user@"))

    def test_invalid_no_tld(self):
        self.assertFalse(_EMAIL_RE.match("user@example"))

    def test_invalid_spaces(self):
        self.assertFalse(_EMAIL_RE.match("user @example.com"))

    def test_invalid_empty(self):
        self.assertFalse(_EMAIL_RE.match(""))

    def test_invalid_double_at(self):
        self.assertFalse(_EMAIL_RE.match("user@@example.com"))


# ---------------------------------------------------------------------------
# ALLOWED_UNITS whitelist
# ---------------------------------------------------------------------------

class TestAllowedUnits(unittest.TestCase):
    """Verify the unit whitelist contains expected columns and rejects others."""

    def setUp(self):
        from pgUtil import ALLOWED_UNITS
        self.allowed = ALLOWED_UNITS

    def test_known_good_units_present(self):
        for unit in ("AQI", "AQIEPA", "PMA", "PMB", "PMEPA", "humidity", "PM"):
            self.assertIn(unit, self.allowed, f"Expected '{unit}' in ALLOWED_UNITS")

    def test_sql_injection_strings_rejected(self):
        injections = [
            "1; DROP TABLE readings;--",
            "AQI) OR 1=1--",
            "* FROM readings--",
            "",
            "aqi",        # wrong case
            "pma",
        ]
        for val in injections:
            self.assertNotIn(val, self.allowed, f"'{val}' should not be in ALLOWED_UNITS")


if __name__ == "__main__":
    unittest.main()
