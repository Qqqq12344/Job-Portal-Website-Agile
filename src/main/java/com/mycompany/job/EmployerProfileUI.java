/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.job;

/**
 *
 * @author User
 */
import java.util.Scanner;

public class EmployerProfileUI {

    private static Scanner sc = new Scanner(System.in);
    private static EmployerController controller = new EmployerController();

    public static void main(String[] args) {

        // Dummy logged-in employer
        Employer employer = new Employer(
                "ABC Company",
                "0123456789",
                "abc@gmail.com",
                "Kuala Lumpur",
                "IT Services",
                "123456"
        );

        int choice;

        do {
            System.out.println("\n===== Employer Profile Menu =====");
            System.out.println("1. Edit Profile");
            System.out.println("2. Update Password");
            System.out.println("0. Exit");
            System.out.print("Enter choice: ");

            choice = sc.nextInt();
            sc.nextLine();

            switch (choice) {
                case 1:
                    editProfile(employer);
                    break;
                case 2:
                    updatePassword(employer);
                    break;
                case 0:
                    System.out.println("Exiting...");
                    break;
                default:
                    System.out.println("Invalid choice.");
            }

        } while (choice != 0);
    }

    // ================= EDIT PROFILE =================

    private static void editProfile(Employer employer) {

        System.out.println("\n--- Edit Profile (Type 'cancel' anytime to abort) ---");

        String companyName;
        while (true) {
            System.out.print("Company Name: ");
            companyName = sc.nextLine();
            if (companyName.equalsIgnoreCase("cancel")) return;
            if (controller.isNotEmpty(companyName)) break;
            System.out.println("Company name cannot be empty.");
        }

        String contact;
        while (true) {
            System.out.print("Contact Number: ");
            contact = sc.nextLine();
            if (contact.equalsIgnoreCase("cancel")) return;
            if (controller.isNotEmpty(contact) && controller.isNumericContact(contact)) break;
            System.out.println("Contact must be numeric and not empty.");
        }

        String email;
        while (true) {
            System.out.print("Email Address: ");
            email = sc.nextLine();
            if (email.equalsIgnoreCase("cancel")) return;
            if (controller.isNotEmpty(email) && controller.isValidEmail(email)) break;
            System.out.println("Invalid email format.");
        }

        String address;
        while (true) {
            System.out.print("Company Address: ");
            address = sc.nextLine();
            if (address.equalsIgnoreCase("cancel")) return;
            if (controller.isNotEmpty(address)) break;
            System.out.println("Address cannot be empty.");
        }

        String description;
        while (true) {
            System.out.print("Company Description: ");
            description = sc.nextLine();
            if (description.equalsIgnoreCase("cancel")) return;
            if (controller.isNotEmpty(description)) break;
            System.out.println("Description cannot be empty.");
        }

        // Save changes
        employer.setCompanyName(companyName);
        employer.setContactNumber(contact);
        employer.setEmail(email);
        employer.setAddress(address);
        employer.setDescription(description);

        System.out.println("Profile updated successfully!");
    }

    // ================= UPDATE PASSWORD =================

    private static void updatePassword(Employer employer) {

        System.out.println("\n--- Update Password ---");

        System.out.print("Enter Current Password: ");
        String current = sc.nextLine();

        if (!controller.isCurrentPasswordCorrect(employer, current)) {
            System.out.println("Incorrect current password.");
            return;
        }

        System.out.print("Enter New Password: ");
        String newPassword = sc.nextLine();

        System.out.print("Confirm New Password: ");
        String confirmPassword = sc.nextLine();

        if (!controller.isNewPasswordConfirmed(newPassword, confirmPassword)) {
            System.out.println("New password and confirm password do not match.");
            return;
        }

        employer.setPassword(newPassword);
        System.out.println("Password updated successfully!");
    }
}