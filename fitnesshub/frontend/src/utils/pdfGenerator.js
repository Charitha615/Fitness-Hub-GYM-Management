import jsPDF from 'jspdf';

export const generatePDFReport = (data, title, reportType) => {
    return new Promise((resolve) => {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text(title, 105, 20, { align: 'center' });
        
        // Add generation date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        
        // Prepare headers and data
        const headers = prepareHeaders(reportType);
        const tableData = prepareTableData(data, reportType);
        
        let yPosition = 50;
        
        // Add headers
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(102, 126, 234);
        
        let xPosition = 10;
        const columnWidth = 180 / headers.length;
        
        headers.forEach((header, index) => {
            doc.rect(xPosition, yPosition, columnWidth, 10, 'F');
            doc.text(header, xPosition + 2, yPosition + 7);
            xPosition += columnWidth;
        });
        
        yPosition += 10;
        
        // Add data rows
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        
        tableData.forEach((row, rowIndex) => {
            if (yPosition > 280) {
                doc.addPage();
                yPosition = 20;
            }
            
            xPosition = 10;
            row.forEach((cell, cellIndex) => {
                // Alternate row colors
                if (rowIndex % 2 === 0) {
                    doc.setFillColor(245, 245, 245);
                    doc.rect(xPosition, yPosition, columnWidth, 10, 'F');
                }
                
                doc.setTextColor(0, 0, 0);
                const cellText = doc.splitTextToSize(String(cell), columnWidth - 4);
                doc.text(cellText, xPosition + 2, yPosition + 7);
                xPosition += columnWidth;
            });
            
            yPosition += 10;
        });
        
        // Add summary
        yPosition += 10;
        doc.setFontSize(12);
        doc.text(`Total Records: ${data.length}`, 14, yPosition);
        
        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }
        
        // Save the PDF
        doc.save(`${title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
        resolve();
    });
};

const prepareHeaders = (reportType) => {
    const baseHeaders = ['Name', 'Email', 'Phone', 'Status', 'Join Date'];
    
    switch (reportType) {
        case 'trainers':
            return [...baseHeaders, 'Specialization', 'Experience', 'Approval'];
        case 'admins':
            return [...baseHeaders, 'Role'];
        case 'pending-trainers':
            return [...baseHeaders, 'Specialization', 'Experience', 'Applied Date'];
        default:
            return baseHeaders;
    }
};

const prepareTableData = (data, reportType) => {
    return data.map(item => {
        const baseData = [
            item.name || 'N/A',
            item.email || 'N/A',
            item.phone || 'N/A',
            item.isActive ? 'Active' : 'Inactive',
            new Date(item.createdAt).toLocaleDateString()
        ];
        
        switch (reportType) {
            case 'trainers':
                return [
                    ...baseData,
                    item.specialization || 'N/A',
                    `${item.experience || 0} years`,
                    item.isApproved ? 'Approved' : 'Pending'
                ];
            case 'admins':
                return [
                    ...baseData,
                    item.userType || 'N/A'
                ];
            case 'pending-trainers':
                return [
                    ...baseData,
                    item.specialization || 'N/A',
                    `${item.experience || 0} years`,
                    new Date(item.createdAt).toLocaleDateString()
                ];
            default:
                return [
                    ...baseData,
                    item.userType ? item.userType.charAt(0).toUpperCase() + item.userType.slice(1) : 'N/A'
                ];
        }
    });
};