package com.mycompany.job;

import java.time.LocalDate;

public class NewJob {
    private String jobTitle;
    private String jobType;
    private String location;
    private LocalDate postingDate;
    private String status;
    private String employerId;

    // NEW FIELDS
    private String companyName;
    private String contactNumber;
    private String email;
    private String address;
    private String description;
    private String contactPerson;

    public NewJob(String jobTitle, String jobType, String location,
                  LocalDate postingDate, String status, String employerId,
                  String companyName, String contactNumber, String email,
                  String address, String description, String contactPerson) {

        this.jobTitle = jobTitle;
        this.jobType = jobType;
        this.location = location;
        this.postingDate = postingDate;
        this.status = status;
        this.employerId = employerId;
        this.companyName = companyName;
        this.contactNumber = contactNumber;
        this.email = email;
        this.address = address;
        this.description = description;
        this.contactPerson = contactPerson;
    }

    public String getJobTitle() { return jobTitle; }
    public String getJobType() { return jobType; }
    public String getLocation() { return location; }
    public LocalDate getPostingDate() { return postingDate; }
    public String getStatus() { return status; }
    public String getEmployerId() { return employerId; }

    public String getCompanyName() { return companyName; }
    public String getContactNumber() { return contactNumber; }
    public String getEmail() { return email; }
    public String getAddress() { return address; }
    public String getDescription() { return description; }
    public String getContactPerson() { return contactPerson; }
}