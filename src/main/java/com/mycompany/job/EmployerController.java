/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.job;

/**
 *
 * @author User
 */
import java.util.regex.Pattern;

public class EmployerController {

    // ===== FIELD VALIDATION =====

    public boolean isNotEmpty(String input) {
        return input != null && !input.trim().isEmpty();
    }

    public boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return Pattern.matches(emailRegex, email);
    }

    public boolean isNumericContact(String contact) {
        return contact.matches("\\d+");
    }

    public boolean validateProfileFields(String companyName, String contact,
                                         String email, String address,
                                         String description) {

        return isNotEmpty(companyName) &&
               isNotEmpty(contact) &&
               isNotEmpty(email) &&
               isNotEmpty(address) &&
               isNotEmpty(description) &&
               isValidEmail(email) &&
               isNumericContact(contact);
    }

    // ===== PASSWORD VALIDATION =====

    public boolean isCurrentPasswordCorrect(Employer employer, String currentPassword) {
        return employer.getPassword().equals(currentPassword);
    }

    public boolean isNewPasswordConfirmed(String newPassword, String confirmPassword) {
        return newPassword.equals(confirmPassword);
    }
}