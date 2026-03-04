/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.job;

/**
 *
 * @author User
 */
public class Employer {

    private String companyName;
    private String contactNumber;
    private String email;
    private String address;
    private String description;
    private String password;

    public Employer(String companyName, String contactNumber,
                    String email, String address,
                    String description, String password) {
        this.companyName = companyName;
        this.contactNumber = contactNumber;
        this.email = email;
        this.address = address;
        this.description = description;
        this.password = password;
    }

    // ===== Getters =====
    public String getCompanyName() { return companyName; }
    public String getContactNumber() { return contactNumber; }
    public String getEmail() { return email; }
    public String getAddress() { return address; }
    public String getDescription() { return description; }
    public String getPassword() { return password; }

    // ===== Setters =====
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public void setEmail(String email) { this.email = email; }
    public void setAddress(String address) { this.address = address; }
    public void setDescription(String description) { this.description = description; }
    public void setPassword(String password) { this.password = password; }
}