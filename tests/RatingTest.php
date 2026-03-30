<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../rating_logic.php';

class RatingTest extends TestCase {

    public function testEmptyCandidate() {
        $this->assertEquals(
            "Please select a candidate.",
            validateInput("", 3)
        );
    }

    public function testEmptyRating() {
        $this->assertEquals(
            "Please select a rating.",
            validateInput(1, "")
        );
    }

    public function testValidInput() {
        $this->assertEquals(
            "valid",
            validateInput(1, 4)
        );
    }

    public function testSameRating() {
        $this->assertTrue(isSameRating(3, 3));
    }

    public function testDifferentRating() {
        $this->assertFalse(isSameRating(3, 5));
    }
}