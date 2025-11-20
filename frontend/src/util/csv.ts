import { importStudentsForCourse } from "./api";

  export const importCSV = (id: string | number) => {
    // Prompt the user to select a file
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", ".csv");

    // Handle the file selection event
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      
      if (!file) {
        return;
      }

      const reader = new FileReader();

      reader.onload = async () => {
        const text = reader.result?.toString();

        if (!text) {
          alert("The selected file is empty or could not be read");
          return;
        }

        try {
          await importStudentsForCourse(Number(id), text);
          alert("Students imported successfully!");
          // Refresh the page to show new students
          window.location.reload();
        } catch (error) {
          console.error("Error importing students:", error);
          alert("Error importing students: " + (error instanceof Error ? error.message : "Unknown error"));
        }
      };

      reader.onerror = () => {
        alert("Error reading file");
      };

      reader.readAsText(file);
    });

    input.click();
  };