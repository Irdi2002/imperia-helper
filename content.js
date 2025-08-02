// Imperia Online Spy Report Enhancement - Fixed Version
// Content script that runs on the game page

class SpyReportEnhancer {
    constructor() {
        this.isInitialized = false;
        this.checkInterval = null;
        
        setTimeout(() => this.init(), 2000);
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            console.log('🕵️ Spy Report Enhancer starting...');
            this.startPeriodicCheck();
            this.isInitialized = true;
            console.log('✅ Spy Report Enhancer initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Spy Report Enhancer:', error);
        }
    }

    startPeriodicCheck() {
        this.checkInterval = setInterval(() => {
            try {
                this.checkForSpyReports();
            } catch (error) {
                console.error('Error in periodic check:', error);
            }
        }, 2000);
        console.log('👀 Started periodic check for spy reports (every 2s)');
    }

    checkForSpyReports() {
            const spyReports = this.getAllSpyReports();
            console.debug(`Checking for spy reports... Found ${spyReports.length} potential reports`);

            spyReports.forEach(report => {
                // Simplified check: only process if visible and doesn't already have our panel
                if (this.isVisible(report)) {
                    try {
                        this.enhanceSpyReport(report);
                    } catch (error) {
                        console.error(`Error enhancing report ${report.id}:`, error);
                    }
                }
            });
        }
    
    processEspionageTable(reportElement) {
        const espionageDiv = reportElement.querySelector('#asubs-espionage');
        if (!espionageDiv) return;

        const table = espionageDiv.querySelector('table.data-grid');
        if (!table) return;

        const titleElement = reportElement.querySelector('.title');
        if (!titleElement) return;

        const titleText = titleElement.textContent;
        const dateMatch = titleText.match(/Espionage report from (\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2})/);
        if (!dateMatch) return;

        const reportDateStr = dateMatch[1];
        const [datePart, timePart] = reportDateStr.split(' ');
        const [day, month, year] = datePart.split('.').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        const reportDate = new Date(year, month - 1, day, hours, minutes, seconds);

        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            // Check if first cell has arrow-divider before prov-pict
            const firstCell = row.querySelector('td:first-child');
            if (!firstCell) return;
            
            // Look for arrow-divider element
            const arrowDivider = firstCell.querySelector('.arrow-divider');
            if (!arrowDivider) return;
            
            // Verify it comes before prov-pict
            const provPict = firstCell.querySelector('.prov-pict');
            if (!provPict || !arrowDivider.compareDocumentPosition(provPict) & Node.DOCUMENT_POSITION_PRECEDING) {
                return;
            }

            const timeCell = row.querySelector('td.tcenter');
            if (!timeCell || !timeCell.textContent.match(/^\d{2}:\d{2}:\d{2}$/)) return;
            
            const timeParts = timeCell.textContent.split(':').map(Number);
            const durationMs = (timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2]) * 1000;
            const arrivalTime = new Date(reportDate.getTime() + durationMs);
            
            const formattedTime = arrivalTime.toTimeString().substring(0, 8);
            
            const arrivalCell = document.createElement('td');
            arrivalCell.className = 'tcenter';
            arrivalCell.style.color = '#ff0000';
            arrivalCell.style.fontWeight = 'bold';
            arrivalCell.textContent = formattedTime;
            
            timeCell.parentNode.insertBefore(arrivalCell, timeCell.nextSibling);
        });
    }

    getAllSpyReports() {
        const results = [];
        results.push(...this.findReportsInDocument(document));
        
        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                if (iframe.contentDocument) {
                    results.push(...this.findReportsInDocument(iframe.contentDocument));
                }
            } catch (e) {
                console.debug('Skipped cross-origin iframe:', e.message);
            }
        });
        
        return results;
    }

    findReportsInDocument(doc) {
        const reports = [];
        const visibleReports = Array.from(doc.querySelectorAll('[id^="messageboxspy-report-"], [id*="messageboxspy-report-"], [id^="messageboxlast-spy-report-"], [id*="messageboxlast-spy-report-"]'))
            .filter(report => this.isVisible(report));
        reports.push(...visibleReports);
        
        doc.querySelectorAll('*').forEach(element => {
            if (element.shadowRoot) {
                reports.push(...this.findReportsInDocument(element.shadowRoot));
            }
        });
        
        return reports;
    }

    isVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    }

    enhanceSpyReport(report) {
        if (report.querySelector('.spy-enhancement-panel')) return;
        
        try {
            this.addEnhancementPanel(report);
        } catch (error) {
            console.error(`Error enhancing report ${report.id}:`, error);
        }
        
        // Add espionage table processing
        try {
            this.processEspionageTable(report);
        } catch (error) {
            console.error(`Error processing espionage table in ${report.id}:`, error);
        }
    }

    addEnhancementPanel(reportElement) {
        const enhancementPanel = document.createElement('div');
        enhancementPanel.className = 'spy-enhancement-panel';
        enhancementPanel.dataset.enhanced = 'true';
        
        enhancementPanel.innerHTML = `
        <style>
            .spy-enhancement-panel {
                margin: 8px 0 !important;
                padding: 0 !important;
                position: relative !important;
                z-index: 1000 !important;
                display: block !important;
                width: 100% !important;
            }
            
            .spy-buttons-container {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 5px !important;
                margin: 0 !important;
                padding: 0 !important;
                justify-content: center !important;
                align-items: center !important;
            }
            
            .spy-btn {
                background: rgba(0, 0, 0, 0.1) !important;
                border: 1px solid rgba(0, 0, 0, 0.2) !important;
                padding: 4px 9px !important;
                margin: 0 !important;
                border-radius: 3px !important;
                cursor: pointer !important;
                font-size: 14px !important;
                font-weight: normal !important;
                color: rgb(73, 67, 52) !important;
                font-family: "Palatino Linotype", "Book Antiqua", Palatino, serif, Tahoma, Geneva, sans-serif !important;
                display: inline-block !important;
                text-align: center !important;
                line-height: normal !important;
                height: 30px !important;
                min-width: 75px !important;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
                transition: all 0.2s ease !important;
            }
            
            .spy-btn:hover {
                background: rgba(0, 0, 0, 0.15) !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
            }
            
            .spy-info {
                display: none !important;
                background: none !important;
                border: none !important;
                padding: 3px 0 !important;
                margin: 5px 0 0 0 !important;
                color: inherit !important;
                font-size: 12px !important;
                text-align: center !important;
            }
        </style>
               
        <div class="spy-info" id="info-${reportElement.id}">
            Results will appear here...
        </div>
    `;

        enhancementPanel.addEventListener('click', (event) => {
            if (event.target.classList.contains('spy-btn')) {
                const action = event.target.getAttribute('data-action');
                const reportId = event.target.getAttribute('data-report');
                event.stopPropagation();
                event.preventDefault();
                this.handleButtonClick(action, reportId);
            }
        });

        try {
            // Find the .centered element and insert after it
            const centeredElement = reportElement.querySelector('.centered');
            if (centeredElement) {
                centeredElement.insertAdjacentElement('afterend', enhancementPanel);
            } else {
                // Fallback if .centered isn't found
                reportElement.insertBefore(enhancementPanel, reportElement.firstChild);
            }
            console.log(`✅ Enhanced spy report: ${reportElement.id}`);
        } catch (error) {
            console.error(`Failed to insert panel into ${reportElement.id}:`, error);
            throw error;
        }
    }

    handleButtonClick(action, reportId) {
        try {
            console.log(`🎯 Action: ${action} for report: ${reportId}`);
            
            switch (action) {
                default:
                    console.warn(`Unknown action: ${action}`);
            }
        } catch (error) {
            console.error(`Error handling ${action} for ${reportId}:`, error);
            this.showError(reportId, `Error: ${error.message}`);
        }
    }

    showInfo(reportId, message) {
        const infoDiv = document.getElementById(`info-${reportId}`);
        if (infoDiv) {
            infoDiv.style.display = 'block';
            infoDiv.innerHTML = message;
        }
    }

    showError(reportId, message) {
        const infoDiv = document.getElementById(`info-${reportId}`);
        if (infoDiv) {
            infoDiv.style.display = 'block';
            infoDiv.innerHTML = `<span style="color: #e74c3c;">❌ ${message}</span>`;
        }
    }

    copyReportData(reportId) {
        const reportElement = document.getElementById(reportId);
        if (!reportElement) {
            this.showError(reportId, 'Report element not found');
            return;
        }

        const text = reportElement.textContent || reportElement.innerText || '';
        const data = `Spy Report ${reportId}\n${text}\n\nCopied: ${new Date().toLocaleString()}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(data).then(() => {
                this.showInfo(reportId, '📋 Report data copied to clipboard!');
                setTimeout(() => {
                    const infoDiv = document.getElementById(`info-${reportId}`);
                    if (infoDiv) infoDiv.style.display = 'none';
                }, 3000);
            }).catch(() => {
                this.showError(reportId, 'Failed to copy to clipboard');
            });
        } else {
            this.showError(reportId, 'Clipboard not available');
        }
    }

    schedule(reportId) {
        this.showInfo(reportId, `
            ⏱️ <strong>Re-spy reminder set!</strong><br>
            <small>Check back in 4-6 hours</small>
        `);
    }
    
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        console.log('🧹 Spy Report Enhancer cleaned up');
    }
}

// Safe initialization
let spyEnhancer = null;

function initializeSpyEnhancer() {
    if (spyEnhancer) {
        spyEnhancer.destroy();
    }
    spyEnhancer = new SpyReportEnhancer();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSpyEnhancer);
} else {
    initializeSpyEnhancer();
}

window.addEventListener('beforeunload', () => {
    if (spyEnhancer) {
        spyEnhancer.destroy();
    }
});

console.log('🚀 Spy Report Enhancer script loaded');