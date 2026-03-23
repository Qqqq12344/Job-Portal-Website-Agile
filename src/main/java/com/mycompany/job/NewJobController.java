package com.mycompany.job;

import java.util.ArrayList;
import java.util.List;

public class NewJobController {

    private List<NewJob> jobList = new ArrayList<>();

    public void addJob(NewJob job) {
        jobList.add(job);
    }

    public List<NewJob> getJobsByEmployer(String employerId) {
        List<NewJob> result = new ArrayList<>();
        for (NewJob job : jobList) {
            if (job.getEmployerId().equals(employerId)) {
                result.add(job);
            }
        }
        return result;
    }

    public List<NewJob> searchJobs(List<NewJob> jobs, String keyword) {
        List<NewJob> result = new ArrayList<>();
        for (NewJob job : jobs) {
            if (job.getJobTitle().toLowerCase().contains(keyword.toLowerCase())) {
                result.add(job);
            }
        }
        return result;
    }

    public List<NewJob> filterByStatus(List<NewJob> jobs, String status) {
        List<NewJob> result = new ArrayList<>();
        for (NewJob job : jobs) {
            if (job.getStatus().equalsIgnoreCase(status)) {
                result.add(job);
            }
        }
        return result;
    }

    public List<NewJob> filterByType(List<NewJob> jobs, String type) {
        List<NewJob> result = new ArrayList<>();
        for (NewJob job : jobs) {
            if (job.getJobType().equalsIgnoreCase(type)) {
                result.add(job);
            }
        }
        return result;
    }
}