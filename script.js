const steps = document.querySelectorAll(".step:not(#summary)");
const nextButtons = document.querySelectorAll(".next");
const previousButtons = document.querySelectorAll(".previous");

const progressBar = document.getElementById("progressBar");
const stepText = document.getElementById("stepText");
const summary = document.getElementById("summary");
const summaryContent = document.getElementById("summaryContent");
const reviewButton = document.getElementById("reviewButton");
const editButton = document.getElementById("editButton");
const form = document.getElementById("registrationForm");
const statusMessage = document.getElementById("statusMessage");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

let currentStep = 0;

const storageKey = "registrationDraft";

// Display the current step
function showStep() {
    steps.forEach(function(step, index) {
        step.classList.remove("active");

        if (index === currentStep) {
            step.classList.add("active");
        }
    });

    summary.classList.remove("active");

    stepText.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    progressBar.style.width =
        ((currentStep + 1) / steps.length) * 100 + "%";

    statusMessage.textContent = "";
}

// Validate the current step
function validateStep() {
    const inputs = steps[currentStep].querySelectorAll(
        "input, select, textarea"
    );

    confirmPassword.setCustomValidity("");

    if (currentStep === 2 && password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords do not match.");
    }

    for (const input of inputs) {
        if (!input.checkValidity()) {
            input.reportValidity();
            return false;
        }
    }

    return true;
}

// Next buttons
nextButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        if (validateStep() && currentStep < steps.length - 1) {
            currentStep++;
            showStep();
        }
    });
});

// Previous buttons
previousButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        if (currentStep > 0) {
            currentStep--;
            showStep();
        }
    });
});

// Clear password mismatch as the user edits
confirmPassword.addEventListener("input", function() {
    confirmPassword.setCustomValidity("");
});

// Collect form data, excluding passwords
function getFormData() {
    const data = {};

    form.querySelectorAll("input, select, textarea").forEach(function(input) {
        if (input.name && input.type !== "password") {
            if (input.type === "radio") {
                if (input.checked) {
                    data[input.name] = input.value;
                }
            } else {
                data[input.name] = input.value;
            }
        }
    });

    return data;
}

// Save draft automatically
function saveDraft() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(getFormData()));
    } catch (error) {
        console.log("Could not save the draft.");
    }
}

form.addEventListener("input", saveDraft);
form.addEventListener("change", saveDraft);

// Restore saved form data
function restoreDraft() {
    try {
        const savedData = JSON.parse(
            localStorage.getItem(storageKey) || "{}"
        );

        form.querySelectorAll("input, select, textarea").forEach(function(input) {
            if (!input.name || !(input.name in savedData)) {
                return;
            }

            if (input.type === "radio") {
                input.checked = input.value === savedData[input.name];
            } else if (input.type !== "password") {
                input.value = savedData[input.name];
            }
        });
    } catch (error) {
        console.log("Could not restore the saved draft.");
    }
}

restoreDraft();

// Show the final summary
reviewButton.addEventListener("click", function() {
    if (!validateStep()) {
        return;
    }

    const data = getFormData();

    summaryContent.replaceChildren();

    const fields = [
        ["Full Name", data.name],
        ["Father's Name", data.fatherName],
        ["Date of Birth", data.dob],
        ["Gender", data.gender],
        ["Email", data.email],
        ["Phone", data.phone],
        ["City", data.city],
        ["Address", data.address],
        ["Username", data.username]
    ];

    fields.forEach(function(field) {
        const paragraph = document.createElement("p");
        const label = document.createElement("strong");

        label.textContent = field[0] + ": ";
        paragraph.appendChild(label);
        paragraph.appendChild(
            document.createTextNode(field[1] || "")
        );

        summaryContent.appendChild(paragraph);
    });

    steps[currentStep].classList.remove("active");
    summary.classList.add("active");

    stepText.textContent = "Review your details";
    progressBar.style.width = "100%";
    statusMessage.textContent = "";
});

// Return to the last step for editing
editButton.addEventListener("click", function() {
    currentStep = steps.length - 1;
    showStep();
});

// Final submission
form.addEventListener("submit", function(event) {
    event.preventDefault();

    try {
        localStorage.removeItem(storageKey);
    } catch (error) {
        console.log("Could not clear the saved draft.");
    }

    summary.classList.remove("active");
    statusMessage.textContent =
        "Registration completed successfully!";

    form.querySelectorAll("button").forEach(function(button) {
        button.disabled = true;
    });
});
