/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 */

package com.mycompany.job;

/**
 *
 * @author PC
 */
import java.time.LocalDate;

public class Job {
    private String jobTitle;
    private String jobDescription;
    private String jobType;
    private double salary;
    private LocalDate deadline;
    private String status; // Draft or Posted

    public Job(String jobTitle, String jobDescription, String jobType,
               double salary, LocalDate deadline, String status) {
        this.jobTitle = jobTitle;
        this.jobDescription = jobDescription;
        this.jobType = jobType;
        this.salary = salary;
        this.deadline = deadline;
        this.status = status;
    }

    public String getJobTitle() { return jobTitle; }
    public String getJobDescription() { return jobDescription; }
    public String getJobType() { return jobType; }
    public double getSalary() { return salary; }
    public LocalDate getDeadline() { return deadline; }
    public String getStatus() { return status; }
}
