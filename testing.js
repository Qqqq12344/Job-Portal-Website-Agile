// ===== Validation Functions =====

// Validate working hours (9:00 AM – 6:00 PM)
function isWithinWorkingHours(time) {
    const hour = parseInt(time.split(":")[0]);
    return hour >= 9 && hour < 18;
}

// Validate interview date (must be today or within 1 year from now)
function isValidFutureDate(date) {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneYearLater = new Date();
    oneYearLater.setFullYear(today.getFullYear() + 1);

    return selectedDate >= today && selectedDate <= oneYearLater;
}

// Validate interview details based on type
function isValidInterviewDetails(type, details) {
    const urlPattern = /^(https?:\/\/)[^\s]+$/;

    if (type === "Online") {
        return urlPattern.test(details);
    } else if (type === "Onsite") {
        return !urlPattern.test(details) && details.trim() !== "";
    }
    return false;
}

// ===== Automated Unit Testing =====
function runTests() {
    const tests = [
        {
            name: "Working Hours Valid",
            test: () => isWithinWorkingHours("9:00")
        },
        {
            name: "Working Hours Invalid",
            test: () => !isWithinWorkingHours("08:30")
        },
        {
            name: "Future Date Valid",
            test: () => {
                const future = new Date();
                future.setDate(future.getDate() + 5);
                return isValidFutureDate(future.toISOString().split("T")[0]);
            }
        },
        {
            name: "Past Date Invalid",
            test: () => !isValidFutureDate("2026-03-29")
        },
        {
            name: "Date Beyond One Year Invalid",
            test: () => {
                const future = new Date();
                future.setFullYear(future.getFullYear() + 2);
                return !isValidFutureDate(future.toISOString().split("T")[0]);
            }
        },
        {
            name: "Valid Online Link",
            test: () => isValidInterviewDetails("Online", "https://meet.google.com/abc")
        },
        {
            name: "Invalid Online Link",
            test: () => !isValidInterviewDetails("Online", "meet-abc-123")
        },
        {
            name: "Valid Onsite Location",
            test: () => isValidInterviewDetails("Onsite", "Petaling Jaya")
        },
        {
            name: "Invalid Onsite With URL",
            test: () => !isValidInterviewDetails("Onsite", "https://meet-cde-456")
        }
    ];

    let passed = 0;

    console.log("===== Automated Unit Testing =====");

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

// Run tests automatically when the page loads
window.addEventListener("load", runTests);