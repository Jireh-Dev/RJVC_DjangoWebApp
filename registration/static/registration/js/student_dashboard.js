
let allStudents = [];

const searchInput = document.getElementById("student-search");
const programFilter = document.getElementById("program-filter");
const clearButton = document.getElementById("clear-filters");
const refreshButton = document.getElementById("refresh-students");
const resultCount = document.getElementById("result-count");
const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const studentCount = document.getElementById("student-count");
const tableBody = document.getElementById("student-table-body");

// Fetch the latest student records from the API.
async function loadStudents() {
    loadingMessage.textContent = "Loading students...";
    errorMessage.textContent = "";
    refreshButton.disabled = true;

    try {
        const response = await fetch("/api/students/");

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(
                    "Authentication required. Please log in."
                );
            }

            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        allStudents = data.students;
        studentCount.textContent = data.count;

        populateProgramFilter();
        renderStudents();

        loadingMessage.textContent = "";
    } catch (error) {
        loadingMessage.textContent = "";
        errorMessage.textContent = error.message;
        console.error("Student loading error:", error);
    } finally {
        refreshButton.disabled = false;
    }
}

// Populate the program dropdown using API data.
function populateProgramFilter() {
    const selectedProgram = programFilter.value;

    const programs = [
        ...new Set(
            allStudents
                .map(student => student.program)
                .filter(Boolean)
        )
    ].sort();

    programFilter.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All programs";
    programFilter.appendChild(allOption);

    programs.forEach(program => {
        const option = document.createElement("option");
        option.value = program;
        option.textContent = program;
        programFilter.appendChild(option);
    });

    if (programs.includes(selectedProgram)) {
        programFilter.value = selectedProgram;
    }
}

// Filter and display the student records.
function renderStudents() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedProgram = programFilter.value;

    const filteredStudents = allStudents.filter(student => {
        const name = (student.student_name || "").toLowerCase();
        const email = (student.email || "").toLowerCase();

        const matchesSearch =
            name.includes(searchTerm) ||
            email.includes(searchTerm);

        const matchesProgram =
            selectedProgram === "" ||
            student.program === selectedProgram;

        return matchesSearch && matchesProgram;
    });

    tableBody.replaceChildren();

    if (filteredStudents.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "No matching Student records found.";

        row.appendChild(cell);
        tableBody.appendChild(row);
    } else {
        filteredStudents.forEach(student => {
            const row = document.createElement("tr");

            [
                student.id,
                student.student_name,
                student.program,
                student.year_level,
                student.email
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });
    }

    resultCount.textContent =
        `Showing ${filteredStudents.length} of ${allStudents.length} students`;
}

// Search whenever the user types.
searchInput.addEventListener("input", renderStudents);

// Filter whenever the selected program changes.
programFilter.addEventListener("change", renderStudents);

// Clear the search and program filter.
clearButton.addEventListener("click", () => {
    searchInput.value = "";
    programFilter.value = "";
    renderStudents();
});

// Fetch the latest records from the API.
refreshButton.addEventListener("click", loadStudents);

// Load records when the dashboard opens.
loadStudents();