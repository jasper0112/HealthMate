// src/lib/pdf.ts
// Robust PDF export using html2canvas + jsPDF (handles shadows, white bg, multi-page)
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportElementToPdf(
  element: HTMLElement,
  filename = "HealthMate_Report.pdf"
) {
  // Render the element to a canvas with a white background to avoid "blank" output
  const canvas = await html2canvas(element, {
    scale: 2, // higher DPI for clearer text
    backgroundColor: "#ffffff",
    useCORS: true,
    onclone(doc) {
      // Hide non-print elements (e.g., sticky headers, animations)
      doc.querySelectorAll<HTMLElement>("[data-no-print], .no-print").forEach((el) => {
        el.style.display = "none";
      });
    },
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // First page
  let position = 0;
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

  // Additional pages if content is taller than one page
  let heightLeft = imgHeight - pageHeight;
  while (heightLeft > -1) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}
