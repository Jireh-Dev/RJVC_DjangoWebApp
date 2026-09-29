
async function loadStudents() {
    const loadingMessage = document.getElementById("loading-message");
    const errorMessage = document.getElementById("error-message");
    const studentCount = document.getElementById("student-count");
    const tableBody = document.getElementById("student-table-body");

    // Check that the required dashboard elements exist.
    if (!loadingMessage || !errorMessage || !studentCount || !tableBody) {
        console.error("Student Dashboard elements were not found. Check the HTML element IDs.");
        return;
    }

    try {
        // Show the loading message.
        loadingMessage.textContent = "Loading students...";
        errorMessage.textContent = "";

        // Request student data from the protected API.
        const response = await fetch("/api/students/");

        // Handle HTTP errors.
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Authentication required. Please log in.");
            }

            throw new Error(`HTTP error: ${response.status}`);
        }

        // Convert the response into JSON.
        const data = await response.json();

        // Display the total number of students.
        studentCount.textContent = data.count;

        // Clear any previous table rows.
        tableBody.innerHTML = "";

        // Handle an empty student list.
        if (data.students.length === 0) {
            const row = document.createElement("tr");

            const cell = document.createElement("td");
            cell.colSpan = 5;
            cell.textContent = "No Student records found.";

            row.appendChild(cell);
            tableBody.appendChild(row);
        } else {
            // Create a table row for each student.
            data.students.forEach(student => {
                const row = document.createElement("tr");

                const values = [
                    student.id,
                    student.student_name,
                    student.program,
                    student.year_level,
                    student.email
                ];

                values.forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value ?? "";
                    row.appendChild(cell);
                });

                tableBody.appendChild(row);
            });
        }

        // Hide the loading message after a successful response.
        loadingMessage.textContent = "";

    } catch (error) {
        // Hide the loading message and display the error.
        loadingMessage.textContent = "";
        errorMessage.textContent = error.message;

        console.error("Student loading error:", error);
    }
}

// Load the student records when the page is ready.
loadStudents();