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
import java.util.ArrayList;

public class JobController {

    private ArrayList<Job> draftList = new ArrayList<>();
    private ArrayList<Job> postedList = new ArrayList<>();

    // ================= VALIDATIONS =================

    public boolean isTitleValid(String title) {
        return title != null && !title.trim().isEmpty();
    }

    public boolean isDescriptionValid(String desc) {
        return desc != null && !desc.trim().isEmpty();
    }

    public boolean isJobTypeValid(String type) {
        return type.equalsIgnoreCase("Full-time") ||
               type.equalsIgnoreCase("Part-time") ||
               type.equalsIgnoreCase("Internship");
    }

    public boolean isSalaryValid(String salaryInput) {
        try {
            double salary = Double.parseDouble(salaryInput);
            return salary > 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public boolean isDeadlineValid(String deadlineInput) {
        try {
            LocalDate deadline = LocalDate.parse(deadlineInput);
            return deadline.isAfter(LocalDate.now());
        } catch (Exception e) {
            return false;
        }
    }

    // ================= BUSINESS LOGIC =================

    public void saveDraft(Job job) {
        draftList.add(job);
    }

    public void postJob(Job job) {
        postedList.add(job);
    }

    public ArrayList<Job> getDraftList() {
        return draftList;
    }

    public ArrayList<Job> getPostedList() {
        return postedList;
    }
}
