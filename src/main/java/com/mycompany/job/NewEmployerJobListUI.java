package com.mycompany.job;

import java.time.LocalDate;
import java.util.List;
import java.util.Scanner;

public class NewEmployerJobListUI {

    private NewJobController controller;
    private Scanner scanner = new Scanner(System.in);

    public NewEmployerJobListUI(NewJobController controller) {
        this.controller = controller;
    }

    public static void main(String[] args) {

        NewJobController controller = new NewJobController();

        // =========================
        // HARD CODED DUMMY DATA
        // =========================

        // EMP001
        controller.addJob(new NewJob("Software Engineer", "Full-Time", "KL",
                LocalDate.of(2025,1,10), "Active", "EMP001",
                "TechSoft Sdn Bhd", "0123456789", "hr@techsoft.com",
                "KL City", "Develop enterprise systems", "Ali"));

        controller.addJob(new NewJob("Web Developer", "Full-Time", "KL",
                LocalDate.of(2025,2,5), "Restricted", "EMP001",
                "TechSoft Sdn Bhd", "0123456789", "hr@techsoft.com",
                "KL City", "Build web applications", "Ali"));

        controller.addJob(new NewJob("System Analyst", "Full-Time", "KL",
                LocalDate.of(2025,3,1), "Draft", "EMP001",
                "TechSoft Sdn Bhd", "0123456789", "hr@techsoft.com",
                "KL City", "Analyze system requirements", "Ali"));

        controller.addJob(new NewJob("UI Designer", "Part-Time", "KL",
                LocalDate.of(2025,3,5), "Active", "EMP001",
                "TechSoft Sdn Bhd", "0123456789", "hr@techsoft.com",
                "KL City", "Design UI/UX", "Ali"));

        controller.addJob(new NewJob("Mobile App Developer", "Full-Time", "KL",
                LocalDate.of(2025,3,10), "Restricted", "EMP001",
                "TechSoft Sdn Bhd", "0123456789", "hr@techsoft.com",
                "KL City", "Build mobile apps", "Ali"));

        controller.addJob(new NewJob("QA Tester", "Part-Time", "KL",
                LocalDate.of(2025,3,12), "Draft", "EMP001",
                "TechSoft Sdn Bhd", "0123456789", "hr@techsoft.com",
                "KL City", "Test software", "Ali"));

        controller.addJob(new NewJob("DevOps Engineer", "Full-Time", "KL",
                LocalDate.of(2025,3,15), "Active", "EMP001",
                "TechSoft Sdn Bhd", "0123456789", "hr@techsoft.com",
                "KL City", "Maintain CI/CD", "Ali"));

        controller.addJob(new NewJob("Data Analyst", "Full-Time", "KL",
                LocalDate.of(2025,3,18), "Restricted", "EMP001",
                "TechSoft Sdn Bhd", "0123456789", "hr@techsoft.com",
                "KL City", "Analyze data", "Ali"));

        controller.addJob(new NewJob("IT Support", "Full-Time", "KL",
                LocalDate.of(2025,3,20), "Draft", "EMP001",
                "TechSoft Sdn Bhd", "0123456789", "hr@techsoft.com",
                "KL City", "Support users", "Ali"));

        controller.addJob(new NewJob("Network Engineer", "Full-Time", "KL",
                LocalDate.of(2025,3,22), "Active", "EMP001",
                "TechSoft Sdn Bhd", "0123456789", "hr@techsoft.com",
                "KL City", "Maintain network", "Ali"));

        // EMP002 (similar but different company)
        controller.addJob(new NewJob("Account Executive", "Full-Time", "Penang",
                LocalDate.of(2025,1,5), "Active", "EMP002",
                "FinanceCorp", "0131234567", "hr@finance.com",
                "Penang", "Handle accounts", "John"));

        controller.addJob(new NewJob("Finance Analyst", "Full-Time", "Penang",
                LocalDate.of(2025,2,1), "Restricted", "EMP002",
                "FinanceCorp", "0131234567", "hr@finance.com",
                "Penang", "Analyze finance", "John"));

        controller.addJob(new NewJob("Auditor", "Full-Time", "Penang",
                LocalDate.of(2025,2,10), "Draft", "EMP002",
                "FinanceCorp", "0131234567", "hr@finance.com",
                "Penang", "Audit reports", "John"));

        // (Add remaining 7 similar jobs for EMP002)
        for(int i=0;i<7;i++){
            controller.addJob(new NewJob("Clerk "+(i+1), "Part-Time", "Penang",
                LocalDate.of(2025,3,1+i), (i%3==0?"Active":(i%3==1?"Restricted":"Draft")),
                "EMP002","FinanceCorp","0131234567","hr@finance.com",
                "Penang","Office work","John"));
        }

        // EMP003
        for(int i=0;i<10;i++){
            controller.addJob(new NewJob("Marketing Executive "+(i+1), "Full-Time", "Melaka",
                LocalDate.of(2025,3,1+i), (i%3==0?"Active":(i%3==1?"Restricted":"Draft")),
                "EMP003","MarketPro","0149876543","hr@market.com",
                "Melaka","Marketing campaigns","Sarah"));
        }

        NewEmployerJobListUI ui = new NewEmployerJobListUI(controller);
        Scanner sc = new Scanner(System.in);

        while (true) {
            System.out.println("\n===== SELECT EMPLOYER =====");
            System.out.println("1. EMP001");
            System.out.println("2. EMP002");
            System.out.println("3. EMP003");
            System.out.println("0. Exit");
            System.out.print("Enter choice: ");

            int choice = sc.nextInt();
            String emp = "";

            switch (choice) {
                case 1: emp="EMP001"; break;
                case 2: emp="EMP002"; break;
                case 3: emp="EMP003"; break;
                case 0: return;
                default: System.out.println("Invalid!"); continue;
            }

            ui.start(emp);
        }
    }

    public void start(String employerId) {
        List<NewJob> jobs = controller.getJobsByEmployer(employerId);

        while (true) {
            System.out.println("\n===== JOB LIST MENU =====");
            System.out.println("1. View All Jobs");
            System.out.println("2. Search Job");
            System.out.println("3. Filter Job");
            System.out.println("4. View Job Details");
            System.out.println("0. Back");
            System.out.print("Enter choice: ");

            int choice = scanner.nextInt();
            scanner.nextLine();

            switch (choice) {
                case 1: displayJobs(jobs); break;
                case 2:
                    System.out.print("Keyword: ");
                    displayJobs(controller.searchJobs(jobs, scanner.nextLine()));
                    break;
                case 3: filterMenu(jobs); break;
                case 4: viewDetails(jobs); break;
                case 0: return;
            }
        }
    }

    private void displayJobs(List<NewJob> jobs) {
        
        if (jobs == null || jobs.isEmpty()) {
            System.out.println("\nNo jobs found.");
            return;
        }

        System.out.println("\nTotal Jobs: " + jobs.size());

        System.out.println("+----+----------------------+--------------+------------+------------+------------+");
        System.out.println("|No  | Title                | Type         | Location   | Date       | Status     |");
        System.out.println("+----+----------------------+--------------+------------+------------+------------+");

        int i=1;
        for(NewJob j: jobs){
            System.out.printf("|%-4d|%-22s|%-14s|%-12s|%-12s|%-12s|\n",
                    i++, j.getJobTitle(), j.getJobType(), j.getLocation(),
                    j.getPostingDate(), j.getStatus());
        }

        System.out.println("+----+----------------------+--------------+------------+------------+------------+");
    }

    private void filterMenu(List<NewJob> jobs) {
        System.out.println("1. Status\n2. Type");
        int opt = scanner.nextInt();
        scanner.nextLine();

        if(opt==1){
            System.out.print("Status (Active/Restricted/Draft): ");
            displayJobs(controller.filterByStatus(jobs, scanner.nextLine()));
        } else if(opt==2){
            System.out.print("Type: ");
            displayJobs(controller.filterByType(jobs, scanner.nextLine()));
        }
    }

    private void viewDetails(List<NewJob> jobs) {
        displayJobs(jobs);

        System.out.print("Select job: ");
        int idx = scanner.nextInt();

        if(idx<1 || idx>jobs.size()){
            System.out.println("Invalid!");
            return;
        }

        NewJob j = jobs.get(idx-1);

        System.out.println("\n===== JOB DETAILS =====");
        System.out.println("Title: " + j.getJobTitle());
        System.out.println("Company: " + j.getCompanyName());
        System.out.println("Contact: " + j.getContactNumber());
        System.out.println("Email: " + j.getEmail());
        System.out.println("Address: " + j.getAddress());
        System.out.println("Description: " + j.getDescription());
        System.out.println("Contact Person: " + j.getContactPerson());
    }
}