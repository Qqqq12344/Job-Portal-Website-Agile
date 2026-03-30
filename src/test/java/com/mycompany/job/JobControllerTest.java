package com.mycompany.job;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;

public class JobControllerTest {

    JobController controller = new JobController();

    // ================= VALIDATION TESTS =================

    @Test
    public void testValidTitle() {
        assertTrue(controller.isTitleValid("Software Engineer"));
    }

    @Test
    public void testInvalidTitle() {
        assertFalse(controller.isTitleValid(""));
    }

    @Test
    public void testValidDescription() {
        assertTrue(controller.isDescriptionValid("Develop system"));
    }

    @Test
    public void testInvalidDescription() {
        assertFalse(controller.isDescriptionValid(""));
    }

    @Test
    public void testValidJobType() {
        assertTrue(controller.isJobTypeValid("Full-time"));
    }

    @Test
    public void testInvalidJobType() {
        assertFalse(controller.isJobTypeValid("Contract"));
    }

    @Test
    public void testValidSalary() {
        assertTrue(controller.isSalaryValid("3000"));
    }

    @Test
    public void testInvalidSalary() {
        assertFalse(controller.isSalaryValid("abc"));
    }

    @Test
    public void testValidDeadline() {
        String futureDate = LocalDate.now().plusDays(5).toString();
        assertTrue(controller.isDeadlineValid(futureDate));
    }

    @Test
    public void testInvalidDeadline() {
        String pastDate = LocalDate.now().minusDays(5).toString();
        assertFalse(controller.isDeadlineValid(pastDate));
    }

    // ================= BUSINESS LOGIC TESTS =================

    @Test
    public void testSaveDraft() {
        Job job = new Job(
                "Developer",
                "Write code",
                "Full-time",
                3000,
                LocalDate.now().plusDays(10),
                "Draft"
        );

        controller.saveDraft(job);

        assertEquals(1, controller.getDraftList().size());
    }

    @Test
    public void testPostJob() {
        Job job = new Job(
                "Tester",
                "Test system",
                "Part-time",
                2000,
                LocalDate.now().plusDays(10),
                "Post"
        );

        controller.postJob(job);

        assertEquals(1, controller.getPostedList().size());
    }

    @Test
    public void testDraftListNotEmptyAfterAdd() {
        Job job = new Job(
                "Intern",
                "Assist team",
                "Internship",
                1000,
                LocalDate.now().plusDays(10),
                "Draft"
        );

        controller.saveDraft(job);

        assertFalse(controller.getDraftList().isEmpty());
    }

    @Test
    public void testPostedListNotEmptyAfterAdd() {
        Job job = new Job(
                "Manager",
                "Manage team",
                "Full-time",
                5000,
                LocalDate.now().plusDays(10),
                "Post"
        );

        controller.postJob(job);

        assertFalse(controller.getPostedList().isEmpty());
    }
}

