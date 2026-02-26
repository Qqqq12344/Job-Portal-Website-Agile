/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.job;

/**
 *
 * @author PC
 */
import java.time.LocalDate;
import java.util.Scanner;

public class EmployerJobUI {

    private static Scanner sc = new Scanner(System.in);
    private static JobController controller = new JobController();

    public static void main(String[] args) {

        int choice;

        do {
            System.out.println("\n===== Employer Job Posting Menu =====");
            System.out.println("1. Create Job");
            System.out.println("2. View Job Draft");
            System.out.println("3. View Posted Job");
            System.out.println("0. Exit");
            System.out.print("Enter choice: ");

            choice = sc.nextInt();
            sc.nextLine();

            switch (choice) {
                case 1:
                    createJob();
                    break;
                case 2:
                    displayDraftJobs();
                    break;
                case 3:
                    displayPostedJobs();
                    break;
                case 0:
                    System.out.println("Exiting system...");
                    break;
                default:
                    System.out.println("Invalid choice. Try again.");
            }

        } while (choice != 0);
    }

    private static void createJob() {

        String title;
        do {
            System.out.print("Enter Job Title: ");
            title = sc.nextLine();
            if (!controller.isTitleValid(title)) {
                System.out.println("Invalid title. Cannot be empty.");
            }
        } while (!controller.isTitleValid(title));

        String description;
        do {
            System.out.print("Enter Job Description: ");
            description = sc.nextLine();
            if (!controller.isDescriptionValid(description)) {
                System.out.println("Invalid description.");
            }
        } while (!controller.isDescriptionValid(description));

        String jobType;
        do {
            System.out.print("Enter Job Type (Full-time/Part-time/Internship): ");
            jobType = sc.nextLine();
            if (!controller.isJobTypeValid(jobType)) {
                System.out.println("Invalid job type.");
            }
        } while (!controller.isJobTypeValid(jobType));

        String salaryInput;
        do {
            System.out.print("Enter Salary: ");
            salaryInput = sc.nextLine();
            if (!controller.isSalaryValid(salaryInput)) {
                System.out.println("Salary must be positive numeric value.");
            }
        } while (!controller.isSalaryValid(salaryInput));

        String deadlineInput;
        do {
            System.out.print("Enter Deadline (YYYY-MM-DD): ");
            deadlineInput = sc.nextLine();
            if (!controller.isDeadlineValid(deadlineInput)) {
                System.out.println("Deadline must be future date (YYYY-MM-DD).");
            }
        } while (!controller.isDeadlineValid(deadlineInput));

        System.out.print("Save as Draft or Post? (Draft/Post): ");
        String status = sc.nextLine();

        Job job = new Job(
                title,
                description,
                jobType,
                Double.parseDouble(salaryInput),
                LocalDate.parse(deadlineInput),
                status
        );

        if (status.equalsIgnoreCase("Draft")) {
            controller.saveDraft(job);
            System.out.println("Job saved as Draft successfully!");
        } else {
            controller.postJob(job);
            System.out.println("Job posted successfully!");
        }
    }

    private static void displayDraftJobs() {

        System.out.println("\n===== Job Draft List =====");

        if (controller.getDraftList().isEmpty()) {
            System.out.println("No draft jobs available.");
            return;
        }

        System.out.printf("%-15s %-12s %-10s %-12s\n",
                "Title", "Type", "Salary", "Deadline");

        for (Job job : controller.getDraftList()) {
            System.out.printf("%-15s %-12s %-10.2f %-12s\n",
                    job.getJobTitle(),
                    job.getJobType(),
                    job.getSalary(),
                    job.getDeadline());
        }
    }

    private static void displayPostedJobs() {

        System.out.println("\n===== Posted Job List =====");

        if (controller.getPostedList().isEmpty()) {
            System.out.println("No posted jobs available.");
            return;
        }

        System.out.printf("%-15s %-12s %-10s %-12s\n",
                "Title", "Type", "Salary", "Deadline");

        for (Job job : controller.getPostedList()) {
            System.out.printf("%-15s %-12s %-10.2f %-12s\n",
                    job.getJobTitle(),
                    job.getJobType(),
                    job.getSalary(),
                    job.getDeadline());
        }
    }
}
