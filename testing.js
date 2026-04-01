function runTests() {

    console.log("=== Automated Unit Testing ===");

    const tests = [

        {
            name: "Working Hours Valid",
            test: () => isWithinWorkingHours("10:00") === true
        },

        {
            name: "Working Hours Invalid",
            test: () => isWithinWorkingHours("20:00") === false
        },

        {
            name: "Future Date Valid",
            test: () => {
                const future = new Date();
                future.setDate(future.getDate() + 10);
                return isValidDate(future.toISOString().split("T")[0]) === true;
            }
        },

        {
            name: "Past Date Invalid",
            test: () => {
                const past = new Date();
                past.setDate(past.getDate() - 5);
                return isValidDate(past.toISOString().split("T")[0]) === false;
            }
        },

        {
            name: "Date Beyond One Year Invalid",
            test: () => {
                const beyond = new Date();
                beyond.setFullYear(beyond.getFullYear() + 2);
                return isValidDate(beyond.toISOString().split("T")[0]) === false;
            }
        },

        {
            name: "Valid Online Link",
            test: () => isValidOnlineLink("https://meet-abc-123") === true
        },

        {
            name: "Invalid Online Link",
            test: () => isValidOnlineLink("https:meet-123-456") === false
        },

        {
            name: "Valid Onsite Location",
            test: () => isValidOnsiteLocation("Cheras") === true
        },

        {
            name: "Invalid Onsite Location",
            test: () => isValidOnsiteLocation("https://meet-123-456") === false
        },

        {
            name: "Interview Record Added",
            test: () => {
                const before = interviews.length;
                createInterview("Software Engineer", "Alice Tan", "2026-06-02", "10:00", "Onsite", "Cheras");
                const after = interviews.length;
                return after === before + 1;
            }
        },

        {
            name: "Record Exists in Array",
            test: () => {
                return interviews.some(i =>
                    i.job === "Software Engineer" &&
                    i.candidate === "Alice Tan"
                );
            }
        }

    ];

    let passed = 0;

    tests.forEach(test => {
        const result = test.test();
        const status = result ? "%cPASS" : "%cFAIL";
        const style = result
            ? "color: green; font-weight: bold;"
            : "color: red; font-weight: bold;";

        console.log(`${test.name} → ${status}`, style);

        if (result) passed++;
    });

    console.log(`%c${passed}/${tests.length} tests passed.`, "color: green; font-weight: bold;");
}


window.addEventListener("load", runTests);
